const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null // Can be null for manual attendance
  },
  section: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    required: true
  },
  isBackdated: {
    type: Boolean,
    default: false
  },
  remarks: String,
  markedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate attendance for same student, subject, and date if no sessionId, else prevent duplicate per session.
// A more generic index for duplicate prevention per session:
AttendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true, partialFilterExpression: { sessionId: { $type: "objectId" } } });

module.exports = mongoose.model('Attendance', AttendanceSchema);