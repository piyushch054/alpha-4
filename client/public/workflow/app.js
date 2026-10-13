const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const products = {
  "Two Wheeler": { icon: "🏍", code: "TW", desc: "Dealer-led two-wheeler finance", rate: 14.5, tenure: 36 },
  "MSME": { icon: "🏢", code: "MS", desc: "Business growth & working capital", rate: 17.0, tenure: 48 },
  "LAP": { icon: "🏠", code: "LAP", desc: "Loan against residential/commercial property", rate: 13.25, tenure: 120 },
  "Solar Loan": { icon: "☀", code: "SL", desc: "Rooftop solar financing", rate: 12.5, tenure: 60 },
  "Tractor Loan": { icon: "🚜", code: "TR", desc: "Agri tractor & farm equipment finance", rate: 13.75, tenure: 60 }
};
$("#loginScreen .login-stats strong").textContent = String(Object.keys(products).length);

const docChecklist = [
  { category: "KYC", name: "LIVE PHOTO", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "KYC", name: "PAN CARD", mandatory: "Mandatory", type: "Original", side: "frontRear" },
  { category: "KYC", name: "AADHAR CARD / DL / VOTER ID / PASSPORT", mandatory: "Any One Mandatory", type: "Original", side: "frontRear" },
  { category: "OWNERSHIP DOCUMENTS", name: "ELECTRICITY BILL / AGRI PROOF / PROPERTY PAPER / TELEPHONE BSNL BILL / WATER BILL", mandatory: "Any One Mandatory", type: "Original / Photocopy", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "APPLICATION FORM", mandatory: "Mandatory", type: "Photocopy", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "CAM REPORT", mandatory: "Mandatory", type: "Photocopy", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "FORM 60", mandatory: "Mandatory", type: "Photocopy", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "SANCTION LETTER", mandatory: "Mandatory", type: "Photocopy", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "BANK PROOF", mandatory: "Mandatory", type: "Original / Photocopy", side: "frontRear" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "REPAYMENT INSTRUMENTS", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "NACH", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "FORM 29", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "FORM 30", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "FORM 26", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "FORM 34", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "FORM 35", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "AGREE PAGE 1", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "AGREE PAGE 8", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "AGREE PAGE 9", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "AGREE PAGE 12", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "AGREE PAGE 14", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "AGREE PAGE 15", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "AGREEMENT PAGE 40", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "VALUATION", mandatory: "Mandatory", type: "Photocopy", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "NOC", mandatory: "Mandatory", type: "Photocopy", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "PAYMENT REQUEST LETTER", mandatory: "Mandatory", type: "Original / Photocopy", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "DECLARATION FORM A (DUAL NAME AFFIDAVIT)", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "DECLARATION FORM A (DUAL NAME SIGNATURE)", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "DELIVERY PHOTO", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "LOAN SURAKSHA", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "RENTAL DEED", mandatory: "Mandatory", type: "Original / Photocopy", side: "single" },
  { category: "DISBURSMENT REQUIRED DOCUMENTS", name: "SIGNED SANCTION LETTER", mandatory: "Mandatory", type: "Photocopy", side: "single" },
  { category: "DEALER DOCUMENTS", name: "INVOICE", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DEALER DOCUMENTS", name: "INSURANCE", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DEALER DOCUMENTS", name: "QUOTATION", mandatory: "Mandatory", type: "Original", side: "single" },
  { category: "DEALER DOCUMENTS", name: "DOWN PAYMENT", mandatory: "Mandatory", type: "Original", side: "single" }
];

let applications = [
  { id: "SKF-TW-10482", customer: "Aarav Sharma", mobile: "98290 11820", product: "Two Wheeler", amount: 128000, branch: "Jaipur - VKI", status: "Credit Review", stage: 2, score: 742, docs: 86, created: "02 Oct 2026", owner: "Neha Jain", repayment: "E-Nach" },
  { id: "SKF-MS-10481", customer: "Riya Enterprises", mobile: "94140 77321", product: "MSME", amount: 1250000, branch: "Ajmer Road", status: "CAM Allocation", stage: 3, score: 718, docs: 92, created: "02 Oct 2026", owner: "Mohit Meena", repayment: "Nach" },
  { id: "SKF-LAP-10480", customer: "Vikram Singh", mobile: "99820 31202", product: "LAP", amount: 3500000, branch: "Udaipur", status: "CAM Sheet", stage: 4, score: 768, docs: 100, created: "01 Oct 2026", owner: "Kavita Rao", repayment: "E-Nach" },
  { id: "SKF-SL-10479", customer: "Sunrise Textiles", mobile: "97840 88440", product: "Solar Loan", amount: 880000, branch: "Bhilwara", status: "Sanctioned", stage: 5, score: 731, docs: 96, created: "01 Oct 2026", owner: "Rahul Saini", repayment: "PDC" },
  { id: "SKF-TW-10478", customer: "Meena Kumari", mobile: "90018 22730", product: "Two Wheeler", amount: 94000, branch: "Kota", status: "Disbursement", stage: 6, score: 704, docs: 100, created: "30 Sep 2026", owner: "Alok Sharma", repayment: "E-Nach" },
  { id: "SKF-MS-10477", customer: "Jay Ambey Foods", mobile: "92144 19003", product: "MSME", amount: 700000, branch: "Sikar", status: "Active Loan", stage: 7, score: 756, docs: 100, created: "30 Sep 2026", owner: "Nitin Joshi", repayment: "Nach" },
  { id: "SKF-TW-10476", customer: "Rohit Verma", mobile: "99281 66338", product: "Two Wheeler", amount: 116000, branch: "Jaipur - Sanganer", status: "Sales/Predeal", stage: 1, score: 690, docs: 62, created: "29 Sep 2026", owner: "Neha Jain", repayment: "NPDC" },
  { id: "SKF-LAP-10475", customer: "Karan Buildcon", mobile: "98292 44118", product: "LAP", amount: 4800000, branch: "Jodhpur", status: "Draft", stage: 0, score: 0, docs: 34, created: "29 Sep 2026", owner: "Kavita Rao", repayment: "—" }
];

let crm = makeCRMState();
let wizard = { step: 0, product: "Two Wheeler", selectedApplicationId: null, data: {}, docs: {}, coType: "Co-applicant" };
let losListState = { query: "", status: "All Status", column: "all", crmPage: 1, applicationsPage: 1, crmPageSize: 5, applicationsPageSize: 5 };
let msme = makeMSMEState();
const steps = ["Product & Source", "Applicant", "Co-applicant / Guarantor", "Documents & KYC", "Asset / Collateral", "PD — Personal Discussion", "Loan & Repayment", "IMD & BSA", "Review & Submit"];
const lifecycle = ["Sales/Predeal", "IMD Pending", "Credit Review", "CAM Allocation", "CAM Sheet", "Sanctioned", "Disbursement", "Active Loan"];
const vehicleMakes = ["Hero", "Honda", "TVS", "Bajaj", "Yamaha", "Suzuki", "Royal Enfield", "Ather", "Ola Electric", "Jawa", "KTM", "Vida", "Ampere"];

Object.assign(globalThis, {
  products,
  applications,
  crm,
  wizard,
  losListState,
  msme,
  steps,
  lifecycle
});

function money(n) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n || 0)); }
function emi(p, annual, months) {
  p = Number(p || 0); annual = Number(annual || 0); months = Number(months || 0);
  if (!p || !months) return 0;
  const r = annual / 1200;
  if (!r) return p / months;
  return p * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
}
function initials(name) { return name.split(/\s+/).slice(0, 2).map(x => x[0]).join("").toUpperCase(); }
function statusClass(status) {
  if (["Active Loan", "Sanctioned"].includes(status)) return "green";
  if (["Disbursement", "CAM Allocation"].includes(status)) return "amber";
  if (["Credit Review", "CAM Sheet"].includes(status)) return "blue";
  if (["Sales/Predeal"].includes(status)) return "purple";
  if (status === "Draft") return "gray";
  return "gray";
}
function showToast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2400); }

let dashboardProduct = "All";
let dashboardPeriod = "MTD";
let activeCaseTab = "Overview";

function escapeCsv(v) { const x = String(v ?? ""); return /[",\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x }
function losEscapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) }
function downloadText(filename, text, mime = "text/plain") {
  const blob = new Blob([text], { type: mime }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 500); showToast(`${filename} downloaded`);
}
function rowsToCsv(headers, rows) { return [headers.map(escapeCsv).join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n') }
function exportApplications() { downloadText('sk-finance-applications.csv', rowsToCsv(['Application', 'Customer', 'Mobile', 'Product', 'Amount', 'Branch', 'Status', 'Docs %', 'Owner', 'Repayment'], applications.map(a => [a.id, a.customer, a.mobile, a.product, a.amount, a.branch, a.status, a.docs, a.owner, a.repayment])), 'text/csv') }
function exportCRMLeads() { downloadText('sk-finance-crm-leads.csv', rowsToCsv(['Lead ID', 'Customer', 'Business', 'Mobile', 'Product', 'Requested Amount', 'Source', 'Branch', 'Owner', 'Status', 'Priority', 'Next Action'], crm.leads.map(l => [l.id, l.name, l.business, l.mobile, l.product, l.amount, l.source, l.branch, l.owner, l.status, l.temperature, l.next])), 'text/csv') }
function exportDocumentChecklist() { downloadText('sk-finance-document-checklist.csv', rowsToCsv(['Category', 'Document', 'Requirement', 'Copy Type'], docChecklist.map(d => [d.category, d.name, d.mandatory, d.type])), 'text/csv') }
function exportMIS() {
  const data = [['Metric', 'Value'], ['Applications', applications.length], ['Pipeline', applications.reduce((x, a) => x + a.amount, 0)], ['Credit Pending', applications.filter(a => a.status === 'Credit Review').length], ['Ready to Disburse', applications.filter(a => ['Sanctioned', 'Disbursement'].includes(a.status)).length], ['Open CRM Leads', crm.leads.filter(l => !l.converted).length]];
  downloadText('sk-finance-mis.csv', data.map(r => r.map(escapeCsv).join(',')).join('\n'), 'text/csv');
}
function showForgotPassword() { showModal('Reset Password', `<p class="muted" style="font-size:10px;line-height:1.6">Enter your registered email / employee ID. This demo will create a reset request.</p><label>Email / Employee ID<input id="resetUser" value="${$('#loginEmail')?.value || ''}"></label>`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="closeModal();showToast('Password reset request created')">Send Reset Request</button>`) }
function showNotifications() { showModal('Notifications', `<div class="activity-list">${activity('!', '2 applications need documents', 'Document completeness below 70%')}${activity('⇄', '1 CAM allocation pending', 'Assign within SLA')}${activity('◷', 'CRM follow-ups due today', 'Open CRM to action leads')}${activity('₹', '1 case ready for disbursement', 'Sanction completed')}</div>`, `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="primary-btn" onclick="closeModal();navTo('crm')">Open CRM</button>`) }
function showProfile() { showModal('User Profile', `<div class="modal-kv"><div><span>Name</span><b>Credit Manager</b></div><div><span>Role</span><b>${$('#loginRole')?.value || 'Credit User'}</b></div><div><span>Region</span><b>Rajasthan</b></div><div><span>Workspace</span><b>Namdev Finvest Lending</b></div></div><div style="height:12px"></div><label>Demo Role<select id="profileRole"><option>CRM User</option><option>Sales User</option><option selected>Credit User</option><option>Appraiser</option><option>Underwriter</option></select></label>`, `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="primary-btn" onclick="showToast('Profile preference saved');closeModal()">Save</button>`) }
function openAdvancedFilters() { showModal('Application Filters', `<div class="source-grid" style="grid-template-columns:1fr 1fr">${f('Branch', `<select id="advBranch"><option>All Branches</option>${[...new Set(applications.map(a => a.branch))].map(x => `<option>${x}</option>`).join('')}</select>`)}${f('Minimum Docs %', `<input id="advDocs" type="number" value="0" min="0" max="100">`)}${f('From Date', `<input id="advFrom" type="date">`)}${f('To Date', `<input id="advTo" type="date">`)}</div>`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="applyAdvancedFilters()">Apply Filters</button>`) }
function applyAdvancedFilters() { const branch = $('#advBranch').value, docs = Number($('#advDocs').value || 0); const rows = applications.filter(a => (branch === 'All Branches' || a.branch === branch) && a.docs >= docs); closeModal(); const el = $('#appTable'); if (el) el.innerHTML = rows.length ? applicationsTable(rows, true, false, true) : `<div class="empty-state"><h3>No applications</h3><p>No records match these filters.</p></div>`; showToast(`${rows.length} applications matched`) }
function printMISReport() { showModal('MIS Report Preview', `<div class="modal-kv"><div><span>Total Applications</span><b>${applications.length}</b></div><div><span>Pipeline</span><b>${money(applications.reduce((s, a) => s + a.amount, 0))}</b></div><div><span>Credit Pending</span><b>${applications.filter(a => a.status === 'Credit Review').length}</b></div><div><span>Ready to Disburse</span><b>${applications.filter(a => ['Sanctioned', 'Disbursement'].includes(a.status)).length}</b></div></div><p class="muted" style="font-size:9px;margin-top:12px">Use the browser print dialog and choose “Save as PDF”.</p>`, `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="primary-btn" onclick="window.print()">Print / Save PDF</button>`) }
function refreshQueue(title, statuses, type) { renderQueue(title, statuses, type); showToast(`${title} refreshed`) }
function refreshCurrentQueue(type) { if (type === 'credit') navTo('credit'); else if (type === 'cam') navTo('cam'); else navTo('disbursement'); showToast('Queue refreshed') }
function dashboardSetProduct(p) { dashboardProduct = p; renderDashboard() }
function dashboardSetPeriod(p) { dashboardPeriod = p; renderDashboard() }
function dashboardJump(stage) { if (stage === 'CRM') navTo('crm'); else if (stage === 'Credit Review') navTo('credit'); else if (stage === 'CAM Allocation' || stage === 'CAM Sheet') navTo('cam'); else if (stage === 'Sanctioned' || stage === 'Disbursement') navTo('disbursement'); else navTo('applications') }

function setPage(title, crumb = title) { $("#pageTitle").textContent = title; $("#breadcrumbLabel").textContent = crumb; }
function renderAccessDenied(view) { const label = document.querySelector(`.nav-item[data-view="${view}"] span:nth-child(2)`)?.textContent || view; $$(".nav-item").forEach(n => n.classList.remove("active")); setPage("Access Restricted", "Permissions"); $("#content").innerHTML = `<div class="empty-state" style="padding:48px 24px;text-align:center"><h3>Access Restricted</h3><p class="muted">Your role (<b>${currentUser.role}</b>) does not have access to ${label}. Please contact your administrator if you need this access.</p><div style="height:12px"></div><button class="primary-btn" onclick="navTo('dashboard')">Go to my dashboard</button></div>`; }
function navTo(view, arg) {
  if (typeof v7FillAll === "function") v7FillAll();
  $$(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.view === view));
  $("#sidebar").classList.remove("open");
  if (view === "dashboard") renderDashboard();
  if (view === "crm") renderCRM(arg);
  if (view === "newApplication") { if (arg === "MSME") { resetMSME(); renderMSMEFlow(); } else { wizard = { step: 0, product: arg || "Two Wheeler", selectedApplicationId: null, data: {}, docs: {}, coType: "Co-applicant" }; renderWizard(); } }
  if (view === "msmeFlow") renderMSMEFlow();
  if (view === "applications") renderApplications();
  if (view === "credit") renderQueue("Credit Queue", ["Credit Review"], "credit");
  if (view === "cam") renderQueue("CAM Allocation", ["CAM Allocation", "CAM Sheet"], "cam");
  if (view === "documents") renderDocumentsHub();
  if (view === "disbursement") renderQueue("Disbursement", ["Sanctioned", "Disbursement"], "disbursement");
  if (view === "repayments") renderRepayments();
  if (view === "reports") renderReports();
  if (view === "case") renderCase(arg);
}

function renderDashboard() {
  if (typeof currentUser !== 'undefined' && (currentUser.role === 'CEO' || currentUser.role === 'SUPER_SUPER_ADMIN')) {
    renderCEOPersonalizedDashboard();
    return;
  }

  const periodFilter = (row) => {
    if (dashboardPeriod === "Today") return row.created === "04 Oct 2026";
    if (dashboardPeriod === "MTD") return String(row.created || "").includes("Oct 2026");
    return true;
  };

  const productBase = dashboardProduct === "All" ? applications : applications.filter(a => a.product === dashboardProduct);
  const scoped = productBase.filter(periodFilter);
  const leadBase = crm.leads.filter(l => dashboardProduct === "All" || l.product === dashboardProduct);
  const scopedLeads = leadBase.filter(periodFilter);

  const pipeline = scoped.reduce((s, a) => s + a.amount, 0);
  const booked = scoped.filter(a => ["Disbursement", "Active Loan"].includes(a.status)).reduce((s, a) => s + a.amount, 0);
  const sanctioned = scoped.filter(a => ["Sanctioned", "Disbursement", "Active Loan"].includes(a.status)).reduce((s, a) => s + a.amount, 0);
  const avgTicket = scoped.length ? pipeline / scoped.length : 0;
  const approvalCount = scoped.filter(a => ["Sanctioned", "Disbursement", "Active Loan"].includes(a.status)).length;
  const approvalRate = scoped.length ? Math.round(approvalCount / scoped.length * 100) : 0;
  const convertedLeads = scopedLeads.filter(l => l.converted).length;
  const crmConversion = scopedLeads.length ? Math.round(convertedLeads / scopedLeads.length * 100) : 0;
  const scored = scoped.filter(a => a.score > 0);
  const avgScore = scored.length ? Math.round(scored.reduce((s, a) => s + a.score, 0) / scored.length) : 0;
  const docReadiness = scoped.length ? Math.round(scoped.reduce((s, a) => s + a.docs, 0) / scoped.length) : 0;
  const docRisk = scoped.filter(a => a.docs < 80).length;
  const creditPending = scoped.filter(a => a.status === "Credit Review").length;
  const camPending = scoped.filter(a => ["CAM Allocation", "CAM Sheet"].includes(a.status)).length;
  const payoutReady = scoped.filter(a => ["Sanctioned", "Disbursement"].includes(a.status)).length;
  const openLeads = scopedLeads.filter(l => !l.converted);
  const followups = openLeads.filter(l => String(l.next).includes("Today")).length;

  const branches = [...new Set(scoped.map(a => a.branch))].map(branch => {
    const rows = scoped.filter(a => a.branch === branch);
    return {
      branch,
      cases: rows.length,
      amount: rows.reduce((s, a) => s + a.amount, 0),
      approved: rows.filter(a => ["Sanctioned", "Disbursement", "Active Loan"].includes(a.status)).length,
      docs: rows.length ? Math.round(rows.reduce((s, a) => s + a.docs, 0) / rows.length) : 0
    };
  }).sort((a, b) => b.amount - a.amount).slice(0, 5);

  const stageData = ["Sales/Predeal", "IMD Pending", "Credit Review", "CAM Allocation", "CAM Sheet", "Sanctioned", "Disbursement", "Active Loan"].map(stage => {
    const rows = scoped.filter(a => a.status === stage);
    return { stage, cases: rows.length, amount: rows.reduce((s, a) => s + a.amount, 0) };
  });
  const maxStage = Math.max(1, ...stageData.map(x => x.amount));

  const productData = Object.entries(products).map(([name, p]) => {
    const rows = scoped.filter(a => a.product === name);
    return { name, icon: p.icon, cases: rows.length, amount: rows.reduce((s, a) => s + a.amount, 0), approved: rows.filter(a => ["Sanctioned", "Disbursement", "Active Loan"].includes(a.status)).length };
  });
  const maxProduct = Math.max(1, ...productData.map(x => x.amount));

  $("#content").innerHTML = `
    <div class="ceo-topline">
      <div>
        <span class="eyebrow dark">EXECUTIVE LENDING CONTROL TOWER</span>
        <h2>CEO Business Dashboard</h2>
        <p>Strategic view of origination, conversion, credit movement, sanctions and payout readiness.</p>
      </div>
      <div class="ceo-top-actions">
        <div class="segmented ceo-period">${["Today", "MTD", "QTD"].map(p => `<button class="${dashboardPeriod === p ? "active" : ""}" onclick="dashboardSetPeriod('${p}')">${p}</button>`).join("")}</div>
        <select class="filter-btn ceo-product-filter" onchange="dashboardSetProduct(this.value)">
          <option ${dashboardProduct === "All" ? "selected" : ""}>All</option>
          ${Object.keys(products).map(p => `<option ${dashboardProduct === p ? "selected" : ""}>${p}</option>`).join("")}
        </select>
        <button class="ghost-btn" onclick="exportMIS()">⇩ Board MIS</button>
      </div>
    </div>

    <section class="ceo-hero">
      <div class="ceo-hero-copy">
        <div class="ceo-live-pill"><span></span> Executive snapshot • ${dashboardPeriod}</div>
        <h1>${dashboardProduct === "All" ? "Namdev Finvest Lending Performance" : dashboardProduct + " Business Performance"}</h1>
        <p>One view for business scale, portfolio movement, conversion quality and operational exceptions. Drill down from any metric into the working queue.</p>
        <div class="ceo-hero-actions">
          <button onclick="navTo('reports')">View MIS & Reports</button>
          <button onclick="navTo('crm')">Open CRM</button>
          <button onclick="navTo('credit')">Credit Queue</button>
          <button onclick="navTo('disbursement')">Payout Queue</button>
        </div>
      </div>
      <div class="ceo-hero-score">
        <div class="ceo-ring" style="--pct:${approvalRate}"><div><strong>${approvalRate}%</strong><span>Approval ratio</span></div></div>
        <div class="ceo-score-meta">
          <div><span>Sanctioned Value</span><b>${money(sanctioned)}</b></div>
          <div><span>Avg. Bureau</span><b>${avgScore || "—"}</b></div>
          <div><span>Docs Readiness</span><b>${docReadiness}%</b></div>
        </div>
      </div>
    </section>

    <div class="ceo-kpi-grid">
      <button class="ceo-kpi" onclick="navTo('applications')">
        <span class="ceo-kpi-label">Origination Pipeline</span>
        <strong>${money(pipeline)}</strong>
        <small>${scoped.length} application${scoped.length === 1 ? "" : "s"} in selected view</small>
        <i>Open portfolio →</i>
      </button>
      <button class="ceo-kpi" onclick="navTo('disbursement')">
        <span class="ceo-kpi-label">Booked / Disbursed</span>
        <strong>${money(booked)}</strong>
        <small>${scoped.filter(a => ["Disbursement", "Active Loan"].includes(a.status)).length} booked cases</small>
        <i>Open payout →</i>
      </button>
      <button class="ceo-kpi" onclick="navTo('crm')">
        <span class="ceo-kpi-label">CRM → LOS Conversion</span>
        <strong>${crmConversion}%</strong>
        <small>${convertedLeads} of ${scopedLeads.length} leads converted</small>
        <i>Open CRM →</i>
      </button>
      <button class="ceo-kpi" onclick="navTo('reports')">
        <span class="ceo-kpi-label">Average Ticket Size</span>
        <strong>${money(avgTicket)}</strong>
        <small>Across ${dashboardProduct === "All" ? "all products" : dashboardProduct}</small>
        <i>Product mix →</i>
      </button>
      <button class="ceo-kpi" onclick="navTo('credit')">
        <span class="ceo-kpi-label">Credit Pending</span>
        <strong>${creditPending}</strong>
        <small>Cases requiring credit action</small>
        <i>Review queue →</i>
      </button>
      <button class="ceo-kpi" onclick="navTo('documents')">
        <span class="ceo-kpi-label">Document Readiness</span>
        <strong>${docReadiness}%</strong>
        <small>${docRisk} exception${docRisk === 1 ? "" : "s"} below 80%</small>
        <i>View exceptions →</i>
      </button>
    </div>

    <div class="ceo-grid-main">
      <div class="card ceo-panel">
        <div class="ceo-panel-head">
          <div><span>BUSINESS MOMENTUM</span><h3>Origination by Product</h3><p>Pipeline value and case contribution across the lending book.</p></div>
          <button class="mini-link" onclick="navTo('reports')">Detailed MIS →</button>
        </div>
        <div class="ceo-product-bars">
          ${productData.map(x => `
            <button class="ceo-product-bar" onclick="dashboardSetProduct('${x.name}')">
              <div class="ceo-product-bar-head"><span><b>${x.icon}</b> ${x.name}</span><strong>${money(x.amount)}</strong></div>
              <div class="ceo-bar-track"><span style="width:${Math.max(3, x.amount / maxProduct * 100)}%"></span></div>
              <div class="ceo-product-bar-foot"><span>${x.cases} cases</span><span>${x.approved} sanctioned/booked</span></div>
            </button>`).join("")}
        </div>
      </div>

      <div class="card ceo-panel">
        <div class="ceo-panel-head">
          <div><span>CEO DECISION CENTER</span><h3>Attention Required</h3><p>Exceptions that can affect business movement.</p></div>
          <span class="badge ${docRisk + creditPending + camPending > 2 ? "red" : "green"}">${docRisk + creditPending + camPending} open</span>
        </div>
        <div class="ceo-alert-list">
          <button class="ceo-alert ${creditPending ? "high" : "ok"}" onclick="navTo('credit')"><span class="ceo-alert-icon">✓</span><div><b>Credit decisions pending</b><small>${creditPending} case${creditPending === 1 ? "" : "s"} awaiting credit action</small></div><strong>${creditPending}</strong></button>
          <button class="ceo-alert ${camPending ? "medium" : "ok"}" onclick="navTo('cam')"><span class="ceo-alert-icon">⇄</span><div><b>CAM movement</b><small>Allocation / CAM Sheet cases requiring movement</small></div><strong>${camPending}</strong></button>
          <button class="ceo-alert ${docRisk ? "high" : "ok"}" onclick="navTo('documents')"><span class="ceo-alert-icon">▣</span><div><b>Documentation risk</b><small>Applications below 80% checklist readiness</small></div><strong>${docRisk}</strong></button>
          <button class="ceo-alert ${followups ? "medium" : "ok"}" onclick="navTo('crm')"><span class="ceo-alert-icon">◷</span><div><b>CRM follow-up SLA</b><small>Lead actions due today</small></div><strong>${followups}</strong></button>
          <button class="ceo-alert ${payoutReady ? "good" : "ok"}" onclick="navTo('disbursement')"><span class="ceo-alert-icon">₹</span><div><b>Payout opportunity</b><small>Sanctioned / disbursement-ready cases</small></div><strong>${payoutReady}</strong></button>
        </div>
      </div>
    </div>

    <div class="ceo-grid-main ceo-second-row">
      <div class="card ceo-panel">
        <div class="ceo-panel-head">
          <div><span>CONVERSION HEALTH</span><h3>Loan Journey Funnel</h3><p>Value currently sitting at each origination stage.</p></div>
          <span class="badge gray">${dashboardPeriod}</span>
        </div>
        <div class="ceo-stage-chart">
          ${stageData.map(x => `
            <button class="ceo-stage-row" onclick="dashboardJump('${x.stage}')">
              <div class="ceo-stage-name"><b>${x.stage}</b><span>${x.cases} case${x.cases === 1 ? "" : "s"}</span></div>
              <div class="ceo-stage-track"><span style="width:${Math.max(2, x.amount / maxStage * 100)}%"></span></div>
              <strong>${money(x.amount)}</strong>
            </button>`).join("")}
        </div>
      </div>

      <div class="card ceo-panel">
        <div class="ceo-panel-head">
          <div><span>NETWORK PERFORMANCE</span><h3>Top Branches</h3><p>Ranked by current pipeline value.</p></div>
          <button class="mini-link" onclick="navTo('applications')">All branches →</button>
        </div>
        <div class="ceo-branch-list">
          ${branches.length ? branches.map((b, i) => `
            <button class="ceo-branch-row" onclick="navTo('applications')">
              <span class="ceo-rank">${String(i + 1).padStart(2, "0")}</span>
              <div><b>${b.branch}</b><small>${b.cases} cases • ${b.docs}% docs ready</small></div>
              <strong>${money(b.amount)}</strong>
            </button>`).join("") : `<div class="empty-state"><p>No branch data in this period.</p></div>`}
        </div>
      </div>
    </div>

    <div class="card ceo-panel ceo-bottom-panel">
      <div class="ceo-panel-head">
        <div><span>EXECUTIVE CASE WATCH</span><h3>High-Value & Decision-Critical Applications</h3><p>Largest cases in the selected view for quick CEO visibility.</p></div>
        <button class="mini-link" onclick="navTo('applications')">Open full portfolio →</button>
      </div>
      ${scoped.length ? applicationsTable([...scoped].sort((a, b) => b.amount - a.amount).slice(0, 5), false) : `<div class="empty-state"><h3>No cases in this view</h3><p>Change the period or product filter.</p></div>`}
    </div>`;
}
function kpi(label, val, sub, icon) { return `<div class="card kpi-card"><div><span class="kpi-label">${label}</span><strong>${val}</strong><div class="trend up">${sub}</div></div><div class="kpi-icon">${icon}</div></div>` }
function activity(icon, title, time) { return `<div class="activity"><div class="activity-dot">${icon}</div><div><b>${title}</b><span>${time}</span></div></div>` }

function applicationsTable(rows, full = true, showSanctionedAmount = false, showDemoLabels = false) {
  return `<div class="table-wrap"><table><thead><tr><th>Application</th><th>Customer</th><th>Product</th><th>${showSanctionedAmount ? "Sanction Amount" : "Loan Amount"}</th><th>Status</th>${full ? '<th>Docs</th><th>Owner</th>' : ''}<th></th></tr></thead>
  <tbody>${rows.map(a => `<tr>
    <td><div class="case-id">${a.id}</div>${showDemoLabels && a.browserLocalOnly === true ? '<span class="badge purple" style="margin-top:4px">Browser-local demo</span>' : ''}<div class="muted" style="font-size:8.5px;margin-top:3px">${a.created}</div></td>
    <td><div class="customer-cell"><div class="mini-avatar">${initials(a.customer)}</div><div><b>${a.customer}</b><div class="muted" style="font-size:8.5px;margin-top:2px">${a.mobile}</div></div></div></td>
    <td>${products[a.product].icon} ${a.product}</td>
    <td><b>${money(showSanctionedAmount && Number(a.lifecycle?.sanction?.amount) > 0 ? a.lifecycle.sanction.amount : a.amount)}</b></td>
    <td><span class="badge ${statusClass(a.status)}"><span class="status-dot"></span>${a.status}</span></td>
    ${full ? `<td>${a.docs}%</td><td>${a.owner}</td>` : ''}
    <td><button class="more-btn" onclick="navTo('case','${a.id}')">Open →</button></td>
  </tr>`).join("")}</tbody></table></div>`;
}

function browserLocalDemoShowcase() {
  const cases = applications.filter(a => a.browserLocalOnly === true);
  if (!cases.length) return "";
  return `<section class="card card-pad" aria-label="Browser-local demo applications" style="margin-bottom:14px;border:1px solid var(--primary,#6366f1)">
    <div class="card-title-row"><div><span class="badge purple">DEMO • THIS BROWSER</span><h3 style="margin-top:8px">Pinned demo applications</h3><p>These cases are saved in this browser only and are not shared with other app addresses or devices.</p></div></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px">
      ${cases.map(a => `<article class="workflow-card" style="padding:14px">
        <div class="card-title-row"><div><b>${losEscapeHtml(a.customer)}</b><div class="muted" style="font-size:9px;margin-top:3px">${losEscapeHtml(a.id)} · ${losEscapeHtml(a.product)}</div></div><span class="badge ${statusClass(a.status)}">${losEscapeHtml(a.status)}</span></div>
        <div class="muted" style="font-size:9px;margin:8px 0 10px">${money(a.amount)} · ${losEscapeHtml(a.branch)}</div>
        <button class="more-btn" onclick="navTo('case','${losEscapeHtml(a.id)}')">Open demo case →</button>
      </article>`).join("")}
    </div>
  </section>`;
}

function renderApplications() {
  setPage("Applications");
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>Applications</h2><p>Search, filter and open any loan case from a single workspace.</p></div><button class="primary-btn" onclick="navTo('newApplication')">+ New Application</button></div>
    ${browserLocalDemoShowcase()}
    <div class="card card-pad">
      <div class="toolbar">
        <div class="toolbar-group"><input id="appSearch" class="compact-input" placeholder="Search by case / customer / mobile" oninput="filterApplications()"><select id="productFilter" class="filter-btn" onchange="filterApplications()"><option>All Products</option>${Object.keys(products).map(p => `<option>${p}</option>`).join("")}</select><select id="statusFilter" class="filter-btn" onchange="filterApplications()"><option>All Status</option>${["Draft", ...lifecycle].map(s => `<option>${s}</option>`).join("")}</select></div>
        <div class="toolbar-group"><button class="filter-btn" onclick="openAdvancedFilters()">⚙ Filters</button><button class="filter-btn" onclick="exportApplications()">⇩ Export</button></div>
      </div>
      <div id="appTable">${applicationsTable(applications, true, false, true)}</div>
    </div>`;
}
function filterApplications() {
  const q = $("#appSearch").value.toLowerCase(), p = $("#productFilter").value, s = $("#statusFilter").value;
  const rows = applications.filter(a => (a.id + a.customer + a.mobile).toLowerCase().includes(q) && (p === "All Products" || a.product === p) && (s === "All Status" || a.status === s));
  $("#appTable").innerHTML = rows.length ? applicationsTable(rows, true, false, true) : `<div class="empty-state"><div class="icon">⌕</div><h3>No matching applications</h3><p>Try changing your filters.</p></div>`;
}

function renderQueue(title, statuses, type) {
  setPage(title);
  const rows = applications.filter(a => statuses.includes(a.status) || type === "cam" && a.cam?.status === "Pending");
  const sub = type === "credit" ? "Review loan details, validate installments and move eligible cases to CAM." : type === "cam" ? "Allocate, transfer and track CAM cases without workflow breaks." : "Track sanctioned cases and complete payout readiness.";
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>${title}</h2><p>${sub}</p></div><div class="action-row"><button class="ghost-btn" onclick="refreshCurrentQueue('${type}')">↻ Refresh</button></div></div>
    <div class="grid kpis">
      ${kpi("Cases", rows.length, "Current queue", "▤")}
      ${kpi("Total Exposure", money(rows.reduce((s, a) => s + (type === "disbursement" && Number(a.lifecycle?.sanction?.amount) > 0 ? a.lifecycle.sanction.amount : a.amount), 0)), "Open amount", "₹")}
      ${kpi("Avg. Document Readiness", Math.round(rows.reduce((s, a) => s + a.docs, 0) / (rows.length || 1)) + "%", "Checklist completion", "▣")}
      ${kpi("Action SLA", "< 4 hrs", "Operational target", "◷")}
    </div>
    <div style="height:16px"></div>
    <div class="card card-pad">${rows.length ? applicationsTable(rows, true, type === "disbursement") : `<div class="empty-state"><div class="icon">✓</div><h3>Queue is clear</h3><p>No cases require action here right now.</p></div>`}</div>`;
}

function renderDocumentsHub() {
  setPage("Documents");
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>Document Center</h2><p>Live KYC, front/rear uploads and BRD checklist control from one place.</p></div><button class="primary-btn" onclick="navTo('newApplication')">+ Upload for New Case</button></div>
    <div class="grid kpis">
      ${kpi("Checklist Items", docChecklist.length, "Mapped from BRD", "▣")}
      ${kpi("KYC Categories", 3, "Live photo + ID proof", "◎")}
      ${kpi("Pending Across Cases", applications.filter(a => a.docs < 100).length, "Cases below 100%", "!")}
      ${kpi("Fully Ready", applications.filter(a => a.docs === 100).length, "Document complete", "✓")}
    </div>
    <div style="height:16px"></div>
    <div class="card card-pad">
      <div class="card-title-row"><div><h3>Document Checklist</h3><p>Mandatory / original / photocopy mapping</p></div><button class="ghost-btn" onclick="exportDocumentChecklist()">Download Checklist</button></div>
      <div class="table-wrap"><table><thead><tr><th>Category</th><th>Document</th><th>Requirement</th><th>Copy Type</th></tr></thead><tbody>
      ${docChecklist.map(d => `<tr><td><span class="badge gray">${d.category}</span></td><td><b>${d.name}</b></td><td>${d.mandatory}</td><td>${d.type}</td></tr>`).join("")}
      </tbody></table></div>
    </div>`;
}

function renderRepayments() {
  setPage("Repayments");
  const modes = ["E-Nach", "Nach", "PDC", "NPDC"];
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>Repayments</h2><p>Monitor repayment mode setup and mandate readiness.</p></div></div>
    <div class="grid kpis">
      ${modes.map(m => kpi(m, applications.filter(a => a.repayment === m).length, "Configured cases", "↻")).join("")}
    </div>
    <div style="height:16px"></div>
    <div class="card card-pad">
      <div class="card-title-row"><div><h3>Repayment Setup</h3><p>Supported repayment modes follow the BRD requirement.</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>Case</th><th>Customer</th><th>Product</th><th>Repayment Mode</th><th>Status</th><th></th></tr></thead><tbody>
      ${applications.filter(a => a.repayment !== "—").map(a => `<tr><td><b>${a.id}</b></td><td>${a.customer}</td><td>${a.product}</td><td><span class="badge blue">${a.repayment}</span></td><td>${a.status}</td><td><button class="more-btn" onclick="navTo('case','${a.id}')">Open</button></td></tr>`).join("")}
      </tbody></table></div>
    </div>`;
}

function renderReports() {
  setPage("Reports");
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>Reports & MIS</h2><p>Operational snapshot for sourcing, credit, CAM, documents and disbursement.</p></div><div class="action-row"><button class="ghost-btn" onclick="printMISReport()">PDF</button><button class="primary-btn" onclick="exportMIS()">Export Excel</button></div></div>
    <div class="grid kpis">
      ${kpi("Total Pipeline", money(applications.reduce((s, a) => s + a.amount, 0)), "All displayed cases", "₹")}
      ${kpi("Avg. Credit Score", Math.round(applications.filter(a => a.score).reduce((s, a) => s + a.score, 0) / applications.filter(a => a.score).length), "Illustrative prototype data", "◎")}
      ${kpi("Avg. Docs", Math.round(applications.reduce((s, a) => s + a.docs, 0) / applications.length) + "%", "Checklist completeness", "▣")}
      ${kpi("Active Loans", applications.filter(a => a.status === "Active Loan").length, "Converted", "✓")}
    </div>
    <div style="height:16px"></div>
    <div class="grid two">
      <div class="card card-pad"><div class="card-title-row"><div><h3>Product Mix</h3><p>Pipeline value by product</p></div></div>
      ${Object.keys(products).map(p => { const v = applications.filter(a => a.product === p).reduce((s, a) => s + a.amount, 0); const max = Math.max(...Object.keys(products).map(x => applications.filter(a => a.product === x).reduce((s, a) => s + a.amount, 0))); return `<div class="funnel-row"><div><div class="label"><span>${products[p].icon} ${p}</span><span>${money(v)}</span></div><div class="progress"><span style="width:${Math.max(5, v / max * 100)}%"></span></div></div><strong>${applications.filter(a => a.product === p).length}</strong></div>` }).join("")}</div>
      <div class="card card-pad"><div class="card-title-row"><div><h3>Operational Controls</h3><p>Prototype health indicators</p></div></div>
        <div class="metric-list">
          <div class="metric"><span>Live KYC enabled</span><b>Yes</b></div><div class="metric"><span>Front / rear upload</span><b>Enabled</b></div>
          <div class="metric"><span>Monthly obligation</span><b>Locked</b></div><div class="metric"><span>Bank details</span><b>Optional</b></div>
          <div class="metric"><span>CAM transfer</span><b>Enabled</b></div><div class="metric"><span>Vehicle make search</span><b>Enabled</b></div>
        </div>
      </div>
    </div>`;
}

function renderWizard() {
  setPage("New Application", "New Application");
  $("#content").innerHTML = `
    <div class="wizard-shell los-application">
      <div class="los-top">
        <div class="los-page-title"><h2>Create Loan Application</h2><p>${wizard.product} • Guided Sales/Predeal workflow with BRD controls.</p></div>
        <nav class="los-stepper" aria-label="Application progress"><ol>${steps.map((s, i) => `<li class="${i === wizard.step ? 'active' : i < wizard.step ? 'done' : ''}"><button type="button" aria-current="${i === wizard.step ? 'step' : 'false'}" ${i > wizard.step ? 'disabled' : `onclick="goWizardStep(${i})"`}><span class="los-step-number">${i < wizard.step ? '✓' : i + 1}</span><span class="los-step-label">${s}</span></button></li>`).join("")}</ol></nav>
        <span class="badge red los-draft-badge">Draft</span>
      </div>
      <div class="card wizard-main">
        ${renderWizardStep()}
      </div>
    </div>`;
  bindWizardEvents();
}
function renderWizardStep() {
  if (wizard.step === 0) return stepProduct();
  if (wizard.step === 1) return stepApplicant();
  if (wizard.step === 2) return stepCoApplicant();
  if (wizard.step === 3) return stepDocuments();
  if (wizard.step === 4) return stepAsset();
  if (wizard.step === 5) return window.nfPDMarkup ? window.nfPDMarkup() : '<p>Loading PD…</p>';
  if (wizard.step === 6) return stepLoan();
  if (wizard.step === 7) return stepImdBsa();
  return stepReview();
}
function wizardHeader(title, desc) { return `<div class="section-title"><div><h3>${title}</h3><p>${desc}</p></div><span class="badge gray">Step ${wizard.step + 1} of ${steps.length}</span></div>` }
function wizardActions(next = "Continue") { return `<div class="wizard-actions"><button class="ghost-btn" onclick="${wizard.step === 0 ? "navTo('dashboard')" : "wizardBack()"}">${wizard.step === 0 ? "Cancel" : "← Back"}</button><button class="primary-btn" onclick="wizardNext()">${next} →</button></div>` }
function stepProduct() {
  const selectedApplication = getWizardApplication();
  const p = products[wizard.product];
  const requestedAmount = wizard.data.requestedAmount ?? productDefaultAmount();
  const interestRate = wizard.data.interestRate ?? p.rate;
  const tenure = wizard.data.tenure ?? p.tenure;
  const branches = [...new Set(["Jaipur - VKI", "Jaipur - Sanganer", "Bhilwara", "Udaipur", "Kota", "Jodhpur", selectedApplication?.branch, wizard.data.branch].filter(Boolean))];
  return `<div class="section-title los-section-title"><div><h3>Product &amp; Source</h3><p>Select the loan product and capture sourcing details. EMI is system-estimated and Monthly Obligation stays<br class="los-description-break"> locked for new cases.</p></div><span class="badge gray">Step 1 of ${steps.length}</span></div>
 
 <div class="product-select-grid los-product-grid">${Object.entries(products).map(([n, x], i) => `<button type="button" class="product-select ${wizard.product === n ? 'selected' : ''}" onclick="selectProduct('${n}')" aria-label="Select ${n}"><div class="product-icon">${x.icon}</div><div class="los-card-copy"><b>${['Two Wheeler', 'MSME', 'LAP', 'Solar', 'Tractor'][i] || n}</b><span>Dealer-led finance</span></div></button>`).join("")}</div>

  <div class="field-grid three los-source-fields">
    ${field("sourceChannel", "Source Channel", `<select id="sourceChannel">${["Dealer / DSA", "Branch Walk-in", "Digital Lead", "Referral", "Existing Customer"].map(value => `<option ${wizard.data.sourceChannel === value || (!wizard.data.sourceChannel && value === "Dealer / DSA") ? "selected" : ""}>${value}</option>`).join("")}</select>`)}
    ${field("branch", "Branch", `<select id="branch">${branches.map(value => `<option ${wizard.data.branch === value || (!wizard.data.branch && value === "Jaipur - VKI") ? "selected" : ""}>${value}</option>`).join("")}</select>`)}
    ${field("salesExec", "Sales Executive", `<input id="salesExec" value="${wizard.data.salesExec ?? selectedApplication?.owner ?? "Neha Jain"}">`)}
    ${field("requestedAmount", "Requested Loan Amount", `<input id="requestedAmount" type="number" value="${requestedAmount}" min="1000">`)}
    ${field("interestRate", "Indicative ROI %", `<input id="interestRate" type="number" step=".05" value="${interestRate}">`)}
    ${field("tenure", "Tenure (Months)", `<input id="tenure" type="number" value="${tenure}">`)}
    ${field("estimatedEmi", "Estimated EMI", `<input id="estimatedEmi" readonly value="${money(emi(requestedAmount, interestRate, tenure))}">`)}
    ${field("monthlyObligation", "Monthly Obligation", `<input id="monthlyObligation" disabled value="Locked for new case">`, "BRD control: field is frozen.")}
  </div>
  <div class="wizard-actions los-actions"><button class="ghost-btn" type="button" onclick="navTo('dashboard')">Cancel</button><button class="primary-btn" type="button" onclick="wizardNext()">Continue →</button></div>
  <div id="losSelectionError" class="los-selection-error" role="status" aria-live="polite"></div>
  <div class="los-data-area">
    ${renderLosFilterToolbar()}
    <div id="losPreviewPanels" class="los-preview-panels">${renderLosPanels()}</div>
  </div>`;
}
function getWizardApplication() {
  return wizard.selectedApplicationId ? applications.find(app => app.id === wizard.selectedApplicationId && app.product === wizard.product) || null : null;
}
function losVisibleStatus(status) { return status === "Sales/Predeal" ? "Sales Process" : status }
function getLosFilteredRecords() {
  const query = losListState.query.trim().toLocaleLowerCase();
  const leads = crm.leads.filter(lead => lead.product === wizard.product);
  const cases = applications.filter(app => app.product === wizard.product);
  const fieldsFor = (record, type) => ({
    id: record.id,
    customer: type === "lead" ? record.name : record.customer,
    mobile: record.mobile || "",
    product: record.product,
    status: losVisibleStatus(record.status)
  });
  const matches = (record, type) => {
    const fields = fieldsFor(record, type);
    if (losListState.status !== "All Status" && fields.status !== losListState.status) return false;
    if (!query) return true;
    const searchable = losListState.column === "all"
      ? Object.values(fields)
      : [fields[losListState.column]];
    return searchable.some(value => String(value ?? "").toLocaleLowerCase().includes(query));
  };
  return {
    leads: leads.filter(lead => matches(lead, "lead")),
    applications: cases.filter(app => matches(app, "application"))
  };
}
function renderLosFilterToolbar() {
  const statuses = [...new Set([
    ...crm.leads.map(lead => losVisibleStatus(lead.status)),
    ...applications.map(app => losVisibleStatus(app.status))
  ])].sort((a, b) => a.localeCompare(b));
  const columns = [["all", "Filter by column"], ["customer", "Customer"], ["id", "Lead ID / Application No."], ["mobile", "Mobile"], ["status", "Status"], ["product", "Product"]];
  return `<div id="losDataToolbar" class="los-filter-toolbar" role="search" aria-label="Filter CRM leads and applications">
    <label class="los-search-control"><span class="los-visually-hidden">Search leads and applications</span><input id="losCommonSearch" type="search" value="${losEscapeHtml(losListState.query)}" placeholder="Search lead, customer, mobile" autocomplete="off"></label>
    <label class="los-filter-control"><span class="los-visually-hidden">Filter by status</span><select id="losStatusFilter"><option>All Status</option>${statuses.map(status => `<option ${losListState.status === status ? "selected" : ""}>${losEscapeHtml(status)}</option>`).join("")}</select></label>
    <label class="los-filter-control los-column-control"><span class="los-visually-hidden">Filter by column</span><select id="losColumnFilter" aria-label="Filter by column">${columns.map(([value, label]) => `<option value="${value}" ${losListState.column === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
    <button type="button" class="los-tool-btn" onclick="clearLosFilters()">Clear filters</button>
    <div class="los-export-actions" aria-label="Export filtered records">
      <button type="button" class="los-tool-btn" onclick="exportLosData('csv')">CSV</button>
      <button type="button" class="los-tool-btn" onclick="exportLosData('excel')">Excel</button>
      <button type="button" class="los-tool-btn" onclick="exportLosData('pdf')">PDF</button>
      <button type="button" class="los-tool-btn" onclick="exportLosData('print')">Print</button>
    </div>
  </div>`;
}
function renderLosPanels() {
  const { leads, applications: filteredApplications } = getLosFilteredRecords();
  const selectedApplication = getWizardApplication();
  return `<section class="card los-preview-panel" aria-labelledby="losCrmTitle">
      <header class="los-panel-heading"><span class="los-panel-icon" aria-hidden="true">◉</span><div><h3 id="losCrmTitle">CRM</h3><p>Track and manage leads, opportunities and sourcing activities.</p></div></header>
      ${renderLosLeadTable(paginateLosRecords(leads, "crm"))}
      <a class="los-panel-link" href="#" onclick="event.preventDefault();navTo('crm')">View All Leads →</a>
      ${renderLosPagination(leads.length, "crm")}
    </section>
    <section class="card los-preview-panel" aria-labelledby="losApplicationsTitle">
      <header class="los-panel-heading"><span class="los-panel-icon" aria-hidden="true">≡</span><div><h3 id="losApplicationsTitle">Applications</h3><p>Search, filter and open any loan case from a single workspace.</p></div></header>
      ${renderLosApplicationTable(paginateLosRecords(filteredApplications, "applications"), selectedApplication)}
      ${selectedApplication ? `<div class="los-selected-summary"><b>Selected Application:</b> ${selectedApplication.id} <span>· ${selectedApplication.customer} · ${selectedApplication.product} · ${money(selectedApplication.amount)}</span></div>` : ""}
      <a class="los-panel-link" href="#" onclick="event.preventDefault();navTo('applications')">View All Applications →</a>
      ${renderLosPagination(filteredApplications.length, "applications")}
    </section>`;
}
function paginateLosRecords(records, section) {
  const pageSize = losListState[`${section}PageSize`];
  const pageCount = Math.max(1, Math.ceil(records.length / pageSize));
  const pageKey = `${section}Page`;
  losListState[pageKey] = Math.min(losListState[pageKey], pageCount);
  const start = (losListState[pageKey] - 1) * pageSize;
  return records.slice(start, start + pageSize);
}
function renderLosPagination(total, section) {
  const pageKey = `${section}Page`;
  const sizeKey = `${section}PageSize`;
  const pageSize = losListState[sizeKey];
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(losListState[pageKey], pages);
  const firstPage = Math.max(1, Math.min(page - 2, pages - 4));
  const pageButtons = Array.from({ length: Math.min(5, pages) }, (_, i) => firstPage + i)
    .map(number => `<button type="button" class="los-page-btn ${page === number ? "active" : ""}" aria-label="Page ${number}" aria-current="${page === number ? "page" : "false"}" onclick="setLosPage('${section}',${number})">${number}</button>`).join("");
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, total);
  return `<div class="los-pagination">
    <span class="los-page-summary">Showing ${from}–${to} of ${total}</span>
    <div class="los-page-controls" aria-label="${section === "crm" ? "CRM" : "Applications"} pagination">
      <button type="button" class="los-page-btn" aria-label="Previous page" ${page <= 1 ? "disabled" : ""} onclick="setLosPage('${section}',${page - 1})">‹</button>${pageButtons}<button type="button" class="los-page-btn" aria-label="Next page" ${page >= pages ? "disabled" : ""} onclick="setLosPage('${section}',${page + 1})">›</button>
    </div>
    <label class="los-page-size">Rows per page <select aria-label="Rows per page" onchange="setLosPageSize('${section}',this.value)">${[5, 10, 25, 50].map(size => `<option value="${size}" ${size === pageSize ? "selected" : ""}>${size}</option>`).join("")}</select></label>
  </div>`;
}
function updateLosPanels() {
  const panels = $("#losPreviewPanels");
  if (panels) panels.innerHTML = renderLosPanels();
}
function resetLosPages() {
  losListState.crmPage = 1;
  losListState.applicationsPage = 1;
}
function setLosPage(section, page) {
  if (!["crm", "applications"].includes(section)) return;
  losListState[`${section}Page`] = Number(page);
  updateLosPanels();
}
function setLosPageSize(section, size) {
  if (!["crm", "applications"].includes(section)) return;
  losListState[`${section}PageSize`] = Number(size);
  losListState[`${section}Page`] = 1;
  updateLosPanels();
}
function clearLosFilters() {
  losListState.query = "";
  losListState.status = "All Status";
  losListState.column = "all";
  resetLosPages();
  const toolbar = $("#losDataToolbar");
  if (toolbar) toolbar.innerHTML = renderLosFilterToolbar();
  updateLosPanels();
  bindLosFilterEvents();
}
function bindLosFilterEvents() {
  $("#losCommonSearch")?.addEventListener("input", event => {
    losListState.query = event.target.value;
    resetLosPages();
    updateLosPanels();
  });
  $("#losStatusFilter")?.addEventListener("change", event => {
    losListState.status = event.target.value;
    resetLosPages();
    updateLosPanels();
  });
  $("#losColumnFilter")?.addEventListener("change", event => {
    losListState.column = event.target.value;
    resetLosPages();
    updateLosPanels();
  });
}
function losExportRows() {
  const { leads, applications: cases } = getLosFilteredRecords();
  return {
    headers: ["Record Type", "Lead / Application No.", "Customer", "Mobile", "Product", "Amount", "Status"],
    rows: [
      ...leads.map(lead => ["CRM Lead", lead.id, lead.name, lead.mobile, lead.product, lead.amount, lead.status]),
      ...cases.map(app => ["Application", app.id, app.customer, app.mobile, app.product, app.amount, losVisibleStatus(app.status)])
    ]
  };
}
function exportLosData(format) {
  const { headers, rows } = losExportRows();
  const filename = `los-${wizard.product.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-records`;
  if (format === "csv") {
    downloadText(`${filename}.csv`, rowsToCsv(headers, rows), "text/csv");
    return;
  }
  if (format === "excel") {
    const table = `<table><thead><tr>${headers.map(item => `<th>${losEscapeHtml(item)}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(item => `<td>${losEscapeHtml(item)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    downloadText(`${filename}.xls`, `<!doctype html><html><head><meta charset="utf-8"></head><body>${table}</body></html>`, "application/vnd.ms-excel");
    return;
  }
  const popup = window.open("", "_blank");
  if (!popup) {
    showToast("Allow pop-ups to print or save this report as PDF.");
    return;
  }
  const table = `<table><thead><tr>${headers.map(item => `<th>${losEscapeHtml(item)}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(item => `<td>${losEscapeHtml(item)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  popup.onload = () => { if (format === "pdf") popup.print(); };
  popup.document.write(`<!doctype html><html><head><title>LOS records</title><style>body{font:14px Arial,sans-serif;padding:24px;color:#1f2937}h1{font-size:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #d8dee8;padding:8px;text-align:left}th{background:#f1f4f8}@media print{body{padding:0}}</style></head><body><h1>${losEscapeHtml(wizard.product)} CRM &amp; Applications</h1>${table}</body></html>`);
  popup.document.close();
  popup.focus();
  if (format === "print") popup.print();
}
function renderLosLeadTable(rows) {
  const cols = ["Lead ID", "Customer", "Product", "Req. Amount", "Status"];
  return `<div class="los-table-wrap"><div class="los-preview-table" role="table" aria-label="${wizard.product} CRM leads"><div class="los-preview-row los-preview-head" role="row">${cols.map(col => `<span role="columnheader">${col}</span>`).join("")}</div>${rows.map(lead => `<div class="los-preview-row" role="row"><span role="cell"><button type="button" class="los-record-link" onclick="navTo('crm','${lead.id}')">${lead.id}</button></span><span role="cell">${lead.name}</span><span role="cell">${lead.product}</span><span role="cell"><b>${money(lead.amount)}</b></span><span role="cell"><span class="los-status los-status-${lead.status.toLowerCase().replace(/[^a-z]+/g, '-')}">${lead.status} ›</span></span></div>`).join("") || `<div class="los-preview-row" role="row"><span class="los-empty" role="cell" aria-colspan="5">No ${wizard.product} leads match these filters.</span></div>`}</div></div>`;
}
function renderLosApplicationTable(rows) {
  const cols = ["Application No.", "Customer", "Product", "Loan Amount", "Status"];
  return `<div class="los-table-wrap"><div class="los-preview-table" role="table" aria-label="${wizard.product} applications"><div class="los-preview-row los-preview-head" role="row">${cols.map(col => `<span role="columnheader">${col}</span>`).join("")}</div>${rows.map(app => `<div class="los-preview-row" role="row"><span role="cell"><button type="button" class="los-record-link" onclick="openLosApplication('${app.id}')" aria-label="Open application ${app.id}">${app.id}</button></span><span class="los-customer-cell" role="cell"><i>${initials(app.customer)}</i>${app.customer}</span><span role="cell">${app.product}</span><span role="cell"><b>${money(app.amount)}</b></span><span role="cell"><span class="los-status los-status-${app.status.toLowerCase().replace(/[^a-z]+/g, '-')}">${losVisibleStatus(app.status)} ›</span></span></div>`).join("") || `<div class="los-preview-row" role="row"><span class="los-empty" role="cell" aria-colspan="5">No ${wizard.product} applications match these filters.</span></div>`}</div></div>`;
}
function openLosApplication(id) {
  const app = applications.find(item => item.id === id);
  if (!app) return showToast("Application not found. Refresh the application list and try again.");
  if (app.lifecycleManaged && app.lifecycle?.stage && app.lifecycle.stage !== "los") {
    navTo("case", app.id);
    return;
  }
  if (!["Draft", "Sales/Predeal", "Sales Process"].includes(app.status)) {
    navTo("case", app.id);
    return;
  }
  const linkedLead = crm.leads.find(lead => lead.id === app.crmLeadId || lead.id === app.lifecycle?.leadId);
  const customerName = app.customer || linkedLead?.name || "";
  const customerParts = customerName.trim().split(/\s+/).filter(Boolean);
  wizard = {
    step:1, product:app.product, selectedApplicationId:app.id, docs:{}, coType:"Co-applicant",
    demoMandatoryBypass:app.demoMandatoryBypass === true,
    data:{
      sourceChannel:({ DSA:"Dealer / DSA", Dealer:"Dealer / DSA", Digital:"Digital Lead", "Walk-in":"Branch Walk-in", Referral:"Referral", "Existing Customer":"Existing Customer" })[app.crmSource || linkedLead?.source] || "Dealer / DSA",
      branch:app.branch || linkedLead?.branch || "Jaipur - VKI",
      salesExec:app.owner || linkedLead?.owner || "Neha Jain",
      requestedAmount:app.amount,
      firstName:customerParts[0] || "",
      lastName:customerParts.slice(1).join(" "),
      mobile:app.mobile || linkedLead?.mobile || "",
      altMobile:app.altMobile || linkedLead?.altMobile || "",
      email:app.email || linkedLead?.email || "",
      city:app.city || linkedLead?.city || "",
      pincode:app.pincode || linkedLead?.pincode || "",
      pan:app.pan || linkedLead?.pan || "",
      aadhaar:app.aadhaar || linkedLead?.aadhaar || ""
    }
  };
  $$(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.view === "newApplication"));
  $("#sidebar").classList.remove("open");
  renderWizard();
  showToast("Opened application " + app.id + " in its LOS workflow.");
}
function selectLosApplication(id) { return openLosApplication(id); }
function productDefaultAmount() { return { "Two Wheeler": 120000, "MSME": 750000, "LAP": 3000000, "Solar Loan": 600000, "Tractor Loan": 800000 }[wizard.product] }
function field(id, label, control, help = "") { return `<label class="field"><span>${label}${["requestedAmount", "interestRate", "tenure"].includes(id) ? '<i class="required">*</i>' : ''}</span>${control}${help ? `<small>${help}</small>` : ""}</label>` }

function stepApplicant() {
  const app = getWizardApplication();
  const customerName = wizard.data.firstName ? `${wizard.data.firstName} ${wizard.data.lastName || ""}`.trim() : app?.customer || "Aarav Sharma";
  const customerParts = customerName.split(/\s+/);
  const firstName = wizard.data.firstName || customerParts[0] || "Aarav";
  const lastName = wizard.data.lastName || customerParts.slice(1).join(" ") || "Sharma";
  return `${wizardHeader("Applicant Details", "Capture core KYC, contact, residence and employment/business data. Bank details remain optional as required by the BRD.")}
  ${app ? `<div class="los-selected-case"><div><b>Selected Application</b><strong>${app.id}</strong></div><div><b>Customer</b><strong>${customerName}</strong></div><div><b>Product</b><strong>${app.product}</strong></div><div><b>Loan Amount</b><strong>${money(app.amount)}</strong></div><div><b>Status</b><strong>${app.status}</strong></div></div>` : ""}
  <div class="field-grid three">
    ${field("applicantType", "Applicant Type", `<select id="applicantType"><option>Individual</option><option>Proprietorship</option><option>Partnership</option><option>Private Limited</option></select>`)}
    ${field("firstName", "First Name", `<input id="firstName" value="${firstName}">`)}
    ${field("lastName", "Last Name", `<input id="lastName" value="${lastName}">`)}
    ${field("mobile", "Mobile Number", `<input id="mobile" value="${wizard.data.mobile ?? app?.mobile ?? "9829011820"}">`)}
    ${field("pan", "PAN", `<input id="pan" value="${wizard.data.pan ?? app?.pan ?? "ABCDE1234F"}">`)}
    ${field("aadhaar", "Aadhaar", `<input id="aadhaar" inputmode="numeric" maxlength="12" value="${wizard.data.aadhaar ?? app?.aadhaar ?? ""}">`)}
    ${field("altMobile", "Alternate Mobile", `<input id="altMobile" value="${wizard.data.altMobile ?? app?.altMobile ?? ""}">`)}
    ${field("dob", "DOB", `<input id="dob" type="date" value="${wizard.data.dob || "1992-05-14"}">`)}
    ${field("email", "Email", `<input id="email" type="email" value="${wizard.data.email ?? app?.email ?? "aarav.sharma@example.com"}">`)}
    ${field("employment", "Employment Type", `<select id="employment"><option>Salaried</option><option>Self Employed</option><option>Business</option><option>Agriculture</option></select>`)}
    ${field("income", "Monthly Income / Surplus", `<input id="income" type="number" value="${wizard.data.income || 65000}">`)}
  </div>
  <div style="height:14px"></div>
  <div class="summary-block">
    <h4>Residence Address</h4>
    <div class="field-grid three">
      ${field("address", "Address", `<input id="address" value="${wizard.data.address || "Vaishali Nagar"}">`)}
      ${field("city", "City", `<input id="city" value="${wizard.data.city ?? app?.city ?? "Jaipur"}">`)}
      ${field("pincode", "PIN Code", `<input id="pincode" value="${wizard.data.pincode ?? app?.pincode ?? "302021"}">`)}
    </div>
  </div>
  <div style="height:14px"></div>
  <div class="summary-block">
    <div class="card-title-row"><div><h3 style="font-size:11px">Bank Details <span class="badge gray">Optional</span></h3><p>Applicant can proceed without bank details.</p></div></div>
    <div class="field-grid three">
      ${field("bankName", "Bank Name", `<input id="bankName" placeholder="Optional">`)}
      ${field("accountNo", "Account Number", `<input id="accountNo" placeholder="Optional">`)}
      ${field("ifsc", "IFSC", `<input id="ifsc" placeholder="Optional">`)}
    </div>
  </div>
  ${wizardActions()}`;
}

function stepCoApplicant() {
  return `${wizardHeader("Co-applicant / Guarantor", "The BRD limits this section to essential personal and employment information only.")}
  <div class="doc-tabs">
    <button class="doc-tab ${wizard.coType === "Co-applicant" ? 'active' : ''}" onclick="wizard.coType='Co-applicant';renderWizard()">Co-applicant</button>
    <button class="doc-tab ${wizard.coType === "Guarantor" ? 'active' : ''}" onclick="wizard.coType='Guarantor';renderWizard()">Guarantor</button>
    <button class="doc-tab ${wizard.coType === "None" ? 'active' : ''}" onclick="wizard.coType='None';renderWizard()">Not Required</button>
  </div>
  ${wizard.coType === "None" ? `<div class="notice info">No ${wizard.coType.toLowerCase()} details will be added to this application.</div>` : `
    <div class="field-grid three">
      ${field("coName", wizard.coType + " Name", `<input id="coName" value="${wizard.data.coName || "Priya Sharma"}">`)}
      ${field("coRelation", "Relationship", `<select id="coRelation"><option>Spouse</option><option>Parent</option><option>Sibling</option><option>Business Partner</option><option>Other</option></select>`)}
      ${field("coMobile", "Mobile", `<input id="coMobile" value="${wizard.data.coMobile || "9829055441"}">`)}
      ${field("coPan", "PAN", `<input id="coPan" value="${wizard.data.coPan || "FGHIJ5678K"}">`)}
      ${field("coEmployment", "Employment", `<select id="coEmployment"><option>Salaried</option><option>Self Employed</option><option>Business</option><option>Agriculture</option></select>`)}
      ${field("coIncome", "Monthly Income", `<input id="coIncome" type="number" value="${wizard.data.coIncome || 45000}">`)}
      ${field("coEmployer", "Employer / Business Name", `<input id="coEmployer" value="${wizard.data.coEmployer || "Apex Services"}">`)}
      ${field("coDesignation", "Designation / Role", `<input id="coDesignation" value="${wizard.data.coDesignation || "Manager"}">`)}
    </div>
    <div class="readonly-banner"><span>✓</span><div>Only personal and employment information is captured here; additional non-essential sections are intentionally excluded.</div></div>`}
  ${wizardActions()}`;
}

function stepDocuments() {
  const cats = [...new Set(docChecklist.map(d => d.category))];
  return `${wizardHeader("Documents & Live KYC", "Upload from camera or gallery, capture front and rear within a single document type, and follow the required checklist.")}
  <div class="notice warn"><label style="display:flex;align-items:flex-start;gap:10px"><input id="demoMandatoryBypass" type="checkbox" ${wizard.demoMandatoryBypass ? "checked" : ""} onchange="setDemoMandatoryBypass(this.checked)"><span><b>Bypass due to demo purpose</b><br><small>Bypasses document checklist requirements for this demo only. No documents are uploaded or verified by this option.</small></span></label></div>
  ${wizard.demoMandatoryBypass ? `<div class="funnel-row"><div><div class="label"><span>Demo document checklist completion</span><span>100%</span></div><div class="progress"><span style="width:100%"></span></div></div><strong>100%</strong></div>` : ""}
  <div class="camera-box">
    <div><video id="kycVideo" playsinline autoplay muted></video><div class="action-row" style="margin-top:8px"><button class="secondary-btn" id="startCameraBtn">Start Camera</button><button class="ghost-btn" id="captureBtn">Capture Live Photo</button></div></div>
    <div><canvas id="kycCanvas"></canvas><div class="notice info" style="margin-top:8px">Camera access requires a secure (HTTPS) connection. On mobile, file inputs also allow camera/gallery selection.</div></div>
  </div>
  <div style="height:14px"></div>
  <div class="doc-tabs">${["ALL", ...cats].map((c, i) => `<button class="doc-tab ${i === 0 ? 'active' : ''}" data-doccat="${c}">${c}</button>`).join("")}</div>
  <div id="docList" class="doc-list">${renderDocRows("ALL")}</div>
  ${wizardActions()}`;
}
function setDemoMandatoryBypass(enabled) {
  wizard.demoMandatoryBypass = enabled === true;
  renderWizard();
}
function renderDocRows(cat) {
  const docs = docChecklist.filter(d => cat === "ALL" || d.category === cat).slice(0, 16);
  return docs.map((d, i) => `<div class="doc-row">
    <div class="doc-title"><b>${d.name}</b><span>${d.category}</span></div>
    <span class="badge ${wizard.demoMandatoryBypass ? 'amber' : d.mandatory.includes('Mandatory') ? 'red' : 'gray'}">${wizard.demoMandatoryBypass ? 'Bypassed for demo' : d.mandatory}</span>
    <span class="badge gray">${d.type}</span>
    <div class="upload-actions">
      <label class="upload-btn">Upload ${d.side === "frontRear" ? "Front" : "File"}<input type="file" accept="image/*,.pdf" capture="environment" onchange="markUploaded(this,'${cssSafe(d.name)}','front')"></label>
      ${d.side === "frontRear" ? `<label class="upload-btn">Upload Rear<input type="file" accept="image/*,.pdf" capture="environment" onchange="markUploaded(this,'${cssSafe(d.name)}','rear')"></label>` : ""}
      <span id="up-${cssSafe(d.name)}" class="uploaded">${wizard.docs[d.name] ? "✓ Uploaded" : wizard.demoMandatoryBypass ? "Demo bypass (not uploaded)" : ""}</span>
    </div>
  </div>`).join("");
}
function cssSafe(s) { return s.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 32) }
function markUploaded(input, nameKey, side) {
  if (!input.files?.[0]) return;
  const doc = docChecklist.find(d => cssSafe(d.name) === nameKey);
  if (doc) { wizard.docs[doc.name] = true; $("#up-" + nameKey).textContent = "✓ Uploaded"; showToast(`${doc.name} ${side} uploaded`); }
}

function stepAsset() {
  if (wizard.product === "Two Wheeler") return `${wizardHeader("Asset / Collateral", "Search and select vehicle make/model. This search interaction reflects the BRD requirement for mobile and web accessibility.")}
    <div class="field-grid three">
      ${field("vehicleMake", "Vehicle Make", `<div class="searchable-select"><input id="vehicleMake" placeholder="Search make..." value="${losEscapeHtml(wizard.data.vehicleMake || "")}"><div id="vehicleMakeResults" class="search-results hidden"></div></div>`)}
      ${field("vehicleModel", "Model / Variant", `<input id="vehicleModel" value="${losEscapeHtml(wizard.data.vehicleModel || "Activa 125 H-Smart")}">`)}
      ${field("vehicleType", "Fuel Type", `<select id="vehicleType">${["Petrol","Electric"].map(value => `<option ${wizard.data.vehicleType === value ? "selected" : ""}>${value}</option>`).join("")}</select>`)}
      ${field("dealerName", "Dealer", `<input id="dealerName" value="${losEscapeHtml(wizard.data.dealerName || "Pink City Motors")}">`)}
      ${field("rto", "RTO Charges", `<input id="rto" type="number" value="${losEscapeHtml(wizard.data.rto ?? 0)}">`)}
      ${field("vehicleInsurance", "Vehicle Insurance", `<input id="vehicleInsurance" type="number" value="${losEscapeHtml(wizard.data.vehicleInsurance ?? 0)}">`)}
      ${field("hpn", "HPN Charges", `<input id="hpn" type="number" value="${losEscapeHtml(wizard.data.hpn ?? 0)}">`)}
      ${field("accessories", "Accessories", `<input id="accessories" type="number" value="${losEscapeHtml(wizard.data.accessories ?? 0)}">`)}
      ${field("onRoadPrice", "On-road Price", `<input id="onRoadPrice" type="number" value="${losEscapeHtml(wizard.data.onRoadPrice || 145000)}">`)}
      ${field("downPayment", "Down Payment", `<input id="downPayment" type="number" value="${losEscapeHtml(wizard.data.downPayment || 25000)}">`)}
    </div>${wizardActions()}`;
  if (wizard.product === "MSME") return `${wizardHeader("Business Assessment", "Product-specific extension for MSME. These fields are added to support the requested product; they are not specified in the supplied vehicle BRD.")}
    <div class="field-grid three">
      ${field("businessName", "Business Name", `<input id="businessName" value="Riya Enterprises">`)}
      ${field("businessType", "Constitution", `<select id="businessType"><option>Proprietorship</option><option>Partnership</option><option>Private Limited</option></select>`)}
      ${field("businessVintage", "Business Vintage (Years)", `<input id="businessVintage" type="number" value="6">`)}
      ${field("gstin", "GSTIN", `<input id="gstin" value="08ABCDE1234F1Z5">`)}
      ${field("turnover", "Annual Turnover", `<input id="turnover" type="number" value="4800000">`)}
      ${field("loanPurpose", "Loan Purpose", `<select id="loanPurpose"><option>Working Capital</option><option>Business Expansion</option><option>Equipment Purchase</option></select>`)}
    </div>${wizardActions()}`;
  if (wizard.product === "Tractor Loan") {
    const tv = (k, d) => wizard.data[k] ?? d, ti = (k, l, d, t = "text") => field(k, l, `<input id="${k}" type="${t}" value="${losEscapeHtml(tv(k, d))}">`), ts = (k, l, o) => field(k, l, `<select id="${k}">${o.map(x => `<option ${tv(k, o[0]) === x ? "selected" : ""}>${losEscapeHtml(x)}</option>`).join("")}</select>`), sec = t => `<h4 style="margin:18px 0 8px;font-size:14px;color:var(--shell-ink,#16233f)">${losEscapeHtml(t)}</h4>`; return `${wizardHeader("Tractor & Farm Asset", "Tractor, dealer, agriculture profile, land and existing asset details for Tractor Loan (demo data).")}
    ${sec("Tractor Details")}<div class="field-grid three">
      ${ts("tractorType", "Tractor Type", ["Utility Tractor", "Orchard Tractor", "Mini Tractor", "Heavy Duty (50+ HP)"])}
      ${ts("tractorCondition", "New / Used", ["New", "Used / Refinanced"])}
      ${ti("tractorMake", "Manufacturer / Make", "Mahindra")}
      ${ti("tractorModel", "Model", "575 DI XP Plus")}
      ${ti("tractorVariant", "Variant", "2WD")}
      ${ti("tractorYear", "Manufacturing Year", 2026, "number")}
      ${ti("tractorHp", "Horsepower (HP)", 47, "number")}
      ${ts("tractorFuel", "Fuel Type", ["Diesel", "Electric", "CNG"])}
      ${ti("exShowroomPrice", "Ex-showroom Price", 925000, "number")}
      ${ti("onRoadPrice", "On-road Price", 968000, "number")}
      ${ti("quotationAmount", "Quotation Amount", 960000, "number")}
      ${ti("accessories", "Implements / Accessories", 0, "number")}
      ${ti("tractorRegNo", "Registration No. (used tractors)", "")}
    </div>
    ${sec("Dealer")}<div class="field-grid three">
      ${ti("dealerName", "Dealer", "Kisan Agro Motors")}
      ${ti("dealerCode", "Dealer Code", "DLR-TR-0142")}
      ${ti("dealerLocation", "Dealer Location", "Jaipur")}
      ${ti("dealerContact", "Dealer Contact", "98290 41420")}
      ${ti("dealerQuoteNo", "Dealer Quotation No.", "KAM/Q/2026/318")}
      ${ti("dealerBankAc", "Dealer Payout Account", "HDFC ••••4471")}
    </div>
    ${sec("Agriculture Profile")}<div class="field-grid three">
      ${ts("farmerType", "Farmer Type", ["Small (1–2 ha)", "Marginal (<1 ha)", "Medium (2–10 ha)", "Large (10+ ha)"])}
      ${ti("agriExperience", "Agriculture Experience (yrs)", 12, "number")}
      ${ts("primaryOccupation", "Primary Occupation", ["Farming", "Dairy", "Agri Contractor", "Horticulture"])}
      ${ti("secondaryOccupation", "Secondary Occupation", "Dairy")}
      ${ti("annualAgriIncome", "Annual Agricultural Income", 520000, "number")}
      ${ti("otherIncome", "Other Income", 90000, "number")}
      ${ti("cropType", "Crop Type", "Wheat, Mustard, Bajra")}
      ${ti("cropCycles", "Crop Cycles / Year", 2, "number")}
      ${ts("seasonalIncome", "Seasonal Income Pattern", ["Rabi + Kharif", "Rabi only", "Kharif only", "Year-round"])}
    </div>
    ${sec("Land Details")}<div class="field-grid three">
      ${ts("landOwnership", "Land Ownership", ["Owned", "Leased", "Owned + Leased", "Family / Joint"])}
      ${ti("landHolding", "Total Land (Acres)", 4, "number")}
      ${ti("irrigatedLand", "Irrigated Land (Acres)", 3, "number")}
      ${ti("nonIrrigatedLand", "Non-irrigated Land (Acres)", 1, "number")}
      ${ti("leasedLand", "Leased Land (Acres)", 0, "number")}
      ${ti("landLocation", "Land Location (Village / Tehsil)", "Chomu, Jaipur")}
      ${ti("landRecordNo", "Land Record (Khasra / 7/12 / Jamabandi)", "KH-1182/4")}
    </div>
    ${sec("Existing Assets & Liabilities")}<div class="field-grid three">
      ${ts("existingTractor", "Existing Tractor", ["None", "Yes – owned", "Yes – financed"])}
      ${ti("existingEquipment", "Existing Agri Equipment", "Rotavator, Thresher")}
      ${ti("existingAgriLoans", "Existing Agri Loan EMI / month", 0, "number")}
      ${ti("otherLiabilities", "Other Liabilities", "KCC ₹1,50,000")}
    </div>${wizardActions()}`;
  }
  if (wizard.product === "LAP") return `${wizardHeader("Property Collateral", "Product-specific extension for LAP. These fields are added to support the requested product; they are not specified in the supplied vehicle BRD.")}
    <div class="field-grid three">
      ${field("propertyType", "Property Type", `<select id="propertyType">${["Residential","Commercial","Industrial"].map(value => `<option ${wizard.data.propertyType === value || (!wizard.data.propertyType && value === "Residential") ? "selected" : ""}>${value}</option>`).join("")}</select>`)}
      ${field("propertyOwner", "Property Owner", `<input id="propertyOwner" value="${losEscapeHtml(wizard.data.propertyOwner || "Aarav Sharma")}">`)}
      ${field("marketValue", "Estimated Market Value", `<input id="marketValue" type="number" value="${losEscapeHtml(wizard.data.marketValue || 6500000)}">`)}
      ${field("propertyAddress", "Property Address", `<input id="propertyAddress" value="${losEscapeHtml(wizard.data.propertyAddress || "Vaishali Nagar, Jaipur")}">`)}
      ${field("legalStatus", "Legal Check", `<select id="legalStatus">${["Pending","Clear","Query Raised"].map(value => `<option ${wizard.data.legalStatus === value || (!wizard.data.legalStatus && value === "Pending") ? "selected" : ""}>${value}</option>`).join("")}</select>`)}
      ${field("technicalStatus", "Technical Valuation", `<select id="technicalStatus">${["Pending","Completed"].map(value => `<option ${wizard.data.technicalStatus === value || (!wizard.data.technicalStatus && value === "Pending") ? "selected" : ""}>${value}</option>`).join("")}</select>`)}
    </div>${wizardActions()}`;
  return `${wizardHeader("Solar Asset", "Product-specific extension for Solar Loan. These fields are added to support the requested product; they are not specified in the supplied vehicle BRD.")}
    <div class="field-grid three">
      ${field("systemSize", "System Size (kW)", `<input id="systemSize" type="number" value="${losEscapeHtml(wizard.data.systemSize || 12)}">`)}
      ${field("epcVendor", "EPC Vendor", `<input id="epcVendor" value="${losEscapeHtml(wizard.data.epcVendor || "SunGrid Energy")}">`)}
      ${field("projectCost", "Project Cost", `<input id="projectCost" type="number" value="${losEscapeHtml(wizard.data.projectCost || 780000)}">`)}
      ${field("subsidy", "Expected Subsidy", `<input id="subsidy" type="number" value="${losEscapeHtml(wizard.data.subsidy || 0)}">`)}
      ${field("roofType", "Installation Type", `<select id="roofType">${["Rooftop","Ground Mounted"].map(value => `<option ${wizard.data.roofType === value || (!wizard.data.roofType && value === "Rooftop") ? "selected" : ""}>${value}</option>`).join("")}</select>`)}
      ${field("consumerNo", "Electricity Consumer No.", `<input id="consumerNo" value="${losEscapeHtml(wizard.data.consumerNo || "JVVNL-88201922")}">`)}
      ${field("monthlyBill", "Avg. Monthly Bill", `<input id="monthlyBill" type="number" value="${losEscapeHtml(wizard.data.monthlyBill || 22000)}">`)}
    </div>${wizardActions()}`;
}

const productDetailFields = {
  "Two Wheeler":["vehicleMake","vehicleModel","vehicleType","dealerName","onRoadPrice","downPayment","rto","vehicleInsurance","hpn","accessories"],
  "Solar Loan":["systemSize","epcVendor","projectCost","subsidy","roofType","consumerNo","monthlyBill"],
  LAP:["propertyType","propertyOwner","marketValue","propertyAddress","legalStatus","technicalStatus"],
  "Tractor Loan":["tractorType","tractorCondition","tractorMake","tractorModel","tractorVariant","tractorYear","tractorHp","tractorFuel","exShowroomPrice","onRoadPrice","quotationAmount","accessories","tractorRegNo","dealerName","dealerCode","dealerLocation","dealerContact","dealerQuoteNo","dealerBankAc","farmerType","agriExperience","primaryOccupation","secondaryOccupation","annualAgriIncome","otherIncome","cropType","cropCycles","seasonalIncome","landOwnership","landHolding","irrigatedLand","nonIrrigatedLand","leasedLand","landLocation","landRecordNo","existingTractor","existingEquipment","existingAgriLoans","otherLiabilities"]
};
const productLtvLimits = { "Two Wheeler":90, "Solar Loan":80, LAP:65, "Tractor Loan":85 };
const productLoanRanges = {
  "Two Wheeler":{ min:30000, max:300000, maxTenure:48 },
  "Solar Loan":{ min:100000, max:2000000, maxTenure:84 },
  LAP:{ min:500000, max:20000000, maxTenure:180 },
  "Tractor Loan":{ min:200000, max:2500000, maxTenure:84 }
};
function productAssetBase(data = wizard.data) {
  if (wizard.product === "Two Wheeler") return Number(data.onRoadPrice || 0);
  if (wizard.product === "Solar Loan") return Number(data.projectCost || 0);
  if (wizard.product === "LAP") return Number(data.marketValue || 0);
  return Number(data.quotationAmount || data.onRoadPrice || data.exShowroomPrice || 0) + Number(data.accessories || 0);
}
function saveWizardProductDetails(app) {
  if (!app) return true;
  const details = Object.fromEntries((productDetailFields[wizard.product] || [])
    .filter(key => wizard.data[key] !== undefined)
    .map(key => [key, wizard.data[key]]));
  if (!Object.keys(details).length) return true;
  if (app.lifecycleManaged) {
    if (typeof window.nfSaveLifecycleProductDetails !== "function") {
      showToast("Product details could not be saved to the shared lifecycle.");
      return false;
    }
    return window.nfSaveLifecycleProductDetails(app.id, details);
  }
  app.productDetails = { ...(app.productDetails || {}), ...details };
  return true;
}
function validateProductEconomics() {
  const base = productAssetBase(), limit = productLtvLimits[wizard.product];
  const loan = Number(wizard.data.finalAmount || wizard.data.requestedAmount || 0);
  const tenure = Number(wizard.data.finalTenure || wizard.data.tenure || 0);
  const rate = Number(wizard.data.finalRate || wizard.data.interestRate || 0);
  const range = productLoanRanges[wizard.product];
  const subsidy = Number(wizard.data.subsidy || 0);
  if (!range || !limit) return true;
  if (!Number.isFinite(base) || base <= 0) { showToast("Enter a valid " + (wizard.product === "LAP" ? "property value" : wizard.product === "Solar Loan" ? "project cost" : "asset cost") + " before sending the case to Credit."); return false; }
  if (!Number.isFinite(loan) || loan <= 0) { showToast("Enter a valid requested loan amount."); return false; }
  if (loan < range.min || loan > range.max) { showToast(wizard.product + " amount must be between " + money(range.min) + " and " + money(range.max) + "."); return false; }
  if (!Number.isFinite(tenure) || tenure < 3 || tenure > range.maxTenure) { showToast(wizard.product + " tenure must be between 3 and " + range.maxTenure + " months."); return false; }
  if (!Number.isFinite(rate) || rate < 1 || rate > 40) { showToast("Enter a valid annual interest rate between 1% and 40%."); return false; }
  if (!Number.isFinite(subsidy) || subsidy < 0) { showToast("Expected subsidy cannot be negative."); return false; }
  if (wizard.product === "Solar Loan" && subsidy > base) { showToast("Expected subsidy cannot exceed the solar project cost."); return false; }
  if (loan > base * limit / 100) { showToast(wizard.product + " requested amount exceeds the " + limit + "% product LTV limit."); return false; }
  return true;
}

function stepLoan() {
  const amt = Number(wizard.data.requestedAmount || productDefaultAmount()), rate = Number(wizard.data.interestRate || products[wizard.product].rate), tenure = Number(wizard.data.tenure || products[wizard.product].tenure), e = emi(amt, rate, tenure);
  const assetBase = productAssetBase(), ltvLimit = productLtvLimits[wizard.product];
  return `${wizardHeader("Loan & Repayment", "Verify installment details, choose repayment mode and prepare the case for Credit / CAM.")}
  <div class="notice info">${losEscapeHtml(wizard.product)} asset base: ${money(assetBase)} • maximum LTV ${ltvLimit}% • eligible amount ${money(assetBase * ltvLimit / 100)}. Product limit is checked before continuing.</div>
  <div class="field-grid three">
    ${field("finalAmount", "Loan Amount", `<input id="finalAmount" type="number" value="${amt}">`)}
    ${field("finalRate", "ROI %", `<input id="finalRate" type="number" step=".05" value="${rate}">`)}
    ${field("finalTenure", "Tenure (Months)", `<input id="finalTenure" type="number" value="${tenure}">`)}
    ${field("repaymentMode", "Repayment Mode", `<select id="repaymentMode"><option>E-Nach</option><option>Nach</option><option>PDC</option><option>NPDC</option></select>`)}
    ${field("firstEmiDate", "First EMI Date", `<input id="firstEmiDate" type="date" value="2026-11-05">`)}
    ${field("processingFee", "Processing Fee", `<input id="processingFee" type="number" value="${Math.round(amt * .02)}">`)}
  </div>
  <div style="height:14px"></div>
  <div class="summary-block">
    <div class="card-title-row"><div><h3 style="font-size:11px">Installment Verification</h3><p>System-calculated schedule preview with discrepancy validation.</p></div><span class="badge green">Verified</span></div>
    ${installmentPreview(amt, rate, tenure)}
    <div class="validation-row"><div><strong>Installment validation</strong><span class="muted">Calculated EMI matches current loan terms.</span></div><span class="badge green">No discrepancy</span></div>
  </div>
  ${wizardActions()}`;
}
function stepImdBsa() {
  return `${wizardHeader("IMD & BSA", "Capture the initial margin deposit and record the bank statement analysis status.")}
  <div class="field-grid three">
    ${field("imdAmount", "IMD Amount", `<input id="imdAmount" type="number" min="0" value="${wizard.data.imdAmount || ""}" placeholder="Enter amount">`)}
    ${field("imdMode", "IMD Payment Mode", `<select id="imdMode"><option${wizard.data.imdMode === "Cash" ? " selected" : ""}>Cash</option><option${wizard.data.imdMode === "Cheque" ? " selected" : ""}>Cheque</option><option${wizard.data.imdMode === "NEFT / RTGS" ? " selected" : ""}>NEFT / RTGS</option></select>`)}
    ${field("imdDate", "IMD Date", `<input id="imdDate" type="date" value="${wizard.data.imdDate || ""}">`)}
    ${field("bsaStatus", "Bank Statement Analysis", `<select id="bsaStatus"><option${wizard.data.bsaStatus === "Pending" ? " selected" : ""}>Pending</option><option${wizard.data.bsaStatus === "In Progress" ? " selected" : ""}>In Progress</option><option${wizard.data.bsaStatus === "Completed" ? " selected" : ""}>Completed</option></select>`)}
    ${field("bsaRemarks", "BSA Remarks", `<input id="bsaRemarks" value="${wizard.data.bsaRemarks || ""}" placeholder="Optional">`)}
  </div>${wizardActions()}`;
}
function installmentPreview(amt, rate, tenure) {
  const e = emi(amt, rate, tenure), r = rate / 1200;
  let bal = amt, rows = [];
  for (let i = 1; i <= Math.min(5, tenure); i++) { const interest = bal * r, principal = Math.min(e - interest, bal); bal -= principal; rows.push({ i, e, principal, interest, bal: Math.max(0, bal) }) }
  return `<div class="table-wrap"><table class="installment-table"><thead><tr><th>#</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>${rows.map(x => `<tr><td>${x.i}</td><td>${money(x.e)}</td><td>${money(x.principal)}</td><td>${money(x.interest)}</td><td>${money(x.bal)}</td></tr>`).join("")}</tbody></table></div>`
}
function stepReview() {
  const amt = wizard.data.finalAmount || wizard.data.requestedAmount || productDefaultAmount();
  const selectedApp = getWizardApplication();
  return `${wizardHeader("Review & Submit", "Final review before sending the completed application to the LOS queue.")}
  ${selectedApp ? `<div class="los-selected-case"><div><b>Selected Application</b><strong>${selectedApp.id}</strong></div><div><b>Customer</b><strong>${selectedApp.customer}</strong></div><div><b>Product</b><strong>${selectedApp.product}</strong></div><div><b>Loan Amount</b><strong>${money(selectedApp.amount)}</strong></div><div><b>Status</b><strong>${selectedApp.status}</strong></div></div>` : ""}
  <div class="notice success">✓ Core BRD controls are active: Live KYC, checklist-based upload, front/rear document support, locked source obligation, optional bank details, streamlined co-applicant/guarantor, installment verification, CAM transfer and configured repayment modes.</div>
  <div style="height:14px"></div>
  <div class="grid two">
    <div class="summary-block"><h4>Application</h4><div class="summary-grid">
      ${summary("Product", wizard.product)}${summary("Requested Amount", money(amt))}${summary("Estimated EMI", money(emi(amt, wizard.data.finalRate || wizard.data.interestRate || products[wizard.product].rate, wizard.data.finalTenure || wizard.data.tenure || products[wizard.product].tenure)))}
      ${summary("Source", wizard.data.sourceChannel || "Dealer / DSA")}${summary("Branch", wizard.data.branch || "Jaipur - VKI")}${summary("Repayment", wizard.data.repaymentMode || "E-Nach")}
      ${summary("IMD Amount", wizard.data.imdAmount ? money(wizard.data.imdAmount) : "Not entered")}${summary("BSA", wizard.data.bsaStatus || "Pending")}
    </div></div>
    <div class="summary-block"><h4>Applicant</h4><div class="summary-grid">
      ${summary("Name", (wizard.data.firstName || "Aarav") + " " + (wizard.data.lastName || "Sharma"))}${summary("Mobile", wizard.data.mobile || "9829011820")}${summary("PAN", wizard.data.pan || "ABCDE1234F")}
      ${summary("Employment", wizard.data.employment || "Salaried")}${summary("Bank Details", "Optional / Not required")}${summary("Co-party", wizard.coType)}
    </div></div>
  </div>
  <div style="height:14px"></div>
  <div class="summary-block"><h4>Document Readiness</h4><div class="funnel-row"><div><div class="label"><span>${wizard.demoMandatoryBypass ? "Demo checklist completion" : "Uploaded in current prototype"}</span><span>${wizard.demoMandatoryBypass ? "Bypassed for demo" : `${Object.keys(wizard.docs).length} / ${docChecklist.length}`}</span></div><div class="progress"><span style="width:${Math.max(4, wizard.demoMandatoryBypass ? 100 : Object.keys(wizard.docs).length / docChecklist.length * 100)}%"></span></div></div><strong>${wizard.demoMandatoryBypass ? 100 : Math.round(Object.keys(wizard.docs).length / docChecklist.length * 100)}%</strong></div><small class="muted">${wizard.demoMandatoryBypass ? "Mandatory document checks were bypassed for this demo; no documents were uploaded or verified." : "You can submit the prototype even with pending files so the complete workflow can be tested."}</small></div>
  <div class="wizard-actions"><button class="ghost-btn" onclick="wizardBack()">← Back</button><button class="primary-btn" onclick="submitApplication()">Send to LOS →</button></div>`;
}
function summary(k, v) { return `<div class="summary-item"><span>${k}</span><b>${v}</b></div>` }

function selectProduct(n) {
  if (wizard.product === n) return;
  captureWizardData();
  wizard.product = n;
  wizard.selectedApplicationId = null;
  wizard.data = {};
  resetLosPages();
  renderWizard();
}
function goWizardStep(step) { if (step < wizard.step && step >= 0) { captureWizardData(); wizard.step = step; renderWizard(); } }
function captureWizardData() {
  const selector = wizard.step === 0 ? ".los-source-fields input[id],.los-source-fields select[id]" : "input[id],select[id]";
  $$(selector, $(".wizard-main")).forEach(el => {
    if (!el.closest("#pdForm") && !["vehicleMakeResults"].includes(el.id)) wizard.data[el.id] = el.value;
  });
}
function wizardNext() {
  if (wizard.step === 0) {
    captureWizardData();
    let app = getWizardApplication();
    if (!app) {
      const product = products[wizard.product];
      if (!product) return showToast("Select a valid loan product before continuing.");
      const name = [wizard.data.firstName, wizard.data.lastName].filter(Boolean).join(" ").trim();
      let sequence = 10483 + applications.length;
      let id;
      do { id = `SKF-${product.code}-${String(sequence++).padStart(5, "0")}`; } while (applications.some(item => item.id === id));
      app = {
        id, customer:name || wizard.data.businessName || "New applicant",
        mobile:wizard.data.mobile || "", altMobile:wizard.data.altMobile || "",
        email:wizard.data.email || "", city:wizard.data.city || "", pincode:wizard.data.pincode || "",
        pan:wizard.data.pan || "", aadhaar:wizard.data.aadhaar || "", business:wizard.data.businessName || "",
        crmSource:wizard.data.sourceChannel || "", product:wizard.product,
        amount:Number(wizard.data.requestedAmount || productDefaultAmount()),
        branch:wizard.data.branch || "Jaipur - VKI", status:"Draft", stage:0, score:0, docs:0,
        created:new Date().toLocaleDateString("en-IN"),
        owner:wizard.data.salesExec || currentUser.name, repayment:"—"
      };
      applications.unshift(app);
      wizard.selectedApplicationId = app.id;
      if (typeof ensureWorkflowData === "function") ensureWorkflowData();
      if (typeof v7FillAll === "function") v7FillAll();
      const badge = $("#appCountBadge");
      if (badge) badge.textContent = applications.length;
    }
    const customerParts = (app.customer || "").trim().split(/\s+/).filter(Boolean);
    wizard.data = {
      ...wizard.data,
      firstName: wizard.data.firstName ?? customerParts[0] ?? "",
      lastName: wizard.data.lastName ?? customerParts.slice(1).join(" "),
      mobile: wizard.data.mobile ?? app.mobile ?? "",
      requestedAmount: wizard.data.requestedAmount ?? app.amount,
      branch: wizard.data.branch ?? app.branch ?? "",
      salesExec: wizard.data.salesExec ?? app.owner ?? "",
      interestRate: wizard.data.interestRate ?? products[app.product].rate,
      tenure: wizard.data.tenure ?? products[app.product].tenure
    };
  }
  captureWizardData();
  if (wizard.step === 4 && !saveWizardProductDetails(getWizardApplication())) return;
  if (wizard.step === 6 && !validateProductEconomics()) return;
  if (wizard.step === 3) {
    const app = getWizardApplication();
    if (app) {
      app.demoMandatoryBypass = wizard.demoMandatoryBypass === true;
      app.docs = wizard.demoMandatoryBypass
        ? 100
        : Math.round(Object.keys(wizard.docs).length / docChecklist.length * 100);
    }
  }
  if (wizard.step < steps.length - 1) { wizard.step++; renderWizard() }
}
function wizardBack() { captureWizardData(); if (wizard.step > 0) { wizard.step--; renderWizard() } }
async function startCamera() {
  try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false }); const v = $("#kycVideo"); v.srcObject = stream; showToast("Camera started"); }
  catch (e) { showToast("Camera unavailable. Use gallery/camera upload instead."); }
}
function capturePhoto() {
  const v = $("#kycVideo"), c = $("#kycCanvas");
  if (!v?.videoWidth) { showToast("Start the camera first"); return }
  c.width = v.videoWidth; c.height = v.videoHeight; c.getContext("2d").drawImage(v, 0, 0, c.width, c.height); wizard.docs["LIVE PHOTO"] = true; showToast("Live KYC photo captured");
}
function bindWizardEvents() {
  if (wizard.step === 0) {
    bindLosFilterEvents();
    ["requestedAmount", "interestRate", "tenure"].forEach(id => $("#" + id)?.addEventListener("input", () => {
      const v = emi($("#requestedAmount").value, $("#interestRate").value, $("#tenure").value); $("#estimatedEmi").value = money(v);
    }));
  }
  if (wizard.step === 3) {
    $("#startCameraBtn")?.addEventListener("click", startCamera); $("#captureBtn")?.addEventListener("click", capturePhoto);
    $$(".doc-tab").forEach(btn => btn.addEventListener("click", () => {
      $$(".doc-tab").forEach(x => x.classList.remove("active")); btn.classList.add("active"); $("#docList").innerHTML = renderDocRows(btn.dataset.doccat);
    }));
  }
  if (wizard.step === 4 && wizard.product === "Two Wheeler") {
    const input = $("#vehicleMake"), box = $("#vehicleMakeResults");
    const refresh = () => { const q = input.value.toLowerCase(); const vals = vehicleMakes.filter(x => x.toLowerCase().includes(q)); box.innerHTML = vals.map(v => `<button type="button">${v}</button>`).join(""); box.classList.toggle("hidden", !input.matches(":focus") || !vals.length); $$("button", box).forEach(b => b.onclick = () => { input.value = b.textContent; box.classList.add("hidden") }) }
    input.addEventListener("input", refresh); input.addEventListener("focus", refresh); input.addEventListener("blur", () => setTimeout(() => box.classList.add("hidden"), 180));
  }
}
function submitApplication() {
  captureWizardData();
  const p = products[wizard.product];
  const existing = getWizardApplication();
  if (existing) {
    existing.customer = `${wizard.data.firstName || "Aarav"} ${wizard.data.lastName || ""}`.trim();
    existing.mobile = wizard.data.mobile || existing.mobile;
    existing.amount = Number(wizard.data.finalAmount || wizard.data.requestedAmount || existing.amount);
    existing.branch = wizard.data.branch || existing.branch;
    existing.owner = wizard.data.salesExec || existing.owner;
    existing.demoMandatoryBypass = wizard.demoMandatoryBypass === true;
    existing.docs = wizard.demoMandatoryBypass ? 100 : Math.round(Object.keys(wizard.docs).length / docChecklist.length * 100);
    if (existing.status === "Draft") { existing.status = "Sales/Predeal"; existing.stage = 1 }
    if (!saveWizardProductDetails(existing)) return;
    if (existing.lifecycleManaged && (typeof window.nfPersistLifecycleCase !== "function" || !window.nfPersistLifecycleCase(existing.id))) {
      showToast("The LOS case could not be saved to the shared lifecycle.");
      return;
    }
    showToast(`Application ${existing.id} updated`);
    navTo("case", existing.id);
    return;
  }
  const id = `SKF-${p.code}-${String(10483 + applications.length - 8).padStart(5, "0")}`;
  const a = { id, customer: (wizard.data.firstName || "Aarav") + " " + (wizard.data.lastName || "Sharma"), mobile: wizard.data.mobile || "9829011820", product: wizard.product, amount: Number(wizard.data.finalAmount || wizard.data.requestedAmount || productDefaultAmount()), branch: wizard.data.branch || "Jaipur - VKI", status: "Sales/Predeal", stage: 1, score: 0, docs: wizard.demoMandatoryBypass ? 100 : Math.round(Object.keys(wizard.docs).length / docChecklist.length * 100), demoMandatoryBypass: wizard.demoMandatoryBypass === true, created: "04 Oct 2026", owner: wizard.data.salesExec || "Neha Jain", repayment: wizard.data.repaymentMode || "E-Nach" };
  applications.unshift(a); $("#appCountBadge").textContent = applications.length; showToast(`Application ${id} created`); navTo("case", id);
}

function renderCase(id) {
  const a = applications.find(x => x.id === id); if (!a) return navTo("applications");
  setPage(a.id, "Applications / " + a.id);
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>${a.customer}</h2><p>${a.id} • ${a.product} • ${a.branch}</p></div><div class="action-row"><button class="ghost-btn" onclick="openCaseNote('${a.id}')">+ Add Note</button>${caseActionButton(a)}</div></div>
    <div class="card card-pad"><div class="card-title-row"><div><h3>Application Lifecycle</h3><p>Current stage: ${a.status}</p></div><span class="badge ${statusClass(a.status)}">${a.status}</span></div><div class="lifecycle">${lifecycle.map((st, i) => `<div class="life-step ${i < a.stage ? 'done' : ''} ${i === a.stage ? 'current' : ''}"><div class="life-wrap"><div class="circle">${i < a.stage ? '✓' : i + 1}</div><div class="life-label">${st === "IMD Pending" ? "IMD & BSA" : st}</div></div>${i < lifecycle.length - 1 ? '<div class="connector"></div>' : ''}</div>`).join("")}</div></div>
    <div style="height:16px"></div><div class="case-layout"><div class="case-main"><div class="card card-pad"><div class="tabbar">${['Overview', 'Applicant', 'Documents', 'Loan', 'CAM', 'Audit Trail'].map(t => `<button class="tab-btn ${activeCaseTab === t ? 'active' : ''}" onclick="setCaseTab('${a.id}','${t}')">${t}</button>`).join('')}</div><div style="height:16px"></div><div id="caseTabContent" class="case-tab-body">${renderCaseSection(a, activeCaseTab)}</div></div></div>
    <div class="case-side"><div class="card card-pad"><div class="card-title-row"><div><h3>Quick Controls</h3><p>Case-level operational actions</p></div></div><div class="action-row" style="display:grid"><button class="ghost-btn" onclick="openCaseDocuments('${a.id}')">▣ Open Documents</button><button class="ghost-btn" onclick="editCaseApplicant('${a.id}')">✎ Edit Applicant</button><button class="ghost-btn" onclick="showCreditMemo('${a.id}')">▤ Generate Credit Memo</button><button class="ghost-btn" onclick="downloadCaseAudit('${a.id}')">⇩ Download Audit Trail</button></div></div>
      <div class="card card-pad"><div class="card-title-row"><div><h3>Activity Timeline</h3><p>Latest case events</p></div></div><div class="timeline">${timelineItem('✓', `Case currently in ${a.status}`, 'Current')}${(a.notes || []).map(n => timelineItem('✎', n.text, n.date)).join('')}${timelineItem('▣', `${a.docs}% document checklist completed`, 'Today')}${timelineItem('◎', 'Applicant KYC data validated', 'Today')}${timelineItem('＋', `Application created by ${a.owner}`, a.created)}</div></div>
      <div class="card card-pad"><div class="card-title-row"><div><h3>Compliance</h3><p>Prototype controls</p></div></div><div class="notice success">Role-based access, secure document handling, audit visibility and validation patterns are represented in the UI. Production implementation requires real authentication, encryption, consent, API and audit services.</div></div></div></div>`;
}
function setCaseTab(id, tab) { activeCaseTab = tab; renderCase(id) }
function renderProductDetails(a) {
  const details = a.productDetails || {};
  const fields = (productDetailFields[a.product] || []).filter(key => details[key] !== undefined && details[key] !== "");
  if (!fields.length) return "";
  return `<div class="summary-block" style="margin-top:12px"><h4>${losEscapeHtml(a.product)} asset, collateral & economics</h4><div class="summary-grid">${fields.map(key => {
    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, letter => letter.toUpperCase());
    return summary(losEscapeHtml(label), losEscapeHtml(details[key]));
  }).join("")}</div></div>`;
}
function renderCaseSection(a, tab) {
  if (tab === 'Applicant') return `<div class="summary-block"><h4>Applicant</h4><div class="summary-grid">${summary('Customer', a.customer)}${summary('Mobile', a.mobile)}${summary('Branch', a.branch)}${summary('Owner', a.owner)}${summary('Credit Score', a.score || 'Pending')}${summary('Product', a.product)}</div></div>`;
  if (tab === 'Documents') return `<div class="summary-block"><h4>Document & KYC</h4><div class="funnel-row"><div><div class="label"><span>Checklist completion</span><span>${a.docs}%</span></div><div class="progress"><span style="width:${a.docs}%"></span></div></div><strong>${a.docs}%</strong></div><div class="action-row"><button class="primary-btn" onclick="openCaseDocuments('${a.id}')">Open Document Checklist</button><button class="ghost-btn" onclick="navTo('documents')">Document Center</button></div></div>`;
  if (tab === 'Loan') return `<div class="summary-block"><h4>Loan & Installments</h4><div class="summary-grid">${summary('Loan Amount', money(a.amount))}${summary('Indicative ROI', products[a.product].rate + '%')}${summary('Tenure', products[a.product].tenure + ' months')}${summary('Repayment', a.repayment)}${summary('Estimated EMI', money(emi(a.amount, products[a.product].rate, products[a.product].tenure)))}${summary('Status', a.status)}</div><div style="height:12px"></div>${installmentPreview(a.amount, products[a.product].rate, products[a.product].tenure)}${renderProductDetails(a)}</div>`;
  if (tab === 'CAM') return `<div class="summary-block"><h4>CAM Allocation / CAM Sheet</h4>${camPanel(a)}</div>`;
  if (tab === 'Audit Trail') return `<div class="summary-block"><h4>Audit Trail</h4><div class="timeline">${timelineItem('＋', 'Application created', a.created)}${timelineItem('▣', `Document readiness updated to ${a.docs}%`, 'Today')}${timelineItem('✓', `Status moved to ${a.status}`, 'Current')}${(a.notes || []).map(n => timelineItem('✎', n.text, n.date)).join('')}</div><div style="height:12px"><button class="ghost-btn" onclick="downloadCaseAudit('${a.id}')">Download Audit CSV</button></div></div>`;
  return `<div class="grid two"><div class="summary-block"><h4>Loan Summary</h4><div class="summary-grid">${summary('Product', a.product)}${summary('Loan Amount', money(a.amount))}${summary('Repayment', a.repayment)}${summary('Credit Score', a.score || 'Pending')}${summary('Branch', a.branch)}${summary('Owner', a.owner)}</div></div><div class="summary-block"><h4>Document & KYC</h4><div class="funnel-row"><div><div class="label"><span>Checklist completion</span><span>${a.docs}%</span></div><div class="progress"><span style="width:${a.docs}%"></span></div></div><strong>${a.docs}%</strong></div><div class="metric-list"><div class="metric"><span>Live KYC</span><b>${a.docs > 50 ? 'Captured' : 'Pending'}</b></div><div class="metric"><span>Front / Rear</span><b>Supported</b></div></div></div></div><div style="height:14px"></div><div class="summary-block"><h4>Installment Verification</h4>${installmentPreview(a.amount, products[a.product].rate, products[a.product].tenure)}<div class="validation-row"><div><strong>System verification</strong><span class="muted">No variance detected in the illustrative schedule.</span></div><span class="badge green">Verified</span></div></div>`;
}
function openCaseNote(id) { showModal('Add Case Note', `<label>Note<textarea id="caseNoteText" rows="4" placeholder="Enter case note"></textarea></label>`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="saveCaseNote('${id}')">Save Note</button>`) }
function saveCaseNote(id) { const a = applications.find(x => x.id === id); if (!a) return; const text = $('#caseNoteText').value.trim(); if (!text) return showToast('Enter a note'); a.notes = a.notes || []; a.notes.unshift({ text, date: '04 Oct 2026' }); closeModal(); showToast('Case note saved'); renderCase(id) }
function openCaseDocuments(id) { const a = applications.find(x => x.id === id); if (!a) return; const pending = docChecklist.slice(0, 8).map((d, i) => `<div class="check-row"><div><b>${d.name}</b><span>${d.category} • ${d.type}</span></div><span class="badge ${i / 8 * 100 < a.docs ? 'green' : 'amber'}">${i / 8 * 100 < a.docs ? 'Received' : 'Pending'}</span></div>`).join(''); showModal(`${id} • Documents`, `<div class="funnel-row"><div><div class="label"><span>Readiness</span><span>${a.docs}%</span></div><div class="progress"><span style="width:${a.docs}%"></span></div></div><strong>${a.docs}%</strong></div><div>${pending}</div>`, `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="primary-btn" onclick="closeModal();navTo('documents')">Open Document Center</button>`) }
function editCaseApplicant(id) { const a = applications.find(x => x.id === id); if (!a) return; showModal('Edit Applicant', `<div class="source-grid" style="grid-template-columns:1fr 1fr">${f('Customer Name', `<input id="editCaseName" value="${a.customer}">`)}${f('Mobile', `<input id="editCaseMobile" value="${a.mobile}">`)}${f('Owner', `<input id="editCaseOwner" value="${a.owner}">`)}${f('Branch', `<input id="editCaseBranch" value="${a.branch}">`)}</div>`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="saveCaseApplicant('${id}')">Save Changes</button>`) }
function saveCaseApplicant(id) { const a = applications.find(x => x.id === id); if (!a) return; a.customer = $('#editCaseName').value; a.mobile = $('#editCaseMobile').value; a.owner = $('#editCaseOwner').value; a.branch = $('#editCaseBranch').value; closeModal(); showToast('Applicant updated'); renderCase(id) }
function showCreditMemo(id) { const a = applications.find(x => x.id === id); if (!a) return; showModal(`Credit Memo • ${id}`, `<div class="modal-kv"><div><span>Customer</span><b>${a.customer}</b></div><div><span>Product</span><b>${a.product}</b></div><div><span>Requested Amount</span><b>${money(a.amount)}</b></div><div><span>Credit Score</span><b>${a.score || 'Pending'}</b></div><div><span>Documents</span><b>${a.docs}%</b></div><div><span>Decision Stage</span><b>${a.status}</b></div></div><div style="height:12px" class="notice info">Credit memo is generated from the current case state.</div>`, `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="primary-btn" onclick="window.print()">Print / Save PDF</button>`) }
function downloadCaseAudit(id) { const a = applications.find(x => x.id === id); if (!a) return; const rows = [['Date', 'Event', 'User'], [a.created, 'Application Created', a.owner], ['Today', `Documents ${a.docs}%`, 'System'], ['Current', `Status: ${a.status}`, 'Workflow'], ...(a.notes || []).map(n => [n.date, 'Note: ' + n.text, 'Credit Manager'])]; downloadText(`${id}-audit.csv`, rows.map(r => r.map(escapeCsv).join(',')).join('\n'), 'text/csv') }
function openActiveLoan(id) { const a = applications.find(x => x.id === id); showModal('Active Loan', `<div class="modal-kv"><div><span>Application</span><b>${a.id}</b></div><div><span>Customer</span><b>${a.customer}</b></div><div><span>Outstanding (demo)</span><b>${money(Math.round(a.amount * .82))}</b></div><div><span>Repayment Mode</span><b>${a.repayment}</b></div></div>`, `<button class="primary-btn" onclick="closeModal();navTo('repayments')">Open Repayments</button>`) }
function timelineItem(i, t, d) { return `<div class="timeline-item"><div class="timeline-icon">${i}</div><div><b>${t}</b><span>${d}</span></div></div>` }
function caseActionButton(a) {
  if (a.status === "Draft") return `<button class="primary-btn" onclick="advanceCase('${a.id}')">Send to Sales/Predeal →</button>`;
  if (a.status === "Sales/Predeal") return `<button class="primary-btn" onclick="advanceCase('${a.id}')">Send to Credit →</button>`;
  if (a.status === "Credit Review") return `<button class="primary-btn" onclick="advanceCase('${a.id}')">Approve & Allocate CAM →</button>`;
  if (a.status === "CAM Allocation") return `<button class="primary-btn" onclick="advanceCase('${a.id}')">Transfer to CAM Sheet →</button>`;
  if (a.status === "CAM Sheet") return `<button class="primary-btn" onclick="advanceCase('${a.id}')">Approve & Sanction →</button>`;
  if (a.status === "Sanctioned") return `<button class="primary-btn" onclick="advanceCase('${a.id}')">Move to Disbursement →</button>`;
  if (a.status === "Disbursement") return `<button class="primary-btn" onclick="advanceCase('${a.id}')">Mark Disbursed / Active →</button>`;
  return `<button class="secondary-btn" onclick="openActiveLoan('${a.id}')">Active Loan</button>`;
}
function camPanel(a) {
  const lifecycleStages = ["Sales/Predeal", "IMD Pending", "Credit Review", "CAM Allocation", "CAM Sheet", "Underwriting", "Operations Review", "Sanction Review", "Sanctioned", "Disbursement", "Active Loan"];
  const currentLifecycleStage = lifecycleStages.indexOf(a.status);
  const passedCamAllocation = a.lifecycleManaged && currentLifecycleStage > lifecycleStages.indexOf("CAM Allocation");
  const passedCamSheet = a.lifecycleManaged && currentLifecycleStage > lifecycleStages.indexOf("CAM Sheet");
  const camOwner = passedCamAllocation ? (a.workflow?.camOwner || "Not recorded") : a.stage >= 3 ? "Regional Credit Analyst" : "Not Allocated";
  const allocationStatus = a.lifecycleManaged
    ? passedCamAllocation ? "Completed" : a.status === "CAM Allocation" ? "In Progress" : "Pending"
    : a.stage >= 3 ? "Allocated" : "Pending";
  const camSheetStatus = a.lifecycleManaged
    ? passedCamSheet ? "Completed" : "Pending Transfer"
    : a.stage >= 4 ? "Available" : "Pending Transfer";
  return `<div class="grid three">
    <div class="metric"><span>CAM Owner</span><b>${camOwner}</b></div>
    <div class="metric"><span>Allocation Status</span><b>${allocationStatus}</b></div>
    <div class="metric"><span>CAM Sheet</span><b>${camSheetStatus}</b></div>
  </div>
  <div style="height:12px"></div>
  ${a.status === "CAM Allocation" ? `<div class="notice warn">This case is ready for transfer. Use the primary action above to move it to CAM Sheet without manual re-entry.</div>` : `<div class="notice info">Case transfer control is enabled. Movement between CAM Allocation and CAM Sheet is tracked in the lifecycle and audit timeline.</div>`}`;
}
function advanceCase(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  if (a.status === "Draft") { a.status = "Sales/Predeal"; a.stage = 0 }
  else if (a.status === "Sales/Predeal") { a.status = "Credit Review"; a.stage = 1 }
  else if (a.status === "Credit Review") { a.status = "CAM Allocation"; a.stage = 2 }
  else if (a.status === "CAM Allocation") { a.status = "CAM Sheet"; a.stage = 3 }
  else if (a.status === "CAM Sheet") { a.status = "Sanctioned"; a.stage = 4 }
  else if (a.status === "Sanctioned") { a.status = "Disbursement"; a.stage = 5 }
  else if (a.status === "Disbursement") { a.status = "Active Loan"; a.stage = 6 }
  showToast(`Case moved to ${a.status}`); renderCase(id);
}

function showModal(title, body, footer = "") {
  $("#modalRoot").innerHTML = `<div class="modal-overlay" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-header"><h3>${title}</h3><button class="close-btn" onclick="closeModal()">×</button></div><div class="modal-body">${body}</div>${footer ? `<div class="modal-footer">${footer}</div>` : ""}</div></div>`;
}
function closeModal() { $("#modalRoot").innerHTML = "" }

$("#loginForm").addEventListener("submit", e => { e.preventDefault(); const r = $("#loginRole")?.value; if (r) msme.role = r; $("#loginScreen").classList.add("hidden"); $("#appShell").classList.remove("hidden"); renderDashboard(); if (window.namdevAutoLogin) return; const ns = window.namdevSession; if (ns) ns.save(r || "CEO", $("#loginEmail")?.value || ""); const requestedReturn = ns ? ns.takeReturn() : ""; const ret = r === "CEO" ? "" : requestedReturn; if (ret) setTimeout(() => navTo(ret), 120); if (window.parent && window.parent !== window) window.parent.postMessage({ type: "namdev-login-success", role: r || "CEO", returnView: ret }, "*"); });
$("#togglePassword").addEventListener("click", () => { const i = $("#loginPassword"); i.type = i.type === "password" ? "text" : "password"; $("#togglePassword").textContent = i.type === "password" ? "Show" : "Hide" });
$("#logoutBtn").addEventListener("click", () => { sessionStorage.clear(); localStorage.removeItem("namdev-demo-session"); localStorage.removeItem("token"); window.top.location.href = "/"; });
$("#mobileMenuBtn").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#navMenu").addEventListener("click", e => { const b = e.target.closest(".nav-item"); if (b) navTo(b.dataset.view) });
$("#globalSearch").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const q = e.target.value.toLowerCase();
    const a = applications.find(x => (x.id + x.customer + x.mobile).toLowerCase().includes(q));
    if (a) navTo("case", a.id); else showToast("No matching case found");
  }
});


// ================= CRM / LEAD TO LOS JOURNEY =================
// The supplied PDFs start inside LOS/Omnifin. This CRM layer is a proposed front-office extension
// so the end-to-end NBFC journey starts at lead/enquiry capture and hands off into LOS.
function makeCRMState() {
  return {
    view: "dashboard", stage: 0, selectedId: "CRM-260104-001", productPreset: null,
    filters: { status: "All", product: "All" },
    leads: [
      { id: "CRM-260104-001", name: "Manish Pareek", business: "Pareek Agro Traders", mobile: "7894125963", product: "MSME", amount: 1000000, source: "DSA", branch: "Jaipur - Head Office", owner: "Govind Mishra", status: "Qualified", temperature: "Hot", stage: 3, next: "Today 11:30 AM", score: 78, probability: 75, created: "04 Oct 2026", converted: false },
      { id: "CRM-260104-002", name: "Aarav Sharma", business: "", mobile: "9829011820", product: "Two Wheeler", amount: 128000, source: "Dealer", branch: "Jaipur - VKI", owner: "Neha Jain", status: "Follow-up", temperature: "Warm", stage: 5, next: "Today 02:00 PM", score: 71, probability: 60, created: "04 Oct 2026", converted: false },
      { id: "CRM-260103-014", name: "Vikram Singh", business: "Shree Buildmart", mobile: "9982031202", product: "LAP", amount: 3500000, source: "Referral", branch: "Udaipur", owner: "Kavita Rao", status: "Opportunity", temperature: "Hot", stage: 7, next: "Tomorrow 10:00 AM", score: 84, probability: 82, created: "03 Oct 2026", converted: false },
      { id: "CRM-260103-011", name: "Sunrise Textiles", business: "Sunrise Textiles Pvt Ltd", mobile: "9784088440", product: "Solar Loan", amount: 880000, source: "Digital", branch: "Bhilwara", owner: "Rahul Saini", status: "Pre-Screen", temperature: "Hot", stage: 6, next: "Today 04:30 PM", score: 81, probability: 72, created: "03 Oct 2026", converted: false },
      { id: "CRM-260102-009", name: "Meena Kumari", business: "", mobile: "9001822730", product: "Two Wheeler", amount: 94000, source: "Walk-in", branch: "Kota", owner: "Alok Sharma", status: "New", temperature: "Cold", stage: 0, next: "05 Oct 2026", score: 55, probability: 25, created: "02 Oct 2026", converted: false },
      { id: "CRM-260102-006", name: "Jay Ambey Foods", business: "Jay Ambey Foods", mobile: "9214419003", product: "MSME", amount: 700000, source: "Existing Customer", branch: "Sikar", owner: "Nitin Joshi", status: "Converted", temperature: "Hot", stage: 8, next: "LOS Created", score: 88, probability: 100, created: "02 Oct 2026", converted: true }
    ],
    data: {
      leadDate: "2026-10-04", source: "DSA", campaign: "MSME Business Growth Q4", branch: "Jaipur - Head Office", owner: "Govind Mishra",
      product: "MSME", amount: 1000000, customerType: "Individual", firstName: "Manish", lastName: "Pareek", businessName: "Pareek Agro Traders",
      mobile: "7894125963", pan: "", aadhaar: "", altMobile: "", email: "manish.pareek@example.com", city: "Jaipur", pincode: "302013", preferredLanguage: "Hindi",
      consentAccepted: false, consentStatus: "Not Given", consentTimestamp: "", mobileOtpVerified: false,
      dedupeStatus: "", dedupeChecked: false, existingCustomerId: "",
      leadStatus: "Qualified", temperature: "Hot", contactability: "Contacted", age: 36, monthlyIncome: 85000, annualTurnover: 4800000, existingEmi: 18000,
      panAvailable: "Yes", aadhaarAvailable: "Yes", bureauConsent: "Yes", collateralAvailable: "Yes", preliminaryScore: 78,
      constitution: "Proprietorship", employmentType: "Business", businessVintage: 6, gstin: "08ABCDE1234F1Z5", udyam: "UDYAM-RJ-17-0012345",
      residenceAddress: "Mansarovar, Jaipur", officeAddress: "VKI Industrial Area, Jaipur", loanPurpose: "Working Capital", tenure: 48, roi: 17,
      assignedRM: "Govind Mishra", assignedSales: "Neha Jain", dsaDealer: "Raj Finance DSA", sla: "4 Hours", nextAction: "Customer Visit", nextDue: "2026-10-04T14:30",
      opportunityName: "Pareek Agro MSME - Q4", probability: 75, expectedClose: "2026-10-08", offeredAmount: 900000, offeredTenure: 48, offeredRoi: 16.5,
      eligibility: "Eligible with conditions", notes: "Customer requires working capital for seasonal inventory."
    },
    activities: [
      { type: "Call", date: "04 Oct 2026 10:20", user: "Govind Mishra", outcome: "Connected", note: "Requirement discussed; customer requested ₹10 lakh." },
      { type: "WhatsApp", date: "04 Oct 2026 10:35", user: "Govind Mishra", outcome: "Sent", note: "Document checklist shared." },
      { type: "Visit", date: "04 Oct 2026 12:00", user: "Neha Jain", outcome: "Planned", note: "Business premise visit scheduled." }
    ],
    prescreen: { "PAN": true, "Aadhaar": true, "Business Proof": true, "Bank Statement": false, "GST / Udyam": true, "ITR / Financials": false, "Quotation / Invoice": false, "Property Papers": false, "Electricity Bill": false },
    losId: null
  };
}
const crmStages = ["Lead Capture", "Qualification", "Customer Profile", "Requirement & Eligibility", "Assignment", "Follow-up", "Pre-Screen Docs", "Opportunity / Offer", "LOS Handoff"];

function renderCRM(arg) {
  if (typeof bdmRestoreLeads === "function") bdmRestoreLeads();
  setPage("CRM & Leads", "CRM / Lead Management");
  if (arg === "new") { crm.view = "journey"; crm.stage = 0 }
  if (typeof arg === "string" && arg.startsWith("CRM-")) { crm.selectedId = arg; crm.view = "journey"; const l = crm.leads.find(x => x.id === arg); if (l) { crm.stage = l.stage; hydrateCRMFromLead(l) } }
  if (crm.view === "dashboard") renderCRMDashboard(); else renderCRMJourney();
}
function hydrateCRMFromLead(l) {
  crm.productPreset = l.productJourneyKey || null;
  crm.data.product = l.product; crm.data.amount = l.amount; crm.data.source = l.source; crm.data.branch = l.branch; crm.data.owner = l.owner;
  crm.data.mobile = l.mobile; crm.data.leadStatus = l.status; crm.data.temperature = l.temperature; crm.data.preliminaryScore = l.score; crm.data.probability = l.probability;
  crm.data.pan = l.pan || ''; crm.data.aadhaar = l.aadhaar || '';
  crm.data.altMobile = l.altMobile || ''; crm.data.email = l.email || ''; crm.data.city = l.city || ''; crm.data.pincode = l.pincode || '';
  crm.data.businessName = l.business || '';
  crm.data.consentAccepted = l.consentStatus === 'Consent Given'; crm.data.consentStatus = l.consentStatus || 'Not Given';
  crm.data.consentTimestamp = l.consentTimestamp || ''; crm.data.mobileOtpVerified = !!l.mobileOtpVerified;
  crm.data.dedupeStatus = l.dedupeStatus || ''; crm.data.dedupeChecked = l.dedupeStatus === 'No Match';
  crm.data.existingCustomerId = l.existingCustomerId || '';
  const parts = String(l.name || '').trim().split(/\s+/).filter(Boolean);
  crm.data.firstName = parts[0] || '';
  crm.data.lastName = parts.slice(1).join(' ');
}
function openCRMNewLead(product) {
  if (typeof window.nfCan === "function" && !window.nfCan("createCRMLead")) {
    showToast("Permission denied: your role cannot create CRM leads.");
    return;
  }
  crm = makeCRMState(); crm.view = "journey"; crm.stage = 0; crm.selectedId = null;
  if (product) { crm.productPreset = product; crm.data.product = product; crm.data.amount = { "Two Wheeler": 120000, "MSME": 1000000, "LAP": 3000000, "Solar Loan": 600000, "Tractor Loan": 800000 }[product] || 500000 }
  navTo("crm");
}
function renderCRMDashboard() {
  const leads = crm.leads, open = leads.filter(x => !x.converted), due = open.filter(x => x.next.includes("Today")).length;
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>CRM Lead Management</h2><p>Lead → qualification → follow-up → pre-screen → opportunity → LOS handoff for all four loan products.</p></div><div class="action-row"><button class="ghost-btn" onclick="exportCRMLeads()">Export Leads</button><button type="button" class="primary-btn" data-nlt-action="createCRMLead" onclick="openCRMNewLead()">+ Create Lead</button></div></div>
    <div class="notice info"><b>CRM layer:</b> The supplied Omnifin PDFs start after login inside Sales/Predeal. This CRM workspace is the front-office layer added before that documented LOS journey.</div>
    <div style="height:14px"></div>
    <div class="grid kpis">
      ${kpi("Open Leads", open.length, "Across all products", "◎")}
      ${kpi("Follow-ups Due", due, "Due today", "◷")}
      ${kpi("Hot Leads", open.filter(x => x.temperature === 'Hot').length, "Priority prospects", "🔥")}
      ${kpi("Converted to LOS", leads.filter(x => x.converted).length, "CRM → LOS", "⇢")}
    </div>
    <div style="height:16px"></div>
    <div class="grid two">
      <div class="card card-pad"><div class="card-title-row"><div><h3>CRM Funnel</h3><p>Lead progression before LOS</p></div><span class="badge gray">${open.length} open</span></div>
        ${["New", "Qualified", "Follow-up", "Pre-Screen", "Opportunity", "Converted"].map(st => { const c = leads.filter(x => x.status === st).length; return `<div class="funnel-row"><div><div class="label"><span>${st}</span><span>${c} lead${c === 1 ? '' : 's'}</span></div><div class="progress"><span style="width:${Math.max(5, c / leads.length * 100)}%"></span></div></div><strong>${c}</strong></div>` }).join("")}
      </div>
      <div class="card card-pad"><div class="card-title-row"><div><h3>Today's Follow-ups</h3><p>Actions requiring RM / Sales attention</p></div></div>
        <div class="activity-list">${open.filter(x => x.next.includes('Today')).map(x => activity(x.temperature === 'Hot' ? '🔥' : '◷', `${x.name} • ${x.product}`, `${x.next} • ${x.owner}`)).join('') || '<div class="empty-state"><p>No follow-ups due today.</p></div>'}</div>
      </div>
    </div>
    <div style="height:16px"></div>
    <div class="card card-pad"><div class="toolbar"><div class="toolbar-group"><input id="crmSearch" class="compact-input" placeholder="Search lead, customer, mobile" oninput="filterCRMLeads()"><select id="crmProductFilter" class="filter-btn" onchange="filterCRMLeads()"><option>All Products</option>${Object.keys(products).map(x => `<option>${x}</option>`).join('')}</select><select id="crmStatusFilter" class="filter-btn" onchange="filterCRMLeads()"><option>All Status</option>${["New", "Qualified", "Follow-up", "Pre-Screen", "Opportunity", "Converted"].map(x => `<option>${x}</option>`).join('')}</select></div></div><div id="crmLeadTable">${crmLeadTable(leads)}</div></div>`;
}
function crmLeadTable(rows) { return `<div class="table-wrap"><table><thead><tr><th>Lead</th><th>Customer</th><th>Product</th><th>Requirement</th><th>Source / Owner</th><th>Priority</th><th>Status</th><th>Next Action</th><th></th></tr></thead><tbody>${rows.map(l => `<tr><td><b>${l.id}</b><div class="muted" style="font-size:8px;margin-top:3px">${l.created}</div></td><td><div class="customer-cell"><div class="mini-avatar">${initials(l.name)}</div><div><b>${l.name}</b><div class="muted" style="font-size:8px">${l.business || l.mobile}</div></div></div></td><td>${products[l.product]?.icon || '₹'} ${l.product}</td><td><b>${money(l.amount)}</b></td><td>${l.source}<div class="muted" style="font-size:8px">${l.owner}</div></td><td><span class="badge ${l.temperature === 'Hot' ? 'red' : l.temperature === 'Warm' ? 'amber' : 'gray'}">${l.temperature}</span></td><td><span class="badge ${l.status === 'Converted' ? 'green' : l.status === 'Opportunity' ? 'purple' : l.status === 'Qualified' ? 'blue' : 'gray'}">${l.status}</span></td><td>${l.next}</td><td><button class="more-btn" onclick="crm.selectedId='${l.id}';crm.view='journey';crm.stage=${l.stage};hydrateCRMFromLead(crm.leads.find(x=>x.id==='${l.id}'));renderCRM()">Open →</button></td></tr>`).join('')}</tbody></table></div>` }
function filterCRMLeads() { const q = $("#crmSearch").value.toLowerCase(), p = $("#crmProductFilter").value, s = $("#crmStatusFilter").value; const rows = crm.leads.filter(l => (l.id + l.name + l.mobile + l.business).toLowerCase().includes(q) && (p === 'All Products' || l.product === p) && (s === 'All Status' || l.status === s)); $("#crmLeadTable").innerHTML = rows.length ? crmLeadTable(rows) : '<div class="empty-state"><div class="icon">⌕</div><h3>No leads found</h3><p>Change search or filters.</p></div>' }

function renderCRMJourney() {
  const lead = crm.leads.find(x => x.id === crm.selectedId), leadId = lead?.id || "NEW LEAD";
  const createAction = lead ? "" : ' data-nlt-action="createCRMLead"';
  $("#content").innerHTML = `<div class="process-shell">
    <div class="process-top"><div class="process-topbar"><div class="process-ident"><div class="product-icon">◎</div><div><h3>${leadId} • ${crm.data.product || 'Product not selected'}</h3><p>${crm.data.firstName || 'New'} ${crm.data.lastName || 'Lead'} ${crm.data.businessName ? '• ' + crm.data.businessName : ''} • ${crm.data.mobile || 'Mobile pending'}</p></div></div><div class="process-actions"><span class="role-chip"><i></i>CRM / Sales</span><button class="filter-btn" onclick="crm.view='dashboard';renderCRM()">← Lead List</button><button class="filter-btn"${createAction} onclick="saveCRMLeadDraft()">Save Draft</button></div></div>
      <div class="crm-stage-grid">${crmStages.map((s, i) => `<button class="crm-stage ${i === crm.stage ? 'active' : i < crm.stage ? 'done' : ''}" onclick="crmGoToStage(${i})"><span>${i < crm.stage ? '✓' : i + 1}</span><b>${s}</b></button>`).join('')}</div>
    </div>
    <div class="process-card">${renderCRMStage()}</div>
  </div>`; bindCRM();
}
function crmField(label, id, control, help = '') { return `<label class="field"><span>${label}</span>${control}${help ? `<small>${help}</small>` : ''}</label>` }
function crmStageHeader(title, desc, tag) { return `<div class="section-bar"><div><h3>${title}</h3><p>${desc}</p></div><span class="badge purple">${tag}</span></div>` }
function crmFooter(label = "Save & Continue") { const createAction = crm.selectedId ? "" : ' data-nlt-action="createCRMLead"'; return `<div class="flow-footer"><div class="left">${crm.stage > 0 ? `<button class="ghost-btn" onclick="crmSaveCurrent();crm.stage--;renderCRM()">← Previous</button>` : ''}<button class="ghost-btn"${createAction} onclick="crmSaveCurrent();showToast('CRM data saved')">Save</button></div><div class="right">${crm.stage < crmStages.length - 1 ? `<button class="primary-btn"${createAction} onclick="crmSaveCurrent();crmAdvance()">${label} →</button>` : ''}</div></div>` }
function renderCRMStage() {
  if (crm.stage === 0) return crmLeadCapture(); if (crm.stage === 1) return crmQualification(); if (crm.stage === 2) return crmCustomerProfile(); if (crm.stage === 3) return crmRequirement(); if (crm.stage === 4) return crmAssignment(); if (crm.stage === 5) return crmFollowup(); if (crm.stage === 6) return crmPrescreen(); if (crm.stage === 7) return crmOpportunity(); return crmLOSHandoff();
}
function crmGoToStage(target) {
  crmSaveCurrent();
  if (crm.stage === 0 && target > 0) {
    if (!crm.data.consentAccepted) return showToast('Give customer consent before continuing.');
    if (!crm.data.mobileOtpVerified) return showToast('Verify the locally generated demo OTP before continuing.');
    if (!crm.data.dedupeChecked || crm.data.dedupeStatus !== 'No Match') return showToast('Run the demo customer dedupe check before continuing.');
    if (!crm.selectedId) saveCRMLeadDraft();
    if (!crm.selectedId) return;
  }
  crm.stage = target;
  crmSaveCurrent();
  renderCRM();
}
const CRM_CONSENT_MESSAGES = {
  Hindi: 'मैं ऋण प्रक्रिया के लिए मेरे द्वारा दी गई जानकारी के सत्यापन और उपयोग के लिए सहमति देता/देती हूँ। मैं समझता/समझती हूँ कि ग्राहक की पहचान, केवाईसी और डुप्लिकेट ग्राहक पहचान के लिए, जहाँ लागू हो, मेरे विवरणों की जाँच की जा सकती है।',
  English: 'I consent to the verification and use of the information provided by me for loan processing purposes. I understand that my details may be checked for customer identification, KYC, and duplicate customer detection, as applicable.',
  Marwari: 'मैं ऋण प्रक्रिया खातर म्यां दी गई जानकारी री जांच अर उपयोग खातर सहमत हूं। म्हाने समझ है कि ग्राहक पहचान, केवाईसी अर डुप्लीकेट ग्राहक पहचान खातर, जद लागू हो, म्हारी जानकारी री जांच करी जासके है।',
  Gujarati: 'હું લોન પ્રક્રિયા માટે મારા દ્વારા આપવામાં આવેલી માહિતીની ચકાસણી અને ઉપયોગ માટે સંમતિ આપું છું. હું સમજું છું કે ગ્રાહકની ઓળખ, KYC અને ડુપ્લિકેટ ગ્રાહકની ઓળખ માટે, જ્યાં લાગુ પડે ત્યાં, મારી વિગતો તપાસવામાં આવી શકે છે.',
  Punjabi: 'ਮੈਂ ਕਰਜ਼ੇ ਦੀ ਪ੍ਰਕਿਰਿਆ ਲਈ ਮੇਰੇ ਵੱਲੋਂ ਦਿੱਤੀ ਜਾਣਕਾਰੀ ਦੀ ਜਾਂਚ ਅਤੇ ਵਰਤੋਂ ਲਈ ਸਹਿਮਤੀ ਦਿੰਦਾ/ਦਿੰਦੀ ਹਾਂ। ਮੈਂ ਸਮਝਦਾ/ਸਮਝਦੀ ਹਾਂ ਕਿ ਗਾਹਕ ਦੀ ਪਛਾਣ, KYC ਅਤੇ ਡੁਪਲੀਕੇਟ ਗਾਹਕ ਦੀ ਪਛਾਣ ਲਈ, ਜਿੱਥੇ ਲਾਗੂ ਹੋਵੇ, ਮੇਰੇ ਵੇਰਵਿਆਂ ਦੀ ਜਾਂਚ ਕੀਤੀ ਜਾ ਸਕਦੀ ਹੈ।',
  Odia: 'ଋଣ ପ୍ରକ୍ରିୟା ପାଇଁ ମୋ ଦ୍ୱାରା ଦିଆଯାଇଥିବା ସୂଚନାର ଯାଞ୍ଚ ଏବଂ ବ୍ୟବହାର ପାଇଁ ମୁଁ ସମ୍ମତି ଦେଉଛି। ମୁଁ ବୁଝୁଛି ଯେ ଗ୍ରାହକଙ୍କ ପରିଚୟ, KYC ଏବଂ ନକଲି ଗ୍ରାହକ ଚିହ୍ନଟ ପାଇଁ, ପ୍ରଯୁଜ୍ୟ ହେଲେ, ମୋର ବିବରଣୀ ଯାଞ୍ଚ କରାଯାଇପାରେ।',
  Marathi: 'कर्ज प्रक्रियेसाठी माझ्याकडून दिलेल्या माहितीची पडताळणी आणि वापर करण्यास मी संमती देतो/देते. ग्राहकाची ओळख, KYC आणि डुप्लिकेट ग्राहक शोधण्यासाठी, लागू असल्यास, माझ्या तपशीलांची तपासणी केली जाऊ शकते, हे मला समजते.',
  Tamil: 'கடன் செயலாக்கத்திற்காக நான் வழங்கிய தகவல்களைச் சரிபார்த்து பயன்படுத்துவதற்கு நான் சம்மதிக்கிறேன். வாடிக்கையாளர் அடையாளம், KYC மற்றும் நகல் வாடிக்கையாளர் கண்டறிதலுக்காக, பொருந்தும் இடங்களில், எனது விவரங்கள் சரிபார்க்கப்படலாம் என்பதை நான் புரிந்துகொள்கிறேன்.',
  Telugu: 'రుణ ప్రక్రియ కోసం నేను అందించిన సమాచారాన్ని ధృవీకరించి ఉపయోగించడానికి నేను సమ్మతిస్తున్నాను. కస్టమర్ గుర్తింపు, KYC మరియు నకిలీ కస్టమర్ గుర్తింపు కోసం, వర్తించే చోట, నా వివరాలను తనిఖీ చేయవచ్చని నేను అర్థం చేసుకున్నాను.'
};
const CRM_CONSENT_LANGUAGE_TAGS = {
  Hindi: 'hi', English: 'en', Marwari: 'mwr', Gujarati: 'gu',
  Punjabi: 'pa', Odia: 'or', Marathi: 'mr', Tamil: 'ta', Telugu: 'te'
};
function crmUpdateConsentMessage(language) {
  const message = $('#crm_consentMessage');
  if (!message) return;
  const selectedLanguage = Object.hasOwn(CRM_CONSENT_MESSAGES, language) ? language : 'Hindi';
  crm.data.preferredLanguage = selectedLanguage;
  message.textContent = CRM_CONSENT_MESSAGES[selectedLanguage];
  message.lang = CRM_CONSENT_LANGUAGE_TAGS[selectedLanguage];
}
function crmLeadCapture() {
  return `${crmStageHeader('1. Lead / Enquiry Capture', 'Create the prospect before any LOS deal exists.', 'CRM')}
  <div class="source-grid">
    ${crmField('Lead Date *', 'leadDate', `<input id="crm_leadDate" type="date" value="${crm.data.leadDate}">`)}
    ${crmField('Lead Source *', 'source', `<select id="crm_source"><option ${crm.data.source === 'DSA' ? 'selected' : ''}>DSA</option><option ${crm.data.source === 'Dealer' ? 'selected' : ''}>Dealer</option><option>Digital</option><option>Walk-in</option><option>Referral</option><option>Existing Customer</option><option>Telecalling</option></select>`)}
    ${crmField('Campaign', 'campaign', `<input id="crm_campaign" value="${crm.data.campaign}">`)}
    ${crmField('Branch *', 'branch', `<select id="crm_branch"><option>${crm.data.branch}</option><option>Jaipur - VKI</option><option>Bhilwara</option><option>Udaipur</option><option>Kota</option></select>`)}
    ${crmField('Product Interest *', 'product', `<select id="crm_product">${Object.keys(products).map(p => `<option ${crm.data.product === p ? 'selected' : ''}>${p}</option>`).join('')}</select>`)}
    ${crmField('Requested Amount *', 'amount', `<input id="crm_amount" type="number" value="${crm.data.amount}">`)}
    ${crmField('Customer Type *', 'customerType', `<select id="crm_customerType"><option>Individual</option><option>Proprietorship</option><option>Partnership</option><option>Private Limited</option><option>LLP</option></select>`)}
    ${crmField('Lead Owner *', 'owner', `<input id="crm_owner" value="${crm.data.owner}">`)}
    ${crmField('First Name / Contact Person *', 'firstName', `<input id="crm_firstName" value="${crm.data.firstName}">`)}
    ${crmField('Last Name', 'lastName', `<input id="crm_lastName" value="${crm.data.lastName}">`)}
    ${crmField('Business / Firm Name', 'businessName', `<input id="crm_businessName" value="${crm.data.businessName}">`)}
    <div class="field"><span>Mobile *</span><input id="crm_mobile" value="${crm.data.mobile}"></div>
    ${crmField('Alternate Mobile', 'altMobile', `<input id="crm_altMobile" value="${crm.data.altMobile}">`)}
    ${crmField('Email', 'email', `<input id="crm_email" value="${crm.data.email}">`)}
    ${crmField('City *', 'city', `<input id="crm_city" value="${crm.data.city}">`)}
    ${crmField('PIN Code *', 'pincode', `<input id="crm_pincode" value="${crm.data.pincode}">`)}
    ${crmField('Preferred Language', 'preferredLanguage', `<select id="crm_preferredLanguage">${Object.keys(CRM_CONSENT_MESSAGES).map(language => `<option ${crm.data.preferredLanguage === language || (!crm.data.preferredLanguage && language === 'Hindi') ? 'selected' : ''}>${language}</option>`).join('')}</select>`)}
    <div class="notice info" style="grid-column:1/-1"><b>Customer Consent Message</b><p id="crm_consentMessage" style="margin:6px 0 10px"></p><label style="display:flex;align-items:center;gap:8px"><input id="crm_consentAccepted" type="checkbox" ${crm.data.consentAccepted ? 'checked' : ''} onchange="crmConsentChanged(this.checked)"><span>I agree and consent to the above.</span></label></div>
    <div class="field"><span>Send demo OTP</span><button type="button" class="ghost-btn" id="crm_sendOtp" onclick="crmSendDemoOtp()" disabled>Send OTP</button></div>
    <div class="field" style="grid-column:1/-1"><span>Demo OTP verification</span><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><input id="crm_demoOtpInput" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="Enter 6-digit OTP" disabled><button type="button" class="ghost-btn" id="crm_copyOtp" onclick="crmCopyDemoOtp()" disabled>Copy OTP</button><button type="button" class="primary-btn" id="crm_verifyOtp" onclick="crmVerifyDemoOtp()" disabled>Verify OTP</button></div><small id="crm_demoOtpStatus" aria-live="polite">Give consent to enable OTP generation. This demo does not send SMS or perform actual KYC verification.</small></div>
    <div class="form-section" style="grid-column:1/-1"><h4>Existing Customer Dedupe</h4><p class="muted">Enter PAN and Aadhaar after local OTP verification to check the demo customer records. This is not an actual KYC check.</p><div class="source-grid">
      ${crmField('PAN *', 'pan', `<input id="crm_pan" value="${crm.data.pan || ''}" autocomplete="off" ${crm.data.mobileOtpVerified ? '' : 'disabled'}>`)}
      ${crmField('Aadhaar *', 'aadhaar', `<input id="crm_aadhaar" value="${crm.data.aadhaar || ''}" autocomplete="off" inputmode="numeric" maxlength="12" ${crm.data.mobileOtpVerified ? '' : 'disabled'}>`)}
    </div><button type="button" class="primary-btn" id="crm_checkDedupe" onclick="crmRunDemoDedupe()" ${crm.data.mobileOtpVerified ? '' : 'disabled'}>Check Existing Customer</button><div id="crm_dedupeResult" aria-live="polite">${crm.data.dedupeStatus === 'No Match' ? '<div class="notice success">No existing customer match found in the demo records. Continue with CRM.</div>' : ''}</div></div>
  </div>${crmFooter('Create / Qualify Lead')}`
}
const CRM_DEMO_OTP_KEY = 'namdev-demo-lead-otp';
function crmMobileKey() { return String(crm.data.mobile || '').replace(/\D/g, '') }
function crmReadDemoOtp() {
  try {
    const saved = JSON.parse(localStorage.getItem(CRM_DEMO_OTP_KEY) || '{}');
    const record = saved[crmMobileKey()] || null;
    return crm.data.consentAccepted && record?.consentTimestamp === crm.data.consentTimestamp ? record : null;
  } catch (error) {
    console.error('Could not read the locally saved demo OTP.', error);
    showToast('The demo OTP could not be read from browser storage.');
    return null;
  }
}
function crmRefreshOtpControls() {
  const consent = $('#crm_consentAccepted')?.checked === true;
  const mobile = crmMobileKey();
  const record = consent ? crmReadDemoOtp() : null;
  const mobileIsValid = /^\d{10,15}$/.test(mobile);
  const send = $('#crm_sendOtp'), otp = $('#crm_demoOtpInput'), copy = $('#crm_copyOtp'), verify = $('#crm_verifyOtp');
  if (!send || !otp || !copy || !verify) return;
  const verified = !!record?.verifiedAt && crm.data.mobileOtpVerified === true;
  send.disabled = !consent || !mobileIsValid;
  otp.disabled = !record;
  copy.disabled = !record;
  verify.disabled = !record || record.verifiedAt;
  otp.value = '';
  ['#crm_pan', '#crm_aadhaar', '#crm_checkDedupe'].forEach(selector => {
    const control = $(selector);
    if (control) control.disabled = !verified;
  });
  const status = $('#crm_demoOtpStatus');
  if (status) status.innerHTML = record
    ? record.verifiedAt
      ? 'Demo OTP verified locally. No SMS was sent.'
      : `Demo OTP generated locally: <b>${record.otp}</b>. No SMS was sent.`
    : consent
      ? 'Consent recorded. Generate a demo OTP to continue. No SMS will be sent.'
      : 'Give consent to enable OTP generation. This demo does not send SMS or perform actual KYC verification.';
}
function crmConsentChanged(accepted) {
  crm.data.consentAccepted = accepted;
  crm.data.consentStatus = accepted ? 'Consent Given' : 'Not Given';
  crm.data.consent = accepted ? 'Consent Captured' : 'Pending';
  crm.data.consentTimestamp = accepted ? new Date().toISOString() : '';
  crm.data.mobileOtpVerified = false;
  crmInvalidateDedupe();
  const mobile = crmMobileKey();
  if (!accepted && mobile) {
    try {
      const saved = JSON.parse(localStorage.getItem(CRM_DEMO_OTP_KEY) || '{}');
      delete saved[mobile];
      localStorage.setItem(CRM_DEMO_OTP_KEY, JSON.stringify(saved));
    } catch (error) {
      console.error('Could not clear the locally saved demo OTP after consent was withdrawn.', error);
      showToast('Consent was withdrawn, but the saved demo OTP could not be cleared.');
    }
  }
  crmRefreshOtpControls();
}
function crmSendDemoOtp() {
  crmSaveCurrent();
  if (!$('#crm_consentAccepted')?.checked) return showToast('Give consent before generating a demo OTP.');
  const mobile = crmMobileKey();
  if (!/^\d{10,15}$/.test(mobile)) return showToast('Enter a valid mobile number before generating a demo OTP.');
  const record = { otp: String(Math.floor(100000 + Math.random() * 900000)), generatedAt: new Date().toISOString(), consentTimestamp: crm.data.consentTimestamp, verifiedAt: '' };
  try {
    const saved = JSON.parse(localStorage.getItem(CRM_DEMO_OTP_KEY) || '{}');
    saved[mobile] = record;
    localStorage.setItem(CRM_DEMO_OTP_KEY, JSON.stringify(saved));
  } catch (error) {
    console.error('Could not save the demo OTP in browser storage.', error);
    showToast('The demo OTP could not be saved to browser storage.');
    return;
  }
  crm.data.mobileOtpVerified = false;
  crmRefreshOtpControls();
  showToast('Demo OTP generated locally. No SMS was sent.');
}
async function crmCopyDemoOtp() {
  const record = crmReadDemoOtp();
  if (!record) return showToast('Generate a demo OTP before copying it.');
  try {
    await navigator.clipboard.writeText(record.otp);
    showToast('Demo OTP copied.');
  } catch (error) {
    console.error('Could not copy the demo OTP to the clipboard.', error);
    showToast('The demo OTP could not be copied. Use the locally displayed demo code.');
  }
}
function crmVerifyDemoOtp() {
  if (!$('#crm_consentAccepted')?.checked) return showToast('Give consent before verifying a demo OTP.');
  const mobile = crmMobileKey(), record = crmReadDemoOtp();
  if (!record) return showToast('Generate a demo OTP before verifying it.');
  if ($('#crm_demoOtpInput')?.value.trim() !== record.otp) return showToast('The demo OTP is incorrect.');
  record.verifiedAt = new Date().toISOString();
  try {
    const saved = JSON.parse(localStorage.getItem(CRM_DEMO_OTP_KEY) || '{}');
    saved[mobile] = record;
    localStorage.setItem(CRM_DEMO_OTP_KEY, JSON.stringify(saved));
  } catch (error) {
    console.error('Could not save the demo OTP verification in browser storage.', error);
    showToast('Demo OTP verification could not be saved to browser storage.');
    return;
  }
  crm.data.mobileOtpVerified = true;
  crm.data.dedupeChecked = false;
  crm.data.dedupeStatus = '';
  crm.data.existingCustomerId = '';
  crmRefreshOtpControls();
  showToast('Demo OTP verified locally. No SMS was sent.');
}
function crmInvalidateDedupe() {
  crm.data.dedupeChecked = false;
  crm.data.dedupeStatus = '';
  crm.data.existingCustomerId = '';
  const result = $('#crm_dedupeResult');
  if (result) result.innerHTML = '';
}
function crmIsConvertedLead(lead) {
  return lead?.converted === true || lead?.status === 'Converted';
}
function crmDemoIdentityRecords() {
  const records = [];
  const add = (record, source) => {
    if (!record || typeof record !== 'object') return;
    records.push({
      ...record,
      source,
      name: record.name || record.customer || '',
      business: record.business || record.businessName || '',
      mobile: record.mobile || '',
      pan: record.pan || '',
      aadhaar: record.aadhaar || record.aadhar || '',
      branch: record.branch || '',
      product: record.product || '',
      amount: record.amount || record.requestedAmount || '',
      email: record.email || '',
      city: record.city || '',
      pincode: record.pincode || record.pinCode || ''
    });
  };
  (crm.leads || []).filter(crmIsConvertedLead).forEach(record => add(record, 'converted CRM lead'));
  if (typeof v7Customers !== 'undefined') v7Customers.forEach(customer => {
    const app = applications.find(item => item.id === customer.applicationId);
    add({ ...customer, ...(app || {}), ...customer, customer:customer.name || app?.customer, pan:customer.pan || app?.pan, aadhaar:customer.aadhaar || app?.aadhaar }, 'customer profile');
  });
  applications.forEach(app => {
    const customer = typeof getCustomerByApp === 'function' ? getCustomerByApp(app.id) : null;
    add({ ...app, ...(customer || {}), customer:customer?.name || app.customer, pan:customer?.pan || app.pan, aadhaar:customer?.aadhaar || app.aadhaar }, 'existing application');
  });
  if (typeof msme !== 'undefined') (msme.customers || []).forEach(customer => add(customer, 'MSME customer'));
  try {
    const savedLifecycle = JSON.parse(localStorage.getItem('namdev-connected-lifecycle-v1') || '{}');
    (savedLifecycle.profiles || []).forEach(record => add(record, 'saved customer profile'));
    (savedLifecycle.leads || []).filter(crmIsConvertedLead).forEach(record => add(record, 'saved converted CRM lead'));
    const savedCustomers = JSON.parse(localStorage.getItem('namdev-demo-customer-records') || '[]');
    (Array.isArray(savedCustomers) ? savedCustomers : Object.values(savedCustomers)).forEach(record => add(record, 'saved demo customer'));
  } catch (error) {
    console.error('Could not read local demo customer records for dedupe.', error);
    showToast('Saved demo customer records could not be read.');
  }
  return records;
}
function crmOpenMatchedCustomerInLOS(customer) {
  const requestedProduct = crm.data.product;
  const verifiedMobile = crm.data.mobile;
  const info = { ...customer };
  const fullName = String(info.name || info.customer || '').trim();
  const nameParts = fullName.split(/\s+/);
  crm.data.firstName = info.firstName || nameParts[0] || crm.data.firstName || '';
  crm.data.lastName = info.lastName || nameParts.slice(1).join(' ') || crm.data.lastName || '';
  crm.data.businessName = info.business || info.businessName || crm.data.businessName || '';
  crm.data.email = info.email || crm.data.email || '';
  crm.data.city = info.city || crm.data.city || '';
  crm.data.pincode = info.pincode || crm.data.pincode || '';
  crm.data.altMobile = info.altMobile || crm.data.altMobile || '';
  crm.data.pan = info.pan;
  crm.data.aadhaar = info.aadhaar;
  crm.data.mobile = verifiedMobile;
  crm.data.product = requestedProduct;
  crm.data.existingCustomerId = info.id || info.applicationId || 'existing-customer';
  crm.data.dedupeStatus = 'Existing Customer Found';
  crm.data.dedupeChecked = true;
  crmSaveCurrent();
  const startsSharedLifecycle = !!crm.productPreset;
  const productCode = products[requestedProduct].code;
  let applicationId = 'SKF-' + productCode + '-' + String(Date.now()).slice(-7);
  while (applications.some(app => app.id === applicationId)) applicationId = 'SKF-' + productCode + '-' + String(Date.now() + Math.floor(Math.random() * 1000)).slice(-7);
  const application = {
    id:applicationId,
    customer:fullName || [crm.data.firstName, crm.data.lastName].filter(Boolean).join(' '),
    mobile:verifiedMobile,
    product:requestedProduct,
    amount:Number(crm.data.amount || productDefaultAmount()),
    branch:crm.data.branch || info.branch || 'Jaipur - VKI',
    status:'Draft',
    stage:0,
    score:Number(info.score || 0),
    docs:0,
    created:new Date().toLocaleDateString('en-IN'),
    owner:crm.data.owner || crm.data.assignedSales || info.owner || 'Neha Jain',
    repayment:'—',
    pan:crm.data.pan,
    aadhaar:crm.data.aadhaar,
    consentStatus:crm.data.consentStatus,
    consentTimestamp:crm.data.consentTimestamp || '',
    mobileOtpVerified:!!crm.data.mobileOtpVerified,
    dedupeStatus:'Existing Customer Found',
    existingCustomerId:crm.data.existingCustomerId,
    existingCustomerMatch:true,
    lifecycleManaged:startsSharedLifecycle,
    browserLocalOnly:startsSharedLifecycle,
    ...(startsSharedLifecycle ? {
      crmSource:crm.data.source || '',
      lifecycle:{
        stage:'los', customerId:info.customerId || info.id || info.applicationId || '',
        imd:{ status:'Not Started', amount:1500 },
        parallel:{ credit:'Pending', technical:'Pending', legal:'Pending' },
        repayments:[], schedule:[]
      },
      workflow:{
        stage:'Sales/Predeal', ownerRole:'BSO', sales:{}, technicalStatus:'Pending',
        technicalReport:'', legalStatus:'Pending', legalReport:'', eSignStatus:'Pending',
        doChecklist:'Pending', centralOps:'Pending', dealId:'', lmsStatus:'Pending',
        bureauVerified:false, creditCrossCheck:false, previousStatus:'Sales/Predeal',
        sendBack:false, approval:null, deviations:[]
      }
    } : {})
  };
  applications.unshift(application);
  ensureWorkflowData();
  if (startsSharedLifecycle && (typeof window.nfPersistLifecycleCase !== 'function' || !window.nfPersistLifecycleCase(applicationId))) {
    applications.splice(applications.indexOf(application), 1);
    showToast('The matched-customer LOS case could not be saved. No new case was opened.');
    return;
  }
  if (typeof v7FillAll === 'function') v7FillAll();
  const appBadge = $('#appCountBadge');
  if (appBadge) appBadge.textContent = applications.length;
  if (requestedProduct === 'MSME') {
    resetMSME();
    msme.role = 'Sales User';
    msme.salesTab = 0;
    msme.processStage = 0;
    const applicant = msme.customers[0];
    applicant.name = fullName || [crm.data.firstName, crm.data.lastName].filter(Boolean).join(' ').toUpperCase();
    applicant.mobile = verifiedMobile;
    applicant.pan = crm.data.pan;
    applicant.aadhaar = crm.data.aadhaar;
    applicant.email = crm.data.email;
    navTo('msmeFlow');
  } else {
    navTo('newApplication', requestedProduct);
    wizard = {
      step:0, product:requestedProduct, selectedApplicationId:applicationId,
      data:{
        sourceChannel:crm.data.source, branch:crm.data.branch, salesExec:crm.data.assignedSales,
        requestedAmount:crm.data.amount, firstName:crm.data.firstName, lastName:crm.data.lastName,
        mobile:verifiedMobile, email:crm.data.email, city:crm.data.city, pincode:crm.data.pincode,
        pan:crm.data.pan, aadhaar:crm.data.aadhaar
      }, docs:{}, coType:'Co-applicant'
    };
    renderWizard();
  }
  showToast('Existing customer found in demo records. CRM skipped; opening ' + requestedProduct + ' LOS. No actual KYC was performed.');
}
function crmRunDemoDedupe() {
  crmSaveCurrent();
  if (!crm.data.consentAccepted || !crm.data.mobileOtpVerified) return showToast('Give consent and verify the demo OTP before checking customer records.');
  const pan = String(crm.data.pan || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
  const aadhaar = String(crm.data.aadhaar || '').replace(/\D/g, '');
  const result = $('#crm_dedupeResult');
  if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(pan) || !/^\d{12}$/.test(aadhaar)) {
    crmInvalidateDedupe();
    if (result) result.innerHTML = '<div class="notice warn">Enter a valid 10-character PAN and 12-digit Aadhaar to check the demo records.</div>';
    return;
  }
  const match = crmDemoIdentityRecords().find(record =>
    String(record.pan || '').replace(/[^a-z0-9]/gi, '').toUpperCase() === pan &&
    String(record.aadhaar || '').replace(/\D/g, '') === aadhaar
  );
  if (match) {
    crm.data.pan = pan;
    crm.data.aadhaar = aadhaar;
    crm.data.dedupeChecked = true;
    crm.data.dedupeStatus = 'Existing Customer Found';
    crm.data.existingCustomerId = match.id || match.applicationId || '';
    if (result) result.innerHTML = '<div class="notice success"><b>Existing customer found.</b> CRM will be skipped and the selected product will open in LOS. Demo record match only; no actual KYC was performed.</div>';
    crmOpenMatchedCustomerInLOS(match);
    return;
  }
  crm.data.dedupeChecked = true;
  crm.data.dedupeStatus = 'No Match';
  crm.data.existingCustomerId = '';
  if (result) result.innerHTML = '<div class="notice success"><b>No existing customer found in demo records.</b> Continue with CRM. This is not an actual KYC check.</div>';
}
function crmQualification() {
  return `${crmStageHeader('2. Lead Qualification', 'Decide whether the enquiry is serviceable before sending Sales into detailed processing.', 'Qualification')}
  <div class="grid two"><div class="form-section"><h4>Qualification Inputs</h4><div class="source-grid">
    ${crmField('Lead Status', 'leadStatus', `<select id="crm_leadStatus"><option>New</option><option ${crm.data.leadStatus === 'Qualified' ? 'selected' : ''}>Qualified</option><option>Follow-up</option><option>Not Interested</option><option>Unserviceable</option></select>`)}
    ${crmField('Priority / Temperature', 'temperature', `<select id="crm_temperature"><option>Hot</option><option>Warm</option><option>Cold</option></select>`)}
    ${crmField('Contactability', 'contactability', `<select id="crm_contactability"><option>Contacted</option><option>Not Reachable</option><option>Call Back</option></select>`)}
    ${crmField('Age', 'age', `<input id="crm_age" type="number" value="${crm.data.age}">`)}
    ${crmField('Monthly Income / Surplus', 'monthlyIncome', `<input id="crm_monthlyIncome" type="number" value="${crm.data.monthlyIncome}">`)}
    ${crmField('Annual Turnover', 'annualTurnover', `<input id="crm_annualTurnover" type="number" value="${crm.data.annualTurnover}">`)}
    ${crmField('Existing EMI', 'existingEmi', `<input id="crm_existingEmi" type="number" value="${crm.data.existingEmi}">`)}
    ${crmField('PAN Available', 'panAvailable', `<select id="crm_panAvailable"><option>Yes</option><option>No</option></select>`)}
    ${crmField('Aadhaar / ID Available', 'aadhaarAvailable', `<select id="crm_aadhaarAvailable"><option>Yes</option><option>No</option></select>`)}
    ${crmField('Bureau Consent', 'bureauConsent', `<select id="crm_bureauConsent"><option>Yes</option><option>No</option></select>`)}
    ${crmField('Collateral Available', 'collateralAvailable', `<select id="crm_collateralAvailable"><option>Yes</option><option>No</option><option>Not Applicable</option></select>`)}
  </div></div><div class="form-section"><h4>Preliminary Result</h4>
    <div class="eligibility-score"><div class="score-ring"><strong id="crmScoreVal">${crm.data.preliminaryScore}</strong><span>/100</span></div><div><b>Lead Qualification Score</b><p>Illustrative CRM score based on contactability, income/turnover, documents and product fit.</p><span class="badge green">Proceed to customer profile</span></div></div>
    <div style="height:14px"></div>${crmField('Qualification Remarks', 'qualRemarks', `<textarea id="crm_qualRemarks" rows="6">Customer profile meets preliminary sourcing criteria. Detailed credit decision remains in LOS/Credit.</textarea>`)}
  </div></div>${crmFooter('Mark Qualified & Continue')}`
}
function crmCustomerProfile() { const tab = crm.profileTab || 0; const tabs = ['Identity', 'Address', 'Business / Employment', 'Relationship']; let body = ''; if (tab === 0) body = `<div class="source-grid">${crmField('Constitution', 'constitution', `<select id="crm_constitution"><option>Proprietorship</option><option>Individual</option><option>Partnership</option><option>Private Limited</option></select>`)}${crmField('GSTIN', 'gstin', `<input id="crm_gstin" value="${crm.data.gstin}">`)}${crmField('Udyam No.', 'udyam', `<input id="crm_udyam" value="${crm.data.udyam}">`)}${crmField('Existing Namdev Finvest Ltd. Customer?', 'existingCustomer', `<select id="crm_existingCustomer"><option>No</option><option>Yes</option></select>`)}</div>`; if (tab === 1) body = `<div class="source-grid">${crmField('Residence Address', 'residenceAddress', `<input id="crm_residenceAddress" value="${crm.data.residenceAddress}">`)}${crmField('Office / Business Address', 'officeAddress', `<input id="crm_officeAddress" value="${crm.data.officeAddress}">`)}${crmField('City', 'city', `<input id="crm_city" value="${crm.data.city}">`)}${crmField('PIN Code', 'pincode', `<input id="crm_pincode" value="${crm.data.pincode}">`)}</div>`; if (tab === 2) body = `<div class="source-grid">${crmField('Employment / Business Type', 'employmentType', `<select id="crm_employmentType"><option>Business</option><option>Salaried</option><option>Self Employed Professional</option><option>Agriculture</option></select>`)}${crmField('Business Vintage (Years)', 'businessVintage', `<input id="crm_businessVintage" type="number" value="${crm.data.businessVintage}">`)}${crmField('Annual Turnover', 'annualTurnover', `<input id="crm_annualTurnover" type="number" value="${crm.data.annualTurnover}">`)}${crmField('Monthly Income / Surplus', 'monthlyIncome', `<input id="crm_monthlyIncome" type="number" value="${crm.data.monthlyIncome}">`)}</div>`; if (tab === 3) body = `<div class="source-grid">${crmField('Co-applicant likely required?', 'coappLikely', `<select id="crm_coappLikely"><option>Yes</option><option>No</option><option>To be decided by Credit</option></select>`)}${crmField('Relationship Notes', 'relationshipNotes', `<textarea id="crm_relationshipNotes" rows="3">Primary contact is decision maker.</textarea>`)}${crmField('Preferred Language', 'preferredLanguage', `<select id="crm_preferredLanguage"><option>Hindi</option><option>English</option><option>Marwari</option></select>`)}${crmField('Alternate Mobile', 'altMobile', `<input id="crm_altMobile" value="${crm.data.altMobile}">`)}</div>`; return `${crmStageHeader('3. Customer 360°', 'Capture only CRM-level customer information; detailed applicant tabs remain in LOS.', 'Customer')}<div class="subtabs">${tabs.map((t, i) => `<button class="subtab ${i === tab ? 'active' : ''}" onclick="crmSaveCurrent();crm.profileTab=${i};renderCRM()">${t}</button>`).join('')}</div><div class="subtab-content">${body}</div>${crmFooter()}` }
function crmRequirement() {
  const e = emi(crm.data.amount, crm.data.roi, crm.data.tenure); const foir = Math.round(((crm.data.existingEmi + e) / (crm.data.monthlyIncome || 1)) * 100); return `${crmStageHeader('4. Requirement & Preliminary Eligibility', 'Capture product need and show a non-credit preliminary fit before LOS.', 'Eligibility')}
  <div class="source-grid">
    ${crmField('Product', 'product', `<select id="crm_product2">${Object.keys(products).map(p => `<option ${crm.data.product === p ? 'selected' : ''}>${p}</option>`).join('')}</select>`)}
    ${crmField('Loan Purpose', 'loanPurpose', `<select id="crm_loanPurpose"><option>Working Capital</option><option>Business Expansion</option><option>Vehicle Purchase</option><option>Property-backed Funding</option><option>Solar Installation</option></select>`)}
    ${crmField('Requested Amount', 'amount', `<input id="crm_amount2" type="number" value="${crm.data.amount}">`)}
    ${crmField('Indicative Tenure', 'tenure', `<input id="crm_tenure" type="number" value="${crm.data.tenure}">`)}
    ${crmField('Indicative ROI %', 'roi', `<input id="crm_roi" type="number" step=".1" value="${crm.data.roi}">`)}
    ${crmField('Estimated EMI', 'estEmi', `<input id="crm_estEmi" value="${money(e)}" readonly>`)}
    ${crmField('Existing EMI', 'existingEmi', `<input value="${money(crm.data.existingEmi)}" readonly>`)}
    ${crmField('Indicative FOIR', 'foir', `<input id="crm_foir" value="${foir}%" readonly>`)}
  </div><div style="height:14px"></div><div class="eligibility-panel"><div><span>Preliminary CRM Eligibility</span><h3>${crm.data.eligibility}</h3><p>This is a sourcing / pre-screen result only. Final credit eligibility, bureau, verification, CAM and sanction remain in LOS.</p></div><div class="offer-amount"><span>Indicative eligible amount</span><strong>${money(Math.min(crm.data.amount, Math.round(crm.data.monthlyIncome * 18)))}</strong></div></div>${crmFooter()}`
}
function crmAssignment() {
  return `${crmStageHeader('5. Assignment & Routing', 'Assign the qualified lead to branch / RM / sales owner and define SLA.', 'Assignment')}
  <div class="source-grid">
    ${crmField('Branch', 'branch', `<select id="crm_branch2"><option>${crm.data.branch}</option><option>Jaipur - VKI</option><option>Bhilwara</option></select>`)}
    ${crmField('Relationship Manager', 'assignedRM', `<select id="crm_assignedRM"><option>${crm.data.assignedRM}</option><option>Rahul Saini</option><option>Kavita Rao</option></select>`)}
    ${crmField('Sales Executive', 'assignedSales', `<select id="crm_assignedSales"><option>${crm.data.assignedSales}</option><option>Mohit Meena</option><option>Alok Sharma</option></select>`)}
    ${crmField('DSA / Dealer / Partner', 'dsaDealer', `<input id="crm_dsaDealer" value="${crm.data.dsaDealer}">`)}
    ${crmField('Lead SLA', 'sla', `<select id="crm_sla"><option>2 Hours</option><option selected>4 Hours</option><option>Same Day</option><option>24 Hours</option></select>`)}
    ${crmField('Next Action', 'nextAction', `<select id="crm_nextAction"><option>Customer Visit</option><option>Call Back</option><option>Collect Documents</option><option>Dealer Visit</option><option>Property Visit</option></select>`)}
    ${crmField('Next Action Due', 'nextDue', `<input id="crm_nextDue" type="datetime-local" value="${crm.data.nextDue}">`)}
    ${crmField('Escalation Owner', 'escalationOwner', `<input id="crm_escalationOwner" value="Branch Manager">`)}
  </div><div style="height:14px"></div><div class="notice success">✓ Lead is routed to <b>${crm.data.assignedSales}</b> with ${crm.data.sla} SLA. Ownership remains visible until LOS conversion.</div>${crmFooter('Assign & Continue')}`
}
function crmFollowup() {
  return `${crmStageHeader('6. Follow-up & Activity', 'All prospect interaction stays in CRM until conversion.', 'Activities')}
  <div class="action-row" style="margin-bottom:13px"><button class="primary-btn" onclick="showCRMActivityModal()">+ Add Activity</button><button class="ghost-btn" onclick="showCRMActivityModal('WhatsApp')">WhatsApp</button><button class="ghost-btn" onclick="showCRMActivityModal('Call')">Call</button><button class="ghost-btn" onclick="showCRMActivityModal('Visit')">Schedule Visit</button></div>
  <div class="crm-timeline">${crm.activities.map((a, i) => `<div class="crm-activity"><div class="activity-type">${a.type === 'Call' ? '☎' : a.type === 'Visit' ? '⌖' : a.type === 'WhatsApp' ? '◉' : '✉'}</div><div class="crm-activity-body"><div class="crm-activity-head"><b>${a.type} • ${a.outcome}</b><span>${a.date}</span></div><p>${a.note}</p><small>${a.user}</small></div></div>`).join('')}</div>${crmFooter()}`
}
function showCRMActivityModal(preset = 'Call') { showModal('Add CRM Activity', `<div class="source-grid" style="grid-template-columns:1fr 1fr">${crmField('Activity Type', '', `<select id="actType"><option ${preset === 'Call' ? 'selected' : ''}>Call</option><option ${preset === 'Visit' ? 'selected' : ''}>Visit</option><option ${preset === 'WhatsApp' ? 'selected' : ''}>WhatsApp</option><option ${preset === 'Email' ? 'selected' : ''}>Email</option></select>`)}${crmField('Outcome', '', `<select id="actOutcome"><option>Connected</option><option>Not Reachable</option><option>Interested</option><option>Document Pending</option><option>Visit Completed</option></select>`)}${crmField('Notes', '', `<textarea id="actNote" rows="4">Follow-up completed.</textarea>`)}${crmField('Next Follow-up', '', `<input id="actNext" type="datetime-local">`)}</div>`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="addCRMActivity()">Save Activity</button>`) }
function addCRMActivity() { const next = $('#actNext').value; crm.activities.unshift({ type: $('#actType').value, date: '04 Oct 2026 03:35', user: crm.data.assignedSales || 'Sales User', outcome: $('#actOutcome').value, note: $('#actNote').value }); const l = crm.leads.find(x => x.id === crm.selectedId); if (l) { l.status = 'Follow-up'; if (next) l.next = next.replace('T', ' ') } closeModal(); showToast('CRM activity added'); renderCRM() }
function crmPrescreen() {
  const docs = crmDocsForProduct(crm.data.product); const complete = docs.filter(d => crm.prescreen[d]).length; return `${crmStageHeader('7. Pre-Screen Documents', 'Collect only enough documents to confirm lead readiness before creating the detailed LOS deal.', 'Pre-Screen')}
  <div class="document-check-grid">${docs.map(d => `<label class="prescreen-doc"><input type="checkbox" data-prescreen="${d}" ${crm.prescreen[d] ? 'checked' : ''}><div><b>${d}</b><span>${crm.prescreen[d] ? 'Received' : 'Pending'}</span></div><span class="upload-btn">Attach<input type="file" accept="image/*,.pdf" onchange="crm.prescreen['${d}']=true;showToast('${d} attached');renderCRM()"></span></label>`).join('')}</div>
  <div style="height:14px"></div><div class="summary-block"><h4>Pre-Screen Readiness</h4><div class="funnel-row"><div><div class="label"><span>Documents available</span><span>${complete} / ${docs.length}</span></div><div class="progress"><span style="width:${Math.round(complete / docs.length * 100)}%"></span></div></div><strong>${Math.round(complete / docs.length * 100)}%</strong></div></div>${crmFooter()}`
}
function crmDocsForProduct(p) { if (p === 'MSME') return ['PAN', 'Aadhaar', 'Business Proof', 'Bank Statement', 'GST / Udyam', 'ITR / Financials']; if (p === 'LAP') return ['PAN', 'Aadhaar', 'Bank Statement', 'Property Papers', 'Income Proof', 'Property Tax / Utility']; if (p === 'Solar Loan') return ['PAN', 'Aadhaar', 'Bank Statement', 'Quotation / Invoice', 'Electricity Bill', 'Property / Roof Proof']; if (p === 'Tractor Loan') return ['PAN', 'Aadhaar', 'Photograph', 'Address Proof', 'Bank Statement', 'Land Records (7/12 / Jamabandi)', 'Agriculture Income Evidence', 'Dealer Quotation', 'Existing Loan Details', 'RC (Used Tractor)', 'Valuation Report (Used Tractor)']; return ['PAN', 'Aadhaar', 'Bank Statement', 'Dealer Quotation', 'Income Proof', 'Address Proof'] }
function crmOpportunity() {
  return `${crmStageHeader('8. Opportunity / Offer', 'Convert the qualified requirement into a sales opportunity before LOS handoff.', 'Opportunity')}
  <div class="grid two"><div class="form-section"><h4>Opportunity</h4><div class="source-grid" style="grid-template-columns:1fr 1fr">
    ${crmField('Opportunity Name', 'opportunityName', `<input id="crm_opportunityName" value="${crm.data.opportunityName}">`)}
    ${crmField('Win Probability %', 'probability', `<input id="crm_probability" type="number" value="${crm.data.probability}">`)}
    ${crmField('Expected Closure', 'expectedClose', `<input id="crm_expectedClose" type="date" value="${crm.data.expectedClose}">`)}
    ${crmField('Opportunity Stage', 'oppStage', `<select id="crm_oppStage"><option>Proposal</option><option selected>Ready for LOS</option><option>Negotiation</option></select>`)}
  </div></div><div class="form-section"><h4>Indicative Offer</h4><div class="source-grid" style="grid-template-columns:1fr 1fr">
    ${crmField('Offered Amount', 'offeredAmount', `<input id="crm_offeredAmount" type="number" value="${crm.data.offeredAmount}">`)}
    ${crmField('Offered Tenure', 'offeredTenure', `<input id="crm_offeredTenure" type="number" value="${crm.data.offeredTenure}">`)}
    ${crmField('Indicative ROI', 'offeredRoi', `<input id="crm_offeredRoi" type="number" step=".1" value="${crm.data.offeredRoi}">`)}
    ${crmField('Offer Valid Till', 'offerValid', `<input id="crm_offerValid" type="date" value="2026-10-10">`)}
  </div></div></div><div style="height:12px">${crmField('Sales Notes', 'notes', `<textarea id="crm_notes" rows="3">${crm.data.notes}</textarea>`)}</div>${crmFooter('Ready for LOS Handoff')}`
}
function crmLOSHandoff() {
  const docs = crmDocsForProduct(crm.data.product), complete = docs.filter(d => crm.prescreen[d]).length; return `${crmStageHeader('9. Convert CRM Lead to LOS', 'Create the product-specific LOS case and carry CRM identifiers/source ownership into Sales/Predeal.', 'CRM → LOS')}
  ${crm.losId ? `<div class="notice success"><b>Converted successfully.</b> CRM Lead ${crm.selectedId} is linked to LOS Application <b>${crm.losId}</b>.</div><div style="height:14px"></div>` : ''}
  <div class="grid two"><div class="summary-block"><h4>CRM Lead</h4><div class="summary-grid">${summary('CRM Lead ID', crm.selectedId || 'New')}${summary('Customer', (crm.data.firstName + ' ' + crm.data.lastName).trim() || crm.data.businessName)}${summary('Mobile', crm.data.mobile)}${summary('Product', crm.data.product)}${summary('Requested', money(crm.data.amount))}${summary('Source', crm.data.source)}</div></div>
  <div class="summary-block"><h4>Handoff Controls</h4><div class="metric-list"><div class="metric"><span>Lead Qualified</span><b>Yes</b></div><div class="metric"><span>Consent</span><b>Captured</b></div><div class="metric"><span>Pre-Screen Docs</span><b>${complete}/${docs.length}</b></div><div class="metric"><span>Assigned Sales</span><b>${crm.data.assignedSales}</b></div></div></div></div>
  <div style="height:14px"></div><div class="handoff-map"><div><b>CRM</b><span>Lead / Activity / Source</span></div><i>→</i><div><b>Sales / Predeal</b><span>Detailed Applicant / Asset / Documents</span></div><i>→</i><div><b>Credit / CAM</b><span>Loan / Verification / Financial</span></div><i>→</i><div><b>Underwriter</b><span>Decision / Sanction</span></div></div>
  <div class="flow-footer"><div class="left"><button class="ghost-btn" onclick="crm.stage=7;renderCRM()">← Previous</button><button class="ghost-btn" onclick="validateCRMHandoff()">Validate Handoff</button>${bdmTasksFor(crm.selectedId).length ? `<span class="badge blue">BDM tasks ${bdmTasksFor(crm.selectedId).filter(t => t.status === 'Completed').length}/3 completed</span>` : ''}</div><div class="right">${bdmTasksFor(crm.selectedId).length ? '' : `<button class="ghost-btn" onclick="initiateToBDM()">Initiate to BDM</button>`}${crm.losId ? `<button class="primary-btn" onclick="openConvertedLOS()">Open LOS Application →</button>` : `<button class="primary-btn" onclick="convertCRMToLOS()">Convert Lead to ${crm.data.product === 'MSME' ? 'MSME Sales/Predeal' : 'LOS'} →</button>`}</div></div>`
}
function bdmLeadState() { try { return JSON.parse(localStorage.getItem('namdev-bdm-leads') || '{}') } catch (e) { return {} } }
function bdmSaveLeadState(id, v) { const all = bdmLeadState(); all[id] = { ...v, at: new Date().toISOString() }; localStorage.setItem('namdev-bdm-leads', JSON.stringify(all)); localStorage.setItem('namdev-active-deal', id) }
function bdmRestoreLeads() { const all = bdmLeadState(); (crm.leads || []).forEach(l => { const v = all[l.id]; if (v) { l.status = v.status; l.next = v.next } }) }
function bdmTasksFor(caseId) { return v7Tasks.filter(t => t.source === 'BDM Initiation' && (t.caseId === caseId || t.caseId === crm.losId)) }
function initiateToBDM() {
  crmSaveCurrent(); const caseId = crm.selectedId || crm.losId || 'New Lead';
  if (bdmTasksFor(caseId).length) { showToast('BDM tasks already initiated for this lead'); return }
  const types = ['Field Visit & Customer Meeting', 'Document Collection & Verification', 'Feasibility & Income Assessment'];
  const base = 10100 + v7Tasks.length;
  const customer = (crm.data.firstName + ' ' + crm.data.lastName).trim() || crm.data.businessName || '—';
  types.forEach((type, i) => v7Tasks.unshift({ id: 'TSK-' + (base + i), caseId, customer, type, ownerRole: 'BDM', owner: 'Amit Sharma', priority: i === 0 ? 'High' : 'Normal', status: 'Open', sla: '24:00:00', due: 'Tomorrow 18:00', source: 'BDM Initiation' }));
  persistV7Tasks();
  const l = crm.leads.find(x => x.id === crm.selectedId); if (l) { l.status = 'Opportunity'; l.next = 'BDM field work initiated' }
  bdmSaveLeadState(caseId, { status: 'Opportunity', next: 'BDM field work initiated', customer });
  logAudit(caseId, 'Initiated to BDM — 3 tasks created');
  showToast('3 BDM tasks created in My Tasks'); renderCRM();
}
function saveCRMLeadDraft() {
  if (!crm.selectedId && typeof window.nfCan === "function" && !window.nfCan("createCRMLead")) {
    showToast("Permission denied: your role cannot create CRM leads.");
    return;
  }
  crmSaveCurrent();
  let lead = crm.leads.find(item => item.id === crm.selectedId);
  if (!lead) {
    const id = nextCRMLeadId();
    lead = {
      id,
      productJourneyKey: crm.productPreset || '',
      name: (crm.data.firstName + ' ' + crm.data.lastName).trim() || crm.data.businessName || 'New Lead',
      business: crm.data.businessName || '',
      altMobile: crm.data.altMobile || '',
      email: crm.data.email || '',
      city: crm.data.city || '',
      pincode: crm.data.pincode || '',
      mobile: crm.data.mobile || '',
      altMobile: crm.data.altMobile || '',
      email: crm.data.email || '',
      city: crm.data.city || '',
      pincode: crm.data.pincode || '',
      pan: crm.data.pan || '',
      aadhaar: crm.data.aadhaar || '',
      consentStatus: crm.data.consentStatus,
      consentTimestamp: crm.data.consentTimestamp || '',
      mobileOtpVerified: !!crm.data.mobileOtpVerified,
      dedupeStatus: crm.data.dedupeStatus || '',
      existingCustomerId: crm.data.existingCustomerId || '',
      product: crm.data.product,
      amount: Number(crm.data.amount || 0),
      source: crm.data.source,
      branch: crm.data.branch,
      owner: crm.data.owner || crm.data.assignedSales,
      status: 'New',
      temperature: crm.data.temperature || 'Warm',
      stage: crm.stage,
      next: 'Draft',
      score: Number(crm.data.preliminaryScore || 0),
      probability: Number(crm.data.probability || 0),
      created: '04 Oct 2026',
      converted: false
    };
    crm.leads.unshift(lead);
    crm.selectedId = id;
  }
  showToast(`Draft ${lead.id} saved`);
  renderCRM();
}
function validateCRMHandoff() { crmSaveCurrent(); const docs = crmDocsForProduct(crm.data.product), complete = docs.filter(d => crm.prescreen[d]).length; const checks = [['Product selected', !!crm.data.product], ['Customer mobile', String(crm.data.mobile || '').length >= 10], ['Sales owner assigned', !!crm.data.assignedSales], ['Consent captured', true], ['Pre-screen documents', complete >= Math.ceil(docs.length / 2)]]; showModal('CRM → LOS Handoff Validation', `<div>${checks.map(c => `<div class="check-row"><b>${c[0]}</b><span class="badge ${c[1] ? 'green' : 'amber'}">${c[1] ? 'Passed' : 'Review'}</span></div>`).join('')}</div><div style="height:12px" class="notice ${checks.every(c => c[1]) ? 'success' : 'warn'}">${checks.every(c => c[1]) ? 'Handoff is ready.' : 'Some items need review before conversion.'}</div>`, `<button class="primary-btn" onclick="closeModal()">Done</button>`) }
function bindCRM() {
  document.querySelectorAll('[data-prescreen]').forEach(cb => cb.addEventListener('change', e => { crm.prescreen[e.target.dataset.prescreen] = e.target.checked }));
  const preferredLanguage = $('#crm_preferredLanguage');
  if (preferredLanguage) {
    crmUpdateConsentMessage(preferredLanguage.value);
    preferredLanguage.addEventListener('change', e => crmUpdateConsentMessage(e.target.value));
  }
  ['amount2', 'roi', 'tenure'].forEach(x => $("#crm_" + x)?.addEventListener('input', () => { const a = Number($("#crm_amount2")?.value || crm.data.amount), r = Number($("#crm_roi")?.value || crm.data.roi), t = Number($("#crm_tenure")?.value || crm.data.tenure); if ($("#crm_estEmi")) $("#crm_estEmi").value = money(emi(a, r, t)); if ($("#crm_foir")) $("#crm_foir").value = Math.round(((crm.data.existingEmi + emi(a, r, t)) / (crm.data.monthlyIncome || 1)) * 100) + '%' }));
  $('#crm_mobile')?.addEventListener('input', e => {
    const nextMobile = e.target.value;
    if (crmMobileKey() !== nextMobile.replace(/\D/g, '')) {
      const previousMobile = crmMobileKey();
      crm.data.mobile = nextMobile;
      crm.data.consentAccepted = false;
      crm.data.consentStatus = 'Not Given';
      crm.data.consentTimestamp = '';
      crm.data.consent = 'Pending';
      crm.data.mobileOtpVerified = false;
      crmInvalidateDedupe();
      if ($('#crm_consentAccepted')) $('#crm_consentAccepted').checked = false;
      if (previousMobile) {
        try {
          const saved = JSON.parse(localStorage.getItem(CRM_DEMO_OTP_KEY) || '{}');
          delete saved[previousMobile];
          localStorage.setItem(CRM_DEMO_OTP_KEY, JSON.stringify(saved));
        } catch (error) {
          console.error('Could not clear the locally saved demo OTP after the mobile number changed.', error);
          showToast('The saved demo OTP for the previous mobile number could not be cleared.');
        }
      }
    }
    crm.data.mobile = nextMobile;
    crmRefreshOtpControls();
  });
  ['#crm_pan', '#crm_aadhaar'].forEach(selector => $(selector)?.addEventListener('input', crmInvalidateDedupe));
  crmRefreshOtpControls();
}
function crmSaveCurrent() {
  document.querySelectorAll('[id^="crm_"]').forEach(el => {
    if (el.id === 'crm_demoOtpInput') return;
    const key = el.id.replace('crm_', ''); let map = { product2: 'product', amount2: 'amount', branch2: 'branch' }; const k = map[key] || key;
    crm.data[k] = el.type === 'checkbox' ? el.checked : el.type === 'number' ? Number(el.value) : el.value;
  });
  crm.data.consent = crm.data.consentAccepted ? 'Consent Captured' : 'Pending';
  crm.data.consentStatus = crm.data.consentAccepted ? 'Consent Given' : 'Not Given';
  const l = crm.leads.find(x => x.id === crm.selectedId); if (l) {
    const applicantName = (crm.data.firstName + ' ' + crm.data.lastName).trim();
    if (applicantName) l.name = applicantName;
    l.business = crm.data.businessName || '';
    l.product = crm.data.product; l.amount = Number(crm.data.amount); l.source = crm.data.source; l.branch = crm.data.branch;
    l.productJourneyKey = crm.productPreset || l.productJourneyKey || '';
    l.owner = crm.data.assignedSales || crm.data.owner; l.mobile = crm.data.mobile; l.pan = crm.data.pan || ''; l.aadhaar = crm.data.aadhaar || '';
    l.altMobile = crm.data.altMobile || ''; l.email = crm.data.email || ''; l.city = crm.data.city || ''; l.pincode = crm.data.pincode || '';
    l.consentStatus = crm.data.consentStatus; l.consentTimestamp = crm.data.consentTimestamp || '';
    l.mobileOtpVerified = !!crm.data.mobileOtpVerified; l.temperature = crm.data.temperature; l.score = Number(crm.data.preliminaryScore) || l.score;
    l.dedupeStatus = crm.data.dedupeStatus || ''; l.existingCustomerId = crm.data.existingCustomerId || '';
    l.stage = crm.stage; l.status = crm.stage >= 7 ? 'Opportunity' : crm.stage >= 6 ? 'Pre-Screen' : crm.stage >= 5 ? 'Follow-up' : crm.stage >= 1 ? 'Qualified' : 'New';
    l.probability = Number(crm.data.probability) || l.probability;
  }
}
function crmAdvance() { crm.stage = Math.min(crm.stage + 1, crmStages.length - 1); crmSaveCurrent(); renderCRM() }
function nextCRMLeadId() {
  const now = new Date();
  const date = String(now.getFullYear()).slice(-2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const prefix = `CRM-${date}-`;
  const existingIds = new Set([
    ...(crm.leads || []).map(lead => lead.id),
    ...applications.flatMap(application => [application.crmLeadId, application.lifecycle?.leadId])
  ].filter(Boolean));
  let sequence = 1;
  let id;
  do {
    id = prefix + String(sequence).padStart(3, '0');
    sequence += 1;
  } while (existingIds.has(id));
  return id;
}
function convertCRMToLOS() {
  crmSaveCurrent(); let l = crm.leads.find(x => x.id === crm.selectedId);
  if (!l) { const id = nextCRMLeadId(); l = { id, name: (crm.data.firstName + ' ' + crm.data.lastName).trim() || crm.data.businessName, business: crm.data.businessName, mobile: crm.data.mobile, altMobile: crm.data.altMobile || '', email: crm.data.email || '', city: crm.data.city || '', pincode: crm.data.pincode || '', pan: crm.data.pan || '', aadhaar: crm.data.aadhaar || '', consentStatus: crm.data.consentStatus || 'Not Given', consentTimestamp: crm.data.consentTimestamp || '', mobileOtpVerified: !!crm.data.mobileOtpVerified, dedupeStatus: crm.data.dedupeStatus || '', product: crm.data.product, amount: Number(crm.data.amount), source: crm.data.source, branch: crm.data.branch, owner: crm.data.assignedSales || crm.data.owner, status: 'Converted', temperature: crm.data.temperature, stage: 8, next: 'LOS Created', score: crm.data.preliminaryScore, probability: 100, created: '04 Oct 2026', converted: true }; crm.leads.unshift(l); crm.selectedId = id }
  l.status = 'Converted'; l.converted = true; l.stage = 8; l.next = 'LOS Created'; l.probability = 100;
  crm.losId = crm.data.product === 'MSME' ? 'HDLMSMHOF0000075' : `SKF-${products[crm.data.product].code}-${String(10490 + applications.length)}`;
  const badge = $("#crmLeadBadge"); if (badge) badge.textContent = crm.leads.filter(x => !x.converted).length;
  showToast(`CRM lead converted to ${crm.data.product} LOS`); renderCRM();
}
function openConvertedLOS() {
  if (crm.data.product === 'MSME') {
    resetMSME(); msme.role = 'Sales User'; msme.salesTab = 0; msme.processStage = 0;
    navTo('msmeFlow'); showToast('CRM lead handed off to MSME Sales/Predeal');
  } else {
    wizard = { step: 0, product: crm.data.product, selectedApplicationId: null, data: { sourceChannel: crm.data.source, branch: crm.data.branch, salesExec: crm.data.assignedSales, requestedAmount: crm.data.amount, firstName: crm.data.firstName, lastName: crm.data.lastName, mobile: crm.data.mobile, email: crm.data.email, city: crm.data.city, pincode: crm.data.pincode }, docs: {}, coType: 'Co-applicant' };
    $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === 'newApplication')); $('#sidebar').classList.remove('open'); renderWizard(); showToast('CRM lead handed off to LOS');
  }
}

// ================= MSME WORKFLOW REPLICA / ENHANCED UI =================
function makeMSMEState() {
  return {
    role: "Sales User", processStage: 0, salesTab: 0, personalSub: 0, activeCustomer: 0,
    creditAssigned: false, creditTab: 0, underwriterOpen: false, sanctioned: false,
    customers: [
      { role: "APPLICANT", type: "INDIVIDUAL", name: "MANISH PAREEK", mobile: "7894125963", pan: "AJHLP3476H", aadhaar: "864722013458", dob: "1993-10-26", constitution: "CASH INCOME", businessProfile: "Wholeseller", email: "manish.pareek@example.com" },
      { role: "CO APPLICANT", type: "INDIVIDUAL", name: "SHUBHAM SINGH", mobile: "8523697014", pan: "BNMDS1735W", aadhaar: "746821903412", dob: "1995-10-10", constitution: "OTHERS", businessProfile: "Retailer", email: "shubham.singh@example.com" }
    ],
    references: [
      { first: "RATHI", middle: "", last: "SHARMA", relation: "FRIEND", age: 27, mobile: "9932154785", known: 15, feedback: "Positive", remarks: "ok" },
      { first: "HARSHITA", middle: "", last: "JAIN", relation: "FRIEND", age: 25, mobile: "9962387145", known: 12, feedback: "Positive", remarks: "ok" }
    ],
    dependents: [{ name: "ABHINAV", relation: "BROTHER", age: 21, education: "GRADUATE", occupation: "OTHERS", uid: "XXXX XXXX 7312" }],
    banks: [{ id: 67, borrower: "MANISH PAREEK", existence: "No", bank: "HDFC BANK LTD", holder: "MANISH PAREEK", account: "2000023", type: "Current" }],
    bureaus: [{ consumer: "MANISH PAREEK", date: "05-09-2023", score: 704, totalAccounts: 4, totalOverdue: 10000, highestSanction: 500000, currentBalance: 0, enquiries: 2, decision: "Approved", comment: "ok" }],
    specialConditions: [{ id: 1881, category: "INTERNAL", condition: "Dual name affidavit of applicant required", remarks: "ok" }],
    documents: [
      { type: "Identification Proof", copy: "Photocopy", mandatory: "Mandatory", status: "RECEIVED", date: "07-09-2023" },
      { type: "Income Proof", copy: "Photocopy", mandatory: "Optional", status: "RECEIVED", date: "07-09-2023" },
      { type: "Property Legal Docs", copy: "Photocopy", mandatory: "Optional", status: "RECEIVED", date: "07-09-2023" },
      { type: "Age Proof Individual", copy: "Photocopy", mandatory: "Mandatory", status: "RECEIVED", date: "07-09-2023" },
      { type: "Address Proof", copy: "Photocopy", mandatory: "Mandatory", status: "RECEIVED", date: "07-09-2023" }
    ],
    uploads: [{ category: "Applicant", documentOf: "MANISH PAREEK", type: "ADDRESS PROOF", name: "AADHAR UNIQUE ID", description: "Current address proof", pdStatus: "OK" }],
    verifications: [
      { type: "CONTACT VERIFICATION", sub: "TELEPHONIC VERIFICATION", entity: "APPLICANT", subtype: "ADDRESS", description: "MANISH PAREEK - CURRENT ADDRESS", appraiser: "SALES_USER", status: "Pending" },
      { type: "FI VERIFICATION", sub: "ADDRESS VERIFICATION", entity: "APPLICANT", subtype: "ADDRESS", description: "MANISH PAREEK - CURRENT ADDRESS", appraiser: "CREDIT_USER", status: "Pending" },
      { type: "LEGAL VERIFICATION", sub: "SEARCH REPORT VERIFICATION", entity: "ASSET", subtype: "ASSET", description: "PLOT - ₹10,00,000", appraiser: "SALES_USER", status: "Pending" },
      { type: "LEGAL VERIFICATION", sub: "TITLE SCRUTINY VERIFICATION", entity: "ASSET", subtype: "ASSET", description: "PLOT - ₹10,00,000", appraiser: "SALES_USER", status: "Pending" },
      { type: "RCU REPORT", sub: "RCU REPORT", entity: "APPLICANT", subtype: "OTHERS", description: "MANISH PAREEK", appraiser: "ADMIN", status: "Pending" },
      { type: "TECHNICAL VERIFICATION", sub: "PROPERTY VALUATION", entity: "ASSET", subtype: "ASSET", description: "PLOT - ₹10,00,000", appraiser: "ADMIN", status: "Pending" }
    ]
  };
}
function resetMSME() { msme = makeMSMEState(); }
const msmeSalesTabs = ["Source", "Personal", "Charges", "Asset", "Documents", "Upload Document", "IMD Maker"];
const msmePersonalTabs = ["Customer Details", "Address Details", "Reference Details", "Employment Details", "Dependent Details", "Bank Details"];
const msmeCreditTabs = ["Source Details", "Personal Details", "Loan Details", "Charges Details", "Installment Details", "Repayment Details", "Asset/Collateral Details", "Background Details", "Bank Details", "Special Conditions", "Documents", "Uploaded Documents", "Verification Initiation", "Verification Initiated To", "Financial", "Fundflow", "Manual CIBIL"];
const msmeProcessStages = ["Pre Deal Capturing", "CAM Automation", "Credit / CAM Sheet", "Field Verification", "Financial & Fundflow", "Underwriting", "Sanctioned"];

function renderMSMEFlow() {
  setPage("MSME Loan Journey", "MSME / Process Replica");
  if (!["Sales User", "Credit User", "Appraiser", "Underwriter"].includes(msme.role)) { const r = msme.role; msme.role = SALES_CHAIN.includes(r) ? "Sales User" : ["BCM", "ACM", "ZCM", "Credit Head"].includes(r) ? "Credit User" : r === "Appraiser" ? "Appraiser" : "Underwriter"; }
  const role = msme.role;
  let body = role === "Sales User" ? renderMSMESales() : role === "Credit User" ? renderMSMECredit() : role === "Appraiser" ? renderMSMEAppraiser() : renderMSMEUnderwriter();
  $("#content").innerHTML = `<div class="process-shell">${msmeHeader()}${body}</div>`;
  bindMSME();
}
function msmeHeader() {
  return `<div class="process-top">
    <div class="process-topbar">
      <div class="process-ident"><div class="product-icon">🏢</div><div><h3>MSME Loan • Deal No. HDLMSMHOF0000075</h3><p>Scheme: MSME AGRI • Customer: MANISH PAREEK • Branch: HEAD OFFICE</p></div></div>
      <div class="process-actions">
        <span class="role-chip"><i></i>${msme.role}</span>
        <select id="msmeRoleSwitch" class="filter-btn" style="width:auto"><option ${msme.role === 'Sales User' ? 'selected' : ''}>Sales User</option><option ${msme.role === 'Credit User' ? 'selected' : ''}>Credit User</option><option ${msme.role === 'Appraiser' ? 'selected' : ''}>Appraiser</option><option ${msme.role === 'Underwriter' ? 'selected' : ''}>Underwriter</option></select>
        <button class="danger-outline" onclick="openMSMEReject()">Reject Case</button><button class="filter-btn" onclick="openMSMEQuery()">Query</button><button class="filter-btn" onclick="showMSMEPreview()">Preview</button>
      </div>
    </div>
    <div class="stage-ribbon">${msmeProcessStages.map((s, i) => `<div class="stage-node ${i < msme.processStage ? 'done' : ''} ${i === msme.processStage ? 'current' : ''}"><div style="display:flex;flex-direction:column;align-items:center"><div class="bubble">${i < msme.processStage ? '✓' : i + 1}</div><label>${s}</label></div>${i < msmeProcessStages.length - 1 ? '<div class="stage-line"></div>' : ''}</div>`).join('')}</div>
  </div>`;
}
function bindMSME() {
  $("#msmeRoleSwitch")?.addEventListener("change", e => { msme.role = e.target.value; if (msme.role === "Credit User" && msme.processStage < 1) msme.processStage = 1; if (msme.role === "Appraiser" && msme.processStage < 3) msme.processStage = 3; if (msme.role === "Underwriter" && msme.processStage < 5) msme.processStage = 5; renderMSMEFlow(); });
  if (msme.role === "Sales User" && msme.salesTab === 0) {
    ["msmeRequested", "msmeRate", "msmeTenure"].forEach(id => $("#" + id)?.addEventListener("input", () => { const e = emi($("#msmeRequested").value, $("#msmeRate").value, $("#msmeTenure").value); if ($("#msmeEmi")) $("#msmeEmi").value = money(e) }));
  }
}
function msmeSalesNav() { return `<div class="process-tabs">${msmeSalesTabs.map((t, i) => `<button class="process-tab ${i === msme.salesTab ? 'active' : ''} ${i < msme.salesTab ? 'done' : ''}" onclick="msme.salesTab=${i};renderMSMEFlow()">${i < msme.salesTab ? '✓ ' : ''}${t}</button>`).join('')}</div>`; }
function renderMSMESales() {
  return `<div class="process-card">
    <div class="section-bar"><div><h3>Sales / Predeal Capturing</h3><p>Flow mapped to the supplied MSME process: Source → Personal → Charges → Asset → Documents → Upload Document → IMD Maker.</p></div><span class="badge purple">Sales User ID</span></div>
    ${msmeSalesNav()}<div style="height:15px"></div>${renderMSMESalesTab()}
  </div>`;
}
function renderMSMESalesTab() {
  if (msme.salesTab === 0) return msmeSourceForm();
  if (msme.salesTab === 1) return msmePersonal();
  if (msme.salesTab === 2) return msmeCharges();
  if (msme.salesTab === 3) return msmeAsset();
  if (msme.salesTab === 4) return msmeDocuments();
  if (msme.salesTab === 5) return msmeUploadDocuments();
  return msmeIMDMaker();
}
function f(label, control, help = "") { return `<label class="field"><span>${label}</span>${control}${help ? `<small>${help}</small>` : ''}</label>` }
function msmeSourceForm() {
  return `<div class="step-banner"><b>Step 2 • Click NEW & fill all required detail</b><span>Source / Predeal</span></div>
  <div class="source-grid">
    ${f("Lead No *", `<select><option>--Select--</option></select>`)}${f("Deal No", `<input value="HDLMSMHOF0000075" readonly>`)}${f("Application Form No *", `<input value="WEB-MS-NFPL02991-20231031115435">`)}${f("Deal Category *", `<select><option>GENERAL</option></select>`)}
    ${f("Branch *", `<select><option>HEAD OFFICE</option></select>`)}${f("Generated By *", `<input value="RM / SALES EXEC">`)}${f("Relationship Officer (RO) *", `<input value="GOVIND MISHRA (NFPL0299)">`)}${f("Line Manager *", `<input value="ADMIN (ADMIN)">`)}
    ${f("Source *", `<select><option>DIRECT SALES AGENT</option><option>BRANCH WALK-IN</option><option>REFERRAL</option></select>`)}${f("Source Description *", `<input value="Source Description">`)}${f("Product *", `<select><option>MSME LOAN</option></select>`)}${f("Scheme *", `<select><option>MSME AGRI</option><option>MSME BUSINESS</option></select>`)}
    ${f("Loan Type *", `<select><option>NEW LOAN</option></select>`)}${f("Loan Sub Type *", `<select><option>TERM LOAN</option><option>WORKING CAPITAL</option></select>`)}${f("Loan Purpose *", `<select><option>NEW BUSINESS SETUP</option><option>WORKING CAPITAL</option><option>BUSINESS EXPANSION</option></select>`)}${f("Requested Loan Amount *", `<input id="msmeRequested" type="number" value="1000000">`)}
    ${f("Tenure *", `<input id="msmeTenure" type="number" value="48">`)}${f("Interest Rate % (Per Annum) *", `<input id="msmeRate" type="number" value="11">`)}${f("Monthly Income Of All Applicants *", `<input type="number" value="85000">`)}${f("Monthly obligation Of All Applicants *", `<input value="Locked / system derived" disabled>`, `The original vehicle BRD also calls for this field to be frozen for new cases.`)}
    ${f("EMI", `<input id="msmeEmi" value="${money(emi(1000000, 11, 48))}" readonly>`)}${f("IRR", `<input value="11.00" readonly>`)}${f("FOIR", `<input value="38.50" readonly>`)}${f("Maker Remarks", `<textarea rows="2">New MSME application</textarea>`)}
  </div>${msmeFlowFooter(0, "Save & Continue")}`;
}
function msmeFlowFooter(tab, label = "Save & Continue") {
  return `<div class="flow-footer"><div class="left"><button class="ghost-btn" onclick="saveMSMECurrentForm()">Save</button>${tab > 0 ? `<button class="ghost-btn" onclick="msme.salesTab=${tab - 1};renderMSMEFlow()">← Previous</button>` : ''}</div><div class="right">${tab < 6 ? `<button class="primary-btn" onclick="saveMSMECurrentForm();msme.salesTab=${tab + 1};renderMSMEFlow()">${label} →</button>` : `<button class="primary-btn" onclick="forwardMSMEToCredit()">Save & Forward to Credit →</button>`}</div></div>`;
}
function msmePersonal() {
  const c = msme.customers[msme.activeCustomer];
  return `<div class="step-banner"><b>Steps 3–10 • Personal details for Applicant / Co-applicant</b><span>At least 2 references required</span></div>
    <div class="section-bar"><div><h3>Personal Details</h3><p>Add applicant or co-applicant, then complete each nested detail tab.</p></div><button class="primary-btn" onclick="showMSMEAddCustomer()">+ Add More</button></div>
    <div class="customer-grid">${msme.customers.map((x, i) => `<div class="customer-card"><div class="mini-avatar">${initials(x.name)}</div><div class="meta"><b>${x.name}</b><span>${x.role} • ${x.type} • ${x.mobile}</span></div><button class="pill-btn ${i === msme.activeCustomer ? 'primary' : ''}" onclick="msme.activeCustomer=${i};msme.personalSub=0;renderMSMEFlow()">Open</button></div>`).join('')}</div>
    <div style="height:14px"></div><div class="subtabs">${msmePersonalTabs.map((t, i) => `<button class="subtab ${i === msme.personalSub ? 'active' : ''}" onclick="msme.personalSub=${i};renderMSMEFlow()">${t}</button>`).join('')}</div>
    <div class="section-bar"><div><h3>${c.name} • ${c.role}</h3><p>${msmePersonalTabs[msme.personalSub]}</p></div>${msme.personalSub === 2 ? `<span class="ref-count">${msme.references.length}/2 references</span>` : ''}</div>
    ${renderMSMEPersonalSub(c)}${msmeFlowFooter(1)}`;
}
function renderMSMEPersonalSub(c) {
  if (msme.personalSub === 0) return `<div class="source-grid">
    ${f("Customer Role *", `<select><option>${c.role}</option></select>`)}${f("Customer Type *", `<select><option>${c.type}</option></select>`)}${f("Application Type *", `<select><option>NEW</option></select>`)}${f("Selection Type (As Per) *", `<select><option>Aadhar No</option><option>PAN No</option></select>`)}
    ${f("Salutation *", `<select><option>MR</option><option>MRS</option><option>MS</option></select>`)}${f("First Name *", `<input value="${c.name.split(' ')[0]}">`)}${f("Middle Name", `<input placeholder="Middle Name">`)}${f("Last Name *", `<input value="${c.name.split(' ').slice(1).join(' ')}">`)}
    ${f("Photo Capture", `<button class="filter-btn" onclick="openMSMEPhotoCapture()">📷 PHOTOCAPTURE</button>`)}${f("Father/Husband Name *", `<input value="RAJ PAREEK">`)}${f("Mother Name *", `<input value="SIMRAN">`)}${f("KYC Risk Categorisation *", `<select><option>MEDIUM RISK</option><option>LOW RISK</option><option>HIGH RISK</option></select>`)}
    ${f("Date of Birth *", `<input type="date" value="${c.dob}">`)}${f("Marital Status *", `<select><option>SINGLE</option><option>MARRIED</option></select>`)}${f("Gender *", `<select><option>MALE</option><option>FEMALE</option></select>`)}${f("Constitution *", `<select><option>${c.constitution}</option></select>`)}
    ${f("Business Profile", `<input value="${c.businessProfile}">`)}${f("Customer Caste", `<select><option>GENERAL</option></select>`)}${f("Religion *", `<select><option>HINDU</option><option>MUSLIM</option><option>SIKH</option><option>OTHER</option></select>`)}${f("Education Detail *", `<select><option>GRADUATE</option><option>POST GRADUATE</option></select>`)}
    ${f("PAN Number *", `<input value="${c.pan}">`)}${f("Aadhaar No *", `<input value="${c.aadhaar}">`)}${f("Add Other KYC", `<select><option>--Select--</option><option>VOTER ID</option><option>DRIVING LICENSE</option><option>PASSPORT</option></select>`)}${f("Mobile Number *", `<input value="${c.mobile}">`)}
    ${f("Alternate Mobile Number 1", `<input placeholder="Alternate Mobile Number 1">`)}${f("Alternate Mobile Number 2", `<input placeholder="Alternate Mobile Number 2">`)}${f("Alternate Mobile Number 3", `<input placeholder="Alternate Mobile Number 3">`)}${f("Email Id", `<input value="${c.email}">`)}
    ${f("Alternate Email Id 1", `<input placeholder="Alternate Email Id 1">`)}${f("Alternate Email Id 2", `<input placeholder="Alternate Email Id 2">`)}
  </div>`;
  if (msme.personalSub === 1) return `<div class="source-grid">
    ${f("Address Type *", `<select><option>CURRENT ADDRESS</option><option>PERMANENT ADDRESS</option><option>OFFICE ADDRESS</option></select>`)}${f("Address Line 1 *", `<input value="JAIPUR">`)}${f("Floor No", `<input value="12">`)}${f("Plot No", `<input value="12">`)}
    ${f("Address Line 2", `<input value="Vaishali Nagar">`)}${f("Address Line 3", `<input value="Sanganer">`)}${f("Popular Landmark", `<input value="Near Metro">`)}${f("Pincode *", `<input value="302026">`)}
    ${f("Post Office *", `<input value="Sanganer">`)}${f("District *", `<input value="JAIPUR">`)}${f("State *", `<input value="RAJASTHAN">`)}${f("Country *", `<input value="INDIA">`)}
    ${f("Staying at current address since (MM/YYYY) *", `<input value="01/2019">`)}${f("Current Residence Ownership *", `<select><option>FAMILY OWNED</option><option>SELF OWNED</option><option>RENTED</option></select>`)}${f("Communication Address", `<label class="check"><input type="checkbox" checked> Yes</label>`)}${f("I have visited the properties", `<label class="check"><input type="checkbox" checked> Yes</label>`)}
  </div>`;
  if (msme.personalSub === 2) return `<div class="validation-hint">The supplied process requires <b>at least 2 references</b>. Both are captured below.</div><div style="height:10px"></div>${msme.references.map((r, i) => `<div class="form-section"><h4>Reference ${i + 1}</h4><div class="source-grid">
      ${f("First Name *", `<input value="${r.first}">`)}${f("Middle Name", `<input value="${r.middle}">`)}${f("Last Name *", `<input value="${r.last}">`)}${f("Relationship with Applicant *", `<select><option>${r.relation}</option><option>NEIGHBOUR</option><option>RELATIVE</option></select>`)}
      ${f("Age *", `<input type="number" value="${r.age}">`)}${f("Mobile No *", `<input value="${r.mobile}">`)}${f("Known Since (in years) *", `<input type="number" value="${r.known}">`)}${f("Feedback *", `<select><option>${r.feedback}</option><option>Negative</option><option>Neutral</option></select>`)}
      ${f("Remarks", `<input value="${r.remarks}">`)}
    </div></div>`).join('')}`;
  if (msme.personalSub === 3) return `<div class="source-grid">
    ${f("Company Name *", `<input value="AJAY SINGHAL">`)}${f("Company Description *", `<input value="MSME MANUFACTURING">`)}${f("Address Line 1 *", `<input value="RIICO INDUSTRIAL AREA">`)}${f("Address Line 2", `<input value="JAIPUR">`)}
    ${f("Address Line 3", `<input value="RAJASTHAN">`)}${f("Pincode *", `<input value="302013">`)}${f("Post Office *", `<input value="VKI">`)}${f("District *", `<input value="JAIPUR">`)}
    ${f("State *", `<input value="RAJASTHAN">`)}${f("Country *", `<input value="INDIA">`)}${f("Designation *", `<select><option>PROPRIETOR</option><option>DIRECTOR</option></select>`)}${f("Type of Organisation *", `<select><option>PROPRIETORSHIP</option><option>PARTNERSHIP</option><option>PVT LTD</option></select>`)}
    ${f("Date Of Joining / Incorporation *", `<input type="date" value="2016-04-01">`)}${f("Working Since *", `<input value="7 Years">`)}${f("Month *", `<select><option>APRIL</option></select>`)}${f("Type of Business Premise *", `<select><option>OWNED</option><option>RENTED</option></select>`)}
    ${f("Nature Of Business *", `<select><option>MANUFACTURER</option><option>TRADER</option><option>SERVICE</option></select>`)}${f("Name Of Authorised Signatory", `<input value="MANISH PAREEK">`)}${f("Industry Type *", `<select><option>MANUFACTURING</option><option>TRADING</option><option>SERVICE</option></select>`)}
  </div>`;
  if (msme.personalSub === 4) return `<div class="section-bar"><div><h3>Dependent Details</h3><p>Maintain dependent name, relation, age, education, occupation and UID.</p></div><button class="primary-btn" onclick="addMSMEDependent()">+ Add Dependent</button></div><div class="table-wrap"><table><thead><tr><th>Name</th><th>Relation Description</th><th>Age</th><th>Education</th><th>Occupation</th><th>UID (Aadhaar No.)</th><th></th></tr></thead><tbody>${msme.dependents.map((d, i) => `<tr><td>${d.name}</td><td>${d.relation}</td><td>${d.age}</td><td>${d.education}</td><td>${d.occupation}</td><td>${d.uid}</td><td><button class="pill-btn red" onclick="deleteMSMEDependent(${i})">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
  return `<div class="source-grid">
    ${f("Customer *", `<select><option>${c.name} - (${c.role})</option></select>`)}${f("Name of A/c Holder *", `<input value="${c.name}">`)}${f("Account Type *", `<select><option>SAVINGS</option><option>CURRENT</option></select>`)}${f("Account Number *", `<input value="2000023">`)}
    ${f("Account Type Single/Joint (Account Holding) *", `<select><option>Single</option><option>Joint</option></select>`)}${f("Bank Name *", `<select><option>HDFC BANK LTD</option></select>`)}${f("Branch Name *", `<input value="JAIPUR">`)}${f("IFSC Code", `<input value="HDFC0003874">`)}
    ${f("MICR Code", `<input value="302240007">`)}${f("Account Since (YYYY)", `<input value="2015">`)}
  </div>`;
}
function showMSMEAddCustomer() {
  showModal("Add Customer", `<div class="source-grid">
    ${f("Applicant Type", `<select id="newCustRole"><option>APPLICANT</option><option>CO APPLICANT</option></select>`)}${f("Applicant Category", `<select><option>Individual</option></select>`)}${f("Selection Type (As Per)", `<select><option>NOT APPLICABLE</option><option>AADHAAR</option><option>PAN</option></select>`)}
    ${f("Deal No", `<input value="HDLMSMHOF0000075">`)}${f("Loan No", `<input placeholder="Loan No">`)}${f("First Name *", `<input id="newCustFirst" value="PRIYA">`)}${f("Middle Name", `<input id="newCustMiddle">`)}
    ${f("Last Name *", `<input id="newCustLast" value="PAREEK">`)}${f("Date Of Birth *", `<input type="date" id="newCustDob" value="1994-04-20">`)}${f("Mobile Number *", `<input id="newCustMobile" value="9988776655">`)}${f("PAN Number *", `<input id="newCustPan" value="ABCDE1234F">`)}
    ${f("Aadhaar No", `<input id="newCustAadhaar" value="123456789012">`)}${f("Voter Id", `<input>`)}${f("Driving License", `<input>`)}${f("Passport File Number", `<input>`)}${f("Passport Number", `<input>`)}
  </div>`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="addMSMECustomer()">Search & Save</button>`);
}
function addMSMECustomer() {
  const role = $("#newCustRole").value, name = [$("#newCustFirst").value, $("#newCustMiddle").value, $("#newCustLast").value].filter(Boolean).join(" ");
  msme.customers.push({ role, type: "INDIVIDUAL", name, mobile: $("#newCustMobile").value, pan: $("#newCustPan").value, aadhaar: $("#newCustAadhaar").value, dob: $("#newCustDob").value, constitution: "CASH INCOME", businessProfile: "Business", email: "" });
  msme.activeCustomer = msme.customers.length - 1; closeModal(); showToast("Customer added successfully"); renderMSMEFlow();
}
function msmeChargeRows() {
  const rows = [[4, "INITIAL MONEY CHARGE", 9, 2542, 3000], [106, "PROCESSING FEE", 9, 0, 0], [111, "CERSAI CHARGES", 9, 100, 118], [112, "CPP CHARGES", 9, 0, 0], [113, "HEALTH INSURANCE", 9, 254, 300], [114, "VALUATION CHARGES", 0, 2700, 2700], [115, "LEGAL CHARGES", 0, 2500, 2500]];
  return rows.map(r => `<tr><td>Receivable</td><td>${r[0]}</td><td>${r[1]}</td><td>Customer</td><td>MANISH PAREEK</td><td>No</td><td>${r[2].toFixed(2)}</td><td>${r[2].toFixed(2)}</td><td>FLAT</td><td>${money(r[3])}</td><td>${money(r[4])}</td></tr>`).join('');
}
function msmeCharges() { return `<div class="step-banner"><b>Step 11 • Charges</b><span>Refresh & Save</span></div><div class="table-wrap"><table><thead><tr><th>Charge Type</th><th>Charge Code</th><th>Charge Description</th><th>Business Partner Type</th><th>Business Partner Name</th><th>Tax Inclusive</th><th>Tax Rate1</th><th>Tax Rate2</th><th>Charge Method</th><th>Charge Amount</th><th>Final Amount</th></tr></thead><tbody>${msmeChargeRows()}</tbody></table></div><div class="flow-footer"><div class="left"><button class="primary-btn" onclick="showToast('Charges recalculated');renderMSMEFlow()">Refresh</button><button class="ghost-btn" onclick="saveMSMECurrentForm('Charges saved to case')">Save</button><span class="badge gray">Total Charge: ₹8,618</span></div><div class="right"><button class="primary-btn" onclick="msme.salesTab=3;renderMSMEFlow()">Continue to Asset →</button></div></div>` }
function msmeAsset() { return `<div class="step-banner"><b>Step 12 • Asset / Collateral</b><span>Map collateral details</span></div><div class="dark-panel"><div class="source-grid">${f("Asset Collateral Type", `<select><option>ASSET</option></select>`)}${f("Asset Nature", `<select><option>NEW</option></select>`)}${f("Asset Class", `<select><option>PROPERTY</option></select>`)}</div><div style="height:10px"></div><button class="ghost-btn" onclick="msme.assetMapped=true;showToast('Asset mapped to case');renderMSMEFlow()">Next</button><div style="height:14px"></div><div class="flow-mini-title">Mapped Asset Details</div>${msme.assetDeleted ? `<div class="empty-state"><p>No mapped asset. Click Next to map again.</p></div>` : `<div class="table-wrap"><table><thead><tr><th>ID</th><th>Asset Collateral Type</th><th>Asset Class</th><th>Asset Description</th><th>Asset Value</th><th></th></tr></thead><tbody><tr><td>94</td><td>ASSET</td><td>PROPERTY</td><td>PLOT OF LAND</td><td>₹10,00,000</td><td><button class="pill-btn red" onclick="deleteMSMEAsset()">Delete</button></td></tr></tbody></table></div>`}</div>${msmeFlowFooter(3)}` }
function deleteMSMEAsset() { msme.assetDeleted = true; showToast('Asset deleted'); renderMSMEFlow() }
function msmeDocuments() { return `<div class="step-banner"><b>Step 13 • Documents</b><span>Document Checklist</span></div><div class="table-wrap"><table><thead><tr><th>Document Of</th><th>Type Of Documents</th><th>Original/Photocopy</th><th>Mandatory</th><th>Document Type</th><th>Document Status</th><th>Received Date</th><th>Deferred Date</th></tr></thead><tbody>${msme.documents.map(d => `<tr><td>Manish Pareek (Applicant)</td><td>${d.type}</td><td>${d.copy}</td><td><span class="badge ${d.mandatory === 'Mandatory' ? 'red' : 'gray'}">${d.mandatory}</span></td><td>NA</td><td><span class="badge green">${d.status}</span></td><td>${d.date}</td><td>—</td></tr>`).join('')}</tbody></table></div>${msmeFlowFooter(4)}` }
function msmeUploadDocuments() { return `<div class="step-banner"><b>Step 14 • Upload Document</b><span>Category → Document Of → Type → Name</span></div><div class="dark-panel"><div class="source-grid">${f("Category", `<select><option>Applicant</option><option>Co Applicant</option><option>Asset</option></select>`)}${f("Document Of", `<select><option>MANISH PAREEK</option><option>SHUBHAM SINGH</option></select>`)}${f("Document Type", `<select><option>ADDRESS PROOF</option><option>IDENTIFICATION PROOF</option><option>INCOME PROOF</option></select>`)}${f("Document Name", `<select><option>AADHAR UNIQUE ID</option><option>PAN CARD</option><option>BANK STATEMENT</option></select>`)}${f("Document Description", `<textarea rows="2">Document Description</textarea>`)}${f("Choose Files", `<input type="file" accept="image/*,.pdf">`)}</div><div style="height:9px"></div><div class="action-row"><button class="ghost-btn" onclick="uploadMSMEDocument()">Upload</button><button class="ghost-btn" onclick="addMSMEDocumentRow()">Add Additional Document</button></div></div><div style="height:13px"></div><div class="table-wrap"><table><thead><tr><th>Category</th><th>Document Of</th><th>Document Type</th><th>Document Name</th><th>Document Description</th><th>PD Status</th><th>PD Done By</th><th>Download</th></tr></thead><tbody>${msme.uploads.map(d => `<tr><td>${d.category}</td><td>${d.documentOf}</td><td>${d.type}</td><td>${d.name}</td><td>${d.description}</td><td>${d.pdStatus}</td><td>SALES USER</td><td><button class="pill-btn" onclick="downloadMSMEDocument()">⇩</button></td></tr>`).join('')}</tbody></table></div>${msmeFlowFooter(5)}` }
function msmeIMDMaker() {
  const dealId = crm.losId || crm.selectedId || localStorage.getItem('namdev-active-deal') || 'HDLMSMHOF0000075';
  const bdm = v7Tasks.filter(t => t.source === 'BDM Initiation' && (t.caseId === dealId || t.caseId === crm.selectedId));
  if (!bdm.length || bdm.some(t => t.status !== 'Completed')) return `<div class="step-banner"><b>Steps 15–16 • IMD Maker</b><span>Locked until BDM tasks are completed</span></div><div class="notice warn"><b>BDM field tasks must be completed before IMD Capture.</b> Deal: <b>${dealId}</b>. ${bdm.length ? `Completed: <b>${bdm.filter(t => t.status === 'Completed').length}/3</b> — ${bdm.map(t => `${t.type} (${t.status})`).join(' · ')}.` : 'Completed: <b>0/3</b> — no BDM initiation found for this deal. Initiate it from CRM & Leads → lead → 9. Convert CRM Lead to LOS → Initiate to BDM.'}</div><div class="flow-footer"><div class="left"><button class="ghost-btn" onclick="msme.salesTab=5;renderMSMEFlow()">← Previous</button></div><div class="right"><button class="ghost-btn" onclick="navTo('taskSla')">Open My Tasks →</button></div></div>`;
  return `<div class="step-banner"><b>Steps 15–16 • IMD Maker</b><span>Save, allocate receivables and forward</span></div><div class="source-grid">
  ${f("Deal No", `<select><option>HDLMSMHOF0000075 (MANISH PAREEK)</option></select>`)}${f("Borrower Name", `<input value="MANISH PAREEK">`)}${f("IMD Mode", `<select><option>CASH</option><option>CHEQUE</option><option>NEFT</option></select>`)}${f("IMD Date", `<input type="date" value="2023-09-07">`)}
  ${f("Instrument No", `<input>`)}${f("Instrument Date", `<input type="date">`)}${f("Bank Name", `<select><option>HDFC BANK LTD</option></select>`)}${f("Branch Name", `<select><option>JAIPUR</option></select>`)}
  ${f("IFSC Code", `<input value="HDFC0003874">`)}${f("MICR Code", `<input value="302240007">`)}${f("Bank Amount", `<input type="number" value="2000">`)}${f("IMD Amount", `<input type="number" value="2000">`)}
  ${f("Auto or Manual", `<select><option>Auto</option><option>Manual</option></select>`)}${f("Receipt No", `<input>`)}${f("Transaction Reference No", `<input>`)}${f("Deposit Bank Account", `<select><option>50200009154663-HDFC BANK LTD</option></select>`)}
  ${f("Total Receivables", `<input value="8618" readonly>`)}${f("Purpose", `<input value="IMD">`)}${f("Maker Remarks", `<input value="ok">`)}${f("Author Remarks", `<input>`)}
  </div><div class="flow-footer"><div class="left"><button class="ghost-btn" onclick="msme.imdSaved=true;showToast('IMD saved')">Save</button><button class="ghost-btn" onclick="allocateMSMEReceivables()">Allocate Receivables</button><button class="ghost-btn" onclick="viewMSMEReceivables()">View Receivables</button><button class="danger-btn" onclick="confirmMSMEDelete('IMD')">Delete</button></div><div class="right"><button class="primary-btn" onclick="forwardMSMEToCredit()">Forward → Credit</button></div></div>`}
function forwardMSMEToCredit() { msme.role = "Credit User"; msme.processStage = 1; msme.creditAssigned = false; showToast("Case forwarded. Logged in as Credit User for assignment."); renderMSMEFlow() }

function renderMSMECredit() {
  if (!msme.creditAssigned) return `<div class="process-card"><div class="step-banner"><b>Steps 17–18 • Credit login & case assignment</b><span>Assign case, then open CAM Sheet</span></div><div class="section-bar"><div><h3>Credit Operation • Assignment Queue</h3><p>Forwarded cases awaiting allocation to a credit person.</p></div><button class="ghost-btn" onclick="renderMSMEFlow();showToast('Queue refreshed')">↻ Refresh</button></div><div class="table-wrap"><table><thead><tr><th>Deal No</th><th>Borrower Name</th><th>Branch</th><th>Product</th><th>Scheme</th><th>Bureau</th><th>IMD</th><th>Status</th><th>User Name</th><th></th></tr></thead><tbody><tr><td><b>HDLMSMHOF0000075</b></td><td>MANISH PAREEK</td><td>HEAD OFFICE</td><td>MSME LOAN</td><td>MSME AGRI</td><td><span class="badge amber">Pending</span></td><td><span class="badge amber">Ready</span></td><td><span class="badge green">Forwarded</span></td><td><select id="creditAssignee"><option>SALOON JANGID</option><option>RAHUL CREDIT</option><option>CREDIT_USER</option></select></td><td><button class="primary-btn" onclick="assignMSMECredit()">Assign & Open CAM</button></td></tr></tbody></table></div></div>`;
  return `<div class="process-card"><div class="section-bar"><div><h3>Credit Operation • CAM Sheet</h3><p>Assigned to SALOON JANGID • Complete loan, verification, financial and bureau stages.</p></div><span class="badge blue">CAM Sheet</span></div><div class="process-tabs">${msmeCreditTabs.map((t, i) => `<button class="process-tab ${i === msme.creditTab ? 'active' : ''} ${i < msme.creditTab ? 'done' : ''}" onclick="msme.creditTab=${i};renderMSMEFlow()">${t}</button>`).join('')}</div><div style="height:15px"></div>${renderMSMECreditTab()}</div>`;
}
function assignMSMECredit() { msme.creditAssigned = true; msme.processStage = 2; msme.creditTab = 0; showToast("Case assigned and CAM Sheet opened"); renderMSMEFlow() }
function creditFooter(next = true) { return `<div class="flow-footer"><div class="left"><button class="ghost-btn" onclick="saveMSMECurrentForm()">Update / Save</button>${msme.creditTab > 0 ? `<button class="ghost-btn" onclick="msme.creditTab--;renderMSMEFlow()">← Previous</button>` : ''}</div><div class="right">${next && msme.creditTab < msmeCreditTabs.length - 1 ? `<button class="primary-btn" onclick="msme.creditTab++;renderMSMEFlow()">Save & Continue →</button>` : ''}${msme.creditTab === msmeCreditTabs.length - 1 ? `<button class="primary-btn" onclick="forwardMSMEUnderwriter()">Forward to Underwriter →</button>` : ''}</div></div>` }
function renderMSMECreditTab() {
  const i = msme.creditTab;
  if (i === 0) return msmeCreditSource();
  if (i === 1) return msmeCreditPersonal();
  if (i === 2) return msmeCreditLoan();
  if (i === 3) return msmeCreditCharges();
  if (i === 4) return msmeCreditInstallments();
  if (i === 5) return msmeCreditRepayment();
  if (i === 6) return msmeCreditAsset();
  if (i === 7) return msmeCreditBackground();
  if (i === 8) return msmeCreditBank();
  if (i === 9) return msmeCreditSpecial();
  if (i === 10) return msmeCreditDocs();
  if (i === 11) return msmeCreditUploaded();
  if (i === 12) return msmeVerificationInitiation();
  if (i === 13) return msmeVerificationInitiatedTo();
  if (i === 14) return msmeFinancial();
  if (i === 15) return msmeFundflow();
  return msmeManualCibil();
}
function msmeCreditSource() {
  return `<div class="step-banner"><b>CAM Sheet • Source Details</b><span>Credit Operation</span></div><div class="source-grid">
  ${f("Lead No", `<input value="Lead No" readonly>`)}${f("Deal No", `<input value="HDLMSMHOF0000075" readonly>`)}${f("Application Form No", `<input value="WEB-MS-NFPL02991-20231031115435">`)}${f("Date & Time Of Receipt", `<input value="07-09-2023">`)}
  ${f("Date Encoded", `<input value="31-10-2023">`)}${f("Deal Category", `<select><option>GENERAL</option></select>`)}${f("Branch", `<input value="HEAD OFFICE">`)}${f("Generated By", `<input value="RM / SALES EXEC">`)}
  ${f("Relationship Officer (RO)", `<input value="GOVIND MISHRA">`)}${f("Relationship Manager / Team Leader", `<input value="ADMIN (ADMIN)">`)}${f("Source", `<select><option>DIRECT SALES AGENT</option></select>`)}${f("Source Description", `<input value="DSA">`)}
  ${f("Source BM Name", `<input value="Source BM Name">`)}${f("TL Name", `<input value="TL Name">`)}${f("Referred By", `<input value="Referred By">`)}${f("Inward No", `<input value="Inward No">`)}
  ${f("Area Code", `<select><option>--Select--</option></select>`)}${f("Case Visited By", `<input>`)}${f("Maker Remarks", `<textarea rows="2">ok</textarea>`)}${f("Author Remarks", `<textarea rows="2"></textarea>`)}
  </div>${creditFooter()}`
}
function msmeCreditPersonal() { return `<div class="step-banner"><b>CAM Sheet • Personal Details</b><span>Applicant and Co-applicant already captured by Sales</span></div><div class="table-wrap"><table><thead><tr><th>Customer Id</th><th>Borrower Name</th><th>Customer Role</th><th>Customer Type</th><th>Mobile</th><th>PAN</th><th>KYC Status</th></tr></thead><tbody>${msme.customers.map((c, i) => `<tr><td>${89 + i}</td><td><b>${c.name}</b></td><td>${c.role}</td><td>${c.type}</td><td>${c.mobile}</td><td>${c.pan}</td><td><span class="badge green">Verified</span></td></tr>`).join('')}</tbody></table></div>${creditFooter()}` }
function msmeCreditLoan() {
  return `<div class="step-banner"><b>Step 19 • Loan Details</b><span>Populate terms before installment / repayment setup</span></div><div class="source-grid">
  ${f("Deal No", `<input value="HDLMSMHOF0000075" readonly>`)}${f("Product *", `<select><option>MSME LOAN</option></select>`)}${f("Scheme *", `<select><option>MSME AGRI</option></select>`)}${f("Loan Type *", `<select><option>NEW LOAN</option></select>`)}
  ${f("ROI *", `<input value="11.00">`, `Select rate between 0 to 30.`)}${f("Tenure *", `<input value="48">`, `Select tenure between 1 to 84.`)}${f("Tenure in Days", `<input value="1440">`)}${f("Frequency *", `<select><option>MONTHLY</option></select>`)}
  ${f("Requested Loan Amount *", `<input value="1000000">`, `Select Loan Amount between 100000 to 1000000.`)}${f("Insurance Premium", `<input value="0">`)}${f("Assets Cost", `<input value="1000000">`)}${f("Rate Type *", `<select><option>EFFECTIVE</option></select>`)}
  ${f("Loan Classification", `<select><option>STANDARD</option></select>`)}${f("End Use Of Loan", `<input value="NEW BUSINESS SETUP">`)}${f("No. of Asset", `<input value="1">`)}${f("LTV Value(%)", `<input value="100.00">`)}
  ${f("Rate Method *", `<select><option>FLOATING</option><option>FIXED</option></select>`)}${f("Base Rate Type *", `<select><option>BR1</option></select>`)}${f("Base Rate", `<input value="0.00">`)}${f("Markup", `<input value="11.00">`)}
  ${f("Payment Method *", `<select><option>NEFT</option></select>`)}${f("Repayment Mode *", `<select><option>ACH</option><option>E-Nach</option><option>Nach</option><option>PDC</option><option>NPDC</option></select>`)}${f("EMI", `<input value="25846" readonly>`)}${f("Installment Type *", `<select><option>EQ. INSTALLMENT</option></select>`)}
  ${f("Installment Mode *", `<select><option>ARREAR</option></select>`)}${f("Due Day *", `<select><option>10</option></select>`)}${f("Next Due Date *", `<input type="date" value="2023-11-10">`)}${f("Repay Effective Date *", `<input type="date" value="2023-10-10">`)}
  ${f("No Of Installment", `<input value="48">`)}${f("Net LTV", `<input value="100.00">`)}${f("Repayment Type", `<select><option>INSTALLMENT</option></select>`)}${f("Interest Compounding Frequency", `<select><option>MONTHLY</option></select>`)}
  ${f("Interest Calculation Method", `<select><option>DUE DATE</option></select>`)}${f("Interest Frequency", `<select><option>MONTHLY</option></select>`)}${f("No. of Adv Installments", `<input value="0">`)}${f("Loan Purpose *", `<select><option>NEW BUSINESS SETUP</option></select>`)}
  </div>${creditFooter()}`
}
function msmeCreditCharges() { return `<div class="step-banner"><b>Step 20 • Charge Details</b><span>Refresh & Save</span></div><div class="table-wrap"><table><thead><tr><th>Charge Type</th><th>Charge Code</th><th>Charge Description</th><th>Business Partner Type</th><th>Business Partner Name</th><th>Tax Inclusive</th><th>Tax Rate1</th><th>Tax Rate2</th><th>Charge Method</th><th>Charge Amount</th><th>Final Amount</th></tr></thead><tbody>${msmeChargeRows()}</tbody></table></div><div class="flow-footer"><div class="left"><button class="primary-btn" onclick="showToast('Charges recalculated');renderMSMEFlow()">Refresh</button><span class="badge gray">Total Charge ₹8,618</span></div><div class="right"><button class="primary-btn" onclick="msme.creditTab++;renderMSMEFlow()">Save & Continue →</button></div></div>` }
function msmeCreditInstallments() { return `<div class="step-banner"><b>Step 21 • Installment Details</b><span>Save installment recovery setup</span></div><div class="dark-panel"><div style="max-width:260px">${f("Recovery Type", `<select><option>Percentage</option><option>Amount</option></select>`)}</div><div style="height:12px"></div><div class="table-wrap"><table><thead><tr><th>From Installment</th><th>To Installment</th><th>Recovery Percent</th><th>Principal Amount</th><th>Installment Amount</th></tr></thead><tbody><tr><td>1</td><td>48</td><td>100</td><td>₹0.00</td><td>₹0.00</td></tr></tbody></table></div></div>${creditFooter()}` }
function msmeCreditRepayment() { return `<div class="step-banner"><b>Step 22 • Repayment Details</b><span>Repayment mode and mandate setup</span></div><div class="source-grid">${f("Repayment Mode *", `<select><option>E-Nach</option><option>Nach</option><option>PDC</option><option>NPDC</option><option>ACH</option></select>`)}${f("Payment Method *", `<select><option>NEFT</option><option>AUTO DEBIT</option></select>`)}${f("Installment Mode *", `<select><option>ARREAR</option></select>`)}${f("Frequency *", `<select><option>MONTHLY</option></select>`)}${f("Due Day *", `<input value="10">`)}${f("First / Next Due Date *", `<input type="date" value="2023-11-10">`)}${f("Mandate Status", `<select><option>Ready</option><option>Pending</option></select>`)}${f("Repayment Remarks", `<textarea rows="2">Mandate to be registered before disbursement</textarea>`)}</div>${creditFooter()}` }
function msmeCreditAsset() { return `<div class="step-banner"><b>Asset / Collateral Details</b><span>Mapped from Sales</span></div><div class="status-board"><div class="status-box"><span>Asset Collateral Type</span><b>ASSET</b></div><div class="status-box"><span>Asset Nature</span><b>NEW</b></div><div class="status-box"><span>Asset Class</span><b>PROPERTY</b></div><div class="status-box"><span>Asset Value</span><b>₹10,00,000</b></div></div><div style="height:12px"></div><div class="table-wrap"><table><thead><tr><th>ID</th><th>Asset Description</th><th>Owner</th><th>Legal</th><th>Technical</th><th>Action</th></tr></thead><tbody><tr><td>94</td><td>PLOT OF LAND</td><td>MANISH PAREEK</td><td><span class="badge amber">To Verify</span></td><td><span class="badge amber">To Verify</span></td><td><button class="pill-btn" onclick="showMSMERecord(this)">Open</button></td></tr></tbody></table></div>${creditFooter()}` }
function msmeCreditBackground() { return `<div class="step-banner"><b>Background Details</b><span>Business / profile assessment workspace</span></div><div class="source-grid">${f("Business Vintage", `<input value="7 Years">`)}${f("Nature of Business", `<select><option>MANUFACTURER</option></select>`)}${f("Industry", `<select><option>MANUFACTURING</option></select>`)}${f("Business Premise", `<select><option>OWNED</option></select>`)}${f("GST Registered", `<select><option>Yes</option></select>`)}${f("Existing Borrowings", `<input value="2">`)}${f("Credit Remarks", `<textarea rows="2">Business profile acceptable</textarea>`)}</div>${creditFooter()}` }
function msmeCreditBank() { return `<div class="step-banner"><b>Step 23 • Bank Details</b><span>Credit-side bank detail confirmation</span></div><div class="table-wrap"><table><thead><tr><th>Id</th><th>Borrower Name</th><th>Borrower Existence</th><th>Bank</th><th>Name of A/c Holder</th><th>Account No</th><th>Current Type</th><th>Action</th></tr></thead><tbody>${msme.banks.map((b, i) => `<tr><td>${b.id}</td><td>${b.borrower}</td><td>${b.existence}</td><td>${b.bank}</td><td>${b.holder}</td><td>${b.account}</td><td>${b.type}</td><td><button class="pill-btn" onclick="showMSMEBank(${i})">Open</button></td></tr>`).join('')}</tbody></table></div><div style="margin-top:10px"><button class="primary-btn" onclick="addMSMEBank()">+ Add Bank</button></div>${creditFooter()}` }
function msmeCreditSpecial() { return `<div class="step-banner"><b>Step 24 • Special Conditions</b><span>Capture sanction / pre-disbursement conditions</span></div><div class="source-grid">${f("Special Category *", `<select id="specialCategory"><option>INTERNAL</option><option>EXTERNAL</option></select>`)}${f("Special Condition *", `<select id="specialCondition"><option>Dual name affidavit of applicant required</option><option>NOC required</option><option>Additional security required</option></select>`)}${f("Remarks *", `<textarea id="specialRemarks" rows="5">ok</textarea>`)}</div><div style="height:10px"><button class="primary-btn" onclick="addCreditSpecialCondition()">+ Add Condition</button></div><div style="height:12px"></div><div class="table-wrap"><table><thead><tr><th>Special Id</th><th>Special Category</th><th>Special Condition</th><th>Remarks</th><th>Action</th></tr></thead><tbody>${msme.specialConditions.map((x, i) => `<tr><td>${x.id}</td><td>${x.category}</td><td>${x.condition}</td><td>${x.remarks}</td><td><button class="pill-btn red" onclick="deleteCreditSpecialCondition(${i})">Delete</button></td></tr>`).join('')}</tbody></table></div>${creditFooter()}` }
function addCreditSpecialCondition() { msme.specialConditions.push({ id: 1881 + msme.specialConditions.length + 1, category: $('#specialCategory').value, condition: $('#specialCondition').value, remarks: $('#specialRemarks').value }); showToast('Special condition added'); renderMSMEFlow() }
function deleteCreditSpecialCondition(i) { msme.specialConditions.splice(i, 1); showToast('Special condition deleted'); renderMSMEFlow() }
function msmeCreditDocs() { return `<div class="step-banner"><b>Documents</b><span>Checklist confirmation in Credit</span></div>${msmeDocuments().replace(msmeFlowFooter(4), '')}${creditFooter()}` }
function msmeCreditUploaded() { return `<div class="step-banner"><b>Uploaded Documents</b><span>Review files received from Sales</span></div><div class="table-wrap"><table><thead><tr><th>Category</th><th>Document Of</th><th>Document Type</th><th>Document Name</th><th>Description</th><th>PD Status</th><th>Uploaded By</th><th>Download</th></tr></thead><tbody>${msme.uploads.map(d => `<tr><td>${d.category}</td><td>${d.documentOf}</td><td>${d.type}</td><td>${d.name}</td><td>${d.description}</td><td><span class="badge green">${d.pdStatus}</span></td><td>SALES_USER</td><td><button class="pill-btn" onclick="downloadMSMEDocument()">⇩</button></td></tr>`).join('')}</tbody></table></div>${creditFooter()}` }
function msmeVerificationInitiation() { return `<div class="step-banner"><b>Step 25 • Verification Initiation</b><span>Initiate the required appraiser activities</span></div><div class="table-wrap"><table><thead><tr><th>Verification Type</th><th>Verification Sub Type</th><th>Entity Type</th><th>Entity Sub Type</th><th>Entity Description</th><th>Action</th><th>Appraiser Type</th><th>Appraiser Name</th><th>Open</th></tr></thead><tbody>${msme.verifications.map((v, i) => `<tr><td><b>${v.type}</b></td><td>${v.sub}</td><td>${v.entity}</td><td>${v.subtype}</td><td>${v.description}</td><td><span class="badge ${v.status === 'Completed' ? 'green' : v.status === 'Initiated' ? 'blue' : 'amber'}">${v.status === 'Pending' ? 'INITIATE' : v.status.toUpperCase()}</span></td><td>INTERNAL</td><td>${v.appraiser}</td><td>${v.status === 'Pending' ? `<button class="pill-btn primary" onclick="initiateVerification(${i})">Initiate</button>` : `<button class="pill-btn" onclick="openVerificationCapture(${i})">Open</button>`}</td></tr>`).join('')}</tbody></table></div>${creditFooter()}` }
function initiateVerification(i) { msme.verifications[i].status = "Initiated"; msme.processStage = Math.max(msme.processStage, 3); showToast("Verification initiated"); renderMSMEFlow() }
function msmeVerificationInitiatedTo() { return `<div class="step-banner"><b>Step 26 • Verification Initiated To</b><span>All initiated verifications appear here and move to Completed</span></div><div class="table-wrap"><table><thead><tr><th>Verification Id</th><th>Stage</th><th>Verification Type</th><th>Verification Sub Type</th><th>Entity Type</th><th>Entity Sub Type</th><th>Entity Description</th><th>Action</th><th>Appraiser Type</th><th>Appraiser Name</th><th>Verification Status</th></tr></thead><tbody>${msme.verifications.map((v, i) => `<tr><td>${202 + i}</td><td>DEAL CAPTURING</td><td>${v.type}</td><td>${v.sub}</td><td>${v.entity}</td><td>${v.subtype}</td><td>${v.description}</td><td>${v.status === 'Pending' ? 'NOT INITIATED' : 'INITIATED'}</td><td>INTERNAL</td><td>${v.appraiser}</td><td><span class="badge ${v.status === 'Completed' ? 'green' : v.status === 'Initiated' ? 'blue' : 'gray'}">${v.status}</span></td></tr>`).join('')}</tbody></table></div><div style="height:10px" class="action-row"><button class="primary-btn" onclick="msme.role='Appraiser';msme.processStage=3;renderMSMEFlow()">Open Appraiser Workbench →</button></div>${creditFooter()}` }
function openVerificationCapture(i) { const v = msme.verifications[i]; showModal(`${v.type} • Capture & Complete`, `<div class="status-board"><div class="status-box"><span>Entity Type</span><b>${v.entity}</b></div><div class="status-box"><span>Entity Description</span><b>${v.description}</b></div><div class="status-box"><span>Verification Type</span><b>${v.type}</b></div><div class="status-box"><span>Sub Type</span><b>${v.sub}</b></div></div><div style="height:12px"></div>${v.type === 'TECHNICAL VERIFICATION' ? technicalVerificationForm() : genericVerificationForm(v)}<div class="form-section"><h4>Attachment</h4><input type="file" accept="image/*,.pdf"></div>`, `<button class="ghost-btn" onclick="downloadMSMEVerificationReport(${i})">Download Report</button><button class="primary-btn" onclick="completeVerification(${i})">Save & Complete</button>`) }
function genericVerificationForm(v) { return `<div class="source-grid">${f("Appraiser Name *", `<input value="${v.appraiser}">`)}${f("Appraisal Date *", `<input type="date" value="2023-09-05">`)}${f("Verification Mode *", `<select><option>Field Visit</option><option>Telephonic</option></select>`)}${f("Person Met *", `<input value="MANISH">`)}${f("Relationship with Applicant *", `<input value="HIMSELF">`)}${f("Mobile Number *", `<input value="9874125366">`)}${f("Phone Number", `<input>`)}${f("E-Mail Id", `<input>`)}${f("CPV / Overall Status *", `<select><option>Positive</option><option>Negative</option></select>`)}${f("Remarks *", `<textarea rows="2">ok</textarea>`)}${f("Verification Completion Remarks", `<textarea rows="2">Completed successfully</textarea>`)}</div>` }
function technicalVerificationForm() { return `<div class="source-grid">${f("Appraiser Name *", `<input value="ADMIN">`)}${f("Appraisal Date *", `<input type="date" value="2023-09-05">`)}${f("Verification Mode *", `<select><option>Field Visit</option></select>`)}${f("Person Met *", `<input value="MANISH">`)}${f("Relationship with Applicant *", `<input value="Himself">`)}${f("Mobile Number *", `<input value="9874856210">`)}${f("Phone Number", `<input>`)}${f("E-Mail Id", `<input value="manish@yahoo.com">`)}${f("Market Value of Property *", `<input value="1000000">`)}${f("Report Type *", `<select><option>Fresh</option></select>`)}${f("Government Value of Property *", `<input value="1000000">`)}${f("Distress Value of Property *", `<input value="1000000">`)}${f("Overall Status *", `<select><option>Positive</option><option>Negative</option></select>`)}${f("Remarks *", `<textarea rows="2">ok</textarea>`)}</div>` }
function completeVerification(i) { msme.verifications[i].status = "Completed"; closeModal(); showToast("Verification completed"); if (msme.role === "Appraiser") renderMSMEFlow(); else renderMSMEFlow() }
function msmeFinancial() {
  return `<div class="step-banner"><b>Step 27 • Financial</b><span>Bank account analysis and financial assessment</span></div><div class="subtabs"><button class="subtab active" onclick="showMSMEFinancialSection('Bank Account Analysis')">BANK ACCOUNT ANALYSIS</button><button class="subtab" onclick="showMSMEFinancialSection('Sales Analysis')">SALES ANALYSIS</button><button class="subtab" onclick="showMSMEFinancialSection('Obligations')">OBLIGATIONS</button><button class="subtab" onclick="showMSMEFinancialSection('Profits Upload')">PROFITS UPLOAD</button></div><div class="form-section"><h4>Bank Account Details</h4><div class="dual-column-form"><div class="col">
  ${f("Customer Type *", `<select><option>APPLICANT</option></select>`)}${f("Account No *", `<input value="2000023">`)}${f("Bank Branch Name *", `<input value="JAIPUR">`)}${f("From Statement Month & Year *", `<input value="Jan / 2023">`)}${f("Total EMI", `<input value="0">`)}${f("Value Of Credit Entries *", `<input value="0.00">`)}${f("Highest Balance", `<input>`)}${f("Cheque Bouncing Amount", `<input>`)}${f("Over Limit Amount", `<input>`)}${f("Over Limit Interest Outstanding %", `<input>`)}${f("Count of Credit Entries *", `<input value="20">`)}${f("Verification Method", `<select><option>ITR</option></select>`)}${f("Inward Cheque Return Count *", `<input value="2">`)}${f("Total Debit Entry", `<input>`)}${f("Total Inward Bouncing *", `<input>`)}${f("Repayment From This Account *", `<select><option>YES</option><option>NO</option></select>`)}${f("Joint Holding", `<select><option>YES</option><option>NO</option></select>`)}${f("Avg. Bank Balance *", `<input value="60000">`)}${f("OW Return", `<input>`)}${f("Collateral Details", `<textarea rows="2"></textarea>`)}</div><div class="col">
  ${f("Customer Name *", `<input value="MANISH PAREEK">`)}${f("Bank Name *", `<select><option>HDFC BANK LTD</option></select>`)}${f("A/C Type *", `<select><option>Saving</option><option>Current</option></select>`)}${f("To Statement Month & Year *", `<input value="Jan / 2023">`)}${f("Value of Debit Entries *", `<input value="0.00">`)}${f("Lowest Balance", `<input>`)}${f("Cheque Bouncing Frequency (in Days)", `<input>`)}${f("Over Limit Frequency (in days)", `<input>`)}${f("Limit Obligation %", `<input value="20">`)}${f("Count of Debit Entries *", `<input value="20">`)}${f("Balance Amount", `<input>`)}${f("Outward Cheque Return Count *", `<input value="2">`)}${f("Total Credit Entry", `<input>`)}${f("Total Outward Bouncing *", `<input>`)}${f("Banking Since", `<input>`)}${f("Primary Account", `<select><option>YES</option><option>NO</option></select>`)}${f("IW Return", `<input>`)}${f("OD/CC Limit Amount", `<input>`)}${f("Remarks *", `<textarea rows="2"></textarea>`)}</div></div></div>${creditFooter()}`
}
function msmeFundflow() { return `<div class="step-banner"><b>Step 28 • Fundflow</b><span>Capture business inflow / outflow and surplus</span></div><div class="source-grid">${f("Monthly Business Inflow *", `<input type="number" value="650000">`)}${f("Other Income", `<input type="number" value="50000">`)}${f("Total Inflow", `<input value="700000" readonly>`)}${f("Purchase / Material Cost *", `<input type="number" value="420000">`)}${f("Operating Expense *", `<input type="number" value="110000">`)}${f("Existing EMI / Debt Service *", `<input type="number" value="35000">`)}${f("Total Outflow", `<input value="565000" readonly>`)}${f("Net Monthly Surplus", `<input value="135000" readonly>`)}${f("Fund Flow Remarks", `<textarea rows="2">Sufficient surplus for proposed obligation</textarea>`)}</div>${creditFooter()}` }
function msmeManualCibil() { return `<div class="step-banner"><b>Step 29 • Manual CIBIL</b><span>Capture bureau data then forward</span></div><div class="dark-panel"><div class="flow-mini-title">Credit Bureau Data</div><div class="table-wrap"><table><thead><tr><th>Consumer</th><th>Date</th><th>Credit Bureau Score</th><th>Total Accounts</th><th>Total Overdue</th><th>Highest Sanction</th><th>Current Balance</th><th>No. of Enquiries</th><th>Decision</th><th>Comment</th></tr></thead><tbody>${msme.bureaus.map(b => `<tr><td>${b.consumer}</td><td>${b.date}</td><td>${b.score}</td><td>${b.totalAccounts}</td><td>${money(b.totalOverdue)}</td><td>${money(b.highestSanction)}</td><td>${money(b.currentBalance)}</td><td>${b.enquiries}</td><td><span class="badge ${b.decision === 'Approved' ? 'green' : 'amber'}">${b.decision}</span></td><td>${b.comment}</td></tr>`).join('')}</tbody></table></div><div style="height:14px" class="flow-mini-title">Deals</div><div class="table-wrap"><table><thead><tr><th>Customer Id</th><th>Borrower Name</th><th>Customer Type</th><th>Customer Role</th><th>Cibil Done</th></tr></thead><tbody>${msme.customers.map((c, i) => `<tr><td>${90 - i}</td><td>${c.name}</td><td>${c.type}</td><td>${c.role}</td><td>${i === 0 ? 'YES' : 'NO'}</td></tr>`).join('')}</tbody></table></div></div>${creditFooter(false)}<div class="flow-footer"><div class="left"><button class="primary-btn" onclick="addMSMEBureau()">+ Add Bureau</button></div><div class="right"><button class="primary-btn" onclick="forwardMSMEUnderwriter()">Forward to Underwriter →</button></div></div>` }
function forwardMSMEUnderwriter() { msme.role = "Underwriter"; msme.processStage = 5; msme.underwriterOpen = false; showToast("Case forwarded to Underwriter"); renderMSMEFlow() }

function renderMSMEAppraiser() {
  return `<div class="process-card"><div class="step-banner"><b>Appraiser Workbench • Capture & Complete</b><span>Sales / Legal / Technical / RCU verification work</span></div><div class="section-bar"><div><h3>Verification Capturing Search</h3><p>Open an initiated verification, capture findings, upload evidence and complete.</p></div><button class="ghost-btn" onclick="renderMSMEFlow();showToast('Worklist refreshed')">↻ Refresh</button></div><div class="verification-grid">${msme.verifications.map((v, i) => `<div class="verification-card"><h4>${v.type}</h4><p>${v.sub}<br>${v.description}</p><div class="row"><span class="badge ${v.status === 'Completed' ? 'green' : v.status === 'Initiated' ? 'blue' : 'gray'}">${v.status}</span><button class="pill-btn ${v.status !== 'Completed' ? 'primary' : ''}" onclick="${v.status === 'Pending' ? `initiateAndOpen(${i})` : `openVerificationCapture(${i})`}">${v.status === 'Completed' ? 'View' : 'Capture'}</button></div></div>`).join('')}</div><div class="flow-footer"><div class="left"><button class="ghost-btn" onclick="msme.role='Credit User';msme.processStage=3;msme.creditAssigned=true;msme.creditTab=13;renderMSMEFlow()">← Back to Credit CAM</button></div><div class="right"><button class="primary-btn" onclick="completeAllVerifications()">Mark All Completed & Return to Credit →</button></div></div></div>`;
}
function initiateAndOpen(i) { msme.verifications[i].status = "Initiated"; openVerificationCapture(i) }
function completeAllVerifications() { msme.verifications.forEach(v => v.status = "Completed"); msme.role = "Credit User"; msme.creditAssigned = true; msme.creditTab = 14; msme.processStage = 4; showToast("All verifications completed"); renderMSMEFlow() }

function saveMSMECurrentForm(message = 'Data saved successfully') { msme.savedFields = msme.savedFields || {}; document.querySelectorAll('.process-card input,.process-card select,.process-card textarea').forEach((el, i) => { const key = el.id || el.name || ('field_' + i); if (el.type !== 'file') msme.savedFields[key] = el.value }); showToast(message) }
function openMSMEReject() { showModal('Reject MSME Case', `<label>Rejection Reason<select id="rejectReason"><option>Policy Deviation</option><option>Insufficient Documents</option><option>Customer Withdrawal</option><option>Credit Decline</option></select></label><label>Remarks<textarea id="rejectRemarks" rows="3"></textarea></label>`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="danger-btn" onclick="msme.rejected=true;closeModal();showToast('Case marked rejected')">Reject Case</button>`) }
function openMSMEQuery() { showModal('Raise Query', `<label>Query To<select><option>Sales User</option><option>Customer</option><option>Appraiser</option></select></label><label>Query<textarea id="msmeQuery" rows="4">Please provide pending supporting document.</textarea></label>`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="msme.query=$('#msmeQuery').value;closeModal();showToast('Query raised and added to case')">Raise Query</button>`) }
function showMSMEPreview() { showModal('MSME Case Preview', `<div class="modal-kv"><div><span>Deal No</span><b>HDLMSMHOF0000075</b></div><div><span>Customer</span><b>MANISH PAREEK</b></div><div><span>Role</span><b>${msme.role}</b></div><div><span>Current Stage</span><b>${msmeProcessStages[msme.processStage]}</b></div><div><span>Customers</span><b>${msme.customers.length}</b></div><div><span>Verifications Completed</span><b>${msme.verifications.filter(v => v.status === 'Completed').length}/${msme.verifications.length}</b></div></div>`, `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="primary-btn" onclick="window.print()">Print Preview</button>`) }
function openMSMEPhotoCapture() { showModal('Applicant Photo Capture', `<div class="camera-box"><div><video id="msmeCamera" autoplay playsinline muted></video><button class="secondary-btn full" style="margin-top:8px" onclick="startMSMECamera()">Start Camera</button></div><canvas id="msmePhotoCanvas"></canvas></div>`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="captureMSMEPhoto()">Capture & Save</button>`) }
async function startMSMECamera() { try { const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); $('#msmeCamera').srcObject = stream } catch (e) { showToast('Camera unavailable; use device upload in production') } }
function captureMSMEPhoto() { const v = $('#msmeCamera'), c = $('#msmePhotoCanvas'); if (v && v.videoWidth) { c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0); msme.photoCaptured = true; closeModal(); showToast('Applicant photo captured') } else showToast('Start camera first') }
function addMSMEDependent() { showModal('Add Dependent', `<div class="source-grid" style="grid-template-columns:1fr 1fr">${f('Name', `<input id="depName">`)}${f('Relation', `<input id="depRelation">`)}${f('Age', `<input id="depAge" type="number">`)}${f('Education', `<input id="depEducation" value="GRADUATE">`)}${f('Occupation', `<input id="depOccupation" value="OTHERS">`)}${f('UID / Aadhaar', `<input id="depUid">`)}</div>`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="saveMSMEDependent()">Add</button>`) }
function saveMSMEDependent() { const d = { name: $('#depName').value || 'DEPENDENT', relation: $('#depRelation').value || 'OTHER', age: Number($('#depAge').value || 0), education: $('#depEducation').value || '', occupation: $('#depOccupation').value || '', uid: $('#depUid').value || '—' }; msme.dependents.push(d); closeModal(); showToast('Dependent added'); renderMSMEFlow() }
function deleteMSMEDependent(i) { msme.dependents.splice(i, 1); showToast('Dependent deleted'); renderMSMEFlow() }
function confirmMSMEDelete(type) { showModal('Confirm Delete', `<p class="muted" style="font-size:10px">Delete selected ${type}? This affects only the demo state.</p>`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="danger-btn" onclick="deleteMSMEGeneric('${type}')">Delete</button>`) }
function deleteMSMEGeneric(type) { if (type === 'IMD') { msme.imdSaved = false; msme.imdDeleted = true } else if (type === 'row') { msme.specialConditions = [] } closeModal(); showToast(`${type} deleted`); renderMSMEFlow() }
function uploadMSMEDocument() { msme.uploads.push({ category: 'Applicant', documentOf: 'MANISH PAREEK', type: 'OTHER DOCUMENT', name: 'UPLOADED FILE', description: 'Added from Upload Document screen', pdStatus: 'OK' }); showToast('Document uploaded'); renderMSMEFlow() }
function addMSMEDocumentRow() { msme.uploads.push({ category: 'Applicant', documentOf: 'MANISH PAREEK', type: 'ADDITIONAL', name: 'PENDING FILE', description: 'Additional document row', pdStatus: 'PENDING' }); showToast('Additional document row added'); renderMSMEFlow() }
function downloadMSMEDocument() { downloadText('msme-document-note.txt', 'Demo document download for Deal HDLMSMHOF0000075') }
function allocateMSMEReceivables() { msme.receivablesAllocated = true; showToast('Receivables allocated to IMD') }
function viewMSMEReceivables() { showModal('Receivables', `<div class="table-wrap"><table><thead><tr><th>Charge</th><th>Amount</th><th>Allocated</th></tr></thead><tbody><tr><td>Processing Fee</td><td>₹5,000</td><td>₹2,000</td></tr><tr><td>Documentation</td><td>₹2,000</td><td>₹0</td></tr><tr><td>Other Receivable</td><td>₹1,618</td><td>₹0</td></tr></tbody></table></div>`, `<button class="primary-btn" onclick="closeModal()">Close</button>`) }
function showMSMERecord() { showModal('Record Details', `<div class="modal-kv"><div><span>Deal</span><b>HDLMSMHOF0000075</b></div><div><span>Customer</span><b>MANISH PAREEK</b></div><div><span>Asset / Bank Status</span><b>Available for review</b></div><div><span>Current Role</span><b>${msme.role}</b></div></div>`, `<button class="primary-btn" onclick="closeModal()">Close</button>`) }
function addMSMEBank() { showModal('Add Bank Detail', `<div class="source-grid" style="grid-template-columns:1fr 1fr">${f('Bank Name', `<input id="newBankName" value="HDFC BANK LTD">`)}${f('Account No', `<input id="newBankNo">`)}${f('A/C Holder', `<input id="newBankHolder" value="MANISH PAREEK">`)}${f('Account Type', `<select id="newBankType"><option>Current</option><option>Saving</option></select>`)}</div>`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="saveMSMEBank()">Add Bank</button>`) }
function saveMSMEBank() { msme.banks.push({ id: 68 + msme.banks.length, borrower: 'MANISH PAREEK', existence: 'No', bank: $('#newBankName').value || 'BANK', holder: $('#newBankHolder').value || 'MANISH PAREEK', account: $('#newBankNo').value || '—', type: $('#newBankType').value }); closeModal(); showToast('Bank detail added'); renderMSMEFlow() }
function showMSMEBank(i) { const b = msme.banks[i]; showModal('Bank Detail', `<div class="modal-kv"><div><span>Bank</span><b>${b.bank}</b></div><div><span>Account</span><b>${b.account}</b></div><div><span>Holder</span><b>${b.holder}</b></div><div><span>Type</span><b>${b.type}</b></div></div>`, `<button class="primary-btn" onclick="closeModal()">Close</button>`) }
function downloadMSMEVerificationReport(i) { const v = msme.verifications[i]; downloadText(`verification-${i + 1}.txt`, `Deal: HDLMSMHOF0000075\nType: ${v.type}\nSub Type: ${v.sub}\nEntity: ${v.description}\nStatus: ${v.status}`) }
function showMSMEFinancialSection(section) { if (section === 'Bank Account Analysis') { showToast('Bank Account Analysis is displayed below'); return } showModal(section, section === 'Sales Analysis' ? `<div class="modal-kv"><div><span>Monthly Sales</span><b>₹6,50,000</b></div><div><span>Annualised</span><b>₹78,00,000</b></div></div>` : section === 'Obligations' ? `<div class="modal-kv"><div><span>Existing EMI</span><b>₹35,000</b></div><div><span>Proposed EMI</span><b>${money(emi(1000000, 11, 48))}</b></div></div>` : `<label>Upload Profit / Financial File<input type="file" accept=".pdf,.xlsx,.xls,image/*"></label>`, `<button class="primary-btn" onclick="closeModal()">Done</button>`) }
function addMSMEBureau() { showModal('Add Manual Bureau', `<div class="source-grid" style="grid-template-columns:1fr 1fr">${f('Consumer', `<input id="bureauConsumer" value="MANISH PAREEK">`)}${f('CIBIL Score', `<input id="bureauScore" type="number" value="704">`)}${f('Total Accounts', `<input id="bureauAccounts" type="number" value="4">`)}${f('Decision', `<select id="bureauDecision"><option>Approved</option><option>Refer</option><option>Decline</option></select>`)}</div>`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="saveMSMEBureau()">Add Bureau</button>`) }
function saveMSMEBureau() { msme.bureaus.push({ consumer: $('#bureauConsumer').value || 'MANISH PAREEK', date: '04-10-2026', score: Number($('#bureauScore').value || 0), totalAccounts: Number($('#bureauAccounts').value || 0), totalOverdue: 0, highestSanction: 0, currentBalance: 0, enquiries: 0, decision: $('#bureauDecision').value, comment: 'Added manually' }); closeModal(); showToast('Manual CIBIL row added'); renderMSMEFlow() }
function showMSMEDealViewer() { showModal('Deal Viewer', `<div class="modal-kv"><div><span>Deal No</span><b>HDLMSMHOF0000075</b></div><div><span>Borrower</span><b>MANISH PAREEK</b></div><div><span>Product</span><b>MSME LOAN</b></div><div><span>Scheme</span><b>MSME AGRI</b></div><div><span>Requested</span><b>₹10,00,000</b></div><div><span>Stage</span><b>${msmeProcessStages[msme.processStage]}</b></div></div>`, `<button class="primary-btn" onclick="closeModal()">Close</button>`) }
function saveMSMEDecision() { msme.decision = $('#uwDecision')?.value || 'Approved'; showToast(`Decision ${msme.decision} saved`) }
function openMSMESpecialCondition() { showModal('Special Conditions', `<label>Condition<select><option>Dual name affidavit of applicant required</option><option>NOC required</option><option>Additional security required</option></select></label><label>Remarks<textarea rows="3">To be complied before disbursement.</textarea></label>`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="msme.specialCondition=true;closeModal();showToast('Special condition saved')">Save Condition</button>`) }
function showMSMEGroupExposure() { showModal('Group Exposure', `<div class="table-wrap"><table><thead><tr><th>Entity</th><th>Existing Exposure</th><th>Proposed</th><th>Total</th></tr></thead><tbody><tr><td>MANISH PAREEK</td><td>₹0</td><td>₹10,00,000</td><td>₹10,00,000</td></tr><tr><td>Pareek Agro Traders</td><td>₹2,00,000</td><td>₹0</td><td>₹2,00,000</td></tr></tbody></table></div>`, `<button class="primary-btn" onclick="closeModal()">Close</button>`) }
function renderMSMEUnderwriter() {
  if (!msme.underwriterOpen) return `<div class="process-card"><div class="step-banner"><b>Step 30 • Underwriter Queue</b><span>Forwarded cases available for loan approval</span></div><div class="section-bar"><div><h3>Loan Approval</h3><p>Open the forwarded MSME case to complete the credit decision.</p></div><button class="ghost-btn" onclick="renderMSMEFlow();showToast('Queue refreshed')">↻ Refresh</button></div><div class="table-wrap"><table><thead><tr><th>Deal No</th><th>Borrower Name</th><th>Application Date</th><th>Application Form No</th><th>Product</th><th>Scheme</th><th>User Name</th><th>Branch</th><th>Current Status</th><th></th></tr></thead><tbody><tr><td><b>HDLMSMHOF0000075</b></td><td>MANISH PAREEK</td><td>07-09-2023</td><td>WEB-MS-NFPL02991-2023</td><td>MSME LOAN</td><td>MSME AGRI</td><td>SALES_USER</td><td>HEAD OFFICE</td><td><span class="badge blue">FORWARDED</span></td><td><button class="primary-btn" onclick="msme.underwriterOpen=true;renderMSMEFlow()">Open Decision</button></td></tr></tbody></table></div></div>`;
  return `<div class="process-card"><div class="section-bar"><div><h3>Credit Decision</h3><p>Underwriter decision and sanction details.</p></div><div class="action-row"><button class="filter-btn" onclick="showDealMovement()">Deal Movement</button><button class="filter-btn" onclick="showMSMEDealViewer()">Deal Viewer</button></div></div>
    ${msme.sanctioned ? `<div class="notice success"><b>DEAL SANCTIONED & APPROVED.</b> The MSME case is now at the sanctioned stage.</div><div style="height:14px"></div>` : ''}
    <div class="decision-grid">
      ${f("Product", `<input value="MSME LOAN" readonly>`)}${f("Scheme", `<input value="MSME AGRI" readonly>`)}${f("Credit Type", `<select><option>TERM LOAN</option></select>`)}${f("Purpose", `<input value="NEW BUSINESS SETUP">`)}
      ${f("Requested Loan Amount", `<input value="1000000" readonly>`)}${f("ROI", `<input value="11">`)}${f("Tenure", `<input value="48">`)}${f("Sanctioned Amount", `<input value="1000000">`)}
      ${f("Sanctioned Till Date (DD-MM-YYYY)", `<input type="date" value="2023-10-07">`)}${f("Frequency", `<select><option>MONTHLY</option></select>`)}${f("Effective Customer ROI (on flat rate basis)", `<input value="6">`)}${f("Effective Customer ROI (Reducing Balance)", `<input value="11">`)}
      ${f("IRR", `<input value="11">`)}${f("Total Deduction Amount", `<input value="8618" readonly>`)}${f("Net Amount", `<input value="991382" readonly>`)}${f("Decision", `<select id="uwDecision"><option>Approved</option><option>Rejected</option><option>Refer</option></select>`)}
    </div><div style="height:12px">${f("Author Remarks", `<textarea rows="3">ok</textarea>`)}</div>
    <div style="height:12px"></div><div class="table-wrap"><table><thead><tr><th>Credit Analyst</th><th>Level</th><th>Decision</th><th>Author Remarks</th><th>Author Date</th><th>Reason</th></tr></thead><tbody><tr><td>SALOON JANGID</td><td>Credit</td><td>Recommended</td><td>Policy compliant</td><td>07-09-2023</td><td>—</td></tr></tbody></table></div>
    <div class="flow-footer"><div class="left"><button class="ghost-btn" onclick="saveMSMEDecision()">Save</button><button class="ghost-btn" onclick="openMSMESpecialCondition()">Special Condition</button><button class="ghost-btn" onclick="showMSMEGroupExposure()">Group Exposure</button></div><div class="right"><button class="primary-btn" onclick="sanctionMSME()">Sanction & Approve →</button></div></div>
  </div>`;
}
function sanctionMSME() { msme.sanctioned = true; msme.processStage = 6; showToast("Deal sanctioned & approved"); renderMSMEFlow() }
function showDealMovement() { showModal("Deal Movement", `<div class="table-wrap"><table><thead><tr><th>Stage</th><th>Deal Received</th><th>Deal Forwarded</th><th>Deal Forwarded User</th><th>Action</th></tr></thead><tbody>${["PRE DEAL CAPTURING", "CAM AUTOMATION", "FINANCIAL ANALYSIS COMPLETION", "FUND FLOW ANALYSIS COMPLETION", "FIELD VERIFICATION INITIATION", "DEAL POLICY CHECK COMPLETION", "UNDERWRITING COMPLETION"].map((s, i) => `<tr><td>${s}</td><td>07-09-2023 11:${20 + i}:00</td><td>07-09-2023 11:${30 + i}:00</td><td>${i < 1 ? 'GOVIND MISHRA' : 'SALOON JANGID'}</td><td><span class="badge ${i < 6 ? 'green' : 'blue'}">${i < 6 ? 'COMPLETED' : 'INITIATED'}</span></td></tr>`).join('')}</tbody></table></div>`, `<button class="primary-btn" onclick="closeModal()">Close</button>`) }



/* =========================
   V6 RBAC + WORKFLOW ENGINE
   ========================= */

const ORG_ROLES = {
  "CEO": { dept: "Executive", level: 100, name: "Jitendra Tanwar", initials: "CE", manager: null },
  "BSO": { dept: "Sales", level: 1, name: "Neha Jain", initials: "BS", manager: "BDM" },
  "BDM": { dept: "Sales", level: 2, name: "Amit Sharma", initials: "BD", manager: "ASM" },
  "ASM": { dept: "Sales", level: 3, name: "Rakesh Meena", initials: "AS", manager: "RSM" },
  "RSM": { dept: "Sales", level: 4, name: "Pooja Rathore", initials: "RS", manager: "ZSM" },
  "ZSM": { dept: "Sales", level: 5, name: "Manish Gupta", initials: "ZS", manager: "CBO" },
  "CBO": { dept: "Sales", level: 6, name: "Arvind Bansal", initials: "CB", manager: "CEO" },
  "BCM": { dept: "Credit", level: 1, name: "Kavita Rao", initials: "BC", manager: "ACM" },
  "ACM": { dept: "Credit", level: 2, name: "Nitin Saini", initials: "AC", manager: "ZCM" },
  "ZCM": { dept: "Credit", level: 3, name: "Deepak Jain", initials: "ZC", manager: "Credit Head" },
  "Credit Head": { dept: "Credit", level: 4, name: "Meera Kapoor", initials: "CH", manager: "CEO" },
  "Technical Verifier": { dept: "Technical", level: 1, name: "Ravi Choudhary", initials: "TV", manager: "Technical Head" },
  "Technical Head": { dept: "Technical", level: 2, name: "Vikas Soni", initials: "TH", manager: "CEO" },
  "Legal Verifier": { dept: "Legal", level: 1, name: "Priya Saxena", initials: "LV", manager: "Legal Head" },
  "Legal Head": { dept: "Legal", level: 2, name: "Ankur Mathur", initials: "LH", manager: "CEO" },
  "Disbursement Officer": { dept: "Branch Operations", level: 1, name: "Mukesh Yadav", initials: "DO", manager: "Central Operations" },
  "Central Operations": { dept: "Central Operations", level: 2, name: "Anjali Verma", initials: "CO", manager: "CEO" },
  "Appraiser": { dept: "Verification", level: 1, name: "Field Appraiser", initials: "AP", manager: "BCM" },
  "Underwriter": { dept: "Credit", level: 1, name: "Credit Underwriter", initials: "UW", manager: "ACM" }
};

const SALES_CHAIN = ["BSO", "BDM", "ASM", "RSM", "ZSM", "CBO"];
const CREDIT_CHAIN = ["BCM", "ACM", "ZCM", "Credit Head"];

const BASE_ACCESS = {
  "CEO": ["dashboard", "crm", "newApplication", "msmeFlow", "applications", "credit", "cam", "documents", "disbursement", "repayments", "reports", "lobby", "hierarchy", "approvals", "technical", "legal", "postSanction", "operations", "sendBack", "dealMovement", "workflowControl", "case"],
  "BSO": ["dashboard", "crm", "newApplication", "msmeFlow", "applications", "documents", "lobby", "sendBack", "case"],
  "BDM": ["dashboard", "crm", "msmeFlow", "applications", "reports", "lobby", "hierarchy", "approvals", "sendBack", "case"],
  "ASM": ["dashboard", "crm", "applications", "reports", "lobby", "hierarchy", "approvals", "sendBack", "case"],
  "RSM": ["dashboard", "crm", "applications", "reports", "lobby", "hierarchy", "approvals", "sendBack", "case"],
  "ZSM": ["dashboard", "crm", "applications", "reports", "lobby", "hierarchy", "approvals", "sendBack", "case"],
  "CBO": ["dashboard", "crm", "applications", "reports", "lobby", "hierarchy", "approvals", "sendBack", "workflowControl", "case"],
  "BCM": ["dashboard", "applications", "credit", "cam", "documents", "lobby", "approvals", "technical", "legal", "sendBack", "reports", "case"],
  "ACM": ["dashboard", "applications", "credit", "cam", "lobby", "hierarchy", "approvals", "technical", "legal", "sendBack", "reports", "case"],
  "ZCM": ["dashboard", "applications", "credit", "cam", "lobby", "hierarchy", "approvals", "technical", "legal", "sendBack", "reports", "case"],
  "Credit Head": ["dashboard", "applications", "credit", "cam", "lobby", "hierarchy", "approvals", "technical", "legal", "postSanction", "sendBack", "reports", "workflowControl", "case"],
  "Technical Verifier": ["dashboard", "applications", "technical", "lobby", "sendBack", "case"],
  "Technical Head": ["dashboard", "applications", "technical", "lobby", "hierarchy", "sendBack", "reports", "case"],
  "Legal Verifier": ["dashboard", "applications", "legal", "lobby", "sendBack", "case"],
  "Legal Head": ["dashboard", "applications", "legal", "lobby", "hierarchy", "sendBack", "reports", "case"],
  "Disbursement Officer": ["dashboard", "applications", "documents", "postSanction", "operations", "lobby", "sendBack", "case"],
  "Central Operations": ["dashboard", "applications", "postSanction", "operations", "disbursement", "dealMovement", "lobby", "sendBack", "reports", "case"],
  "Appraiser": ["dashboard", "applications", "technical", "lobby", "sendBack", "case"],
  "Underwriter": ["dashboard", "applications", "credit", "approvals", "lobby", "sendBack", "case"]
};

let currentUser = { role: "CEO", ...ORG_ROLES["CEO"] };
let accessOverrides = JSON.parse(localStorage.getItem("skf_rbac_overrides") || "{}");
let sendBackTasks = JSON.parse(localStorage.getItem("skf_sendback_tasks") || "[]");
let auditEvents = [];
let approvalEvents = [];

const defaultTeamPath = {
  sales: { BSO: "Neha Jain", BDM: "Amit Sharma", ASM: "Rakesh Meena", RSM: "Pooja Rathore", ZSM: "Manish Gupta", CBO: "Arvind Bansal" },
  credit: { BCM: "Kavita Rao", ACM: "Nitin Saini", ZCM: "Deepak Jain", "Credit Head": "Meera Kapoor" }
};

function ensureWorkflowData() {
  applications.forEach((a, i) => {
    const defaults = {
      stage: a.status,
      sales: { ...defaultTeamPath.sales },
      credit: { ...defaultTeamPath.credit },
      creditBureau: a.score || 0,
      bureauVerified: ["Credit Review", "CAM Allocation", "CAM Sheet", "Sanctioned", "Disbursement", "Active Loan"].includes(a.status),
      creditCrossCheck: ["CAM Allocation", "CAM Sheet", "Sanctioned", "Disbursement", "Active Loan"].includes(a.status),
      technicalStatus: i % 3 === 0 ? "Completed" : (["Sanctioned", "Disbursement", "Active Loan"].includes(a.status) ? "Completed" : "Pending"),
      technicalReport: i % 3 === 0 ? "Collateral physically verified; geo-photo and occupancy matched." : "",
      legalStatus: ["Sanctioned", "Disbursement", "Active Loan"].includes(a.status) ? "Completed" : (i === 2 ? "Completed" : "Pending"),
      legalReport: ["Sanctioned", "Disbursement", "Active Loan"].includes(a.status) ? "Title search clear; ownership and encumbrance acceptable." : "",
      eSignStatus: ["Sanctioned", "Disbursement", "Active Loan"].includes(a.status) ? "Completed" : "Pending",
      doChecklist: ["Disbursement", "Active Loan"].includes(a.status) ? "Completed" : "Pending",
      centralOps: ["Active Loan"].includes(a.status) ? "Disbursed" : "Pending",
      dealId: a.status === "Active Loan" ? `SKF-DEAL-2026-${String(7001 + i).padStart(5, "0")}` : "",
      lmsStatus: a.status === "Active Loan" ? "Created" : "Pending",
      ownerRole: a.status === "Sales/Predeal" ? "BSO" : a.status === "Credit Review" ? "BCM" : (["CAM Allocation", "CAM Sheet"].includes(a.status) ? "BCM" : a.status === "Sanctioned" ? "Disbursement Officer" : a.status === "Disbursement" ? "Central Operations" : "BSO"),
      previousStatus: a.status,
      sendBack: false,
      approval: null,
      deviations: []
    };
    const workflow = a.workflow || {};
    a.workflow = {
      ...defaults,
      ...workflow,
      sales: { ...defaults.sales, ...(workflow.sales || {}) },
      credit: { ...defaults.credit, ...(workflow.credit || {}) },
      deviations: Array.isArray(workflow.deviations) ? workflow.deviations : []
    };
  });
  const sample = applications;
  if (sample[0] && !sample[0].workflow.approval) {
    sample[0].workflow.approval = { department: "Credit", requiredRole: "ACM", reason: "FOIR above standard policy by 3%", type: "Policy Deviation", status: "Pending", raisedBy: "BCM", remarks: "Income evidence verified; seeking deviation approval." };
    sample[0].workflow.deviations.push(sample[0].workflow.approval);
  }
  if (sample[6] && !sample[6].workflow.approval) {
    sample[6].workflow.approval = { department: "Sales", requiredRole: "ASM", reason: "Requested pricing support / sourcing exception", type: "Sales Deviation", status: "Pending", raisedBy: "BDM", remarks: "Strategic dealer case." };
    sample[6].workflow.deviations.push(sample[6].workflow.approval);
  }
}
ensureWorkflowData();

function roleMeta(role = currentUser.role) { return ORG_ROLES[role] || { dept: "Other", level: 0, name: role, initials: "US" } }
function roleCanView(view, role = currentUser.role) {
  const ov = accessOverrides[role]?.[view];
  if (typeof ov === "boolean") return ov;
  return (BASE_ACCESS[role] || ["dashboard"]).includes(view);
}
function canOperateCase(a) {
  if (currentUser.role === "CEO") return false;
  return a?.workflow?.ownerRole === currentUser.role ||
    (currentUser.role === "BCM" && ["Credit Review", "CAM Allocation", "CAM Sheet"].includes(a.status)) ||
    (currentUser.role === "Disbursement Officer" && a.status === "Sanctioned") ||
    (currentUser.role === "Central Operations" && ["Sanctioned", "Disbursement"].includes(a.status));
}
function isSalesManager(role = currentUser.role) { return SALES_CHAIN.includes(role) && role !== "BSO" }
function isCreditManager(role = currentUser.role) { return CREDIT_CHAIN.includes(role) && role !== "BCM" }
function isManager(role = currentUser.role) { return isSalesManager(role) || isCreditManager(role) || ["Technical Head", "Legal Head", "CEO"].includes(role) }
function currentDept() { return roleMeta().dept }
function persistSendBack() { localStorage.setItem("skf_sendback_tasks", JSON.stringify(sendBackTasks)) }
function logAudit(caseId, action, details = "") {
  auditEvents.unshift({ caseId, action, details, by: currentUser.role, user: currentUser.name, at: new Date().toLocaleString() });
}

function applyRoleAccess() {
  $$(".nav-item").forEach(btn => {
    const view = btn.dataset.view;
    btn.classList.toggle("rbac-hidden", !roleCanView(view));
  });
  const visibleWorkflow = ["lobby", "hierarchy", "approvals", "technical", "legal", "postSanction", "operations", "sendBack", "dealMovement", "workflowControl"].some(v => roleCanView(v));
  const d = $('[data-rbac-divider="workflow"]'); if (d) d.classList.toggle("rbac-hidden", !visibleWorkflow);
  const meta = roleMeta();
  currentUser = { role: currentUser.role, ...meta };
  if ($("#sidebarAvatar")) $("#sidebarAvatar").textContent = meta.initials;
  if ($("#profileAvatar")) $("#profileAvatar").textContent = meta.initials;
  if ($("#sidebarUserName")) $("#sidebarUserName").textContent = meta.name;
  if ($("#sidebarUserRole")) $("#sidebarUserRole").textContent = `${currentUser.role} • ${meta.dept}`;
  if ($("#profileName")) $("#profileName").textContent = currentUser.role;
  updateWorkflowBadges();
}
function updateWorkflowBadges() {
  const myTasks = sendBackTasks.filter(t => t.status === "Open" && t.targetRole === currentUser.role).length;
  const approvals = applications.filter(a => a.workflow?.approval?.status === "Pending" && a.workflow.approval.requiredRole === currentUser.role).length;
  const lobby = visibleLobbyCases().length + myTasks;
  if ($("#sendBackBadge")) $("#sendBackBadge").textContent = myTasks;
  if ($("#approvalBadge")) $("#approvalBadge").textContent = approvals;
  if ($("#lobbyBadge")) $("#lobbyBadge").textContent = lobby;
}
function visibleLobbyCases() {
  if (currentUser.role === "CEO") return [];
  if (currentUser.role === "BSO") return applications.filter(a => a.workflow.ownerRole === "BSO" || a.status === "Sales/Predeal");
  if (currentUser.role === "BCM") return applications.filter(a => ["Credit Review", "CAM Allocation", "CAM Sheet"].includes(a.status));
  if (currentUser.role === "Technical Verifier" || currentUser.role === "Appraiser") return applications.filter(a => a.workflow.technicalStatus !== "Completed" && a.status !== "Draft");
  if (currentUser.role === "Legal Verifier") return applications.filter(a => a.workflow.legalStatus !== "Completed" && a.status !== "Draft");
  if (currentUser.role === "Disbursement Officer") return applications.filter(a => a.status === "Sanctioned" && a.workflow.doChecklist !== "Completed");
  if (currentUser.role === "Central Operations") return applications.filter(a => ["Sanctioned", "Disbursement"].includes(a.status) && a.workflow.doChecklist === "Completed");
  if (isManager()) return applications.filter(a => a.workflow?.approval?.requiredRole === currentUser.role && a.workflow.approval.status === "Pending");
  return [];
}

const _navToV5 = navTo;
navTo = function (view, arg) {
  if (!roleCanView(view)) {
    renderAccessDenied(view);
    return;
  }
  $$(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.view === view));
  $("#sidebar")?.classList.remove("open");
  if (view === "lobby") return renderMyLobby();
  if (view === "hierarchy") return renderHierarchyMonitor();
  if (view === "approvals") return renderApprovalCenter();
  if (view === "technical") return renderTechnicalQueue();
  if (view === "legal") return renderLegalQueue();
  if (view === "postSanction") return renderPostSanction();
  if (view === "operations") return renderOperations();
  if (view === "sendBack") return renderSendBackCenter();
  if (view === "dealMovement") return renderDealMovementLMS();
  if (view === "workflowControl") return renderWorkflowControl();
  _navToV5(view, arg);
  applyRoleAccess();
};

const _renderDashboardV5 = renderDashboard;
renderDashboard = function () {
  if (currentUser.role === "CEO") renderCEOPersonalizedDashboard();
  else renderRoleDashboard();
  applyRoleAccess();
};

showProfile = function () {
  const options = Object.keys(ORG_ROLES).map(r => `<option ${r === currentUser.role ? "selected" : ""}>${r}</option>`).join("");
  showModal("Profile & Role", `
    <div class="modal-kv">
      <div><span>Name</span><b>${currentUser.name}</b></div>
      <div><span>Designation</span><b>${currentUser.role}</b></div>
      <div><span>Department</span><b>${currentUser.dept}</b></div>
      <div><span>Reports To</span><b>${roleMeta().manager || "Board"}</b></div>
    </div>
    <div style="height:14px"></div>
    <label>Switch Demo Designation
      <select id="profileRoleV6">${options}</select>
      <small>This changes navigation, rights, lobby and approval actions immediately.</small>
    </label>`,
    `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="primary-btn" onclick="switchDemoRole()">Switch Role</button>`
  );
}
function switchDemoRole() {
  currentUser.role = $("#profileRoleV6").value;
  currentUser = { role: currentUser.role, ...roleMeta(currentUser.role) };
  msme.role = currentUser.role;
  if (window.namdevSession) { const prev = window.namdevSession.read(); window.namdevSession.save(currentUser.role, prev?.email || ""); }
  closeModal();
  applyRoleAccess();
  navTo("dashboard");
  showToast(`Role switched to ${currentUser.role}`);
}

function dashboardAccessLinks() {
  const links = [
    ["crm", "CRM & Leads", "◎"], ["applications", "Applications", "▤"], ["credit", "Credit Queue", "✓"],
    ["technical", "Technical", "⌖"], ["legal", "Legal", "§"], ["postSanction", "Post Sanction", "✎"],
    ["operations", "Operations", "◫"], ["approvals", "Approvals", "✓"], ["sendBack", "Send Back", "↩"],
    ["dealMovement", "Deal / LMS", "⇢"], ["reports", "Reports", "⌁"]
  ].filter(x => roleCanView(x[0]));
  return links.map(x => `<button class="ghost-btn" onclick="navTo('${x[0]}')">${x[2]} ${x[1]}</button>`).join("");
}
function renderRoleDashboard() {
  setPage(`${currentUser.role} Dashboard`, `${currentUser.dept} / Dashboard`);
  const lobby = visibleLobbyCases();
  const sb = sendBackTasks.filter(t => t.status === "Open" && t.targetRole === currentUser.role);
  const approvals = applications.filter(a => a.workflow?.approval?.status === "Pending" && a.workflow.approval.requiredRole === currentUser.role);
  const teamCases = currentUser.dept === "Sales" ? applications : currentUser.dept === "Credit" ? applications.filter(a => a.score > 0) : lobby;
  $("#content").innerHTML = `
    <div class="role-hero">
      <div><div class="role-pill"><span></span>${currentUser.dept.toUpperCase()} WORKSPACE</div><h2>${currentUser.role} • ${currentUser.name}</h2><p>${roleDashboardDescription()}</p></div>
      <div class="action-row">${dashboardAccessLinks()}</div>
    </div>
    <div class="role-kpi-grid">
      ${roleKpi("My Lobby", lobby.length, "Cases/tasks ready for action", "lobby")}
      ${roleKpi("Send Back Tasks", sb.length, "Corrections assigned to me", "sendBack")}
      ${roleKpi("Pending Approvals", approvals.length, "Deviation approvals at my level", "approvals")}
      ${roleKpi("Visible Portfolio", teamCases.length, "Hierarchy scoped records", "applications")}
      ${roleKpi("SLA Watch", Math.min(lobby.length + sb.length, 9), "Items requiring attention", "lobby")}
    </div>
    <div class="role-grid">
      <div class="workflow-card">
        <div class="workflow-title"><div><h3>My Work Queue</h3><p>Operational actions are enabled only for the assigned designation.</p></div><button class="mini-link" onclick="navTo('lobby')">Open Lobby →</button></div>
        ${lobby.length ? applicationsTable(lobby.slice(0, 5), false) : `<div class="empty-state"><h3>No assigned cases</h3><p>Your operational lobby is clear.</p></div>`}
      </div>
      <div class="workflow-card">
        <div class="workflow-title"><div><h3>Workflow Position</h3><p>Reporting hierarchy and rights.</p></div></div>
        ${renderCurrentHierarchy()}
        <div class="role-access-note"><b>Rights model:</b> worker roles can act on assigned cases. Senior hierarchy roles primarily monitor status and action deviations/approvals routed to their designation.</div>
      </div>
    </div>`;
}
function roleDashboardDescription() {
  if (currentUser.role === "BSO") return "Generate leads, complete customer sourcing and move qualified files into LOS. You can edit your own active cases and receive send-back correction tasks.";
  if (isSalesManager()) return "Monitor leads and files under your sales hierarchy. Operational fields remain read-only; deviations routed to your approval level can be approved, rejected or remarked.";
  if (currentUser.role === "BCM") return "Cross-verify customer data, validate bureau findings, initiate technical and legal verification in parallel, and raise policy deviations when required.";
  if (isCreditManager()) return "Monitor credit movement across your hierarchy and decide only on deviations routed to your approval authority.";
  if (currentUser.dept === "Technical") return "Perform real-time collateral / BGV verification, capture evidence and complete the technical report.";
  if (currentUser.dept === "Legal") return "Perform title and document vetting, record observations and generate the legal report.";
  if (currentUser.role === "Disbursement Officer") return "Complete branch operations checklist. Any missing item creates a send-back task and holds the file until correction.";
  if (currentUser.role === "Central Operations") return "Perform final operations validation, disburse approved files, create the unique deal ID and transfer the deal to LMS.";
  return "Role-based lending workspace with scoped visibility and workflow controls.";
}
function roleKpi(label, value, sub, view) { return `<button class="role-kpi" onclick="navTo('${view}')"><span>${label}</span><b>${value}</b><small>${sub}</small></button>` }

function renderCurrentHierarchy() {
  const chain = currentUser.dept === "Sales" ? SALES_CHAIN : currentUser.dept === "Credit" ? CREDIT_CHAIN : [currentUser.role];
  return `<div class="hierarchy-stack">${chain.map((r, i) => `<div class="hierarchy-person" style="${r === currentUser.role ? 'border-color:#FCA5A5;background:#FFF7F7' : ''}"><b>${r}</b><span>${roleMeta(r).name}</span></div>${i < chain.length - 1 ? '<span class="hierarchy-arrow">→</span>' : ''}`).join("")}</div>`;
}

function renderMyLobby() {
  setPage("My Lobby", `${currentUser.role} / Lobby`);
  const cases = visibleLobbyCases();
  const tasks = sendBackTasks.filter(t => t.status === "Open" && t.targetRole === currentUser.role);
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>My Lobby</h2><p>Actionable cases and correction tasks assigned to ${currentUser.role}.</p></div><span class="badge blue">${cases.length + tasks.length} open items</span></div>
    ${tasks.length ? `<div class="workflow-card lobby-section"><h3>Send Back Correction Tasks</h3>${tasks.map(renderSendBackTask).join("")}</div>` : ""}
    <div class="workflow-card lobby-section">
      <div class="workflow-title"><div><h3>Assigned Cases</h3><p>Only actions permitted for your designation are enabled.</p></div></div>
      ${cases.length ? applicationsTable(cases, true) : `<div class="empty-state"><h3>Lobby clear</h3><p>No cases are assigned to this role.</p></div>`}
    </div>`;
  applyRoleAccess();
}
function renderSendBackTask(t) {
  const a = applications.find(x => x.id === t.caseId);
  return `<div class="sendback-card"><div class="top"><div><b>${t.id} • ${t.caseId} • ${a?.customer || ""}</b><p>${t.reason}</p><div class="sendback-meta"><span>From: ${t.fromRole}</span><span>Return To: ${t.returnToRole}</span><span>${t.createdAt}</span></div></div><span class="stage-chip sendback">Correction Required</span></div><div class="action-row" style="margin-top:9px"><button class="ghost-btn" onclick="navTo('case','${t.caseId}')">Open Case</button><button class="primary-btn" onclick="completeSendBackTask('${t.id}')">Complete Correction & Return</button></div></div>`;
}

function renderHierarchyMonitor() {
  setPage("Hierarchy Monitor", "Workflow / Hierarchy");
  if (!(isManager() || currentUser.role === "CEO")) return $("#content").innerHTML = `<div class="empty-state"><h3>Manager visibility only</h3><p>This screen is available to hierarchy managers.</p></div>`;
  const sales = currentUser.dept === "Sales" || currentUser.role === "CEO";
  const credit = currentUser.dept === "Credit" || currentUser.role === "CEO";
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>Hierarchy Monitor</h2><p>Status visibility by reporting hierarchy. Managers can monitor; field editing remains with the operational owner.</p></div></div>
    ${sales ? `<div class="workflow-card"><div class="workflow-title"><div><h3>Sales Hierarchy</h3><p>BSO → BDM → ASM → RSM → ZSM → CBO</p></div></div>${hierarchyTable("Sales")}</div><div style="height:15px"></div>` : ""}
    ${credit ? `<div class="workflow-card"><div class="workflow-title"><div><h3>Credit Hierarchy</h3><p>BCM → ACM → ZCM → Credit Head</p></div></div>${hierarchyTable("Credit")}</div>` : ""}`;
}
function hierarchyTable(dept) {
  const chain = dept === "Sales" ? SALES_CHAIN : CREDIT_CHAIN;
  return `<div class="table-wrap"><table><thead><tr><th>Case</th><th>Customer</th><th>Product</th>${chain.map(r => `<th>${r}</th>`).join("")}<th>Current Status</th><th>Deviation</th><th></th></tr></thead><tbody>
  ${applications.map(a => `<tr><td><b>${a.id}</b></td><td>${a.customer}</td><td>${a.product}</td>${chain.map(r => `<td>${a.workflow[dept.toLowerCase()]?.[r] || roleMeta(r).name}</td>`).join("")}<td><span class="badge ${statusClass(a.status)}">${a.status}</span></td><td>${a.workflow.approval ? `<span class="badge amber">${a.workflow.approval.requiredRole}</span>` : "—"}</td><td><button class="more-btn" onclick="navTo('case','${a.id}')">View</button></td></tr>`).join("")}
  </tbody></table></div>`;
}

function renderApprovalCenter() {
  setPage("Deviation Approvals", "Workflow / Approvals");
  const own = applications.filter(a => a.workflow?.approval?.status === "Pending" && a.workflow.approval.requiredRole === currentUser.role);
  const visible = currentUser.role === "CEO" ? applications.filter(a => a.workflow?.approval) : own;
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>Deviation Approval Center</h2><p>Approval, rejection and remarks are routed hierarchy-wise. Senior roles do not need to edit the operating case.</p></div><span class="badge amber">${own.length} at my level</span></div>
    <div class="workflow-card">
      ${visible.length ? visible.map(a => approvalCard(a, currentUser.role === "CEO" || a.workflow.approval.requiredRole === currentUser.role)).join("") : `<div class="empty-state"><h3>No approvals at your level</h3><p>There are no pending deviations routed to ${currentUser.role}.</p></div>`}
    </div>`;
}
function approvalCard(a, canAct) {
  const d = a.workflow.approval;
  return `<div class="approval-card"><div><h4>${a.id} • ${a.customer} • ${a.product}</h4><span class="deviation-tag">${d.type} • ${d.requiredRole}</span><p><b>Reason:</b> ${d.reason}<br><b>Raised by:</b> ${d.raisedBy} • <b>Status:</b> ${d.status}<br>${d.remarks || ""}</p></div><div class="approval-actions"><button class="ghost-btn" onclick="navTo('case','${a.id}')">View</button>${canAct && d.status === "Pending" ? `<button class="ghost-btn" onclick="remarkApproval('${a.id}')">Remark</button><button class="danger-btn" onclick="decideApproval('${a.id}','Rejected')">Reject</button><button class="primary-btn" onclick="decideApproval('${a.id}','Approved')">Approve</button>` : ""}</div></div>`;
}
function syncActiveApprovalDeviation(a) {
  const approval = a.workflow?.approval;
  if (!approval || !Array.isArray(a.workflow.deviations)) return;
  const target = [...a.workflow.deviations].reverse().find(d =>
    d.type === approval.type &&
    d.requiredRole === approval.requiredRole &&
    d.reason === approval.reason
  );
  if (target) Object.assign(target, approval);
}
function remarkApproval(id) {
  showModal("Approval Remark", `<label>Remark<textarea id="approvalRemarkText" rows="4" placeholder="Enter approval remark..."></textarea></label>`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="saveApprovalRemark('${id}')">Save Remark</button>`);
}
function saveApprovalRemark(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  a.workflow.approval.remarks = $("#approvalRemarkText").value || "Reviewed";
  syncActiveApprovalDeviation(a);
  approvalEvents.unshift({ caseId: id, role: currentUser.role, decision: "Remark", remark: a.workflow.approval.remarks });
  closeModal(); showToast("Remark saved"); renderApprovalCenter();
}
function decideApproval(id, decision) {
  const a = applications.find(x => x.id === id); if (!a?.workflow?.approval) return;
  if (a.workflow.approval.requiredRole !== currentUser.role && currentUser.role !== "CEO") { showToast("Approval is not routed to your designation"); return }
  a.workflow.approval.status = decision;
  syncActiveApprovalDeviation(a);
  approvalEvents.unshift({ caseId: id, role: currentUser.role, decision });
  logAudit(id, `Deviation ${decision}`, a.workflow.approval.reason);
  showToast(`Deviation ${decision.toLowerCase()}`);
  renderApprovalCenter();
}

function renderTechnicalQueue() {
  setPage("Technical Verification", "Workflow / Technical");
  const rows = applications.filter(a => a.status !== "Draft");
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>Technical Verification</h2><p>Parallel collateral verification / BGV with real-time field evidence, geo checks and technical report.</p></div><span class="badge blue">Parallel Workflow</span></div>
    <div class="workflow-card">
      <div class="table-wrap"><table><thead><tr><th>Case</th><th>Customer</th><th>Product</th><th>Collateral</th><th>Technical Status</th><th>Owner</th><th></th></tr></thead><tbody>
      ${rows.map(a => `<tr><td><b>${a.id}</b></td><td>${a.customer}</td><td>${a.product}</td><td>${a.product === "LAP" ? "Property" : a.product === "Two Wheeler" || a.product === "Tractor Loan" ? "Vehicle" : a.product === "Solar Loan" ? "Solar Asset" : "Business / Collateral"}</td><td><span class="stage-chip ${a.workflow.technicalStatus === "Completed" ? "done" : "pending"}">${a.workflow.technicalStatus}${a.workflow.technicalDemoOnly ? " · DEMO ONLY" : ""}</span></td><td>${roleMeta("Technical Verifier").name}</td><td><button class="more-btn" onclick="openTechnicalCase('${a.id}')">${currentUser.role === "Technical Verifier" || currentUser.role === "Appraiser" ? "Work" : "View"}</button></td></tr>`).join("")}
      </tbody></table></div>
    </div>`;
}
function isDemoWorkflowCase(a) {
  return a?.browserLocalOnly === true || a?.pdDemoBypass === true ||
    a?.demoMandatoryBypass === true || a?.serverDraft?.pdDemoBypass === true;
}
function openTechnicalCase(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  const editable = ["Technical Verifier", "Appraiser"].includes(currentUser.role);
  const demoOnly = isDemoWorkflowCase(a);
  showModal(`Technical Verification • ${id}`, `
    ${demoOnly ? '<div class="notice info"><b>SYNTHETIC DEMO ONLY</b> — No physical visit, GPS capture, valuation, neighbour/BGV feedback or photo evidence exists for this case. Do not treat the prefilled fields as verified facts.</div><div style="height:12px"></div>' : ''}
    <div class="verification-grid">
      <div class="verification-card"><span>Customer</span><b>${a.customer}</b></div><div class="verification-card"><span>Product</span><b>${a.product}</b></div><div class="verification-card"><span>Requested Amount</span><b>${money(a.amount)}</b></div>
    </div><div style="height:12px"></div>
    <div class="report-sheet"><h4>Real-time Collateral / BGV</h4><div class="report-grid">
      ${f("Visit Type", `<select id="techVisit" ${editable ? "" : "disabled"}>${demoOnly ? '<option selected>DEMO ONLY — No visit performed</option>' : ''}<option>Physical Visit</option><option>Video Verification</option></select>`)}
      ${f("Geo Location", `<input id="techGeo" ${editable ? "" : "readonly"} value="${demoOnly ? 'DEMO ONLY — no coordinates captured' : '26.9124, 75.7873'}">`)}
      ${f("Occupancy", `<select id="techOcc" ${editable ? "" : "disabled"}>${demoOnly ? '<option selected>DEMO ONLY — Not assessed</option>' : ''}<option>Self Occupied</option><option>Rented</option><option>Vacant</option></select>`)}
      ${f("Collateral Condition", `<select id="techCondition" ${editable ? "" : "disabled"}>${demoOnly ? '<option selected>DEMO ONLY — Not assessed</option>' : ''}<option>Satisfactory</option><option>Average</option><option>Adverse</option></select>`)}
      ${f("Observed Market Value", `<input id="techValue" ${editable ? "" : "readonly"} type="number" value="${demoOnly ? '' : Math.round(a.amount * 1.6)}" ${demoOnly ? 'placeholder="DEMO ONLY — not assessed"' : ''}>`)}
      ${f("Neighbour / BGV Feedback", `<input id="techBgv" ${editable ? "" : "readonly"} value="${demoOnly ? 'DEMO ONLY — no feedback collected' : 'Positive'}">`)}
    </div><label>Field Photos / Evidence<input type="file" multiple accept="image/*" ${editable && !demoOnly ? "" : "disabled"}></label><label>Technical Remarks<textarea id="techRemarks" rows="3" ${editable ? "" : "readonly"}>${a.workflow.technicalReport || (demoOnly ? "SYNTHETIC DEMO ONLY — No real collateral or customer premises verification occurred. All report values are placeholders; no visit, valuation, GPS capture, neighbour/BGV feedback or photo evidence was obtained." : "Collateral and customer premises verified.")}</textarea></label></div>`,
    `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="ghost-btn" onclick="downloadTechnicalReport('${id}')">Download Report</button>${editable ? `<button class="danger-btn" onclick="sendBackCaseModal('${id}','Technical')">Send Back</button><button class="primary-btn" onclick="completeTechnical('${id}')">${demoOnly ? "Record Demo Technical Step" : "Complete Verification"}</button>` : ""}`
  );
}
function completeTechnical(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  const report = $("#techRemarks")?.value || "Technical verification completed";
  const demoOnly = isDemoWorkflowCase(a);
  a.workflow.technicalStatus = "Completed"; a.workflow.technicalDemoOnly = demoOnly; a.workflow.technicalReport = demoOnly && !report.includes("SYNTHETIC DEMO ONLY") ? `SYNTHETIC DEMO ONLY — No real technical verification occurred.\n${report}` : report;
  logAudit(id, `Technical Verification Completed${demoOnly ? " · Synthetic Demo Only" : ""}`, a.workflow.technicalReport); closeModal(); showToast(demoOnly ? "Synthetic demo technical step recorded; no field verification occurred." : "Technical verification completed"); renderTechnicalQueue();
}
function downloadTechnicalReport(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  downloadText(`${id}-technical-report.txt`, `SK FINANCE - TECHNICAL VERIFICATION REPORT\nCase: ${id}\nCustomer: ${a.customer}\nProduct: ${a.product}\nStatus: ${a.workflow.technicalStatus}\nReport: ${a.workflow.technicalReport || "Pending"}`);
}

function renderLegalQueue() {
  setPage("Legal Vetting", "Workflow / Legal");
  const rows = applications.filter(a => a.status !== "Draft");
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>Legal Vetting</h2><p>Parallel legal title/document scrutiny with a generated legal opinion report.</p></div><span class="badge blue">Parallel Workflow</span></div>
    <div class="workflow-card"><div class="table-wrap"><table><thead><tr><th>Case</th><th>Customer</th><th>Product</th><th>Legal Status</th><th>Report</th><th>Owner</th><th></th></tr></thead><tbody>
    ${rows.map(a => `<tr><td><b>${a.id}</b></td><td>${a.customer}</td><td>${a.product}</td><td><span class="stage-chip ${a.workflow.legalStatus === "Completed" ? "done" : "pending"}">${a.workflow.legalStatus}${a.workflow.legalDemoOnly ? " · DEMO ONLY" : ""}</span></td><td>${a.workflow.legalStatus === "Completed" ? (a.workflow.legalDemoOnly ? "Demo-only note" : "Generated") : "Pending"}</td><td>${roleMeta("Legal Verifier").name}</td><td><button class="more-btn" onclick="openLegalCase('${a.id}')">${currentUser.role === "Legal Verifier" ? "Work" : "View"}</button></td></tr>`).join("")}
    </tbody></table></div></div>`;
}
function openLegalCase(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  const editable = currentUser.role === "Legal Verifier";
  const demoOnly = isDemoWorkflowCase(a);
  showModal(`Legal Vetting • ${id}`, `
    ${demoOnly ? '<div class="notice info"><b>SYNTHETIC DEMO ONLY</b> — No title documents, encumbrance or litigation searches, or legal opinion were obtained. Do not treat the prefilled fields as verified facts.</div><div style="height:12px"></div>' : ''}
    <div class="verification-grid"><div class="verification-card"><span>Customer</span><b>${a.customer}</b></div><div class="verification-card"><span>Product</span><b>${a.product}</b></div><div class="verification-card"><span>Status</span><b>${a.workflow.legalStatus}</b></div></div>
    <div style="height:12px"></div><div class="report-sheet"><h4>Legal Scrutiny</h4><div class="report-grid">
      ${f("Ownership / Title", `<select id="legalTitle" ${editable ? "" : "disabled"}>${demoOnly ? '<option selected>DEMO ONLY — Not reviewed</option>' : ''}<option>Clear</option><option>Conditional</option><option>Adverse</option></select>`)}
      ${f("Title Chain", `<select id="legalChain" ${editable ? "" : "disabled"}>${demoOnly ? '<option selected>DEMO ONLY — Not reviewed</option>' : ''}<option>Verified</option><option>Incomplete</option></select>`)}
      ${f("Encumbrance", `<select id="legalEnc" ${editable ? "" : "disabled"}>${demoOnly ? '<option selected>DEMO ONLY — Not searched</option>' : ''}<option>No Adverse Encumbrance</option><option>Charge Exists</option></select>`)}
      ${f("Litigation Search", `<select id="legalLit" ${editable ? "" : "disabled"}>${demoOnly ? '<option selected>DEMO ONLY — Not searched</option>' : ''}<option>No Litigation Found</option><option>Observation</option></select>`)}
      ${f("Search Period", `<input ${editable ? "" : "readonly"} value="${demoOnly ? 'DEMO ONLY — Not searched' : '30 Years'}">`)}
      ${f("Opinion", `<select id="legalOpinion" ${editable ? "" : "disabled"}>${demoOnly ? '<option selected>DEMO ONLY — No opinion</option>' : ''}<option>Positive</option><option>Conditional</option><option>Negative</option></select>`)}
    </div><label>Legal Remarks<textarea id="legalRemarks" rows="4" ${editable ? "" : "readonly"}>${a.workflow.legalReport || (demoOnly ? "SYNTHETIC DEMO ONLY — No real title/document scrutiny, encumbrance or litigation search, or legal opinion occurred. All fields are placeholders and must be replaced with actual review before processing." : "Title documents and ownership to be vetted.")}</textarea></label></div>`,
    `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="ghost-btn" onclick="downloadLegalReport('${id}')">Generate / Download Report</button>${editable ? `<button class="danger-btn" onclick="sendBackCaseModal('${id}','Legal')">Send Back</button><button class="primary-btn" onclick="completeLegal('${id}')">${demoOnly ? "Record Demo Legal Step" : "Complete Vetting"}</button>` : ""}`
  );
}
function completeLegal(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  const report = $("#legalRemarks")?.value || "Legal vetting completed";
  const demoOnly = isDemoWorkflowCase(a);
  a.workflow.legalStatus = "Completed"; a.workflow.legalDemoOnly = demoOnly; a.workflow.legalReport = demoOnly && !report.includes("SYNTHETIC DEMO ONLY") ? `SYNTHETIC DEMO ONLY — No real legal vetting occurred.\n${report}` : report;
  logAudit(id, `Legal Vetting Completed${demoOnly ? " · Synthetic Demo Only" : ""}`, a.workflow.legalReport); closeModal(); showToast(demoOnly ? "Synthetic demo legal step recorded; no legal review occurred." : "Legal vetting completed"); renderLegalQueue();
}
function downloadLegalReport(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  downloadText(`${id}-legal-report.txt`, `SK FINANCE - LEGAL VETTING REPORT\nCase: ${id}\nCustomer: ${a.customer}\nProduct: ${a.product}\nStatus: ${a.workflow.legalStatus}\nLegal Opinion: ${a.workflow.legalReport || "Pending"}`);
}

function renderPostSanction() {
  setPage("Post Sanction", "Workflow / Post Sanction");
  const rows = applications.filter(a => ["Sanctioned", "Disbursement", "Active Loan"].includes(a.status));
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>Post Sanction & eSign</h2><p>Sanction documentation and eSign run in parallel with operations readiness.</p></div></div>
    <div class="workflow-card"><div class="table-wrap"><table><thead><tr><th>Case</th><th>Customer</th><th>Product</th><th>eSign</th><th>Branch Ops</th><th>Central Ops</th><th></th></tr></thead><tbody>
    ${rows.map(a => `<tr><td><b>${a.id}</b>${isDemoWorkflowCase(a) ? '<span class="badge purple" style="margin-left:5px">Demo only</span>' : ''}</td><td>${a.customer}</td><td>${a.product}</td><td><span class="stage-chip ${a.workflow.eSignStatus === "Completed" ? "done" : "pending"}">${a.workflow.eSignStatus}${a.workflow.eSignDemoOnly ? ' · DEMO ONLY' : ''}</span></td><td><span class="stage-chip ${a.workflow.doChecklist === "Completed" ? "done" : "pending"}">${a.workflow.doChecklist}${a.workflow.doChecklistDemoOnly ? ' · DEMO ONLY' : ''}</span></td><td><span class="stage-chip ${a.workflow.centralOps === "Disbursed" ? "done" : "pending"}">${a.workflow.centralOps}${a.workflow.centralOpsDemoOnly ? ' · DEMO ONLY' : ''}</span></td><td><button class="more-btn" onclick="openPostSanction('${a.id}')">Open</button></td></tr>`).join("")}
    </tbody></table></div></div>`;
}
function openPostSanction(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  const canESign = ["Disbursement Officer", "Central Operations"].includes(currentUser.role);
  const demoOnly = isDemoWorkflowCase(a);
  showModal(`Post Sanction • ${id}`, `
    ${demoOnly ? '<div class="notice info"><b>SYNTHETIC DEMO ONLY</b> — eSign documents and customer action are not real. No contract was signed.</div><div style="height:10px"></div>' : ''}
    <div class="workflow-map">
      <div class="workflow-node"><div class="workflow-node-box"><b>Sanction</b><span>Approved credit decision</span></div><div class="workflow-arrow"></div></div>
      <div class="workflow-node"><div class="workflow-node-box"><b>eSign Documents</b><span>${a.workflow.eSignStatus}${a.workflow.eSignDemoOnly ? ' · DEMO ONLY' : ''}</span></div><div class="workflow-arrow"></div></div>
      <div class="workflow-node"><div class="workflow-node-box"><b>Branch Ops</b><span>${a.workflow.doChecklist}</span></div><div class="workflow-arrow"></div></div>
      <div class="workflow-node"><div class="workflow-node-box"><b>Central Ops</b><span>${a.workflow.centralOps}</span></div></div>
    </div>
    <div class="ops-checklist">
      ${["Sanction Letter", "Loan Agreement", "KFS", "eNACH / NACH Mandate", "Repayment Schedule", "Customer Consent"].map((x, i) => `<label class="ops-check"><input type="checkbox" ${a.workflow.eSignStatus === "Completed" ? "checked" : ""} ${canESign ? "" : "disabled"}>${x}</label>`).join("")}
    </div>`,
    `<button class="ghost-btn" onclick="closeModal()">Close</button>${canESign && a.workflow.eSignStatus !== "Completed" ? `<button class="primary-btn" onclick="completeESign('${id}')">${demoOnly ? 'Simulate Demo eSign Completion' : 'Mark eSign Complete'}</button>` : ""}`
  );
}
function completeESign(id) { const a = applications.find(x => x.id === id); if (!a) return; const checks = $$("#modalRoot .ops-checklist input[type=checkbox]"); if (checks.length && !checks.every(check => check.checked)) { showToast("Complete each eSign checklist item before submitting."); return } const demoOnly = isDemoWorkflowCase(a); a.workflow.eSignStatus = "Completed"; a.workflow.eSignDemoOnly = demoOnly; logAudit(id, `eSign Completed${demoOnly ? " · Synthetic Demo Only" : ""}`, demoOnly ? "SYNTHETIC DEMO ONLY — no real signature or customer action occurred." : ""); closeModal(); showToast(demoOnly ? "Synthetic demo eSign recorded; no real signature occurred." : "eSign package completed"); renderPostSanction() }

function renderOperations() {
  setPage("Operations", "Workflow / Operations");
  const rows = applications.filter(a => ["Sanctioned", "Disbursement", "Active Loan"].includes(a.status));
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>Operations Control</h2><p>Branch DO checklist → send back if any item is missing → Central Operations final disbursement.</p></div></div>
    <div class="role-grid equal">
      <div class="workflow-card"><div class="workflow-title"><div><h3>Branch Operations • DO</h3><p>Checklist validation and send-back control.</p></div></div>${opsTable(rows, "DO")}</div>
      <div class="workflow-card"><div class="workflow-title"><div><h3>Central Operations</h3><p>Final validation, disbursement and deal creation.</p></div></div>${opsTable(rows, "Central")}</div>
    </div>`;
}
function opsTable(rows, type) {
  return `<div class="table-wrap"><table><thead><tr><th>Case</th><th>Customer</th><th>Status</th><th>${type === "DO" ? "Checklist" : "Disbursement"}</th><th></th></tr></thead><tbody>${rows.map(a => `<tr><td><b>${a.id}</b>${isDemoWorkflowCase(a) ? '<span class="badge purple" style="margin-left:5px">Demo only</span>' : ''}</td><td>${a.customer}</td><td>${a.status}</td><td><span class="stage-chip ${type === "DO" ? (a.workflow.doChecklist === "Completed" ? "done" : "pending") : (a.workflow.centralOps === "Disbursed" ? "done" : "pending")}">${type === "DO" ? `${a.workflow.doChecklist}${a.workflow.doChecklistDemoOnly ? ' · DEMO ONLY' : ''}` : `${a.workflow.centralOps}${a.workflow.centralOpsDemoOnly ? ' · DEMO ONLY' : ''}`}</span></td><td><button class="more-btn" onclick="${type === "DO" ? `openDOChecklist('${a.id}')` : `openCentralOps('${a.id}')`}">Open</button></td></tr>`).join("")}</tbody></table></div>`;
}
const DO_ITEMS = ["KYC & Identity Verified", "Sanction Conditions Complied", "Technical Report Positive", "Legal Report Positive", "eSign Documents Completed", "Bank Account / IFSC Verified", "Repayment Mandate Ready", "Invoice / Disbursement Proof", "Insurance / Security Docs", "Customer Consent & Final Amount"];
function openDOChecklist(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  const editable = currentUser.role === "Disbursement Officer";
  const demoOnly = isDemoWorkflowCase(a);
  showModal(`DO Checklist • ${id}`, `
    ${demoOnly ? '<div class="notice info"><b>SYNTHETIC DEMO ONLY</b> — Checklist items below are illustrative placeholders. No KYC review, bank verification, mandate, signed document, invoice, insurance or customer confirmation occurred.</div><div style="height:10px"></div>' : ''}
    <div class="notice info">If any checklist item is missing, submitting the checklist automatically creates a send-back task and the case is treated as a Send Back Case.</div><div style="height:10px"></div>
    <div class="ops-checklist">${DO_ITEMS.map((x, i) => `<label class="ops-check"><input class="do-item" type="checkbox" ${a.workflow.doChecklist === "Completed" ? "checked" : ""} ${editable ? "" : "disabled"}>${x}</label>`).join("")}</div>
    <div style="height:10px"></div><label>DO Remarks<textarea id="doRemarks" rows="3" ${editable ? "" : "readonly"}>${a.workflow.doChecklistRemarks || (demoOnly ? 'SYNTHETIC DEMO ONLY — all checklist items are placeholders; no supporting documents or external verifications were reviewed.' : 'Documents and sanction conditions checked.')}</textarea></label>`,
    `<button class="ghost-btn" onclick="closeModal()">Close</button>${editable ? `<button class="danger-btn" onclick="submitDOChecklist('${id}',false,this)">Create Send Back</button><button class="primary-btn" onclick="submitDOChecklist('${id}',true,this)">${demoOnly ? 'Simulate Demo Checklist Completion' : 'Verify & Complete'}</button>` : ""}`
  );
}
function submitDOChecklist(id, forceGood) {
  const a = applications.find(x => x.id === id); if (!a) return;
  const checks = $$(".do-item"); const all = forceGood ? true : checks.every(c => c.checked);
  if (!all || !forceGood) {
    closeModal(); sendBackCaseModal(id, "Branch Operations", true); return;
  }
  const demoOnly = isDemoWorkflowCase(a);
  const remarks = $("#doRemarks")?.value || "Checklist completed";
  a.workflow.doChecklist = "Completed"; a.workflow.doChecklistDemoOnly = demoOnly;
  a.workflow.doChecklistRemarks = demoOnly && !remarks.includes("SYNTHETIC DEMO ONLY") ? `SYNTHETIC DEMO ONLY — no supporting documents or external verifications were reviewed.\n${remarks}` : remarks;
  a.workflow.ownerRole = "Central Operations"; a.status = "Disbursement";
  logAudit(id, `Branch DO Checklist Completed${demoOnly ? " · Synthetic Demo Only" : ""}`, a.workflow.doChecklistRemarks);
  closeModal(); showToast(demoOnly ? "Synthetic demo DO checklist recorded; no documents or external checks were verified." : "DO checklist complete. Case moved to Central Operations."); renderOperations();
}
function openCentralOps(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  const editable = currentUser.role === "Central Operations" && a.workflow.doChecklist === "Completed";
  const demoOnly = isDemoWorkflowCase(a);
  const amount = Number(a.lifecycle?.sanction?.amount) > 0 ? a.lifecycle.sanction.amount : a.amount;
  showModal(`Central Operations • ${id}`, `
    ${demoOnly ? '<div class="notice info"><b>SYNTHETIC DEMO ONLY</b> — This screen does not validate a real bank account or transfer funds.</div><div style="height:10px"></div>' : ''}
    <div class="modal-kv"><div><span>Customer</span><b>${a.customer}</b></div><div><span>Sanction Amount</span><b>${money(amount)}</b></div><div><span>DO Checklist</span><b>${a.workflow.doChecklist}</b></div><div><span>eSign</span><b>${a.workflow.eSignStatus}</b></div><div><span>Technical</span><b>${a.workflow.technicalStatus}</b></div><div><span>Legal</span><b>${a.workflow.legalStatus}</b></div></div>
    <div style="height:12px"></div><div class="notice ${editable ? "success" : "warn"}">${editable ? "All required branch checks completed. Final disbursement is enabled." : "Final disbursement remains locked until branch operations checklist is complete."}</div>`,
    `<button class="ghost-btn" onclick="closeModal()">Close</button>${editable ? `<button class="danger-btn" onclick="sendBackCaseModal('${id}','Central Operations')">Send Back</button><button class="primary-btn" onclick="finalDisburse('${id}')">${demoOnly ? 'Simulate Demo Disbursement →' : 'Final Disburse →'}</button>` : ""}`
  );
}
function finalDisburse(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  if (a.workflow.doChecklist !== "Completed") { showToast("DO checklist incomplete"); return }
  const demoOnly = isDemoWorkflowCase(a);
  a.workflow.centralOps = "Disbursed"; a.status = "Active Loan"; a.stage = 7;
  a.workflow.centralOpsDemoOnly = demoOnly;
  if (!a.workflow.dealId) a.workflow.dealId = `SKF-DEAL-${new Date().getFullYear()}-${String(8000 + applications.indexOf(a) + Math.floor(Math.random() * 500)).padStart(5, "0")}`;
  a.workflow.lmsStatus = "Ready to Push"; a.workflow.ownerRole = "Central Operations";
  logAudit(id, `Final Disbursement Completed${demoOnly ? ' · Synthetic Demo Only' : ''}`, `${demoOnly ? 'SYNTHETIC DEMO ONLY — no funds moved. ' : ''}Deal ${a.workflow.dealId} created`);
  closeModal(); showToast(demoOnly ? `Synthetic demo disbursement recorded. No funds moved. Deal ${a.workflow.dealId}.` : `Disbursed. Deal ${a.workflow.dealId} created.`); renderOperations();
}

function sendBackCaseModal(id, source = "", auto = false) {
  const a = applications.find(x => x.id === id); if (!a) return;
  const targets = ["BSO", "BCM", "Technical Verifier", "Legal Verifier", "Disbursement Officer"];
  showModal(`Send Back Case • ${id}`, `
    <div class="notice warn">A correction task will be created in the target user's lobby. After completion, the case returns automatically to ${currentUser.role}, the sender / last owner.</div><div style="height:10px"></div>
    <label>Send Back To<select id="sbTarget">${targets.map(r => `<option ${source === "Branch Operations" && r === "BSO" ? "selected" : ""}>${r}</option>`).join("")}</select></label>
    <label>Reason<textarea id="sbReason" rows="4">${source === "Branch Operations" ? "Missing / incorrect document or sanction condition. Please correct and resubmit." : source + " verification query - correction required."}</textarea></label>
    <label>Priority<select id="sbPriority"><option>High</option><option>Critical</option><option>Normal</option></select></label>`,
    `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="danger-btn" onclick="createSendBackTask('${id}')">Create Task & Send Back</button>`
  );
}
function createSendBackTask(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  const target = $("#sbTarget").value, reason = $("#sbReason").value || "Correction required", priority = $("#sbPriority").value;
  const t = { id: `SBT-${String(sendBackTasks.length + 1).padStart(4, "0")}`, caseId: id, fromRole: currentUser.role, targetRole: target, returnToRole: currentUser.role, reason, priority, status: "Open", createdAt: new Date().toLocaleString(), previousStatus: a.status };
  sendBackTasks.unshift(t); persistSendBack();
  a.workflow.previousStatus = a.status; a.workflow.sendBack = true; a.workflow.ownerRole = target; a.status = "Send Back";
  logAudit(id, "Case Sent Back", `${currentUser.role} → ${target}: ${reason}`);
  closeModal(); updateWorkflowBadges(); showToast(`Send back task ${t.id} created for ${target}`);
  if (roleCanView("sendBack")) renderSendBackCenter(); else renderRoleDashboard();
}
function completeSendBackTask(taskId) {
  const t = sendBackTasks.find(x => x.id === taskId); if (!t) { showToast("Send back task not found"); return } if (t.status !== "Open") { showToast(`${t.id} correction already ${String(t.status).toLowerCase()}`); return }
  if (t.targetRole !== currentUser.role && currentUser.role !== "CEO") { showToast("Task is not assigned to your role"); return }
  t.status = "Completed"; t.completedAt = new Date().toLocaleString(); t.completedBy = currentUser.role;
  const a = applications.find(x => x.id === t.caseId);
  if (a) { a.workflow.sendBack = false; a.status = t.previousStatus || a.workflow.previousStatus || "Credit Review"; a.workflow.ownerRole = t.returnToRole; logAudit(a.id, "Send Back Correction Completed", `Returned to ${t.returnToRole}`) }
  persistSendBack(); updateWorkflowBadges(); showToast(`Correction completed. Case returned to ${t.returnToRole}.`); renderMyLobby();
}
function renderSendBackCenter() {
  setPage("Send Back Cases", "Workflow / Send Back");
  const visible = currentUser.role === "CEO" ? sendBackTasks : sendBackTasks.filter(t => t.targetRole === currentUser.role || t.fromRole === currentUser.role);
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>Send Back Case Control</h2><p>Reusable correction workflow across Sales, Credit, Technical, Legal and Operations.</p></div><span class="badge amber">${visible.filter(t => t.status === "Open").length} open</span></div>
    <div class="workflow-card">${visible.length ? visible.map(t => renderSendBackTask(t)).join("") : `<div class="empty-state"><h3>No send back cases</h3><p>No correction tasks are visible to this designation.</p></div>`}</div>`;
}

function renderDealMovementLMS() {
  setPage("Deal Movement / LMS", "Workflow / Deal");
  const rows = applications.filter(a => a.workflow.dealId || a.workflow.centralOps === "Disbursed");
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>Deal Movement & LMS Transfer</h2><p>After final disbursement a unique Deal ID is generated, then the loan is pushed into the Loan Management System.</p></div></div>
    ${rows.some(isDemoWorkflowCase) ? '<div class="notice info"><b>SYNTHETIC DEMO ONLY</b> — LMS records are illustrative and do not represent real money movement or a production servicing account.</div>' : ''}
    <div class="workflow-card"><div class="table-wrap"><table><thead><tr><th>Application</th><th>Deal ID</th><th>Customer</th><th>Product</th><th>Disbursement</th><th>LMS Status</th><th></th></tr></thead><tbody>
    ${rows.map(a => `<tr><td><b>${a.id}</b>${isDemoWorkflowCase(a) ? '<span class="badge purple" style="margin-left:5px">Demo only</span>' : ''}</td><td><span class="deal-id">${a.workflow.dealId || "Generating..."}</span></td><td>${a.customer}</td><td>${a.product}</td><td><span class="stage-chip done">${a.workflow.centralOps}${a.workflow.centralOpsDemoOnly ? ' · DEMO ONLY' : ''}</span></td><td><span class="stage-chip ${a.workflow.lmsStatus === "Created" ? "done" : "pending"}">${a.workflow.lmsStatus}${a.workflow.lmsStatusDemoOnly ? ' · DEMO ONLY' : ''}</span></td><td>${currentUser.role === "Central Operations" && a.workflow.lmsStatus !== "Created" ? `<button class="primary-btn" onclick="pushToLMS('${a.id}')">${isDemoWorkflowCase(a) ? 'Simulate Demo LMS Account Creation' : 'Push to LMS'}</button>` : `<button class="more-btn" onclick="navTo('case','${a.id}')">View</button>`}</td></tr>`).join("")}
    </tbody></table></div></div>`;
}
function pushToLMS(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  const demoOnly = isDemoWorkflowCase(a);
  a.workflow.lmsStatus = "Created"; a.workflow.lmsStatusDemoOnly = demoOnly;
  logAudit(id, `LMS Loan Account Created${demoOnly ? ' · Synthetic Demo Only' : ''}`, `${demoOnly ? 'SYNTHETIC DEMO ONLY — not a production servicing account. ' : ''}${a.workflow.dealId}`);
  showToast(demoOnly ? "Synthetic demo LMS handoff recorded. No production loan account was created." : "Deal transferred to LMS and loan account created"); renderDealMovementLMS();
}

function renderWorkflowControl() {
  setPage("Workflow & Access", "Admin / RBAC");
  const canEdit = currentUser.role === "CEO";
  const views = ["crm", "newApplication", "msmeFlow", "applications", "credit", "documents", "reports", "lobby", "hierarchy", "approvals", "technical", "legal", "postSanction", "operations", "sendBack", "dealMovement", "workflowControl"];
  $("#content").innerHTML = `
    <div class="page-head"><div><h2>Role, Designation & Workflow Control</h2><p>Configure module visibility by designation. Approval routing and operational ownership still follow the hierarchy engine.</p></div><span class="badge ${canEdit ? "green" : "gray"}">${canEdit ? "Editable" : "Read Only"}</span></div>
    <div class="role-grid equal">
      <div class="workflow-card"><div class="workflow-title"><div><h3>Sales Hierarchy</h3><p>BSO generates lead; senior levels monitor and approve routed deviations.</p></div></div>${renderChainDefinition(SALES_CHAIN)}</div>
      <div class="workflow-card"><div class="workflow-title"><div><h3>Credit Hierarchy</h3><p>BCM operates; ACM/ZCM/Credit Head monitor and approve hierarchy deviations.</p></div></div>${renderChainDefinition(CREDIT_CHAIN)}</div>
    </div>
    <div style="height:15px"></div>
    <div class="workflow-card">
      <div class="workflow-title"><div><h3>Access Matrix</h3><p>CEO can enable or disable module access for each designation.</p></div>${canEdit ? `<button class="ghost-btn" onclick="resetAccessMatrix()">Reset Defaults</button>` : ""}</div>
      <div class="access-table"><table><thead><tr><th>Role</th><th>Department</th>${views.map(v => `<th>${viewLabel(v)}</th>`).join("")}</tr></thead><tbody>
      ${Object.keys(ORG_ROLES).map(role => `<tr><td><b>${role}</b></td><td>${roleMeta(role).dept}</td>${views.map(v => `<td><button class="access-toggle ${roleCanView(v, role) ? "on" : ""}" ${canEdit ? `onclick="toggleRoleAccess('${role}','${v}')"` : "disabled"}></button></td>`).join("")}</tr>`).join("")}
      </tbody></table></div>
    </div>
    <div style="height:15px"></div>
    <div class="workflow-card"><div class="workflow-title"><div><h3>Routing Rules</h3><p>Operational ownership and approval behavior used in this prototype.</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>Stage</th><th>Working Role</th><th>Supervisory Visibility</th><th>Deviation Authority</th></tr></thead><tbody>
      <tr><td>Lead / Sales</td><td>BSO</td><td>BDM → ASM → RSM → ZSM → CBO</td><td>Routed hierarchy-wise to BDM / ASM / RSM / ZSM / CBO</td></tr>
      <tr><td>Credit & Bureau</td><td>BCM</td><td>ACM → ZCM → Credit Head</td><td>ACM / ZCM / Credit Head</td></tr>
      <tr><td>Technical</td><td>Technical Verifier</td><td>Technical Head</td><td>Queries create send-back task</td></tr>
      <tr><td>Legal</td><td>Legal Verifier</td><td>Legal Head</td><td>Queries create send-back task</td></tr>
      <tr><td>Branch Operations</td><td>Disbursement Officer</td><td>Central Operations</td><td>Missing checklist auto send-back</td></tr>
      <tr><td>Final Disbursement</td><td>Central Operations</td><td>CEO / Reports</td><td>Creates Deal ID and LMS handoff</td></tr>
      </tbody></table></div>
    </div>`;
}
function renderChainDefinition(chain) { return `<div class="hierarchy-stack">${chain.map((r, i) => `<div class="hierarchy-person"><b>${r}</b><span>${roleMeta(r).name}</span></div>${i < chain.length - 1 ? '<span class="hierarchy-arrow">→</span>' : ''}`).join("")}</div>` }
function viewLabel(v) { return ({ newApplication: "LOS", msmeFlow: "MSME", postSanction: "Post Sanction", dealMovement: "Deal/LMS", workflowControl: "Access" }[v] || v.replace(/^\w/, x => x.toUpperCase())) }
function toggleRoleAccess(role, view) {
  accessOverrides[role] = accessOverrides[role] || {};
  accessOverrides[role][view] = !roleCanView(view, role);
  localStorage.setItem("skf_rbac_overrides", JSON.stringify(accessOverrides));
  showToast(`${role} access updated`); renderWorkflowControl(); applyRoleAccess();
}
function resetAccessMatrix() { accessOverrides = {}; localStorage.removeItem("skf_rbac_overrides"); showToast("Default access restored"); renderWorkflowControl(); applyRoleAccess() }

/* ----- CEO KPI Catalog (100 KPIs) + personalization ----- */
const KPI_GROUPS = {
  "CRM & Lead": [
    "Total Leads", "New Leads", "Qualified Leads", "Converted Leads", "CRM to LOS Conversion", "Hot Leads", "Follow-ups Due", "Average Requested Amount", "Lead Aging > 3 Days", "Lost / Dropped Leads"
  ],
  "Sales": [
    "LOS Applications", "Sales Pipeline Value", "Average Ticket Size", "BSO Productivity", "Dealer / DSA Contribution", "Digital Lead Contribution", "Branch Walk-in Contribution", "Sales TAT", "Sales Send Back Rate", "Sales Deviation Rate"
  ],
  "Credit": [
    "Credit Pending Cases", "Average Bureau Score", "Credit Approved Cases", "Credit Approval Ratio", "Credit Rejection Ratio", "Credit TAT", "Bureau Verification Pending", "Credit Send Back Rate", "Policy Deviation Pending", "High FOIR Cases"
  ],
  "Technical": [
    "Technical Pending", "Technical Completed", "Technical Positive Rate", "Technical Adverse Rate", "Technical TAT", "Physical Visits Today", "Geo Verification Success", "Collateral Value Coverage", "Technical Send Back", "Technical SLA Breaches"
  ],
  "Legal": [
    "Legal Pending", "Legal Completed", "Positive Legal Opinion", "Conditional Legal Opinion", "Adverse Legal Opinion", "Legal TAT", "Title Chain Pending", "Encumbrance Observations", "Legal Send Back", "Legal SLA Breaches"
  ],
  "Post Sanction": [
    "Sanctioned Cases", "Sanctioned Value", "eSign Pending", "eSign Completed", "KFS Pending", "Mandate Pending", "Sanction Conditions Pending", "Post Sanction TAT", "Post Sanction Send Back", "Ready for Branch Ops"
  ],
  "Operations": [
    "DO Pending Cases", "DO Checklist Completed", "DO Send Back Cases", "Branch Ops TAT", "Missing Document Cases", "Central Ops Pending", "Central Ops Ready", "Ops SLA Breaches", "Final Check Success", "Operations Productivity"
  ],
  "Disbursement": [
    "Disbursement Ready", "Disbursed Cases", "Disbursed Value", "Disbursement Conversion", "Average Disbursement Ticket", "Same Day Disbursement", "Disbursement TAT", "Payout Hold Cases", "Payout Failure Cases", "Daily Disbursement Run Rate"
  ],
  "Deal & LMS": [
    "Deals Created", "Deals Pending LMS", "LMS Accounts Created", "LMS Transfer Success", "LMS Transfer Failure", "Average Deal Creation TAT", "Active Loans", "Repayment Modes eNACH", "Repayment Modes NACH", "Repayment Modes PDC / NPDC"
  ],
  "Risk & Quality": [
    "Document Readiness", "Cases Below 80% Docs", "High Bureau Score Cases", "Low Bureau Score Cases", "Open Send Back Tasks", "Open Deviations", "Approval Queue", "Overall SLA Breaches", "Portfolio at Risk Flag", "Process Compliance Score"
  ]
};
const CEO_KPI_CATALOG = Object.entries(KPI_GROUPS).flatMap(([category, items]) => items.map((label, i) => ({ key: category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + (i + 1), category, label })));

let ceoPrefs = JSON.parse(localStorage.getItem("skf_ceo_dashboard_prefs") || "null") || {
  product: "All",
  kpis: ["crm-lead-1", "crm-lead-5", "sales-2", "sales-3", "credit-2", "credit-4", "technical-3", "legal-3", "post-sanction-2", "operations-3", "disbursement-3", "risk-quality-10"],
  charts: ["productMix", "stageFunnel", "branch", "departmentHealth"]
};

function ceoScope() {
  return ceoPrefs.product === "All" ? applications : applications.filter(a => a.product === ceoPrefs.product);
}
function ceoKpiValue(item) {
  const apps = ceoScope(), leads = crm.leads.filter(l => ceoPrefs.product === "All" || l.product === ceoPrefs.product);
  const openSB = sendBackTasks.filter(t => t.status === "Open").length;
  const pendingApproval = apps.filter(a => a.workflow.approval?.status === "Pending").length;
  const completedTech = apps.filter(a => a.workflow.technicalStatus === "Completed").length;
  const completedLegal = apps.filter(a => a.workflow.legalStatus === "Completed").length;
  const sanctioned = apps.filter(a => ["Sanctioned", "Disbursement", "Active Loan"].includes(a.status));
  const disb = apps.filter(a => a.workflow.centralOps === "Disbursed" || a.status === "Active Loan");
  const avg = (arr, fn) => arr.length ? arr.reduce((s, x) => s + fn(x), 0) / arr.length : 0;
  const pct = (n, d) => d ? Math.round(n / d * 100) : 0;
  const n = item.label;
  const numberMap = {
    "Total Leads": leads.length, "New Leads": leads.filter(l => !l.converted).length, "Qualified Leads": leads.filter(l => ["Qualified", "Opportunity", "Converted"].includes(l.status)).length,
    "Converted Leads": leads.filter(l => l.converted).length, "Hot Leads": leads.filter(l => l.temperature === "Hot").length, "Follow-ups Due": leads.filter(l => String(l.next).includes("Today")).length,
    "Lead Aging > 3 Days": Math.max(0, leads.length - 2), "Lost / Dropped Leads": 1, "LOS Applications": apps.length, "BSO Productivity": Math.max(1, Math.round(apps.length / 2)),
    "Credit Pending Cases": apps.filter(a => a.status === "Credit Review").length, "Credit Approved Cases": sanctioned.length, "Bureau Verification Pending": apps.filter(a => !a.workflow.bureauVerified).length,
    "Policy Deviation Pending": pendingApproval, "High FOIR Cases": pendingApproval, "Technical Pending": apps.filter(a => a.workflow.technicalStatus !== "Completed").length, "Technical Completed": completedTech,
    "Physical Visits Today": Math.min(completedTech, 3), "Technical Send Back": sendBackTasks.filter(t => t.fromRole === "Technical Verifier").length, "Technical SLA Breaches": Math.max(0, apps.filter(a => a.workflow.technicalStatus !== "Completed").length - 1),
    "Legal Pending": apps.filter(a => a.workflow.legalStatus !== "Completed").length, "Legal Completed": completedLegal, "Title Chain Pending": apps.filter(a => a.workflow.legalStatus !== "Completed").length,
    "Encumbrance Observations": 1, "Legal Send Back": sendBackTasks.filter(t => t.fromRole === "Legal Verifier").length, "Legal SLA Breaches": Math.max(0, apps.filter(a => a.workflow.legalStatus !== "Completed").length - 1),
    "Sanctioned Cases": sanctioned.length, "eSign Pending": sanctioned.filter(a => a.workflow.eSignStatus !== "Completed").length, "eSign Completed": sanctioned.filter(a => a.workflow.eSignStatus === "Completed").length,
    "KFS Pending": sanctioned.filter(a => a.workflow.eSignStatus !== "Completed").length, "Mandate Pending": sanctioned.filter(a => a.repayment === "—").length, "Sanction Conditions Pending": Math.min(2, sanctioned.length),
    "Post Sanction Send Back": sendBackTasks.filter(t => t.fromRole === "Disbursement Officer").length, "Ready for Branch Ops": sanctioned.filter(a => a.workflow.eSignStatus === "Completed").length,
    "DO Pending Cases": sanctioned.filter(a => a.workflow.doChecklist !== "Completed").length, "DO Checklist Completed": sanctioned.filter(a => a.workflow.doChecklist === "Completed").length, "DO Send Back Cases": sendBackTasks.filter(t => t.fromRole === "Disbursement Officer").length,
    "Missing Document Cases": apps.filter(a => a.docs < 100).length, "Central Ops Pending": sanctioned.filter(a => a.workflow.doChecklist === "Completed" && a.workflow.centralOps !== "Disbursed").length,
    "Central Ops Ready": sanctioned.filter(a => a.workflow.doChecklist === "Completed").length, "Ops SLA Breaches": Math.max(0, openSB - 1), "Final Check Success": sanctioned.filter(a => a.workflow.doChecklist === "Completed").length,
    "Operations Productivity": Math.max(1, sanctioned.length), "Disbursement Ready": apps.filter(a => ["Sanctioned", "Disbursement"].includes(a.status)).length, "Disbursed Cases": disb.length,
    "Same Day Disbursement": Math.min(disb.length, 2), "Payout Hold Cases": apps.filter(a => a.status === "Sanctioned" && a.workflow.doChecklist !== "Completed").length, "Payout Failure Cases": 0,
    "Deals Created": apps.filter(a => a.workflow.dealId).length, "Deals Pending LMS": apps.filter(a => a.workflow.dealId && a.workflow.lmsStatus !== "Created").length, "LMS Accounts Created": apps.filter(a => a.workflow.lmsStatus === "Created").length,
    "LMS Transfer Failure": 0, "Active Loans": apps.filter(a => a.status === "Active Loan").length, "Repayment Modes eNACH": apps.filter(a => a.repayment === "E-Nach").length, "Repayment Modes NACH": apps.filter(a => a.repayment === "Nach").length,
    "Repayment Modes PDC / NPDC": apps.filter(a => ["PDC", "NPDC"].includes(a.repayment)).length, "Cases Below 80% Docs": apps.filter(a => a.docs < 80).length, "High Bureau Score Cases": apps.filter(a => a.score >= 750).length,
    "Low Bureau Score Cases": apps.filter(a => a.score > 0 && a.score < 700).length, "Open Send Back Tasks": openSB, "Open Deviations": pendingApproval, "Approval Queue": pendingApproval, "Overall SLA Breaches": Math.max(0, openSB + pendingApproval - 1),
    "Portfolio at Risk Flag": apps.filter(a => a.score > 0 && a.score < 700).length
  };
  if (n in numberMap) return { value: numberMap[n], type: "number" };
  const moneyMap = {
    "Average Requested Amount": avg(leads, l => l.amount), "Sales Pipeline Value": apps.reduce((s, a) => s + a.amount, 0), "Average Ticket Size": avg(apps, a => a.amount),
    "Collateral Value Coverage": avg(apps, a => a.amount * 1.55), "Sanctioned Value": sanctioned.reduce((s, a) => s + a.amount, 0), "Disbursed Value": disb.reduce((s, a) => s + a.amount, 0),
    "Average Disbursement Ticket": avg(disb, a => a.amount), "Daily Disbursement Run Rate": disb.reduce((s, a) => s + a.amount, 0) / 5
  };
  if (n in moneyMap) return { value: moneyMap[n], type: "money" };
  const pctMap = {
    "CRM to LOS Conversion": pct(leads.filter(l => l.converted).length, leads.length), "Dealer / DSA Contribution": 42, "Digital Lead Contribution": 28, "Branch Walk-in Contribution": 30,
    "Sales Send Back Rate": pct(sendBackTasks.filter(t => SALES_CHAIN.includes(t.targetRole)).length, Math.max(1, apps.length)), "Sales Deviation Rate": pct(apps.filter(a => a.workflow.approval?.department === "Sales").length, Math.max(1, apps.length)),
    "Credit Approval Ratio": pct(sanctioned.length, apps.length), "Credit Rejection Ratio": Math.max(0, 100 - pct(sanctioned.length, apps.length) - 15), "Credit Send Back Rate": pct(sendBackTasks.filter(t => CREDIT_CHAIN.includes(t.targetRole)).length, Math.max(1, apps.length)),
    "Technical Positive Rate": pct(completedTech, apps.length), "Technical Adverse Rate": Math.max(0, 8 - completedTech), "Geo Verification Success": 96,
    "Positive Legal Opinion": pct(completedLegal, apps.length), "Conditional Legal Opinion": 12, "Adverse Legal Opinion": 3,
    "Disbursement Conversion": pct(disb.length, apps.length), "LMS Transfer Success": pct(apps.filter(a => a.workflow.lmsStatus === "Created").length, Math.max(1, apps.filter(a => a.workflow.dealId).length)),
    "Document Readiness": Math.round(avg(apps, a => a.docs)), "Process Compliance Score": 94
  };
  if (n in pctMap) return { value: pctMap[n], type: "pct" };
  const days = ["Sales TAT", "Credit TAT", "Technical TAT", "Legal TAT", "Post Sanction TAT", "Branch Ops TAT", "Disbursement TAT", "Average Deal Creation TAT"];
  if (days.includes(n)) return { value: (1.2 + (item.key.length % 7) * 0.35).toFixed(1) + " d", type: "text" };
  return { value: Math.max(0, (item.key.length * 7 + apps.length * 3) % 97), type: n.includes("Rate") || n.includes("Success") || n.includes("Score") ? "pct" : "number" };
}
function formatKpi(v) { if (v.type === "money") return money(v.value); if (v.type === "pct") return `${v.value}%`; return String(v.value) }
function openCEOPersonalizer() {
  const selected = new Set(ceoPrefs.kpis);
  showModal("Personalize CEO Dashboard", `
    <div class="source-grid" style="grid-template-columns:1fr 1fr">
      ${f("Default Product View", `<select id="ceoPrefProduct"><option ${ceoPrefs.product === "All" ? "selected" : ""}>All</option>${Object.keys(products).map(p => `<option ${ceoPrefs.product === p ? "selected" : ""}>${p}</option>`).join("")}</select>`)}
      ${f("KPI Search", `<input id="kpiSearchBox" placeholder="Search 100 KPIs..." oninput="filterKpiLibrary()">`)}
    </div>
    <div class="role-access-note">100 KPI library. Select the cards you want on the CEO landing page. Drag selected KPI cards on the dashboard to reorder them.</div>
    <div style="height:10px"></div>
    <div id="kpiLibrary" class="kpi-library">${CEO_KPI_CATALOG.map(k => `<label class="kpi-option" data-kpi-text="${(k.label + " " + k.category).toLowerCase()}"><input type="checkbox" class="ceo-kpi-check" value="${k.key}" ${selected.has(k.key) ? "checked" : ""}><div><b>${k.label}</b><span>${k.category}</span></div></label>`).join("")}</div>
    <div style="height:12px"></div><div class="flow-mini-title">Charts / Widgets</div>
    <div class="ops-checklist">${[["productMix", "Product Mix"], ["stageFunnel", "Journey Funnel"], ["branch", "Branch Performance"], ["departmentHealth", "Department Health"], ["riskWatch", "Risk & Exceptions"], ["disbursement", "Disbursement Trend"]].map(([k, l]) => `<label class="ops-check"><input type="checkbox" class="ceo-chart-check" value="${k}" ${ceoPrefs.charts.includes(k) ? "checked" : ""}>${l}</label>`).join("")}</div>`,
    `<button class="ghost-btn" onclick="selectRecommendedCEO()">Recommended</button><button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="saveCEOPersonalization()">Save Dashboard</button>`
  );
}
function filterKpiLibrary() { const q = $("#kpiSearchBox").value.toLowerCase(); $$(".kpi-option").forEach(x => x.classList.toggle("hidden", !x.dataset.kpiText.includes(q))) }
function selectRecommendedCEO() {
  const rec = ["crm-lead-1", "crm-lead-5", "sales-2", "sales-3", "credit-2", "credit-4", "technical-3", "legal-3", "post-sanction-2", "operations-3", "disbursement-3", "risk-quality-10"];
  $$(".ceo-kpi-check").forEach(c => c.checked = rec.includes(c.value)); showToast("Recommended KPI set selected");
}
function saveCEOPersonalization() {
  const kpis = $$(".ceo-kpi-check").filter(c => c.checked).map(c => c.value).slice(0, 24);
  const charts = $$(".ceo-chart-check").filter(c => c.checked).map(c => c.value);
  ceoPrefs = { product: $("#ceoPrefProduct").value, kpis: kpis.length ? kpis : ceoPrefs.kpis, charts };
  localStorage.setItem("skf_ceo_dashboard_prefs", JSON.stringify(ceoPrefs)); closeModal(); showToast("CEO dashboard personalized"); renderCEOPersonalizedDashboard();
}
let dragKpiKey = null;
function startKpiDrag(key) { dragKpiKey = key }
function dropKpiBefore(key) {
  if (!dragKpiKey || dragKpiKey === key) return;
  const arr = [...ceoPrefs.kpis]; const from = arr.indexOf(dragKpiKey), to = arr.indexOf(key); if (from < 0 || to < 0) return;
  arr.splice(from, 1); arr.splice(to, 0, dragKpiKey); ceoPrefs.kpis = arr; localStorage.setItem("skf_ceo_dashboard_prefs", JSON.stringify(ceoPrefs)); renderCEOPersonalizedDashboard();
}
function renderCEOPersonalizedDashboard() {
  setPage("CEO Dashboard", "Executive / Personalized Dashboard");

  window.nfCeoPeriod = window.nfCeoPeriod || "MTD";
  window.nfCeoBranch = window.nfCeoBranch || "All";
  const allApps = ceoScope();
  const branches = [...new Set(applications.map(a => a.branch))].filter(Boolean);
  const apps = window.nfCeoBranch === "All" ? allApps : allApps.filter(a => a.branch === window.nfCeoBranch);
  const leads = crm.leads.filter(l => (ceoPrefs.product === "All" || l.product === ceoPrefs.product));
  const selected = ceoPrefs.kpis.map(k => CEO_KPI_CATALOG.find(x => x.key === k)).filter(Boolean);

  const share = { "All": 1, "Two Wheeler": .22, "MSME": .29, "LAP": .25, "Solar Loan": .10, "Tractor Loan": .14 }[ceoPrefs.product] || 1;
  const branchShare = window.nfCeoBranch === "All" ? 1 : .14;
  const periodFactor = { Today: .055, MTD: 1, QTD: 2.72, YTD: 8.65 }[window.nfCeoPeriod] || 1;
  const selectedPeriod = window.nfCeoPeriod;

  const demo = {
    aum: 1248 * share * branchShare,
    disb: 186 * share * branchShare * periodFactor,
    customers: Math.round(52318 * share * branchShare),
    approval: Math.max(61, 78.3 - (ceoPrefs.product === "Solar Loan" ? 2.1 : 0)),
    par: Math.max(.9, 2.6 + (ceoPrefs.product === "LAP" ? .4 : 0)),
    collection: 96.4,
    npa: 1.8,
    conversion: 12.6,
    tat: 3.8,
    sanction: 214 * share * branchShare * periodFactor,
    branches: window.nfCeoBranch === "All" ? "68 / 72" : "1 / 1",
    deviations: Math.max(1, Math.round(127 * share * branchShare)),
    login: 8214, credit: 4892, sanctioned: 2914, disbursed: 1618
  };

  const periodMonths = selectedPeriod === "Today" ? ["08", "10", "12", "14", "16", "18", "20"] : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const disbSeries = (selectedPeriod === "Today" ? [3, 4, 5, 5, 6, 8, 9] : [72, 85, 96, 110, 118, 132, 148, 162, 174, 186]).map(v => Math.max(1, Math.round(v * share * branchShare)));
  const targetSeries = disbSeries.map((v, i) => Math.round(v * (1.08 + (i % 2) * .03)));
  const chartMax = Math.max(...targetSeries, 1) * 1.08;
  const chartW = 620, chartH = 190, left = 24, top = 18, plotW = 572, plotH = 132;
  const point = (v, i, a) => `${(left + (a.length === 1 ? 0 : i * (plotW / (a.length - 1)))).toFixed(1)},${(top + plotH - (v / chartMax) * plotH).toFixed(1)}`;
  const disbPts = disbSeries.map((v, i) => point(v, i, disbSeries)).join(" ");
  const targetPts = targetSeries.map((v, i) => point(v, i, targetSeries)).join(" ");
  const areaPath = `M ${left},${top + plotH} L ${disbSeries.map((v, i) => point(v, i, disbSeries)).join(" L ")} L ${left + plotW},${top + plotH} Z`;

  const productRows = [
    ["Two Wheeler", 22, 48, "assets/two-wheeler.png", "#EB5B65", "Ride Your Dreams"],
    ["MSME", 29, 62, "assets/msme.png", "#2E7DD3", "Powering Businesses"],
    ["LAP", 25, 54, "assets/lap.png", "#D9A441", "Unlock Property Value"],
    ["Solar Loan", 10, 22, "assets/solar.png", "#2FA67A", "Finance Greener Growth"],
    ["Tractor Loan", 14, 30, "assets/tractor.png", "#B4642D", "Harvesting Growth"]
  ];
  const funnel = [["Leads", 12442, 100, "crm"], ["Login", 8214, 66, "applications"], ["Credit", 4892, 38, "credit"], ["Sanction", 2914, 23, "sanction"], ["Disbursed", 1618, 13, "disbursement"]];
  const branchRows = [["Jaipur - VKI", 28.4, 25, 114], ["Jaipur - Sanganer", 24.1, 22, 110], ["Udaipur", 18.6, 18, 103], ["Kota", 16.8, 15, 112], ["Jodhpur", 14.9, 12, 124]];
  const departmentHealth = [["Sales / CRM", 92, "crm"], ["Credit", 88, "credit"], ["Technical", 81, "technical"], ["Legal", 84, "legal"], ["Operations", 90, "operations"], ["Collections", 96, "repayments"]];
  const riskRows = [["Standard", 94.2, "#2FA67A"], ["DPD 1–30", 3.1, "#3D8FE3"], ["DPD 31–60", 1.2, "#E6B74E"], ["DPD 61–90", 0.8, "#E38942"], ["NPA > 90", 0.7, "#E25262"]];
  const alerts = [
    ["High Risk Cases", 18, "Require executive review", "Critical", "credit"],
    ["Send-back Cases", sendBackTasks.filter(t => t.status === "Open").length || 32, "Pending owner re-submission", "Watch", "sendBack"],
    ["Pending Approvals", applications.filter(a => a.workflow?.approval?.status === "Pending").length || 27, "SLA ageing > 3 days", "Watch", "approvals"],
    ["Legal Exceptions", 8, "Title / documentation exceptions", "Critical", "legal"],
    ["Technical Deviations", 14, "Valuation / collateral gap", "Watch", "technical"]
  ];
  const tasks = [["Loan applications for approval", 12, "approvals"], ["Deviation approvals", 6, "approvals"], ["Legal document review", 4, "legal"], ["Disbursement release", 3, "disbursement"], ["Policy exception review", 2, "creditEngine"], ["Customer escalations", 1, "crm"]];

  const score = Math.round((demo.approval + demo.collection + (100 - demo.par * 5) + (100 - demo.npa * 8)) / 4);
  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });

  $("#content").innerHTML = `
  <div class="nf-ceo-dashboard nf-ceo-v2">
    <div class="nf-exec-topbar">
      <div class="nf-exec-heading">
        <span class="nf-kicker">NAMDEV FINVEST LTD. · EXECUTIVE COMMAND CENTER</span>
        <h2>Good Morning, Sir <span>— here is your business pulse.</span></h2>
        <p>${dateLabel} · Enterprise lending, risk, collections and operational intelligence.</p>
      </div>
      <div class="nf-exec-controls">
        <div class="nf-segmented">${["Today", "MTD", "QTD", "YTD"].map(p => `<button class="${selectedPeriod === p ? "active" : ""}" onclick="nfSetCeoPeriod('${p}')">${p}</button>`).join("")}</div>
        <label class="nf-select-control"><span>Product</span><select onchange="nfSetCeoProduct(this.value)"><option value="All" ${ceoPrefs.product === "All" ? "selected" : ""}>All Products</option>${Object.keys(products).map(p => `<option ${ceoPrefs.product === p ? "selected" : ""}>${p}</option>`).join("")}</select></label>
        <label class="nf-select-control"><span>Branch</span><select onchange="nfSetCeoBranch(this.value)"><option value="All" ${window.nfCeoBranch === "All" ? "selected" : ""}>All Branches</option>${branches.map(b => `<option ${window.nfCeoBranch === b ? "selected" : ""}>${b}</option>`).join("")}</select></label>
        <button class="nf-control-btn" onclick="openCEOPersonalizer()">⚙ <span>Personalize</span></button>
        <button class="nf-control-btn primary" onclick="exportMIS()">⇩ <span>Board MIS</span></button>
      </div>
    </div>

    <section class="nf-command-hero">
      <div class="nf-command-welcome">
        <div class="nf-command-photo"><img src="assets/ceo-md.png" alt="MD & CEO"><span>MD / CEO</span></div>
        <div class="nf-command-copy">
          <span class="nf-live-pill"><i></i> LIVE EXECUTIVE VIEW</span>
          <h3>Namdev Finvest Ltd.</h3>
          <p>Growth is healthy, collections remain above target and the current watchlist is concentrated around deviations, legal exceptions and send-back ageing.</p>
          <div class="nf-command-mini">
            <button onclick="navTo('approvals')"><span>Decision Queue</span><b>${demo.deviations}</b><small>open deviations</small></button>
            <button onclick="navTo('taskSla')"><span>Avg. TAT</span><b>${demo.tat.toFixed(1)}d</b><small>↓ 22% vs last period</small></button>
            <button onclick="navTo('repayments')"><span>Collection</span><b>${demo.collection}%</b><small>above 95% target</small></button>
          </div>
        </div>
      </div>
      <div class="nf-command-score">
        <div class="nf-score-ring" style="--score:${score * 3.6}deg"><div><b>${score}</b><span>Executive<br>Health Score</span></div></div>
        <div class="nf-score-copy"><strong>Strong</strong><span>Business health</span><div><i></i> 5 of 6 departments on target</div></div>
      </div>
      <div class="nf-command-campaign">
        <div class="nf-campaign-overlay">
          <span>SEASONAL BUSINESS CAMPAIGN</span>
          <h4>Finance brighter ambitions.</h4>
          <p>Targeted sourcing across Two Wheeler, MSME, LAP, Solar Loan and Tractor Loan.</p>
          <button onclick="navTo('crm')">View campaign performance →</button>
        </div>
        <div class="nf-campaign-thumbs">${productRows.map(([p, s, d, img]) => `<button onclick="nfSetCeoProduct('${p}')"><img src="${img}" alt="${p}"><span>${p}</span></button>`).join("")}</div>
      </div>
    </section>

    <section class="nf-exec-kpi-strip">
      ${nfExecKpi("Total AUM", `₹ ${demo.aum.toFixed(demo.aum >= 100 ? 0 : 1)} Cr`, "+12.5%", "up", "applications", [35, 44, 40, 56, 62, 70, 68, 82])}
      ${nfExecKpi(`Disbursement ${selectedPeriod}`, `₹ ${demo.disb.toFixed(demo.disb >= 100 ? 0 : 1)} Cr`, "+28.4%", "up", "disbursement", [28, 32, 46, 52, 61, 67, 76, 88])}
      ${nfExecKpi("Sanctioned", `₹ ${demo.sanction.toFixed(demo.sanction >= 100 ? 0 : 1)} Cr`, "+31.2%", "up", "sanction", [22, 40, 35, 55, 57, 69, 78, 86])}
      ${nfExecKpi("Active Customers", demo.customers.toLocaleString("en-IN"), "+8.2%", "up", "customer360", [38, 42, 45, 49, 54, 59, 63, 69])}
      ${nfExecKpi("Approval Ratio", demo.approval.toFixed(1) + "%", "+4.1%", "up", "approvals", [61, 65, 63, 68, 70, 74, 76, 78])}
      ${nfExecKpi("Collection Efficiency", demo.collection.toFixed(1) + "%", "+2.3%", "up", "repayments", [88, 90, 89, 92, 93, 94, 95, 96])}
      ${nfExecKpi("Portfolio at Risk", demo.par.toFixed(1) + "%", "-0.8%", "gooddown", "reports", [42, 39, 37, 34, 31, 29, 27, 24])}
      ${nfExecKpi("NPA", demo.npa.toFixed(1) + "%", "-0.4%", "gooddown", "reports", [37, 35, 31, 30, 27, 25, 22, 20])}
    </section>

    <section class="nf-exec-main-grid">
      <article class="nf-exec-card nf-growth-card">
        <header class="nf-card-head"><div><span>GROWTH ENGINE</span><h3>Disbursement & Target Trend</h3><p>${selectedPeriod} · ₹ in Crores</p></div><button onclick="navTo('reports')">Open MIS ↗</button></header>
        <div class="nf-line-chart-wrap">
          <div class="nf-chart-summary"><div><b>₹ ${demo.disb.toFixed(0)} Cr</b><span>Current disbursement</span></div><div><b>${Math.round(demo.disb / (demo.sanction || 1) * 100)}%</b><span>Sanction conversion</span></div><div><b>+28.4%</b><span>vs last period</span></div></div>
          <svg class="nf-line-chart" viewBox="0 0 ${chartW} ${chartH}" preserveAspectRatio="none" aria-label="Disbursement trend">
            <defs><linearGradient id="nfArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#2E7DD3" stop-opacity=".28"/><stop offset="100%" stop-color="#2E7DD3" stop-opacity="0"/></linearGradient></defs>
            ${[0, 1, 2, 3].map(i => `<line x1="${left}" x2="${left + plotW}" y1="${top + i * (plotH / 3)}" y2="${top + i * (plotH / 3)}" class="grid"/>`).join("")}
            <path d="${areaPath}" fill="url(#nfArea)"/>
            <polyline points="${targetPts}" class="target"/>
            <polyline points="${disbPts}" class="actual"/>
            ${disbSeries.map((v, i) => { const [x, y] = point(v, i, disbSeries).split(','); return `<circle cx="${x}" cy="${y}" r="3.6" class="dot"><title>${periodMonths[i]}: ₹${v} Cr</title></circle>` }).join("")}
            ${periodMonths.map((m, i) => `<text x="${left + (periodMonths.length === 1 ? 0 : i * (plotW / (periodMonths.length - 1)))}" y="180" text-anchor="middle">${m}</text>`).join("")}
          </svg>
          <div class="nf-chart-legend"><span><i class="blue"></i>Actual</span><span><i class="gold"></i>Target</span></div>
        </div>
      </article>

      <article class="nf-exec-card nf-portfolio-card">
        <header class="nf-card-head"><div><span>PORTFOLIO</span><h3>Product Mix & Yield</h3><p>AUM composition</p></div><button onclick="navTo('reports')">↗</button></header>
        <div class="nf-portfolio-content">
          <div class="nf-big-donut" style="background:conic-gradient(#EB5B65 0 28%,#2E7DD3 28% 60%,#D9A441 60% 86%,#2FA67A 86% 100%)"><div><small>Total AUM</small><b>₹ ${demo.aum.toFixed(0)}</b><span>Crores</span></div></div>
          <div class="nf-product-mix-list">${productRows.map(([p, s, d, img, c]) => `<button onclick="nfSetCeoProduct('${p}')"><i style="background:${c}"></i><span><b>${p}</b><small>₹ ${d} Cr MTD</small></span><strong>${s}%</strong></button>`).join("")}</div>
        </div>
      </article>

      <article class="nf-exec-card nf-funnel-card">
        <header class="nf-card-head"><div><span>ORIGINATION</span><h3>Loan Conversion Funnel</h3><p>Lead → disbursal</p></div><button onclick="navTo('applications')">↗</button></header>
        <div class="nf-modern-funnel">${funnel.map(([l, n, p, v], i) => `<button onclick="navTo('${v}')"><div class="shape f${i}" style="width:${38 + p * .56}%"><span>${n.toLocaleString('en-IN')}</span></div><label><b>${l}</b><small>${p}% of leads</small></label></button>`).join("")}</div>
        <div class="nf-funnel-foot"><div><span>Lead → Login</span><b>66%</b></div><div><span>Sanction → Disb.</span><b>55.5%</b></div><div><span>Overall Conversion</span><b>${demo.conversion}%</b></div></div>
      </article>
    </section>

    <section class="nf-exec-secondary-grid">
      <article class="nf-exec-card nf-risk-card">
        <header class="nf-card-head"><div><span>RISK WATCH</span><h3>Portfolio Quality</h3><p>DPD & NPA distribution</p></div><button onclick="navTo('reports')">Risk MIS ↗</button></header>
        <div class="nf-risk-layout">
          <div class="nf-risk-donut" style="background:conic-gradient(#2FA67A 0 94.2%,#3D8FE3 94.2% 97.3%,#E6B74E 97.3% 98.5%,#E38942 98.5% 99.3%,#E25262 99.3% 100%)"><div><b>${demo.npa}%</b><span>NPA</span><small>↓ 0.4%</small></div></div>
          <div class="nf-risk-list">${riskRows.map(([l, v, c]) => `<button onclick="navTo('reports')"><i style="background:${c}"></i><span>${l}</span><b>${v}%</b></button>`).join("")}</div>
        </div>
      </article>

      <article class="nf-exec-card nf-dept-card">
        <header class="nf-card-head"><div><span>OPERATING HEALTH</span><h3>Department Readiness</h3><p>Completion & SLA score</p></div><button onclick="navTo('hierarchy')">Hierarchy ↗</button></header>
        <div class="nf-dept-health">${departmentHealth.map(([n, v, go]) => `<button onclick="navTo('${go}')"><span><b>${n}</b><small>${v >= 90 ? 'On target' : v >= 84 ? 'Watch' : 'Needs attention'}</small></span><div><i style="width:${v}%"></i></div><strong>${v}%</strong></button>`).join("")}</div>
      </article>

      <article class="nf-exec-card nf-collection-card">
        <header class="nf-card-head"><div><span>COLLECTIONS</span><h3>Efficiency & Roll Rate</h3><p>Current collection pulse</p></div><button onclick="navTo('repayments')">↗</button></header>
        <div class="nf-collection-layout"><div class="nf-radial" style="--pct:${demo.collection * 3.6}deg"><div><b>${demo.collection}%</b><span>Efficiency</span></div></div><div class="nf-collection-stats"><div><span>Target</span><b>95.0%</b></div><div><span>PAR</span><b>${demo.par.toFixed(1)}%</b></div><div><span>1–30 DPD</span><b>3.1%</b></div><div><span>Recovery Trend</span><b class="good">+6.8%</b></div></div></div>
      </article>

      <article class="nf-exec-card nf-region-card">
        <header class="nf-card-head"><div><span>GEOGRAPHY</span><h3>Zone Performance</h3><p>Disbursement & target achievement</p></div><button onclick="navTo('reports')">↗</button></header>
        <div class="nf-region-list">${[["North", 286, 88], ["West", 342, 100], ["Central", 178, 61], ["East", 164, 54], ["South", 238, 76], ["Rajasthan", 198, 68]].map(([z, a, p]) => `<button onclick="showToast('${z} zone selected')"><span><b>${z}</b><small>₹ ${a} Cr</small></span><div><i style="width:${p}%"></i></div><strong>${p}%</strong></button>`).join("")}</div>
      </article>
    </section>

    <section class="nf-exec-ops-grid">
      <article class="nf-exec-card nf-branch-leaderboard">
        <header class="nf-card-head"><div><span>NETWORK PERFORMANCE</span><h3>Top Branches</h3><p>${selectedPeriod} achievement</p></div><button onclick="navTo('reports')">All branches ↗</button></header>
        <div class="nf-leader-table"><div class="head"><span>#</span><span>Branch</span><span>Disb.</span><span>Target</span><span>Achievement</span></div>${branchRows.map((r, i) => `<button onclick="nfSetCeoBranch('${r[0]}')"><span class="rank r${i}">${i + 1}</span><span><b>${r[0]}</b><small>${i < 3 ? 'Top performer' : 'Growing branch'}</small></span><span>₹ ${r[1]} Cr</span><span>₹ ${r[2]} Cr</span><span><i><em style="width:${Math.min(100, r[3] - 15)}%"></em></i><b>${r[3]}%</b></span></button>`).join("")}</div>
      </article>

      <article class="nf-exec-card nf-decision-center">
        <header class="nf-card-head"><div><span>DECISION CENTER</span><h3>Exceptions Requiring Attention</h3><p>Prioritized by risk & ageing</p></div><button onclick="navTo('approvals')">View all ↗</button></header>
        <div class="nf-decision-list">${alerts.map(([l, n, s, p, v]) => `<button onclick="navTo('${v}')"><i class="${p === 'Critical' ? 'critical' : 'watch'}">${p === 'Critical' ? '!' : '•'}</i><span><b>${l}</b><small>${s}</small></span><strong>${n}</strong><em>${p}</em></button>`).join("")}</div>
      </article>

      <article class="nf-exec-card nf-action-center">
        <header class="nf-card-head"><div><span>MY ACTIONS</span><h3>Tasks & Approvals</h3><p>Executive action queue</p></div><button onclick="navTo('lobby')">My Lobby ↗</button></header>
        <div class="nf-action-list">${tasks.map(([l, n, v], i) => `<button onclick="navTo('${v}')"><i>${['✓', '◆', '§', '₹', '⚡', '◎'][i]}</i><span>${l}</span><b>${n}</b><em>›</em></button>`).join("")}</div>
      </article>
    </section>

    <section class="nf-exec-card nf-product-stories">
      <header class="nf-card-head"><div><span>PRODUCT BUSINESS</span><h3>Growth Campaigns & Market Focus</h3><p>Image-led product view — click any product to filter the entire dashboard</p></div><button onclick="navTo('crm')">Campaign leads ↗</button></header>
      <div class="nf-story-grid">${productRows.map(([p, s, d, img, c, sub], i) => `<button onclick="nfSetCeoProduct('${p}')" style="--accent:${c}"><img src="${img}" alt="${p}"><div><span>${p}</span><h4>${sub}</h4><p>₹ ${d} Cr disbursed · ${s}% portfolio share</p><footer><b>${[12.8, 18.4, 11.6, 22.1, 16.9][i]}% growth</b><em>Open product →</em></footer></div></button>`).join("")}</div>
    </section>

    <section class="nf-personalized-strip nf-personalized-v2">
      <div class="nf-panel-head"><div><span class="nf-kicker">PERSONALIZED INTELLIGENCE</span><h3>My CEO KPI Shelf</h3><p>Drag to reorder · customize from 100+ lending, risk, operations and growth KPIs</p></div><button onclick="openCEOPersonalizer()">Customize dashboard →</button></div>
      <div class="nf-personal-kpis">${selected.slice(0, 12).map(k => { const v = ceoKpiValue(k); return `<div draggable="true" ondragstart="startKpiDrag('${k.key}')" ondragover="event.preventDefault()" ondrop="dropKpiBefore('${k.key}')"><span>${k.category}</span><b>${k.label}</b><strong>${formatKpi(v)}</strong><small>Drag to reorder</small></div>` }).join("")}</div>
    </section>
  </div>`;
  applyRoleAccess();
}


function nfExecKpi(label, value, delta, mode, view, series) {
  const positive = mode === 'up' || mode === 'gooddown';
  const pts = (series || [20, 35, 30, 50, 44, 64, 58, 76]).map((v, i) => `${i * (76 / ((series || []).length - 1 || 1))},${34 - (v / 100) * 28}`).join(' ');
  const arrow = mode === 'gooddown' ? '↓' : mode === 'down' ? '↓' : '↑';
  return `<button class="nf-exec-kpi" onclick="navTo('${view}')"><div class="nf-kpi-top"><span>${label}</span><i>↗</i></div><strong>${value}</strong><div class="nf-kpi-bottom"><span class="${positive ? 'good' : 'bad'}">${arrow} ${delta}</span><small>vs last period</small></div><svg viewBox="0 0 76 36" preserveAspectRatio="none"><polyline points="${pts}"/></svg></button>`;
}

function renderCEOChartWidgets(apps, leads, productMax) {
  const parts = [];
  if (ceoPrefs.charts.includes("productMix")) parts.push(`<div class="card ceo-panel"><div class="ceo-panel-head"><div><span>PRODUCT MIX</span><h3>Origination by Product</h3></div></div>${Object.keys(products).map(p => { const v = apps.filter(a => a.product === p).reduce((s, a) => s + a.amount, 0); return `<div class="ceo-product-bar"><div class="ceo-product-bar-head"><span>${products[p].icon} ${p}</span><strong>${money(v)}</strong></div><div class="ceo-bar-track"><span style="width:${Math.max(2, v / productMax * 100)}%"></span></div></div>` }).join("")}</div>`);
  if (ceoPrefs.charts.includes("stageFunnel")) parts.push(`<div class="card ceo-panel"><div class="ceo-panel-head"><div><span>JOURNEY FUNNEL</span><h3>Case Movement</h3></div></div>${["Sales/Predeal", "IMD Pending", "Credit Review", "CAM Allocation", "CAM Sheet", "Sanctioned", "Disbursement", "Active Loan"].map(s => { const n = apps.filter(a => a.status === s).length; return `<div class="funnel-row"><div><div class="label"><span>${s === "IMD Pending" ? "IMD & BSA Verification" : s}</span><span>${n}</span></div><div class="progress"><span style="width:${Math.max(3, n / Math.max(1, apps.length) * 100)}%"></span></div></div><strong>${n}</strong></div>` }).join("")}</div>`);
  if (ceoPrefs.charts.includes("branch")) parts.push(`<div class="card ceo-panel"><div class="ceo-panel-head"><div><span>BRANCH PERFORMANCE</span><h3>Top Branches</h3></div></div>${[...new Set(apps.map(a => a.branch))].slice(0, 5).map((b, i) => { const r = apps.filter(a => a.branch === b); return `<div class="ceo-branch-row"><span class="ceo-rank">${i + 1}</span><div><b>${b}</b><small>${r.length} cases</small></div><strong>${money(r.reduce((s, a) => s + a.amount, 0))}</strong></div>` }).join("")}</div>`);
  if (ceoPrefs.charts.includes("departmentHealth")) parts.push(`<div class="card ceo-panel"><div class="ceo-panel-head"><div><span>DEPARTMENT HEALTH</span><h3>Completion Readiness</h3></div></div>${[["Credit", apps.filter(a => a.workflow.bureauVerified).length], ["Technical", apps.filter(a => a.workflow.technicalStatus === "Completed").length], ["Legal", apps.filter(a => a.workflow.legalStatus === "Completed").length], ["eSign", apps.filter(a => a.workflow.eSignStatus === "Completed").length], ["Operations", apps.filter(a => a.workflow.doChecklist === "Completed").length]].map(([x, n]) => `<div class="funnel-row"><div><div class="label"><span>${x}</span><span>${n}/${apps.length}</span></div><div class="progress"><span style="width:${Math.max(2, n / Math.max(1, apps.length) * 100)}%"></span></div></div><strong>${Math.round(n / Math.max(1, apps.length) * 100)}%</strong></div>`).join("")}</div>`);
  if (ceoPrefs.charts.includes("riskWatch")) parts.push(`<div class="card ceo-panel"><div class="ceo-panel-head"><div><span>RISK & EXCEPTIONS</span><h3>Management Watch</h3></div></div><div class="ceo-alert-list">${[["Open Send Backs", sendBackTasks.filter(t => t.status === "Open").length, "sendBack"], ["Policy Deviations", apps.filter(a => a.workflow.approval?.status === "Pending").length, "approvals"], ["Low Document Readiness", apps.filter(a => a.docs < 80).length, "documents"], ["Low Bureau", apps.filter(a => a.score > 0 && a.score < 700).length, "credit"]].map(([l, n, v]) => `<button class="ceo-alert ${n ? 'high' : 'ok'}" onclick="navTo('${v}')"><span class="ceo-alert-icon">!</span><div><b>${l}</b><small>Click to drill down</small></div><strong>${n}</strong></button>`).join("")}</div></div>`);
  if (ceoPrefs.charts.includes("disbursement")) parts.push(`<div class="card ceo-panel"><div class="ceo-panel-head"><div><span>DISBURSEMENT</span><h3>Payout Readiness</h3></div></div>${["Sanctioned", "Disbursement", "Active Loan"].map(s => { const r = apps.filter(a => a.status === s); return `<div class="funnel-row"><div><div class="label"><span>${s}</span><span>${r.length} cases</span></div><div class="progress"><span style="width:${Math.max(3, r.length / Math.max(1, apps.length) * 100)}%"></span></div></div><strong>${money(r.reduce((x, a) => x + a.amount, 0))}</strong></div>` }).join("")}</div>`);
  if (!parts.length) return "";
  return `<div class="dashboard-widget-grid ${parts.length === 1 ? "single" : ""}">${parts.join("")}</div>`;
}

/* ----- Case Workflow 360 injection ----- */
const _renderCaseV5 = renderCase;
renderCase = function (id) {
  _renderCaseV5(id);
  injectWorkflow360(id);
  applyRoleAccess();
}
function injectWorkflow360(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  const content = $("#content"); if (!content) return;
  const block = document.createElement("div"); block.innerHTML = `
    <div style="height:16px"></div>
    <div class="card card-pad">
      <div class="card-title-row"><div><h3>Role-Controlled Workflow 360</h3><p>Sales → Credit/Bureau → Technical + Legal in parallel → Post Sanction/eSign + Operations → Central Disbursement → Deal → LMS.</p></div><span class="badge ${a.workflow.sendBack ? "red" : "blue"}">${a.workflow.sendBack ? "SEND BACK" : "LIVE WORKFLOW"}</span></div>
      ${extendedWorkflowMap(a)}
      <div style="height:12px"></div>
      <div class="role-grid equal">
        <div class="summary-block"><h4>Ownership & Hierarchy</h4><div class="summary-grid">${summary("Current Owner Role", a.workflow.ownerRole)}${summary("Sales BSO", a.workflow.sales.BSO)}${summary("Sales CBO", a.workflow.sales.CBO)}${summary("Credit BCM", a.workflow.credit.BCM)}${summary("Credit Head", a.workflow.credit["Credit Head"])}${summary("Logged In As", currentUser.role)}</div></div>
        <div class="summary-block"><h4>Parallel / Post-Sanction Readiness</h4><div class="summary-grid">${summary("Bureau", a.workflow.bureauVerified ? (a.workflow.bureauDemoOnly ? "Demo only — no bureau query" : "Verified") : "Pending")}${summary("Technical", `${a.workflow.technicalStatus}${a.workflow.technicalDemoOnly ? " · DEMO ONLY" : ""}`)}${summary("Legal", `${a.workflow.legalStatus}${a.workflow.legalDemoOnly ? " · DEMO ONLY" : ""}`)}${summary("eSign", a.workflow.eSignStatus)}${summary("DO Checklist", a.workflow.doChecklist)}${summary("LMS", a.workflow.lmsStatus)}</div></div>
      </div>
      <div style="height:12px"></div>
      ${roleCaseActions(a)}
    </div>`;
  content.appendChild(block);
}
function extendedWorkflowMap(a) {
  const done = x => x ? "done" : "";
  return `<div class="workflow-map">
    <div class="workflow-node"><div class="workflow-node-box"><b>CRM / Sales</b><span>BSO owned • hierarchy visible</span></div><div class="workflow-arrow"></div></div>
    <div class="workflow-node"><div class="workflow-node-box"><b>Credit + Bureau</b><span>${a.workflow.bureauVerified ? (a.workflow.bureauDemoOnly ? "Demo only — no bureau query" : "Verified") : "Pending"}</span></div><div class="workflow-arrow"></div></div>
    <div class="workflow-node"><div class="workflow-node-box"><b>Parallel Verification</b><span>Technical: ${a.workflow.technicalStatus}${a.workflow.technicalDemoOnly ? " · DEMO ONLY" : ""}<br>Legal: ${a.workflow.legalStatus}${a.workflow.legalDemoOnly ? " · DEMO ONLY" : ""}</span></div><div class="workflow-arrow"></div></div>
    <div class="workflow-node"><div class="workflow-node-box"><b>Post Sanction</b><span>eSign: ${a.workflow.eSignStatus}</span></div><div class="workflow-arrow"></div></div>
    <div class="workflow-node"><div class="workflow-node-box"><b>Branch Ops • DO</b><span>${a.workflow.doChecklist}</span></div><div class="workflow-arrow"></div></div>
    <div class="workflow-node"><div class="workflow-node-box"><b>Central Ops</b><span>${a.workflow.centralOps}</span></div><div class="workflow-arrow"></div></div>
    <div class="workflow-node"><div class="workflow-node-box"><b>Deal / LMS</b><span>${a.workflow.dealId || "Pending"}<br>${a.workflow.lmsStatus}</span></div></div>
  </div>`;
}
function roleCaseActions(a) {
  const buttons = [];
  if (currentUser.role === "BCM" && ["Credit Review", "CAM Allocation", "CAM Sheet"].includes(a.status)) {
    buttons.push(`<button class="ghost-btn" onclick="verifyBureau('${a.id}')">Verify Bureau & Cross Check</button>`);
    buttons.push(`<button class="ghost-btn" onclick="raiseCreditDeviation('${a.id}')">Raise Deviation</button>`);
    buttons.push(`<button class="primary-btn" onclick="startParallelVerification('${a.id}')">Start Technical + Legal</button>`);
  }
  if (currentUser.role === "Technical Verifier" || currentUser.role === "Appraiser") buttons.push(`<button class="ghost-btn" onclick="openTechnicalCase('${a.id}')">Work Technical</button>`);
  if (currentUser.role === "Legal Verifier") buttons.push(`<button class="ghost-btn" onclick="openLegalCase('${a.id}')">Work Legal</button>`);
  if (currentUser.role === "Disbursement Officer" && a.status === "Sanctioned") buttons.push(`<button class="primary-btn" onclick="openDOChecklist('${a.id}')">DO Checklist</button>`);
  if (currentUser.role === "Central Operations" && ["Sanctioned", "Disbursement"].includes(a.status)) buttons.push(`<button class="primary-btn" onclick="openCentralOps('${a.id}')">Central Ops Review</button>`);
  if (a.workflow.approval?.status === "Pending" && a.workflow.approval.requiredRole === currentUser.role) buttons.push(`<button class="primary-btn" onclick="navTo('approvals')">Approval Required</button>`);
  if (["BSO", "BCM", "Technical Verifier", "Legal Verifier", "Disbursement Officer", "Central Operations"].includes(currentUser.role)) buttons.push(`<button class="danger-btn" onclick="sendBackCaseModal('${a.id}','${currentUser.dept}')">Send Back</button>`);
  if (!buttons.length) buttons.push(`<span class="badge gray">View-only status access for ${currentUser.role}</span>`);
  return `<div class="action-row">${buttons.join("")}</div>`;
}
function verifyBureau(id) { const a = applications.find(x => x.id === id); if (!a) return; const demoOnly = isDemoWorkflowCase(a); a.workflow.bureauVerified = true; a.workflow.creditCrossCheck = true; a.workflow.bureauDemoOnly = demoOnly; logAudit(id, demoOnly ? "Synthetic Demo Bureau Gate Recorded" : "Bureau & Customer Cross Verification Completed", demoOnly ? "SYNTHETIC DEMO ONLY — no bureau query or customer cross-check occurred." : ""); showToast(demoOnly ? "Synthetic demo bureau gate recorded; no bureau query or customer cross-check occurred." : "Bureau and customer details cross-verified"); renderCase(id) }
function startParallelVerification(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  if (!a.workflow.bureauVerified) { showToast("Complete bureau cross verification first"); return }
  if (a.workflow.approval?.status === "Pending") { showToast(`Deviation pending with ${a.workflow.approval.requiredRole}`); return }
  a.workflow.technicalStatus = a.workflow.technicalStatus === "Completed" ? "Completed" : "Pending";
  a.workflow.legalStatus = a.workflow.legalStatus === "Completed" ? "Completed" : "Pending";
  logAudit(id, "Parallel Technical & Legal Initiated"); showToast("Technical and Legal workflows initiated in parallel"); renderCase(id);
}
function raiseCreditDeviation(id) {
  showModal("Raise Credit Deviation", `
    <label>Approval Level<select id="devLevel"><option>ACM</option><option>ZCM</option><option>Credit Head</option></select></label>
    <label>Deviation Type<select id="devType"><option>Policy Deviation</option><option>FOIR Deviation</option><option>Bureau Deviation</option><option>Income Assessment Deviation</option></select></label>
    <label>Reason<textarea id="devReason" rows="4">Deviation requires hierarchy approval.</textarea></label>`,
    `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="saveCreditDeviation('${id}')">Route for Approval</button>`
  );
}
function saveCreditDeviation(id) {
  const a = applications.find(x => x.id === id); if (!a) return;
  a.workflow.approval = { department: "Credit", requiredRole: $("#devLevel").value, reason: $("#devReason").value, type: $("#devType").value, status: "Pending", raisedBy: "BCM", remarks: "" };
  a.workflow.deviations.push(a.workflow.approval); logAudit(id, "Credit Deviation Raised", a.workflow.approval.reason); closeModal(); updateWorkflowBadges(); showToast(`Deviation routed to ${a.workflow.approval.requiredRole}`); renderCase(id);
}

/* sales lead hierarchy enrichment */
crm.leads.forEach((l, i) => {
  l.ownerRole = l.ownerRole || "BSO";
  l.hierarchy = l.hierarchy || { ...defaultTeamPath.sales };
  if (!l.created) l.created = i < 2 ? "04 Oct 2026" : "02 Oct 2026";
});

/* login role activation after legacy submit listener */
$("#loginForm").addEventListener("submit", () => {
  const role = $("#loginRole")?.value || "CEO";
  currentUser = { role, ...roleMeta(role) }; msme.role = role;
  setTimeout(() => { applyRoleAccess(); renderDashboard() }, 0);
});

/* apply role when script loads if shell already visible */
setTimeout(() => applyRoleAccess(), 0);




/* =========================================================
   V7 — ENTERPRISE LENDING OS: DOMAIN MODULES + FLOW ENGINE UX
   ========================================================= */

// Expanded enterprise roles
Object.assign(ORG_ROLES, {
  "KYC Executive": { dept: "KYC Operations", level: 1, name: "KYC Operations User", initials: "KY", manager: "BCM" },
  "Document Verifier": { dept: "Document Operations", level: 1, name: "Document Verification User", initials: "DV", manager: "BCM" },
  "RCU Analyst": { dept: "Risk Control", level: 1, name: "RCU Analyst", initials: "RA", manager: "RCU Head" },
  "RCU Head": { dept: "Risk Control", level: 2, name: "RCU Head", initials: "RH", manager: "Credit Head" },
  "Operations Checker": { dept: "Branch Operations", level: 2, name: "Operations Checker", initials: "OC", manager: "Central Operations" },
  "Partner Manager": { dept: "Partner Network", level: 2, name: "Partner Manager", initials: "PM", manager: "CBO" },
  "Compliance Officer": { dept: "Compliance", level: 3, name: "Compliance Officer", initials: "CP", manager: "CEO" },
  "Accountant": { dept: "Accounts & Finance", level: 1, name: "Accountant", initials: "AC", manager: "Finance Manager" },
  "Finance Manager": { dept: "Accounts & Finance", level: 2, name: "Finance Manager", initials: "FM", manager: "CFO" },
  "CFO": { dept: "Executive Finance", level: 6, name: "Chief Financial Officer", initials: "CF", manager: "CEO" },
  "System Admin": { dept: "Platform Administration", level: 9, name: "System Administrator", initials: "SA", manager: "CEO" }
});
["Accountant", "Finance Manager", "CFO"].forEach(role => {
  const loginRole = $("#loginRole");
  if (loginRole && ![...loginRole.options].some(option => option.value === role || option.textContent === role)) {
    loginRole.add(new Option(role, role));
  }
});

const V7_VIEWS = ["customer360", "preEligibility", "kycDedupe", "bankingAA", "bureau", "financials", "creditEngine", "rcu", "underwriting", "sanction", "taskSla", "pddCollateral", "partners", "auditCompliance", "configStudio", "integrationHub", "platformArchitecture"];
function grantV7(role, views) { BASE_ACCESS[role] = [...(BASE_ACCESS[role] || []), ...views.filter(v => !(BASE_ACCESS[role] || []).includes(v))] }
grantV7("Accountant", ["dashboard", "generalLedger"]);
grantV7("Finance Manager", ["dashboard", "generalLedger"]);
grantV7("CFO", ["dashboard", "generalLedger", "lmsReports"]);
grantV7("CEO", V7_VIEWS);
grantV7("System Admin", [...V7_VIEWS, "dashboard", "applications", "reports", "workflowControl", "hierarchy"]);
grantV7("BSO", ["customer360", "preEligibility", "kycDedupe", "taskSla"]);
["BDM", "ASM", "RSM", "ZSM", "CBO"].forEach(r => grantV7(r, ["customer360", "preEligibility", "taskSla", "partners"]));
grantV7("BCM", ["customer360", "kycDedupe", "bankingAA", "bureau", "financials", "creditEngine", "rcu", "underwriting", "sanction", "taskSla", "auditCompliance"]);
["ACM", "ZCM", "Credit Head"].forEach(r => grantV7(r, ["customer360", "bankingAA", "bureau", "financials", "creditEngine", "rcu", "underwriting", "sanction", "taskSla", "auditCompliance"]));
grantV7("KYC Executive", ["dashboard", "applications", "customer360", "kycDedupe", "documents", "taskSla", "lobby", "sendBack", "case"]);
grantV7("Document Verifier", ["dashboard", "applications", "customer360", "documents", "kycDedupe", "taskSla", "lobby", "sendBack", "case"]);
grantV7("RCU Analyst", ["dashboard", "applications", "customer360", "rcu", "taskSla", "lobby", "sendBack", "case"]);
grantV7("RCU Head", ["dashboard", "applications", "customer360", "rcu", "taskSla", "hierarchy", "reports", "case"]);
grantV7("Underwriter", ["customer360", "bureau", "financials", "creditEngine", "rcu", "underwriting", "sanction", "taskSla", "auditCompliance"]);
grantV7("Disbursement Officer", ["customer360", "sanction", "taskSla", "pddCollateral"]);
grantV7("Central Operations", ["customer360", "sanction", "taskSla", "pddCollateral", "auditCompliance"]);
grantV7("Operations Checker", ["dashboard", "applications", "customer360", "postSanction", "operations", "taskSla", "pddCollateral", "sendBack", "case"]);
grantV7("Partner Manager", ["dashboard", "partners", "reports", "taskSla"]);
grantV7("Compliance Officer", ["dashboard", "customer360", "auditCompliance", "reports", "taskSla", "applications", "case"]);

// Domain data model prototypes
const v7Customers = applications.map((a, i) => ({
  id: `CUS-${String(880001 + i)}`,
  name: a.customer, mobile: a.mobile, pan: ["ABCDE1234F", "FGHIJ5678K", "KLMNO1122P", "PQRST7788Q"][i % 4], aadhaar: String(700000000000 + i),
  product: a.product, applicationId: a.id, branch: a.branch, amount: a.amount, score: a.score || [728, 704, 776, 690][i % 4],
  kyc: i % 3 === 0 ? "Verified" : "In Review", dedupe: i === 2 ? "Probable Match" : "Clear", risk: i === 6 ? "High" : "Normal",
  groupExposure: Math.round(a.amount * (1.15 + (i % 3) * .15)), existingLoans: i % 3, closedLoans: i % 4, overdue: i === 6 ? 24500 : 0,
  consent: { bureau: true, kyc: true, aa: i % 2 === 0, communication: true },
  family: [{ name: "Family Member", relation: "Spouse", exposure: i % 2 ? 125000 : 0 }],
  communication: [{ type: "Call", text: "Application follow-up completed", at: "Today 10:42" }, { type: "WhatsApp", text: "Document checklist shared", at: "Yesterday 16:20" }]
}));

let v7Tasks = JSON.parse(localStorage.getItem("skf_v7_tasks") || "null") || [
  { id: "TSK-10021", caseId: applications[0]?.id, type: "Credit Cross Verification", ownerRole: "BCM", owner: "Kavita Rao", priority: "High", status: "Open", sla: "02:18:42", due: "Today 15:00", source: "Workflow" },
  { id: "TSK-10022", caseId: applications[1]?.id, type: "Technical Site Visit", ownerRole: "Technical Verifier", owner: "Ravi Choudhary", priority: "High", status: "In Progress", sla: "05:31:05", due: "Today 18:00", source: "Parallel Gateway" },
  { id: "TSK-10023", caseId: applications[1]?.id, type: "Legal Title Search", ownerRole: "Legal Verifier", owner: "Priya Saxena", priority: "Normal", status: "Open", sla: "09:42:10", due: "Tomorrow 12:00", source: "Parallel Gateway" },
  { id: "TSK-10024", caseId: applications[3]?.id, type: "eSign Completion", ownerRole: "Disbursement Officer", owner: "Mukesh Yadav", priority: "Normal", status: "Waiting", sla: "11:20:12", due: "Tomorrow 16:00", source: "Post Sanction" },
  { id: "TSK-10025", caseId: applications[4]?.id, type: "Document Correction", ownerRole: "BSO", owner: "Neha Jain", priority: "Critical", status: "Open", sla: "00:48:15", due: "Today 13:00", source: "Send Back" }
];
async function persistV7Tasks() { 
  localStorage.setItem("skf_v7_tasks", JSON.stringify(v7Tasks)); 
  updateV7Badges(); 
  
  // Real MERN sync
  try {
     const token = localStorage.getItem('token');
     if (!token) return;
     // Note: In a real app we'd sync granularly, but here we just simulate the sync passing via the backend
     // Since the backend expects POST/PUT/DELETE, and this legacy UI bulk-updates the whole array...
     // We will just invoke a GET to ensure connectivity
     await fetch('/api/tasks', { headers: { Authorization: 'Bearer ' + token } });
  } catch (e) {
     console.error('MERN Sync failed', e);
  }
}

const v7KycGen = (a, i) => ({ status: i % 3 === 0 ? "Verified" : "Pending", pan: i % 2 === 0 ? "Verified" : "Pending", identity: i % 3 === 0 ? "Verified" : "Pending", face: i % 4 === 0 ? "Matched" : "Pending", address: i % 2 === 0 ? "Verified" : "Pending", ocr: i % 2 === 0 ? "Completed" : "Pending", version: 1 });
function v7FillAll() { try { applications.forEach((a, i) => { if (typeof v7Kyc !== 'undefined' && !v7Kyc[a.id]) v7Kyc[a.id] = v7KycGen(a, i); if (typeof v7Banking !== 'undefined' && !v7Banking[a.id]) v7Banking[a.id] = v7BankingGen(a, i); if (typeof v7Bureau !== 'undefined' && !v7Bureau[a.id]) v7Bureau[a.id] = v7BureauGen(a, i); if (typeof v7RCU !== 'undefined' && !v7RCU[a.id]) v7RCU[a.id] = v7RCUGen(a, i); if (typeof v7UW !== 'undefined' && !v7UW[a.id]) v7UW[a.id] = v7UWGen(a, i); if (typeof v7Sanction !== 'undefined' && !v7Sanction[a.id]) v7Sanction[a.id] = v7SanctionGen(a, i); if (typeof v7PDD !== 'undefined' && !v7PDD[a.id]) v7PDD[a.id] = v7PDDGen(a, i); }) } catch (e) { console.warn('v7FillAll', e) } }
let v7Kyc = Object.fromEntries(applications.map((a, i) => [a.id, v7KycGen(a, i)]));
const v7BankingGen = (a, i) => ({ consent: i % 2 === 0 ? "Active" : "Pending", accounts: i % 3 + 1, abb: 45000 + (i * 7200), credits: 95000 + (i * 17000), bounces: i === 6 ? 3 : i % 2, emi: 12000 + (i * 2500), risk: i === 6 ? "High" : "Low" });
let v7Banking = Object.fromEntries(applications.map((a, i) => [a.id, v7BankingGen(a, i)]));
const v7BureauGen = (a, i) => ({ score: a.score || [742, 718, 768, 731, 704, 756, 690, 722][i % 8], active: i % 4 + 1, outstanding: 180000 + (i * 91000), emi: 8000 + (i * 2200), dpd: i === 6 ? 2 : 0, settled: i === 6 ? 1 : 0, enquiries: 2 + (i % 5), status: i % 3 === 0 ? "Fetched" : "Ready" });
let v7Bureau = Object.fromEntries(applications.map((a, i) => [a.id, v7BureauGen(a, i)]));
const v7RCUGen = (a, i) => ({ status: i === 6 ? "Adverse" : i % 3 === 0 ? "Clear" : "Pending", flags: i === 6 ? ["Address mismatch", "High recent enquiries"] : i % 3 === 1 ? ["Manual review required"] : [], risk: i === 6 ? 82 : 18 + (i * 4) });
let v7RCU = Object.fromEntries(applications.map((a, i) => [a.id, v7RCUGen(a, i)]));
const v7UWGen = (a, i) => ({ status: ["Pending", "Query", "Pending", "Approved", "Approved", "Approved", "Query", "Pending"][i % 8], recommendation: i === 6 ? "Refer" : "Approve", query: i % 3 === 1 ? "Please confirm latest banking and turnover evidence" : "" });
let v7UW = Object.fromEntries(applications.map((a, i) => [a.id, v7UWGen(a, i)]));
const v7SanctionGen = (a, i) => ({ version: 1, status: ["Draft", "Draft", "Generated", "Accepted", "Accepted", "Accepted", "Draft", "Draft"][i % 8], amount: Math.round(a.amount * (i % 4 === 0 ? .92 : 1)), roi: products[a.product].rate, tenure: products[a.product].tenure, validity: "30 days", accepted: i >= 2 && i <= 5 });
let v7Sanction = Object.fromEntries(applications.map((a, i) => [a.id, v7SanctionGen(a, i)]));
const v7PDDGen = (a, i) => ({
  items: [
    { name: "Original Security / Property Documents", status: i % 3 === 0 ? "Received" : "Pending" },
    { name: "Insurance Endorsement", status: i % 2 === 0 ? "Received" : "Pending" },
    { name: "RC / Hypothecation / Charge Proof", status: i % 4 === 0 ? "Received" : "Pending" }
  ], vault: i % 3 === 0 ? `VAULT-JPR-${200 + i}` : "Not Stored"
});
let v7PDD = Object.fromEntries(applications.map((a, i) => [a.id, v7PDDGen(a, i)]));

let v7Partners = [
  { id: "PTR-001", type: "Dealer", name: "Pink City Motors", city: "Jaipur", status: "Active", rating: 4.7, cases: 182, conversion: 71 },
  { id: "PTR-002", type: "DSA", name: "GrowthFin Associates", city: "Jaipur", status: "Active", rating: 4.4, cases: 94, conversion: 62 },
  { id: "PTR-003", type: "EPC Vendor", name: "SunGrid Energy", city: "Bhilwara", status: "Active", rating: 4.8, cases: 56, conversion: 79 },
  { id: "PTR-004", type: "Legal Panel", name: "Saxena Legal Chambers", city: "Jaipur", status: "Active", rating: 4.6, cases: 121, conversion: 96 },
  { id: "PTR-005", type: "Technical Agency", name: "ProValue Consultants", city: "Rajasthan", status: "Under Review", rating: 4.2, cases: 68, conversion: 91 }
];
let v7Integrations = [
  { name: "Credit Bureau", category: "Risk", status: "Healthy", latency: "182 ms", success: 99.82, last: "2 min ago" },
  { name: "CKYC / KYC", category: "Identity", status: "Healthy", latency: "241 ms", success: 99.61, last: "1 min ago" },
  { name: "Account Aggregator", category: "Banking", status: "Degraded", latency: "891 ms", success: 97.8, last: "4 min ago" },
  { name: "PAN Validation", category: "Identity", status: "Healthy", latency: "137 ms", success: 99.94, last: "1 min ago" },
  { name: "eSign", category: "Post Sanction", status: "Healthy", latency: "368 ms", success: 99.47, last: "3 min ago" },
  { name: "eNACH / Mandate", category: "Repayment", status: "Healthy", latency: "504 ms", success: 98.91, last: "5 min ago" },
  { name: "Bank / Payout", category: "Disbursement", status: "Healthy", latency: "318 ms", success: 99.72, last: "1 min ago" },
  { name: "LMS", category: "Core", status: "Healthy", latency: "224 ms", success: 99.88, last: "2 min ago" }
];
let v7Rules = [
  { id: "BRE-001", product: "All", condition: "Bureau score < 600", action: "Decline", authority: "Credit Policy", active: true },
  { id: "BRE-002", product: "All", condition: "Bureau score 600–649", action: "Refer", authority: "ACM", active: true },
  { id: "BRE-003", product: "MSME", condition: "FOIR > 55%", action: "Deviation", authority: "ZCM", active: true },
  { id: "BRE-004", product: "LAP", condition: "LTV > 70%", action: "Deviation", authority: "Credit Head", active: true },
  { id: "BRE-005", product: "All", condition: "Technical = Adverse", action: "Hold", authority: "Technical Head", active: true },
  { id: "BRE-006", product: "All", condition: "Legal = Negative", action: "Decline", authority: "Credit Head", active: true },
  { id: "BRE-007", product: "All", condition: "Mandatory document missing", action: "Block Disbursement", authority: "Operations", active: true }
];

function updateV7Badges() { if ($("#taskBadge")) $("#taskBadge").textContent = v7Tasks.filter(t => t.status !== "Completed" && (t.ownerRole === currentUser.role || currentUser.role === "CEO")).length }

// Nav router extension
const _navToV6Enterprise = navTo;
let customer360SearchQuery = '';
function setCustomer360SearchMode(active) {
  const globalSearch = $('#globalSearch')?.closest('.global-search');
  if (globalSearch) globalSearch.style.display = active ? 'none' : '';
}
function customer360CustomerList(selectedId) {
  const query = customer360SearchQuery.trim().toLowerCase();
  const customers = v7Customers.slice();
  applications.forEach(app => {
    if (customers.some(customer => customer.applicationId === app.id)) return;
    customers.push({
      id:app.lifecycle?.customerId || 'CUS-' + app.id,
      name:app.customer || 'Unnamed customer',
      mobile:app.mobile || '',
      pan:app.pan || '',
      product:app.product || '',
      applicationId:app.id,
      groupExposure:Number(app.lifecycle?.sanction?.amount || app.sanctionedAmount || app.amount || 0),
      risk:app.risk || 'Normal',
      existingLoans:app.lifecycle?.loanAccount ? 1 : 0,
      overdue:0,
      dedupe:app.dedupeStatus || 'Clear',
      communication:[]
    });
  });
  const matches = customers.filter(customer =>
    !query || [customer.id, customer.name, customer.mobile, customer.pan, customer.applicationId, customer.product]
      .some(value => String(value || '').toLowerCase().includes(query))
  );
  if (!matches.length) return '<div class="muted" style="padding:12px 8px">No matching customers</div>';
  return matches.slice(0, 8).map(customer =>
    `<button class="${customer.id === selectedId ? 'active' : ''}" onclick="renderCustomer360('${losEscapeHtml(customer.id)}')">${losEscapeHtml(customer.name)}<span style="margin-left:auto;font-size:6px">${losEscapeHtml(customer.product)}</span></button>`
  ).join('');
}
navTo = function (view, arg) {
  setCustomer360SearchMode(view === 'customer360');
  if (typeof v7FillAll === "function") v7FillAll();
  if (view === "customer360") return renderCustomer360(arg);
  if (view === "preEligibility") return renderPreEligibility();
  if (view === "kycDedupe") return renderKycDedupe();
  if (view === "bankingAA") return renderBankingAA();
  if (view === "bureau") return renderBureau();
  if (view === "financials") return renderFinancials();
  if (view === "creditEngine") return renderCreditEngine();
  if (view === "rcu") return renderRCU();
  if (view === "underwriting") return renderUnderwriting();
  if (view === "sanction") return renderSanction();
  if (view === "taskSla") return renderTaskSLA();
  if (view === "pddCollateral") return renderPDDCollateral();
  if (view === "partners") return renderPartners();
  if (view === "auditCompliance") return renderAuditCompliance();
  if (view === "configStudio") return renderConfigStudio();
  if (view === "integrationHub") return renderIntegrationHub();
  if (view === "platformArchitecture") return renderPlatformArchitecture();
  return _navToV6Enterprise(view, arg);
}

function v7ActivateNav(view) { $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view)); $('#sidebar')?.classList.remove('open'); applyRoleAccess(); updateV7Badges() }
function v7Hero(overline, title, desc, metrics = []) { return `<section class="v7-page-hero"><div><span class="micro">${overline}</span><h2>${title}</h2><p>${desc}</p></div><div class="v7-hero-metrics">${metrics.map(([k, v]) => `<div class="v7-hero-metric"><span>${k}</span><b>${v}</b></div>`).join('')}</div></section>` }
function v7Status(s) { const l = String(s).toLowerCase(); const c = l.includes('complete') || l.includes('verified') || l.includes('healthy') || l.includes('clear') || l.includes('accept') || l.includes('approved') || l.includes('active') || l.includes('received') ? 'good' : l.includes('adverse') || l.includes('reject') || l.includes('fail') || l.includes('high') ? 'bad' : l.includes('pending') || l.includes('review') || l.includes('degraded') || l.includes('query') || l.includes('waiting') ? 'warn' : 'info'; return `<span class="v7-status ${c}">${s}</span>` }
function v7Panel(overline, title, desc, body, action = '') { return `<section class="v7-panel"><div class="v7-panel-head"><div><span class="overline">${overline}</span><h3>${title}</h3><p>${desc}</p></div>${action}</div>${body}</section>` }
function getApp(id) { return applications.find(a => a.id === id) }
function getCustomerByApp(id) { return v7Customers.find(c => c.applicationId === id) }
function getCustomer360Record(id) {
  const existing = v7Customers.find(customer => customer.id === id || customer.applicationId === id);
  if (existing) return existing;
  const app = applications.find(application =>
    application.id === id ||
    application.lifecycle?.customerId === id ||
    'CUS-' + application.id === id
  );
  if (!app) return null;
  return {
    id:app.lifecycle?.customerId || 'CUS-' + app.id,
    name:app.customer || 'Unnamed customer',
    mobile:app.mobile || '',
    pan:app.pan || '',
    product:app.product || '',
    applicationId:app.id,
    groupExposure:Number(app.lifecycle?.sanction?.amount || app.sanctionedAmount || app.amount || 0),
    risk:app.risk || 'Normal',
    existingLoans:app.lifecycle?.loanAccount ? 1 : 0,
    overdue:0,
    dedupe:app.dedupeStatus || 'Clear',
    communication:[]
  };
}
function persistAuditV7(id, action, details = '') { logAudit(id, action, details); showToast(action) }

function renderCustomer360(id) {
  setCustomer360SearchMode(true);
  v7ActivateNav('customer360'); setPage('Customer 360', 'Enterprise Core / Customer 360');
  const c = id ? getCustomer360Record(id) : v7Customers[0];
  if (!c) return;
  const a = getApp(c.applicationId), b = v7Bureau[a.id], bk = v7Banking[a.id];
  $('#content').innerHTML = `${v7Hero('UNIFIED CUSTOMER MASTER', 'Customer 360', 'One customer identity across CRM, LOS, bureau, banking, documents, collateral, applications and communication.', [['Customer ID', c.id], ['Group Exposure', money(c.groupExposure)], ['Risk', c.risk], ['Active Loans', c.existingLoans]])}
  <div class="v7-workbench">
    <aside class="v7-rail"><div class="v7-rail-title">Customers</div><input id="customer360Search" type="search" value="${losEscapeHtml(customer360SearchQuery)}" placeholder="Search customers..." aria-label="Search customers by name, mobile, PAN or case ID" style="width:100%;box-sizing:border-box;margin:8px 0;padding:9px 10px;border:1px solid var(--line);border-radius:8px"><div id="customer360CustomerList">${customer360CustomerList(c.id)}</div></aside>
    <main class="v7-main-work"><div class="v7-tabs">${['Overview', 'Exposure', 'KYC', 'Bureau', 'Banking', 'Documents', 'Communication'].map((t, i) => `<button class="v7-tab ${i === 0 ? 'active' : ''}" onclick="customerTab('${t}','${c.id}',this)">${t}</button>`).join('')}</div><div id="customerTabBody">${customerOverview(c)}</div></main>
    <aside class="v7-rail"><div class="v7-side-card"><span>Current Application</span><b>${a.id}</b></div><div class="v7-side-card"><span>Application Stage</span><b>${a.status}</b></div><div class="v7-side-card"><span>Bureau Score</span><b>${b.score}</b></div><div class="v7-side-card"><span>Avg Bank Balance</span><b>${money(bk.abb)}</b></div><div class="v7-side-card"><span>Dedupe</span><b>${c.dedupe}</b></div><div class="v7-commandbar"><button class="primary" onclick="navTo('case','${a.id}')">Open Case</button><button onclick="runDedupe('${a.id}')">Run Dedupe</button></div></aside>
  </div>`;
  $('#customer360Search')?.addEventListener('input', event => {
    customer360SearchQuery = event.target.value;
    const list = $('#customer360CustomerList');
    if (list) list.innerHTML = customer360CustomerList(c.id);
  });
}
function customerOverview(c) { const a = getApp(c.applicationId); return `<div class="v7-health"><div class="v7-health-card"><span>Identity</span><b>${c.name}</b><small>${c.mobile} • ${c.pan}</small></div><div class="v7-health-card"><span>Application</span><b>${a.product}</b><small>${a.id} • ${money(a.amount)}</small></div><div class="v7-health-card"><span>Customer Risk</span><b>${c.risk}</b><small>Dedupe: ${c.dedupe}</small></div></div><div style="height:12px"></div>${v7Panel('RELATIONSHIP', 'Portfolio Relationship', 'Applications and exposure attached to this customer.', `<div class="v7-data-list"><div class="v7-data-row"><div><b>${a.id}</b><small>${a.product}</small></div><div class="v7-stat">Stage<br><strong>${a.status}</strong></div><div class="v7-stat">Amount<br><strong>${money(a.amount)}</strong></div><button class="more-btn" onclick="navTo('case','${a.id}')">Open →</button></div></div>`)} ` }
function customerTab(tab, cid, btn) { $$('.v7-tab').forEach(x => x.classList.remove('active')); btn.classList.add('active'); const c = getCustomer360Record(cid), a = getApp(c.applicationId), b = v7Bureau[a.id], bk = v7Banking[a.id], ky = v7Kyc[a.id]; let html = ''; if (tab === 'Overview') html = customerOverview(c); if (tab === 'Exposure') html = `<div class="v7-health"><div class="v7-health-card"><span>Group Exposure</span><b>${money(c.groupExposure)}</b><small>Across linked customers</small></div><div class="v7-health-card"><span>Existing Loans</span><b>${c.existingLoans}</b><small>Current active obligations</small></div><div class="v7-health-card"><span>Overdue</span><b>${money(c.overdue)}</b><small>${c.overdue ? 'Attention required' : 'No overdue'}</small></div></div>`; if (tab === 'KYC') html = `<div class="v7-health"><div class="v7-health-card"><span>KYC Status</span><b>${ky.status}</b></div><div class="v7-health-card"><span>Face Match</span><b>${ky.face}</b></div><div class="v7-health-card"><span>Address</span><b>${ky.address}</b></div></div>`; if (tab === 'Bureau') html = `<div class="v7-big-score">${b.score}</div><div class="v7-score-caption">Bureau Score</div><div style="height:12px"></div><div class="v7-health"><div class="v7-health-card"><span>Active Accounts</span><b>${b.active}</b></div><div class="v7-health-card"><span>Outstanding</span><b>${money(b.outstanding)}</b></div><div class="v7-health-card"><span>DPD Flags</span><b>${b.dpd}</b></div></div>`; if (tab === 'Banking') html = `<div class="v7-health"><div class="v7-health-card"><span>AA Consent</span><b>${bk.consent}</b></div><div class="v7-health-card"><span>Average Balance</span><b>${money(bk.abb)}</b></div><div class="v7-health-card"><span>Bounces</span><b>${bk.bounces}</b></div></div>`; if (tab === 'Documents') html = `<div class="v7-health"><div class="v7-health-card"><span>Readiness</span><b>${a.docs}%</b></div><div class="v7-health-card"><span>KYC Version</span><b>v${ky.version}</b></div><div class="v7-health-card"><span>Verification</span><b>${ky.status}</b></div></div>`; if (tab === 'Communication') html = `<div class="activity-list">${(c.communication || []).map(x => activity(x.type === 'Call' ? '☎' : '◌', x.text, `${x.type} • ${x.at}`)).join('')}</div><div style="height:10px"></div><div class="v7-commandbar"><button onclick="showToast('Call activity logged')">Log Call</button><button onclick="showToast('WhatsApp message queued')">WhatsApp</button><button onclick="showToast('Email queued')">Email</button></div>`; $('#customerTabBody').innerHTML = html }

function renderPreEligibility() { v7ActivateNav('preEligibility'); setPage('Pre-Eligibility', 'Enterprise Core / Pre-Eligibility'); $('#content').innerHTML = `${v7Hero('EARLY DECISIONING', 'Pre-Eligibility & Product Fit', 'Run a fast policy pre-check before full LOS creation. Results are indicative and can route to straight-through, refer or decline paths.', [['Products', '4'], ['Decision', 'Real-time'], ['Policy', 'Config-driven'], ['Output', 'Eligible / Refer']])}<div class="v7-grid equal"><section class="v7-panel"><div class="v7-panel-head"><div><span class="overline">INPUT</span><h3>Eligibility Inputs</h3><p>Product-specific variables used by the pre-screen rules.</p></div></div><div class="field-grid three">${f('Product', `<select id="peProduct">${Object.keys(products).map(p => `<option>${p}</option>`).join('')}</select>`)}${f('Requested Amount', `<input id="peAmount" type="number" value="750000">`)}${f('Monthly Income / Surplus', `<input id="peIncome" type="number" value="85000">`)}${f('Bureau Score', `<input id="peScore" type="number" value="728">`)}${f('Existing EMI', `<input id="peEmi" type="number" value="18000">`)}${f('Business Vintage (Years)', `<input id="peVintage" type="number" value="5">`)}${f('Collateral Value', `<input id="peCollateral" type="number" value="1500000">`)}${f('Pin Code', `<input id="pePin" value="302021">`)}${f('Customer Type', `<select id="peType"><option>Existing</option><option>New to Finance</option></select>`)}</div><div class="wizard-actions"><span></span><button class="primary-btn" onclick="evaluatePreEligibility()">Run Pre-Eligibility →</button></div></section><section class="v7-panel"><div class="v7-panel-head"><div><span class="overline">DECISION</span><h3>Decision Preview</h3><p>Rule outputs and approval routing.</p></div></div><div id="peResult" class="v7-empty">Run the assessment to view decision, FOIR, LTV and rule hits.</div></section></div>` }
function evaluatePreEligibility() { const p = $('#peProduct').value, amt = +$('#peAmount').value, inc = +$('#peIncome').value, score = +$('#peScore').value, emi0 = +$('#peEmi').value, col = +$('#peCollateral').value; const proposed = emi(amt, products[p].rate, products[p].tenure); const foir = Math.round((emi0 + proposed) / Math.max(1, inc) * 100); const ltv = Math.round(amt / Math.max(1, col) * 100); let decision = 'Eligible', authority = 'Straight Through', hits = []; if (score < 600) { decision = 'Decline'; hits.push('Bureau < 600') } else if (score < 650) { decision = 'Refer'; authority = 'ACM'; hits.push('Bureau 600–649') } if (foir > 55) { decision = 'Refer'; authority = 'ZCM'; hits.push(`FOIR ${foir}% > 55%`) } if (p === 'LAP' && ltv > 70) { decision = 'Refer'; authority = 'Credit Head'; hits.push(`LTV ${ltv}% > 70%`) } $('#peResult').innerHTML = `<div class="v7-big-score" style="font-size:28px">${decision}</div><div class="v7-score-caption">Pre-Eligibility Decision</div><div style="height:12px"></div><div class="v7-health"><div class="v7-health-card"><span>FOIR</span><b>${foir}%</b></div><div class="v7-health-card"><span>LTV</span><b>${ltv}%</b></div><div class="v7-health-card"><span>Route</span><b>${authority}</b></div></div><div style="height:12px"></div><div class="notice ${decision === 'Eligible' ? 'success' : decision === 'Decline' ? 'warn' : 'info'}">${hits.length ? hits.join(' • ') : 'No blocking rule hit in this indicative assessment.'}</div><div style="height:10px"></div><div class="v7-commandbar"><button class="primary" onclick="navTo('newApplication','${p}')">Create LOS Application</button><button onclick="showToast('Eligibility assessment saved')">Save Assessment</button></div>` }

function renderKycDedupe() { v7ActivateNav('kycDedupe'); setPage('KYC & Dedupe', 'Enterprise Core / KYC'); const pending = applications.filter(a => v7Kyc[a.id].status !== 'Verified').length; $('#content').innerHTML = `${v7Hero('IDENTITY & CUSTOMER INTEGRITY', 'KYC, OCR & Dedupe', 'Identity verification, live KYC, OCR, face match, address validation and customer deduplication with versioned evidence.', [['Pending', pending], ['Verified', applications.length - pending], ['Duplicate Alerts', v7Customers.filter(c => c.dedupe !== 'Clear').length], ['Source', 'PAN / CKYC / Aadhaar']])}<div class="v7-panel"><div class="table-wrap"><table><thead><tr><th>Application</th><th>Customer</th><th>PAN</th><th>Identity</th><th>Face</th><th>Address</th><th>Dedupe</th><th></th></tr></thead><tbody>${applications.map(a => { const k = v7Kyc[a.id], c = getCustomerByApp(a.id); return `<tr><td><b>${a.id}</b></td><td>${a.customer}</td><td>${v7Status(k.pan)}</td><td>${v7Status(k.identity)}</td><td>${v7Status(k.face)}</td><td>${v7Status(k.address)}</td><td>${v7Status(c.dedupe)}</td><td><button class="more-btn" onclick="openKycCase('${a.id}')">Open</button></td></tr>` }).join('')}</tbody></table></div></div>` }
function openKycCase(id) { const a = getApp(id), k = v7Kyc[id], c = getCustomerByApp(id); showModal(`KYC Workbench • ${id}`, `<div class="verification-grid"><div class="verification-card"><span>Customer</span><b>${a.customer}</b></div><div class="verification-card"><span>PAN</span><b>${c.pan}</b></div><div class="verification-card"><span>KYC Version</span><b>v${k.version}</b></div></div><div style="height:12px"></div><div class="ops-checklist">${['PAN Validation', 'Identity / CKYC', 'Live Photo / Face Match', 'Address Verification', 'OCR Extraction', 'Consent Captured'].map((x, i) => `<label class="ops-check"><input type="checkbox" class="kyc-check" ${[k.pan, k.identity, k.face, k.address, k.ocr, 'Verified'][i] === 'Verified' || [k.pan, k.identity, k.face, k.address, k.ocr, 'Completed'][i] === 'Completed' ? 'checked' : ''}>${x}</label>`).join('')}</div><div style="height:12px"></div><div class="notice info">Dedupe result: <b>${c.dedupe}</b>. Matching uses customer identifiers in this prototype; production can extend to device, bank account, address and face signals.</div>`, `<button class="ghost-btn" onclick="runDedupe('${id}')">Run Dedupe</button><button class="ghost-btn" onclick="closeModal()">Close</button><button class="primary-btn" onclick="completeKyc('${id}')">Verify KYC</button>`) }
function completeKyc(id) { const k = v7Kyc[id]; k.status = k.pan = k.identity = k.face = k.address = 'Verified'; k.ocr = 'Completed'; persistAuditV7(id, 'KYC Verified', 'PAN, identity, face, address and OCR checks completed'); closeModal(); renderKycDedupe() }
function runDedupe(id) { const c = getCustomerByApp(id); const idx = applications.findIndex(a => a.id === id); c.dedupe = idx === 2 ? 'Probable Match' : 'Clear'; showToast(`Dedupe completed: ${c.dedupe}`); if ($('#modalRoot').innerHTML) closeModal() }

function renderBankingAA() { v7ActivateNav('bankingAA'); setPage('Banking & Account Aggregator', 'Enterprise Core / Banking'); $('#content').innerHTML = `${v7Hero('BANKING INTELLIGENCE', 'Banking & Account Aggregator', 'Consent-driven bank data, statement analysis, average balance, income credits, obligations, cheque bounces and risk indicators.', [['AA Active', applications.filter(a => v7Banking[a.id].consent === 'Active').length], ['Pending Consent', applications.filter(a => v7Banking[a.id].consent !== 'Active').length], ['Bounce Alerts', applications.filter(a => v7Banking[a.id].bounces > 1).length], ['Analysis', 'Automated']])}<div class="v7-panel"><div class="table-wrap"><table><thead><tr><th>Case</th><th>Customer</th><th>AA Consent</th><th>Accounts</th><th>ABB</th><th>Monthly Credits</th><th>Bounces</th><th>Risk</th><th></th></tr></thead><tbody>${applications.map(a => { const x = v7Banking[a.id]; return `<tr><td><b>${a.id}</b></td><td>${a.customer}</td><td>${v7Status(x.consent)}</td><td>${x.accounts}</td><td>${money(x.abb)}</td><td>${money(x.credits)}</td><td>${x.bounces}</td><td>${v7Status(x.risk)}</td><td><button class="more-btn" onclick="openBankingCase('${a.id}')">Analyze</button></td></tr>` }).join('')}</tbody></table></div></div>` }
function openBankingCase(id) { const a = getApp(id), x = v7Banking[id]; showModal(`Banking Analysis • ${id}`, `<div class="verification-grid"><div class="verification-card"><span>Average Balance</span><b>${money(x.abb)}</b></div><div class="verification-card"><span>Monthly Credits</span><b>${money(x.credits)}</b></div><div class="verification-card"><span>Existing EMI</span><b>${money(x.emi)}</b></div></div><div style="height:12px"></div><div class="v7-mini-chart">${[32, 48, 42, 68, 57, 74, 61, 80, 70, 88, 76, 91].map(n => `<span style="height:${n}%"></span>`).join('')}</div><div class="notice ${x.bounces > 1 ? 'warn' : 'success'}">${x.bounces > 1 ? `${x.bounces} bounce / return indicators require credit review.` : 'Banking behaviour is within normal prototype thresholds.'}</div>`, `<button class="ghost-btn" onclick="closeModal()">Close</button>${x.consent !== 'Active' ? `<button class="primary-btn" onclick="activateAA('${id}')">Capture AA Consent</button>` : `<button class="primary-btn" onclick="showToast('Bank analysis refreshed')">Refresh Analysis</button>`}`) }
function activateAA(id) { v7Banking[id].consent = 'Active'; persistAuditV7(id, 'AA Consent Captured'); closeModal(); renderBankingAA() }

function renderBureau() { v7ActivateNav('bureau'); setPage('Credit Bureau', 'Enterprise Core / Bureau'); const avg = Math.round(applications.reduce((s, a) => s + v7Bureau[a.id].score, 0) / applications.length); $('#content').innerHTML = `${v7Hero('CREDIT HISTORY', 'Credit Bureau Intelligence', 'Go beyond score: tradelines, DPD, written-off/settled exposure, enquiries, outstanding, EMI obligations and risk indicators.', [['Average Score', avg], ['Low Score', applications.filter(a => v7Bureau[a.id].score < 700).length], ['DPD Alerts', applications.filter(a => v7Bureau[a.id].dpd > 0).length], ['Settled Flags', applications.filter(a => v7Bureau[a.id].settled > 0).length]])}<div class="v7-panel"><div class="table-wrap"><table><thead><tr><th>Case</th><th>Customer</th><th>Score</th><th>Active A/c</th><th>Outstanding</th><th>EMI</th><th>DPD</th><th>Enquiries</th><th></th></tr></thead><tbody>${applications.map(a => { const b = v7Bureau[a.id]; return `<tr><td><b>${a.id}</b></td><td>${a.customer}</td><td><b>${b.score}</b></td><td>${b.active}</td><td>${money(b.outstanding)}</td><td>${money(b.emi)}</td><td>${b.dpd ? `<span class="badge red">${b.dpd}</span>` : '0'}</td><td>${b.enquiries}</td><td><button class="more-btn" onclick="openBureauCase('${a.id}')">View Bureau</button></td></tr>` }).join('')}</tbody></table></div></div>` }
function openBureauCase(id) { const a = getApp(id), b = v7Bureau[id]; showModal(`Bureau 360 • ${id}`, `<div style="display:grid;grid-template-columns:150px 1fr;gap:15px"><div><div class="v7-big-score">${b.score}</div><div class="v7-score-caption">Credit Score</div></div><div class="v7-health"><div class="v7-health-card"><span>Outstanding</span><b>${money(b.outstanding)}</b></div><div class="v7-health-card"><span>Monthly EMI</span><b>${money(b.emi)}</b></div><div class="v7-health-card"><span>Recent Enquiries</span><b>${b.enquiries}</b></div></div></div><div style="height:12px"></div><div class="table-wrap"><table><thead><tr><th>Tradeline</th><th>Type</th><th>Outstanding</th><th>DPD</th><th>Status</th></tr></thead><tbody>${Array.from({ length: b.active }, (_, i) => `<tr><td>TL-${i + 1}</td><td>${i % 2 ? 'Unsecured' : 'Secured'}</td><td>${money(Math.round(b.outstanding / b.active))}</td><td>${i === 0 ? b.dpd : 0}</td><td>${i === 0 && b.settled ? 'Settled' : 'Regular'}</td></tr>`).join('')}</tbody></table></div>`, `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="primary-btn" onclick="markBureauVerified('${id}')">Cross Verify Bureau</button>`) }
function markBureauVerified(id) { getApp(id).workflow.bureauVerified = true; persistAuditV7(id, 'Bureau Cross Verification Completed'); closeModal(); renderBureau() }

function renderFinancials() { v7ActivateNav('financials'); setPage('Financial Analysis', 'Enterprise Core / Financials'); $('#content').innerHTML = `${v7Hero('REPAYMENT CAPACITY', 'Financial & Income Assessment', 'Separate templates for salaried, self-employed/MSME, LAP, Solar and Tractor/agri income with FOIR, DSCR, turnover, leverage and cash-flow indicators.', [['Templates', '4'], ['Assessment', 'Product-specific'], ['Output', 'Capacity / Risk'], ['Linked', 'Banking + Bureau']])}<div class="v7-grid"><section class="v7-panel"><div class="v7-panel-head"><div><span class="overline">ASSESSMENT</span><h3>Financial Spreading</h3><p>Input values and calculate key metrics.</p></div></div><div class="field-grid three">${f('Product', `<select id="finProduct" onchange="switchFinancialTemplate()">${Object.keys(products).map(p => `<option>${p}</option>`).join('')}</select>`)}${f('Annual Turnover / Gross Income', `<input id="finTurnover" type="number" value="4800000">`)}${f('Net Income / PAT', `<input id="finNet" type="number" value="620000">`)}${f('Existing Annual Debt Service', `<input id="finDebt" type="number" value="240000">`)}${f('Proposed Annual Debt Service', `<input id="finProposed" type="number" value="190000">`)}${f('Current Liabilities', `<input id="finLiab" type="number" value="1100000">`)}${f('Current Assets', `<input id="finAssets" type="number" value="1850000">`)}${f('Existing Monthly EMI', `<input id="finEmi" type="number" value="18000">`)}${f('Monthly Income', `<input id="finMonthly" type="number" value="85000">`)}</div><div class="wizard-actions"><span></span><button class="primary-btn" onclick="calculateFinancials()">Calculate Assessment</button></div></section><section class="v7-panel"><div class="v7-panel-head"><div><span class="overline">OUTPUT</span><h3>Key Ratios</h3><p>Calculated capacity indicators.</p></div></div><div id="finResults" class="v7-empty">Calculate to view FOIR, DSCR, margin, liquidity and recommendation.</div></section></div>` }
function switchFinancialTemplate() { showToast(`${$('#finProduct').value} assessment template loaded`) }
function calculateFinancials() { const turn = +$('#finTurnover').value, net = +$('#finNet').value, debt = +$('#finDebt').value, prop = +$('#finProposed').value, assets = +$('#finAssets').value, liab = +$('#finLiab').value, emi0 = +$('#finEmi').value, monthly = +$('#finMonthly').value; const dscr = (net / Math.max(1, debt + prop)).toFixed(2), margin = (net / Math.max(1, turn) * 100).toFixed(1), current = (assets / Math.max(1, liab)).toFixed(2), foir = Math.round((emi0 + (prop / 12)) / Math.max(1, monthly) * 100); const rec = +dscr >= 1.25 && foir <= 55 ? 'Comfortable' : 'Refer / Review'; $('#finResults').innerHTML = `<div class="v7-health"><div class="v7-health-card"><span>DSCR</span><b>${dscr}x</b></div><div class="v7-health-card"><span>Net Margin</span><b>${margin}%</b></div><div class="v7-health-card"><span>Current Ratio</span><b>${current}x</b></div><div class="v7-health-card"><span>FOIR</span><b>${foir}%</b></div><div class="v7-health-card"><span>Recommendation</span><b>${rec}</b></div><div class="v7-health-card"><span>Assessment</span><b>Saved</b></div></div>` }

function renderCreditEngine() { v7ActivateNav('creditEngine'); setPage('Credit Engine / BRE', 'Enterprise Core / Decisioning'); $('#content').innerHTML = `${v7Hero('BUSINESS RULE ENGINE', 'Credit Decisioning & BRE', 'Configurable policy rules evaluate bureau, FOIR, LTV, verification results, documents and product conditions to recommend approve, refer, hold or decline.', [['Active Rules', v7Rules.filter(r => r.active).length], ['Products', '4'], ['Pending Deviations', applications.filter(a => a.workflow.approval?.status === 'Pending').length], ['Engine', 'Config-driven']])}<div class="v7-grid"><section class="v7-panel"><div class="v7-panel-head"><div><span class="overline">POLICY RULES</span><h3>Active Rule Set</h3><p>Rules can be maintained in Configuration Studio.</p></div><button class="mini-link" onclick="navTo('configStudio')">Configure →</button></div>${v7Rules.map(r => `<div class="v7-rule"><span class="code">${r.id}</span><div><b>${r.condition}</b><span>${r.product}</span></div><div><b>${r.action}</b><span>${r.authority}</span></div>${v7Status(r.active ? 'Active' : 'Disabled')}</div>`).join('')}</section><section class="v7-panel"><div class="v7-panel-head"><div><span class="overline">CASE DECISION</span><h3>Evaluate Application</h3><p>Run an application through the prototype decision engine.</p></div></div><label>Application<select id="breCase">${applications.map(a => `<option value="${a.id}">${a.id} • ${a.customer}</option>`).join('')}</select></label><div id="breResult" class="v7-empty">Select a case and run rules.</div><button class="primary-btn full" onclick="runBRE()">Run Decision Engine</button></section></div>` }
function runBRE() { const id = $('#breCase').value, a = getApp(id), b = v7Bureau[id], fin = v7Banking[id], rcu = v7RCU[id]; let action = 'Approve', authority = 'BCM', hits = []; if (b.score < 600) { action = 'Decline'; authority = 'Credit Policy'; hits.push('BRE-001') } else if (b.score < 650) { action = 'Refer'; authority = 'ACM'; hits.push('BRE-002') } if (fin.bounces > 2) { action = 'Refer'; authority = 'ZCM'; hits.push('Banking bounce risk') } if (a.workflow.technicalStatus === 'Adverse') { action = 'Hold'; hits.push('BRE-005') } if (a.workflow.legalStatus === 'Negative') { action = 'Decline'; hits.push('BRE-006') } if (rcu.status === 'Adverse') { action = 'Refer'; authority = 'Credit Head'; hits.push('RCU adverse') } $('#breResult').innerHTML = `<div class="v7-big-score" style="font-size:28px">${action}</div><div class="v7-score-caption">Engine Recommendation</div><div style="height:10px"></div><div class="notice ${action === 'Approve' ? 'success' : action === 'Decline' ? 'warn' : 'info'}">Authority: <b>${authority}</b><br>Rule hits: ${hits.length ? hits.join(', ') : 'No adverse rule hits'}</div><div style="height:10px"></div><div class="v7-commandbar"><button class="primary" onclick="routeBREDecision('${id}','${action}','${authority}')">Route Decision</button></div>` }
function routeBREDecision(id, action, authority) { const a = getApp(id); if (action === 'Refer') { a.workflow.approval = { department: 'Credit', requiredRole: authority, reason: 'BRE generated policy referral', type: 'Automated Policy Deviation', status: 'Pending', raisedBy: 'BRE', remarks: 'System generated' }; updateWorkflowBadges() } persistAuditV7(id, `BRE Recommendation: ${action}`, `Authority ${authority}`); showToast('Decision routed into workflow') }

function renderRCU() { v7ActivateNav('rcu'); setPage('RCU / Fraud Control', 'Enterprise Core / Risk Control'); $('#content').innerHTML = `${v7Hero('RISK CONTROL UNIT', 'Fraud, Negative List & RCU', 'Cross-check identity, address, documents, sourcing partners, negative databases and suspicious patterns before sanction.', [['Pending', applications.filter(a => v7RCU[a.id].status === 'Pending').length], ['Clear', applications.filter(a => v7RCU[a.id].status === 'Clear').length], ['Adverse', applications.filter(a => v7RCU[a.id].status === 'Adverse').length], ['Signals', 'Identity + Device + Docs']])}<div class="v7-panel"><div class="table-wrap"><table><thead><tr><th>Case</th><th>Customer</th><th>Product</th><th>Risk Score</th><th>Flags</th><th>RCU Status</th><th></th></tr></thead><tbody>${applications.map(a => { const r = v7RCU[a.id]; return `<tr><td><b>${a.id}</b></td><td>${a.customer}</td><td>${a.product}</td><td><b>${r.risk}</b>/100</td><td>${r.flags.length ? r.flags.join(', ') : 'No active flags'}</td><td>${v7Status(r.status)}</td><td><button class="more-btn" onclick="openRCU('${a.id}')">Review</button></td></tr>` }).join('')}</tbody></table></div></div>` }
function openRCU(id) { const a = getApp(id), r = v7RCU[id], demoOnly = isDemoWorkflowCase(a); showModal(`RCU Review • ${id}`, `${demoOnly ? '<div class="notice info"><b>SYNTHETIC DEMO ONLY</b> — No external identity, negative-list, device or document searches were performed. Do not treat seeded risk data as a real fraud review.</div><div style="height:12px"></div>' : ''}<div class="verification-grid"><div class="verification-card"><span>Risk Score</span><b>${r.risk}/100</b></div><div class="verification-card"><span>Status</span><b>${r.status}${demoOnly ? ' · DEMO ONLY' : ''}</b></div><div class="verification-card"><span>Flags</span><b>${r.flags.length}</b></div></div><div style="height:12px"></div><div class="ops-checklist">${['Identity Consistency', 'Address / BGV', 'Document Authenticity', 'Negative Database', 'Dealer / Partner Risk', 'Device / Contact Pattern'].map((x, i) => `<label class="ops-check"><input type="checkbox" ${!demoOnly && r.status === 'Clear' ? 'checked' : ''} ${demoOnly ? 'disabled' : ''}>${demoOnly ? 'DEMO ONLY — Not assessed: ' : ''}${x}</label>`).join('')}</div><label>RCU Remarks<textarea id="rcuRemarks" rows="3">${demoOnly ? 'SYNTHETIC DEMO ONLY — No external identity, negative-list, device or document checks occurred. Seeded risk values are placeholders, not a real fraud assessment.' : r.flags.join('; ') || 'No adverse observation.'}</textarea></label>`, `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="danger-btn" onclick="setRCU('${id}','Adverse')">${demoOnly ? 'Record Demo Adverse' : 'Mark Adverse'}</button><button class="primary-btn" onclick="setRCU('${id}','Clear')">${demoOnly ? 'Record Demo RCU Gate' : 'Clear RCU'}</button>`) }
function setRCU(id, status) { const a = getApp(id), r = v7RCU[id], remarks = $('#rcuRemarks')?.value || '', demoOnly = isDemoWorkflowCase(a); r.status = status; r.risk = status === 'Clear' ? 12 : 86; r.demoOnly = demoOnly; r.remarks = demoOnly && !remarks.includes('SYNTHETIC DEMO ONLY') ? `SYNTHETIC DEMO ONLY — No real RCU checks occurred.\n${remarks}` : remarks; logAudit(id, `RCU ${status}${demoOnly ? ' · Synthetic Demo Only' : ''}`, r.remarks); closeModal(); showToast(demoOnly ? `Synthetic demo RCU ${status.toLowerCase()} recorded; no external checks occurred.` : `RCU ${status}`); renderRCU() }

function lifecycleUnderwritingComplete(a) {
  return !!a.lifecycleManaged && (
    ['Operations Review', 'Sanction Review', 'Sanctioned', 'Disbursement', 'Active Loan'].includes(a.status) ||
    ['operations', 'sanction', 'post-sanction', 'lms', 'active'].includes(a.lifecycle?.stage)
  );
}
function displayedUWStatus(a) {
  return lifecycleUnderwritingComplete(a) ? 'Approved' : v7UW[a.id].status;
}
function renderUnderwriting() {
  v7ActivateNav('underwriting'); setPage('Underwriting', 'Enterprise Core / Underwriting');
  const pending = applications.filter(a => displayedUWStatus(a) === 'Pending').length;
  const queries = applications.filter(a => displayedUWStatus(a) === 'Query').length;
  const approved = applications.filter(a => displayedUWStatus(a) === 'Approved').length;
  $('#content').innerHTML = `${v7Hero('FINAL CREDIT JUDGEMENT', 'Underwriting Workbench', 'Bring bureau, financials, technical, legal, RCU and policy deviations into one final credit decision workspace.', [['Pending', pending], ['Queries', queries], ['Approved', approved], ['Decision', 'Approve / Reject / Query']])}<div class="v7-panel"><div class="table-wrap"><table><thead><tr><th>Case</th><th>Customer</th><th>Product</th><th>Bureau</th><th>Technical</th><th>Legal</th><th>RCU</th><th>UW Status</th><th></th></tr></thead><tbody>${applications.map(a => { const demoOnly = isDemoWorkflowCase(a); return `<tr><td><b>${a.id}</b>${demoOnly ? '<span class="badge purple" style="margin-left:5px">Demo only</span>' : ''}</td><td>${a.customer}</td><td>${a.product}</td><td>${v7Bureau[a.id].score}${demoOnly ? '<span class="badge purple" style="margin-left:5px">Synthetic</span>' : ''}</td><td>${v7Status(a.workflow.technicalStatus)}${a.workflow.technicalDemoOnly ? '<span class="badge purple" style="margin-left:5px">Demo only</span>' : ''}</td><td>${v7Status(a.workflow.legalStatus)}${a.workflow.legalDemoOnly ? '<span class="badge purple" style="margin-left:5px">Demo only</span>' : ''}</td><td>${v7Status(v7RCU[a.id].status)}${v7RCU[a.id].demoOnly ? '<span class="badge purple" style="margin-left:5px">Demo only</span>' : ''}</td><td>${v7Status(displayedUWStatus(a))}${v7UW[a.id].demoOnly ? '<span class="badge purple" style="margin-left:5px">Demo only</span>' : ''}</td><td>${lifecycleUnderwritingComplete(a) ? `<button class="more-btn" onclick="navTo('case','${a.id}')">View Case</button>` : `<button class="more-btn" onclick="openUW('${a.id}')">Underwrite</button>`}</td></tr>` }).join('')}</tbody></table></div></div>`;
}
function openUW(id) { const a = getApp(id), u = v7UW[id], b = v7Bureau[id], r = v7RCU[id], demoOnly = isDemoWorkflowCase(a); showModal(`Underwriting • ${id}`, `${demoOnly ? '<div class="notice info"><b>SYNTHETIC DEMO ONLY</b> — Bureau score, financial assessment and prior checks are illustrative placeholders. No real underwriting evidence or lending decision exists.</div><div style="height:12px"></div>' : ''}<div class="verification-grid"><div class="verification-card"><span>Bureau</span><b>${demoOnly ? 'SYNTHETIC — ' : ''}${b.score}</b></div><div class="verification-card"><span>Technical / Legal</span><b>${a.workflow.technicalStatus} / ${a.workflow.legalStatus}${demoOnly ? ' · DEMO ONLY' : ''}</b></div><div class="verification-card"><span>RCU</span><b>${r.status}${demoOnly ? ' · DEMO ONLY' : ''}</b></div></div><div style="height:12px"></div><label>Underwriter Query / Remarks<textarea id="uwRemarks" rows="4">${u.query || (demoOnly ? 'SYNTHETIC DEMO ONLY — Illustrative underwriting decision; no real bureau, financial, technical, legal or RCU evidence reviewed.' : 'Assessment completed based on available information.')}</textarea></label><div class="notice info">Recommendation: <b>${u.recommendation}</b>. Final action remains role-controlled and auditable.${demoOnly ? ' This recommendation is synthetic and not a real credit decision.' : ''}</div>`, `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="ghost-btn" onclick="uwDecision('${id}','Query')">${demoOnly ? 'Record Demo Query' : 'Raise Query'}</button><button class="danger-btn" onclick="uwDecision('${id}','Rejected')">${demoOnly ? 'Record Demo Rejection' : 'Reject'}</button><button class="primary-btn" onclick="uwDecision('${id}','Approved')">${demoOnly ? 'Record Demo Underwriting Approval' : 'Approve'}</button>`) }
function uwDecision(id, status) { const a = getApp(id), u = v7UW[id], remark = $('#uwRemarks')?.value || '', demoOnly = isDemoWorkflowCase(a); u.status = status; u.query = demoOnly && !remark.includes('SYNTHETIC DEMO ONLY') ? `SYNTHETIC DEMO ONLY — No real underwriting decision occurred.\n${remark}` : remark; if (demoOnly) u.demoOnly = true; if (status === 'Approved') { a.status = 'Sanctioned'; a.workflow.ownerRole = 'Disbursement Officer' } persistAuditV7(id, `Underwriting ${status}${demoOnly ? ' · Synthetic Demo Only' : ''}`, u.query); closeModal(); renderUnderwriting() }

function renderSanction() { v7ActivateNav('sanction'); setPage('Sanction Management', 'Enterprise Core / Sanction'); $('#content').innerHTML = `${v7Hero('CONTROLLED CREDIT OFFER', 'Sanction, Revision & Acceptance', 'Versioned sanction terms with amount, ROI, tenure, charges, CP/CS conditions, validity and customer acceptance.', [['Generated', applications.filter(a => v7Sanction[a.id].status === 'Generated').length], ['Accepted', applications.filter(a => v7Sanction[a.id].accepted).length], ['Draft', applications.filter(a => v7Sanction[a.id].status === 'Draft').length], ['Versioning', 'Enabled']])}<div class="v7-panel"><div class="table-wrap"><table><thead><tr><th>Case</th><th>Customer</th><th>Version</th><th>Sanction Amount</th><th>ROI</th><th>Tenure</th><th>Status</th><th></th></tr></thead><tbody>${applications.map(a => { const s = v7Sanction[a.id], demoOnly = isDemoWorkflowCase(a); return `<tr><td><b>${a.id}</b>${demoOnly ? '<span class="badge purple" style="margin-left:5px">Demo only</span>' : ''}</td><td>${a.customer}</td><td>v${s.version}</td><td>${money(s.amount)}</td><td>${s.roi}%</td><td>${s.tenure}M</td><td>${v7Status(s.status)}${s.demoOnly ? '<span class="badge purple" style="margin-left:5px">Demo only</span>' : ''}</td><td><button class="more-btn" onclick="openSanction('${a.id}')">Open</button></td></tr>` }).join('')}</tbody></table></div></div>` }
function openSanction(id) { const a = getApp(id), s = v7Sanction[id], demoOnly = isDemoWorkflowCase(a); showModal(`Sanction Terms • ${id}`, `${demoOnly ? '<div class="notice info"><b>SYNTHETIC DEMO ONLY</b> — Terms and acceptance are illustrative. This is not a real credit approval or offer, and no customer has accepted it.</div><div style="height:12px"></div>' : ''}<div class="field-grid three">${f('Sanction Amount', `<input id="sanAmount" type="number" value="${s.amount}">`)}${f('ROI %', `<input id="sanRoi" type="number" step=".05" value="${s.roi}">`)}${f('Tenure', `<input id="sanTenure" type="number" value="${s.tenure}">`)}${f('Processing Fee %', `<input id="sanPF" type="number" value="${s.processingFeePct || 2}">`)}${f('Validity', `<select id="sanValidity"><option ${s.validity === '30 days' || !s.validity ? 'selected' : ''}>30 days</option><option ${s.validity === '45 days' ? 'selected' : ''}>45 days</option><option ${s.validity === '60 days' ? 'selected' : ''}>60 days</option></select>`)}${f('Repayment', `<select id="sanRep"><option ${s.repayment === 'E-Nach' || !s.repayment ? 'selected' : ''}>E-Nach</option><option ${s.repayment === 'Nach' ? 'selected' : ''}>Nach</option><option ${s.repayment === 'PDC' ? 'selected' : ''}>PDC</option><option ${s.repayment === 'NPDC' ? 'selected' : ''}>NPDC</option></select>`)}</div><label>Conditions Precedent<textarea id="sanCP" rows="3">${losEscapeHtml(s.conditionsPrecedent || 'Technical and legal to be positive; KYC and mandate to be complete.')}</textarea></label><label>Conditions Subsequent<textarea id="sanCS" rows="2">${losEscapeHtml(s.conditionsSubsequent || 'Post-disbursement security documents as applicable.')}</textarea></label><div class="notice info">Current status: <b>${s.status}</b> • Version ${s.version}</div>`, `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="ghost-btn" onclick="reviseSanction('${id}')">Save Revised Version</button><button class="primary-btn" onclick="generateSanction('${id}')">${demoOnly ? 'Simulate Demo Sanction & Acceptance' : 'Generate / Accept'}</button>`) }
function readSanctionTerms() {
  const terms = {
    amount:Number($('#sanAmount')?.value),
    roi:Number($('#sanRoi')?.value),
    tenure:Number($('#sanTenure')?.value),
    processingFeePct:Number($('#sanPF')?.value),
    validity:$('#sanValidity')?.value || '',
    repayment:$('#sanRep')?.value || '',
    conditionsPrecedent:$('#sanCP')?.value || '',
    conditionsSubsequent:$('#sanCS')?.value || ''
  };
  if (!Number.isSafeInteger(terms.amount) || terms.amount <= 0) return showToast('Enter a valid whole-rupee sanction amount.'), null;
  if (!Number.isFinite(terms.roi) || terms.roi <= 0 || terms.roi > 100) return showToast('Enter a valid ROI greater than 0% and no more than 100%.'), null;
  if (!Number.isSafeInteger(terms.tenure) || terms.tenure < 1 || terms.tenure > 360) return showToast('Enter a tenure between 1 and 360 months.'), null;
  if (!Number.isFinite(terms.processingFeePct) || terms.processingFeePct < 0 || terms.processingFeePct > 100) return showToast('Enter a processing fee between 0% and 100%.'), null;
  if (!['30 days','45 days','60 days'].includes(terms.validity)) return showToast('Select a valid sanction validity period.'), null;
  if (!['E-Nach','Nach','PDC','NPDC'].includes(terms.repayment)) return showToast('Select a valid repayment method.'), null;
  return terms;
}
function reviseSanction(id) {
  const a = getApp(id), s = v7Sanction[id], terms = readSanctionTerms();
  if (!a || !s || !terms) return;
  Object.assign(s, terms, { version:s.version + 1, status:'Generated', accepted:false });
  persistAuditV7(id, 'Sanction Revised', `Version ${s.version}`);
  closeModal();
  renderSanction();
}
function generateSanction(id) {
  const a = getApp(id), s = v7Sanction[id], terms = readSanctionTerms();
  if (!a || !s || !terms) return;
  Object.assign(s, terms, { status:'Accepted', accepted:true });
  const demoOnly = isDemoWorkflowCase(a);
  if (demoOnly) {
    s.demoOnly = true;
    s.acceptanceMode = 'Synthetic demo only — no real customer action';
  }
  a.status = 'Sanctioned';
  a.workflow.eSignStatus = 'Pending';
  persistAuditV7(id, `Sanction Accepted${demoOnly ? ' · Synthetic Demo Only' : ''}`, `v${s.version} ${money(s.amount)}${demoOnly ? ' · No real offer or customer acceptance' : ''}`);
  closeModal();
  renderSanction();
}

function renderTaskSLA() { v7ActivateNav('taskSla'); setPage('Task & SLA Engine', 'Enterprise Platform / Tasks'); const visible = currentUser.role === 'CEO' || currentUser.role === 'System Admin' ? v7Tasks : v7Tasks.filter(t => t.ownerRole === currentUser.role); $('#content').innerHTML = `${v7Hero('WORK ORCHESTRATION', 'Task & SLA Engine', 'Every meaningful workflow action becomes an assigned task with owner, priority, due time, SLA, escalation and completion evidence.', [['Open', visible.filter(t => t.status === 'Open').length], ['In Progress', visible.filter(t => t.status === 'In Progress').length], ['Waiting', visible.filter(t => t.status === 'Waiting').length], ['Critical', visible.filter(t => t.priority === 'Critical' && t.status !== 'Completed').length]])}<div class="page-head"><div></div><button class="primary-btn" onclick="createTaskModal()">+ Create Task</button></div><div class="v7-panel"><div class="table-wrap"><table><thead><tr><th>Task ID</th><th>Lead / Application</th><th>Customer</th><th>Task</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>SLA</th><th>Due</th><th></th></tr></thead><tbody>${visible.map(t => `<tr><td><b>${t.id}</b></td><td>${t.caseId || '—'}</td><td>${t.customer || (typeof getApp === 'function' && getApp(t.caseId)?.customer) || '—'}</td><td>${t.type}</td><td>${t.owner || roleMeta(t.ownerRole).name} <span class="muted">(${t.ownerRole})</span></td><td>${v7Status(t.priority)}</td><td>${v7Status(t.status)}</td><td><b>${t.sla}</b></td><td>${t.due}</td><td><button class="more-btn" onclick="taskAction('${t.id}')">Open</button></td></tr>`).join('')}</tbody></table></div></div>`; updateV7Badges() }
function createTaskModal() { showModal('Create Workflow Task', `${f('Case', `<select id="taskCase">${applications.map(a => `<option>${a.id}</option>`).join('')}</select>`)}${f('Task Type', `<input id="taskType" value="Customer clarification">`)}${f('Assign Role', `<select id="taskRole">${Object.keys(ORG_ROLES).map(r => `<option>${r}</option>`).join('')}</select>`)}${f('Priority', `<select id="taskPriority"><option>Normal</option><option>High</option><option>Critical</option></select>`)}`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="saveNewTask()">Create Task</button>`) }
function saveNewTask() { const role = $('#taskRole').value; v7Tasks.unshift({ id: `TSK-${10020 + v7Tasks.length + 1}`, caseId: $('#taskCase').value, type: $('#taskType').value, ownerRole: role, owner: roleMeta(role).name, priority: $('#taskPriority').value, status: 'Open', sla: '04:00:00', due: 'Today +4h', source: 'Manual' }); persistV7Tasks(); closeModal(); renderTaskSLA(); showToast('Task created') }
function taskAction(id) { const t = v7Tasks.find(x => x.id === id); showModal(`Task • ${id}`, `<div class="modal-kv"><div><span>Type</span><b>${t.type}</b></div><div><span>Case</span><b>${t.caseId || '—'}</b></div><div><span>Owner</span><b>${t.ownerRole}</b></div><div><span>Priority</span><b>${t.priority}</b></div><div><span>Status</span><b>${t.status}</b></div><div><span>SLA</span><b>${t.sla}</b></div></div><label>Completion Evidence / Remarks<textarea id="taskRemark" rows="3">Task reviewed.</textarea></label>`, `<button class="ghost-btn" onclick="closeModal()">Close</button>${t.status !== 'Completed' ? `<button class="ghost-btn" onclick="setTaskStatus('${id}','In Progress')">Start</button><button class="danger-btn" onclick="escalateTask('${id}')">Escalate</button><button class="primary-btn" onclick="setTaskStatus('${id}','Completed')">Complete</button>` : ''}`) }
function setTaskStatus(id, status) { const t = v7Tasks.find(x => x.id === id); t.status = status; persistV7Tasks(); closeModal(); renderTaskSLA(); showToast(`Task ${status}`) }
function escalateTask(id) { const t = v7Tasks.find(x => x.id === id); const mgr = roleMeta(t.ownerRole).manager; if (mgr) { t.ownerRole = mgr; t.owner = roleMeta(mgr).name; t.priority = 'Critical' } persistV7Tasks(); closeModal(); renderTaskSLA(); showToast(`Task escalated to ${mgr || 'manager'}`) }

function renderPDDCollateral() { v7ActivateNav('pddCollateral'); setPage('PDD & Collateral', 'Enterprise Platform / PDD'); $('#content').innerHTML = `${v7Hero('POST-DISBURSEMENT CONTROL', 'PDD, Security & Collateral Custody', 'Track pending post-disbursement documents, original security documents, vault custody, inward/outward movement and release.', [['Pending Items', Object.values(v7PDD).flatMap(x => x.items).filter(i => i.status !== 'Received').length], ['Vaulted', Object.values(v7PDD).filter(x => x.vault !== 'Not Stored').length], ['Applications', applications.length], ['Custody', 'Versioned']])}<div class="v7-panel"><div class="table-wrap"><table><thead><tr><th>Case</th><th>Customer</th><th>Product</th><th>PDD Received</th><th>Pending</th><th>Vault</th><th></th></tr></thead><tbody>${applications.map(a => { const p = v7PDD[a.id], rec = p.items.filter(i => i.status === 'Received').length; return `<tr><td><b>${a.id}</b></td><td>${a.customer}</td><td>${a.product}</td><td>${rec}/${p.items.length}</td><td>${p.items.length - rec}</td><td>${p.vault}</td><td><button class="more-btn" onclick="openPDD('${a.id}')">Open</button></td></tr>` }).join('')}</tbody></table></div></div>` }
function openPDD(id) { const a = getApp(id), p = v7PDD[id]; showModal(`PDD & Custody • ${id}`, `<div class="ops-checklist">${p.items.map((x, i) => `<label class="ops-check"><input type="checkbox" class="pdd-check" data-i="${i}" ${x.status === 'Received' ? 'checked' : ''}>${x.name}</label>`).join('')}</div><div style="height:10px"></div>${f('Vault / Custody Location', `<input id="pddVault" value="${p.vault}">`)}<div class="notice info">Original document movement should be maker-checker controlled in production and tied to a custody movement log.</div>`, `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="primary-btn" onclick="savePDD('${id}')">Save Custody</button>`) }
function savePDD(id) { const p = v7PDD[id]; $$('.pdd-check').forEach(c => p.items[+c.dataset.i].status = c.checked ? 'Received' : 'Pending'); p.vault = $('#pddVault').value; persistAuditV7(id, 'PDD / Collateral Custody Updated', p.vault); closeModal(); renderPDDCollateral() }

function renderPartners() { v7ActivateNav('partners'); setPage('Partner Network', 'Enterprise Platform / Partners'); $('#content').innerHTML = `${v7Hero('ECOSYSTEM MANAGEMENT', 'Dealer, DSA, EPC & Verification Partners', 'Onboard, empanel, monitor and control sourcing/verification partners with performance, status and risk visibility.', [['Partners', v7Partners.length], ['Active', v7Partners.filter(p => p.status === 'Active').length], ['Under Review', v7Partners.filter(p => p.status !== 'Active').length], ['Avg Rating', (v7Partners.reduce((s, p) => s + p.rating, 0) / v7Partners.length).toFixed(1)]])}<div class="page-head"><div></div><button class="primary-btn" onclick="addPartnerModal()">+ Onboard Partner</button></div><div class="v7-module-grid">${v7Partners.map(p => `<button class="v7-module-card" onclick="openPartner('${p.id}')"><div class="v7-module-icon">${p.type === 'Dealer' ? '🏍' : p.type === 'EPC Vendor' ? '☀' : p.type.includes('Legal') ? '§' : p.type.includes('Technical') ? '⌖' : '♢'}</div><b>${p.name}</b><span>${p.type} • ${p.city}</span><div style="height:9px"></div>${v7Status(p.status)}<span>${p.cases} cases • ${p.conversion}% conversion • ★${p.rating}</span></button>`).join('')}</div>` }
function addPartnerModal() { showModal('Onboard Partner', `${f('Partner Type', `<select id="partnerType"><option>Dealer</option><option>DSA</option><option>EPC Vendor</option><option>Legal Panel</option><option>Technical Agency</option></select>`)}${f('Name', `<input id="partnerName">`)}${f('City', `<input id="partnerCity" value="Jaipur">`)}`, `<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="savePartner()">Create Partner</button>`) }
function savePartner() { v7Partners.push({ id: `PTR-${String(v7Partners.length + 1).padStart(3, '0')}`, type: $('#partnerType').value, name: $('#partnerName').value || 'New Partner', city: $('#partnerCity').value, status: 'Under Review', rating: 0, cases: 0, conversion: 0 }); closeModal(); renderPartners(); showToast('Partner created in onboarding') }
function openPartner(id) { const p = v7Partners.find(x => x.id === id); showModal(`Partner 360 • ${p.name}`, `<div class="modal-kv"><div><span>Type</span><b>${p.type}</b></div><div><span>City</span><b>${p.city}</b></div><div><span>Status</span><b>${p.status}</b></div><div><span>Rating</span><b>${p.rating}</b></div><div><span>Cases</span><b>${p.cases}</b></div><div><span>Conversion</span><b>${p.conversion}%</b></div></div>`, `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="${p.status === 'Active' ? 'danger-btn' : 'primary-btn'}" onclick="togglePartner('${id}')">${p.status === 'Active' ? 'Suspend' : 'Activate'}</button>`) }
function togglePartner(id) { const p = v7Partners.find(x => x.id === id); p.status = p.status === 'Active' ? 'Suspended' : 'Active'; closeModal(); renderPartners(); showToast(`Partner ${p.status}`) }

function renderAuditCompliance() { v7ActivateNav('auditCompliance'); setPage('Audit & Compliance', 'Enterprise Platform / Audit'); const cons = v7Customers.flatMap(c => Object.entries(c.consent).map(([k, v]) => ({ customer: c.name, type: k, status: v ? 'Granted' : 'Pending' }))); $('#content').innerHTML = `${v7Hero('CONTROL & TRACEABILITY', 'Audit, Consent & Compliance', 'Immutable operational history, consent ledger, data access visibility and compliance control status.', [['Audit Events', auditEvents.length], ['Consent Records', cons.length], ['Pending Consent', cons.filter(c => c.status === 'Pending').length], ['Mode', 'Read-only audit']])}<div class="v7-grid equal">${v7Panel('CONSENT LEDGER', 'Customer Consent', 'Purpose-specific consent records.', cons.slice(0, 12).map(c => `<div class="v7-consent"><div><b>${c.customer}</b><span>${c.type.toUpperCase()} consent</span></div>${v7Status(c.status)}</div>`).join(''))}${v7Panel('COMPLIANCE', 'Control Health', 'Illustrative control status for the prototype.', `<div class="v7-health"><div class="v7-health-card"><span>RBAC / ABAC</span><b>Configured</b><small>Server enforcement required in production</small></div><div class="v7-health-card"><span>PII Masking</span><b>Policy Ready</b><small>Field-level implementation required</small></div><div class="v7-health-card"><span>Maker Checker</span><b>Designed</b><small>Financial commands require dual control</small></div><div class="v7-health-card"><span>Audit</span><b>Event Based</b><small>Immutable log in production</small></div><div class="v7-health-card"><span>AML / PEP</span><b>Integration Slot</b><small>Provider required</small></div><div class="v7-health-card"><span>Data Residency</span><b>India Region</b><small>Architecture constraint</small></div></div>`)}</div><div style="height:14px"></div>${v7Panel('AUDIT TRAIL', 'Recent Workflow Events', 'Who changed what, when and why.', auditEvents.length ? `<div class="table-wrap"><table><thead><tr><th>Time</th><th>Case</th><th>Action</th><th>User / Role</th><th>Details</th></tr></thead><tbody>${auditEvents.slice(0, 30).map(e => `<tr><td>${e.at}</td><td>${e.caseId}</td><td><b>${e.action}</b></td><td>${e.user} • ${e.by}</td><td>${e.details || '—'}</td></tr>`).join('')}</tbody></table></div>` : '<div class="v7-empty">Workflow audit events will appear here as you use the prototype.</div>')}` }

function renderConfigStudio() {
  v7ActivateNav('configStudio'); setPage('Configuration Studio', 'Enterprise Platform / Configuration'); $('#content').innerHTML = `${v7Hero('NO-CODE BUSINESS CONFIGURATION', 'Configuration Studio', 'Manage products, schemes, fields, document checklists, policy rules, approval matrices, SLA and notification policies without changing UI code.', [['Products', '4'], ['BRE Rules', v7Rules.length], ['Document Types', docChecklist.length], ['Roles', Object.keys(ORG_ROLES).length]])}<div class="v7-module-grid">${[
    ['Product Studio', 'Fields, workflow, ROI, tenure, LTV and charges', 'product'], ['Scheme Manager', 'Product schemes and effective dates', 'scheme'], ['Document Matrix', 'Checklist by product / applicant type', 'docs'], ['BRE Rules', 'Credit rules and outcomes', 'rules'], ['Approval Matrix', 'Deviation and sanction authorities', 'approval'], ['SLA & Escalation', 'Task deadlines and escalation chains', 'sla'], ['Notification Rules', 'SMS / Email / WhatsApp / In-app', 'notify'], ['Workflow Designer', 'States, transitions and gateways', 'workflow']].map(([t, d, k]) => `<button class="v7-module-card" onclick="openConfig('${k}')"><div class="v7-module-icon">⚙</div><b>${t}</b><span>${d}</span></button>`).join('')}</div><div style="height:14px"></div>${v7Panel('FLOW COVERAGE', 'Enterprise Process Coverage', 'Cross-check of key workflow controls implemented in this prototype.', `<div class="table-wrap"><table><thead><tr><th>Capability</th><th>Prototype</th><th>Production Requirement</th></tr></thead><tbody>${[
      ['CRM → LOS state transition', 'Covered', 'Persisted workflow service'], ['KYC + document versioning', 'Covered', 'DMS + verification APIs'], ['Bureau / Banking intelligence', 'Covered', 'Provider integrations + consent'], ['BRE / deviations', 'Covered', 'DMN / rules service'], ['Parallel Technical + Legal', 'Covered', 'Workflow orchestration'], ['Universal tasks / SLA', 'Covered', 'Durable task engine'], ['Send Back / correction', 'Covered', 'Field-level evidence + review'], ['Underwriting / Sanction', 'Covered', 'Authority matrix + maker checker'], ['DO → Central Ops → Deal → LMS', 'Covered', 'Payment + LMS idempotent APIs'], ['100M-user scale architecture', 'Designed', 'Distributed cloud infrastructure']].map(r => `<tr><td><b>${r[0]}</b></td><td>${v7Status(r[1])}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>`)}`
}
function openConfig(k) { if (k === 'rules') { showModal('BRE Rule Configuration', `${v7Rules.map(r => `<div class="v7-rule"><span class="code">${r.id}</span><div><b>${r.condition}</b><span>${r.product}</span></div><div><b>${r.action}</b><span>${r.authority}</span></div>${v7Status(r.active ? 'Active' : 'Disabled')}</div>`).join('')}<div style="height:10px"></div>${f('New Rule Condition', `<input id="newRuleCondition" placeholder="e.g. FOIR > 60%">`)}${f('Action', `<select id="newRuleAction"><option>Deviation</option><option>Decline</option><option>Refer</option><option>Hold</option></select>`)}`, `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="primary-btn" onclick="addRule()">Add Rule</button>`); return } showModal('Configuration Module', `<div class="notice info">${k.toUpperCase()} configuration is represented as a no-code administration module in this prototype. Production implementation should version every change with maker-checker and effective dates.</div><div style="height:12px"></div><div class="v7-commandbar"><button onclick="showToast('Draft configuration created')">Create Draft</button><button onclick="showToast('Configuration validated')">Validate</button><button class="primary" onclick="showToast('Change submitted for maker-checker approval')">Submit for Approval</button></div>`, `<button class="ghost-btn" onclick="closeModal()">Close</button>`) }
function addRule() { v7Rules.push({ id: `BRE-${String(v7Rules.length + 1).padStart(3, '0')}`, product: 'All', condition: $('#newRuleCondition').value || 'New policy condition', action: $('#newRuleAction').value, authority: 'ZCM', active: true }); closeModal(); renderConfigStudio(); showToast('Rule added') }

function renderIntegrationHub() { v7ActivateNav('integrationHub'); setPage('Integration Hub', 'Enterprise Platform / Integrations'); $('#content').innerHTML = `${v7Hero('API ORCHESTRATION', 'Integration Hub', 'One operational view for bureau, KYC, Account Aggregator, eSign, mandate, bank payout and LMS connectivity with retries and health.', [['Healthy', v7Integrations.filter(x => x.status === 'Healthy').length], ['Degraded', v7Integrations.filter(x => x.status === 'Degraded').length], ['Avg Success', (v7Integrations.reduce((s, x) => s + x.success, 0) / v7Integrations.length).toFixed(2) + '%'], ['Pattern', 'Async + Idempotent']])}<div class="v7-module-grid">${v7Integrations.map((x, i) => `<button class="v7-module-card" onclick="openIntegration(${i})"><div class="v7-module-icon">⇆</div><b>${x.name}</b><span>${x.category} • ${x.latency}</span><div style="height:8px"></div>${v7Status(x.status)}<span>${x.success}% success • checked ${x.last}</span></button>`).join('')}</div>` }
function openIntegration(i) { const x = v7Integrations[i]; showModal(`Integration • ${x.name}`, `<div class="modal-kv"><div><span>Category</span><b>${x.category}</b></div><div><span>Status</span><b>${x.status}</b></div><div><span>Latency</span><b>${x.latency}</b></div><div><span>Success Rate</span><b>${x.success}%</b></div></div><div style="height:12px"></div><div class="notice info">Production contract should include timeout, retry policy, circuit breaker, idempotency key, request/response audit and manual override path.</div>`, `<button class="ghost-btn" onclick="closeModal()">Close</button><button class="ghost-btn" onclick="testIntegration(${i})">Test Connection</button><button class="primary-btn" onclick="retryIntegration(${i})">Retry / Recover</button>`) }
function testIntegration(i) { v7Integrations[i].last = 'Just now'; showToast(`${v7Integrations[i].name} connectivity test passed`) }
function retryIntegration(i) { v7Integrations[i].status = 'Healthy'; v7Integrations[i].latency = '245 ms'; v7Integrations[i].success = Math.max(99.2, v7Integrations[i].success); closeModal(); renderIntegrationHub(); showToast('Integration recovered') }

function renderPlatformArchitecture() { v7ActivateNav('platformArchitecture'); setPage('Platform Architecture', 'Enterprise Platform / Architecture'); $('#content').innerHTML = `${v7Hero('100M+ CUSTOMER READY DESIGN', 'Enterprise Scale Architecture', 'Reference architecture for up to 10 crore registered customer identities using horizontal scaling, domain services, event-driven orchestration and independent data planes.', [['Customer Scale', '100M+'], ['API Target', '25k–100k RPS'], ['Events', '100k+/sec scalable'], ['Availability', '99.95–99.99%']])}<div class="v7-panel"><div class="v7-panel-head"><div><span class="overline">REFERENCE ARCHITECTURE</span><h3>Layered Platform Design</h3><p>The current file is a front-end prototype; this is the production target architecture represented inside the application.</p></div></div><div class="v7-arch"><div class="v7-arch-row">${[['Web / Mobile', 'Customer + Staff'], ['Partner Apps', 'Dealer / DSA / EPC'], ['CDN + WAF', 'Edge protection'], ['API Gateway', 'Auth + routing'], ['BFF Layer', 'Role optimized APIs']].map(x => `<div class="v7-arch-box"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div><div class="v7-arch-arrow">↓</div><div class="v7-arch-row">${[['CRM Service', 'Lead / opportunity'], ['Customer Service', 'Customer 360'], ['LOS Service', 'Application'], ['Credit Service', 'CAM / decisions'], ['Document Service', 'Metadata / DMS']].map(x => `<div class="v7-arch-box"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div><div class="v7-arch-row">${[['Verification', 'Technical / Legal / RCU'], ['Sanction', 'Terms / acceptance'], ['Operations', 'DO / central ops'], ['Payment', 'Disbursement'], ['Deal + LMS', 'Loan handoff']].map(x => `<div class="v7-arch-box"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div><div class="v7-arch-arrow">↓</div><div class="v7-arch-row">${[['Workflow', 'Temporal / Camunda'], ['Rules Engine', 'DMN / BRE'], ['Task + SLA', 'Durable queues'], ['Event Bus', 'Kafka equivalent'], ['IAM', 'OIDC / MFA / ABAC']].map(x => `<div class="v7-arch-box"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div><div class="v7-arch-arrow">↓</div><div class="v7-arch-row">${[['Transactional DB', 'Postgres / distributed'], ['Cache', 'Redis cluster'], ['Search', 'OpenSearch'], ['Object Storage', 'Documents'], ['Lakehouse', 'Analytics / MIS']].map(x => `<div class="v7-arch-box"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div></div></div><div style="height:14px"></div><div class="v7-grid equal">${v7Panel('DATA STRATEGY', 'Partition & Storage', 'Separate transactional domains and keep documents out of the database.', `<div class="v7-chip-set">${['Customer DB', 'Application DB', 'Workflow DB', 'Task DB', 'Credit DB', 'Payment DB', 'Deal DB', 'Audit Store', 'Object Storage', 'Analytics Lake'].map(x => `<span class="v7-chip">${x}</span>`).join('')}</div><div style="height:12px"></div><div class="notice info">Partition by stable customer/application identifiers, not branch, to avoid geographic hot partitions.</div>`)}${v7Panel('RELIABILITY', 'Critical Platform Controls', 'Patterns required before real production deployment.', `<div class="ops-checklist">${['Multi-AZ deployment', 'India DR region', 'Idempotency for financial commands', 'Circuit breakers / retries', 'Point-in-time recovery', 'OpenTelemetry tracing', 'KMS / secrets management', 'Immutable audit', 'Rate limiting / WAF', 'Load & chaos testing'].map(x => `<label class="ops-check"><input type="checkbox" checked disabled>${x}</label>`).join('')}</div>`)}</div><div style="height:14px"></div>${v7Panel('EVENT MODEL', 'Core Lending Events', 'Loose coupling between domains through business events.', `<div class="v7-chip-set">${['LeadCreated', 'ApplicationCreated', 'KYCCompleted', 'BureauFetched', 'CreditVerified', 'DeviationRaised', 'TechnicalCompleted', 'LegalCompleted', 'RCUCleared', 'UnderwritingApproved', 'SanctionAccepted', 'ESignCompleted', 'CaseSentBack', 'CorrectionCompleted', 'DOCompleted', 'DisbursementCompleted', 'DealCreated', 'LMSAccountCreated'].map(x => `<span class="v7-chip active">${x}</span>`).join('')}</div>`)}` }

// Upgrade CEO quick access: add enterprise modules without replacing personalization
const _renderCEOv7 = renderCEOPersonalizedDashboard;
renderCEOPersonalizedDashboard = function () { _renderCEOv7(); const c = $('#content'); if (!c) return; const block = document.createElement('div'); block.innerHTML = `<div style="height:14px"></div>${v7Panel('ENTERPRISE OS', 'Executive Drill-down Modules', 'Direct access to decisioning, risk, customer and platform control.', `<div class="v7-module-grid">${[['Customer 360', 'customer360', 'Unified customer risk'], ['Credit Engine', 'creditEngine', 'BRE & deviations'], ['RCU / Fraud', 'rcu', 'Risk control'], ['Underwriting', 'underwriting', 'Final credit judgement'], ['Sanction', 'sanction', 'Terms & acceptance'], ['Task / SLA', 'taskSla', 'Organization work engine'], ['Audit / Compliance', 'auditCompliance', 'Control & consent'], ['Platform Architecture', 'platformArchitecture', '100M+ scale design']].map(x => `<button class="v7-module-card" onclick="navTo('${x[1]}')"><div class="v7-module-icon">⬡</div><b>${x[0]}</b><span>${x[2]}</span></button>`).join('')}</div>`)} `; c.appendChild(block.firstElementChild); applyRoleAccess(); updateV7Badges() }

// Add Case 360 enterprise readiness section after existing V6 workflow injection
const _injectWorkflowV6 = injectWorkflow360;
injectWorkflow360 = function (id) { _injectWorkflowV6(id); const a = getApp(id), c = getCustomerByApp(id); if (!a || !c) return; const content = $('#content'); const e = document.createElement('div'); e.innerHTML = `<div style="height:14px"></div>${v7Panel('CASE 360', 'Enterprise Readiness Snapshot', 'Single view of all mandatory domains before a case can reach final disbursement.', `<div class="v7-health"><div class="v7-health-card"><span>KYC</span><b>${v7Kyc[id].status}</b><small>${c.dedupe}</small></div><div class="v7-health-card"><span>Banking</span><b>${v7Banking[id].consent}</b><small>ABB ${money(v7Banking[id].abb)}</small></div><div class="v7-health-card"><span>Bureau</span><b>${v7Bureau[id].score}</b><small>DPD ${v7Bureau[id].dpd}</small></div><div class="v7-health-card"><span>RCU</span><b>${v7RCU[id].status}</b><small>Risk ${v7RCU[id].risk}/100</small></div><div class="v7-health-card"><span>Underwriting</span><b>${displayedUWStatus(a)}</b><small>${v7UW[id].recommendation}</small></div><div class="v7-health-card"><span>Sanction</span><b>${v7Sanction[id].status}</b><small>v${v7Sanction[id].version}</small></div></div><div style="height:10px"></div><div class="v7-commandbar"><button onclick="navTo('customer360','${id}')">Customer 360</button><button onclick="navTo('bureau')">Bureau</button><button onclick="navTo('creditEngine')">BRE</button><button onclick="navTo('rcu')">RCU</button><button onclick="navTo('underwriting')">Underwriting</button><button class="primary" onclick="navTo('sanction')">Sanction</button></div>`)}`; content.appendChild(e.firstElementChild) }

// Global search can locate customer IDs as well
$('#globalSearch')?.addEventListener('keyup', e => { if (e.key === 'Enter') { const q = e.target.value.toLowerCase(); const c = v7Customers.find(x => (x.id + x.name + x.mobile + x.pan).toLowerCase().includes(q)); if (c) { renderCustomer360(c.id); e.stopImmediatePropagation() } } }, true);

setTimeout(() => { applyRoleAccess(); updateV7Badges() }, 50);

/* V7 premium operational dashboard for non-CEO roles */
const _renderRoleDashboardV6 = renderRoleDashboard;
renderRoleDashboard = function () {
  setPage(`${currentUser.role} Workspace`, `${currentUser.dept} / My Work`);
  const lobby = visibleLobbyCases();
  const myTasks = v7Tasks.filter(t => t.ownerRole === currentUser.role && t.status !== "Completed");
  const sb = sendBackTasks.filter(t => t.status === "Open" && t.targetRole === currentUser.role);
  const approvals = applications.filter(a => a.workflow?.approval?.status === "Pending" && a.workflow.approval.requiredRole === currentUser.role);
  const accessible = [
    ['customer360', 'Customer 360', 'Customer, exposure & relationship', '◉'],
    ['preEligibility', 'Pre-Eligibility', 'Fast product & policy fit', '◇'],
    ['kycDedupe', 'KYC & Dedupe', 'Identity and duplicate controls', '⌁'],
    ['bankingAA', 'Banking & AA', 'Cash-flow and consent analysis', '▥'],
    ['bureau', 'Credit Bureau', 'Score, tradelines and DPD', '≋'],
    ['financials', 'Financial Analysis', 'Income, FOIR and DSCR', '∑'],
    ['creditEngine', 'Credit Engine', 'BRE, policy and deviations', '⚡'],
    ['rcu', 'RCU / Fraud', 'Risk control checks', '⌕'],
    ['underwriting', 'Underwriting', 'Final credit judgement', '◆'],
    ['sanction', 'Sanction', 'Terms, revision & acceptance', '✓'],
    ['technical', 'Technical', 'Collateral verification', '⌖'],
    ['legal', 'Legal', 'Title and legal opinion', '§'],
    ['operations', 'Operations', 'Branch and central ops', '◫'],
    ['taskSla', 'Task & SLA', 'My work orchestration', '◷']
  ].filter(x => roleCanView(x[0])).slice(0, 8);
  $('#content').innerHTML = `
    ${v7Hero(`${currentUser.dept.toUpperCase()} • ROLE CONTROLLED`, `${currentUser.role} Workbench`, roleDashboardDescription(), [['My Tasks', myTasks.length], ['My Cases', lobby.length], ['Approvals', approvals.length], ['Send Backs', sb.length]])}
    <div class="v7-kpi-row">
      <button class="v7-kpi" onclick="navTo('taskSla')"><span class="label">My Active Tasks</span><strong>${myTasks.length}</strong><small>Work assigned by workflow and SLA engine</small></button>
      <button class="v7-kpi" onclick="navTo('lobby')"><span class="label">My Lobby</span><strong>${lobby.length}</strong><small>Cases currently owned by this designation</small></button>
      <button class="v7-kpi" onclick="navTo('approvals')"><span class="label">Approval Queue</span><strong>${approvals.length}</strong><small>Hierarchy deviations requiring decision</small></button>
      <button class="v7-kpi" onclick="navTo('sendBack')"><span class="label">Correction Tasks</span><strong>${sb.length}</strong><small>Send-back items requiring correction</small></button>
      <button class="v7-kpi" onclick="navTo('applications')"><span class="label">Visible Portfolio</span><strong>${applications.length}</strong><small>Subject to hierarchy and record access</small></button>
    </div>
    <div class="v7-grid">
      ${v7Panel('MY WORK', 'Priority Queue', 'What this user should work on now.', myTasks.length ? `<div class="v7-data-list">${myTasks.slice(0, 6).map(t => `<div class="v7-data-row"><div><b>${t.type}</b><small>${t.id} • ${t.caseId}</small></div><div class="v7-stat">Priority<br><strong>${t.priority}</strong></div><div class="v7-stat">SLA<br><strong>${t.sla}</strong></div><button class="more-btn" onclick="taskAction('${t.id}')">Work →</button></div>`).join('')}</div>` : `<div class="v7-empty">No active workflow tasks assigned to this role.</div>`, `<button class="mini-link" onclick="navTo('taskSla')">All tasks →</button>`)}
      ${v7Panel('HIERARCHY', 'Position & Authority', 'Operational ownership stays with worker roles; managers receive visibility and routed approvals.', `${renderCurrentHierarchy()}<div style="height:12px"></div><div class="notice info">Logged in as <b>${currentUser.role}</b>. Module, record and action visibility are role controlled in this prototype.</div>`)}
    </div>
    ${v7Panel('ROLE MODULES', 'Quick Access', 'Only modules available to this designation are shown.', `<div class="v7-module-grid">${accessible.map(x => `<button class="v7-module-card" onclick="navTo('${x[0]}')"><div class="v7-module-icon">${x[3]}</div><b>${x[1]}</b><span>${x[2]}</span></button>`).join('')}</div>`)}
    <div style="height:14px"></div>
    ${v7Panel('END-TO-END JOURNEY', 'Where your work fits', 'The platform controls movement through gates rather than allowing users to skip stages.', `<div class="v7-stepper">${['CRM / Lead', 'LOS / KYC', 'Credit / Bureau', 'Technical + Legal + RCU', 'Underwriting', 'Sanction / eSign', 'Operations', 'Disbursement / LMS'].map((s, i) => `<div class="v7-step ${i < 3 ? 'done' : i === 3 ? 'current' : ''}"><div class="v7-step-card"><div class="v7-step-dot">${i < 3 ? '✓' : i + 1}</div><b>${s}</b><span>${i === 3 ? 'Parallel gateway' : 'Controlled stage'}</span></div>${i < 7 ? '<div class="v7-step-line"></div>' : ''}</div>`).join('')}</div>`)}
  `;
  applyRoleAccess(); updateV7Badges();
};


/* V7 dashboard presentation helpers — no workflow/state-machine changes */
function nfSetCeoPeriod(v) { window.nfCeoPeriod = v; renderCEOPersonalizedDashboard() }
function nfSetCeoProduct(v) { ceoPrefs.product = v; localStorage.setItem("skf_ceo_dashboard_prefs", JSON.stringify(ceoPrefs)); renderCEOPersonalizedDashboard() }
function nfSetCeoBranch(v) { window.nfCeoBranch = v; renderCEOPersonalizedDashboard() }
function nfFunnelDrill(stage) {
  if (stage === "Leads") return navTo("crm");
  if (stage === "Login") return navTo("applications");
  if (stage === "Credit") return navTo("credit");
  if (stage === "Sanction") return navTo("sanction");
  return navTo("disbursement");
}
function nfKpiCard(label, value, trend, trendMode, icon, view) {
  const good = trendMode === "up" || trendMode === "downGood";
  const arrow = trendMode === "down" || trendMode === "downGood" ? "↓" : "↑";
  return `<button class="nf-kpi-card" onclick="navTo('${view}')"><div class="nf-kpi-icon">${icon}</div><div class="nf-kpi-copy"><span>${label}</span><strong>${value}</strong><small class="${good ? "good" : "bad"}">${arrow} ${trend} <em>vs last period</em></small></div><div class="nf-spark">${[25, 42, 31, 56, 48, 72, 64, 84].map((h, i) => `<i style="height:${h / 2}px"></i>`).join("")}</div></button>`;
}
function nfPanel(title, sub, body, view) {
  return `<section class="nf-dashboard-panel"><div class="nf-panel-head"><div><h3>${title}</h3><p>${sub}</p></div><button onclick="navTo('${view}')">↗</button></div>${body}</section>`;
}












// --- PORTED CEO DASHBOARD ---

const C = { blue: 'var(--ceo-blue)', red: 'var(--ceo-red)', green: 'var(--ceo-green)', amber: 'var(--ceo-amber)', violet: 'var(--ceo-violet)', teal: 'var(--ceo-teal)', grid: 'var(--ceo-line)', muted: 'var(--ceo-muted)' };

function _lucide(name) { return `<i data-lucide="${name}"></i>`; }

function _card(title, right, content, className="") {
  return `
    <section class="ceo-card ${className}" style="box-sizing:border-box; display:flex; flex-direction:column; height:100%; min-height:300px; background:var(--ceo-card); border:1px solid var(--ceo-line); border-radius:12px; padding:24px; min-width:0;">
      <div class="ceo-card-head" style="display:flex; justify-content:space-between; align-items:center; min-height:30px; padding-bottom:16px; border-bottom:1px solid var(--ceo-line); margin-bottom:20px; gap:8px;">
        <h2 style="margin:0; font-weight:700; color:var(--ceo-ink); font-size:16px; min-width:0; white-space:normal; line-height:1.2;">${title}</h2>
        <div style="flex-shrink:0;">${right || ''}</div>
      </div>
      <div style="flex:1; display:flex; flex-direction:column; min-width:0; position:relative;">
        ${content}
      </div>
    </section>`;
}

function svgSpark(data, color, isBar) {
  if(!data || !data.length) return '';
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.9;
  const w = 120, h = 50;
  if (isBar) {
    const bw = (w / data.length) - 2;
    return `<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="display:block; overflow:visible;">` + 
      data.map((v, i) => {
        const bh = ((v - Math.min(0, min)) / (max - Math.min(0, min))) * h;
        return `<rect x="${i * (w / data.length)}" y="${h - bh}" width="${bw}" height="${bh}" fill="${color}" rx="2"/>`;
      }).join('') + `</svg>`;
  } else {
    const pts = data.map((v, i) => `${i * (w / (data.length - 1))},${h - ((v - min) / (max - min)) * h}`).join(' ');
    return `<svg width="100%" height="100%" viewBox="0 -2 ${w} ${h+4}" preserveAspectRatio="none" style="display:block; overflow:visible;">
      <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${w}" cy="${h - ((data[data.length-1] - min) / (max - min)) * h}" r="3" fill="${color}"/>
    </svg>`;
  }
}

function svgModalLineChart(data, color, width = 1000, height = 400) {
  if(!data || !data.length) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const w = Math.max(260, width), h = Math.max(240, height);
  const max = Math.max(...data) * 1.05;
  const min = Math.max(0, Math.min(...data) * 0.95);
  
  const mapY = (v) => h - ((v - min) / (max - min)) * h;
  const mapX = (i) => 70 + i * ((w - 90) / (months.length - 1));
  
  const pts = data.map((v, i) => `${mapX(i)},${mapY(v)}`).join(' ');
  
  let grids = '';
  for(let i=0; i<=5; i++){
    let val = min + (i/5)*(max-min);
    let y = mapY(val);
    grids += `<line x1="70" y1="${y}" x2="${w-20}" y2="${y}" stroke="var(--ceo-line)" stroke-dasharray="4"/>`;
    grids += `<text x="60" y="${y+4}" font-size="13" fill="var(--ceo-muted)" text-anchor="end">${val >= 1000 ? (val/1000).toFixed(2)+'k' : (val > 100 ? Math.round(val) : val.toFixed(1))}</text>`;
  }
  
  let xLabels = months.map((m, i) => ({ m, i })).filter(({ i }) => w >= 520 || i < 8 && i % 2 === 0 || i === months.length - 1).map(({ m, i }) => `<text x="${mapX(i)}" y="${h + 28}" font-size="13" fill="var(--ceo-muted)" text-anchor="middle">${m}</text>`).join('');
  
  return `<svg width="100%" height="100%" viewBox="0 -15 ${w} ${h+45}" preserveAspectRatio="none" role="img" aria-label="Historical KPI values across ten months" style="overflow:visible; display:block;">
    ${grids}
    ${xLabels}
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="3"/>
    ${data.map((v, i) => `<circle cx="${mapX(i)}" cy="${mapY(v)}" r="6" fill="${color}" stroke="#fff" stroke-width="2"/>
    ${w >= 520 || i < 8 && i % 2 === 0 || i === data.length - 1 ? `<text x="${mapX(i)}" y="${mapY(v) - 14}" font-size="11" fill="var(--ceo-ink)" text-anchor="middle" font-weight="700">${v}</text>` : ''}`).join('')}
  </svg>`;
}

function cssDonut(data, centerText, centerSub, size=180, innerSize=130) {
  const total = data.reduce((s, d) => s + d.val, 0);
  let acc = 0;
  const stops = data.map(d => {
    const start = acc;
    const pct = (d.val / total) * 100;
    acc += pct;
    return `${d.c} ${start}% ${acc}%`;
  }).join(', ');
  
  return `<div style="position:relative; width:${size}px; height:${size}px; border-radius:50%; background: conic-gradient(${stops}); display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 6px rgba(0,0,0,0.05) inset; margin:0 auto; flex-shrink:0;">
    <div style="position:absolute; width:${innerSize}px; height:${innerSize}px; background:var(--ceo-card); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <b style="font-size:20px; color:var(--ceo-ink);">${centerText}</b>
      <span style="font-size:12px; color:var(--ceo-muted); margin-top:2px;">${centerSub}</span>
    </div>
  </div>`;
}

function svgTargetActual() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const actual = [25, 38, 52, 70, 86, 101, 117, 134, 150, 168, 184, 186];
  const target = [40, 55, 70, 85, 100, 120, 140, 158, 178, 195, 210, 215];
  const proj = [null, null, null, null, null, null, null, null, null, 168, 185, 224];
  
  const w = 1000, h = 320;
  const max = 250;
  
  const mapY = (v) => h - (v / max) * h;
  const mapX = (i) => 65 + i * ((w - 75) / (months.length - 1));
  
  const actualPts = actual.map((v, i) => `${mapX(i)},${mapY(v)}`).join(' ');
  const targetPts = target.map((v, i) => `${mapX(i)},${mapY(v)}`).join(' ');
  const projPts = proj.map((v, i) => v !== null ? `${mapX(i)},${mapY(v)}` : '').filter(Boolean).join(' ');
  
  let grids = '';
  for(let i=0; i<=5; i++){
    let y = mapY(i*50);
    grids += `<line x1="65" y1="${y}" x2="${w}" y2="${y}" stroke="var(--ceo-line)" stroke-dasharray="4"/>`;
    grids += `<text x="55" y="${y+4}" font-size="13" fill="var(--ceo-muted)" text-anchor="end">${i*50} Cr</text>`;
  }
  
  let xLabels = months.map((m, i) => `<text x="${mapX(i)}" y="${h + 26}" font-size="13" fill="var(--ceo-muted)" text-anchor="middle">${m}</text>`).join('');
  
  return `<svg class="ceo-chart-svg" width="100%" height="100%" viewBox="0 -10 ${w} ${h+40}" preserveAspectRatio="none" style="overflow:visible; display:block;">
    ${grids}
    ${xLabels}
    <polyline points="${targetPts}" fill="none" stroke="var(--ceo-red)" stroke-width="3" stroke-dasharray="6"/>
    <polyline points="${projPts}" fill="none" stroke="var(--ceo-blue)" stroke-width="3" stroke-dasharray="6" opacity="0.6"/>
    <polyline points="${actualPts}" fill="none" stroke="var(--ceo-blue)" stroke-width="3.5"/>
    ${actual.map((v, i) => `<circle cx="${mapX(i)}" cy="${mapY(v)}" r="6" fill="var(--ceo-blue)" stroke="#fff" stroke-width="2"/>`).join('')}
  </svg>`;
}

function svgCollectionChart() {
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const d_due = [42, 45, 48, 52, 58, 61, 64];
  const d_col = [40, 43, 46, 50, 56, 59, 62];
  const d_eff = [95, 95.5, 95.8, 96, 96.2, 96.3, 96.4];
  
  const w = 800, h = 260;
  const maxBar = 80;
  const mapYBar = (v) => h - (v / maxBar) * h;
  const mapX = (i) => 65 + i * ((w - 85) / (months.length - 1));
  const mapYEff = (v) => h - ((v - 90) / 10) * h;
  
  let bars = d_due.map((v, i) => `<rect x="${mapX(i) - 22}" y="${mapYBar(v)}" width="20" height="${h-mapYBar(v)}" fill="var(--ceo-blue)" rx="2"/>`).join('') +
             d_col.map((v, i) => `<rect x="${mapX(i) + 2}" y="${mapYBar(v)}" width="20" height="${h-mapYBar(v)}" fill="var(--ceo-green)" rx="2"/>`).join('');
  
  const effPts = d_eff.map((v, i) => `${mapX(i)},${mapYEff(v)}`).join(' ');
  
  let grids = '';
  for(let i=0; i<=4; i++){
    let y = mapYBar(i*20);
    grids += `<line x1="65" y1="${y}" x2="${w}" y2="${y}" stroke="var(--ceo-line)" stroke-dasharray="4"/>`;
    grids += `<text x="55" y="${y+4}" font-size="13" fill="var(--ceo-muted)" text-anchor="end">${i*20}</text>`;
  }
  
  let xLabels = months.map((m, i) => `<text x="${mapX(i)}" y="${h + 26}" font-size="13" fill="var(--ceo-muted)" text-anchor="middle">${m}</text>`).join('');
  
  return `<svg class="ceo-chart-svg" width="100%" height="100%" viewBox="0 -10 ${w} ${h+40}" preserveAspectRatio="none" style="overflow:visible; display:block;">
    ${grids}
    ${bars}
    <polyline points="${effPts}" fill="none" stroke="var(--ceo-red)" stroke-width="3"/>
    ${d_eff.map((v, i) => `<circle cx="${mapX(i)}" cy="${mapYEff(v)}" r="6" fill="var(--ceo-red)" stroke="#fff" stroke-width="2"/>
    <text x="${mapX(i)}" y="${mapYEff(v) - 14}" font-size="11" fill="var(--ceo-red)" text-anchor="middle" font-weight="800">${v}%</text>
    `).join('')}
    ${xLabels}
  </svg>`;
}

function svgTatBar() {
  const data = [{ d: '< 1 Day', v: 34 }, { d: '1-2 Days', v: 28 }, { d: '2-3 Days', v: 18 }, { d: '3-5 Days', v: 14 }, { d: '> 5 Days', v: 6 }];
  const w = 600, h = 180;
  const max = 40;
  const mapY = (v) => h - (v / max) * h;
  const bw = (w / data.length) - 24;
  
  let svg = `<svg class="ceo-chart-svg" width="100%" height="100%" viewBox="0 -20 ${w} ${h+45}" preserveAspectRatio="none" style="overflow:visible; display:block;">`;
  svg += data.map((d, i) => {
    let x = i * (w / data.length) + 12;
    let y = mapY(d.v);
    let bar = `<rect x="${x}" y="${y}" width="${bw}" height="${h-y}" fill="var(--ceo-blue)" rx="4"/>`;
    let label = `<text x="${x + bw/2}" y="${h + 22}" font-size="13" fill="var(--ceo-muted)" text-anchor="middle">${d.d}</text>`;
    let val = `<text x="${x + bw/2}" y="${y - 10}" font-size="15" fill="var(--ceo-ink)" font-weight="800" text-anchor="middle">${d.v}%</text>`;
    return bar + label + val;
  }).join('');
  svg += `</svg>`;
  return svg;
}

function svgMap() {
  const w = 280, h = 240;
  return `<svg class="ceo-chart-svg ceo-map-svg" width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" style="filter:drop-shadow(0 10px 16px rgba(0,0,0,0.1)); display:block; max-width:280px; margin:0 auto;">
    <path d="M120 20 l35 15 15-5 10 20 25 5 5 25 30 5 10 25 -15 20 5 25 -25 10 -10 30 -30 5 -15-25 -30-10 -15-30 -30-5 -5-25 15-20 -20-15 5-30 25-10 15 15 z" fill="var(--ceo-blue-soft)" stroke="white" stroke-width="2"/>
    <path d="M95 65 l35-15 25 20 -5 30 20 25 -20 25 -30-5 -15-25 -25-5 5-25 z" fill="var(--ceo-blue)" stroke="white" stroke-width="2"/>
    <path d="M155 60 l35 5 5 25 -20 15 -25-15 z" fill="var(--ceo-blue-2)" stroke="white" stroke-width="2"/>
    <path d="M130 150 l30 5 15 25 -25 20 -20-20 z" fill="var(--ceo-blue-3)" stroke="white" stroke-width="2"/>
  </svg>`;
}

renderCEOPersonalizedDashboard = function() {
  if (!window.lucideLoading) {
    window.lucideLoading = true;
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/lucide@latest';
    s.onload = () => { if (window.lucide) window.lucide.createIcons(); };
    document.head.appendChild(s);
  }
  
  setPage("CEO Dashboard", "Executive / Dashboard");
  
  window.kpiData = [
    { id: 'aum', t: 'Total AUM', v: '₹1,248 Cr', d: '12.5%', up: true, c: '#2563eb', i: 'indian-rupee', tone: 'blue', desc: 'Total Assets Under Management', metrics: [['YoY Growth', '+18.4%'], ['MoM Growth', '+3.2%'], ['Target', '₹1,220 Cr'], ['Achievement', '102.3%']], chartData: [980, 1015, 1040, 1085, 1120, 1155, 1180, 1205, 1228, 1248] },
    { id: 'disb', t: 'Disbursement', v: '₹186 Cr', d: '28.4%', up: true, c: '#dc2626', i: 'receipt', tone: 'red', desc: 'Total funds disbursed to borrowers', metrics: [['MTD', '₹186 Cr'], ['Target', '₹215 Cr'], ['Achievement', '86.5%'], ['Projected', '₹224 Cr']], chartData: [112, 125, 134, 141, 150, 158, 165, 172, 179, 186] },
    { id: 'sanction', t: 'Sanctioned', v: '₹214 Cr', d: '31.2%', up: true, c: '#16a34a', i: 'badge-check', tone: 'teal', desc: 'Total loan amounts sanctioned', metrics: [['MTD', '₹214 Cr'], ['Target', '₹250 Cr'], ['Achievement', '85.6%'], ['Projected', '₹260 Cr']], chartData: [135, 148, 155, 166, 174, 181, 190, 198, 205, 214] },
    { id: 'customers', t: 'Active Customers', v: '52,318', d: '8.2%', up: true, c: '#7c3aed', i: 'users', tone: 'violet', desc: 'Total active borrowing customers', metrics: [['YoY Growth', '+15.2%'], ['New (MTD)', '+1,118'], ['Closed (MTD)', '-240'], ['Net Gain', '+878']], chartData: [42000, 43200, 44500, 45800, 47000, 48200, 49500, 50300, 51200, 52318] },
    { id: 'approval', t: 'Approval Ratio', v: '78.3%', d: '8.1%', up: true, c: '#16a34a', i: 'percent', tone: 'teal', desc: 'Percentage of applications approved', metrics: [['Total Apps', '8,214'], ['Approved', '6,431'], ['Rejected', '1,783'], ['Pending', '124']], chartData: [71, 72, 73, 74, 74.5, 75.2, 76, 76.8, 77.5, 78.3] },
    { id: 'collection', t: 'Collection Efficiency', v: '96.4%', d: '4.1%', up: true, c: '#2563eb', i: 'gauge', tone: 'blue', desc: 'Current month collection efficiency', metrics: [['Due', '₹164 Cr'], ['Collected', '₹158 Cr'], ['Efficiency', '96.4%'], ['Remaining', '₹6 Cr']], chartData: [92, 93, 93.5, 94, 94.5, 95, 95.4, 95.8, 96.1, 96.4] },
    { id: 'par', t: 'Portfolio at Risk', v: '2.6%', d: '0.8%', up: false, c: '#d97706', i: 'alert-triangle', tone: 'amber', desc: 'Percentage of portfolio at risk (PAR 30+)', metrics: [['PAR Amount', '₹32.4 Cr'], ['Total Portfolio', '₹1,248 Cr'], ['Risk Target', '< 3.0%'], ['Status', 'Healthy']], chartData: [3.4, 3.3, 3.2, 3.1, 3.0, 2.9, 2.8, 2.7, 2.65, 2.6] },
    { id: 'npa', t: 'NPA', v: '1.8%', d: '0.4%', up: false, c: '#dc2626', i: 'shield-alert', tone: 'red', desc: 'Non-Performing Assets (90+ DPD)', metrics: [['NPA Amount', '₹22.4 Cr'], ['Provisioning', '74.2%'], ['NPA Target', '< 2.0%'], ['Status', 'Healthy']], chartData: [2.4, 2.3, 2.2, 2.15, 2.1, 2.0, 1.95, 1.9, 1.85, 1.8] }
  ];

  let ceoKpiModalTrigger = null;
  let ceoKpiPreviousBodyOverflow = '';
  let ceoKpiChartResizeHandler = null;

  window.openCeoKpiModal = function(index, trigger) {
    const k = window.kpiData[index];
    if (!k) return;
    if (ceoKpiChartResizeHandler) window.removeEventListener('resize', ceoKpiChartResizeHandler);
    ceoKpiModalTrigger = trigger || document.activeElement;
    ceoKpiPreviousBodyOverflow = document.body.style.overflow;
    const modalHtml = `
      <div id="ceo-modal-backdrop" class="ceo-kpi-backdrop" onclick="closeCeoKpiModal(event)">
        <div class="ceo-modal-content" role="dialog" aria-modal="true" aria-labelledby="ceo-kpi-modal-title" aria-describedby="ceo-kpi-modal-description" tabindex="-1" onclick="event.stopPropagation()">
          
          <header class="ceo-kpi-modal-header">
            <div class="ceo-kpi-modal-identity">
              <span class="ceo-ic ${k.tone} ceo-kpi-modal-icon">${_lucide(k.i)}</span>
              <div class="ceo-kpi-modal-heading">
                <div class="ceo-kpi-modal-title-row">
                  <h2 id="ceo-kpi-modal-title">${k.t}</h2>
                  <strong>${k.v}</strong>
                </div>
                <div class="ceo-kpi-modal-summary">
                  <span id="ceo-kpi-modal-description">${k.desc}</span>
                  <span class="ceo-kpi-change ${k.up ? 'positive' : 'negative'}">
                    ${k.up ? '↑' : '↓'} ${k.d} vs last period
                  </span>
                </div>
              </div>
            </div>
            <button class="ceo-kpi-modal-close" type="button" aria-label="Close KPI details" onclick="closeCeoKpiModal()">
              ${_lucide('x')}
            </button>
          </header>
          
          <div class="ceo-kpi-modal-body">
            <div class="ceo-kpi-modal-stats">
              ${k.metrics.map(m => `
                <div class="ceo-kpi-modal-stat">
                  <span>${m[0]}</span>
                  <b>${m[1]}</b>
                </div>
              `).join('')}
            </div>

            <div class="ceo-kpi-chart-heading">
              <h3>Historical Trend (10 Months)</h3>
              <div class="ceo-tabs ceo-kpi-periods" aria-label="Chart period">
                <button class="ceo-button" style="background:transparent; padding:8px 16px; border:none; font-weight:600; cursor:pointer;">MTD</button>
                <button class="ceo-button" style="background:transparent; padding:8px 16px; border:none; font-weight:600; cursor:pointer;">QTD</button>
                <button class="ceo-button" style="background:transparent; padding:8px 16px; border:none; font-weight:600; cursor:pointer;">YTD</button>
                <button class="ceo-button on" style="background:white; padding:8px 16px; border:none; font-weight:700; color:var(--ceo-blue); box-shadow:0 2px 4px rgba(0,0,0,0.05); border-radius:6px; cursor:pointer;">FY 2026-27</button>
              </div>
            </div>
            
            <div class="ceo-kpi-chart" role="region" aria-label="${k.t} historical trend chart">
              ${svgModalLineChart(k.chartData, k.c)}
            </div>
          </div>

        </div>
      </div>
    `;
    const container = document.getElementById('ceo-modal-root');
    if(container) {
      container.innerHTML = modalHtml;
      document.body.style.overflow = 'hidden';
      if (window.lucide) window.lucide.createIcons();
      container.querySelector('.ceo-kpi-modal-close')?.focus();
      const chart = container.querySelector('.ceo-kpi-chart');
      if (chart) {
        ceoKpiChartResizeHandler = () => {
          chart.innerHTML = svgModalLineChart(k.chartData, k.c, chart.clientWidth - 36, chart.clientHeight - 36);
        };
        ceoKpiChartResizeHandler();
        window.addEventListener('resize', ceoKpiChartResizeHandler);
      }
    }
  };

  window.closeCeoKpiModal = function(e) {
    if(e && e.target.id !== 'ceo-modal-backdrop') return;
    const container = document.getElementById('ceo-modal-root');
    if(container) {
      if (ceoKpiChartResizeHandler) {
        window.removeEventListener('resize', ceoKpiChartResizeHandler);
        ceoKpiChartResizeHandler = null;
      }
      container.innerHTML = '';
      document.body.style.overflow = ceoKpiPreviousBodyOverflow;
      if (ceoKpiModalTrigger instanceof HTMLElement && ceoKpiModalTrigger.isConnected) {
        ceoKpiModalTrigger.focus();
      }
      ceoKpiModalTrigger = null;
    }
  };

  window.addEventListener('keydown', function(e) {
    const modal = document.querySelector('#ceo-modal-backdrop .ceo-modal-content');
    if (!modal) return;
    if (e.key === 'Escape') {
      window.closeCeoKpiModal();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = modal.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) {
        e.preventDefault();
        modal.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  const html = `
  <style>
    :root {
      --ceo-blue: #2563eb;
      --ceo-blue-2: #3b82f6;
      --ceo-blue-3: #60a5fa;
      --ceo-blue-soft: #eff6ff;
      --ceo-blue-tint: #f8fafc;
      --ceo-red: #dc2626;
      --ceo-red-soft: #fef2f2;
      --ceo-green: #16a34a;
      --ceo-green-soft: #f0fdf4;
      --ceo-amber: #d97706;
      --ceo-amber-soft: #fffbeb;
      --ceo-violet: #7c3aed;
      --ceo-violet-soft: #f5f3ff;
      --ceo-teal: #0d9488;
      --ceo-teal-soft: #f0fdfa;
      --ceo-ink: #0f172a;
      --ceo-muted: #64748b;
      --ceo-line: #e2e8f0;
      --ceo-bg: #f8fafc;
      --ceo-card: #ffffff;
    }
    
    .ceo-ic.blue { background: var(--ceo-blue-soft); color: var(--ceo-blue); }
    .ceo-ic.red { background: var(--ceo-red-soft); color: var(--ceo-red); }
    .ceo-ic.green { background: var(--ceo-green-soft); color: var(--ceo-green); }
    .ceo-ic.amber { background: var(--ceo-amber-soft); color: var(--ceo-amber); }
    .ceo-ic.violet { background: var(--ceo-violet-soft); color: var(--ceo-violet); }
    .ceo-ic.teal { background: var(--ceo-teal-soft); color: var(--ceo-teal); }
    .ceo-ic.muted { background: var(--ceo-bg); color: var(--ceo-muted); }
    
    .dashboard-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 24px; align-items: stretch; box-sizing: border-box; min-width: 0; width: 100%; margin-bottom:24px; }
    .ceo-root { box-sizing: border-box; min-width: 0; width: 100%; max-width: 100%; overflow-x: hidden; padding-bottom: 60px; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background:var(--ceo-bg);}
    .ceo-main { box-sizing: border-box; min-width: 0; width: 100%; padding:clamp(12px, 1.6vw, 24px);}
    .ceo-content { box-sizing: border-box; min-width: 0; width: 100%; }
    .ceo-brand-lockup { width:230px; height:50px; overflow:hidden; flex:0 0 auto; }
    .ceo-brand-lockup img { width:100%; height:100%; display:block; object-fit:cover; object-position:top left; }
    @media(max-width:767px) { .ceo-brand-lockup { width:200px; height:44px; } }
    
    .span-8 { grid-column: span 8; } .span-7 { grid-column: span 7; } .span-6 { grid-column: span 6; } .span-5 { grid-column: span 5; } .span-4 { grid-column: span 4; } .span-3 { grid-column: span 3; } .span-2 { grid-column: span 2; }
    
    .ceo-kpis { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 16px; margin-bottom: 24px; box-sizing: border-box; width: 100%; }
    
    .ceo-kpi-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(37,99,235,0.08) !important; border-color: rgba(37,99,235,0.4) !important; z-index:1; }
    
    .funnel-row { display: grid; grid-template-columns: minmax(130px, 180px) minmax(100px, 1fr) auto; gap: 16px; align-items: center; width: 100%; min-width: 0; box-sizing: border-box; margin-bottom:14px; min-height: 28px; }
    .funnel-bar-container { width: 100%; min-width: 0; height: 26px; background: var(--ceo-line); border-radius: 6px; overflow: hidden; }
    .funnel-bar { height: 100%; border-radius: 6px; }

    @media (max-width: 1440px) {
      .ceo-kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); gap:16px; margin-bottom:24px; }
      .span-7 { grid-column: span 6; } .span-3 { grid-column: span 3; } .span-2 { grid-column: span 3; } .span-5 { grid-column: span 6; }
    }
    
    @media (max-width: 1199px) {
      .dashboard-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
      .span-8, .span-7, .span-6, .span-5 { grid-column: span 6; }
      .span-4, .span-3, .span-2 { grid-column: span 3; }
    }
    
    @media (max-width: 767px) {
      .dashboard-grid { grid-template-columns: repeat(1, minmax(0, 1fr)); }
      .ceo-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .span-8, .span-7, .span-6, .span-5, .span-4, .span-3, .span-2 { grid-column: span 1; }
      .funnel-row { grid-template-columns: 1fr auto; gap: 8px; margin-bottom:16px; }
      .funnel-bar-container { grid-column: 1 / -1; }
      .ceo-main { padding:12px; }
      .dashboard-grid { gap:12px; margin-bottom:12px; }
      .ceo-card { padding:16px !important; min-height:280px !important; }
    }
    
    @media (max-width: 420px) {
      .ceo-kpis { grid-template-columns: repeat(1, minmax(0, 1fr)); }
      .ceo-main { padding:8px; }
      .ceo-card { padding:12px !important; }
    }
  </style>
  <div class="ceo-root">
    <div id="ceo-modal-root"></div>
    <div class="ceo-main">
      <div class="ceo-content">
        
        <div class="ceo-banner" style="position:relative; margin-bottom:24px; display:flex; flex-wrap:wrap; align-items:center; background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%); border-radius:16px; overflow:hidden; min-height:130px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border:1px solid rgba(37,99,235,0.15);">
          <svg style="position:absolute; right:0; top:0; width:50%; height:100%; pointer-events:none; opacity:0.6;" viewBox="0 0 500 130" preserveAspectRatio="none">
            <path d="M0 130 L500 130 L500 0 L150 0 Z" fill="url(#gradShape)" />
            <defs>
              <linearGradient id="gradShape" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="rgba(37,99,235,0)" />
                <stop offset="100%" stop-color="rgba(37,99,235,0.12)" />
              </linearGradient>
            </defs>
          </svg>
          
          <div style="flex:1 1 300px; padding:28px 36px; position:relative; z-index:1; min-width:0;">
            <div class="ceo-brand-lockup" style="margin-bottom:10px;"><img src="/nf-namdev-logo.webp" alt="Namdev Finvest" /></div>
            <h1 style="font-size:28px; font-weight:800; margin:0 0 6px 0; color:var(--ceo-ink); letter-spacing:-0.5px;">CEO Executive Command Center</h1>
            <p style="font-size:15px; margin:0; color:var(--ceo-muted); font-weight:500;">Real-time view of lending, risk, collections and operational performance</p>
          </div>

          <div class="ceo-banner-profile" style="display:flex; align-items:center; gap:16px; padding:24px 36px; position:relative; z-index:1; flex:0 0 auto;">
            <div style="text-align:right;">
              <b style="display:block; font-size:18px; color:var(--ceo-ink); font-weight:800;">Jitendra Tanwar</b>
              <span style="font-size:14px; color:var(--ceo-blue); font-weight:700;">MD & CEO</span>
              <span style="display:block; font-size:11px; color:var(--ceo-muted); margin-top:4px; font-weight:600;">Namdev Finvest Pvt. Ltd.</span>
            </div>
          </div>
        </div>

        <div class="ceo-kpis">
          ${window.kpiData.map((k,i) => `
            <div class="ceo-kpi-card" data-kpi="${k.id}" role="button" tabindex="0" aria-label="${k.t} ${k.v}, open details" onclick="window.openCeoKpiModal(${i},this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window.openCeoKpiModal(${i},this)}" style="box-sizing:border-box; background:white; border-radius:16px; padding:22px; box-shadow:0 4px 12px rgba(0,0,0,0.03); border:1px solid var(--ceo-line); display:flex; flex-direction:column; min-height: 140px; min-width:0; cursor:pointer; transition:all 0.25s cubic-bezier(0.4, 0, 0.2, 1); position:relative;">
              <div class="ceo-kpi-t" style="display:flex; align-items:center; gap:12px; color:var(--ceo-muted); font-size:13px; margin-bottom:16px; min-width:0;">
                 <span class="ceo-ic ${k.tone}" style="display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:10px; flex-shrink:0;">${_lucide(k.i)}</span>
                 <span style="font-weight:700; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${k.t}</span>
              </div>
              <strong style="font-size:28px; color:var(--ceo-ink); margin-bottom:14px; font-weight:800; line-height:1; letter-spacing:-0.5px;">${k.v}</strong>
              <div style="display:flex; align-items:flex-end; justify-content:space-between; margin-top:auto;">
                 <div style="display:flex; flex-direction:column; gap:4px;">
                   <small style="font-size:14px; color:${k.up ? 'var(--ceo-green)' : 'var(--ceo-red)'}; display:flex; align-items:center; gap:4px; font-weight:800;">
                      ${k.up ? '↑' : '↓'} ${k.d}
                   </small>
                   <span style="font-size:11px; color:var(--ceo-muted); font-weight:600;">vs last period</span>
                 </div>
                 <div style="width:120px; height:50px; min-height:50px; margin-left:auto;">
                   ${svgSpark(k.chartData, k.c, i >= 6)}
                 </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="dashboard-grid ceo-overview-grid">
          <div class="span-7">
            ${_card('Target vs Actual Disbursement', `<div style="display:flex; align-items:center; gap:6px; color:var(--ceo-blue); font-weight:700; font-size:12px; background:var(--ceo-blue-soft); padding:6px 12px; border-radius:20px; cursor:pointer;">MTD ${_lucide("chevron-right")}</div>`, `
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:20px; margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid var(--ceo-line);">
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:26px; color:var(--ceo-ink); font-weight:800;">₹186 Cr</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Actual</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:26px; color:var(--ceo-ink); font-weight:800;">₹215 Cr</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Target</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:26px; color:var(--ceo-green); font-weight:800;">86.5%</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Achievement</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:26px; color:var(--ceo-blue); font-weight:800;">₹224 Cr</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Projected</span></div>
              </div>
              <div style="flex:1; width:100%; min-height:300px; position:relative; margin-top:10px;">
                ${svgTargetActual()}
              </div>
              <div style="display:flex; justify-content:center; flex-wrap:wrap; gap:28px; font-size:13px; color:var(--ceo-muted); font-weight:600; margin-top:24px;">
                 <span style="display:flex; align-items:center; gap:8px;"><i style="width:12px; height:12px; border-radius:50%; background:var(--ceo-blue);"></i>Actual</span>
                 <span style="display:flex; align-items:center; gap:8px;"><i style="width:20px; height:3px; background:var(--ceo-red);"></i>Target</span>
                 <span style="display:flex; align-items:center; gap:8px;"><i style="width:20px; height:3px; background:var(--ceo-blue); border-top:3px dashed transparent;"></i>Projection</span>
              </div>
            `, 'min-height: 460px;')}
          </div>
          <div class="span-2">
            ${_card('Product Mix', `<div style="display:flex; gap:4px; background:var(--ceo-bg); padding:4px; border-radius:8px; border:1px solid var(--ceo-line);"><button style="background:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; box-shadow:0 2px 4px rgba(0,0,0,0.05); color:var(--ceo-blue);">AUM</button></div>`, `
              <div style="display:flex; flex-direction:column; align-items:center; gap:36px; flex:1; padding:24px 0;">
                ${cssDonut([
                  {val: 22, c: '#2563eb'}, {val: 29, c: '#dc2626'}, {val: 25, c: '#7c3aed'}, {val: 10, c: '#d97706'}, {val: 14, c: '#f59e0b'}
                ], '₹1,248 Cr', 'Total AUM', 180, 135)}
                <ul style="width:100%; list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:16px;">
                  ${[['Two Wheeler', '22%', '₹275 Cr', '#2563eb'], ['MSME', '29%', '₹362 Cr', '#dc2626'], ['LAP', '25%', '₹312 Cr', '#7c3aed'], ['Solar Loan', '10%', '₹225 Cr', '#d97706'], ['Tractor Loan', '14%', '₹174 Cr', '#f59e0b']].map(p => `
                  <li style="display:flex; align-items:center; gap:12px; font-size:14px;">
                    <i style="width:12px; height:12px; border-radius:50%; background: ${p[3]}; flex-shrink:0;"></i>
                    <span style="flex:1; color:var(--ceo-ink); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p[0]}</span>
                    <b style="color:var(--ceo-ink); font-size:14px; font-weight:800;">${p[1]}</b>
                    <em style="color:var(--ceo-muted); font-style:normal; font-weight:600; width:65px; text-align:right; flex-shrink:0;">${p[2]}</em>
                  </li>`).join('')}
                </ul>
              </div>
            `, 'min-height: 400px;')}
          </div>
          <div class="span-3">
            ${_card('Conversion Funnel', `<div style="display:flex; align-items:center; gap:6px; color:var(--ceo-ink); font-weight:700; font-size:12px; background:var(--ceo-bg); padding:6px 12px; border-radius:20px; border:1px solid var(--ceo-line);">MTD</div>`, `
              <div style="display:flex; flex-direction:column; flex:1; padding-top:16px; min-height:300px;">
                ${[['Leads', 12442, '100%'], ['Login / Application', 8214, '66%'], ['Credit', 4982, '60.6%'], ['Sanction', 2914, '58.5%'], ['Disbursed', 1618, '55.5%']].map((f, i, arr) => `
                  <div class="funnel-row">
                    <span style="color:var(--ceo-ink); font-weight:700; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${f[0]}">${f[0]}</span>
                    <div class="funnel-bar-container">
                      <div class="funnel-bar" style="width:${f[1]/124.42}%; background:${i===4 ? 'var(--ceo-green)' : 'var(--ceo-blue)'};"></div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; font-size:14px;">
                      <b style="color:var(--ceo-ink); font-weight:800; white-space:nowrap;">${f[1].toLocaleString()}</b>
                      <span style="font-weight:600; color:var(--ceo-muted); white-space:nowrap;">${f[2]}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div style="margin-top:auto; padding-top:24px; border-top:1px dashed var(--ceo-line); display:flex; justify-content:space-between; font-size:15px; align-items:center;">
                 <span style="color:var(--ceo-muted); font-weight:600;">Lead to Disbursal Conversion</span>
                 <b style="color:var(--ceo-ink); font-size:18px; font-weight:800;">13.0%</b>
              </div>
            `, 'min-height: 400px;')}
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="span-5">
            ${_card('Branch Performance', `<div style="font-size:13px; font-weight:700; color:var(--ceo-blue); cursor:pointer;">View All</div>`, `
              <div style="width:100%; overflow-x:auto;">
                <table style="width:100%; min-width:400px; font-size:14px; border-collapse:collapse; text-align:left;">
                  <thead>
                    <tr style="border-bottom:2px solid var(--ceo-line); color:var(--ceo-muted);">
                      <th style="padding:14px 4px; font-weight:700; width:24px;">#</th>
                      <th style="padding:14px 4px; font-weight:700;">Branch</th>
                      <th style="padding:14px 4px; font-weight:700; text-align:right;">Target</th>
                      <th style="padding:14px 4px; font-weight:700; text-align:right;">Actual</th>
                      <th style="padding:14px 4px; font-weight:700; text-align:right;">Ach%</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${[['Jaipur VKI', '25', '28.4', '114%', '18%', '96%'], ['Sanganer', '24', '26.2', '110%', '12%', '95%'], ['Udaipur', '18', '18.6', '103%', '9%', '97%'], ['Kota', '15', '16.8', '112%', '14%', '96%'], ['Jodhpur', '14', '17.4', '124%', '20%', '94%']].map((r, i) => `
                    <tr style="border-bottom:1px solid var(--ceo-line);">
                      <td style="padding:18px 4px; color:var(--ceo-muted); font-weight:600;">${i + 1}</td>
                      <td style="padding:18px 4px; font-weight:800; color:var(--ceo-ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r[0]}</td>
                      <td style="padding:18px 4px; color:var(--ceo-muted); text-align:right; font-weight:600;">${r[1]}</td>
                      <td style="padding:18px 4px; color:var(--ceo-ink); text-align:right; font-weight:800;">${r[2]}</td>
                      <td style="padding:18px 4px; color:var(--ceo-green); font-weight:800; text-align:right;">${r[3]}</td>
                    </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `, 'min-height: 380px;')}
          </div>
          <div class="span-3">
            ${_card('Portfolio Quality', `<div style="font-size:12px; font-weight:700; color:var(--ceo-ink); background:var(--ceo-bg); padding:4px 10px; border-radius:12px; border:1px solid var(--ceo-line);">AUM</div>`, `
              <div style="display:flex; flex-direction:column; align-items:center; gap:32px; flex:1; padding:24px 0;">
                ${cssDonut([
                  {val: 94.2, c: '#0f766e'}, {val: 3.1, c: '#2563eb'}, {val: 1.2, c: '#d97706'}, {val: 0.8, c: '#b91c1c'}, {val: 0.7, c: '#991b1b'}
                ], '1.8%', 'NPA', 170, 120)}
                <ul style="width:100%; list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:18px;">
                  ${[['Standard', '94.2%', '1,175', '#0f766e'], ['DPD 1-30', '3.1%', '39', '#2563eb'], ['DPD 31-60', '1.2%', '15', '#d97706'], ['DPD 61-90', '0.8%', '10', '#b91c1c'], ['NPA 90+', '0.7%', '9', '#991b1b']].map(p => `
                  <li style="display:flex; align-items:center; gap:12px; font-size:14px;">
                    <i style="width:12px; height:12px; border-radius:50%; background: ${p[3]}; flex-shrink:0;"></i>
                    <span style="flex:1; color:var(--ceo-ink); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p[0]}</span>
                    <b style="color:var(--ceo-ink); font-size:15px; font-weight:800;">${p[1]}</b>
                    <em style="color:var(--ceo-muted); font-style:normal; font-weight:600; width:45px; text-align:right;">${p[2]}</em>
                  </li>`).join('')}
                </ul>
              </div>
            `, 'min-height: 380px;')}
          </div>
          <div class="span-4">
            ${_card('Collection Performance', `<div style="display:flex; align-items:center; gap:6px; color:var(--ceo-ink); font-weight:700; font-size:12px; background:var(--ceo-bg); padding:6px 12px; border-radius:20px; border:1px solid var(--ceo-line);">MTD</div>`, `
               <div style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:16px; margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid var(--ceo-line);">
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:22px; color:var(--ceo-ink); font-weight:800;">₹164 Cr</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Due</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:22px; color:var(--ceo-ink); font-weight:800;">₹158 Cr</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Collected</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:22px; color:var(--ceo-green); font-weight:800;">96.4%</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Efficiency</span></div>
                <div style="display:flex; flex-direction:column; min-width:0;"><b style="font-size:22px; color:var(--ceo-red); font-weight:800;">₹6 Cr</b><span style="font-size:13px; color:var(--ceo-muted); font-weight:600;">Remaining</span></div>
              </div>
              <div style="flex:1; width:100%; min-height:280px; position:relative; margin-top:10px;">
                ${svgCollectionChart()}
              </div>
              <div style="display:flex; justify-content:center; flex-wrap:wrap; gap:24px; font-size:13px; color:var(--ceo-muted); font-weight:600; margin-top:24px;">
                 <span style="display:flex; align-items:center; gap:8px;"><i style="width:12px; height:12px; background:var(--ceo-blue); border-radius:3px;"></i>Due</span>
                 <span style="display:flex; align-items:center; gap:8px;"><i style="width:12px; height:12px; background:var(--ceo-green); border-radius:3px;"></i>Collected</span>
                 <span style="display:flex; align-items:center; gap:8px;"><i style="width:20px; height:3px; background:var(--ceo-red);"></i>Efficiency</span>
              </div>
            `, 'min-height: 420px;')}
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="span-4">
            ${_card('Credit Command Center', '', `
              <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:20px; margin-bottom:28px;">
                ${[['clipboard-list', '127', 'Credit Queue', 'blue'], ['clock-3', '3.8d', 'Avg TAT', 'violet'], ['shield-alert', '18', 'Fraud Flags', 'red'], ['gavel', '8', 'Legal Pending', 'red']].map(([I, n, l, t]) => `
                  <div style="display:flex; align-items:center; gap:16px; padding:20px; border:1px solid var(--ceo-line); border-radius:12px; background:var(--ceo-bg); min-width:0;">
                    <span class="ceo-ic ${t}" style="display:flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:10px; flex-shrink:0;">${_lucide(I)}</span>
                    <div style="display:flex; flex-direction:column; min-width:0;">
                      <b class="${t}" style="font-size:24px; line-height:1; font-weight:800; margin-bottom:6px;">${n}</b>
                      <small style="font-size:13px; color:var(--ceo-muted); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${l}</small>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div style="display:flex; flex-direction:column; flex:1; border-top:1px solid var(--ceo-line); padding-top:24px;">
                  <h3 style="font-size:15px; margin:0 0 20px 0; font-weight:700; color:var(--ceo-ink);">Credit TAT Analysis <small style="color:var(--ceo-muted); font-weight:600;">(Applications)</small></h3>
                  <div style="flex:1; width:100%; min-height:180px; position:relative;">
                    ${svgTatBar()}
                  </div>
              </div>
            `, 'min-height: 400px;')}
          </div>
          <div class="span-4">
            ${_card('Risk Grade Distribution', '', `
              <div style="display:flex; flex-direction:column; align-items:center; gap:36px; flex:1; padding:24px 0;">
                ${cssDonut([
                  {val: 34, c: '#16a34a'}, {val: 28, c: '#0ea5e9'}, {val: 18, c: '#eab308'}, {val: 12, c: '#f97316'}, {val: 8, c: '#ef4444'}
                ], '284', 'Cases', 170, 120)}
                <ul style="width:100%; list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:18px;">
                  ${[['Grade A', '34%', '#16a34a'], ['Grade B', '28%', '#0ea5e9'], ['Grade C', '18%', '#eab308'], ['Grade D', '12%', '#f97316'], ['Grade E', '8%', '#ef4444']].map(p => `
                  <li style="display:flex; align-items:center; gap:12px; font-size:14px;">
                    <i style="width:12px; height:12px; border-radius:50%; background: ${p[2]}; flex-shrink:0;"></i>
                    <span style="flex:1; color:var(--ceo-ink); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p[0]}</span>
                    <b style="color:var(--ceo-ink); font-size:15px; font-weight:800;">${p[1]}</b>
                  </li>`).join('')}
                </ul>
              </div>
            `, 'min-height: 400px;')}
          </div>
          <div class="span-4">
            ${_card('Geographic Performance', `<div style="display:flex; align-items:center; gap:6px; color:var(--ceo-ink); font-weight:700; font-size:12px; background:var(--ceo-bg); padding:6px 12px; border-radius:20px; border:1px solid var(--ceo-line);">Disbursement</div>`, `
              <div style="display:flex; flex-direction:column; align-items:center; gap:32px; flex:1; padding-top:16px;">
                <div style="width:100%; min-height:220px; flex:1; display:flex; align-items:center; justify-content:center; position:relative;">
                  ${svgMap()}
                </div>
                <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:16px; width:100%;">
                  ${[['Rajasthan', '482', '38.6%'], ['North', '312', '25.0%'], ['West', '224', '18.0%'], ['Central', '114', '11.8%'], ['East', '82', '6.6%']].map(([n, v, p], i) => `
                    <li style="display:flex; align-items:center; gap:12px; font-size:14px;">
                      <i style="width:12px; height:12px; border-radius:3px; background: ${i ? 'var(--ceo-blue-soft)' : 'var(--ceo-blue)'}; flex-shrink:0;"></i>
                      <span style="flex:1; color:var(--ceo-ink); font-weight:700;">${n}</span>
                      <em style="color:var(--ceo-muted); font-style:normal; font-weight:600;">₹${v} Cr</em>
                      <b style="color:var(--ceo-ink); width:50px; text-align:right; font-weight:800;">${p}</b>
                    </li>
                  `).join('')}
                </ul>
              </div>
            `, 'min-height: 440px;')}
          </div>
        </div>

      </div>
    </div>
  </div>
  `;

  document.getElementById("content").innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
};
// --- END PORTED CEO DASHBOARD ---
