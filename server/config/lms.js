// LMS configuration: roles, enums, request kinds (form fields drive both server validation and the client forms) and the menu.
const BRANCHES = ["Jaipur - VKI", "Bhopal", "Indore", "Head Office"];

const MAKER = ["Central Operations", "Disbursement Officer", "System Admin"];
const CHECKER = ["Operations Checker", "CEO", "System Admin"];
const SUPERVISOR = ["Operations Checker", "Credit Head", "CEO", "System Admin"];
const VIEW_ONLY = ["Credit Head", "Audit Manager", "Compliance Manager", "Compliance Officer"];
const ROLES = {
  maker: MAKER,
  checker: CHECKER,
  supervisor: SUPERVISOR,
  // Roles that may record collection contacts and be assigned debt cases.
  collector: [...new Set([...MAKER, "Operations Checker"])],
  // Write-off is a final loss recognition; it is restricted to the highest authorities.
  writeoff: ["CEO", "System Admin"],
  view: [...new Set([...MAKER, ...CHECKER, ...SUPERVISOR, ...VIEW_ONLY])],
};
// Roles confined to their assigned branch (User.branch). They see nothing until a branch is assigned.
const BRANCH_BOUND = ["Disbursement Officer"];

const LOAN_STATUS = ["Active", "Hold", "Closed", "Settled", "Written Off", "Cancelled"];
const OPEN_STATUS = ["Active", "Hold"];
const VERIFICATION = ["Initiated", "Capturing", "Completed"];
const NPA_STAGES = ["REGULAR", "SMA-0", "SMA-1", "SMA-2", "SUB-STANDARD", "DOUBTFUL", "LOSS"];
const PAY_MODES = ["Cash", "UPI", "NEFT", "RTGS", "IMPS", "Online", "Cheque"];
const NO_CHEQUE_MODES = PAY_MODES.filter((m) => m !== "Cheque");
const CHARGE_CODES = ["OTHER CHARGES", "PENALTY", "PROCESSING"];
const CASH_LIMIT = 200000; // Income-tax Act s.269ST: receipts of Rs 2,00,000 or more in cash are not permitted.
const DEBT_BUCKETS = ["BKT1_30", "BKT31_60", "BKT61_90", "BKT90_PLUS"];

const f = (n, l, t = "text", r = true, extra = {}) => ({ n, l, t, r, ...extra });
const payFields = (when) => [
  f("mode", "Payment Mode", "select", true, { o: NO_CHEQUE_MODES, when }),
  f("referenceNo", "UTR / Reference No.", "text", true, { max: 30, pat: "ref", when }),
  f("receivedOn", "Received On", "date", true, { when }),
];
const PATTERNS = {
  ref: { re: /^[A-Za-z0-9][A-Za-z0-9\-/]{3,29}$/, msg: "must be 4-30 letters, digits, '-' or '/'" },
  ifsc: { re: /^[A-Z]{4}0[A-Z0-9]{6}$/, msg: "must be a valid IFSC (e.g. HDFC0001234)" },
  account: { re: /^\d{9,18}$/, msg: "must be 9-18 digits" },
  pan: { re: /^[A-Z]{5}[0-9]{4}[A-Z]$/, msg: "must be a valid PAN (e.g. ABCDE1234F)" },
  voter: { re: /^[A-Z]{3}[0-9]{7}$/, msg: "must be a valid Voter ID (e.g. ABC1234567)" },
  vehicle: { re: /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{1,4}$/, msg: "must be a valid vehicle number (e.g. RJ14AB1234)" },
};

