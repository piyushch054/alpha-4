const GlEntity = require("../models/GlEntity");
const GlVoucher = require("../models/GlVoucher");
const { ENTITIES } = require("../config/gl");
const { fail, inRoles, actor, hist, toPaise, fromPaise, isDate, today, nextSeq, toCsv } = require("./glCommon");
const E = require("./glEntities");
const V = require("./glVouchers");

const POSTED = ["Approved", "Reversed"];
const BS = ["Asset", "Liability", "Equity"];
const money = (p) => fromPaise(p);
const col = (k, l, t) => ({ k, l, ...(t ? { t } : {}) });
const MONEY = "money";

async function ledgerMap() {
  const ls = await GlEntity.find({ kind: "ledger" }).lean();
  return Object.fromEntries(ls.map((l) => [l.code, l]));
}

async function yearOf(date) {
  return GlEntity.findOne({ kind: "year", "data.start": { $lte: date }, "data.end": { $gte: date } }).lean();
}

function checkDate(v, name) {
  if (v !== undefined && v !== "" && !isDate(String(v))) throw fail(`${name} must be a valid date (YYYY-MM-DD)`, 400);
}

// Posted debit/credit in integer paise per ledger.
async function sums({ from, to, includeClosing = true, ledger }) {
  const match = { status: { $in: POSTED } };
  if (from || to) { match.date = {}; if (from) match.date.$gte = from; if (to) match.date.$lte = to; }
  if (!includeClosing) match.isClosing = { $ne: true };
  const pipe = [{ $match: match }, { $unwind: "$lines" }];
  if (ledger) pipe.push({ $match: { "lines.ledger": ledger } });
  pipe.push({ $group: { _id: "$lines.ledger", dr: { $sum: { $round: [{ $multiply: ["$lines.debit", 100] }, 0] } }, cr: { $sum: { $round: [{ $multiply: ["$lines.credit", 100] }, 0] } } } });
  const rows = await GlVoucher.aggregate(pipe);
  return Object.fromEntries(rows.map((r) => [r._id, { dr: r.dr, cr: r.cr }]));
}

const opening = (l) => (BS.includes(l.data.type) ? toPaise(l.data.openingBalance || 0) * (l.data.openingSide === "Cr" ? -1 : 1) : 0);

// Signed (Dr positive) balances at asOf: balance-sheet ledgers cumulative; income/expense scoped to the accounting year.
async function closingBalances(asOf) {
  const lm = await ledgerMap();
  const year = await yearOf(asOf);
  const [all, yr] = await Promise.all([sums({ to: asOf }), sums({ from: year ? year.data.start : undefined, to: asOf })]);
  const out = {};
  let openingSum = 0;
  for (const l of Object.values(lm)) {
    const s = (BS.includes(l.data.type) ? all : yr)[l.code] || { dr: 0, cr: 0 };
    const o = opening(l);
    openingSum += o;
    out[l.code] = { ledger: l, opening: o, dr: s.dr, cr: s.cr, balance: o + s.dr - s.cr };
  }
  return { out, openingSum, year };
}

async function trialBalance(q) {
  checkDate(q.asOf, "As-of date");
  const asOf = q.asOf || today();
  const { out, openingSum, year } = await closingBalances(asOf);
  const rows = [];
  let tdr = 0, tcr = 0;
  for (const b of Object.values(out).sort((a, c) => a.ledger.code.localeCompare(c.ledger.code))) {
    if (b.balance === 0 && b.dr === 0 && b.cr === 0 && b.opening === 0) continue;
    const dr = b.balance > 0 ? b.balance : 0, cr = b.balance < 0 ? -b.balance : 0;
    tdr += dr; tcr += cr;
    rows.push({ code: b.ledger.code, name: b.ledger.data.name, group: b.ledger.data.group, type: b.ledger.data.type, debit: money(dr), credit: money(cr) });
  }
  const notes = [`As of ${asOf}${year ? ` (accounting year ${year.code})` : ""}. Income/expense ledgers show the current accounting year only.`];
  if (openingSum !== 0) notes.push(`Opening balances are out of balance by ${money(Math.abs(openingSum)).toFixed(2)} (${openingSum > 0 ? "Dr" : "Cr"}); correct ledger opening balances.`);
  return { title: "Trial Balance", columns: [col("code", "Ledger"), col("name", "Name"), col("group", "Group"), col("type", "Type"), col("debit", "Debit", MONEY), col("credit", "Credit", MONEY)], rows, totals: { name: "Total", debit: money(tdr), credit: money(tcr) }, summary: { balanced: tdr === tcr, difference: money(tdr - tcr) }, notes };
}

