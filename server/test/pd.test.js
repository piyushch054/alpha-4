const { test } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const {
  validatePD,
  permission,
  scope,
  assertCompletePD,
  assertSendToCAM,
  assertBureauCheck,
} = require("../services/pd");
const Application = require("../models/Application");

const user = {
  _id: new mongoose.Types.ObjectId(),
  name: "Authenticated BSO",
  role: "BSO",
};
const context = {
  applicationId: "LOS-EXISTING-123",
  leadId: "CRM-1001",
  customerId: "CUS-1001",
  product: "MSME",
};
const evidence = {
  geotag: {
    latitude: 26.9124,
    longitude: 75.7873,
    accuracy: 12,
    capturedAt: "2026-10-08T05:05:00.000Z",
    status: "Captured",
  },
  picture: {
    dataUrl: "data:image/png;base64,iVBORw0KGgo=",
    capturedAt: "2026-10-08T05:06:00.000Z",
    status: "Captured",
    confirmed: true,
    source: "camera",
    mimeType: "image/png",
  },
};
const body = {
  code: "PD-LOS-001",
  type: "Asset PD",
  meetingAt: "2026-10-08T05:00:00.000Z",
  personMet: "Applicant",
  location: "Business premises",
  remarks: "Identity, income, and repayment discussion completed.",
  status: "Recommended",
  followUpRequired: false,
  revision: 0,
  ...evidence,
  doneByName: "Forged Name",
  doneBy: "forged",
};

test("PD attribution and application linkage come from trusted server context", () => {
  const pd = validatePD(
    {
      ...body,
      applicationId: "FORGED",
      customerId: "FORGED",
      followUp: { person: "stale" },
    },
    user,
    context,
  );
  assert.equal(pd.doneByName, user.name);
  assert.equal(pd.doneBy, user._id);
  assert.equal(pd.doneByRole, "BSO");
  assert.equal(pd.applicationId, context.applicationId);
  assert.equal(pd.customerId, context.customerId);
  assert.equal(pd.followUp, undefined);
});

test("PD types, decisions, mandatory fields, geotag, and picture are enforced", () => {
  for (const field of [
    "code",
    "type",
    "meetingAt",
    "personMet",
    "location",
    "remarks",
    "status",
  ]) {
    assert.throws(() => validatePD({ ...body, [field]: "" }, user, context));
  }
  for (const type of ["Asset PD", "Business PD", "Red PD"]) {
    assert.equal(validatePD({ ...body, type }, user, context).type, type);
  }
  for (const status of [
    "Pending",
    "In Progress",
    "Completed",
    "Recommended",
    "Not Recommended",
    "Hold",
    "Query Required",
  ]) {
    assert.equal(
      validatePD(
        {
          ...body,
          status,
          remarks: "A sufficiently clear field decision reason.",
        },
        user,
        context,
      ).status,
      status,
    );
  }
  assert.throws(() => validatePD({ ...body, type: "Other PD" }, user, context));
  assert.throws(() =>
    validatePD({ ...body, status: "Invalid" }, user, context),
  );
  assert.throws(
    () => validatePD({ ...body, geotag: null }, user, context),
    /location/,
  );
  assert.throws(
    () => validatePD({ ...body, picture: null }, user, context),
    /picture/,
  );
  assert.throws(
    () =>
      validatePD(
        { ...body, picture: { ...body.picture, dataUrl: "data:image/png;base64,bm90IGFuIGltYWdl" } },
        user,
        context,
      ),
    /not a valid image/,
  );
  assert.throws(
    () =>
      validatePD(
        { ...body, picture: { ...body.picture, confirmed: false } },
        user,
        context,
      ),
    /confirm/,
  );
  assert.throws(
    () =>
      validatePD({ ...body, status: "Hold", remarks: "short" }, user, context),
    /clear reason/,
  );
});

