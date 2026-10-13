const router = require("express").Router();
const mongoose = require("mongoose");
const { MENU, ENTITIES, ROLES, ACCOUNT_TYPES, MONTHS, PAY_MODES } = require("../config/gl");
const C = require("../services/glCommon");
const E = require("../services/glEntities");
const V = require("../services/glVouchers");
const R = require("../services/glReports");
const O = require("../services/glOps");

router.use(require("../middleware/authMiddleware"));

const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message, ...(error.errors ? { errors: error.errors } : {}) });
    if (error.name === "CastError" || error.name === "ValidationError") return res.status(400).json({ success: false, message: "Invalid request" });
    next(error);
  }
};

// Authorisation is decided from the JWT-authenticated user only.
router.use((req, res, next) => {
  if (!C.inRoles(req.user, "view")) return res.status(403).json({ success: false, message: "Access restricted for your role" });
  next();
});

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const body = (req) => (req.body && typeof req.body === "object" ? req.body : {});
const csv = (res, name, text) => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${name}.csv"`);
  res.send(text);
};
const validId = (id) => { if (!mongoose.isValidObjectId(id)) throw C.fail("Invalid record id", 400); };

router.get("/meta", handle(async (req, res) => {
  const caps = Object.fromEntries(Object.keys(ROLES).map((k) => [k, C.inRoles(req.user, k)]));
  ok(res, { menu: MENU, entities: ENTITIES, caps, user: { id: String(req.user._id), name: req.user.name, role: req.user.role }, enums: { accountTypes: ACCOUNT_TYPES, months: MONTHS, payModes: PAY_MODES, voucherTypes: V.VTYPES } });
}));

router.get("/dashboard", handle(async (req, res) => ok(res, await R.dashboard())));
router.get("/options/:kind", handle(async (req, res) => ok(res, await E.options(req.params.kind, req.query))));

// ---- generic records ----
router.get("/e/:kind/export.csv", handle(async (req, res) => csv(res, `gl-${req.params.kind}`, await E.exportCsv(req.params.kind, req.query))));
router.get("/e/:kind", handle(async (req, res) => ok(res, await E.list(req.params.kind, req.query))));
router.post("/bills/upload", handle(async (req, res) => ok(res, await O.uploadRcmBills(req.user, body(req).text), 201)));
router.post("/e/:kind", handle(async (req, res) => ok(res, await E.create(req.user, req.params.kind, body(req), O.createHooks(req.params.kind, req.user)), 201)));
router.post("/e/period/:id/:action(close|reopen)", handle(async (req, res) => { validId(req.params.id); ok(res, await V.setPeriod(req.user, req.params.id, req.params.action)); }));
router.get("/e/:kind/:id", handle(async (req, res) => { validId(req.params.id); ok(res, await E.get(req.params.kind, req.params.id)); }));
router.put("/e/:kind/:id", handle(async (req, res) => { validId(req.params.id); ok(res, await E.update(req.user, req.params.kind, req.params.id, body(req))); }));
router.delete("/e/:kind/:id", handle(async (req, res) => { validId(req.params.id); ok(res, await E.remove(req.user, req.params.kind, req.params.id)); }));
router.post("/e/:kind/:id/:action", handle(async (req, res) => { validId(req.params.id); ok(res, await O.entityAction(req.user, req.params.kind, req.params.id, req.params.action, body(req))); }));

// ---- vouchers ----
router.get("/vouchers/export.csv", handle(async (req, res) => csv(res, "gl-vouchers", await V.exportCsv(req.query))));
router.get("/vouchers", handle(async (req, res) => ok(res, await V.list({ ...req.query, _uid: String(req.user._id) }))));
router.post("/vouchers/upload", handle(async (req, res) => ok(res, await V.uploadCsv(req.user, body(req).text, body(req).mode === "limited" ? "limited" : "general"), 201)));
router.post("/vouchers", handle(async (req, res) => ok(res, await V.create(req.user, body(req), body(req).mode === "limited" ? "limited" : "general"), 201)));
router.get("/vouchers/:no", handle(async (req, res) => ok(res, await V.get(req.params.no))));
router.put("/vouchers/:no", handle(async (req, res) => ok(res, await V.update(req.user, req.params.no, body(req)))));
router.post("/vouchers/:no/approve", handle(async (req, res) => ok(res, await V.approve(req.user, req.params.no))));
router.post("/vouchers/:no/reject", handle(async (req, res) => ok(res, await V.reject(req.user, req.params.no, body(req).reason))));
router.post("/vouchers/:no/reverse", handle(async (req, res) => ok(res, await V.reverse(req.user, req.params.no, body(req)), 201)));
router.post("/vouchers/:no/cheque", handle(async (req, res) => ok(res, await V.editCheque(req.user, req.params.no, body(req).chequeNo))));

// ---- year end / fixed assets ----
router.get("/year-end/preview", handle(async (req, res) => ok(res, await R.yearEndPreview(req.query))));
router.post("/year-end", handle(async (req, res) => ok(res, await R.yearEnd(req.user, body(req)))));
router.post("/depreciation", handle(async (req, res) => ok(res, await O.runDepreciation(req.user, body(req)), 201)));

// ---- bank reconciliation ----
router.post("/recon/upload/:kind(bankstmt|tallyentry)", handle(async (req, res) => ok(res, await O.uploadRows(req.user, req.params.kind, body(req).bank, body(req).text), 201)));
router.get("/recon/lists", handle(async (req, res) => ok(res, await O.reconLists(req.query))));
router.post("/recon/match", handle(async (req, res) => ok(res, await O.matchPair(req.user, body(req).statement, body(req).source, body(req).reference))));
router.post("/recon/unmatch", handle(async (req, res) => ok(res, await O.unmatch(req.user, body(req).statement))));
router.post("/recon/auto", handle(async (req, res) => ok(res, await O.autoReconcile(req.user, body(req)))));
router.post("/recon/upload-match", handle(async (req, res) => ok(res, await O.reconUpload(req.user, body(req)))));

// ---- reports ----
router.get("/reports/:name", handle(async (req, res) => {
  const fn = R.registry[req.params.name] || O.registry[req.params.name];
  if (!fn) throw C.fail("Unknown report", 404);
  const rep = await fn(req.query);
  if (req.query.format === "csv") return csv(res, `gl-${req.params.name}`, C.toCsv(rep.columns, [...rep.rows, ...(rep.totals ? [rep.totals] : [])]));
  const size = Math.min(500, Math.max(1, parseInt(req.query.size, 10) || 100));
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  ok(res, { ...rep, total: rep.rows.length, page, size, rows: rep.rows.slice((page - 1) * size, page * size) });
}));

module.exports = router;
