const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    at: { type: Date, required: true },
    person: { type: String, required: true, maxlength: 200 },
    location: { type: String, required: true, maxlength: 500 },
    remarks: { type: String, required: true, maxlength: 2000 },
  },
  { _id: false },
);

const geotagSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    accuracy: { type: Number, min: 0 },
    capturedAt: { type: Date, required: true },
    status: { type: String, enum: ["Captured"], required: true },
  },
  { _id: false },
);

const pictureSchema = new mongoose.Schema(
  {
    dataUrl: { type: String, required: true, maxlength: 2000000 },
    capturedAt: { type: Date, required: true },
    status: { type: String, enum: ["Captured"], required: true },
    confirmed: { type: Boolean, required: true },
    source: { type: String, enum: ["camera", "file-upload"], required: true },
    fileName: { type: String, maxlength: 255 },
    mimeType: {
      type: String,
      enum: ["image/jpeg", "image/png", "image/webp"],
      required: true,
    },
  },
  { _id: false },
);

const pdStatuses = [
  "Pending",
  "In Progress",
  "Completed",
  "Recommended",
  "Not Recommended",
  "Hold",
  "Query Required",
  "Positive",
  "Negative",
];

const pdSchema = new mongoose.Schema(
  {
    recordId: { type: String, required: true, maxlength: 120 },
    code: { type: String, required: true, maxlength: 100 },
    applicationId: { type: String, required: true },
    leadId: { type: String, required: true },
    customerId: { type: String, required: true },
    product: { type: String, required: true },
    type: {
      type: String,
      enum: ["Asset PD", "Business PD", "Red PD"],
      required: true,
    },
    meetingAt: { type: Date, required: true },
    personMet: { type: String, required: true, maxlength: 200 },
    location: { type: String, required: true, maxlength: 500 },
    remarks: { type: String, required: true, maxlength: 2000 },
    followUpRequired: { type: Boolean, required: true },
    followUp: { type: followUpSchema, default: undefined },
    status: { type: String, enum: pdStatuses, required: true },
    geotag: { type: geotagSchema, required: true },
    picture: { type: pictureSchema, required: true },
    doneBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doneByName: { type: String, required: true },
    doneByRole: { type: String, required: true },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    revision: { type: Number, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { _id: false },
);

const schema = new mongoose.Schema(
  {
    _id: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    leadId: String,
    customerId: String,
    scheme: String,
    customer: { type: String, required: true },
    mobile: String,
    product: { type: String, required: true },
    branch: String,
    amount: { type: Number, min: 1, required: true },
    status: { type: String, default: "Sales/Predeal" },
    workflowOwnerRole: { type: String, default: "BSO" },
    imd: {
      status: {
        type: String,
        enum: ["Pending", "Submitted", "Mismatch", "Verified"],
      },
      amount: { type: Number, min: 1 },
      simulatorReference: String,
      reference: String,
      submittedAmount: Number,
      submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      submittedAt: Date,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      verifiedByName: String,
      verifiedAt: Date,
      transactionId: String,
    },
    draft: { type: mongoose.Schema.Types.Mixed, default: {} },
    pd: { type: pdSchema, default: undefined },
    pdHistory: { type: [pdSchema], default: [] },
    pdVerification: {
      status: {
        type: String,
        enum: [
          "Saved",
          "Verification Pending",
          "Verified",
          "Rejected",
          "Sent To CAM",
        ],
        default: "Saved",
      },
      revision: Number,
      by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      at: Date,
      reason: String,
    },
    pdDemoBypass: {
      enabled: { type: Boolean, default: false },
      by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      at: Date,
    },
    cam: {
      stage: { type: String, enum: ["CAM Allocation"] },
      status: {
        type: String,
        enum: ["Not Sent", "Pending"],
        default: "Not Sent",
      },
      sentAt: Date,
      sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      pdRevision: Number,
    },
    bureau: {
      status: {
        type: String,
        enum: ["Not Requested", "Pending Integration"],
        default: "Not Requested",
      },
      requestedAt: Date,
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      requestId: String,
    },
    audit: [
      {
        _id: false,
        action: String,
        at: Date,
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        revision: Number,
        details: String,
      },
    ],
  },
  { timestamps: true, optimisticConcurrency: true },
);

schema.index({ user: 1, updatedAt: -1 });
schema.index({ "cam.status": 1, updatedAt: -1 });
schema.index({ leadId: 1, customerId: 1 });

module.exports = mongoose.model("Application", schema);
