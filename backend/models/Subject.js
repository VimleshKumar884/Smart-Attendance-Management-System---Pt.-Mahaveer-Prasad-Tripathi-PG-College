const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: [true, 'Please add a subject name']
  },
  subjectCode: {
    type: String,
    required: [true, 'Please add a subject code'],
    unique: true
  },
  department: {
    type: String,
    required: [true, 'Please add a department']
  },
  section: {
    type: String,
    default: 'A'
  },
  semester: {
    type: Number,
    required: [true, 'Please add a semester']
  }
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);
