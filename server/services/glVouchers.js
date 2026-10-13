const GlEntity = require("../models/GlEntity");
const GlVoucher = require("../models/GlVoucher");
const { fail, inRoles, actor, hist, toPaise, fromPaise, isMoney, isDate, nextSeq, esc, toCsv, today, requireCsv, normDate } = require("./glCommon");
const E = require("./glEntities");

const POSTED = ["Approved", "Reversed"];
const VTYPES = ["Journal", "Payment", "Receipt", "Contra", "Adjustment"];
const idOf = (u) => String(u._id || u.id);

const pub = (v) => ({ id: String(v._id), voucherNo: v.voucherNo, mode: v.mode, type: v.type, date: v.date, year: v.year, period: v.period, narration: v.narration, chequeNo: v.chequeNo, total: v.total, status: v.status, isClosing: !!v.isClosing, reversalOf: v.reversalOf, reversedBy: v.reversedBy, source: v.source, createdBy: String(v.createdBy), createdByName: v.createdByName, checkedByName: v.checkedByName, lines: (v.lines || []).map((l) => ({ id: String(l._id), ledger: l.ledger, subLedger: l.subLedger, costCentre: l.costCentre, debit: l.debit, credit: l.credit, narration: l.narration, recon: l.recon })), history: v.history, createdAt: v.createdAt, updatedAt: v.updatedAt });

async function periodFor(date) {
  const period = await GlEntity.findOne({ kind: "period", "data.start": { $lte: date }, "data.end": { $gte: date } }).lean();
  if (!period) throw fail("Validation failed", 422, { date: "No accounting period exists for this date" });
  const year = await GlEntity.findOne({ kind: "year", code: period.data.year }).lean();
  if (period.status !== "Open") throw fail("Validation failed", 422, { date: `Accounting period ${period.code} is closed` });
  if (!year || year.status !== "Open") throw fail("Validation failed", 422, { date: `Accounting year ${period.data.year} is closed` });
  return { period: period.code, year: year.code };
}