// flow: how the record moves. quote: which server quote the form displays. unique: only one pending request per loan.
const KINDS = {
  advice: {
    label: "Manual Advice", prefix: "ADV", flow: "maker-checker", unique: false,
    fields: [f("chargeCode", "Charge Code", "select", true, { o: CHARGE_CODES }), f("amount", "Charge Amount (₹)", "number", true, { min: 1, max: 10000000 }), f("reason", "Reason", "text", true, { max: 200 })],
  },
  instrument: {
    label: "Instrument", prefix: "INS", flow: "instrument", unique: false,
    fields: [
      f("mode", "Instrument Mode", "select", true, { o: ["ACH", "ECS", "NACH", "Cheque"] }), f("bank", "Bank", "text", true, { max: 80 }),
      f("ifsc", "IFSC", "text", true, { pat: "ifsc", upper: true }), f("accountNo", "Account Number", "text", true, { pat: "account" }),
      f("instrumentNo", "UMRN / Cheque No.", "text", true, { max: 40, pat: "ref" }), f("instrumentDate", "Instrument Date", "date", true),
      f("amount", "Amount (₹)", "number", true, { min: 1, max: 100000000 }),
    ],
  },
  document: {
    label: "Document Collection", prefix: "DOC", flow: "document", unique: false,
    fields: [
      f("docType", "Document Type", "select", true, { o: ["KYC", "Legal", "Income Proof", "Banking", "Other"] }),
      f("stage", "Stage", "select", true, { o: ["Verification", "Collection", "Author"] }), f("docDate", "Date", "date", true), f("remarks", "Remarks", "text", false, { max: 200 }),
    ],
  },
  query: {
    label: "Query Response", prefix: "QRY", flow: "query", unique: false,
    fields: [f("subject", "Subject", "text", true, { max: 120 }), f("text", "Query", "textarea", true, { max: 1000 })],
  },
  settlement: {
    label: "Loan Settlement", prefix: "SET", flow: "maker-checker", unique: true, quote: "closure",
    fields: [
      f("settlementType", "Settlement Type", "select", true, { o: ["Full Settlement", "Partial Settlement", "Write Off"] }),
      f("asOf", "Settlement Date", "date", true, { when: { f: "settlementType", in: ["Full Settlement"] } }),
      f("amount", "Settlement Amount (₹)", "number", true, { min: 1, when: { f: "settlementType", in: ["Full Settlement"] } }),
      ...payFields({ f: "settlementType", in: ["Full Settlement"] }),
      f("waiverAmount", "Waiver of Overdue Interest / Charges (₹)", "number", true, { min: 1, when: { f: "settlementType", in: ["Partial Settlement"] } }),
      f("reason", "Reason", "text", true, { max: 300 }),
    ],
  },
  knockoff: {
    label: "Knock Off", prefix: "KO", flow: "maker-checker", unique: true,
    fields: [
      f("source", "Payable Source", "select", true, { o: ["Refund Payable", "Subsidy Payable", "Insurance Refund", "Other Payable"] }),
      f("amount", "Amount to Knock Off (₹)", "number", true, { min: 1 }), f("referenceNo", "Payable Reference", "text", true, { max: 30, pat: "ref" }), f("reason", "Reason", "text", true, { max: 300 }),
    ],
  },
  reschedule: {
    label: "Repricing / Rescheduling", prefix: "RSC", flow: "maker-checker", unique: true,
    fields: [
      f("newRate", "New Interest Rate % (p.a.)", "number", true, { min: 1, max: 40 }), f("newTenure", "Remaining Tenure (months)", "int", true, { min: 1, max: 240 }),
      f("reason", "Reason", "text", true, { max: 300 }),
    ],
  },
  partprepay: {
    label: "Part Prepayment", prefix: "PPY", flow: "maker-checker", unique: true,
    fields: [
      f("amount", "Prepayment Amount (₹)", "number", true, { min: 1 }), f("option", "Adjust By", "select", true, { o: ["Reduce Tenure", "Reduce EMI"] }),
      ...payFields(null), f("reason", "Reason", "text", false, { max: 300 }),
    ],
  },
  duedate: {
    label: "Due Date Change", prefix: "DDC", flow: "maker-checker", unique: true,
    fields: [f("newDay", "New Due Day of Month (1-28)", "int", true, { min: 1, max: 28 }), f("reason", "Reason", "text", true, { max: 300 })],
  },
  closure: {
    label: "Early / Maturity Closure", prefix: "CLS", flow: "maker-checker", unique: true, quote: "closure",
    fields: [
      f("closureType", "Closure Type", "select", true, { o: ["Early Closure", "Maturity Closure"] }),
      f("asOf", "Closure Date", "date", true, { when: { f: "closureType", in: ["Early Closure"] } }),
      f("amount", "Closure Amount (₹)", "number", true, { min: 1, when: { f: "closureType", in: ["Early Closure"] } }),
      ...payFields({ f: "closureType", in: ["Early Closure"] }),
      f("reason", "Remarks", "text", false, { max: 300 }),
    ],
  },
  cancellation: {
    label: "Cancellation", prefix: "CAN", flow: "maker-checker", unique: true,
    fields: [f("reason", "Cancellation Reason", "text", true, { max: 300 })],
  },
  npa: {
    label: "Manual NPA Movement", prefix: "NPA", flow: "maker-checker", unique: true,
    fields: [f("toStage", "Move To NPA Stage", "select", true, { o: NPA_STAGES }), f("reason", "Reason", "text", true, { max: 300 })],
  },
};

