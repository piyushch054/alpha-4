// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { makeGeneralLedgerScript } from "@/lib/workflow-gl";

const inner = (api = "/api") => makeGeneralLedgerScript(api).replace(/^<script>/, "").replace(/<\/script>$/, "");
const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");
const flush = () => new Promise((r) => setTimeout(r, 20));

const META = {
  menu: [
    { id: "gl", title: "General Ledger", items: [{ id: "dashboard", title: "Dashboard", type: "dashboard" }, { id: "year", title: "Accounting Year Creation", type: "entity", kind: "year" }] },
    { id: "reports", title: "Accounting Reports", items: [{ id: "tb", title: "Trial Balance", type: "report", report: "tb" }] },
  ],
  entities: { year: { label: "Accounting Year", write: "master", fields: [{ n: "code", l: "Year ID", t: "text", r: true, col: true }, { n: "status", l: "Status", t: "select", o: ["Open", "Closed"], ro: true, col: true }] } },
  caps: { master: true, maker: false, checker: false, close: false, view: true },
  user: { id: "u1", name: "Ops", role: "Central Operations" },
  enums: { voucherTypes: ["Journal"], accountTypes: [], months: [], payModes: [] },
};

function boot(handler) {
  document.body.innerHTML = '<div id="content"></div><div id="modalRoot"></div><div id="toast"></div>';
  sessionStorage.setItem("token", "t"); sessionStorage.setItem("pdSessionKey", "Central Operations|Ops");
  const calls = [];
  globalThis.fetch = vi.fn(async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || "GET", auth: init.headers && init.headers.Authorization });
    const out = handler(String(url), init);
    return { ok: out.status ? out.status < 400 : true, status: out.status || 200, json: async () => out.body };
  });
  const g = {
    navTo: vi.fn(),
    currentUser: { role: "Central Operations", name: "Ops" },
    setPage: vi.fn(),
    showToast: vi.fn(),
    showModal: (t, b) => { document.getElementById("modalRoot").innerHTML = "<div class='modal'>" + b + "</div>"; },
    closeModal: () => { document.getElementById("modalRoot").innerHTML = ""; },
    roleCanView: () => true,
  };
  const fn = new Function("g", "with(g){" + inner() + "; return { navTo }; }");
  const res = fn(g);
  return { calls, nav: res.navTo, g };
}

afterEach(() => { sessionStorage.clear(); vi.restoreAllMocks(); });

