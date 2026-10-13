// Product journey configuration. One shared 20-step engine; each product supplies its own fields, economics and rules.
// Field: n=name l=label t=text|number|date|select|textarea|tel|check r=required o=options pat=pattern key min/max ro=readonly skip={f,v}
const PATTERNS = {
  mobile: { re: /^[6-9]\d{9}$/, msg: "must be a valid 10-digit mobile number" },
  pan: { re: /^[A-Z]{5}[0-9]{4}[A-Z]$/, msg: "must be a valid PAN (e.g. ABCDE1234F)" },
  last4: { re: /^\d{4}$/, msg: "must be exactly 4 digits" },
  pin: { re: /^\d{6}$/, msg: "must be a 6-digit pincode" },
  ifsc: { re: /^[A-Z]{4}0[A-Z0-9]{6}$/, msg: "must be a valid IFSC (e.g. HDFC0001234)" },
  account: { re: /^\d{9,18}$/, msg: "must be 9-18 digits" },
};

const STAGES = { sales: "Sales", credit: "Credit", ops: "Operations" };
const yn = ["Yes", "No"];
const F = (n, l, t = "text", r = true, extra = {}) => ({ n, l, t, r, ...extra });

const fiSkip = { f: "fiRequired", v: "No" };

// Steps that are identical in structure across products; titles/fields can be overridden per product.
function commonSteps(p) {
  return [
    { title: p.titles[0], stage: "sales", desc: p.descs[0], fields: [
      F("customerName", "Customer Name", "text", true, { max: 120 }), F("mobile", "Mobile Number", "tel", true, { pat: "mobile" }),
      F("email", "Email", "text", false, { max: 120 }), F("branch", "Branch", "select", true, { o: ["Jaipur - VKI", "Bhopal", "Indore", "Head Office"] }),
      F("source", "Lead Source", "select", true, { o: ["Direct Sales Agent", "Branch Walk-in", "Referral", "Dealer / Vendor"] }),
      ...p.quick,
    ] },
    { title: p.titles[1], stage: "sales", desc: p.descs[1], fields: [
      F("kycMode", "KYC Mode", "select", true, { o: ["DigiLocker", "CKYC", "Manual KYC"] }), F("pan", "PAN", "text", true, { pat: "pan", upper: true }),
      F("aadhaarLast4", "Aadhaar (last 4 digits)", "text", true, { pat: "last4" }), F("dob", "Date of Birth", "date", true),
      F("permanentAddress", "Permanent Address", "textarea", true, { max: 400 }), F("pincode", "Pincode", "text", true, { pat: "pin" }),
    ] },
    { title: p.titles[2], stage: "sales", desc: p.descs[2], fields: [...p.income, F("repaymentMode", "Repayment Mode", "select", true, { o: ["E-NACH", "E-Mandate", "PDC"] })] },
    { title: p.titles[3], stage: "sales", desc: p.descs[3], fields: [
      ...p.economics,
      F("loanAmount", "Requested Loan Amount (₹)", "number", true, { min: p.minLoan, max: p.maxLoan }),
      F("interestRate", "Interest Rate % (p.a.)", "number", true, { min: 1, max: 40 }), F("tenure", "Tenure (months)", "number", true, { min: 3, max: p.maxTenure }),
      F("processingFeePct", "Processing Fee %", "number", true, { min: 0, max: 5 }), F("otherCharges", "Other Charges (₹)", "number", false, { min: 0 }),
      F("advanceEmis", "Advance EMI (count)", "number", false, { min: 0, max: 6 }), F("scheme", "Scheme", "select", true, { o: p.schemes }),
    ] },
    { title: p.titles[4], stage: "sales", desc: p.descs[4], fields: [
      F("dedupeStatus", "Dedupe Result", "select", true, { o: ["Clear", "Possible Match - Reviewed"] }),
      F("bankName", "Bank Name", "text", true, { max: 80 }), F("accountNo", "Account Number", "text", true, { pat: "account" }), F("ifsc", "IFSC", "text", true, { pat: "ifsc", upper: true }),
      ...p.docs, F("docsCollected", "All Required Documents Collected", "select", true, { o: ["Yes"] }),
    ] },
    { title: "Push to Credit", stage: "sales", desc: "Create the first deal and route the file to Credit.", fields: [
      F("pushRemarks", "Sales Remarks", "textarea", true, { max: 500 }), F("pushConfirm", "I confirm the file is complete and ready for Credit", "select", true, { o: ["Yes"] }),
    ] },
    { title: "Credit Verification", stage: "credit", desc: p.descs[6], decision: "creditDecision", fields: [
      F("creditDecision", "Credit Verification Result", "select", true, { o: ["Verified", "Send Back", "Reject"] }), F("creditRemarks", "Credit Remarks", "textarea", true, { max: 500 }),
    ] },
    { title: "Tele Verification & FI Trigger", stage: "credit", desc: p.descs[7], fields: [
      F("teleStatus", "Tele Verification", "select", true, { o: ["Positive", "Negative", "Not Reachable"] }), F("fiRequired", "Field Investigation Required", "select", true, { o: yn }),
      F("teleRemarks", "Remarks", "textarea", false, { max: 500 }),
    ] },
    { title: "FI Allocation / Agent", stage: "credit", desc: "Allocate the field investigation agent from the branch master.", fields: [
      F("fiAgent", "FI Agent", "text", true, { skip: fiSkip, max: 100 }), F("fiBranch", "Agent Branch", "select", true, { skip: fiSkip, o: ["Jaipur - VKI", "Bhopal", "Indore", "Head Office"] }),
      F("fiScheduledOn", "Scheduled On", "date", true, { skip: fiSkip }),
    ] },
    { title: "Field Investigation Completion", stage: "credit", desc: p.descs[9], fields: [
      F("fiOutcome", "FI Outcome", "select", true, { skip: fiSkip, o: ["Positive", "Negative", "Refer"] }),
      F("geoLat", "Latitude", "number", true, { skip: fiSkip, ro: true, geo: true, min: -90, max: 90 }), F("geoLng", "Longitude", "number", true, { skip: fiSkip, ro: true, geo: true, min: -180, max: 180 }),
      F("geoAccuracy", "Accuracy (m)", "number", false, { ro: true, geo: true, min: 0 }), F("geoCapturedAt", "Captured At", "text", false, { ro: true, geo: true }),
      F("fiRemarks", "FI Report", "textarea", true, { skip: fiSkip, max: 1000 }),
    ] },
    { title: "Credit Recommendation", stage: "credit", desc: "Record the recommendation and approved terms.", decision: "recommendation", fields: [
      F("recommendation", "Recommendation", "select", true, { o: ["Recommend", "Decline"] }), F("approvedAmount", "Approved Amount (₹)", "number", true, { min: 1 }),
      F("approvedTenure", "Approved Tenure (months)", "number", true, { min: 3 }), F("approvedRate", "Approved Rate % (p.a.)", "number", true, { min: 1, max: 40 }),
      F("recommendationRemarks", "Remarks", "textarea", true, { max: 500 }),
    ] },
    { title: "Offer Generation", stage: "credit", desc: "Generate the customer offer from the approved terms.", fields: [
      F("offerValidTill", "Offer Valid Till", "date", true), F("offerConfirm", "Generate offer with the approved terms", "select", true, { o: ["Yes"] }),
    ] },
    { title: "Offer Acceptance", stage: "credit", desc: "Record the customer's response to the offer.", decision: "offerResponse", fields: [
      F("offerResponse", "Customer Response", "select", true, { o: ["Accepted", "Declined"] }), F("offerAcceptedOn", "Response Date", "date", true),
    ] },
    { title: "Post-Sanction Documents", stage: "credit", desc: "Collect post-sanction documents.", fields: [...p.postDocs, F("postDocsStatus", "Post-Sanction Documents", "select", true, { o: ["Uploaded & Verified"] })] },
    { title: p.titles[14], stage: "credit", desc: "Create the deal and the repayment mandate task.", fields: [
      F("nachMode", "Mandate Type", "select", true, { o: ["E-NACH", "E-Mandate", "PDC"] }), F("umrn", "UMRN / Mandate Ref", "text", true, { max: 40 }),
      F("mandateStatus", "Mandate Status", "select", true, { o: ["Registered"] }),
    ] },
    { title: "eSign + KFS + Loan Agreement", stage: "credit", desc: "Execute sanction documents.", fields: [
      F("kfsShared", "KFS Shared With Customer", "select", true, { o: ["Yes"] }), F("esignStatus", "eSign Status", "select", true, { o: ["Completed"] }),
      F("agreementNo", "Loan Agreement No.", "text", true, { max: 40 }),
    ] },
    { title: p.titles[16], stage: "credit", desc: p.descs[16], fields: [
      F("insurer", "Insurer", "text", true, { max: 100 }), F("policyNo", "Policy Number", "text", true, { max: 40 }),
      F("nomineeName", "Nominee Name", "text", true, { max: 100 }), F("nomineeRelation", "Nominee Relation", "select", true, { o: ["Spouse", "Son", "Daughter", "Parent", "Sibling", "Other"] }),
      ...(p.extraInsurance || []),
    ] },
    { title: "Ops Review", stage: "ops", desc: "Centralised Operations review. Discrepancies return to Sales for correction.", decision: "opsDecision", fields: [
      F("opsDecision", "Ops Review Result", "select", true, { o: ["Approved", "Discrepancy"] }), F("opsRemarks", "Ops Remarks", "textarea", true, { max: 500 }),
    ] },
    { title: "Disbursal Request", stage: "ops", desc: "Prepare the disbursal request.", fields: [
      F("disbursalAmount", "Disbursal Amount (₹)", "number", true, { min: 1 }), F("payee", "Payee / Beneficiary", "text", true, { max: 120 }),
      F("disbursalMode", "Disbursal Mode", "select", true, { o: ["NEFT", "RTGS", "IMPS"] }),
    ] },
    { title: "Push to LMS", stage: "ops", desc: "Push the completed case to the loan management system.", fields: [
      F("lmsConfirm", "Push this case to LMS", "select", true, { o: ["Yes"] }), F("lmsRemarks", "Remarks", "textarea", false, { max: 300 }),
    ] },
  ];
}