async function profitLoss(q) {
  checkDate(q.from, "From date"); checkDate(q.to, "To date");
  let from = q.from, to = q.to;
  if (!from || !to) {
    const y = (await yearOf(q.to || today())) || (await GlEntity.findOne({ kind: "year" }).sort({ "data.start": -1 }).lean());
    if (y) { from = from || y.data.start; to = to || y.data.end; }
  }
  if (!from || !to) throw fail("From and To dates are required (no accounting year exists)", 400);
  if (from > to) throw fail("From date cannot be after To date", 400);
  const [lm, s] = await Promise.all([ledgerMap(), sums({ from, to, includeClosing: false })]);
  const rows = [];
  const part = (type, label, sign) => {
    let tot = 0;
    rows.push({ section: label, kind: "head" });
    for (const l of Object.values(lm).filter((x) => x.data.type === type).sort((a, b) => a.code.localeCompare(b.code))) {
      const v = s[l.code]; if (!v) continue;
      const amt = sign * (v.cr - v.dr);
      if (amt === 0) continue;
      tot += amt;
      rows.push({ section: label, code: l.code, name: l.data.name, amount: money(amt) });
    }
    rows.push({ section: label, name: `Total ${label}`, amount: money(tot), kind: "total" });
    return tot;
  };
  const inc = part("Income", "Income", 1);
  const exp = part("Expense", "Expense", -1);
  const net = inc - exp;
  rows.push({ section: "Result", name: net >= 0 ? "Net Profit" : "Net Loss", amount: money(Math.abs(net)), kind: "total" });
  return { title: "Profit & Loss", columns: [col("section", "Section"), col("code", "Ledger"), col("name", "Name"), col("amount", "Amount", MONEY)], rows, summary: { income: money(inc), expense: money(exp), net: money(net) }, notes: [`Period ${from} to ${to}. Year-end closing entries are excluded.`] };
}

async function balanceSheet(q) {
  checkDate(q.asOf, "As-of date");
  const asOf = q.asOf || today();
  const { out, openingSum, year } = await closingBalances(asOf);
  const rows = [];
  const sec = (type, label, sign) => {
    let tot = 0;
    rows.push({ section: label, kind: "head" });
    for (const b of Object.values(out).filter((x) => x.ledger.data.type === type).sort((a, c) => a.ledger.code.localeCompare(c.ledger.code))) {
      if (b.balance === 0) continue;
      tot += sign * b.balance;
      rows.push({ section: label, code: b.ledger.code, name: b.ledger.data.name, amount: money(sign * b.balance) });
    }
    rows.push({ section: label, name: `Total ${label}`, amount: money(tot), kind: "total" });
    return tot;
  };
  const assets = sec("Asset", "Assets", 1);
  const liab = sec("Liability", "Liabilities", -1);
  const eq = sec("Equity", "Equity", -1);
  let profit = 0;
  for (const b of Object.values(out)) if (b.ledger.data.type === "Income" || b.ledger.data.type === "Expense") profit -= b.balance;
  rows.push({ section: "Current year result", name: "Profit / (Loss) for the year", amount: money(profit), kind: "total" });
  const rhs = liab + eq + profit;
  rows.push({ section: "Check", name: "Total Liabilities + Equity + Result", amount: money(rhs), kind: "total" });
  const notes = [`As of ${asOf}${year ? ` (accounting year ${year.code})` : ""}.`];
  if (openingSum !== 0) notes.push(`Opening balances are out of balance by ${money(Math.abs(openingSum)).toFixed(2)}.`);
  return { title: "Balance Sheet", columns: [col("section", "Section"), col("code", "Ledger"), col("name", "Name"), col("amount", "Amount", MONEY)], rows, summary: { assets: money(assets), liabilitiesAndEquity: money(rhs), balanced: assets === rhs, difference: money(assets - rhs) }, notes };
}

