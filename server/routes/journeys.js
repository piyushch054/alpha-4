const router = require("express").Router();
const mongoose = require("mongoose");
const Journey = require("../models/Journey");
const { PRODUCTS, ACT_ROLES, publicProduct } = require("../config/journeys");
const svc = require("../services/journeys");

router.use(require("../middleware/authMiddleware"));

const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message, ...(error.errors ? { errors: error.errors } : {}) });
    next(error);
  }
};

router.use((req, res, next) => {
  if (!svc.canView(req.user)) return res.status(403).json({ success: false, message: "Access restricted for your role" });
  next();
});

const summary = (j) => ({
  id: j._id, journeyNo: j.journeyNo, productKey: j.productKey, product: j.product, status: j.status, currentStep: j.currentStep,
  completedSteps: j.completedSteps, customerName: j.data?.customerName || "", loanAmount: j.data?.loanAmount || "", createdByName: j.createdByName, updatedAt: j.updatedAt,
});

async function load(req) {
  if (!mongoose.isValidObjectId(req.params.id)) svc.fail("Invalid journey ID", 400);
  const journey = await Journey.findOne({ _id: req.params.id, ...svc.scopeFor(req.user) });
  if (!journey) svc.fail("Journey not found or outside your access scope", 404);
  const product = svc.productFor(journey.productKey);
  return { journey, product };
}

router.get("/config", (req, res) => res.json({ success: true, data: Object.values(PRODUCTS).map(publicProduct), actRoles: ACT_ROLES }));

router.get("/", handle(async (req, res) => {
  const query = svc.scopeFor(req.user);
  if (req.query.product !== undefined) {
    if (typeof req.query.product !== "string" || !PRODUCTS[req.query.product]) svc.fail("Unknown product journey", 400);
    query.productKey = req.query.product;
  }
  const rows = await Journey.find(query).sort({ updatedAt: -1 }).limit(100);
  res.json({ success: true, data: rows.map(summary) });
}));

router.post("/", handle(async (req, res) => {
  svc.fail("Start new product cases through CRM Lead Capture so consent, OTP, and customer dedupe are completed first.", 410);
}));

router.get("/:id", handle(async (req, res) => {
  const { journey } = await load(req);
  res.json({ success: true, data: journey });
}));

router.put("/:id/draft", handle(async (req, res) => {
  await load(req);
  svc.fail("Standalone product journeys are read-only. Continue new cases through CRM Lead Capture and the shared lifecycle.", 410);
}));

router.post("/:id/steps/:step/complete", handle(async (req, res) => {
  await load(req);
  svc.fail("Standalone product journeys are read-only. Continue new cases through CRM Lead Capture and the shared lifecycle.", 410);
}));

module.exports = router;
