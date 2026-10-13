const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  { action: { type: String, required: true, maxlength: 80 }, note: { type: String, maxlength: 300 }, by: { type: String, maxlength: 120 }, role: { type: String, maxlength: 60 }, at: { type: Date, default: Date.now } },
  { _id: false },
);

// One collection for GL masters and AP/AR / fixed-asset / bank records; the schema per kind lives in config/gl.js.
const glEntitySchema = new mongoose.Schema(
  {
    kind: { type: String, required: true, index: true },
    code: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, required: true, maxlength: 40, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdByName: { type: String, maxlength: 120 },
    checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    checkedByName: { type: String, maxlength: 120 },
    history: { type: [historySchema], default: [] },
  },
  { timestamps: true },
);
glEntitySchema.index({ kind: 1, code: 1 }, { unique: true });

module.exports = mongoose.models.GlEntity || mongoose.model("GlEntity", glEntitySchema);