async function ledgerStatement(code, from, to) {
  const l = await GlEntity.findOne({ kind: "ledger", code }).lean();
  if (!l) throw fail("Ledger not found", 404);
  let scopeStart = null;
  if (!BS.includes(l.data.type)) { const y = await yearOf(from); scopeStart = y ? y.data.start : from; }
  const f = { status: { $in: POSTED }, "lines.ledger": code, date: { $lte: to } };
  if (scopeStart) f.date.$gte = scopeStart;
  const vs = await GlVoucher.find(f).sort({ date: 1, voucherNo: 1 }).limit(20000).lean();
  let bal = opening(l);
  const rows = [];
  for (const v of vs) {
    for (const ln of v.lines.filter((x) => x.ledger === code)) {
      const dr = toPaise(ln.debit), cr = toPaise(ln.credit);
      if (v.date < from) { bal += dr - cr; continue; }
      if (!rows.length) rows.push({ date: from, narration: "Opening Balance", balance: money(Math.abs(bal)), side: bal >= 0 ? "Dr" : "Cr", kind: "head" });
      bal += dr - cr;
      rows.push({ date: v.date, voucherNo: v.voucherNo, narration: ln.narration || v.narration, chequeNo: v.chequeNo, debit: ln.debit, credit: ln.credit, balance: money(Math.abs(bal)), side: bal >= 0 ? "Dr" : "Cr" });
    }
  }
  const open = rows.length ? rows[0] : null;
  const openingBal = open ? open.balance * (open.side === "Dr" ? 1 : -1) : money(bal);
  if (!open) rows.push({ date: from, narration: "Opening Balance", balance: money(Math.abs(bal)), side: bal >= 0 ? "Dr" : "Cr", kind: "head" });
  rows.push({ date: to, narration: "Closing Balance", balance: money(Math.abs(bal)), side: bal >= 0 ? "Dr" : "Cr", kind: "total" });
  return { ledger: l, rows, closing: money(bal), opening: openingBal };
}

const stmtCols = [col("date", "Date"), col("voucherNo", "Voucher"), col("narration", "Narration"), col("chequeNo", "Cheque"), col("debit", "Debit", MONEY), col("credit", "Credit", MONEY), col("balance", "Balance", MONEY), col("side", "Dr/Cr")];

async function ledgerReport(q) {
  if (!q.ledger) throw fail("Ledger is required", 400);
  checkDate(q.from, "From date"); checkDate(q.to, "To date");
  const to = q.to || today();
  const from = q.from || (await yearOf(to))?.data.start || to;
  if (from > to) throw fail("From date cannot be after To date", 400);
  const s = await ledgerStatement(String(q.ledger), from, to);
  return { title: `Ledger Report — ${s.ledger.code} ${s.ledger.data.name}`, columns: stmtCols, rows: s.rows, notes: [`${from} to ${to}`] };
}

async function cashBook(q) {
  checkDate(q.from, "From date"); checkDate(q.to, "To date");
  const to = q.to || today();
  const from = q.from || to;
  if (from > to) throw fail("From date cannot be after To date", 400);
  const lm = await ledgerMap();
  const flag = q.kind === "bank" ? "isBank" : "isCash";
  let targets = Object.values(lm).filter((l) => l.data[flag]);
  if (q.ledger) { targets = targets.filter((l) => l.code === q.ledger); if (!targets.length) throw fail(`Selected ledger is not a ${flag === "isBank" ? "bank" : "cash"} ledger`, 404); }
  const rows = [];
  for (const l of targets.sort((a, b) => a.code.localeCompare(b.code))) {
    const s = await ledgerStatement(l.code, from, to);
    rows.push({ date: "", narration: `${l.code} — ${l.data.name}`, kind: "head" });
    rows.push(...s.rows);
  }
  return { title: flag === "isBank" ? "Bank Book" : "Cash Book", columns: stmtCols, rows, notes: targets.length ? [`${from} to ${to}`] : [`No ${flag === "isBank" ? "bank" : "cash"} ledgers are defined`] };
}

async function dayBook(q) {
  checkDate(q.from, "From date"); checkDate(q.to, "To date");
  const to = q.to || today();
  const from = q.from || to;
  if (from > to) throw fail("From date cannot be after To date", 400);
  const f = { date: { $gte: from, $lte: to }, status: q.status ? String(q.status) : { $in: POSTED } };
  if (q.type) f.type = String(q.type);
  const vs = await GlVoucher.find(f).sort({ date: 1, voucherNo: 1 }).limit(5000).lean();
  const rows = vs.flatMap((v) => v.lines.map((l, i) => ({ date: v.date, voucherNo: v.voucherNo, type: v.type, ledger: l.ledger, narration: i === 0 ? v.narration : "", debit: l.debit, credit: l.credit, status: v.status })));
  return { title: "Day Book", columns: [col("date", "Date"), col("voucherNo", "Voucher"), col("type", "Type"), col("ledger", "Ledger"), col("narration", "Narration"), col("debit", "Debit", MONEY), col("credit", "Credit", MONEY), col("status", "Status")], rows, notes: [`${from} to ${to}`] };
}