describe("General Ledger client", () => {
  it("is syntactically valid, same-origin and never persists to browser storage", () => {
    const src = inner();
    expect(() => new Function(src)).not.toThrow();
    expect(src).toContain('const API = "/api"');
    expect(src).not.toMatch(/localhost|127\.0\.0\.1/);
    expect(src).not.toMatch(/localStorage/);
    expect(src).not.toMatch(/console\.log/);
  });

  it("covers every reference screen type through the server-driven menu", () => {
    const src = inner();
    for (const t of ["dashboard", "entity", "voucher", "vapproval", "vreversal", "yearend", "chequeedit", "vupload", "report", "depreciation", "bill", "billcancel", "settle", "chequestatus", "knockoff", "rcmupload", "apdownload", "stmtupload", "autorecon", "manualrecon", "reconupload"]) {
      expect(src).toContain(t + ":");
    }
    for (const r of ["tb", "ledger", "cashbook", "daybook", "dump", "pl", "bs", "bills", "ageing", "partydetails", "partyexpense", "fadep", "faregister", "fadisposal", "famovement", "bankstmt", "stmtreport", "bankrecon", "brs"]) {
      expect(src).toMatch(new RegExp("\\b" + r + ":\\["));
    }
  });

  it("renders the menu and entity list from the API using an authenticated request", async () => {
    const { calls, nav } = boot((url) => {
      if (url.endsWith("/gl/meta")) return { body: { data: META } };
      if (url.includes("/gl/e/year")) return { body: { data: { items: [{ id: "1", code: "FY25", status: "Open" }], total: 1, page: 1, size: 20 } } };
      return { body: { data: {} } };
    });
    nav("generalLedger", "year");
    await flush(); await flush();
    expect(document.body.textContent).toContain("Accounting Year Creation");
    expect(document.body.textContent).toContain("FY25");
    expect(calls.every((c) => c.auth === "Bearer t")).toBe(true);
    expect(calls.some((c) => c.url.startsWith("/api/gl/e/year"))).toBe(true);
  });

  it("shows Access Restricted on a 403 without leaking details", async () => {
    const { nav } = boot(() => ({ status: 403, body: { success: false, message: "Your role is not permitted" } }));
    nav("generalLedger");
    await flush(); await flush();
    expect(document.body.textContent).toContain("Access Restricted");
    expect(document.body.textContent).not.toMatch(/stack|mongo/i);
  });

  it("shows browser-local servicing postings on the GL dashboard without calling them accounting vouchers", async () => {
    window.nfGetLoanLedgerForGL = () => [{
      id: "GL-1", date: "2026-10-12T10:00:00.000Z", applicationId: "SKF-MS-7128590",
      loanId: "LAN-SKF-MS-7128590", account: "Loan Receivable", type: "Loan Disbursement",
      debit: 920000, credit: 0, reference: "SKF-DEAL-2026-08253",
    }, {
      id: "GL-2", date: "2026-10-12T10:00:00.000Z", applicationId: "SKF-MS-7128590",
      loanId: "LAN-SKF-MS-7128590", account: "Bank Disbursement Clearing", type: "Loan Disbursement",
      debit: 0, credit: 920000, reference: "SKF-DEAL-2026-08253",
    }, {
      id: "GL-3", date: "2026-10-12T10:10:00.000Z", applicationId: "SKF-MS-7128590",
      loanId: "LAN-SKF-MS-7128590", account: "Cash / Bank Clearing", type: "Repayment",
      debit: 2000, credit: 0, reference: "PAY-SKF-2000",
    }, {
      id: "GL-4", date: "2026-10-12T10:10:00.000Z", applicationId: "SKF-MS-7128590",
      loanId: "LAN-SKF-MS-7128590", account: "Interest Income", type: "Repayment",
      debit: 0, credit: 2000, reference: "PAY-SKF-2000",
    }];
    const { nav } = boot((url) => {
      if (url.endsWith("/gl/meta")) return { body: { data: META } };
      if (url.endsWith("/gl/dashboard")) return { body: { data: { years: 0, openPeriods: 0, ledgers: 0, groups: 0, pendingVouchers: 0, postedVouchers: 0, pendingBills: 0, unmatchedStatements: 0, recent: [] } } };
      return { body: { data: {} } };
    });
    nav("generalLedger");
    await flush(); await flush();
    expect(document.body.textContent).toContain("Demo loan servicing postings");
    expect(document.body.textContent).toContain("SKF-MS-7128590");
    expect(document.body.textContent).toContain("Loan Receivable");
    expect(document.body.textContent).toContain("9,20,000.00");
    expect(document.body.textContent).toContain("Demo servicing account balances");
    expect(document.body.textContent).toContain("Interest Income");
    expect(document.body.textContent).toContain("2,000.00 Cr");
    expect(document.body.textContent).toContain("PAY-SKF-2000");
    expect(document.body.textContent).toContain("separate from official accounting vouchers");
    expect(document.body.textContent).toContain("Posted vouchers0");
  });

  it("is mounted after the product journeys and gates the view by role", () => {
    expect(read("src/routes/workspace.jsx")).toContain("makeGeneralLedgerScript(");
    const life = read("src/lib/workflow-lifecycle.js");
    expect(life).toMatch(/generalLedger:\[[^\]]*Operations Checker/);
    expect(life).toContain("nfOpenLoanPostings");
  });
});
