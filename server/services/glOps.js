const mongoose = require("mongoose");
const GlEntity = require("../models/GlEntity");
const GlVoucher = require("../models/GlVoucher");
const { fail, inRoles, actor, hist, toPaise, fromPaise, isDate, today, addDays, daysBetween, normDate, nextSeq, requireCsv, esc } = require("./glCommon");
const E = require("./glEntities");
const V = require("./glVouchers");
const R = require("./glReports");

const { col, MONEY, checkDate } = R;
const POSTED = V.POSTED;
const idOf = (u) => String(u._id || u.id);
const r2 = (n) => Math.round(n * 100) / 100;
const outstanding = (b) => r2((b.data.net || 0) - (b.data.settled || 0));

// ---------- generic maker-checker transitions ----------
async function claim(user, kind, id, from, to, action, note, extra = {}) {
  if (!inRoles(user, "checker")) throw fail("Your role is not permitted to authorise or reject records", 403);
  if (!mongoose.isValidObjectId(id)) throw fail("Invalid record id", 400);
  const a = actor(user);
  const doc = await GlEntity.findOneAndUpdate(
    { _id: id, kind, status: { $in: from }, createdBy: { $ne: a.id }, ...extra },
    { $set: { status: to, checkedBy: a.id, checkedByName: a.name }, $push: { history: hist(user, action, note) } },
    { new: true },
  );
  if (doc) return doc;
  const cur = await GlEntity.findOne({ _id: id, kind }).lean();
  if (!cur) throw fail("Record not found", 404);
  if (!from.includes(cur.status)) throw fail(`Record is "${cur.status}" and cannot be ${action.toLowerCase()}`, 409);
  if (String(cur.createdBy) === a.id) throw fail("The maker cannot authorise or reject their own record", 403);
  throw fail("Record cannot be processed in its current state", 409);
}

const requireReason = (reason) => {
  const r = typeof reason === "string" ? reason.trim() : "";
  if (!r) throw fail("A reason is required", 422, { reason: "Reason is required" });
  return r;
};

async function adjustSettled(billCode, delta, extraFilter = {}) {
  const f = { kind: "bill", code: billCode, ...extraFilter };
  if (delta > 0) f.$expr = { $gte: [{ $subtract: ["$data.net", "$data.settled"] }, delta - 0.001] };
  else f["data.settled"] = { $gte: -delta - 0.001 };
  return GlEntity.findOneAndUpdate(f, [{ $set: { "data.settled": { $round: [{ $add: ["$data.settled", delta] }, 2] } } }], { new: true });
}

async function entityAction(user, kind, id, action, body = {}) {
  if (kind === "bill") {
    if (action === "authorize") return E.pub(await claim(user, "bill", id, ["Pending Author"], "Authorised", "Authorised"));
    if (action === "reject") return E.pub(await claim(user, "bill", id, ["Pending Author"], "Rejected", "Rejected", requireReason(body.reason)));
    if (action === "request-cancel") {
      if (!inRoles(user, "maker")) throw fail("Your role is not permitted to request cancellation", 403);
      const reason = requireReason(body.reason);
      const bill = await GlEntity.findOne({ _id: id, kind: "bill" }).lean();
      if (!bill) throw fail("Bill not found", 404);
      if (await GlEntity.exists({ kind: "settle", "data.bill": bill.code, status: "Pending Author" })) throw fail("Bill has settlements awaiting authorisation", 409);
      const r = await GlEntity.findOneAndUpdate({ _id: id, kind: "bill", status: "Authorised", "data.settled": 0 }, { $set: { status: "Cancel Requested", "data.cancelRequestedBy": idOf(user), "data.cancelReason": reason }, $push: { history: hist(user, "Cancellation requested", reason) } }, { new: true });
      if (!r) throw fail(bill.status !== "Authorised" ? `A bill with status "${bill.status}" cannot be cancelled` : "A bill with settlements cannot be cancelled", 409);
      return E.pub(r);
    }
    if (action === "cancel-approve") return E.pub(await claim(user, "bill", id, ["Cancel Requested"], "Cancelled", "Cancellation approved", undefined, { "data.cancelRequestedBy": { $ne: idOf(user) }, "data.settled": 0 }));
    if (action === "cancel-reject") return E.pub(await claim(user, "bill", id, ["Cancel Requested"], "Authorised", "Cancellation rejected", requireReason(body.reason), { "data.cancelRequestedBy": { $ne: idOf(user) } }));
  }
  if (kind === "settle") {
    if (action === "authorize") {
      const s = await claim(user, "settle", id, ["Pending Author"], "Authorised", "Authorised");
      const upd = await adjustSettled(s.data.bill, s.data.amount, { status: "Authorised" });
      if (!upd) {
        await GlEntity.updateOne({ _id: s._id }, { $set: { status: "Pending Author" }, $unset: { checkedBy: 1, checkedByName: 1 }, $push: { history: hist(user, "Authorisation rolled back", "bill outstanding is lower than the amount or bill is not authorised") } });
        throw fail("Settlement exceeds the bill outstanding balance or the bill is not authorised", 409);
      }
      return E.pub(s);
    }
    if (action === "reject") return E.pub(await claim(user, "settle", id, ["Pending Author"], "Rejected", "Rejected", requireReason(body.reason)));
    if (action === "cheque-status") {
      if (!inRoles(user, "maker")) throw fail("Your role is not permitted to update cheque status", 403);
      const next = body.chequeStatus;
      if (!["Cleared", "Bounced", "Cancelled"].includes(next)) throw fail("Validation failed", 422, { chequeStatus: "Choose Cleared, Bounced or Cancelled" });
      const s = await GlEntity.findOneAndUpdate({ _id: id, kind: "settle", status: "Authorised", "data.mode": "Cheque", "data.chequeStatus": "Issued" }, { $set: { "data.chequeStatus": next }, $push: { history: hist(user, `Cheque ${next}`, body.note) } }, { new: true });
      if (!s) throw fail("Only authorised cheque settlements with status Issued can be updated", 409);
      if (next !== "Cleared") {
        const back = await adjustSettled(s.data.bill, -s.data.amount);
        if (!back) {
          await GlEntity.updateOne({ _id: s._id }, { $set: { "data.chequeStatus": "Issued" } });
          throw fail("Could not reverse the settlement on the bill", 409);
        }
      }
      return E.pub(s);
    }
  }
  if (kind === "knockoff") {
    if (action === "authorize") {
      const k = await claim(user, "knockoff", id, ["Pending Author"], "Authorised", "Authorised");
      const rollback = async (msg) => {
        await GlEntity.updateOne({ _id: k._id }, { $set: { status: "Pending Author" }, $unset: { checkedBy: 1, checkedByName: 1 }, $push: { history: hist(user, "Authorisation rolled back", msg) } });
        throw fail("Knock off exceeds an outstanding balance or a bill is not authorised", 409);
      };
      const p = await adjustSettled(k.data.payable, k.data.amount, { status: "Authorised" });
      if (!p) return rollback("payable");
      const r = await adjustSettled(k.data.receivable, k.data.amount, { status: "Authorised" });
      if (!r) { await adjustSettled(k.data.payable, -k.data.amount); return rollback("receivable"); }
      return E.pub(k);
    }
    if (action === "reject") return E.pub(await claim(user, "knockoff", id, ["Pending Author"], "Rejected", "Rejected", requireReason(body.reason)));
  }
  throw fail("Unsupported action", 400);
}

