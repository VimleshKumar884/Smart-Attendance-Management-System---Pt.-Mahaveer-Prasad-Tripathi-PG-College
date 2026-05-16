const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  section: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Prevent duplicate assignment of the same subject+section to multiple faculties if needed, 
// or just prevent exact duplicate assignment
AssignmentSchema.index({ facultyId: 1, subjectId: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);