const PRODUCTS = {
  twoWheeler: {
    key: "twoWheeler", view: "journeyTwoWheeler", name: "Two Wheeler", code: "TW", baseLabel: "On-Road Price",
    baseFields: ["assetCost", "rto", "insurance", "hpn", "accessories"], maxLtv: 90, minLoan: 30000, maxLoan: 300000, maxTenure: 48,
    defaults: { interestRate: "14", tenure: "24", processingFeePct: "1.5", otherCharges: "0", advanceEmis: "1" },
    steps: commonSteps({
      titles: ["Quick Details Entry", "Customer Onboarding", "Employment / Reference / Repayment", "Loan & Scheme Details", "Dedupe & BSA & OHP Bill", "", "", "", "", "", "", "", "", "", "First Deal + NACH Task", "", "Insurance + Nominee"],
      descs: ["Capture the initial applicant and vehicle details.", "DigiLocker / CKYC onboarding including permanent address.", "Capture employment, reference and repayment details.", "Capture on-road economics, requested loan, LTV and scheme.", "Run dedupe, BSA and collect the OHP bill.", "", "Credit verifies the applicant, income and vehicle details.", "Trigger tele-verification and field investigation.", "", "Complete FI with geo-tagging and capture the report.", "", "", "", "", "", "", "Capture vehicle insurance and nominee."],
      minLoan: 30000, maxLoan: 300000, maxTenure: 48, schemes: ["Two Wheeler Standard", "Two Wheeler EV", "Festive Offer"],
      quick: [F("vehicleMake", "Vehicle Make", "text", true, { max: 60 }), F("vehicleModel", "Vehicle Model", "text", true, { max: 60 }), F("dealerName", "Dealer", "text", true, { max: 100 })],
      income: [F("employmentType", "Employment Type", "select", true, { o: ["Salaried", "Self Employed", "Daily Wage"] }), F("monthlyIncome", "Monthly Income (₹)", "number", true, { min: 1 }),
        F("employerName", "Employer / Business", "text", true, { max: 100 }), F("refName", "Reference Name", "text", true, { max: 100 }), F("refMobile", "Reference Mobile", "tel", true, { pat: "mobile" })],
      economics: [F("assetCost", "Ex-Showroom Price (₹)", "number", true, { min: 1 }), F("rto", "RTO (₹)", "number", false, { min: 0 }), F("insurance", "Insurance (₹)", "number", false, { min: 0 }),
        F("hpn", "HPN (₹)", "number", false, { min: 0 }), F("accessories", "Accessories (₹)", "number", false, { min: 0 })],
      docs: [F("ohpBillNo", "OHP Bill Number", "text", true, { max: 40 }), F("bsaStatus", "BSA Status", "select", true, { o: ["Verified", "Pending"] })],
      postDocs: [F("invoiceNo", "Dealer Invoice No.", "text", true, { max: 40 }), F("rcRef", "Registration / Temporary RC Ref", "text", false, { max: 40 })],
    }),
  },
  solar: {
    key: "solar", view: "journeySolar", name: "Solar Loan", code: "SL", baseLabel: "Project Cost",
    baseFields: ["assetCost"], maxLtv: 80, minLoan: 100000, maxLoan: 2000000, maxTenure: 84,
    defaults: { interestRate: "12", tenure: "60", processingFeePct: "1.5", otherCharges: "0", advanceEmis: "0" },
    steps: commonSteps({
      titles: ["Quick Lead Details", "Customer Onboarding", "Income / Business / Repayment", "Project & Scheme Details", "Dedupe / Banking / Documents", "", "", "", "", "", "", "", "", "", "Deal + NACH Task", "", "Project / Insurance / Nominee"],
      descs: ["Capture applicant and solar project lead details.", "KYC / CKYC, address and contact details.", "Capture income or business profile and repayment details.", "Capture project cost, requested loan, LTV and scheme.", "Run dedupe and collect banking and project documents.", "", "Credit verifies profile, documents and project parameters.", "Trigger tele-verification and FI where required.", "", "Complete the site / applicant FI with geo-tagging.", "", "", "", "", "", "", "Capture project protection and nominee details."],
      minLoan: 100000, maxLoan: 2000000, maxTenure: 84, schemes: ["Solar Residential", "Solar Commercial", "Agri Solar Pump"],
      quick: [F("capacityKw", "Plant Capacity (kW)", "number", true, { min: 0.5, max: 1000 }), F("projectType", "Project Type", "select", true, { o: ["Residential Rooftop", "Commercial Rooftop", "Agri Solar Pump"] }), F("vendorName", "Installer / Vendor", "text", true, { max: 100 })],
      income: [F("occupation", "Occupation", "select", true, { o: ["Salaried", "Business", "Farmer"] }), F("monthlyIncome", "Monthly Income (₹)", "number", true, { min: 1 }), F("monthlyObligations", "Monthly Obligations (₹)", "number", false, { min: 0 })],
      economics: [F("assetCost", "Project Cost (₹)", "number", true, { min: 1 }), F("subsidy", "Subsidy Expected (₹)", "number", false, { min: 0 })],
      docs: [F("quotationNo", "Vendor Quotation No.", "text", true, { max: 40 }), F("electricityBillNo", "Electricity Bill / Consumer No.", "text", true, { max: 40 })],
      postDocs: [F("installationCert", "Installation Completion Certificate Ref", "text", true, { max: 40 }), F("netMeterRef", "Net-Metering Application Ref", "text", false, { max: 40 })],
      extraInsurance: [F("projectInsured", "Solar Plant Insured", "select", true, { o: yn })],
    }),
  },
  lap: {
    key: "lap", view: "journeyLAP", name: "LAP", code: "LP", baseLabel: "Property Value",
    baseFields: ["assetCost"], maxLtv: 65, minLoan: 500000, maxLoan: 20000000, maxTenure: 180,
    defaults: { interestRate: "13", tenure: "120", processingFeePct: "1", otherCharges: "0", advanceEmis: "0" },
    steps: commonSteps({
      titles: ["Quick Lead Details", "Customer Onboarding", "Income / Business / Repayment", "Property & Loan Details", "Dedupe / Banking / Property Docs", "", "", "", "", "", "", "", "", "", "Deal + NACH Task", "", "Insurance + Nominee"],
      descs: ["Capture applicant, co-applicant and property lead details.", "KYC / CKYC, address and contact details.", "Capture business or salaried profile, obligations and repayment details.", "Capture property value, eligible loan, LTV and scheme.", "Run dedupe and collect banking, title and property documents.", "", "Credit verifies applicant, income, liabilities and property data.", "Trigger tele-verification and property / business FI.", "", "Complete property and business FI with geo-tagging.", "", "", "", "", "", "", "Capture borrower insurance and nominee details."],
      minLoan: 500000, maxLoan: 20000000, maxTenure: 180, schemes: ["LAP Self-Occupied", "LAP Commercial", "LAP Industrial"],
      quick: [F("propertyType", "Property Type", "select", true, { o: ["Residential", "Commercial", "Industrial", "Mixed Use"] }), F("propertyAddress", "Property Address", "textarea", true, { max: 400 }),
        F("loanPurpose", "Loan Purpose", "select", true, { o: ["Business Expansion", "Working Capital", "Education", "Medical", "Debt Consolidation"] }), F("coApplicantName", "Co-Applicant Name", "text", false, { max: 120 })],
      income: [F("businessType", "Business / Employment Type", "select", true, { o: ["Self Employed", "Salaried", "Professional", "Trader / Manufacturer"] }), F("monthlyIncome", "Monthly Income (₹)", "number", true, { min: 1 }),
        F("annualTurnover", "Annual Turnover (₹)", "number", false, { min: 0 }), F("monthlyObligations", "Existing Monthly Obligations (₹)", "number", false, { min: 0 })],
      economics: [F("assetCost", "Property Market Value (₹)", "number", true, { min: 1 }), F("propertyAge", "Property Age (years)", "number", false, { min: 0, max: 100 })],
      docs: [F("titleDeedRef", "Title Deed / Sale Deed Ref", "text", true, { max: 60 }), F("legalSearchStatus", "Title Search Status", "select", true, { o: ["Clear", "Pending"] }), F("valuationRef", "Valuation Report Ref", "text", true, { max: 60 })],
      postDocs: [F("mortgageDeedRef", "Mortgage / Original Property Docs Ref", "text", true, { max: 60 }), F("encumbranceRef", "Encumbrance Certificate Ref", "text", false, { max: 60 })],
    }),
  },
  tractor: {
    key: "tractor", view: "journeyTractor", name: "Tractor Loan", code: "TR", baseLabel: "Tractor Cost",
    baseFields: ["assetCost", "accessories"], maxLtv: 85, minLoan: 200000, maxLoan: 2500000, maxTenure: 84,
    defaults: { interestRate: "13", tenure: "60", processingFeePct: "1.5", otherCharges: "0", advanceEmis: "0" },
    steps: commonSteps({
      titles: ["Quick Lead Details", "Customer Onboarding", "Income / Agricultural Profile", "Tractor & Scheme Details", "Dedupe / Banking / Land Docs", "", "", "", "", "", "", "", "", "", "Deal + NACH Task", "", "Insurance + Nominee"],
      descs: ["Capture applicant, farmer / business and tractor details.", "KYC / CKYC, address and contact details.", "Capture agriculture / business income and repayment details.", "Capture tractor cost, requested loan, LTV and scheme.", "Run dedupe and collect banking, land and asset documents.", "", "Verify applicant, income and asset parameters.", "Trigger tele-verification and FI where required.", "", "Complete the farm / applicant FI with geo-tagging.", "", "", "", "", "", "", "Capture tractor insurance and nominee details."],
      minLoan: 200000, maxLoan: 2500000, maxTenure: 84, schemes: ["Tractor Standard", "Tractor Seasonal Repayment", "Tractor + Implement"],
      quick: [F("tractorMake", "Tractor Make", "text", true, { max: 60 }), F("tractorModel", "Tractor Model", "text", true, { max: 60 }), F("horsePower", "Horse Power (HP)", "number", true, { min: 10, max: 150 }), F("dealerName", "Dealer", "text", true, { max: 100 })],
      income: [F("landAcres", "Land Holding (acres)", "number", true, { min: 0 }), F("cropPattern", "Major Crops", "text", true, { max: 120 }), F("agriIncome", "Annual Agricultural Income (₹)", "number", true, { min: 1 }),
        F("otherIncome", "Other Annual Income (₹)", "number", false, { min: 0 }), F("repaymentPattern", "Repayment Pattern", "select", true, { o: ["Monthly", "Quarterly", "Half-Yearly (Harvest)"] })],
      economics: [F("assetCost", "Tractor Cost (₹)", "number", true, { min: 1 }), F("accessories", "Implements / Accessories (₹)", "number", false, { min: 0 })],
      docs: [F("landRecordNo", "Land Record (Khasra / 7-12) No.", "text", true, { max: 60 }), F("quotationNo", "Dealer Quotation No.", "text", true, { max: 40 })],
      postDocs: [F("invoiceNo", "Dealer Invoice No.", "text", true, { max: 40 }), F("rcRef", "Registration / RC Ref", "text", false, { max: 40 })],
    }),
  },
};