// ---------- fixed assets ----------
async function accumulated(assetCode) {
  const r = await GlEntity.aggregate([{ $match: { kind: "fadep", "data.asset": assetCode } }, { $group: { _id: null, t: { $sum: { $round: [{ $multiply: ["$data.amount", 100] }, 0] } } } }]);
  return r[0] ? r[0].t : 0;
}

function createHooks(kind, user) {
  if (kind === "faasset") {
    let voucherInput = null;
    return {
      async before(data, code, ctx) {
        if (!data.offsetLedger) return;
        const acct = await E.getRef(ctx, "faacct", data.account);
        voucherInput = { date: data.purchaseDate, type: "Journal", narration: `Fixed asset purchase ${code} - ${data.name}`, lines: [{ ledger: acct.data.assetLedger, debit: data.cost, credit: 0 }, { ledger: data.offsetLedger, debit: 0, credit: data.cost }] };
        await V.normalise(user, voucherInput, "general");
      },
      async after(doc) {
        if (!voucherInput) return;
        const v = await V.create(user, voucherInput, "general", { source: "fixed-asset" });
        await GlEntity.updateOne({ _id: doc._id }, { $set: { "data.voucherNo": v.voucherNo } });
        doc.data.voucherNo = v.voucherNo;
      },
    };
  }
  if (kind === "fatransfer") {
    return {
      async before(data, code, ctx) {
        const a = await E.getRef(ctx, "faasset", data.asset);
        if (a.data.location === data.toLocation) throw fail("Validation failed", 422, { toLocation: "Asset is already at this location" });
        data.fromLocation = a.data.location;
      },
      async after(doc) {
        const r = await GlEntity.findOneAndUpdate({ kind: "faasset", code: doc.data.asset, status: "Active", "data.location": doc.data.fromLocation }, { $set: { "data.location": doc.data.toLocation }, $push: { history: hist(user, "Transferred", `${doc.data.fromLocation} → ${doc.data.toLocation}`) } });
        if (!r) throw fail("Asset is not active or was moved by someone else", 409);
      },
    };
  }
  if (kind === "fasale") {
    return {
      async before(data, code, ctx) {
        const a = await E.getRef(ctx, "faasset", data.asset);
        const wdv = r2(a.data.cost - fromPaise(await accumulated(a.code)));
        data.wdv = wdv;
        data.gainLoss = r2(data.saleValue - wdv);
      },
      async after(doc) {
        const r = await GlEntity.findOneAndUpdate({ kind: "faasset", code: doc.data.asset, status: "Active" }, { $set: { status: "Sold" }, $push: { history: hist(user, "Sold", `${doc.code}: gain/(loss) ${doc.data.gainLoss}`) } });
        if (!r) throw fail("Asset is not active", 409);
      },
    };
  }
  return {};
}