const DUMPS = ["vouchers", "audit", ...Object.keys(ENTITIES)];
async function dump(q) {
  const ds = q.dataset || "vouchers";
  if (!DUMPS.includes(ds)) throw fail("Unknown dataset", 400);
  if (ds === "vouchers") {
    const vs = await GlVoucher.find({}).sort({ date: 1, voucherNo: 1 }).limit(5000).lean();
    return { title: "Dump — Vouchers", columns: ["voucherNo", "date", "type", "mode", "status", "ledger", "debit", "credit", "narration", "chequeNo", "createdByName", "checkedByName"].map((k) => col(k, k)), rows: vs.flatMap((v) => v.lines.map((l) => ({ ...v, ledger: l.ledger, debit: l.debit, credit: l.credit }))) };
  }
  if (ds === "audit") {
    const [vs, es] = await Promise.all([GlVoucher.find({}).sort({ updatedAt: -1 }).limit(500).lean(), GlEntity.find({}).sort({ updatedAt: -1 }).limit(500).lean()]);
    const rows = [...vs.flatMap((v) => v.history.map((h) => ({ at: h.at.toISOString(), object: v.voucherNo, ...h }))), ...es.flatMap((e) => e.history.map((h) => ({ at: h.at.toISOString(), object: `${e.kind}:${e.code}`, ...h })))].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 5000);
    return { title: "Dump — Audit Trail", columns: [col("at", "Time"), col("object", "Object"), col("action", "Action"), col("by", "By"), col("role", "Role"), col("note", "Note")], rows };
  }
  const def = ENTITIES[ds];
  const items = await GlEntity.find({ kind: ds }).sort({ code: 1 }).limit(5000).lean();
  return { title: `Dump — ${def.label}`, columns: [col("code", "Code"), ...def.fields.filter((f) => f.n !== "code").map((f) => col(f.n, f.l)), ...(def.fields.some((f) => f.n === "status") ? [] : [col("status", "Status")])], rows: items.map((e) => ({ code: e.code, status: e.status, ...Object.fromEntries(Object.entries(e.data).map(([k, v]) => [k, Array.isArray(v) ? v.join("; ") : v])) })) };
}

// ---- Year end ----
async function yearEndPreview(q) {
  const year = await GlEntity.findOne({ kind: "year", code: String(q.year || "") }).lean();
  if (!year) throw fail("Accounting year not found", 404);
  const [lm, s, periods, pending] = await Promise.all([ledgerMap(), sums({ from: year.data.start, to: year.data.end, includeClosing: false }), GlEntity.find({ kind: "period", "data.year": year.code }).lean(), GlVoucher.countDocuments({ year: year.code, status: "Pending" })]);
  const lines = [];
  let net = 0;
  for (const l of Object.values(lm).filter((x) => x.data.type === "Income" || x.data.type === "Expense").sort((a, b) => a.code.localeCompare(b.code))) {
    const v = s[l.code];
    if (!v) continue;
    const bal = v.dr - v.cr;
    if (bal === 0) continue;
    net -= bal;
    lines.push({ ledger: l.code, name: l.data.name, type: l.data.type, balance: money(Math.abs(bal)), side: bal > 0 ? "Dr" : "Cr" });
  }
  const blockers = [];
  if (year.status !== "Open") blockers.push("Accounting year is already closed");
  if (!periods.length) blockers.push("No accounting periods exist for this year");
  const open = periods.filter((p) => p.status !== "Closed").length;
  if (open) blockers.push(`${open} accounting period(s) are still open`);
  if (pending) blockers.push(`${pending} voucher(s) are pending approval`);
  if (!lines.length) blockers.push("There are no income/expense balances to close");
  return { year: year.code, start: year.data.start, end: year.data.end, lines, netProfit: money(net), blockers, canRun: blockers.length === 0 };
}