// Validates and normalises voucher input; never trusts totals from the client.
async function normalise(user, input, mode, { skipPeriod = false, forApproval = false } = {}) {
  const errors = {};
  if (!input || typeof input !== "object") throw fail("Invalid request body", 400);
  const date = input.date;
  if (!isDate(date)) errors.date = "A valid voucher date is required";
  const type = input.type || "Journal";
  if (!VTYPES.includes(type)) errors.type = "Invalid voucher type";
  const narration = typeof input.narration === "string" ? input.narration.trim() : "";
  if (narration.length > 300) errors.narration = "Narration must be at most 300 characters";
  if (!narration) errors.narration = "Narration is required";
  const chequeNo = typeof input.chequeNo === "string" ? input.chequeNo.trim() : "";
  if (chequeNo.length > 30) errors.chequeNo = "Cheque number must be at most 30 characters";
  if (!Array.isArray(input.lines) || input.lines.length < 2) throw fail("Validation failed", 422, { ...errors, lines: "At least two lines are required" });
  if (input.lines.length > 200) throw fail("Validation failed", 422, { ...errors, lines: "Too many lines" });
  const ledgers = {};
  const lines = [];
  let dr = 0, cr = 0;
  const lineErrors = [];
  for (let i = 0; i < input.lines.length; i++) {
    const l = input.lines[i] || {};
    const err = [];
    const ledger = typeof l.ledger === "string" ? l.ledger : "";
    if (!ledger) err.push("Ledger is required");
    else {
      if (!(ledger in ledgers)) ledgers[ledger] = await GlEntity.findOne({ kind: "ledger", code: ledger }).lean();
      const doc = ledgers[ledger];
      if (!doc) err.push(`Ledger ${ledger} does not exist`);
      else {
        if (doc.status !== "Active") err.push(`Ledger ${ledger} is inactive`);
        if (mode === "limited" && !doc.data.limited) err.push(`Ledger ${ledger} is not enabled for limited-ledger vouchers`);
        const roles = doc.data.restrictedRoles || [];
        if (roles.length && !roles.includes(user.role)) throw fail(`Your role may not post to ledger ${ledger}`, 403);
      }
    }
    const d = l.debit === "" || l.debit == null ? 0 : l.debit;
    const c = l.credit === "" || l.credit == null ? 0 : l.credit;
    if (!isMoney(d) || !isMoney(c) || Number(d) < 0 || Number(c) < 0) err.push("Amounts must be non-negative numbers with at most 2 decimals");
    else if ((Number(d) > 0) === (Number(c) > 0)) err.push("Enter either a debit or a credit amount, not both or neither");
    else if (Number(d) > 99999999999 || Number(c) > 99999999999) err.push("Amount is too large");
    if (l.subLedger) {
      const s = await GlEntity.findOne({ kind: "subledger", code: String(l.subLedger) }).lean();
      if (!s || s.data.ledger !== ledger || s.status !== "Active") err.push("Sub ledger is invalid for this ledger");
    }
    if (l.costCentre) {
      const c2 = await GlEntity.findOne({ kind: "costcentre", code: String(l.costCentre) }).lean();
      if (!c2 || c2.status !== "Active") err.push("Cost centre is invalid or inactive");
    }
    lineErrors.push(err);
    if (!err.length) {
      dr += toPaise(d); cr += toPaise(c);
      lines.push({ ledger, subLedger: l.subLedger || undefined, costCentre: l.costCentre || undefined, debit: Number(d), credit: Number(c), narration: typeof l.narration === "string" ? l.narration.slice(0, 200) : undefined });
    }
  }
  if (lineErrors.some((e) => e.length)) errors.lines = lineErrors.map((e, i) => (e.length ? `Line ${i + 1}: ${e.join("; ")}` : null)).filter(Boolean).join(" | ");
  if (!errors.lines && dr !== cr) errors.balance = `Debit (${fromPaise(dr).toFixed(2)}) must equal credit (${fromPaise(cr).toFixed(2)})`;
  if (!errors.lines && dr === 0) errors.balance = "Voucher total must be greater than zero";
  if (Object.keys(errors).length) throw fail("Validation failed", 422, errors);
  const scope = skipPeriod ? { period: "", year: "" } : await periodFor(date);
  return { date, type, narration, chequeNo: chequeNo || undefined, lines, total: fromPaise(dr), ...scope };
}

async function create(user, input, mode = "general", extra = {}) {
  if (!inRoles(user, "maker")) throw fail("Your role is not permitted to create vouchers", 403);
  const n = await normalise(user, input, mode);
  const prefix = mode === "limited" ? "LV" : "JV";
  const a = actor(user);
  const doc = await GlVoucher.create({ ...n, mode, voucherNo: `${prefix}-${await nextSeq(prefix)}`, status: "Pending", createdBy: a.id, createdByName: a.name, source: extra.source, history: [hist(user, "Created")] });
  return pub(doc);
}

async function createManyAtomic(user, items, mode) {
  if (!inRoles(user, "maker")) throw fail("Your role is not permitted to create vouchers", 403);
  const normalised = [], errors = [];
  for (const it of items) {
    try { normalised.push(await normalise(user, it.input, mode)); } catch (e) { errors.push({ row: it.ref, message: e.errors ? Object.values(e.errors).join("; ") : e.message }); }
  }
  if (errors.length) throw fail("Upload rejected: no vouchers were created", 422, errors);
  const out = [];
  for (const n of normalised) out.push(await create(user, { ...n }, mode, { source: "upload" }));
  return out;
}