async function runDepreciation(user, input) {
  if (!inRoles(user, "maker")) throw fail("Your role is not permitted to run depreciation", 403);
  const period = await GlEntity.findOne({ kind: "period", code: String(input?.period || "") }).lean();
  if (!period) throw fail("Validation failed", 422, { period: "Select an accounting period" });
  await V.periodFor(period.data.end);
  const assets = await GlEntity.find({ kind: "faasset", status: "Active", "data.purchaseDate": { $lte: period.data.end } }).lean();
  const blocks = Object.fromEntries((await GlEntity.find({ kind: "fablock" }).lean()).map((b) => [b.code, b]));
  const accts = Object.fromEntries((await GlEntity.find({ kind: "faacct" }).lean()).map((b) => [b.code, b]));
  const created = [], skipped = [];
  const byAcct = {};
  for (const a of assets) {
    const code = `DEP-${a.code}-${period.code}`;
    if (await GlEntity.exists({ kind: "fadep", code })) { skipped.push({ asset: a.code, reason: "Already processed for this period" }); continue; }
    const b = blocks[a.data.block];
    if (!b) { skipped.push({ asset: a.code, reason: "Block master missing" }); continue; }
    const accP = await accumulated(a.code);
    const costP = toPaise(a.data.cost), salvP = toPaise(a.data.salvage || 0);
    const rate = Number(b.data.rate) / 100 / 12;
    let dep = Math.round((b.data.method === "SLM" ? costP - salvP : costP - accP) * rate);
    dep = Math.max(0, Math.min(dep, costP - salvP - accP));
    if (dep <= 0) { skipped.push({ asset: a.code, reason: "Fully depreciated or zero depreciation" }); continue; }
    try {
      await GlEntity.create({ kind: "fadep", code, status: "Posted", data: { asset: a.code, period: period.code, amount: fromPaise(dep) }, createdBy: idOf(user), createdByName: user.name, history: [hist(user, "Depreciation computed")] });
    } catch (e) { if (e.code === 11000) { skipped.push({ asset: a.code, reason: "Already processed for this period" }); continue; } throw e; }
    created.push({ asset: a.code, code, amount: fromPaise(dep) });
    (byAcct[a.data.account] ||= []).push({ code, dep });
  }
  const vouchers = [], unposted = [];
  for (const [ac, items] of Object.entries(byAcct)) {
    const acct = accts[ac];
    const total = items.reduce((s, i) => s + i.dep, 0);
    if (!acct?.data.accDepLedger || !acct?.data.depExpLedger) { unposted.push(ac); continue; }
    try {
      const v = await V.create(user, { date: period.data.end, type: "Journal", narration: `Depreciation ${period.code} - ${ac}`, lines: [{ ledger: acct.data.depExpLedger, debit: fromPaise(total), credit: 0 }, { ledger: acct.data.accDepLedger, debit: 0, credit: fromPaise(total) }] }, "general", { source: "depreciation" });
      vouchers.push(v.voucherNo);
      await GlEntity.updateMany({ kind: "fadep", code: { $in: items.map((i) => i.code) } }, { $set: { "data.voucherNo": v.voucherNo } });
    } catch (e) {
      await GlEntity.deleteMany({ kind: "fadep", code: { $in: items.map((i) => i.code) } });
      for (const c of created.filter((c) => items.some((i) => i.code === c.code))) c.rolledBack = true;
      throw fail(`Depreciation voucher for account ${ac} failed: ${e.message}. No depreciation was recorded for that account.`, e.status || 422, e.errors);
    }
  }
  return { period: period.code, created: created.length, skipped, vouchers, unposted: unposted.length ? `Accounts without accumulated-depreciation/expense ledgers were recorded without vouchers: ${unposted.join(", ")}` : undefined };
}

// ---------- bank reconciliation ----------
async function bankLedger(code) {
  const l = await GlEntity.findOne({ kind: "ledger", code: String(code || "") }).lean();
  if (!l || !l.data.isBank) throw fail("Validation failed", 422, { bank: "Select a bank ledger" });
  return l;
}

function fingerprint(parts, occ) {
  return require("crypto").createHash("sha1").update(parts.join("|") + "#" + occ).digest("hex");
}

async function uploadRows(user, kind, bankCode, text) {
  if (!inRoles(user, "maker")) throw fail("Your role is not permitted to upload bank data", 403);
  await bankLedger(bankCode);
  const rows = requireCsv(text, kind === "bankstmt" ? ["date", "debit", "credit"] : ["date", "voucherRef", "debit", "credit"], 5000);
  const errors = [], parsed = [];
  const seen = {};
  for (const r of rows) {
    const date = normDate(r.get("date"));
    const dr = r.get("debit") === "" ? 0 : Number(r.get("debit")), cr = r.get("credit") === "" ? 0 : Number(r.get("credit"));
    const msgs = [];
    if (!date) msgs.push("invalid date");
    if (!Number.isFinite(dr) || !Number.isFinite(cr) || dr < 0 || cr < 0 || toPaise(dr) !== Math.round(dr * 100) || Math.abs(toPaise(dr) - dr * 100) > 1e-6 || Math.abs(toPaise(cr) - cr * 100) > 1e-6) msgs.push("invalid amount");
    else if ((dr > 0) === (cr > 0)) msgs.push("exactly one of debit/credit must be greater than zero");
    if (kind === "tallyentry" && !r.get("voucherRef")) msgs.push("voucherRef is required");
    if (msgs.length) { errors.push({ row: `line ${r.line}`, message: msgs.join("; ") }); continue; }
    const base = kind === "bankstmt" ? [bankCode, date, r.get("chequeNo"), dr, cr, r.get("description")] : [bankCode, date, r.get("voucherRef"), r.get("chequeNo"), dr, cr];
    const key = base.join("|");
    seen[key] = (seen[key] || 0) + 1;
    parsed.push({ date, dr, cr, r, fp: fingerprint(base, seen[key]) });
  }
  if (errors.length) throw fail("Upload rejected: no rows were imported", 422, errors);
  const existing = new Set((await GlEntity.find({ kind, "data.fingerprint": { $in: parsed.map((p) => p.fp) } }, { "data.fingerprint": 1 }).lean()).map((e) => e.data.fingerprint));
  const prefix = kind === "bankstmt" ? "BS" : "TL";
  let created = 0, skipped = 0;
  for (const p of parsed) {
    if (existing.has(p.fp)) { skipped++; continue; }
    const data = kind === "bankstmt"
      ? { bank: bankCode, date: p.date, description: p.r.get("description").slice(0, 200), chequeNo: p.r.get("chequeNo").slice(0, 30), debit: p.dr, credit: p.cr, fingerprint: p.fp }
      : { bank: bankCode, date: p.date, voucherRef: p.r.get("voucherRef").slice(0, 40), chequeNo: p.r.get("chequeNo").slice(0, 30), debit: p.dr, credit: p.cr, fingerprint: p.fp };
    await GlEntity.create({ kind, code: `${prefix}-${await nextSeq(prefix)}`, status: "Unmatched", data, createdBy: idOf(user), createdByName: user.name, history: [hist(user, "Uploaded")] });
    created++;
  }
  return { created, skipped };
}

