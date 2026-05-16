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
  section: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  lecture_no: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    required: true
  },
  remarks: String,
  markedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate attendance for same student, subject, date, and lecture
AttendanceSchema.index({ studentId: 1, subjectId: 1, date: 1, lecture_no: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);