async function uploadCsv(user, text, mode = "general") {
  const rows = requireCsv(text, ["voucherRef", "date", "ledger", "debit", "credit"], 2000);
  const groups = new Map();
  for (const r of rows) {
    const ref = r.get("voucherRef");
    if (!ref) { groups.set(`line-${r.line}`, { ref: `line ${r.line}`, input: { lines: [] }, bad: "voucherRef is required" }); continue; }
    if (!groups.has(ref)) groups.set(ref, { ref, input: { date: normDate(r.get("date")) || r.get("date"), type: r.get("type") || "Journal", narration: r.get("narration"), chequeNo: r.get("chequeNo"), lines: [] } });
    groups.get(ref).input.lines.push({ ledger: r.get("ledger"), debit: r.get("debit"), credit: r.get("credit"), costCentre: r.get("costCentre"), narration: r.get("lineNarration") });
  }
  const bad = [...groups.values()].filter((g) => g.bad).map((g) => ({ row: g.ref, message: g.bad }));
  if (bad.length) throw fail("Upload rejected: no vouchers were created", 422, bad);
  const created = await createManyAtomic(user, [...groups.values()], mode);
  return { created: created.length, vouchers: created.map((v) => v.voucherNo) };
}

async function update(user, voucherNo, input) {
  const v = await GlVoucher.findOne({ voucherNo });
  if (!v) throw fail("Voucher not found", 404);
  if (v.createdBy.toString() !== idOf(user)) throw fail("Only the maker can edit this voucher", 403);
  if (!["Pending", "Rejected"].includes(v.status)) throw fail(`A ${v.status} voucher cannot be edited`, 409);
  if (v.reversalOf || v.isClosing) throw fail("System generated vouchers cannot be edited", 409);
  const n = await normalise(user, input, v.mode);
  const res = await GlVoucher.findOneAndUpdate({ _id: v._id, status: v.status }, { $set: { ...n, status: "Pending" }, $push: { history: hist(user, "Edited") } }, { new: true });
  if (!res) throw fail("Voucher changed while editing; reload and retry", 409);
  return pub(res);
}

async function diagnose(voucherNo, wanted) {
  const v = await GlVoucher.findOne({ voucherNo }).lean();
  if (!v) return fail("Voucher not found", 404);
  if (v.status !== "Pending") return fail(`Voucher is already ${v.status}`, 409);
  return fail(wanted, 403);
}

async function checkerLedgerAccess(user, v) {
  for (const code of new Set(v.lines.map((l) => l.ledger))) {
    const l = await GlEntity.findOne({ kind: "ledger", code }).lean();
    const roles = l?.data.restrictedRoles || [];
    if (roles.length && !roles.includes(user.role)) throw fail(`Your role may not approve entries on restricted ledger ${code}`, 403);
  }
}

async function approve(user, voucherNo) {
  if (!inRoles(user, "checker")) throw fail("Your role is not permitted to approve vouchers", 403);
  const existing = await GlVoucher.findOne({ voucherNo });
  if (!existing) throw fail("Voucher not found", 404);
  if (existing.status === "Pending") await checkerLedgerAccess(user, existing);
  if (existing.status === "Pending") await periodFor(existing.date); // period or year may have been closed since creation
  const a = actor(user);
  const v = await GlVoucher.findOneAndUpdate(
    { voucherNo, status: "Pending", createdBy: { $ne: a.id } },
    { $set: { status: "Approved", checkedBy: a.id, checkedByName: a.name }, $push: { history: hist(user, "Approved") } },
    { new: true },
  );
  if (!v) throw await diagnose(voucherNo, "Maker cannot approve their own voucher");
  if (v.reversalOf) {
    const orig = await GlVoucher.findOneAndUpdate({ voucherNo: v.reversalOf, status: "Approved" }, { $set: { status: "Reversed", reversedBy: v.voucherNo }, $push: { history: hist(user, "Reversed", `by ${v.voucherNo}`) } });
    if (!orig) {
      await GlVoucher.updateOne({ _id: v._id }, { $set: { status: "Pending" }, $unset: { checkedBy: 1, checkedByName: 1 }, $push: { history: hist(user, "Approval rolled back", "original voucher is not approved") } });
      throw fail("Original voucher is no longer in an approved state", 409);
    }
  }
  return pub(v);
}