async function bookEntries(bank, { to } = {}) {
  const match = { status: { $in: POSTED } };
  if (to) match.date = { $lte: to };
  const rows = await GlVoucher.aggregate([{ $match: match }, { $unwind: "$lines" }, { $match: { "lines.ledger": bank, "lines.recon": { $exists: false } } }, { $project: { _id: 0, voucherNo: 1, date: 1, chequeNo: 1, narration: 1, lineId: "$lines._id", debit: "$lines.debit", credit: "$lines.credit" } }, { $sort: { date: 1, voucherNo: 1 } }, { $limit: 5000 }]);
  return rows.map((r) => ({ ref: `${r.voucherNo}:${r.lineId}`, voucherNo: r.voucherNo, date: r.date, chequeNo: r.chequeNo, narration: r.narration, debit: r.debit, credit: r.credit }));
}

async function matchPair(user, stmtCode, source, ref) {
  if (!inRoles(user, "maker")) throw fail("Your role is not permitted to reconcile", 403);
  const stmt = await GlEntity.findOne({ kind: "bankstmt", code: String(stmtCode || "") }).lean();
  if (!stmt) throw fail("Bank statement line not found", 404);
  if (stmt.status !== "Unmatched") throw fail("Statement line is already matched", 409);
  const sd = toPaise(stmt.data.debit), sc = toPaise(stmt.data.credit);
  if (source === "book") {
    const [voucherNo, lineId] = String(ref || "").split(":");
    if (!voucherNo || !mongoose.isValidObjectId(lineId)) throw fail("Invalid book entry reference", 400);
    const v = await GlVoucher.findOne({ voucherNo, status: { $in: POSTED } }).lean();
    const ln = v?.lines.find((l) => String(l._id) === lineId);
    if (!ln || ln.ledger !== stmt.data.bank) throw fail("Book entry is not on the statement's bank ledger", 422);
    if (ln.recon) throw fail("Book entry is already reconciled", 409);
    if (!((sc > 0 && toPaise(ln.debit) === sc) || (sd > 0 && toPaise(ln.credit) === sd))) throw fail("Amounts or sides do not match (statement deposit ↔ book debit, withdrawal ↔ book credit)", 422);
    const s = await GlEntity.findOneAndUpdate({ _id: stmt._id, status: "Unmatched" }, { $set: { status: "Matched", "data.matchKind": "book", "data.matchRef": ref }, $push: { history: hist(user, "Matched to book", ref) } }, { new: true });
    if (!s) throw fail("Statement line was matched by someone else", 409);
    const res = await GlVoucher.updateOne({ voucherNo, status: { $in: POSTED } }, { $set: { "lines.$[l].recon": stmt.code } }, { arrayFilters: [{ "l._id": new mongoose.Types.ObjectId(lineId), "l.recon": { $exists: false } }] });
    if (!res.modifiedCount) {
      await GlEntity.updateOne({ _id: stmt._id }, { $set: { status: "Unmatched" }, $unset: { "data.matchKind": 1, "data.matchRef": 1 } });
      throw fail("Book entry was reconciled by someone else", 409);
    }
    return E.pub(s);
  }
  if (source === "tally") {
    const t = await GlEntity.findOne({ kind: "tallyentry", code: String(ref || "") }).lean();
    if (!t) throw fail("Tally entry not found", 404);
    if (t.data.bank !== stmt.data.bank) throw fail("Tally entry belongs to a different bank ledger", 422);
    if (t.status !== "Unmatched") throw fail("Tally entry is already matched", 409);
    if (!((sc > 0 && toPaise(t.data.debit) === sc) || (sd > 0 && toPaise(t.data.credit) === sd))) throw fail("Amounts or sides do not match", 422);
    const s = await GlEntity.findOneAndUpdate({ _id: stmt._id, status: "Unmatched" }, { $set: { status: "Matched", "data.matchKind": "tally", "data.matchRef": t.code }, $push: { history: hist(user, "Matched to tally", t.code) } }, { new: true });
    if (!s) throw fail("Statement line was matched by someone else", 409);
    const tt = await GlEntity.findOneAndUpdate({ _id: t._id, status: "Unmatched" }, { $set: { status: "Matched", "data.matchRef": stmt.code }, $push: { history: hist(user, "Matched to statement", stmt.code) } });
    if (!tt) {
      await GlEntity.updateOne({ _id: stmt._id }, { $set: { status: "Unmatched" }, $unset: { "data.matchKind": 1, "data.matchRef": 1 } });
      throw fail("Tally entry was matched by someone else", 409);
    }
    return E.pub(s);
  }
  throw fail("Source must be book or tally", 400);
}

