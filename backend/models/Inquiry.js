const mongoose = require('mongoose');
const inquirySchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  kind: { type: String, enum: ['INQUIRY', 'VIEWING'], default: 'INQUIRY' },
  viewingDate: { type: String, default: '' },
  viewingTime: { type: String, default: '' },
  reply: { type: String, trim: true, maxlength: 2000, default: '' },
  repliedAt: { type: Date, default: null },
}, { timestamps: true });
module.exports = mongoose.model('Inquiry', inquirySchema);