test("follow-up fields and chronology are conditionally validated", () => {
  assert.throws(() =>
    validatePD({ ...body, followUpRequired: true }, user, context),
  );
  const followUp = {
    at: "2026-10-09T05:00:00Z",
    person: "Applicant",
    location: "Branch",
    remarks: "Collect final statement",
  };
  for (const field of Object.keys(followUp)) {
    assert.throws(() =>
      validatePD(
        {
          ...body,
          followUpRequired: true,
          followUp: { ...followUp, [field]: "" },
        },
        user,
        context,
      ),
    );
  }
  assert.throws(() =>
    validatePD(
      {
        ...body,
        followUpRequired: true,
        followUp: { ...followUp, at: "2026-10-07T05:00:00Z" },
      },
      user,
      context,
    ),
  );
  assert.ok(
    validatePD({ ...body, followUpRequired: true, followUp }, user, context)
      .followUp,
  );
});

test("backend role and ownership policy cannot use browser-selected roles", () => {
  permission(user, "save");
  permission(user, "sendCam");
  permission({ ...user, role: "BCM" }, "bureau");
  assert.throws(
    () => permission({ ...user, role: "user" }, "save"),
    /Forbidden/,
  );
  assert.throws(
    () => permission({ ...user, role: "CEO" }, "save"),
    /Forbidden/,
  );
  assert.throws(
    () => permission({ ...user, role: "BCM" }, "save"),
    /Forbidden/,
  );
  assert.deepEqual(scope(user), { user: user._id });
  assert.deepEqual(scope({ ...user, role: "BCM" }), {
    "cam.status": "Pending",
  });
  assert.deepEqual(scope({ ...user, role: "Audit Manager" }), {});
  assert.deepEqual(scope({ ...user, role: "admin" }, "save"), {});
});

test("completion, CAM, and bureau transitions reject incomplete or stale PD state", () => {
  const ready = {
    pd: { ...body, revision: 2 },
    cam: { status: "Not Sent" },
    pdVerification: { status: "Verified", revision: 2 },
  };
  assert.throws(
    () =>
      assertSendToCAM(
        {
          ...ready,
          pdVerification: { status: "Verification Pending", revision: 2 },
        },
        2,
      ),
    /Verify/,
  );
  assert.doesNotThrow(() => assertCompletePD(ready.pd));
  assert.doesNotThrow(() => assertSendToCAM(ready, 2));
  assert.throws(
    () => assertCompletePD({ ...ready.pd, status: "In Progress" }),
    /Completed or Recommended/,
  );
  assert.throws(
    () =>
      assertSendToCAM(
        { ...ready, pd: { ...ready.pd, followUpRequired: true } },
        2,
      ),
    /follow-up/,
  );
  assert.throws(
    () => assertSendToCAM({ ...ready, pd: { ...ready.pd, geotag: null } }, 2),
    /location/,
  );
  assert.throws(
    () => assertSendToCAM({ ...ready, pd: { ...ready.pd, picture: null } }, 2),
    /picture/,
  );
  assert.throws(() => assertSendToCAM(ready, 1), /latest PD/);
  assert.throws(() => assertBureauCheck(ready), /Send PD to CAM/);
  assert.doesNotThrow(() =>
    assertBureauCheck({ ...ready, cam: { status: "Pending" } }),
  );
});

test("PD history embeds identifiers, evidence, timestamps, and employee references in one application", async () => {
  const pd = validatePD(body, user, context);
  Object.assign(pd, {
    recordId: "LOS-EXISTING-123-PD-001",
    revision: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const app = new Application({
    _id: context.applicationId,
    user: user._id,
    leadId: context.leadId,
    customerId: context.customerId,
    customer: "Applicant",
    product: "MSME",
    amount: 100000,
    pd,
    pdHistory: [pd],
  });
  await app.validate();
  assert.equal(app.id, context.applicationId);
  assert.equal(app.pd._id, undefined);
  assert.equal(app.pd.recordId, "LOS-EXISTING-123-PD-001");
  assert.equal(app.pdHistory.length, 1);
  assert.equal(app.pdHistory[0].geotag.status, "Captured");
  assert.equal(app.pdHistory[0].picture.confirmed, true);
  assert.equal(app.cam.status, "Not Sent");
  assert.equal(app.bureau.status, "Not Requested");
});