async function unmatch(user, stmtCode) {
  if (!inRoles(user, "maker")) throw fail("Your role is not permitted to reconcile", 403);
  const stmt = await GlEntity.findOneAndUpdate({ kind: "bankstmt", code: String(stmtCode || ""), status: "Matched" }, { $set: { status: "Unmatched" }, $push: { history: hist(user, "Unmatched", "was " + "matched") } });
  if (!stmt) throw fail("Statement line is not matched", 409);
  if (stmt.data.matchKind === "book") {
    const [voucherNo] = String(stmt.data.matchRef).split(":");
    await GlVoucher.updateOne({ voucherNo }, { $unset: { "lines.$[l].recon": 1 } }, { arrayFilters: [{ "l.recon": stmt.code }] });
  } else if (stmt.data.matchKind === "tally") {
    await GlEntity.updateOne({ kind: "tallyentry", code: stmt.data.matchRef }, { $set: { status: "Unmatched" }, $unset: { "data.matchRef": 1 } });
  }
  await GlEntity.updateOne({ _id: stmt._id }, { $unset: { "data.matchKind": 1, "data.matchRef": 1 } });
  return { code: stmt.code, status: "Unmatched" };
}

async function autoReconcile(user, input) {
  if (!inRoles(user, "maker")) throw fail("Your role is not permitted to reconcile", 403);
  await bankLedger(input?.bank);
  const tol = input.toleranceDays === undefined || input.toleranceDays === "" ? 3 : Number(input.toleranceDays);
  if (!Number.isInteger(tol) || tol < 0 || tol > 15) throw fail("Validation failed", 422, { toleranceDays: "Tolerance must be a whole number between 0 and 15 days" });
  const stmts = await GlEntity.find({ kind: "bankstmt", status: "Unmatched", "data.bank": input.bank }).sort({ "data.date": 1, code: 1 }).lean();
  const book = await bookEntries(input.bank);
  const used = new Set();
  let matched = 0, ambiguous = 0, none = 0;
  for (const s of stmts) {
    const sd = toPaise(s.data.debit), sc = toPaise(s.data.credit);
    const cands = book.filter((b) => !used.has(b.ref) && ((sc > 0 && toPaise(b.debit) === sc) || (sd > 0 && toPaise(b.credit) === sd)));
    let pick = s.data.chequeNo ? cands.filter((b) => b.chequeNo && b.chequeNo === s.data.chequeNo) : [];
    if (!pick.length) pick = cands.filter((b) => Math.abs(daysBetween(b.date, s.data.date)) <= tol);
    if (pick.length === 1) {
      try { await matchPair(user, s.code, "book", pick[0].ref); used.add(pick[0].ref); matched++; } catch { none++; }
    } else if (pick.length > 1) ambiguous++;
    else none++;
  }
  return { considered: stmts.length, matched, ambiguous, unmatched: none, toleranceDays: tol };
}

async function reconUpload(user, input) {
  if (!inRoles(user, "maker")) throw fail("Your role is not permitted to reconcile", 403);
  const rows = requireCsv(input?.text, ["statement", "reference"], 2000);
  const plan = [], errors = [], usedRefs = new Set();
  for (const r of rows) {
    const code = r.get("statement"), ref = r.get("reference"), source = (r.get("source") || "book").toLowerCase();
    try {
      const stmt = await GlEntity.findOne({ kind: "bankstmt", code }).lean();
      if (!stmt) throw new Error("statement line not found");
      if (stmt.status !== "Unmatched") throw new Error("statement line already matched");
      let resolved;
      if (source === "book") {
        const [vn, lineId] = ref.split(":");
        const v = await GlVoucher.findOne({ voucherNo: vn, status: { $in: POSTED } }).lean();
        if (!v) throw new Error("voucher not found or not posted");
        const sd = toPaise(stmt.data.debit), sc = toPaise(stmt.data.credit);
        const c = v.lines.filter((l) => l.ledger === stmt.data.bank && !l.recon && (lineId ? String(l._id) === lineId : (sc > 0 && toPaise(l.debit) === sc) || (sd > 0 && toPaise(l.credit) === sd)));
        if (c.length !== 1) throw new Error(c.length ? "voucher has several matching lines; use VOUCHER:lineId" : "no unreconciled matching bank line in voucher");
        resolved = `${vn}:${c[0]._id}`;
      } else if (source === "tally") {
        const t = await GlEntity.findOne({ kind: "tallyentry", $or: [{ code: ref }, { "data.voucherRef": ref }], status: "Unmatched", "data.bank": stmt.data.bank }).lean();
        if (!t) throw new Error("unmatched tally entry not found");
        resolved = t.code;
      } else throw new Error("source must be book or tally");
      if (usedRefs.has(`${source}:${resolved}`)) throw new Error("reference used twice in the file");
      usedRefs.add(`${source}:${resolved}`);
      plan.push({ code, source, ref: resolved, line: r.line });
    } catch (e) { errors.push({ row: `line ${r.line}`, message: e.message }); }
  }
  if (errors.length) throw fail("Upload rejected: nothing was reconciled", 422, errors);
  const failed = [];
  let matched = 0;
  for (const p of plan) {
    try { await matchPair(user, p.code, p.source, p.ref); matched++; } catch (e) { failed.push({ row: `line ${p.line}`, message: e.message }); }
  }
  return { matched, failed };
}

// ---------- reports: AP/AR, fixed assets, bank ----------
const items = async (kind, filter = {}, sort = { code: 1 }) => GlEntity.find({ kind, ...filter }).sort(sort).limit(10000).lean();