const KEY_BY_VIEW = Object.fromEntries(Object.values(PRODUCTS).map((p) => [p.view, p.key]));
const FIXED_TITLES = { 6: "Push to Credit", 7: "Credit Verification", 8: "Tele Verification & FI Trigger", 9: "FI Allocation / Agent", 10: "Field Investigation Completion", 11: "Credit Recommendation", 12: "Offer Generation", 13: "Offer Acceptance", 14: "Post-Sanction Documents", 16: "eSign + KFS + Loan Agreement", 18: "Ops Review", 19: "Disbursal Request", 20: "Push to LMS" };
Object.values(PRODUCTS).forEach((p) => p.steps.forEach((s, i) => { s.no = i + 1; s.title = s.title || FIXED_TITLES[i + 1]; }));

// Roles by workflow stage. CEO / System Admin may act on every stage (administrative override, audited).
const SALES = ["BSO", "BDM", "ASM", "RSM", "ZSM", "CBO", "Sales User"];
const CREDIT = ["BCM", "ACM", "ZCM", "Credit Head", "Underwriter", "Appraiser", "Credit User"];
const OPS = ["Central Operations", "Disbursement Officer", "Operations Checker"];
const ADMIN = ["CEO", "System Admin", "admin", "super_admin", "ADMIN", "SUPER_ADMIN"];
const VIEW_ONLY = ["Audit Manager", "Compliance Manager", "Compliance Officer"];
const ACT_ROLES = { sales: [...SALES, ...ADMIN], credit: [...CREDIT, ...ADMIN], ops: [...OPS, ...ADMIN] };
const GLOBAL_VIEW = [...CREDIT, ...OPS, ...ADMIN, ...VIEW_ONLY];

function publicProduct(p) {
  return { key: p.key, view: p.view, name: p.name, code: p.code, baseLabel: p.baseLabel, baseFields: p.baseFields, maxLtv: p.maxLtv, minLoan: p.minLoan, maxLoan: p.maxLoan, defaults: p.defaults,
    steps: p.steps.map((s) => ({ no: s.no, title: s.title, stage: s.stage, desc: s.desc, fields: s.fields.map(({ pat, ...f }) => (pat ? { ...f, pat } : f)) })) };
}

module.exports = { PATTERNS, PRODUCTS, KEY_BY_VIEW, STAGES, ACT_ROLES, GLOBAL_VIEW, SALES, ADMIN, publicProduct };