async function reject(user, voucherNo, reason) {
  if (!inRoles(user, "checker")) throw fail("Your role is not permitted to reject vouchers", 403);
  const r = typeof reason === "string" ? reason.trim() : "";
  if (!r) throw fail("A rejection reason is required", 422, { reason: "Reason is required" });
  const a = actor(user);
  const existing = await GlVoucher.findOne({ voucherNo });
  if (!existing) throw fail("Voucher not found", 404);
  if (existing.status === "Pending") await checkerLedgerAccess(user, existing);
  const upd = { $set: { status: "Rejected", checkedBy: a.id, checkedByName: a.name }, $push: { history: hist(user, "Rejected", r) } };
  if (existing.reversalOf) upd.$unset = { reversalOf: 1 };
  const v = await GlVoucher.findOneAndUpdate({ voucherNo, status: "Pending", createdBy: { $ne: a.id } }, upd, { new: true });
  if (!v) throw await diagnose(voucherNo, "Maker cannot reject their own voucher");
  return pub(v);
}

async function reverse(user, voucherNo, input) {
  if (!inRoles(user, "maker")) throw fail("Your role is not permitted to request reversals", 403);
  const reason = typeof input?.reason === "string" ? input.reason.trim() : "";
  if (!reason) throw fail("Validation failed", 422, { reason: "Reversal reason is required" });
  const orig = await GlVoucher.findOne({ voucherNo }).lean();
  if (!orig) throw fail("Voucher not found", 404);
  if (orig.status !== "Approved") throw fail(`Only approved vouchers can be reversed (status: ${orig.status})`, 409);
  if (orig.isClosing) throw fail("Year-end closing vouchers cannot be reversed", 409);
  if (orig.reversalOf) throw fail("A reversal voucher cannot be reversed", 409);
  const date = input.date || orig.date;
  const n = await normalise(user, { date, type: orig.type, narration: `Reversal of ${orig.voucherNo}: ${reason}`.slice(0, 300), chequeNo: orig.chequeNo, lines: orig.lines.map((l) => ({ ledger: l.ledger, subLedger: l.subLedger, costCentre: l.costCentre, debit: l.credit, credit: l.debit, narration: l.narration })) }, orig.mode, { });
  const a = actor(user);
  try {
    const doc = await GlVoucher.create({ ...n, mode: orig.mode, voucherNo: `RV-${await nextSeq("RV")}`, status: "Pending", reversalOf: orig.voucherNo, createdBy: a.id, createdByName: a.name, history: [hist(user, "Reversal requested", reason)] });
    await GlVoucher.updateOne({ _id: orig._id }, { $push: { history: hist(user, "Reversal requested", `${doc.voucherNo}: ${reason}`) } });
    return pub(doc);
  } catch (e) {
    if (e.code === 11000) throw fail("A reversal already exists for this voucher", 409);
    throw e;
  }
}

async function editCheque(user, voucherNo, chequeNo) {
  if (!inRoles(user, "maker")) throw fail("Your role is not permitted to edit cheque numbers", 403);
  const c = typeof chequeNo === "string" ? chequeNo.trim() : "";
  if (!c || c.length > 30) throw fail("Validation failed", 422, { chequeNo: "Cheque number is required (max 30 characters)" });
  const v = await GlVoucher.findOne({ voucherNo });
  if (!v) throw fail("Voucher not found", 404);
  if (v.status === "Reversed") throw fail("Reversed vouchers cannot be edited", 409);
  if (v.status !== "Rejected" && !v.isClosing) {
    const p = await GlEntity.findOne({ kind: "period", code: v.period }).lean();
    if (!p || p.status !== "Open") throw fail("The voucher's accounting period is closed", 409);
  }
  if (v.isClosing) throw fail("Closing vouchers cannot be edited", 409);
  const prev = v.chequeNo || "(none)";
  v.chequeNo = c;
  v.history.push(hist(user, "Cheque number edited", `${prev} → ${c}`));
  await v.save();
  return pub(v);
}

