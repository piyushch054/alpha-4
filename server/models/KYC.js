const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  documentType: { type: String, required: true },
  documentNumber: { type: String, required: true },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('KYC', kycSchema);

