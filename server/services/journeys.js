const { PATTERNS, PRODUCTS, ACT_ROLES, GLOBAL_VIEW, SALES } = require("../config/journeys");

function fail(message, status = 400, errors) {
  const error = new Error(message);
  error.status = status;
  if (errors) error.errors = errors;
  throw error;
}

const num = (v) => (v === undefined || v === null || v === "" || Number.isNaN(Number(v)) ? 0 : Number(v));
const round = (v) => Math.round(v * 100) / 100;

function emi(principal, annualRate, months) {
  const p = num(principal), n = num(months), r = num(annualRate) / 1200;
  if (!p || !n) return 0;
  return round(r ? (p * r * (1 + r) ** n) / ((1 + r) ** n - 1) : p / n);
}

// Product economics shared by every journey; the product config decides which fields form the asset base.
function calculate(product, d) {
  const base = round(product.baseFields.reduce((s, k) => s + num(d[k]), 0));
  const loan = num(d.loanAmount);
  const emiAmount = emi(loan, d.interestRate, d.tenure);
  const processingFee = round((loan * num(d.processingFeePct)) / 100);
  const advanceEmi = round(emiAmount * num(d.advanceEmis));
  const subsidy = num(d.subsidy);
  return {
    base,
    ltv: base ? round((loan / base) * 100) : 0,
    eligibleLoan: round((base * product.maxLtv) / 100),
    margin: round(Math.max(0, base - loan)),
    downPayment: round(Math.max(0, base - loan) + processingFee + num(d.otherCharges) + advanceEmi),
    emi: emiAmount,
    processingFee,
    advanceEmi,
    estimatedDisbursement: round(loan - processingFee - num(d.otherCharges) - advanceEmi),
    subsidy,
  };
}

const stageStatus = { sales: "Sales Stage", credit: "Credit Review", ops: "Operations" };

function sanitize(step, input, existing = {}) {
  const out = {};
  if (input && typeof input !== "object") fail("Invalid data");
  for (const f of step.fields) {
    if (!(f.n in (input || {}))) continue;
    let v = input[f.n];
    if (v === null || v === undefined) v = "";
    if (typeof v === "number") v = String(v);
    if (typeof v !== "string") fail(`${f.l} is invalid`);
    v = v.trim();
    if (f.upper) v = v.toUpperCase();
    if (v.length > (f.max || 200)) fail(`${f.l} must be at most ${f.max || 200} characters`);
    out[f.n] = v;
  }
  return { ...existing, ...out };
}

function skipped(f, d) { return !!f.skip && d[f.skip.f] === f.skip.v; }

function validateStep(product, step, d, { strict = true } = {}) {
  const errors = {};
  for (const f of step.fields) {
    const v = d[f.n] ?? "";
    if (skipped(f, d)) continue;
    if (v === "") {
      if (strict && f.r) errors[f.n] = `${f.l} is required`;
      continue;
    }
    if (f.t === "number") {
      if (!Number.isFinite(Number(v))) errors[f.n] = `${f.l} must be a number`;
      else if (f.min !== undefined && Number(v) < f.min) errors[f.n] = `${f.l} must be at least ${f.min}`;
      else if (f.max !== undefined && Number(v) > f.max) errors[f.n] = `${f.l} must be at most ${f.max}`;
    } else if (f.t === "select" && !f.o.includes(v)) errors[f.n] = `${f.l} has an invalid option`;
    else if (f.t === "date" && Number.isNaN(Date.parse(v))) errors[f.n] = `${f.l} must be a valid date`;
    else if (f.pat && !PATTERNS[f.pat].re.test(v)) errors[f.n] = `${f.l} ${PATTERNS[f.pat].msg}`;
  }
  if (strict) Object.assign(errors, ruleErrors(product, step, d));
  return errors;
}

// Product-specific business rules evaluated when a step is completed.
function ruleErrors(product, step, d) {
  const e = {};
  const c = calculate(product, d);
  if (step.no === 4) {
    if (c.base && num(d.loanAmount) > c.eligibleLoan) e.loanAmount = `Requested loan exceeds the ${product.maxLtv}% LTV limit (max ₹${c.eligibleLoan.toLocaleString("en-IN")} on ${product.baseLabel})`;
    if (product.key === "solar" && num(d.subsidy) > num(d.assetCost)) e.subsidy = "Subsidy cannot exceed the project cost";
    if (c.estimatedDisbursement <= 0) e.loanAmount = e.loanAmount || "Charges and advance EMI leave no disbursable amount";
  }
  if (step.no === 11 && d.recommendation === "Recommend") {
    if (num(d.approvedAmount) > num(d.loanAmount)) e.approvedAmount = "Approved amount cannot exceed the requested loan";
    if (num(d.approvedAmount) > c.eligibleLoan) e.approvedAmount = `Approved amount exceeds the ${product.maxLtv}% LTV limit`;
  }
  if (step.no === 19 && num(d.disbursalAmount) > num(d.approvedAmount || d.loanAmount)) e.disbursalAmount = "Disbursal cannot exceed the approved amount";
  return e;
}

function canAct(user, step) { return ACT_ROLES[step.stage].includes(user.role); }
function canCreate(user) { return ACT_ROLES.sales.includes(user.role); }
function canView(user) { return [...SALES, ...GLOBAL_VIEW].includes(user.role); }
function scopeFor(user) { return GLOBAL_VIEW.includes(user.role) ? {} : { createdBy: user._id }; }

function productFor(key) {
  const p = PRODUCTS[key];
  if (!p) fail("Unknown product journey", 400);
  return p;
}

function initialData(product) {
  return { ...product.defaults };
}

function statusFor(j) {
  return j.status;
}

// Applies the effect of completing the current step. Returns the new { currentStep, status } without touching completed history.
function advance(product, journey, step) {
  const d = journey.data;
  const done = new Set(journey.completedSteps);
  done.add(step.no);
  const result = { completedSteps: [...done].sort((a, b) => a - b), currentStep: step.no + 1, status: "In Progress", note: "", clear: [] };
  const reject = (note) => Object.assign(result, { status: "Rejected", currentStep: step.no, note });
  const sendBack = (to, note, field) => {
    result.clear.push(field);
    result.completedSteps = result.completedSteps.filter((n) => n < to);
    Object.assign(result, { status: "Sent Back", currentStep: to, note });
  };
  if (step.no === 7 && d.creditDecision === "Reject") reject("Rejected at credit verification");
  else if (step.no === 7 && d.creditDecision === "Send Back") sendBack(6, "Sent back to Sales by Credit", "creditDecision");
  else if (step.no === 11 && d.recommendation === "Decline") reject("Declined at credit recommendation");
  else if (step.no === 13 && d.offerResponse === "Declined") reject("Offer declined by customer");
  else if (step.no === 18 && d.opsDecision === "Discrepancy") sendBack(14, "Operations discrepancy - returned for post-sanction documents", "opsDecision");
  else if (step.no === product.steps.length) Object.assign(result, { status: "Completed", currentStep: step.no, note: "Pushed to LMS" });
  if (result.status === "In Progress") result.status = stageStatus[product.steps[result.currentStep - 1].stage];
  return result;
}

module.exports = { fail, calculate, emi, sanitize, validateStep, canAct, canCreate, canView, scopeFor, productFor, initialData, statusFor, advance, skipped };