function voucherFilter(q) {
  const f = {};
  if (q.status) f.status = String(q.status);
  if (q.mode) f.mode = String(q.mode);
  if (q.type) f.type = String(q.type);
  if (q.ledger) f["lines.ledger"] = String(q.ledger);
  if (q.mine === "1") f.createdBy = q._uid;
  if (q.from || q.to) { f.date = {}; if (q.from) f.date.$gte = String(q.from); if (q.to) f.date.$lte = String(q.to); }
  if (q.chequeNo) f.chequeNo = new RegExp(esc(String(q.chequeNo).slice(0, 30)), "i");
  if (q.q) { const rx = new RegExp(esc(String(q.q).slice(0, 60)), "i"); f.$or = [{ voucherNo: rx }, { narration: rx }, { chequeNo: rx }, { createdByName: rx }]; }
  return f;
}

async function list(q) {
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const size = Math.min(100, Math.max(1, parseInt(q.size, 10) || 20));
  const f = voucherFilter(q);
  const [items, total] = await Promise.all([GlVoucher.find(f).sort({ date: -1, voucherNo: -1 }).skip((page - 1) * size).limit(size).lean(), GlVoucher.countDocuments(f)]);
  return { items: items.map(pub), total, page, size };
}

async function exportCsv(q) {
  const items = await GlVoucher.find(voucherFilter(q)).sort({ date: 1, voucherNo: 1 }).limit(5000).lean();
  const rows = items.flatMap((v) => v.lines.map((l) => ({ voucherNo: v.voucherNo, date: v.date, type: v.type, status: v.status, narration: v.narration, chequeNo: v.chequeNo, ledger: l.ledger, debit: l.debit, credit: l.credit, maker: v.createdByName, checker: v.checkedByName })));
  return toCsv([["voucherNo", "Voucher No"], ["date", "Date"], ["type", "Type"], ["status", "Status"], ["narration", "Narration"], ["chequeNo", "Cheque No"], ["ledger", "Ledger"], ["debit", "Debit"], ["credit", "Credit"], ["maker", "Maker"], ["checker", "Checker"]].map(([k, l]) => ({ k, l })), rows);
}

async function get(voucherNo) {
  const v = await GlVoucher.findOne({ voucherNo }).lean();
  if (!v) throw fail("Voucher not found", 404);
  return pub(v);
}

// ---- period / year controls ----
async function setPeriod(user, id, action) {
  if (!inRoles(user, "close")) throw fail("Your role is not permitted to close or reopen periods", 403);
  const p = await GlEntity.findOne({ _id: id, kind: "period" });
  if (!p) throw fail("Period not found", 404);
  if (action === "close") {
    if (p.status !== "Open") throw fail("Period is already closed", 409);
    const pending = await GlVoucher.countDocuments({ period: p.code, status: "Pending" });
    if (pending) throw fail(`${pending} pending voucher(s) must be approved or rejected before closing`, 409);
    const r = await GlEntity.findOneAndUpdate({ _id: p._id, status: "Open" }, { $set: { status: "Closed" }, $push: { history: hist(user, "Period closed") } }, { new: true });
    if (!r) throw fail("Period state changed; reload", 409);
    return E.pub(r);
  }
  const year = await GlEntity.findOne({ kind: "year", code: p.data.year }).lean();
  if (!year || year.status !== "Open") throw fail("Periods of a closed accounting year cannot be reopened", 409);
  const r = await GlEntity.findOneAndUpdate({ _id: p._id, status: "Closed" }, { $set: { status: "Open" }, $push: { history: hist(user, "Period reopened") } }, { new: true });
  if (!r) throw fail("Period is not closed", 409);
  return E.pub(r);
}

module.exports = { POSTED, VTYPES, pub, periodFor, normalise, create, createManyAtomic, uploadCsv, update, approve, reject, reverse, editCheque, list, get, exportCsv, setPeriod, idOf };
