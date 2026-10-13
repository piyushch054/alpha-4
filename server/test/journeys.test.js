const { test } = require("node:test");
const assert = require("node:assert/strict");
const { PRODUCTS, KEY_BY_VIEW } = require("../config/journeys");
const svc = require("../services/journeys");

const keys = ["twoWheeler", "solar", "lap", "tractor"];

test("four product journeys each define the 20-step flow with product-specific fields", () => {
  assert.deepEqual(Object.keys(PRODUCTS).sort(), [...keys].sort());
  for (const k of keys) {
    const p = PRODUCTS[k];
    assert.equal(p.steps.length, 20, k);
    assert.equal(p.steps[0].no, 1);
    assert.equal(p.steps[19].title, "Push to LMS");
    assert.ok(p.steps.every((s) => s.title && s.fields.length), `${k} has untitled/empty step`);
  }
  assert.equal(KEY_BY_VIEW.journeyTwoWheeler, "twoWheeler");
  const names = (k) => new Set(PRODUCTS[k].steps.flatMap((s) => s.fields.map((f) => f.n)));
  assert.ok(names("twoWheeler").has("hpn") && !names("solar").has("hpn"));
  assert.ok(names("solar").has("capacityKw") && names("lap").has("titleDeedRef") && names("tractor").has("landAcres"));
});

test("two-wheeler economics: on-road base, LTV, margin, charges and disbursement", () => {
  const p = PRODUCTS.twoWheeler;
  const c = svc.calculate(p, { assetCost: "82000", rto: "7000", insurance: "7000", hpn: "500", accessories: "3500", loanAmount: "75000", interestRate: "0", tenure: "24", processingFeePct: "1.5", otherCharges: "2875", advanceEmis: "1" });
  assert.equal(c.base, 100000);
  assert.equal(c.ltv, 75);
  assert.equal(c.margin, 25000);
  assert.equal(c.processingFee, 1125);
  assert.equal(c.emi, 3125);
  assert.equal(c.estimatedDisbursement, 75000 - 1125 - 2875 - 3125);
});

test("LAP caps eligible loan at the LTV limit and rejects an over-limit request", () => {
  const p = PRODUCTS.lap;
  const step = p.steps[3];
  const d = { assetCost: "10000000", loanAmount: "7000000", interestRate: "13", tenure: "120", processingFeePct: "1", scheme: "LAP Commercial" };
  assert.equal(svc.calculate(p, d).eligibleLoan, 6500000);
  assert.match(svc.validateStep(p, step, d).loanAmount, /LTV/);
  assert.equal(svc.validateStep(p, step, { ...d, loanAmount: "6000000" }).loanAmount, undefined);
});

test("validation: required, patterns, ranges and conditional FI skip", () => {
  const p = PRODUCTS.tractor;
  const e = svc.validateStep(p, p.steps[1], { pan: "bad", pincode: "12", aadhaarLast4: "12" });
  for (const f of ["kycMode", "pan", "pincode", "aadhaarLast4", "dob", "permanentAddress"]) assert.ok(e[f], f);
  assert.deepEqual(svc.validateStep(p, p.steps[8], { fiRequired: "No" }), {});
  assert.ok(svc.validateStep(p, p.steps[8], { fiRequired: "Yes" }).fiAgent);
  assert.match(svc.validateStep(p, p.steps[3], { loanAmount: "10" }).loanAmount, /at least/);
});

test("sanitize accepts only the step's own fields and rejects non-string values", () => {
  const p = PRODUCTS.solar;
  const d = svc.sanitize(p.steps[0], { customerName: " Asha ", isAdmin: true, role: "CEO" }, {});
  assert.deepEqual(d, { customerName: "Asha" });
  assert.throws(() => svc.sanitize(p.steps[0], { customerName: { $gt: "" } }), /invalid/);
});

test("workflow transitions: advance, send back, reject, complete", () => {
  const p = PRODUCTS.twoWheeler;
  const j = (completed, data = {}) => ({ completedSteps: completed, data });
  let r = svc.advance(p, j([], {}), p.steps[0]);
  assert.deepEqual([r.currentStep, r.status], [2, "Sales Stage"]);
  r = svc.advance(p, j([1, 2, 3, 4, 5], {}), p.steps[5]);
  assert.deepEqual([r.currentStep, r.status], [7, "Credit Review"]);
  r = svc.advance(p, j([1, 2, 3, 4, 5, 6], { creditDecision: "Send Back" }), p.steps[6]);
  assert.deepEqual([r.currentStep, r.status, r.completedSteps, r.clear], [6, "Sent Back", [1, 2, 3, 4, 5], ["creditDecision"]]);
  assert.equal(svc.advance(p, j([], { creditDecision: "Reject" }), p.steps[6]).status, "Rejected");
  assert.equal(svc.advance(p, j([], { offerResponse: "Declined" }), p.steps[12]).status, "Rejected");
  r = svc.advance(p, j([], { opsDecision: "Discrepancy" }), p.steps[17]);
  assert.deepEqual([r.currentStep, r.status], [14, "Sent Back"]);
  r = svc.advance(p, j([], {}), p.steps[17]);
  assert.deepEqual([r.currentStep, r.status], [19, "Operations"]);
  assert.equal(svc.advance(p, j([], {}), p.steps[19]).status, "Completed");
});

test("RBAC: stage ownership, admin override, view-only auditors, sales scoping", () => {
  const p = PRODUCTS.solar;
  assert.ok(svc.canAct({ role: "BSO" }, p.steps[0]) && !svc.canAct({ role: "BSO" }, p.steps[6]));
  assert.ok(svc.canAct({ role: "BCM" }, p.steps[6]) && !svc.canAct({ role: "BCM" }, p.steps[17]));
  assert.ok(svc.canAct({ role: "Central Operations" }, p.steps[17]) && !svc.canAct({ role: "Central Operations" }, p.steps[0]));
  assert.ok(svc.canAct({ role: "CEO" }, p.steps[17]));
  assert.ok(!svc.canAct({ role: "Audit Manager" }, p.steps[0]) && svc.canView({ role: "Audit Manager" }));
  assert.ok(!svc.canView({ role: "HR Manager" }) && !svc.canView({ role: "Travel Desk" }) && !svc.canCreate({ role: "BCM" }));
  assert.deepEqual(svc.scopeFor({ role: "BSO", _id: "u1" }), { createdBy: "u1" });
  assert.deepEqual(svc.scopeFor({ role: "BCM", _id: "u2" }), {});
});
