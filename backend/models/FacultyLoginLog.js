const mongoose = require('mongoose');

const FacultyLoginLogSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loginTime: {
    type: Date,
    required: true
  },
  logoutTime: {
    type: Date
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'half-day', 'absent'],
    default: 'absent'
  },
  ipAddress: String
}, { timestamps: true });

module.exports = mongoose.model('FacultyLoginLog', FacultyLoginLogSchema);