async function billsReport(q) {
  checkDate(q.from, "From date"); checkDate(q.to, "To date");
  const f = {};
  if (q.type) f["data.type"] = String(q.type);
  if (q.party) f["data.party"] = String(q.party);
  if (q.status) f.status = String(q.status);
  if (q.from || q.to) { f["data.billDate"] = {}; if (q.from) f["data.billDate"].$gte = q.from; if (q.to) f["data.billDate"].$lte = q.to; }
  const bills = await items("bill", f, { "data.billDate": 1, code: 1 });
  const rows = bills.map((b) => ({ code: b.code, type: b.data.type, party: b.data.party, billNo: b.data.billNo, billDate: b.data.billDate, dueDate: b.data.dueDate, amount: b.data.amount, tds: b.data.tdsAmount, net: b.data.net, settled: b.data.settled, outstanding: outstanding(b), status: b.status }));
  return { title: "Bills Receivable / Payable", columns: [col("code", "Ref"), col("type", "Type"), col("party", "Party"), col("billNo", "Bill No"), col("billDate", "Bill Date"), col("dueDate", "Due"), col("amount", "Gross", MONEY), col("tds", "TDS", MONEY), col("net", "Net", MONEY), col("settled", "Settled", MONEY), col("outstanding", "Outstanding", MONEY), col("status", "Status")], rows };
}

async function ageing(q) {
  checkDate(q.asOf, "As-of date");
  const asOf = q.asOf || today();
  const f = { status: "Authorised" };
  if (q.type) f["data.type"] = String(q.type);
  const bills = (await items("bill", f)).filter((b) => b.data.billDate <= asOf);
  const by = {};
  for (const b of bills) {
    const out = outstanding(b);
    if (out <= 0) continue;
    const d = daysBetween(b.data.dueDate, asOf);
    const key = `${b.data.type}|${b.data.party}`;
    const row = (by[key] ||= { type: b.data.type, party: b.data.party, notDue: 0, d30: 0, d60: 0, d90: 0, d90p: 0, total: 0 });
    row[d <= 0 ? "notDue" : d <= 30 ? "d30" : d <= 60 ? "d60" : d <= 90 ? "d90" : "d90p"] += out;
    row.total += out;
  }
  const rows = Object.values(by).map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === "number" ? r2(v) : v])));
  const totals = rows.reduce((t, r) => { for (const k of ["notDue", "d30", "d60", "d90", "d90p", "total"]) t[k] = r2((t[k] || 0) + r[k]); return t; }, { party: "Total" });
  return { title: "Ageing Report", columns: [col("type", "Type"), col("party", "Party"), col("notDue", "Not Due", MONEY), col("d30", "1-30 days", MONEY), col("d60", "31-60 days", MONEY), col("d90", "61-90 days", MONEY), col("d90p", "Over 90 days", MONEY), col("total", "Total", MONEY)], rows, totals, notes: [`Outstanding authorised bills as of ${asOf}, aged from due date.`] };
}

async function partyDetails(q) {
  const parties = await items("party", q.party ? { code: String(q.party) } : {});
  const bills = await items("bill", { status: { $in: ["Authorised", "Cancel Requested"] } });
  const rows = parties.map((p) => {
    const mine = bills.filter((b) => b.data.party === p.code);
    const sum = (t, fn) => r2(mine.filter((b) => b.data.type === t).reduce((s, b) => s + fn(b), 0));
    return { code: p.code, name: p.data.name, type: p.data.type, phone: p.data.phone, pan: p.data.pan, payable: sum("Payable", outstanding), receivable: sum("Receivable", outstanding), bills: mine.length, status: p.status };
  });
  return { title: "Party Details", columns: [col("code", "Party"), col("name", "Name"), col("type", "Type"), col("phone", "Phone"), col("pan", "PAN"), col("bills", "Open Bills"), col("payable", "Payable Outstanding", MONEY), col("receivable", "Receivable Outstanding", MONEY), col("status", "Status")], rows };
}

async function partyExpense(q) {
  checkDate(q.from, "From date"); checkDate(q.to, "To date");
  const f = { "data.type": "Payable", status: { $in: ["Authorised", "Cancel Requested"] } };
  if (q.from || q.to) { f["data.billDate"] = {}; if (q.from) f["data.billDate"].$gte = q.from; if (q.to) f["data.billDate"].$lte = q.to; }
  const bills = await items("bill", f);
  const by = {};
  for (const b of bills) {
    const r = (by[b.data.party] ||= { party: b.data.party, bills: 0, gross: 0, tds: 0, net: 0, paid: 0 });
    r.bills++; r.gross += b.data.amount; r.tds += b.data.tdsAmount; r.net += b.data.net; r.paid += b.data.settled || 0;
  }
  const rows = Object.values(by).map((r) => ({ ...r, gross: r2(r.gross), tds: r2(r.tds), net: r2(r.net), paid: r2(r.paid) }));
  return { title: "Party Wise Expense Report", columns: [col("party", "Party"), col("bills", "Bills"), col("gross", "Gross", MONEY), col("tds", "TDS", MONEY), col("net", "Net", MONEY), col("paid", "Paid", MONEY)], rows };
}

