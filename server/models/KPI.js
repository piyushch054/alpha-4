const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  target: { type: Number, required: true },
  department: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('KPI', kpiSchema);

