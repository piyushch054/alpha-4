// Real-MongoDB integration test for the General Ledger API. Run against a DISPOSABLE database:
//   GL_TEST_MONGO_URI=mongodb://127.0.0.1:27555/gl_test npm test
const test = require("node:test");
const assert = require("node:assert/strict");

const URI = process.env.GL_TEST_MONGO_URI;
const skip = URI ? false : "GL_TEST_MONGO_URI not set";

process.env.JWT_SECRET = process.env.JWT_SECRET || "x".repeat(40);
process.env.NODE_ENV = "test";

test("General Ledger API (real MongoDB)", { skip }, async (t) => {
  if (!/test|tmp|disposable|127\.0\.0\.1|localhost/.test(URI)) throw new Error("Refusing to run against a non-local database");
  const mongoose = require("mongoose");
  const express = require("express");
  const jwt = require("jsonwebtoken");
  await mongoose.connect(URI);
  await mongoose.connection.dropDatabase();
  const User = require("../models/User");
  const app = express();
  app.use(express.json());
  app.use("/api/gl", require("../routes/gl"));
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api/gl`;
  t.after(async () => { server.close(); await mongoose.connection.dropDatabase(); await mongoose.disconnect(); });

  const mk = async (role, n) => {
    const u = await User.create({ email: `${n}@t.test`, password: "x", name: n, role });
    return jwt.sign({ id: u._id }, process.env.JWT_SECRET);
  };
  const T = { master: await mk("Central Operations", "master"), maker2: await mk("Disbursement Officer", "maker2"), checker: await mk("Operations Checker", "checker"), ceo: await mk("CEO", "ceo"), audit: await mk("Audit Manager", "audit"), bso: await mk("BSO", "bso") };
  const call = async (tok, method, path, body) => {
    const r = await fetch(base + path, { method, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: `Bearer ${tok}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const text = await r.text();
    let json; try { json = JSON.parse(text); } catch { json = null; }
    return { status: r.status, json, text, data: json?.data };
  };
  const post = (tok, p, b) => call(tok, "POST", p, b);

  await t.test("authn/authz", async () => {
    assert.equal((await call(null, "GET", "/meta")).status, 401);
    assert.equal((await call("bad.token.here", "GET", "/meta")).status, 401);
    assert.equal((await call(T.bso, "GET", "/meta")).status, 403);
    const m = await call(T.audit, "GET", "/meta");
    assert.equal(m.status, 200);
    assert.equal(m.data.caps.master, false);
    assert.equal((await post(T.audit, "/e/year", { code: "FY1", start: "2025-04-01", end: "2026-03-31" })).status, 403);
    // role in body/header is ignored
    const forged = await fetch(base + "/e/year", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${T.audit}`, "X-Role": "CEO" }, body: JSON.stringify({ code: "FY1", start: "2025-04-01", end: "2026-03-31", role: "CEO" }) });
    assert.equal(forged.status, 403);
  });

  await t.test("setup masters with validation", async () => {
    assert.equal((await post(T.master, "/e/year", { code: "FY1", start: "2026-03-31", end: "2025-04-01" })).status, 422);
    assert.equal((await post(T.master, "/e/year", { code: "FY1", start: "2025-04-01", end: "2026-03-31" })).status, 201);
    assert.equal((await post(T.master, "/e/year", { code: "FY1", start: "2025-04-01", end: "2026-03-31" })).status, 409);
    assert.equal((await post(T.master, "/e/year", { code: "FY2", start: "2025-12-01", end: "2026-11-30" })).status, 422, "overlap");
    const p = await post(T.master, "/e/period", { year: "FY1", month: "April" });
    assert.equal(p.status, 201);
    assert.equal(p.data.code, "FY1-202504");
    assert.equal((await post(T.master, "/e/period", { year: "FY1", month: "April" })).status, 409);
    assert.equal((await post(T.master, "/e/period", { year: "FY1", month: "May" })).status, 201);
    for (const [c, n, ty] of [["G-AST", "Assets", "Asset"], ["G-LIA", "Equity", "Equity"], ["G-INC", "Income", "Income"], ["G-EXP", "Expenses", "Expense"]]) assert.equal((await post(T.master, "/e/group", { code: c, name: n, type: ty })).status, 201);
    assert.equal((await post(T.master, "/e/group", { code: "BAD", name: "x", type: "Income", parent: "G-AST" })).status, 422, "parent type mismatch");
    const mkL = (code, name, group, extra = {}) => post(T.master, "/e/ledger", { code, name, group, ...extra });
    assert.equal((await mkL("CASH", "Cash", "G-AST", { isCash: true, openingBalance: 1000, openingSide: "Dr" })).status, 201);
    assert.equal((await mkL("BANK", "Bank", "G-AST", { isBank: true })).status, 201);
    assert.equal((await mkL("CAP", "Capital", "G-LIA", { openingBalance: 1000, openingSide: "Cr" })).status, 201);
    assert.equal((await mkL("SALES", "Sales", "G-INC")).status, 201);
    assert.equal((await mkL("RENT", "Rent", "G-EXP")).status, 201);
    assert.equal((await mkL("BADOPEN", "x", "G-INC", { openingBalance: 5 })).status, 422);
    assert.equal((await mkL("BADCASH", "x", "G-LIA", { isCash: true })).status, 422);
    assert.equal((await mkL("LTD", "Limited", "G-AST", { limited: true, restrictedRoles: ["Central Operations", "Operations Checker"] })).status, 201);
    assert.equal((await mkL("LTD2", "Limited2", "G-EXP", { limited: true })).status, 201);
  });

  const voucher = (over = {}) => ({ date: "2025-04-10", type: "Journal", narration: "Test", lines: [{ ledger: "CASH", debit: 500 }, { ledger: "SALES", credit: 500 }], ...over });
  let v1;

  await t.test("voucher validation", async () => {
    assert.equal((await post(T.master, "/vouchers", voucher({ lines: [{ ledger: "CASH", debit: 500 }, { ledger: "SALES", credit: 499.99 }] }))).status, 422, "unbalanced");
    assert.equal((await post(T.master, "/vouchers", voucher({ lines: [{ ledger: "CASH", debit: 500 }] }))).status, 422);
    assert.equal((await post(T.master, "/vouchers", voucher({ lines: [{ ledger: "CASH", debit: 500, credit: 500 }, { ledger: "SALES", credit: 0 }] }))).status, 422);
    assert.equal((await post(T.master, "/vouchers", voucher({ lines: [{ ledger: "NOPE", debit: 5 }, { ledger: "SALES", credit: 5 }] }))).status, 422);
    assert.equal((await post(T.master, "/vouchers", voucher({ lines: [{ ledger: "CASH", debit: 0.001 }, { ledger: "SALES", credit: 0.001 }] }))).status, 422);
    assert.equal((await post(T.master, "/vouchers", voucher({ date: "2027-01-01" }))).status, 422, "no period");
    assert.equal((await post(T.master, "/vouchers", voucher({ date: "bad" }))).status, 422);
    assert.equal((await post(T.checker, "/vouchers", voucher())).status, 403, "checker cannot create");
    const r = await post(T.master, "/vouchers", voucher());
    assert.equal(r.status, 201);
    assert.equal(r.data.status, "Pending");
    v1 = r.data.voucherNo;
  });

  await t.test("maker-checker", async () => {
    assert.equal((await post(T.master, `/vouchers/${v1}/approve`)).status, 403, "maker role cannot approve");
    assert.equal((await post(T.checker, `/vouchers/${v1}/reject`, {})).status, 422, "reason needed");
    const tb0 = await call(T.checker, "GET", "/reports/tb?asOf=2025-04-30");
    assert.equal(tb0.data.rows.find((r) => r.code === "SALES"), undefined, "pending vouchers must not post");
    const a = await post(T.checker, `/vouchers/${v1}/approve`);
    assert.equal(a.status, 200);
    assert.equal(a.data.status, "Approved");
    assert.equal((await post(T.checker, `/vouchers/${v1}/approve`)).status, 409, "double approval");
    // CEO is both checker role; a CEO-made voucher cannot be approved by the same CEO
    const own = await post(T.ceo, "/vouchers", voucher());
    assert.equal(own.status, 403, "CEO is not a maker role");
  });

  await t.test("reports from posted data", async () => {
    const tb = await call(T.audit, "GET", "/reports/tb?asOf=2025-04-30");
    assert.equal(tb.status, 200);
    assert.equal(tb.data.summary.balanced, true);
    assert.equal(tb.data.rows.find((r) => r.code === "CASH").debit, 1500);
    assert.equal(tb.data.rows.find((r) => r.code === "SALES").credit, 500);
    const pl = await call(T.audit, "GET", "/reports/pl?from=2025-04-01&to=2025-04-30");
    assert.equal(pl.data.summary.net, 500);
    const bs = await call(T.audit, "GET", "/reports/bs?asOf=2025-04-30");
    assert.equal(bs.data.summary.balanced, true);
    assert.equal(bs.data.summary.assets, 1500);
    const lr = await call(T.audit, "GET", "/reports/ledger?ledger=CASH&from=2025-04-01&to=2025-04-30");
    assert.equal(lr.data.rows.at(-1).balance, 1500);
    const cb = await call(T.audit, "GET", "/reports/cashbook?from=2025-04-01&to=2025-04-30");
    assert.ok(cb.data.rows.some((r) => r.voucherNo === v1));
    const db = await call(T.audit, "GET", "/reports/daybook?from=2025-04-10&to=2025-04-10");
    assert.equal(db.data.rows.length, 2);
    const csv = await call(T.audit, "GET", "/reports/tb?asOf=2025-04-30&format=csv");
    assert.match(csv.text, /Ledger,Name/);
    assert.equal((await call(T.audit, "GET", "/reports/tb?asOf=nonsense")).status, 400);
  });

  await t.test("reversal", async () => {
    assert.equal((await post(T.master, `/vouchers/${v1}/reverse`, {})).status, 422, "reason");
    const rv = await post(T.master, `/vouchers/${v1}/reverse`, { reason: "wrong party" });
    assert.equal(rv.status, 201);
    assert.equal((await post(T.master, `/vouchers/${v1}/reverse`, { reason: "again" })).status, 409, "duplicate reversal");
    assert.equal((await post(T.checker, `/vouchers/${rv.data.voucherNo}/approve`)).status, 200);
    assert.equal((await call(T.audit, "GET", `/vouchers/${v1}`)).data.status, "Reversed");
    const pl = await call(T.audit, "GET", "/reports/pl?from=2025-04-01&to=2025-04-30");
    assert.equal(pl.data.summary.net, 0);
    assert.equal((await post(T.master, `/vouchers/${rv.data.voucherNo}/reverse`, { reason: "x" })).status, 409, "reversal of reversal");
  });

  await t.test("limited-ledger voucher and restricted roles", async () => {
    const r = await post(T.master, "/vouchers", { mode: "limited", date: "2025-04-11", narration: "ltd", type: "Journal", lines: [{ ledger: "LTD", debit: 10 }, { ledger: "LTD2", credit: 10 }] });
    assert.equal(r.status, 201);
    assert.equal((await post(T.master, "/vouchers", { mode: "limited", date: "2025-04-11", narration: "n", type: "Journal", lines: [{ ledger: "CASH", debit: 10 }, { ledger: "LTD2", credit: 10 }] })).status, 422, "non-limited ledger");
    assert.equal((await post(T.maker2, "/vouchers", { mode: "limited", date: "2025-04-11", narration: "n", type: "Journal", lines: [{ ledger: "LTD", debit: 10 }, { ledger: "LTD2", credit: 10 }] })).status, 403, "restricted ledger role");
    assert.equal((await post(T.checker, `/vouchers/${r.data.voucherNo}/approve`)).status, 200);
  });

  await t.test("rejection, edit and resubmission", async () => {
    const r = await post(T.maker2, "/vouchers", voucher({ narration: "x" }));
    assert.equal(r.status, 201);
    assert.equal((await post(T.checker, `/vouchers/${r.data.voucherNo}/reject`, { reason: "bad narration" })).data.status, "Rejected");
    assert.equal((await call(T.master, "PUT", `/vouchers/${r.data.voucherNo}`, voucher())).status, 403, "only maker edits");
    const ed = await call(T.maker2, "PUT", `/vouchers/${r.data.voucherNo}`, voucher({ narration: "fixed" }));
    assert.equal(ed.data.status, "Pending");
    assert.ok(ed.data.history.length >= 3);
  });

  await t.test("voucher csv upload is atomic", async () => {
    const bad = "voucherRef,date,ledger,debit,credit,narration\nA,2025-04-12,CASH,10,,n\nA,2025-04-12,SALES,,10,n\nB,2025-04-12,CASH,10,,n\nB,2025-04-12,SALES,,9,n\n";
    const r = await post(T.master, "/vouchers/upload", { text: bad });
    assert.equal(r.status, 422);
    const list = await call(T.master, "GET", "/vouchers?q=&size=100");
    const before = list.data.total;
    const good = "voucherRef,date,ledger,debit,credit,narration\nA,2025-04-12,CASH,10,,n\nA,2025-04-12,SALES,,10,n\n";
    assert.equal((await post(T.master, "/vouchers/upload", { text: good })).data.created, 1);
    assert.equal((await call(T.master, "GET", "/vouchers?size=100")).data.total, before + 1, "bad upload created nothing");
  });

  await t.test("cheque number edit and search", async () => {
    const r = await post(T.master, "/vouchers", voucher({ chequeNo: "123456" }));
    const s = await call(T.master, "GET", "/vouchers?chequeNo=1234");
    assert.ok(s.data.items.some((v) => v.voucherNo === r.data.voucherNo));
    const e = await post(T.master, `/vouchers/${r.data.voucherNo}/cheque`, { chequeNo: "999" });
    assert.equal(e.data.chequeNo, "999");
    assert.equal((await post(T.master, `/vouchers/${r.data.voucherNo}/cheque`, { chequeNo: "" })).status, 422);
  });

  await t.test("master protections", async () => {
    assert.equal((await call(T.master, "DELETE", `/e/ledger/${(await call(T.master, "GET", "/e/ledger?q=CASH")).data.items[0].id}`)).status, 409, "ledger in use");
    const led = (await call(T.master, "GET", "/e/ledger?q=CASH")).data.items[0];
    assert.equal((await call(T.master, "PUT", `/e/ledger/${led.id}`, { ...led, openingBalance: 5 })).status, 422, "opening locked after postings");
    const g = await post(T.master, "/e/group", { code: "TMP", name: "tmp", type: "Asset" });
    assert.equal((await call(T.master, "DELETE", `/e/group/${g.data.id}`)).status, 200);
    assert.equal((await call(T.master, "GET", "/e/ledger?page=1&size=2")).data.items.length, 2);
    assert.equal((await call(T.master, "GET", "/e/nonexistent")).status, 404);
    assert.equal((await call(T.master, "GET", "/e/ledger/notanid")).status, 400);
    assert.equal((await call(T.audit, "GET", "/e/ledger/export.csv")).status, 200);
  });

  await t.test("period close, year end, closed-period protection", async () => {
    const periods = (await call(T.ceo, "GET", "/e/period")).data.items;
    const apr = periods.find((p) => p.code === "FY1-202504"), may = periods.find((p) => p.code === "FY1-202505");
    assert.equal((await post(T.master, `/e/period/${apr.id}/close`)).status, 403, "only close role");
    assert.equal((await post(T.ceo, `/e/period/${apr.id}/close`)).status, 409, "pending vouchers block close");
    const pend = (await call(T.ceo, "GET", "/vouchers?status=Pending&size=100")).data.items;
    for (const v of pend) {
      const who = v.createdByName === "master" ? T.checker : T.checker;
      await post(who, `/vouchers/${v.voucherNo}/reject`, { reason: "cleanup" });
    }
    assert.equal((await post(T.ceo, `/e/period/${apr.id}/close`)).status, 200);
    assert.equal((await post(T.master, "/vouchers", voucher())).status, 422, "closed period");
    assert.equal((await post(T.ceo, `/e/period/${apr.id}/reopen`)).status, 200);
    assert.equal((await post(T.master, "/vouchers", voucher({ date: "2025-05-05", lines: [{ ledger: "RENT", debit: 100 }, { ledger: "CASH", credit: 100 }] }))).status, 201);
    const preview = await call(T.ceo, "GET", "/year-end/preview?year=FY1");
    assert.equal(preview.data.canRun, false);
    assert.equal((await post(T.ceo, "/year-end", { year: "FY1", closingLedger: "CAP", confirm: true })).status, 409);
    for (const v of (await call(T.ceo, "GET", "/vouchers?status=Pending&size=100")).data.items) await post(T.checker, `/vouchers/${v.voucherNo}/approve`);
    // add sales so P&L has activity (April voucher was reversed; use May)
    const s = await post(T.master, "/vouchers", voucher({ date: "2025-05-06", lines: [{ ledger: "CASH", debit: 700 }, { ledger: "SALES", credit: 700 }] }));
    await post(T.checker, `/vouchers/${s.data.voucherNo}/approve`);
    for (const p of [apr, may]) assert.equal((await post(T.ceo, `/e/period/${p.id}/close`)).status, 200);
    assert.equal((await post(T.ceo, "/year-end", { year: "FY1", closingLedger: "SALES", confirm: true })).status, 422, "closing ledger must be equity/liability");
    assert.equal((await post(T.ceo, "/year-end", { year: "FY1", closingLedger: "CAP" })).status, 422, "confirmation required");
    const ye = await post(T.ceo, "/year-end", { year: "FY1", closingLedger: "CAP", confirm: true });
    assert.equal(ye.status, 200, ye.text);
    assert.equal(ye.data.netProfit, 610);
    assert.equal((await post(T.ceo, "/year-end", { year: "FY1", closingLedger: "CAP", confirm: true })).status, 409, "second year end");
    assert.equal((await post(T.ceo, `/e/period/${may.id}/reopen`)).status, 409, "closed year");
    assert.equal((await post(T.master, "/vouchers", voucher({ date: "2025-05-07" }))).status, 422);
    const tb = await call(T.audit, "GET", "/reports/tb?asOf=2026-03-31");
    assert.equal(tb.data.summary.balanced, true);
    const sales = tb.data.rows.find((r) => r.code === "SALES");
    assert.equal(sales.debit + sales.credit, 0, "P&L ledgers closed");
    assert.equal(tb.data.rows.find((r) => r.code === "CAP").credit, 1610);
    const pl = await call(T.audit, "GET", "/reports/pl?from=2025-04-01&to=2026-03-31");
    assert.equal(pl.data.summary.net, 610, "P&L excludes closing entries");
    assert.equal((await call(T.audit, "GET", "/reports/bs?asOf=2026-03-31")).data.summary.balanced, true);
  });

  await t.test("AP/AR maker-author, settlement and ageing", async () => {
    const M = T.master, A = T.checker;
    await post(M, "/e/pgroup", { code: "PG1", name: "Vendors" });
    await post(M, "/e/tds", { code: "T194C", section: "194C", rate: 2 });
    assert.equal((await post(M, "/e/party", { code: "P1", name: "Vendor One", type: "Vendor", tds: "T194C", pan: "BAD" })).status, 422);
    assert.equal((await post(M, "/e/party", { code: "P1", name: "Vendor One", type: "Vendor", tds: "T194C", pan: "ABCDE1234F", phone: "9876543210" })).status, 201);
    await post(M, "/e/rphead", { code: "H1", name: "Rent payable", type: "Payable", ledger: "RENT" });
    const bill = await post(M, "/e/bill", { type: "Payable", billNo: "INV-1", party: "P1", head: "H1", billDate: "2026-04-01", dueDate: "2026-04-15", amount: 1000 });
    assert.equal(bill.status, 201, bill.text);
    assert.equal(bill.data.tdsAmount, 20);
    assert.equal(bill.data.net, 980);
    assert.equal((await post(M, "/e/bill", { type: "Payable", billNo: "INV-1", party: "P1", head: "H1", billDate: "2026-04-01", dueDate: "2026-04-15", amount: 1 })).status, 409, "duplicate bill");
    const hdr = "billNo,party,head,billDate,dueDate,amount\n";
    assert.equal((await post(M, "/bills/upload", { text: hdr + "RCM-1,P1,H1,2026-04-01,2026-04-20,500\nRCM-2,NOPE,H1,2026-04-01,2026-04-20,500" })).status, 422, "bad row rejects whole file");
    assert.equal((await call(M, "GET", "/e/bill?q=RCM-1")).data.total, 0, "nothing imported on failure");
    const rcm = await post(M, "/bills/upload", { text: hdr + "RCM-1,P1,H1,2026-04-01,2026-04-20,500" });
    assert.equal(rcm.status, 201, rcm.text);
    assert.equal((await call(M, "GET", "/e/bill?q=RCM-1")).data.items[0].rcm, true);
    assert.equal((await post(T.audit, "/bills/upload", { text: hdr + "RCM-9,P1,H1,2026-04-01,2026-04-20,500" })).status, 403);
    assert.equal((await post(M, "/e/settle", { bill: bill.data.code, amount: 10, date: "2026-04-02", mode: "NEFT" })).status, 422, "unauthorised bill");
    assert.equal((await post(M, `/e/bill/${bill.data.id}/authorize`)).status, 403, "maker role is not an author");
    assert.equal((await post(A, `/e/bill/${bill.data.id}/authorize`)).status, 200);
    assert.equal((await post(A, `/e/bill/${bill.data.id}/authorize`)).status, 409);
    const pay = await post(M, "/e/settle", { bill: bill.data.code, amount: 500, date: "2026-04-02", mode: "Cheque", chequeNo: "55" });
    assert.equal(pay.status, 201, pay.text);
    assert.equal((await post(M, "/e/settle", { bill: bill.data.code, amount: 981, date: "2026-04-02", mode: "NEFT" })).status, 422, "over outstanding");
    assert.equal((await post(A, `/e/settle/${pay.data.id}/authorize`)).status, 200);
    assert.equal((await call(M, "GET", `/e/bill/${bill.data.id}`)).data.settled, 500);
    assert.equal((await post(M, `/e/bill/${bill.data.id}/request-cancel`, { reason: "x" })).status, 409, "settled bill cannot be cancelled");
    const bounce = await post(M, `/e/settle/${pay.data.id}/cheque-status`, { chequeStatus: "Bounced" });
    assert.equal(bounce.status, 200);
    assert.equal((await call(M, "GET", `/e/bill/${bill.data.id}`)).data.settled, 0, "bounce reverses settlement");
    assert.equal((await post(M, `/e/settle/${pay.data.id}/cheque-status`, { chequeStatus: "Bounced" })).status, 409, "no double reversal");
    const ag = await call(A, "GET", "/reports/ageing?asOf=2026-06-20");
    assert.equal(ag.data.rows[0].d90, 980);
    const pe = await call(A, "GET", "/reports/partyexpense");
    assert.equal(pe.data.rows[0].gross, 1000);
    assert.equal((await post(M, `/e/bill/${bill.data.id}/request-cancel`, { reason: "dup" })).status, 200);
    assert.equal((await post(M, `/e/bill/${bill.data.id}/cancel-approve`)).status, 403);
    assert.equal((await post(A, `/e/bill/${bill.data.id}/cancel-approve`)).data.status, "Cancelled");
  });

  await t.test("fixed assets: purchase, depreciation, transfer, sale", async () => {
    const M = T.master;
    await post(M, "/e/group", { code: "G-FA", name: "Fixed", type: "Asset" });
    await post(M, "/e/ledger", { code: "FA", name: "Furniture", group: "G-FA" });
    await post(M, "/e/ledger", { code: "ACCDEP", name: "Acc Dep", group: "G-FA" });
    await post(M, "/e/ledger", { code: "DEPEXP", name: "Dep Exp", group: "G-EXP" });
    await post(M, "/e/facat", { code: "FC", name: "Furniture", kind: "Tangible" });
    await post(M, "/e/fablock", { code: "B1", name: "Block", method: "SLM", rate: 12 });
    assert.equal((await post(M, "/e/faacct", { code: "FAA", name: "FA acct", assetLedger: "FA", accDepLedger: "ACCDEP", depExpLedger: "DEPEXP" })).status, 201);
    // year 2 setup
    await post(M, "/e/year", { code: "FY2", start: "2026-04-01", end: "2027-03-31" });
    const per = await post(M, "/e/period", { year: "FY2", month: "April" });
    assert.equal(per.status, 201);
    const asset = await post(M, "/e/faasset", { code: "A1", name: "Desk", category: "FC", account: "FAA", block: "B1", purchaseDate: "2026-04-02", cost: 12000, salvage: 0, location: "HO", offsetLedger: "CASH" });
    assert.equal(asset.status, 201, asset.text);
    assert.ok(asset.data.voucherNo);
    const dep = await post(M, "/depreciation", { period: per.data.code });
    assert.equal(dep.data.created, 1);
    assert.equal(dep.data.vouchers.length, 1);
    const dep2 = await post(M, "/depreciation", { period: per.data.code });
    assert.equal(dep2.data.created, 0, "idempotent");
    const reg = await call(T.audit, "GET", "/reports/faregister");
    assert.equal(reg.data.rows[0].accumulated, 120);
    assert.equal(reg.data.rows[0].wdv, 11880);
    assert.equal((await post(M, "/e/fatransfer", { asset: "A1", date: "2026-04-20", toLocation: "HO" })).status, 422, "same location");
    assert.equal((await post(M, "/e/fatransfer", { asset: "A1", date: "2026-04-20", toLocation: "Branch" })).status, 201);
    const sale = await post(M, "/e/fasale", { asset: "A1", date: "2026-04-25", saleValue: 11000 });
    assert.equal(sale.data.gainLoss, -880);
    assert.equal((await post(M, "/e/fasale", { asset: "A1", date: "2026-04-26", saleValue: 1 })).status, 422, "already sold");
  });

  await t.test("bank reconciliation", async () => {
    const M = T.master;
    const stmt = "date,description,chequeNo,debit,credit\n2026-04-05,Deposit,,0,700\n2026-04-06,Cheque,777,50,0\n2026-04-07,Unknown,,25,0\n";
    assert.equal((await post(M, "/recon/upload/bankstmt", { bank: "CASH", text: stmt })).status, 422, "not a bank ledger");
    assert.equal((await post(M, "/recon/upload/bankstmt", { bank: "BANK", text: "date,debit,credit\n2026-04-05,5,5\n" })).status, 422);
    const up = await post(M, "/recon/upload/bankstmt", { bank: "BANK", text: stmt });
    assert.equal(up.data.created, 3);
    assert.equal((await post(M, "/recon/upload/bankstmt", { bank: "BANK", text: stmt })).data.skipped, 3, "re-upload skipped");
    const mkV = async (date, lines, chequeNo) => { const v = await post(M, "/vouchers", { date, narration: "bank", type: "Journal", chequeNo, lines }); assert.equal(v.status, 201, v.text); assert.equal((await post(T.checker, `/vouchers/${v.data.voucherNo}/approve`)).status, 200); return v.data; };
    // FY2 April is open; FY1 closed
    const dv = await mkV("2026-04-05", [{ ledger: "BANK", debit: 700 }, { ledger: "CAP", credit: 700 }]);
    await mkV("2026-04-07", [{ ledger: "RENT", debit: 50 }, { ledger: "BANK", credit: 50 }], "777");
    const auto = await post(M, "/recon/auto", { bank: "BANK", toleranceDays: 3 });
    assert.equal(auto.data.matched, 2);
    assert.equal(auto.data.unmatched, 1);
    const lists = await call(M, "GET", "/recon/lists?bank=BANK&source=book");
    assert.equal(lists.data.statements.length, 1);
    assert.equal((await post(M, "/recon/match", { statement: lists.data.statements[0].code, source: "book", reference: "JV-000000:5f" })).status, 400);
    const brs = await call(T.audit, "GET", "/reports/brs?bank=BANK&asOf=2026-04-30");
    assert.equal(brs.data.summary.bookBalance, 650);
    assert.equal(brs.data.summary.derivedBankBalance, 625);
    const stmtCode = (await call(M, "GET", "/e/bankstmt?q=Deposit")).data.items[0].code;
    assert.equal((await post(M, "/recon/unmatch", { statement: stmtCode })).status, 200);
    assert.equal((await post(M, "/recon/unmatch", { statement: stmtCode })).status, 409);
    const book = (await call(M, "GET", "/recon/lists?bank=BANK")).data.entries.find((e) => e.voucherNo === dv.voucherNo);
    assert.ok(book, "unmatched book entry is available again");
    assert.equal((await post(M, "/recon/match", { statement: stmtCode, source: "book", reference: book.ref })).status, 200);
    assert.equal((await post(M, "/recon/match", { statement: stmtCode, source: "book", reference: book.ref })).status, 409, "already matched");
    assert.equal((await call(T.audit, "GET", "/reports/bankrecon")).status, 200);
  });

  await t.test("persistence, dashboard, audit, unknown inputs", async () => {
    const d = await call(T.audit, "GET", "/dashboard");
    assert.equal(d.status, 200);
    assert.ok(d.data.postedVouchers >= 3);
    assert.ok(Array.isArray(d.data.recent));
    assert.equal((await call(T.audit, "GET", "/reports/nonsense")).status, 404);
    assert.equal((await call(T.audit, "GET", "/reports/dump?dataset=audit")).status, 200);
    assert.equal((await call(T.audit, "GET", "/reports/dump?dataset=users")).status, 400);
    const x = await call(T.audit, "GET", "/vouchers/export.csv");
    assert.equal(x.status, 200);
    // data is in MongoDB (survives a fresh model read)
    const GlVoucher = require("../models/GlVoucher");
    assert.ok((await GlVoucher.countDocuments({ status: "Approved" })) >= 3);
  });
});
