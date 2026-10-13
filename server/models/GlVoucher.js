const mongoose = require("mongoose");

const lineSchema = new mongoose.Schema(
  {
    ledger: { type: String, required: true },
    subLedger: { type: String },
    costCentre: { type: String },
    debit: { type: Number, default: 0, min: 0 },
    credit: { type: Number, default: 0, min: 0 },
    narration: { type: String, maxlength: 200 },
    recon: { type: String, maxlength: 40 },
  },
  { _id: true },
);
const historySchema = new mongoose.Schema(
  { action: { type: String, required: true, maxlength: 80 }, note: { type: String, maxlength: 300 }, by: { type: String, maxlength: 120 }, role: { type: String, maxlength: 60 }, at: { type: Date, default: Date.now } },
  { _id: false },
);

const glVoucherSchema = new mongoose.Schema(
  {
    voucherNo: { type: String, required: true, unique: true },
    mode: { type: String, enum: ["general", "limited"], default: "general", index: true },
    type: { type: String, required: true, maxlength: 40 },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    year: { type: String, required: true, index: true },
    period: { type: String, required: true },
    narration: { type: String, maxlength: 300 },
    chequeNo: { type: String, maxlength: 30 },
    lines: { type: [lineSchema], validate: (v) => v.length >= 2 },
    total: { type: Number, required: true },
    status: { type: String, required: true, enum: ["Pending", "Approved", "Rejected", "Reversed"], index: true },
    isClosing: { type: Boolean, default: false },
    reversalOf: { type: String },
    reversedBy: { type: String },
    source: { type: String, maxlength: 60 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdByName: { type: String, maxlength: 120 },
    checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    checkedByName: { type: String, maxlength: 120 },
    history: { type: [historySchema], default: [] },
  },
  { timestamps: true },
);
// A voucher can be reversed once. A rejected reversal clears reversalOf so the original can be reversed again.
glVoucherSchema.index({ reversalOf: 1 }, { unique: true, partialFilterExpression: { reversalOf: { $type: "string" } } });

module.exports = mongoose.models.GlVoucher || mongoose.model("GlVoucher", glVoucherSchema);