async function faDep(q) {
  const f = {};
  if (q.asset) f["data.asset"] = String(q.asset);
  if (q.period) f["data.period"] = String(q.period);
  const d = await items("fadep", f, { "data.period": 1, "data.asset": 1 });
  return { title: "Depreciation Detail", columns: [col("asset", "Asset"), col("period", "Period"), col("amount", "Depreciation", MONEY), col("voucherNo", "Voucher")], rows: d.map((x) => ({ ...x.data })), totals: { asset: "Total", amount: r2(d.reduce((s, x) => s + x.data.amount, 0)) } };
}
async function faRegister() {
  const assets = await items("faasset");
  const rows = [];
  for (const a of assets) {
    const acc = fromPaise(await accumulated(a.code));
    rows.push({ code: a.code, name: a.data.name, category: a.data.category, block: a.data.block, location: a.data.location, purchaseDate: a.data.purchaseDate, cost: a.data.cost, accumulated: acc, wdv: r2(a.data.cost - acc), status: a.status });
  }
  return { title: "Asset Register", columns: [col("code", "Asset"), col("name", "Name"), col("category", "Category"), col("block", "Block"), col("location", "Location"), col("purchaseDate", "Purchased"), col("cost", "Cost", MONEY), col("accumulated", "Accumulated Dep.", MONEY), col("wdv", "WDV", MONEY), col("status", "Status")], rows };
}
async function faDisposal() {
  const sales = await items("fasale", {}, { "data.date": 1 });
  const assets = Object.fromEntries((await items("faasset")).map((a) => [a.code, a]));
  return { title: "Sale / Disposal with Gain / Loss", columns: [col("code", "Sale"), col("asset", "Asset"), col("name", "Name"), col("date", "Date"), col("cost", "Cost", MONEY), col("wdv", "WDV", MONEY), col("saleValue", "Sale Value", MONEY), col("gainLoss", "Gain / (Loss)", MONEY)], rows: sales.map((s) => ({ code: s.code, ...s.data, name: assets[s.data.asset]?.data.name, cost: assets[s.data.asset]?.data.cost })), totals: { asset: "Total", gainLoss: r2(sales.reduce((t, s) => t + s.data.gainLoss, 0)) } };
}
async function faMovement(q) {
  checkDate(q.from, "From date"); checkDate(q.to, "To date");
  const [assets, tr, sales, dep, periods] = await Promise.all([items("faasset"), items("fatransfer"), items("fasale"), items("fadep"), items("period")]);
  const pEnd = Object.fromEntries(periods.map((p) => [p.code, p.data.end]));
  let rows = [
    ...assets.map((a) => ({ date: a.data.purchaseDate, asset: a.code, event: "Purchase", detail: a.data.location, amount: a.data.cost })),
    ...tr.map((t) => ({ date: t.data.date, asset: t.data.asset, event: "Transfer", detail: `${t.data.fromLocation} → ${t.data.toLocation}`, amount: 0 })),
    ...sales.map((s) => ({ date: s.data.date, asset: s.data.asset, event: "Sale", detail: `Gain/(Loss) ${s.data.gainLoss}`, amount: s.data.saleValue })),
    ...dep.map((d) => ({ date: pEnd[d.data.period] || "", asset: d.data.asset, event: "Depreciation", detail: d.data.period, amount: d.data.amount })),
  ];
  if (q.asset) rows = rows.filter((r) => r.asset === q.asset);
  if (q.from) rows = rows.filter((r) => r.date >= q.from);
  if (q.to) rows = rows.filter((r) => r.date <= q.to);
  rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { title: "Asset Movement Report", columns: [col("date", "Date"), col("asset", "Asset"), col("event", "Event"), col("detail", "Detail"), col("amount", "Amount", MONEY)], rows };
}