async function yearEnd(user, input) {
  if (!inRoles(user, "close")) throw fail("Your role is not permitted to run year end", 403);
  if (!input || input.confirm !== true) throw fail("Year end must be explicitly confirmed", 422, { confirm: "Confirmation is required" });
  const pv = await yearEndPreview({ year: input.year });
  if (!pv.canRun) throw fail(`Year end cannot run: ${pv.blockers.join("; ")}`, 409);
  const target = await GlEntity.findOne({ kind: "ledger", code: String(input.closingLedger || "") }).lean();
  if (!target || target.status !== "Active") throw fail("Validation failed", 422, { closingLedger: "Select an active closing ledger" });
  if (!["Equity", "Liability"].includes(target.data.type)) throw fail("Validation failed", 422, { closingLedger: "Closing ledger must be an Equity or Liability ledger" });
  const claim = await GlEntity.findOneAndUpdate({ kind: "year", code: pv.year, status: "Open" }, { $set: { status: "Closed" }, $push: { history: hist(user, "Year end process started") } });
  if (!claim) throw fail("Accounting year is no longer open", 409);
  const a = actor(user);
  try {
    const lines = pv.lines.map((l) => ({ ledger: l.ledger, debit: l.side === "Cr" ? l.balance : 0, credit: l.side === "Dr" ? l.balance : 0, narration: "Year end closing" }));
    const net = toPaise(pv.netProfit);
    lines.push({ ledger: target.code, debit: net < 0 ? money(-net) : 0, credit: net > 0 ? money(net) : 0, narration: "Net result transferred" });
    const dr = lines.reduce((s, l) => s + toPaise(l.debit), 0), cr = lines.reduce((s, l) => s + toPaise(l.credit), 0);
    if (dr !== cr) throw fail("Closing entry does not balance", 500);
    const period = await GlEntity.findOne({ kind: "period", "data.year": pv.year, "data.end": { $lte: pv.end } }).sort({ "data.end": -1 }).lean();
    const voucher = await GlVoucher.create({ voucherNo: `YE-${await nextSeq("YE")}`, mode: "general", type: "Adjustment", date: pv.end, year: pv.year, period: period.code, narration: `Year end closing ${pv.year}`, lines, total: money(dr), status: "Approved", isClosing: true, createdBy: a.id, createdByName: a.name, checkedBy: a.id, checkedByName: a.name, source: "year-end", history: [hist(user, "Year end closing voucher posted")] });
    await GlEntity.updateOne({ kind: "year", code: pv.year }, { $push: { history: hist(user, "Year closed", voucher.voucherNo) } });
    return { year: pv.year, voucher: V.pub(voucher), netProfit: pv.netProfit };
  } catch (e) {
    await GlEntity.updateOne({ kind: "year", code: pv.year }, { $set: { status: "Open" }, $push: { history: hist(user, "Year end rolled back", e.message) } });
    throw e;
  }
}

async function dashboard() {
  const [years, periodsOpen, ledgers, groups, vPending, vApproved, billsPending, stmtUn, stmtAll, recent] = await Promise.all([
    GlEntity.countDocuments({ kind: "year" }),
    GlEntity.countDocuments({ kind: "period", status: "Open" }),
    GlEntity.countDocuments({ kind: "ledger" }),
    GlEntity.countDocuments({ kind: "group" }),
    GlVoucher.countDocuments({ status: "Pending" }),
    GlVoucher.countDocuments({ status: { $in: POSTED } }),
    GlEntity.countDocuments({ kind: "bill", status: "Pending Author" }),
    GlEntity.countDocuments({ kind: "bankstmt", status: "Unmatched" }),
    GlEntity.countDocuments({ kind: "bankstmt" }),
    dump({ dataset: "audit" }),
  ]);
  const tb = await trialBalance({});
  return { years, openPeriods: periodsOpen, ledgers, groups, pendingVouchers: vPending, postedVouchers: vApproved, pendingBills: billsPending, unmatchedStatements: stmtUn, reconciledPercent: stmtAll ? Math.round(((stmtAll - stmtUn) / stmtAll) * 100) : null, trialBalance: tb.summary, recent: recent.rows.slice(0, 8) };
}

const registry = { tb: trialBalance, ledger: ledgerReport, cashbook: cashBook, daybook: dayBook, dump, pl: profitLoss, bs: balanceSheet };

module.exports = { registry, sums, closingBalances, yearOf, yearEnd, yearEndPreview, dashboard, ledgerMap, checkDate, col, MONEY, ledgerStatement, opening };
