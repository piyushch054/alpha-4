// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { makeProductJourneysScript } from "@/lib/workflow-product-journeys";
import { workflowListToolkitScript } from "@/lib/workflow-list-toolkit";

const read = (path) => readFileSync(resolve(process.cwd(), "src/lib", path), "utf8");

describe("product journeys", () => {
  it("exposes connected product journeys, including MSME, without removing the legacy MSME workflow", () => {
    const config = read("workspace-config.js");
    for (const view of ["journeyTwoWheeler", "journeyMSME", "journeySolar", "journeyLAP", "journeyTractor"]) {
      expect(config).toContain(view);
      expect(read("dashboard-data.js")).toContain(view);
      expect(read("workflow-lifecycle.js")).toContain(view);
    }
    expect(config).toContain("msmeFlow");
  });

  it("routes the IMD menu to an actionable queue and migrates BDM page access", () => {
    const lifecycle = read("workflow-lifecycle.js");
    expect(lifecycle).toContain("if (!id) return renderIMDQueue()");
    expect(lifecycle).toContain("const isImdWork = stage === 'imd' || pastImdStage");
    expect(lifecycle).toContain("nfOpenLifecycleIMD");
    expect(lifecycle).toContain("navTo('newApplication', a.product)");
    expect(lifecycle).toContain("a.workflow?.stage === 'IMD Pending'");
    expect(lifecycle).toContain("window.nfUseDemoIMDReference");
    expect(lifecycle).toContain("window.nfSendToCredit");
    expect(lifecycle).toContain("Verified · Awaiting credit");
    expect(lifecycle).toContain("function ensureDemoIMDTransaction(a)");
    expect(lifecycle).toContain("const existingApplicationIds = new Set(applications.map(application => application.id))");
    expect(lifecycle).toContain("applications.find(application => !existingApplicationIds.has(application.id))");

    const access = read("workflow-access-control.js");
    expect(access).toContain("bdm-msme-imd-workbench-v2");
    expect(access).toContain("r.pages.journeyMSME = true");
    expect(access).toContain("r.pages.imd = true");
  });

  it("loads persisted BDM IMD cases and awaits server-backed handoff and actions", () => {
    const lifecycle = read("workflow-lifecycle.js");
    const applicant = read("workflow-applicant.js");
    const pd = read("workflow-pd.js");
    expect(lifecycle).toContain("window.nfWorkflowApi('/applications/imd-queue')");
    expect(lifecycle).toContain("function applyServerIMDRecord(record)");
    expect(lifecycle).toContain("'/imd-reference','POST'");
    expect(lifecycle).toContain("'/verify-imd','POST'");
    expect(lifecycle).toContain("'/send-to-credit','POST'");
    expect(lifecycle).toContain("await window.nfSendLosToBdm(a)");
    expect(applicant).toContain("await submit.apply(this,arguments)");
    expect(pd).toContain("window.nfSendLosToBdm = async app =>");
  });

  it("gates underwriting approval on visible verification results without rechecking stale upstream flags", () => {
    const lifecycle = read("workflow-lifecycle.js");
    const decision = lifecycle.slice(
      lifecycle.indexOf("const baseUWDecision = uwDecision;"),
      lifecycle.indexOf("const baseOps = renderOperations;"),
    );
    expect(decision).toContain("a.workflow.technicalStatus !== 'Completed'");
    expect(decision).toContain("a.workflow.legalStatus !== 'Completed'");
    expect(decision).toContain("v7RCU[id]?.status !== 'Clear'");
    expect(decision).not.toContain("a.lifecycle.imd?.status !== 'Verified'");
    expect(decision).not.toContain("a.lifecycle.parallel?.credit !== 'Approved'");
    expect(decision).toContain("a.lifecycle.parallel = { ...(a.lifecycle.parallel || {}), credit:'Approved' }");
    expect(decision).toContain("a.workflow.creditCrossCheck = true");
  });

  it("keeps managed Operations Review cases out of Active Loan controls and synthetic PDD completion", () => {
    const lifecycle = read("workflow-lifecycle.js");
    expect(lifecycle).toContain("a.status === 'Operations Review'");
    expect(lifecycle).toContain("Open Operations Checklist →");
    expect(lifecycle).toContain("const stages = ['Sales/Predeal','IMD Pending','Credit Review','CAM Allocation','CAM Sheet','Underwriting','Operations Review','Sanction Review','Sanctioned','Disbursement','Active Loan']");
    expect(lifecycle).toContain("pdd.items.forEach(item => { item.status = 'Pending'; });");
    expect(lifecycle).toContain("pdd.vault = 'Not Stored';");
  });

  it("places BDM IMD and BSA verification before Credit Review and blocks unverified downstream actions", () => {
    const lifecycle = read("workflow-lifecycle.js");
    const app = readFileSync(resolve(process.cwd(), "public/workflow/app.js"), "utf8");
    expect(lifecycle).toContain("const stages = ['Sales/Predeal','IMD Pending','Credit Review'");
    expect(lifecycle).toContain("BDM must complete IMD & BSA verification here before this application enters Credit Review.");
    expect(lifecycle).toContain("!requireVerifiedIMD(a, 'Credit Review or any later workflow stage')");
    expect(lifecycle).toContain("if (!requireVerifiedIMD(a, 'technical review')) return;");
    expect(lifecycle).toContain("if (!requireVerifiedIMD(a, 'underwriting')) return;");
    expect(lifecycle).toContain("function imdGateSatisfied(a)");
    expect(lifecycle).toContain("const pastCreditReview = ['CAM Allocation','CAM Sheet','Underwriting','Operations Review','Sanction Review','Sanctioned','Disbursement','Active Loan'].includes(a?.status)");
    expect(lifecycle).toContain("window.nfReturnToLifecycleIMD");
    expect(lifecycle).toContain("'/return-to-imd','POST'");
    expect(lifecycle).toContain("Complete LOS before BDM IMD & BSA handoff");
    expect(lifecycle).toContain("const baseRenderSanction = renderSanction;");
    expect(lifecycle).toContain("Array.from(document.querySelectorAll('#content tbody tr')).forEach(row => {");
    expect(lifecycle).toContain("This case is not currently in Sanction Review.");
    expect(lifecycle).toContain("if (a.status !== 'Sanction Review')");
    expect(app).toContain('"Sales/Predeal", "IMD Pending", "Credit Review"');
    expect(app).toContain('st === "IMD Pending" ? "IMD & BSA" : st');
  });

  it("validates and completes sanction form submission without failing to render its queue", () => {
    const appSource = readFileSync(resolve(process.cwd(), "public/workflow/app.js"), "utf8");
    const openCode = appSource.slice(
      appSource.indexOf("function openSanction(id)"),
      appSource.indexOf("function readSanctionTerms()"),
    );
    const termsCode = appSource.slice(
      appSource.indexOf("function readSanctionTerms()"),
      appSource.indexOf("function renderTaskSLA()"),
    );
    const inputValues = {
      "#sanAmount":"250000",
      "#sanRoi":"12.5",
      "#sanTenure":"24",
      "#sanPF":"2",
      "#sanValidity":"30 days",
      "#sanRep":"E-Nach",
      "#sanCP":"Complete KYC",
      "#sanCS":"Submit updated insurance",
    };
    const app = { status:"Sanction Review", workflow:{}, browserLocalOnly:true };
    const sanction = {
      amount:200000,
      roi:12,
      tenure:24,
      version:1,
      status:"Draft",
      conditionsPrecedent:"<KYC & docs>",
      conditionsSubsequent:"Insurance",
    };
    const messages = [];
    let rendered = 0;
    let modalContent = "";
    const open = new Function(
      "getApp", "v7Sanction", "showModal", "f", "losEscapeHtml", "isDemoWorkflowCase",
      `${openCode}; return openSanction;`,
    )(
      () => app,
      { caseId:sanction },
      (_title, content) => { modalContent = content; },
      (label, input) => `<label>${label}${input}</label>`,
      value => String(value).replace(/[&<>"']/g, char => ({
        "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;",
      })[char]),
      value => value?.browserLocalOnly === true || value?.pdDemoBypass === true ||
        value?.demoMandatoryBypass === true || value?.serverDraft?.pdDemoBypass === true,
    );
    const handlers = new Function(
      "$", "showToast", "getApp", "v7Sanction", "persistAuditV7", "closeModal", "renderSanction", "money", "isDemoWorkflowCase",
      `${termsCode}; return { generateSanction, reviseSanction };`,
    )(
      selector => ({ value:inputValues[selector] }),
      message => messages.push(message),
      () => app,
      { caseId:sanction },
      () => {},
      () => {},
      () => { rendered += 1; },
      amount => String(amount),
      value => value?.browserLocalOnly === true || value?.pdDemoBypass === true ||
        value?.demoMandatoryBypass === true || value?.serverDraft?.pdDemoBypass === true,
    );

    open("caseId");
    expect(modalContent).toContain("Conditions Precedent");
    expect(modalContent).toContain("Conditions Subsequent");
    expect(modalContent).toContain("&lt;KYC &amp; docs&gt;");

    handlers.reviseSanction("caseId");
    expect(sanction).toMatchObject({ version:2, status:"Generated", accepted:false });
    expect(rendered).toBe(1);

    handlers.generateSanction("caseId");
    expect(app.status).toBe("Sanctioned");
    expect(app.workflow.eSignStatus).toBe("Pending");
    expect(sanction).toMatchObject({
      amount:250000,
      roi:12.5,
      tenure:24,
      status:"Accepted",
      accepted:true,
      demoOnly:true,
      acceptanceMode:"Synthetic demo only — no real customer action",
    });
    expect(rendered).toBe(2);

    inputValues["#sanAmount"] = "0";
    handlers.generateSanction("caseId");
    expect(messages).toContain("Enter a valid whole-rupee sanction amount.");
    expect(rendered).toBe(2);
  });

  it("lets Central Operations mark eSign complete only through the explicit demo confirmation", () => {
    const lifecycle = read("workflow-lifecycle.js");
    expect(lifecycle).toContain("id=\"demoESignConfirmation\"");
    expect(lifecycle).toContain("Treat eSign as complete for this demo");
    expect(lifecycle).toContain("No real customer signature or electronic execution will occur.");
    expect(lifecycle).not.toContain("managed(a) && a.browserLocalOnly === true && a.workflow.eSignStatus !== 'Completed'");
    const postSanctionCode = lifecycle.slice(
      lifecycle.indexOf("const baseOpenPostSanction = openPostSanction;"),
      lifecycle.indexOf("const baseOpenSanction = openSanction;"),
    );
    const handlerCode = lifecycle.slice(
      lifecycle.indexOf("window.nfCompleteDemoESign = function(id, checked)"),
      lifecycle.indexOf("const baseFinalDisburse = finalDisburse;"),
    );
    const app = {
      id:"demo-case",
      lifecycleManaged:true,
      browserLocalOnly:false,
      pdDemoBypass:true,
      status:"Sanctioned",
      lifecycle:{sanction:{accepted:true}},
      workflow:{doChecklist:"Completed",eSignStatus:"Pending"},
    };
    const auditEvents = [];
    const modal = { markup:"", listener:null };
    let openCount = 0;
    const body = {
      insertAdjacentHTML:(_position, html) => { modal.markup += html; },
      querySelector:() => ({ addEventListener:(_type, listener) => { modal.listener = listener; } }),
    };
    const footer = {
      querySelectorAll:() => [],
      insertAdjacentHTML:() => {},
    };
    const window = {};
    const handlers = new Function(
      "window", "applications", "managed", "denied", "requireLifecycleRole", "v7Sanction", "audit", "openPostSanction", "currentUser", "document", "esc", "isDemoLifecycleCase",
      `${postSanctionCode}\n${handlerCode}; return { openPostSanction, completeDemoESign:window.nfCompleteDemoESign };`,
    )(
      window,
      [app],
      value => value?.lifecycleManaged === true,
      message => auditEvents.push({ denied:message }),
      (_value, roles, action) => roles.includes("Central Operations") && ["open post-sanction eSign","complete demo eSign"].includes(action),
      {},
      (...event) => auditEvents.push(event),
      () => { openCount += 1; },
      { role:"Central Operations" },
      { querySelector:selector => selector === "#modalRoot .modal-body" ? body : footer },
      String,
      value => value?.browserLocalOnly === true || value?.pdDemoBypass === true ||
        value?.demoMandatoryBypass === true || value?.serverDraft?.pdDemoBypass === true,
    );

    handlers.openPostSanction(app.id);
    expect(modal.markup).toContain('id="demoESignConfirmation"');
    expect(modal.markup).toContain("No real customer signature or electronic execution will occur.");
    expect(typeof modal.listener).toBe("function");
    expect(openCount).toBe(1);
    expect(auditEvents).not.toContainEqual(expect.objectContaining({ denied:expect.any(String) }));

    modal.listener({ currentTarget:{ checked:false } });
    expect(app.workflow.eSignStatus).toBe("Pending");
    expect(openCount).toBe(1);

    modal.listener({ currentTarget:{ checked:true } });
    expect(app.workflow).toMatchObject({ eSignStatus:"Completed", eSignDemoOnly:true });
    expect(app.workflow.eSignDemoCompletedAt).toBeTruthy();
    expect(auditEvents).toContainEqual(expect.arrayContaining([
      app.id,
      "eSign Completed · Synthetic Demo Only",
    ]));
    expect(openCount).toBe(2);
    expect(modal.markup).toContain('id="demoESignConfirmation"');
  });

  it("shows completed CAM milestones from the connected lifecycle instead of the stale numeric stage", () => {
    const app = readFileSync(resolve(process.cwd(), "public/workflow/app.js"), "utf8");
    expect(app).toContain("const passedCamAllocation = a.lifecycleManaged && currentLifecycleStage > lifecycleStages.indexOf(\"CAM Allocation\")");
    expect(app).toContain("const passedCamSheet = a.lifecycleManaged && currentLifecycleStage > lifecycleStages.indexOf(\"CAM Sheet\")");
    expect(app).toContain('a.workflow?.camOwner || "Not recorded"');
  });

  it("shows downstream managed cases as underwriting-approved instead of using stale demo status", () => {
    const app = readFileSync(resolve(process.cwd(), "public/workflow/app.js"), "utf8");
    expect(app).toContain("function lifecycleUnderwritingComplete(a)");
    expect(app).not.toContain("a.lifecycle?.parallel?.credit === 'Approved' ||");
    expect(app).toContain("['Operations Review', 'Sanction Review', 'Sanctioned', 'Disbursement', 'Active Loan'].includes(a.status)");
    expect(app).toContain("'post-sanction', 'lms', 'active'");
    expect(app).toContain("function displayedUWStatus(a)");
    expect(app).toContain("v7Status(displayedUWStatus(a))");
    expect(app).toContain("lifecycleUnderwritingComplete(a) ? `<button class=\"more-btn\" onclick=\"navTo('case','${a.id}')\">View Case</button>`");
    expect(app).toContain("<b>${displayedUWStatus(a)}</b><small>${v7UW[id].recommendation}</small>");
  });

  it("places Customer 360 search above the customer list and filters customer records there", () => {
    const app = readFileSync(resolve(process.cwd(), "public/workflow/app.js"), "utf8");
    expect(app).toContain("function setCustomer360SearchMode(active)");
    expect(app).toContain("globalSearch.style.display = active ? 'none' : ''");
    expect(app).toContain('id="customer360Search"');
    expect(app).toContain('id="customer360CustomerList"');
    expect(app).toContain("customer360SearchQuery = event.target.value");
    expect(app).toContain("customer.applicationId, customer.product");
    expect(app).toContain("setCustomer360SearchMode(view === 'customer360')");
    expect(app).toContain("applications.forEach(app => {");
    expect(app).toContain("if (customers.some(customer => customer.applicationId === app.id)) return");
    expect(app).toContain("function getCustomer360Record(id)");
    expect(app).toContain("'CUS-' + application.id === id");
    expect(app).toContain("const c = id ? getCustomer360Record(id) : v7Customers[0]");
  });

  it("lists active connected loan accounts on the repayments page with a direct schedule action", () => {
    const lifecycle = read("workflow-lifecycle.js");
    const repayments = lifecycle.slice(
      lifecycle.indexOf("const baseRenderRepayments = renderRepayments;"),
      lifecycle.indexOf("function penaltyFor(installment)"),
    );
    expect(repayments).toContain("const activeLoans = applications.filter(a => managed(a) && a.lifecycle?.loanAccount)");
    expect(repayments).toContain("<h3>Loan Accounts</h3>");
    expect(repayments).toContain("Sanction Amount");
    expect(repayments).toContain("nfOpenRepaymentSchedule");
    expect(lifecycle).toContain("window.nfOpenRepaymentSchedule = id => renderLoanAccounts(id)");
  });

  it("provides demo LMS account servicing actions, balanced settlement posting, NOC gates and portfolio reports", () => {
    const lifecycle = read("workflow-lifecycle.js");
    expect(lifecycle).toContain("lmsReports:['Central Operations','CEO','System Admin','CFO']");
    expect(lifecycle).toContain("['lmsReports','LMS Portfolio & Reports','▥']");
    expect(lifecycle).toContain("function recastRemainingSchedule(a, balance)");
    expect(lifecycle).toContain("remaining tenure retained");
    expect(lifecycle).not.toContain("Complete or reverse the part-paid installment before recasting");
    expect(lifecycle).not.toContain("a.lifecycle.schedule.some(item => item.status === 'Part-paid')) return denied");
    expect(lifecycle).not.toContain("item.penaltyAssessed = undefined");
    expect(lifecycle).toContain("a.lifecycle.loanAccount.status = 'Closed'");
    expect(lifecycle).toContain("window.nfOpenLoanStatement");
    expect(lifecycle).toContain("window.nfOpenCollectionNotes");
    expect(lifecycle).toContain("window.nfSaveCollectionNote");
    expect(lifecycle).toContain("data-lms-collection-save=\"' + esc(id) + '\"");
    expect(lifecycle).toContain("document.getElementById('modalRoot')?.addEventListener('click', event =>");
    expect(lifecycle).toContain("window.nfSaveCollectionNote(button.dataset.lmsCollectionSave)");
    expect(lifecycle).toContain("id=\"lmsCollectionFeedback\" role=\"status\" aria-live=\"polite\"");
    expect(lifecycle).toContain("Your current role is not allowed to save collection notes.");
    expect(lifecycle).toContain("id=\"lmsCollectionSave\" class=\"primary-btn\"");
    expect(lifecycle).not.toContain("id=\"lmsCollectionSave\" class=\"primary-btn\" disabled");
    expect(lifecycle).toContain("Enter a note, then click Save Demo Note.");
    expect(lifecycle).toContain("if (!persist())");
    expect(lifecycle).toContain("showToast('Demo collection note saved.')");
    expect(lifecycle).toContain("window.nfConfirmForeclosure");
    expect(lifecycle).toContain("No foreclosure fee is configured in this prototype");
    expect(lifecycle).toContain("window.nfGenerateNOC");
    expect(lifecycle).toContain("fully closed and outstanding is zero");
    expect(lifecycle).toContain("function renderLMSReports()");
    expect(lifecycle).toContain("Delinquency Aging");
    expect(lifecycle).toContain("demo-lms-portfolio.csv");
  });

  it("nests General Ledger under Loan Operations / LMS and grants finance roles the intended pages", () => {
    const lifecycle = read("workflow-lifecycle.js");
    const roles = readFileSync(resolve(process.cwd(), "public/workflow/app.js"), "utf8");
    const workspace = read("workspace-config.js");
    expect(lifecycle).toContain("title.textContent = 'Loan Operations / LMS'");
    expect(lifecycle).toContain("const glItems = glGroup && glGroup.querySelector('.nf-nav-group-items')");
    expect(lifecycle).toContain("view === 'generalLedger' ? glItems");
    expect(lifecycle).toContain("generalLedger:['Central Operations','CEO','System Admin','Operations Checker','Disbursement Officer','Audit Manager','Compliance Manager','Compliance Officer','Accountant','Finance Manager','CFO']");
    expect(lifecycle).toContain("lmsReports:['Central Operations','CEO','System Admin','CFO']");
    expect(roles).toContain('"Accountant": { dept: "Accounts & Finance", level: 1, name: "Accountant", initials: "AC", manager: "Finance Manager" }');
    expect(roles).toContain('"Finance Manager": { dept: "Accounts & Finance", level: 2, name: "Finance Manager", initials: "FM", manager: "CFO" }');
    expect(roles).toContain('"CFO": { dept: "Executive Finance", level: 6, name: "Chief Financial Officer", initials: "CF", manager: "CEO" }');
    expect(workspace).toContain('"Loan Operations / LMS"');
    expect(workspace).toContain('"General Ledger": {');
    expect(workspace).toContain('desc: "Accounts & Finance: accounting, vouchers, reports and bank reconciliation."');
  });

  it("recasts a part-paid installment after principal prepayment without erasing recorded allocations", () => {
    const source = read("workflow-lifecycle.js");
    const recastSource = source.slice(
      source.indexOf("function recastRemainingSchedule(a, balance)"),
      source.indexOf("window.nfOpenPartPrepayment = function(id)", source.indexOf("function recastRemainingSchedule(a, balance)")),
    );
    const recast = new Function("products", recastSource + "; return recastRemainingSchedule;")({
      MSME:{ rate:14 },
    });
    const originalSchedule = [
      { installment:1, amount:26547, principal:13514, interest:13033, paid:22000, principalPaid:8967, interestPaid:13033, penaltyPaid:0, status:"Part-paid" },
      { installment:2, amount:26547, principal:13705, interest:12842, paid:0, principalPaid:0, interestPaid:0, penaltyPaid:0, status:"Upcoming" },
      { installment:3, amount:26547, principal:13899, interest:12648, paid:0, principalPaid:0, interestPaid:0, penaltyPaid:0, status:"Upcoming" },
    ];
    const makeAccount = () => ({
      product:"MSME",
      lifecycle:{ loanTerms:{ roi:14 }, schedule:JSON.parse(JSON.stringify(originalSchedule)) },
    });
    const afterPrepayment = makeAccount();
    expect(recast(afterPrepayment, 909033)).toBe(true);
    expect(afterPrepayment.lifecycle.schedule).toHaveLength(originalSchedule.length);
    expect(afterPrepayment.lifecycle.schedule[0]).toMatchObject({
      status:"Part-paid", paid:22000, principalPaid:8967, interestPaid:13033, penaltyPaid:0,
    });
    expect(afterPrepayment.lifecycle.schedule.reduce((sum, item) => sum + item.principal - item.principalPaid, 0)).toBe(909033);

    const withoutPrepayment = makeAccount();
    recast(withoutPrepayment, 911033);
    expect(afterPrepayment.lifecycle.schedule[1].amount).toBeLessThan(withoutPrepayment.lifecycle.schedule[1].amount);
  });

  it("shows repayment principal, interest and penalty allocations in live LMS account and portfolio views", () => {
    const lifecycle = read("workflow-lifecycle.js");
    expect(lifecycle).toContain("totals.principal += Number(payment.principal || 0)");
    expect(lifecycle).toContain("due.interestPaid = (due.interestPaid || 0) + interestAllocated");
    expect(lifecycle).toContain("a.lifecycle.loanAccount.outstanding = Math.max(0, a.lifecycle.loanAccount.outstanding - principalAllocated)");
    expect(lifecycle).toContain("<th>Paid principal</th><th>Paid interest</th><th>Paid penalty</th>");
    expect(lifecycle).toContain("<span>Interest collected</span>");
    expect(lifecycle).toContain("Principal received");
    expect(lifecycle).toContain("Repayment allocation: overdue penalty first, then installment interest, then principal.");
    expect(lifecycle).toContain("'Principal Received','Interest Collected','Penalty Collected'");
    expect(lifecycle).toContain("addLedgerEntries(a, reference, 'Repayment', ledgerEntries)");
  });

  it("saves demo collection notes to browser storage and keeps the modal open if persistence fails", () => {
    const source = read("workflow-lifecycle.js");
    const saveHandler = source.slice(
      source.indexOf("window.nfSaveCollectionNote = function(id) {"),
      source.indexOf("document.getElementById('modalRoot')?.addEventListener", source.indexOf("window.nfSaveCollectionNote = function(id) {")),
    );
    const makeHandler = ({ persisted = true, noteText = "2000 interest received" } = {}) => {
      const app = { id:"SKF-MS-7128590", lifecycle:{ loanAccount:{}, collectionNotes:[] } };
      const state = { events:[] };
      const calls = [];
      const window = {};
      const handler = new Function(
        "window", "lmsAccount", "requireLifecycleRole", "denied", "document",
        "currentUser", "state", "persist", "closeModal", "showToast", "renderLoanAccounts",
        saveHandler + "; return window.nfSaveCollectionNote;",
      )(
        window,
        () => app,
        () => true,
        (message) => calls.push(["denied", message]),
        { getElementById: (id) => ({ value: id === "lmsCollectionNote" ? noteText : "Customer reached" }) },
        { name:"CEO User", role:"CEO" },
        state,
        () => { calls.push(["persist"]); return persisted; },
        () => calls.push(["close"]),
        (message) => calls.push(["toast", message]),
        (id) => calls.push(["render", id]),
      );
      return { handler, app, state, calls };
    };

    const saved = makeHandler();
    saved.handler("SKF-MS-7128590");
    expect(saved.app.lifecycle.collectionNotes).toHaveLength(1);
    expect(saved.app.lifecycle.collectionNotes[0]).toMatchObject({ note:"2000 interest received", outcome:"Customer reached", by:"CEO User" });
    expect(saved.state.events[0].action).toBe("Demo Collection Note Recorded");
    expect(saved.calls).toContainEqual(["toast", "Demo collection note saved."]);
    expect(saved.calls).toContainEqual(["render", "SKF-MS-7128590"]);

    const failed = makeHandler({ persisted:false });
    failed.handler("SKF-MS-7128590");
    expect(failed.app.lifecycle.collectionNotes).toHaveLength(0);
    expect(failed.state.events).toHaveLength(0);
    expect(failed.calls).not.toContainEqual(["close"]);
  });

  it("delegates Save Demo Note clicks from the persistent modal root to the handler", () => {
    const source = read("workflow-lifecycle.js");
    const start = source.indexOf("document.getElementById('modalRoot')?.addEventListener('click', event =>");
    const end = source.indexOf("\n  function renderLMSReports()", start);
    const delegatedHandler = source.slice(start, end);
    const registered = {};
    const calls = [];
    const button = { dataset:{ lmsCollectionSave:"SKF-MS-7128590" } };
    new Function(
      "document", "window",
      delegatedHandler + ";",
    )(
      { getElementById: id => id === "modalRoot" ? { addEventListener:(type, handler) => { registered[type] = handler; } } : null },
      { nfSaveCollectionNote: id => calls.push(id) },
    );
    registered.click({ target:{ closest: selector => selector === "[data-lms-collection-save]" ? button : null } });
    expect(calls).toEqual(["SKF-MS-7128590"]);
  });

  it("does not disable the explicitly allowed demo-note save action for CEO read-only screens", async () => {
    document.body.innerHTML = '<div id="modalRoot"><button id="allowed" data-nlt-allow="1">Save Demo Note</button><button id="blocked">Save Application</button></div>';
    const script = workflowListToolkitScript.replace(/^<script>/, "").replace(/<\/script>$/, "");
    new Function("document", "window", "currentUser", "showToast", "MutationObserver", script)(
      document,
      window,
      { role:"CEO" },
      () => {},
      MutationObserver,
    );
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(document.getElementById("allowed").disabled).toBe(false);
    expect(document.getElementById("blocked").disabled).toBe(true);
  });

  it("keeps missing IMD verification visible to the BDM after a case has moved past the IMD stage", () => {
    const lifecycle = read("workflow-lifecycle.js");
    expect(lifecycle).toContain("const recoverableStages = ['credit','technical','legal','underwriting','operations','sanction']");
    expect(lifecycle).toContain("const recoverableStatuses = ['Credit Review','CAM Allocation','CAM Sheet','Underwriting','Operations Review','Sanction Review','Sanctioned','Disbursement','Active Loan']");
    expect(lifecycle).toContain("const presentInServerQueue = stage !== 'imd' || !a.serverPersisted || !serverIMDQueueLoaded || serverIMDQueueIds.has(a.id)");
    expect(lifecycle).toContain("This server-backed application has already moved past the IMD stage");
    expect(lifecycle).toContain("function normalizePastDueLocalIMD(a)");
    expect(lifecycle).toContain("!a.serverPersisted");
    expect(lifecycle).toContain("a.lifecycle.imd.status = 'Pending'");
    expect(lifecycle).toContain("Open IMD & BSA Verification →");
    expect(lifecycle).toContain("payment.status = payment.status || 'Pending'");
  });

  it("reconciles a missing credit flag for an already-approved Operations Review case before DO checklist submission", () => {
    const lifecycle = read("workflow-lifecycle.js");
    const submit = lifecycle.slice(
      lifecycle.indexOf("submitDOChecklist = function(id, forceGood, sourceButton)"),
      lifecycle.indexOf("const baseOpenPostSanction = openPostSanction;"),
    );
    expect(submit).toContain("a.status === 'Operations Review'");
    expect(submit).toContain("a.workflow.ownerRole === 'Disbursement Officer'");
    expect(submit).toContain("v7RCU[id]?.status === 'Clear'");
    expect(submit).toContain("a.lifecycle.parallel = { ...(a.lifecycle.parallel || {}), credit:'Approved' }");
    expect(submit).toContain("a.workflow.technicalStatus === 'Completed'");
    expect(submit).toContain("a.workflow.legalStatus === 'Completed'");
    expect(submit).toContain("const checklistModal = sourceButton?.closest('#modalRoot .modal') || document.querySelector('#modalRoot .modal')");
    expect(submit).toContain("const checklistItems = checklistModal ? [...checklistModal.querySelectorAll('.do-item')] : []");
    expect(submit).toContain("checklistItems.every(item => item.checked)");
    expect(submit).not.toContain("$$('.do-item').every(item => item.checked)");
    const app = readFileSync(resolve(process.cwd(), "public/workflow/app.js"), "utf8");
    expect(app).toContain("submitDOChecklist('${id}',true,this)");
  });

  it("uses accepted sanction terms through Central Operations and disbursement without replacing the requested amount", () => {
    const lifecycle = read("workflow-lifecycle.js");
    const sanction = lifecycle.slice(
      lifecycle.indexOf("function restoreAcceptedSanction(a)"),
      lifecycle.indexOf("let synchronizedCrmData = false"),
    );
    expect(sanction).toContain("event.action === 'Sanction Accepted'");
    expect(sanction).toContain("a.lifecycle.sanction");
    expect(sanction).toContain("a.lifecycle.loanTerms");

    const sanctionFlow = lifecycle.slice(
      lifecycle.indexOf("const baseGenerateSanction = generateSanction;"),
      lifecycle.indexOf("const basePushLMS = pushToLMS;"),
    );
    expect(sanctionFlow).toContain("amount:Number(terms.amount)");
    expect(sanctionFlow).toContain("debit:sanctionedAmount");
    expect(sanctionFlow).toContain("demoOnly:terms.demoOnly === true");
    expect(sanctionFlow).toContain("acceptanceMode:terms.acceptanceMode || ''");
    expect(sanctionFlow).not.toContain("a.amount =");
    expect(lifecycle).toContain("openingPrincipal:sanctionedAmount");
    expect(lifecycle).toContain("Open Central Operations →");

    const app = readFileSync(resolve(process.cwd(), "public/workflow/app.js"), "utf8");
    expect(app).toContain("function applicationsTable(rows, full = true, showSanctionedAmount = false, showDemoLabels = false)");
    expect(app).toContain('showSanctionedAmount ? "Sanction Amount" : "Loan Amount"');
    expect(app).toContain("Number(a.lifecycle?.sanction?.amount) > 0 ? a.lifecycle.sanction.amount : a.amount");
  });

  it("keeps current CRM applicant details authoritative over stale lifecycle snapshots", () => {
    const lifecycle = read("workflow-lifecycle.js");
    expect(lifecycle).toContain("Object.assign(current, saved, currentApplicantData)");
    expect(lifecycle).toContain("function syncCRMApplicant(a, lead)");
    expect(lifecycle).toContain("function linkedCRMLead(a)");
    expect(lifecycle).toContain("return matches.length === 1 ? matches[0] : null");
    expect(lifecycle).toContain("a.crmLeadId && leads.find(item => item.id === a.crmLeadId)");
    expect(lifecycle).toContain("synchronizedCrmData = syncCRMApplicant(a, lead)");
    expect(lifecycle).toContain("syncCRMApplicant(a, lead);");
  });

  it("preserves demo workflow data when users sign out", () => {
    const app = readFileSync(resolve(process.cwd(), "public/workflow/app.js"), "utf8");
    expect(app).toContain('localStorage.removeItem("namdev-demo-session")');
    expect(app).toContain('localStorage.removeItem("token")');
    expect(app).not.toContain("localStorage.clear()");
    expect(app).toContain("const workflow = a.workflow || {}");
    expect(app).toContain("deviations: Array.isArray(workflow.deviations) ? workflow.deviations : []");
    expect(app).toContain("Send to LOS →");
  });

  it("pins browser-local demo cases above the Applications list and labels their rows", () => {
    const app = readFileSync(resolve(process.cwd(), "public/workflow/app.js"), "utf8");
    expect(app).toContain("function browserLocalDemoShowcase()");
    expect(app).toContain("applications.filter(a => a.browserLocalOnly === true)");
    expect(app).toContain("Pinned demo applications");
    expect(app).toContain("Browser-local demo");
    expect(app).toContain("These cases are saved in this browser only");
    expect(app).toContain("${browserLocalDemoShowcase()}");
    expect(app).toContain("applicationsTable(applications, true, false, true)");
    expect(app).toContain("applicationsTable(rows, true, false, true)");
  });

  it("clearly labels demo-bypassed technical and legal reports without inventing evidence", () => {
    const app = readFileSync(resolve(process.cwd(), "public/workflow/app.js"), "utf8");
    expect(app).toContain("function isDemoWorkflowCase(a)");
    expect(app).toContain("a?.pdDemoBypass === true");
    expect(app).toContain("a?.serverDraft?.pdDemoBypass === true");
    expect(app).toContain("const demoOnly = isDemoWorkflowCase(a);");
    expect(app).toContain("SYNTHETIC DEMO ONLY</b> — No physical visit, GPS capture, valuation");
    expect(app).toContain("DEMO ONLY — no coordinates captured");
    expect(app).toContain('editable && !demoOnly ? "" : "disabled"');
    expect(app).toContain("SYNTHETIC DEMO ONLY</b> — No title documents, encumbrance or litigation searches");
    expect(app).toContain("a.workflow.technicalReport = demoOnly && !report.includes(\"SYNTHETIC DEMO ONLY\")");
    expect(app).toContain("a.workflow.legalReport = demoOnly && !report.includes(\"SYNTHETIC DEMO ONLY\")");
    expect(app).toContain('demoOnly ? "Record Demo Technical Step" : "Complete Verification"');
    expect(app).toContain('demoOnly ? "Record Demo Legal Step" : "Complete Vetting"');
    expect(app).toContain("a.workflow.technicalDemoOnly = demoOnly");
    expect(app).toContain("a.workflow.legalDemoOnly = demoOnly");
    expect(app).toContain("a.workflow.eSignDemoOnly = demoOnly");
    expect(app).toContain("a.workflow.doChecklistDemoOnly = demoOnly");
    expect(app).toContain("a.workflow.centralOpsDemoOnly = demoOnly");
    expect(app).toContain("a.workflow.lmsStatusDemoOnly = demoOnly");
    expect(app).toContain("no bureau query or customer cross-check occurred");
  });

  it("marks demo workflow RCU, underwriting, and sanction decisions as synthetic", () => {
    const app = readFileSync(resolve(process.cwd(), "public/workflow/app.js"), "utf8");
    expect(app).toContain("SYNTHETIC DEMO ONLY</b> — No external identity, negative-list, device or document searches");
    expect(app).toContain("Record Demo RCU Gate");
    expect(app).toContain("SYNTHETIC DEMO ONLY — No real underwriting decision occurred.");
    expect(app).toContain("Record Demo Underwriting Approval");
    expect(app).toContain("SYNTHETIC DEMO ONLY</b> — Terms and acceptance are illustrative.");
    expect(app).toContain("s.acceptanceMode = 'Synthetic demo only — no real customer action'");
    expect(app).toContain("Sanction Accepted${demoOnly ? ' · Synthetic Demo Only' : ''}");
    expect(app).toContain("Checklist items below are illustrative placeholders.");
    expect(app).toContain("Simulate Demo eSign Completion");
    expect(app).toContain("Complete each eSign checklist item before submitting.");
    expect(app).toContain("Simulate Demo Disbursement");
    expect(app).toContain("Synthetic demo disbursement recorded. No funds moved.");
    expect(app).toContain("Simulate Demo LMS Account Creation");
    expect(app).toContain("not a production servicing account");
    expect(app).toContain("conditionsPrecedent:$('#sanCP')?.value || ''");
    expect(app).toContain("conditionsSubsequent:$('#sanCS')?.value || ''");
    expect(app).toContain("processingFeePct:Number($('#sanPF')?.value)");
    expect(app).toContain("function syncActiveApprovalDeviation(a)");
    expect(app).toContain('["Accountant", "Finance Manager", "CFO"].forEach(role =>');
    const lifecycle = readFileSync(resolve(process.cwd(), "src/lib/workflow-lifecycle.js"), "utf8");
    expect(lifecycle).toContain("a.workflow.doChecklistDemoOnly = true");
    expect(lifecycle).toContain("a.workflow.eSignDemoOnly = true");
    expect(lifecycle).toContain("a.lifecycle.disbursementDemoOnly = true");
    expect(lifecycle).toContain("a.workflow.lmsStatusDemoOnly = true");
    expect(lifecycle).toContain("const isDemoLifecycleCase = a =>");
    expect(lifecycle).toContain("a?.pdDemoBypass === true");
    expect(lifecycle).toContain("demoOnly:isDemoLifecycleCase(a)");
    expect(lifecycle).toContain("let relabeledSyntheticLedger = false");
    expect(lifecycle).toContain("if (a.workflow && a.workflow.stage !== a.status)");
    expect(lifecycle).toContain("syncActiveApprovalDeviation(a)");
    expect(lifecycle).toContain("SYNTHETIC DEMO ONLY — not a real servicing account");
    expect(lifecycle).toContain("simulated repayment; no funds moved.");
    expect(lifecycle).toContain("rows.some(isDemoLifecycleCase)");
  });

  it("lets demo-bypassed LOS submissions skip mandatory PD verification", () => {
    const pd = read("workflow-pd.js");
    expect(pd).toContain("wizard.step === 5 && wizard.pdDemoBypass === true");
    expect(pd).toContain("app && wizard.pdDemoBypass !== true");
  });

  it("routes each product entry into CRM and keeps standalone journey history read-only", () => {
    const script = makeProductJourneysScript("/api");
    expect(script).toContain('const API = "/api"');
    for (const view of ["journeyTwoWheeler", "journeySolar", "journeyLAP", "journeyTractor"]) {
      expect(script).toContain(view);
    }
    expect(script).toContain("openCRMNewLead(PJ.product.name)");
    expect(script).toContain("Read-only history");
    expect(script).not.toContain("/steps/");
    expect(script).not.toMatch(/localhost|127\.0\.0\.1/);

    const journeysRoute = readFileSync(resolve(process.cwd(), "../server/routes/journeys.js"), "utf8");
    expect(journeysRoute).toContain("through CRM Lead Capture so consent, OTP, and customer dedupe are completed first.");
    expect(journeysRoute).toContain("Standalone product journeys are read-only.");
    expect(journeysRoute).toContain(", 410)");
  });

  it("starts each product in CRM Lead Capture with its selected product", async () => {
    const views = {
      journeyTwoWheeler:"Two Wheeler",
      journeySolar:"Solar Loan",
      journeyLAP:"LAP",
      journeyTractor:"Tractor Loan",
    };
    for (const [view, product] of Object.entries(views)) {
      const calls = [];
      const content = { innerHTML:"", querySelector:() => null };
      const storage = new Map();
      const script = makeProductJourneysScript("/api").replace(/^<script>/, "").replace(/<\/script>$/, "");
      const startProduct = new Function(
        "window","currentUser","navTo","roleCanView","$","fetch","sessionStorage","showToast","openCRMNewLead",
        script + "; return () => { navTo(" + JSON.stringify(view) + "); window.pjStartLead(); };",
      )(
        { nfCan:() => true },
        { role:"Sales User", name:"Synthetic Sales" },
        () => {},
        () => true,
        selector => selector === "#content" ? content : null,
        async url => ({ ok:true, status:200, json:async() => url.endsWith("/demo-session") ? { token:"demo" } : { data:[] } }),
        { getItem:key => storage.get(key) || null, setItem:(key,value) => storage.set(key,value), removeItem:key => storage.delete(key) },
        () => {},
        selectedProduct => calls.push(selectedProduct),
      );
      startProduct();
      await new Promise(resolvePromise => setTimeout(resolvePromise, 0));
      expect(calls).toEqual([product]);
    }
  });

  it("preserves product-specific LOS details and enforces product economics before Credit", () => {
    const app = readFileSync(resolve(process.cwd(), "public/workflow/app.js"), "utf8");
    const start = app.indexOf("const productDetailFields = {");
    const end = app.indexOf("\nfunction stepLoan()", start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const helpers = new Function(
      "wizard", "window", "showToast", "money",
      app.slice(start, end) + "; return { productAssetBase, saveWizardProductDetails, validateProductEconomics };",
    );
    const scenarios = [
      { product:"Two Wheeler", data:{ onRoadPrice:"100000", requestedAmount:"90000", finalAmount:"90000", finalRate:"14", finalTenure:"24", vehicleMake:"Honda" }, base:100000, limit:90000, detail:"vehicleMake" },
      { product:"Solar Loan", data:{ projectCost:"1000000", subsidy:"100000", requestedAmount:"800000", finalAmount:"800000", finalRate:"12", finalTenure:"60", systemSize:"10" }, base:1000000, limit:800000, detail:"systemSize" },
      { product:"LAP", data:{ marketValue:"10000000", requestedAmount:"6500000", finalAmount:"6500000", finalRate:"13", finalTenure:"120", propertyType:"Residential" }, base:10000000, limit:6500000, detail:"propertyType" },
      { product:"Tractor Loan", data:{ quotationAmount:"1000000", accessories:"0", requestedAmount:"850000", finalAmount:"850000", finalRate:"13", finalTenure:"60", tractorMake:"Mahindra" }, base:1000000, limit:850000, detail:"tractorMake" },
    ];
    for (const scenario of scenarios) {
      const wizard = { product:scenario.product, data:{ ...scenario.data } };
      const toasts = [];
      const saveCalls = [];
      const helpers = helpersFor(wizard, saveCalls, toasts);
      expect(helpers.productAssetBase()).toBe(scenario.base);
      expect(helpers.validateProductEconomics()).toBe(true);
      expect(helpers.saveWizardProductDetails({ id:"synthetic-case", lifecycleManaged:true })).toBe(true);
      expect(saveCalls[0][0]).toBe("synthetic-case");
      expect(saveCalls[0][1]).toHaveProperty(scenario.detail);
      expect(saveCalls[0][1]).not.toHaveProperty("pan");
      wizard.data.finalAmount = String(scenario.limit + 1);
      expect(helpers.validateProductEconomics()).toBe(false);
      expect(toasts.at(-1)).toContain("LTV limit");
    }

    function helpersFor(wizard, saveCalls, toasts) {
      return helpers(wizard, {
        nfSaveLifecycleProductDetails:(...args) => { saveCalls.push(args); return true; },
      }, message => toasts.push(message), String);
    }
    expect(app).toContain("productDetailFields[a.product]");
    expect(read("workflow-pd.js")).toContain("productDetails:app.productDetails || {}");
    expect(read("workflow-lifecycle.js")).toContain("window.nfSaveLifecycleProductDetails");
  });

  it("keeps PD demo bypass explicit and records Tractor details for an existing CRM case", () => {
    const pd = read("workflow-pd.js");
    const lifecycle = read("workflow-lifecycle.js");
    const tractor = read("workflow-tractor.js");
    const serverRoute = readFileSync(resolve(process.cwd(), "../server/routes/applications.js"), "utf8");
    expect(pd).toContain("PD not performed — demo bypass");
    expect(pd).toContain("pdDemoBypass:wizard.pdDemoBypass === true");
    expect(pd).toContain("wizard.pdDemoBypass !== true");
    expect(serverRoute).toContain("app.draft?.pdDemoBypass === true");
    expect(serverRoute).toContain("PD not performed; no visit, photo, geotag, PD record, or verification captured.");
    expect(lifecycle).toContain("a.pdDemoBypass = wizard.pdDemoBypass === true && !a.pd");
    expect(tractor).toContain("const target=selected||(applications.length>before?applications[0]:null)");
  });

  it("retains consent, OTP, dedupe, and existing-customer routing at product entry", () => {
    const app = readFileSync(resolve(process.cwd(), "public/workflow/app.js"), "utf8");
    const lifecycle = read("workflow-lifecycle.js");
    expect(app).toContain("productJourneyKey: crm.productPreset || ''");
    expect(app).toContain("const startsSharedLifecycle = !!crm.productPreset");
    expect(app).toContain("existingCustomerMatch:true");
    expect(app).toContain("No actual KYC was performed.");
    expect(lifecycle).toContain("crm.data.dedupeStatus !== 'No Match'");
    expect(lifecycle).toContain("browserLocalOnly:!!lead.productJourneyKey");
    expect(app).toContain("stage:'los', customerId:info.customerId || info.id || info.applicationId || ''");
  });

  it("generates CRM lead IDs unique across CRM leads and linked LOS applications", () => {
    const app = readFileSync(resolve(process.cwd(), "public/workflow/app.js"), "utf8");
    const start = app.indexOf("function nextCRMLeadId()");
    const end = app.indexOf("\nfunction convertCRMToLOS()", start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const now = new Date();
    const prefix = `CRM-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-`;

    const nextCRMLeadId = new Function(
      "crm",
      "applications",
      `${app.slice(start, end)}; return nextCRMLeadId;`,
    )(
      { leads:[{ id:`${prefix}001` }, { id:`${prefix}003` }] },
      [{ crmLeadId:`${prefix}002` }, { lifecycle:{ leadId:`${prefix}004` } }],
    );
    expect(nextCRMLeadId()).toBe(`${prefix}005`);
    expect((app.match(/const id = nextCRMLeadId\(\)/g) || []).length).toBe(2);
  });

  it("is syntactically valid JavaScript", () => {
    const body = makeProductJourneysScript("/api").replace(/^<script>/, "").replace(/<\/script>$/, "");
    expect(() => new Function(body)).not.toThrow();
  });
});