async function bankStmtRows(q) {
  checkDate(q.from, "From date"); checkDate(q.to, "To date");
  const f = {};
  if (q.bank) f["data.bank"] = String(q.bank);
  if (q.status) f.status = String(q.status);
  if (q.from || q.to) { f["data.date"] = {}; if (q.from) f["data.date"].$gte = q.from; if (q.to) f["data.date"].$lte = q.to; }
  if (q.chequeNo) f["data.chequeNo"] = new RegExp(esc(String(q.chequeNo).slice(0, 30)), "i");
  return items("bankstmt", f, { "data.date": 1, code: 1 });
}
const stmtColumns = [col("code", "Ref"), col("bank", "Bank"), col("date", "Date"), col("description", "Description"), col("chequeNo", "Cheque/Ref"), col("debit", "Withdrawal", MONEY), col("credit", "Deposit", MONEY), col("status", "Status"), col("matchRef", "Matched To")];
async function bankStmt(q) {
  const s = await bankStmtRows(q);
  return { title: "Bank Statement", columns: stmtColumns, rows: s.map((x) => ({ code: x.code, ...x.data, status: x.status })), totals: { description: "Total", debit: r2(s.reduce((t, x) => t + x.data.debit, 0)), credit: r2(s.reduce((t, x) => t + x.data.credit, 0)) } };
}
async function stmtReport(q) {
  const s = await bankStmtRows(q);
  const by = {};
  for (const x of s) {
    const r = (by[x.data.date] ||= { date: x.data.date, lines: 0, debit: 0, credit: 0, matched: 0, unmatched: 0 });
    r.lines++; r.debit += x.data.debit; r.credit += x.data.credit; r[x.status === "Matched" ? "matched" : "unmatched"]++;
  }
  return { title: "Bank Statement Report (day-wise)", columns: [col("date", "Date"), col("lines", "Lines"), col("debit", "Withdrawals", MONEY), col("credit", "Deposits", MONEY), col("matched", "Matched"), col("unmatched", "Unmatched")], rows: Object.values(by).map((r) => ({ ...r, debit: r2(r.debit), credit: r2(r.credit) })) };
}
async function bankRecon() {
  const banks = await items("ledger", { "data.isBank": true });
  const rows = [];
  for (const b of banks) {
    const s = await items("bankstmt", { "data.bank": b.code });
    const un = s.filter((x) => x.status === "Unmatched");
    const book = await bookEntries(b.code);
    rows.push({ bank: b.code, name: b.data.name, lines: s.length, matched: s.length - un.length, unmatched: un.length, percent: s.length ? Math.round(((s.length - un.length) / s.length) * 100) : 0, unDeposits: r2(un.reduce((t, x) => t + x.data.credit, 0)), unWithdrawals: r2(un.reduce((t, x) => t + x.data.debit, 0)), bookUnreconciled: book.length });
  }
  return { title: "Bank Reconciliation", columns: [col("bank", "Bank"), col("name", "Name"), col("lines", "Statement Lines"), col("matched", "Matched"), col("unmatched", "Unmatched"), col("percent", "% Reconciled"), col("unDeposits", "Unmatched Deposits", MONEY), col("unWithdrawals", "Unmatched Withdrawals", MONEY), col("bookUnreconciled", "Unreconciled Book Entries")], rows };
}
async function brs(q) {
  const l = await bankLedger(q.bank);
  checkDate(q.asOf, "As-of date");
  const asOf = q.asOf || today();
  const { out } = await R.closingBalances(asOf);
  const book = out[l.code].balance;
  const bookEnt = await bookEntries(l.code, { to: asOf });
  const un = (await items("bankstmt", { "data.bank": l.code, status: "Unmatched", "data.date": { $lte: asOf } }));
  const bookDr = bookEnt.reduce((t, b) => t + toPaise(b.debit), 0), bookCr = bookEnt.reduce((t, b) => t + toPaise(b.credit), 0);
  const stCr = un.reduce((t, x) => t + toPaise(x.data.credit), 0), stDr = un.reduce((t, x) => t + toPaise(x.data.debit), 0);
  const derived = book - bookDr + bookCr + stCr - stDr;
  const rows = [
    { item: "Balance as per books (Dr +ve)", amount: fromPaise(book), kind: "head" },
    { item: "Less: book receipts not yet in bank (deposits in transit)", amount: -fromPaise(bookDr) },
    { item: "Add: book payments not yet in bank (uncleared cheques)", amount: fromPaise(bookCr) },
    { item: "Add: bank deposits not yet in books", amount: fromPaise(stCr) },
    { item: "Less: bank withdrawals not yet in books", amount: -fromPaise(stDr) },
    { item: "Derived balance as per bank statement", amount: fromPaise(derived), kind: "total" },
  ];
  const notes = [`As of ${asOf}. Opening-balance items are not reconciled individually.`];
  const summary = { bookBalance: fromPaise(book), derivedBankBalance: fromPaise(derived) };
  if (q.stmtBalance !== undefined && q.stmtBalance !== "") {
    const sb = Number(q.stmtBalance);
    if (!Number.isFinite(sb)) throw fail("Statement balance must be a number", 400);
    rows.push({ item: "Closing balance per bank statement (entered)", amount: sb }, { item: "Unexplained difference", amount: r2(sb - fromPaise(derived)), kind: "total" });
    summary.difference = r2(sb - fromPaise(derived));
  }
  return { title: `Bank Reconciliation Statement — ${l.code}`, columns: [col("item", "Particulars"), col("amount", "Amount", MONEY)], rows, summary, notes };
}

const registry = { bills: billsReport, ageing, partydetails: partyDetails, partyexpense: partyExpense, fadep: faDep, faregister: faRegister, fadisposal: faDisposal, famovement: faMovement, bankstmt: bankStmt, stmtreport: stmtReport, bankrecon: bankRecon, brs };

async function reconLists(q) {
  const bank = await bankLedger(q.bank);
  const stmts = await items("bankstmt", { "data.bank": bank.code, status: "Unmatched" }, { "data.date": 1, code: 1 });
  const source = q.source === "tally" ? "tally" : "book";
  const other = source === "tally" ? (await items("tallyentry", { "data.bank": bank.code, status: "Unmatched" }, { "data.date": 1, code: 1 })).map((t) => ({ ref: t.code, date: t.data.date, voucherNo: t.data.voucherRef, chequeNo: t.data.chequeNo, narration: "", debit: t.data.debit, credit: t.data.credit })) : await bookEntries(bank.code);
  return { statements: stmts.map(E.pub), entries: other };
}

// RCM invoice bulk upload: creates Pending Author bills flagged rcm=true. All-or-nothing; rows created so far are removed on failure.
async function uploadRcmBills(user, text) {
  const rows = requireCsv(text, ["billNo", "party", "head", "billDate", "dueDate", "amount"], 500);
  const made = [];
  const errors = [];
  for (const r of rows) {
    try {
      const doc = await E.create(user, "bill", { type: r.get("type") || "Payable", billNo: r.get("billNo"), party: r.get("party"), head: r.get("head"), billDate: normDate(r.get("billDate")) || r.get("billDate"), dueDate: normDate(r.get("dueDate")) || r.get("dueDate"), amount: r.get("amount"), rcm: true, remarks: r.get("remarks") }, createHooks("bill", user));
      made.push(doc.id);
    } catch (e) {
      if (e.status === 403) throw e;
      errors.push({ row: r.line, message: e.errors ? Object.values(e.errors).join("; ") : e.message });
    }
  }
  if (errors.length) {
    if (made.length) await GlEntity.deleteMany({ _id: { $in: made }, kind: "bill", status: "Pending Author" });
    throw fail("Upload rejected: no bills were imported", 422, errors);
  }
  return { created: made.length };
}

module.exports = { uploadRcmBills, entityAction, createHooks, runDepreciation, uploadRows, matchPair, unmatch, autoReconcile, reconUpload, registry, reconLists, bookEntries };
