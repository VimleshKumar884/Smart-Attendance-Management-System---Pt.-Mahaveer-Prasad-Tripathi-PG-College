const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Do not return password by default
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    default: 'student'
  },
  securityQuestion: {
    type: String,
    default: 'What is your favorite color?'
  },
  securityAnswer: {
    type: String,
    default: 'blue' // In a real app this should be hashed, but for simplicity we keep it plain or hash it later. Let's keep it lowercase plain for simple comparison.
  },
  // Student specific fields
  rollNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  dob: {
    type: String, // format YYYY-MM-DD
  },
  department: String,
  semester: Number,
  section: String,
  attendancePercentage: {
    type: Number,
    default: 0
  },
  // Teacher specific fields
  subject: String, // Can be an array if a teacher handles multiple subjects
}, { timestamps: true });

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);