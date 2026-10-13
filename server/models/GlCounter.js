const mongoose = require("mongoose");

const glCounterSchema = new mongoose.Schema({ key: { type: String, required: true, unique: true }, seq: { type: Number, default: 0 } });

module.exports = mongoose.models.GlCounter || mongoose.model("GlCounter", glCounterSchema);
