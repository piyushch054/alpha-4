const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    step: { type: Number },
    action: { type: String, required: true, maxlength: 80 },
    note: { type: String, maxlength: 300 },
    by: { type: String, maxlength: 120 },
    role: { type: String, maxlength: 60 },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const journeySchema = new mongoose.Schema(
  {
    journeyNo: { type: String, required: true, unique: true },
    productKey: { type: String, required: true, enum: ["twoWheeler", "solar", "lap", "tractor"], index: true },
    product: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    createdByName: { type: String, maxlength: 120 },
    createdByRole: { type: String, maxlength: 60 },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    computed: { type: mongoose.Schema.Types.Mixed, default: {} },
    currentStep: { type: Number, required: true, min: 1, max: 20, default: 1 },
    completedSteps: { type: [Number], default: [] },
    status: { type: String, required: true, enum: ["Draft", "Sales Stage", "Credit Review", "Operations", "Sent Back", "Rejected", "Completed"], default: "Draft" },
    offerNo: { type: String },
    lmsId: { type: String },
    history: { type: [historySchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Journey || mongoose.model("Journey", journeySchema);
