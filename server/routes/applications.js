const router = require("express").Router();
const Application = require("../models/Application");
const {
  permission,
  scope,
  fail,
  validatePD,
  assertSendToCAM,
  assertBureauCheck,
  assertCompletePD,
  text,
} = require("../services/pd");
router.use(require("../middleware/authMiddleware"));
const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    if (error.status)
      return res
        .status(error.status)
        .json({ success: false, message: error.message });
    next(error);
  }
};
const id = (req) => {
  if (!/^[A-Za-z0-9-]{3,80}$/.test(req.params.id))
    fail("Invalid application ID");
  return req.params.id;
};
const imdReference = (applicationId) =>
  `SIM-IMD-${applicationId.replace(/[^A-Za-z0-9]/g, "").slice(-10).toUpperCase()}`;
const imdFee = 1500;
async function record(req, action) {
  permission(req.user, action);
  const app = await Application.findOne({
    _id: id(req),
    ...scope(req.user, action),
  });
  if (!app) fail("Application not found or outside your access scope", 404);
  return app;
}
async function imdRecord(req) {
  if (req.user.role !== "BDM") fail("Only BDM can work the IMD queue", 403);
  const app = await Application.findOne({
    _id: id(req),
    status: "IMD Pending",
    workflowOwnerRole: "BDM",
  });
  if (!app) fail("IMD application not found or not assigned to BDM", 404);
  return app;
}
router.get(
  "/imd-queue",
  handle(async (req, res) => {
    if (req.user.role !== "BDM" && req.user.role !== "CEO" && req.user.role !== "System Admin")
      fail("Only BDM can view the IMD queue", 403);
    const applications = await Application.find({
      status: "IMD Pending",
      workflowOwnerRole: "BDM",
    })
      .sort({ updatedAt: -1 })
      .limit(200);
    res.json({ success: true, data: applications });
  }),
);
router.get(
  "/",
  handle(async (req, res) => {
    permission(req.user, "view");
    res.json({
      success: true,
      data: await Application.find(scope(req.user, "view"))
        .sort({ updatedAt: -1 })
        .limit(200),
    });
  }),
);
// Persist an existing user-created browser LOS case using its original ID. No seeded/demo cases are imported.
router.put(
  "/:id/draft",
  handle(async (req, res) => {
    permission(req.user, "save");
    const key = id(req);
    const customer = text(req.body.customer, "Customer", 200);
    const product = text(req.body.product, "Product", 80);
    if (
      !["Two Wheeler", "MSME", "LAP", "Solar Loan", "Tractor Loan"].includes(
        product,
      )
    )
      fail("Invalid loan product");
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0)
      fail("A positive application amount is required");
    const existing = await Application.findById(key);
    const writeScope = scope(req.user, "save");
    if (
      existing &&
      writeScope.user &&
      String(existing.user) !== String(req.user._id)
    )
      fail("Application is outside your access scope", 403);
    if (
      req.body.draft &&
      (typeof req.body.draft !== "object" || Array.isArray(req.body.draft))
    )
      fail("Invalid application draft");
    const fields = {
      customer,
      product,
      amount,
      mobile: text(req.body.mobile || "", "Mobile", 30, false),
      branch: text(req.body.branch || "", "Branch", 200, false),
      leadId: text(req.body.leadId || `LEAD-${key}`, "Lead ID", 120),
      customerId: text(req.body.customerId || `CUS-${key}`, "Customer ID", 120),
      scheme: text(req.body.scheme || `${product} Standard`, "Scheme", 120),
      draft: req.body.draft || {},
    };
    let app;
    if (existing) {
      if (req.body.version !== existing.__v)
        fail("Application draft changed. Reload before saving.", 409);
      app = await Application.findOneAndUpdate(
        { _id: key, __v: existing.__v, ...scope(req.user) },
        { $set: fields, $inc: { __v: 1 } },
        { new: true, runValidators: true },
      );
      if (!app) fail("Application changed. Reload before saving.", 409);
    } else {
      try {
        app = await Application.create({
          _id: key,
          ...fields,
          user: req.user._id,
          status: "Sales/Predeal",
        });
      } catch (error) {
        if (error.code === 11000)
          fail("Application already exists. Reload before saving.", 409);
        throw error;
      }
    }
    res.json({ success: true, data: app });
  }),
);
router.post(
  "/:id/send-to-imd",
  handle(async (req, res) => {
    if (req.user.role !== "BSO") fail("Only BSO can submit LOS to BDM", 403);
    const key = id(req);
    const app = await Application.findOne({ _id: key, user: req.user._id });
    if (!app) fail("Application not found or outside your access scope", 404);
    if (app.status === "IMD Pending" && app.workflowOwnerRole === "BDM")
      return res.json({ success: true, data: app });
    if (app.status !== "Sales/Predeal")
      fail("Complete the LOS application before sending it to BDM", 409);
    const pdVerified =
      !!app.pd &&
      app.pdVerification?.status === "Verified" &&
      app.pdVerification.revision === app.pd.revision;
    const pdDemoBypass = !pdVerified && app.draft?.pdDemoBypass === true;
    if (
      !pdVerified &&
      !pdDemoBypass
    )
      fail("Complete and verify BSO Personal Discussion before sending to BDM", 409);
    const now = new Date();
    const saved = await Application.findOneAndUpdate(
      { _id: key, user: req.user._id, __v: app.__v, status: "Sales/Predeal" },
      {
        $set: {
          status: "IMD Pending",
          workflowOwnerRole: "BDM",
          imd: {
            status: "Pending",
            amount: imdFee,
            simulatorReference: imdReference(key),
          },
          ...(pdDemoBypass
            ? {
                pdDemoBypass: {
                  enabled: true,
                  by: req.user._id,
                  at: now,
                },
              }
            : {}),
        },
        $inc: { __v: 1 },
        $push: {
          audit: {
            action: pdDemoBypass
              ? "LOS Submitted to BDM · IMD Pending · PD demo bypass"
              : "LOS Submitted to BDM · IMD Pending",
            at: now,
            by: req.user._id,
            revision: app.pd?.revision || 0,
            details: pdDemoBypass
              ? "PD not performed; no visit, photo, geotag, PD record, or verification captured."
              : app.leadId || key,
          },
        },
      },
      { new: true, runValidators: true },
    );
    if (!saved) fail("Application changed. Reload before sending it to BDM.", 409);
    res.json({ success: true, data: saved });
  }),
);
router.post(
  "/:id/imd-reference",
  handle(async (req, res) => {
    const app = await imdRecord(req);
    const reference = String(req.body.reference || "").trim();
    const amount = Number(req.body.amount);
    if (!/^[A-Za-z0-9-]{6,32}$/.test(reference))
      fail("Enter a valid 6–32 character payment reference");
    if (!Number.isSafeInteger(amount) || amount <= 0)
      fail("Enter a positive received amount");
    if (!["Pending", "Mismatch"].includes(app.imd?.status))
      fail("A reference can only be submitted for a pending IMD");
    const now = new Date();
    const saved = await Application.findOneAndUpdate(
      { _id: app.id, __v: app.__v, status: "IMD Pending" },
      {
        $set: {
          "imd.status": "Submitted",
          "imd.reference": reference,
          "imd.submittedAmount": amount,
          "imd.submittedBy": req.user._id,
          "imd.submittedAt": now,
        },
        $inc: { __v: 1 },
        $push: {
          audit: {
            action: "IMD Reference Submitted",
            at: now,
            by: req.user._id,
            details: `${reference} · ₹${amount}`,
          },
        },
      },
      { new: true, runValidators: true },
    );
    if (!saved) fail("Application changed. Reload before submitting the reference.", 409);
    res.json({ success: true, data: saved });
  }),
);
router.post(
  "/:id/verify-imd",
  handle(async (req, res) => {
    const app = await imdRecord(req);
    if (app.imd?.status !== "Submitted")
      fail("Submit an IMD payment reference before verification", 409);
    const matched =
      app.imd.reference?.toLowerCase() === app.imd.simulatorReference?.toLowerCase() &&
      app.imd.submittedAmount === app.imd.amount;
    const now = new Date();
    const status = matched ? "Verified" : "Mismatch";
    const saved = await Application.findOneAndUpdate(
      { _id: app.id, __v: app.__v, status: "IMD Pending" },
      {
        $set: {
          "imd.status": status,
          ...(matched
            ? {
                "imd.verifiedBy": req.user._id,
                "imd.verifiedByName": req.user.name,
                "imd.verifiedAt": now,
                "imd.transactionId": app.imd.reference,
              }
            : {}),
        },
        $inc: { __v: 1 },
        $push: {
          audit: {
            action: `IMD Transaction ${status}`,
            at: now,
            by: req.user._id,
            details: matched ? app.imd.reference : "Reference or amount did not match the local demo simulator",
          },
        },
      },
      { new: true, runValidators: true },
    );
    if (!saved) fail("Application changed. Reload before verifying the reference.", 409);
    res.json({ success: true, data: saved });
  }),
);
router.post(
  "/:id/return-to-imd",
  handle(async (req, res) => {
    if (req.user.role !== "BDM")
      fail("Only BDM can return an application to IMD & BSA verification", 403);
    const key = id(req);
    const app = await Application.findOne({ _id: key });
    if (!app) fail("Application not found", 404);
    if (app.imd?.status === "Verified")
      fail("This application already has verified IMD and does not need to return to BDM", 409);
    if (app.status === "IMD Pending" && app.workflowOwnerRole === "BDM")
      return res.json({ success: true, data: app });
    const recoverableStatuses = [
      "Credit Review",
      "CAM Allocation",
      "CAM Sheet",
      "Underwriting",
      "Operations Review",
      "Sanction Review",
    ];
    if (!recoverableStatuses.includes(app.status))
      fail("Only a pre-sanction application can be returned to IMD & BSA", 409);
    const now = new Date();
    const previousStatus = app.status;
    const saved = await Application.findOneAndUpdate(
      { _id: key, __v: app.__v, status: previousStatus },
      {
        $set: {
          status: "IMD Pending",
          workflowOwnerRole: "BDM",
          imd: {
            status: "Pending",
            amount: app.imd?.amount || imdFee,
            simulatorReference: app.imd?.simulatorReference || imdReference(key),
          },
        },
        $inc: { __v: 1 },
        $push: {
          audit: {
            action: "Returned to BDM · IMD & BSA Before Credit",
            at: now,
            by: req.user._id,
            details: `Returned from ${previousStatus}; downstream review must be repeated after BDM verification`,
          },
        },
      },
      { new: true, runValidators: true },
    );
    if (!saved)
      fail("Application changed. Reload before returning it to IMD & BSA.", 409);
    res.json({ success: true, data: saved });
  }),
);
router.post(
  "/:id/send-to-credit",
  handle(async (req, res) => {
    const app = await imdRecord(req);
    if (app.imd?.status !== "Verified")
      fail("Verify the IMD reference before sending to Credit", 409);
    const now = new Date();
    const saved = await Application.findOneAndUpdate(
      { _id: app.id, __v: app.__v, status: "IMD Pending" },
      {
        $set: { status: "Credit Review", workflowOwnerRole: "BCM" },
        $inc: { __v: 1 },
        $push: {
          audit: {
            action: "Application Sent to Credit",
            at: now,
            by: req.user._id,
            details: "IMD reference verified by BDM",
          },
        },
      },
      { new: true, runValidators: true },
    );
    if (!saved) fail("Application changed. Reload before sending it to Credit.", 409);
    res.json({ success: true, data: saved });
  }),
);
router.get(
  "/:id/pd",
  handle(async (req, res) => {
    const app = await record(req, "view");
    res.json({ success: true, data: app });
  }),
);
router.put(
  "/:id/pd",
  handle(async (req, res) => {
    const app = await record(req, "save");
    if (app.cam.status !== "Not Sent")
      fail("PD is locked after sending to CAM", 409);
    const pd = validatePD(req.body, req.user, {
      applicationId: app.id,
      leadId: app.leadId || `LEAD-${app.id}`,
      customerId: app.customerId || `CUS-${app.id}`,
      product: app.product,
    });
    const revision = app.pd?.revision || 0;
    if (req.body.revision !== revision)
      fail("PD changed in another session. Reload before editing.", 409);
    const editable = [
      "code",
      "applicationId",
      "leadId",
      "customerId",
      "product",
      "type",
      "meetingAt",
      "personMet",
      "location",
      "remarks",
      "status",
      "followUpRequired",
      "followUp",
      "geotag",
      "picture",
    ];
    const fingerprint = (value) =>
      JSON.stringify(editable.map((key) => value?.[key]));
    if (app.pd && fingerprint(pd) === fingerprint(app.pd))
      return res.json({ success: true, data: app });
    const now = new Date();
    pd.revision = revision + 1;
    pd.recordId = app.pd?.recordId || `${app.id}-PD-001`;
    pd.createdAt = app.pd?.createdAt || now;
    pd.doneBy = app.pd?.doneBy || pd.doneBy;
    pd.doneByName = app.pd?.doneByName || pd.doneByName;
    pd.doneByRole = app.pd?.doneByRole || pd.doneByRole;
    pd.updatedAt = now;
    const saved = await Application.findOneAndUpdate(
      { _id: app.id, __v: app.__v, "cam.status": "Not Sent" },
      {
        $set: {
          pd,
          pdVerification: {
            status: "Verification Pending",
            revision: pd.revision,
          },
        },
        $inc: { __v: 1 },
        $push: {
          pdHistory: pd,
          audit: {
            action: revision ? "PD Revision Saved" : "PD Saved",
            at: now,
            by: req.user._id,
            revision: pd.revision,
            details: pd.code,
          },
        },
      },
      { new: true, runValidators: true },
    );
    if (!saved) fail("Application changed. Reload before saving.", 409);
    res.json({ success: true, data: saved });
  }),
);
router.post(
  "/:id/verify-pd",
  handle(async (req, res) => {
    const app = await record(req, "verify");
    if (!app.pd || req.body.revision !== app.pd.revision)
      fail("Save or reload the latest PD before verification", 409);
    if (
      app.pdVerification?.status === "Verified" &&
      app.pdVerification.revision === app.pd.revision
    )
      return res.json({ success: true, data: app });
    if (app.cam.status !== "Not Sent")
      fail("PD is locked after sending to CAM", 409);
    let reason = "";
    try {
      assertCompletePD(app.pd);
    } catch (error) {
      reason = error.message;
    }
    const verification = {
      status: reason ? "Rejected" : "Verified",
      reason,
      revision: app.pd.revision,
      by: req.user._id,
      at: new Date(),
    };
    const saved = await Application.findOneAndUpdate(
      { _id: app.id, __v: app.__v, "cam.status": "Not Sent" },
      {
        $set: { pdVerification: verification },
        $inc: { __v: 1 },
        $push: {
          audit: {
            action: "PD " + verification.status,
            at: verification.at,
            by: req.user._id,
            revision: app.pd.revision,
            details: reason,
          },
        },
      },
      { new: true, runValidators: true },
    );
    if (!saved) fail("Application changed. Reload before verification.", 409);
    res.json({ success: true, data: saved });
  }),
);
router.post(
  "/:id/send-to-cam",
  handle(async (req, res) => {
    const app = await record(req, "sendCam");
    if (app.cam.status === "Pending")
      return res.json({ success: true, data: app });
    assertSendToCAM(app, req.body.revision);
    const now = new Date();
    const saved = await Application.findOneAndUpdate(
      { _id: app.id, __v: app.__v, "cam.status": "Not Sent" },
      {
        $set: {
          cam: {
            stage: "CAM Allocation",
            status: "Pending",
            sentAt: now,
            sentBy: req.user._id,
            pdRevision: app.pd.revision,
          },
          status: "CAM Allocation",
          "pdVerification.status": "Sent To CAM",
        },
        $inc: { __v: 1 },
        $push: {
          audit: {
            action: "PD Sent to CAM",
            at: now,
            by: req.user._id,
            revision: app.pd.revision,
            details: app.pd.code,
          },
        },
      },
      { new: true },
    );
    if (!saved) fail("Application changed. Reload before sending.", 409);
    res.json({ success: true, data: saved });
  }),
);
router.post(
  "/:id/bureau-check",
  handle(async (req, res) => {
    const app = await record(req, "bureau");
    assertBureauCheck(app);
    if (app.bureau.status === "Pending Integration")
      return res.json({ success: true, data: app });
    const now = new Date();
    const saved = await Application.findOneAndUpdate(
      { _id: app.id, __v: app.__v, "bureau.status": "Not Requested" },
      {
        $set: {
          bureau: {
            status: "Pending Integration",
            requestedAt: now,
            requestedBy: req.user._id,
            requestId: `BUREAU-${app.id}`,
          },
        },
        $inc: { __v: 1 },
        $push: {
          audit: {
            action: "Bureau Check Requested — Pending Integration",
            at: now,
            by: req.user._id,
            revision: app.pd.revision,
            details: app.pd.code,
          },
        },
      },
      { new: true },
    );
    if (!saved) fail("Application changed. Reload before requesting.", 409);
    res.json({ success: true, data: saved });
  }),
);
module.exports = router;
