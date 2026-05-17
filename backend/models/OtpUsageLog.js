const mongoose = require('mongoose');

const OtpUsageLogSchema = new mongoose.Schema({
  otpId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttendanceOtp',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usedAt: {
    type: Date,
    default: Date.now
  },
  deviceInfo: String
}, { timestamps: true });

module.exports = mongoose.model('OtpUsageLog', OtpUsageLogSchema);