const REPAYMENT_FIELDS = [
  f("amount", "Amount (₹)", "number", true, { min: 1, max: 100000000 }),
  f("mode", "Payment Mode", "select", true, { o: PAY_MODES }),
  f("referenceNo", "UTR / Cheque / Reference No.", "text", false, { max: 30, pat: "ref", when: { f: "mode", in: PAY_MODES.filter((m) => m !== "Cash") } }),
  f("instrumentBank", "Cheque Bank", "text", true, { max: 80, when: { f: "mode", in: ["Cheque"] } }),
  f("receivedOn", "Payment Date", "date", true),
];

const S = (id, label, type, extra = {}) => ({ id, label, type, ...extra });
const MENU = [
  { id: "dashboard", title: "Dashboard", items: [S("dashboard", "Dashboard", "dashboard")] },
  { id: "credit", title: "Credit Management", items: [S("credit", "Credit Management", "credit")] },
  {
    id: "servicing", title: "Loan Servicing", items: [
      S("ach", "ACH Capturing", "records", { kind: "instrument", modes: ["ACH", "ECS", "NACH"] }),
      S("instrument", "Instrument Capturing", "records", { kind: "instrument" }),
      S("banking", "Banking Report", "banking"),
      S("verification", "Verification", "verification"),
      S("document", "Document Collection", "records", { kind: "document" }),
      S("query", "Query Response", "records", { kind: "query" }),
      S("repayment", "Repayment", "repayment"),
      S("advice", "Manual Advice", "records", { kind: "advice" }),
      S("cheque", "Cheque Status", "cheque"),
    ],
  },
  {
    id: "transactions", title: "Loan Transactions", items: [
      S("settlement", "Loan Settlement", "records", { kind: "settlement" }), S("knockoff", "Knock Off", "records", { kind: "knockoff" }),
      S("reschedule", "Repricing / Rescheduling", "records", { kind: "reschedule" }), S("partprepay", "Part Prepayment", "records", { kind: "partprepay" }),
      S("duedate", "Due Date Change", "records", { kind: "duedate" }), S("closure", "Early / Maturity Closure", "records", { kind: "closure" }),
      S("cancellation", "Cancellation", "records", { kind: "cancellation" }), S("npa", "Manual NPA Movement", "records", { kind: "npa" }),
    ],
  },
  { id: "processes", title: "Processes & Reports", items: [S("processes", "Processes", "processes"), S("reports", "Reports", "reports", { scope: "loan" })] },
  { id: "service", title: "Customer Service", items: [S("service", "Customer Service", "service")] },
  {
    id: "debt", title: "Debt Management", items: [
      S("debtCases", "Cases", "debtcases", { view: "all" }), S("debtContact", "Contact Recording", "debtcases", { view: "contact" }),
      S("debtAdhoc", "Adhoc Contact Recording", "debtadhoc"), S("debtRealloc", "Reallocation", "debtcases", { view: "realloc" }),
      S("debtReview", "Supervisor Review", "debtcases", { view: "review" }), S("debtEscalated", "Escalated Cases", "debtcases", { view: "escalated" }),
      S("debtUpload", "Allocation Process Upload", "debtupload"), S("debtReports", "Debt Reports", "reports", { scope: "debt" }),
    ],
  },
];

const LOAN_REPORTS = [
  { id: "repayment", label: "Repayment Services Report" }, { id: "cheque", label: "Cheque Status" }, { id: "chequealloc", label: "Cheque Allocation Detail" },
  { id: "documents", label: "Documents Collection" }, { id: "paymentmemo", label: "Payment Memo Report" }, { id: "delinquent", label: "Delinquent Cases" },
  { id: "collectionmis", label: "Collection MIS" }, { id: "followup", label: "Follow Up Trail" },
];
const DEBT_REPORTS = [
  { id: "delinquent", label: "Delinquent Cases" }, { id: "unallocated", label: "Unallocated Cases" }, { id: "summary", label: "Summary" },
  { id: "resolved", label: "Resolved Cases" }, { id: "userperformance", label: "User Performance" }, { id: "ptp", label: "Promise To Pay" },
  { id: "collectionmis", label: "Collection MIS" }, { id: "collectiondump", label: "Collection Dump" }, { id: "allocated", label: "Allocated Cases" }, { id: "followup", label: "Follow Up Trail" },
];

const publicKinds = () => Object.fromEntries(Object.entries(KINDS).map(([k, v]) => [k, { label: v.label, flow: v.flow, quote: v.quote || null, fields: v.fields }]));

module.exports = {
  BRANCHES, ROLES, BRANCH_BOUND, LOAN_STATUS, OPEN_STATUS, VERIFICATION, NPA_STAGES, PAY_MODES, NO_CHEQUE_MODES, CHARGE_CODES, CASH_LIMIT, DEBT_BUCKETS,
  PATTERNS, KINDS, REPAYMENT_FIELDS, MENU, LOAN_REPORTS, DEBT_REPORTS, publicKinds,
};
