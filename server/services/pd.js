const TYPES = ["Asset PD", "Business PD", "Red PD"];
const STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
  "Recommended",
  "Not Recommended",
  "Hold",
  "Query Required",
];
const LEGACY_STATUSES = ["Positive", "Negative"];
const COMPLETION_STATUSES = ["Completed", "Recommended", "Positive"];
const SALES = ["BSO", "BDM", "Sales User"];
const CREDIT = ["BCM", "ACM", "ZCM", "Credit User", "Credit Head"];
const ADMINS = [
  "admin",
  "super_admin",
  "System Admin",
  "SUPER_SUPER_ADMIN",
  "ADMIN",
  "SUPER_ADMIN",
];
const OVERSIGHT = [
  "CEO",
  "Audit",
  "Audit Manager",
  "Compliance",
  "Compliance Manager",
  "Compliance Officer",
];

const PERMISSIONS = {
  view: [...SALES, ...CREDIT, ...ADMINS, ...OVERSIGHT],
  save: [...SALES, ...ADMINS],
  verify: [...SALES, ...ADMINS],
  sendCam: [...SALES, ...ADMINS],
  bureau: [...SALES, ...CREDIT, ...ADMINS],
};

function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function permission(user, action) {
  if (!user || !PERMISSIONS[action]?.includes(user.role)) {
    fail("Forbidden: insufficient PD permissions", 403);
  }
}

function scope(user, action = "view") {
  if (
    ADMINS.includes(user.role) ||
    (action === "view" && OVERSIGHT.includes(user.role))
  )
    return {};
  if (CREDIT.includes(user.role)) return { "cam.status": "Pending" };
  return { user: user._id };
}

function text(value, label, max, required = true) {
  if (
    typeof value !== "string" ||
    (required && !value.trim()) ||
    value.length > max
  ) {
    fail(`${label} is required and must be at most ${max} characters`);
  }
  return value.trim();
}

function date(value, label) {
  const isoDateTime =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
  if (
    typeof value !== "string" ||
    !isoDateTime.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) {
    fail(`${label} must be a valid date and time with timezone`);
  }
  return new Date(value);
}

function number(value, label, min, max) {
  if (!Number.isFinite(value) || value < min || value > max)
    fail(`${label} is invalid`);
  return value;
}

function validateGeotag(value) {
  if (!value || value.status !== "Captured")
    fail("Capture the PD location before saving");
  return {
    latitude: number(value.latitude, "Latitude", -90, 90),
    longitude: number(value.longitude, "Longitude", -180, 180),
    accuracy:
      value.accuracy == null
        ? undefined
        : number(value.accuracy, "Location accuracy", 0, 100000),
    capturedAt: date(value.capturedAt, "Location captured time"),
    status: "Captured",
  };
}

function validatePicture(value) {
  if (!value || value.status !== "Captured" || value.confirmed !== true)
    fail("Capture and confirm the PD picture before saving");
  const dataUrl = text(value.dataUrl, "PD Picture", 2000000);
  const match = dataUrl.match(
    /^data:(image\/(?:jpeg|png|webp));base64,[A-Za-z0-9+/=]+$/,
  );
  if (!match) fail("PD Picture must be a JPEG, PNG, or WebP image");
  const bytes = Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
  const signature = {
    "image/jpeg": bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
    "image/png": bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    "image/webp": bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP",
  }[match[1]];
  if (!signature) fail("PD Picture content is not a valid image");
  if (!["camera", "file-upload"].includes(value.source))
    fail("PD Picture source is invalid");
  return {
    dataUrl,
    capturedAt: date(value.capturedAt, "Picture captured time"),
    status: "Captured",
    confirmed: true,
    source: value.source,
    fileName: text(value.fileName || "", "Picture file name", 255, false),
    mimeType: match[1],
  };
}

function validatePD(body, user, context = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    fail("PD details are required");
  if (!TYPES.includes(body.type)) fail("Select a valid PD Type");
  if (![...STATUSES, ...LEGACY_STATUSES].includes(body.status))
    fail("Select a valid PD Status");
  if (typeof body.followUpRequired !== "boolean")
    fail("Follow-up must be Yes or No");
  if (!Number.isInteger(body.revision) || body.revision < 0)
    fail("PD revision is required");
  if (!user.name?.trim())
    fail("Your authenticated user profile needs a name before recording PD");

  const remarks = text(body.remarks, "Personal Discussion Remarks", 2000);
  if (
    ["Not Recommended", "Hold", "Query Required", "Negative"].includes(
      body.status,
    ) &&
    remarks.length < 10
  ) {
    fail(`${body.status} requires a clear reason in PD Remarks`);
  }

  const value = {
    code: text(body.code, "Personal Discussion Code", 100),
    applicationId: text(
      context.applicationId || body.applicationId,
      "Application ID",
      120,
    ),
    leadId: text(context.leadId || body.leadId, "Lead ID", 120),
    customerId: text(context.customerId || body.customerId, "Customer ID", 120),
    product: text(context.product || body.product, "Product", 80),
    type: body.type,
    meetingAt: date(body.meetingAt, "Personal Discussion Date & Time"),
    personMet: text(body.personMet, "Person Met", 200),
    location: text(body.location, "Personal Discussion Meeting Location", 500),
    remarks,
    status: body.status,
    followUpRequired: body.followUpRequired,
    geotag: validateGeotag(body.geotag),
    picture: validatePicture(body.picture),
    doneBy: user._id,
    doneByName: user.name.trim(),
    doneByRole: user.role,
    updatedBy: user._id,
  };

  if (body.followUpRequired) {
    const followUp = body.followUp || {};
    value.followUp = {
      at: date(followUp.at, "Follow-up Date & Time"),
      person: text(followUp.person, "Follow-up Person", 200),
      location: text(followUp.location, "Follow-up Location", 500),
      remarks: text(followUp.remarks, "Follow-up Remarks", 2000),
    };
    if (value.followUp.at < value.meetingAt)
      fail("Follow-up must be on or after the PD meeting");
  }

  return value;
}

function assertCompletePD(pd) {
  if (!pd || !COMPLETION_STATUSES.includes(pd.status)) {
    fail(
      "Complete the PD with a Completed or Recommended decision before continuing",
      409,
    );
  }
  if (pd.followUpRequired)
    fail("Complete the outstanding PD follow-up before continuing", 409);
  if (pd.geotag?.status !== "Captured")
    fail("Capture the PD location before continuing", 409);
  if (pd.picture?.status !== "Captured" || pd.picture.confirmed !== true)
    fail("Capture and confirm the PD picture before continuing", 409);
}

function assertSendToCAM(app, revision) {
  assertCompletePD(app.pd);
  if (!Number.isInteger(revision) || revision !== app.pd.revision) {
    fail("Save or reload the latest PD before sending to CAM", 409);
  }
  if (
    app.pdVerification?.status !== "Verified" ||
    app.pdVerification.revision !== revision
  ) {
    fail("Verify the latest saved PD before sending to CAM", 409);
  }
}

function assertBureauCheck(app) {
  if (app.cam?.status !== "Pending")
    fail("Send PD to CAM before requesting Bureau Check", 409);
}

module.exports = {
  TYPES,
  STATUSES,
  COMPLETION_STATUSES,
  permission,
  scope,
  fail,
  validatePD,
  assertCompletePD,
  assertSendToCAM,
  assertBureauCheck,
  text,
};
