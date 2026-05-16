const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, department, semester, section } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      rollNumber,
      department,
      semester,
      section
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { loginType, email, password, rollNumber, dob } = req.body;

    let user;

    if (loginType === 'student') {
      if (!rollNumber || !dob) {
        return res.status(400).json({ message: 'Please provide roll number and Date of Birth' });
      }
      user = await User.findOne({ rollNumber, dob });
      if (!user) {
        return res.status(401).json({ message: 'Invalid Roll Number or DOB' });
      }
    } else {
      // Default to faculty/admin login
      if (!email || !password) {
        return res.status(400).json({ message: 'Please provide an email and password' });
      }
      user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      // Optional: enforce role check if needed, e.g., if (user.role === 'student') block? 
      // The user wants dual login. Faculty/Admin use email/pass. Students use roll/dob.
      // So if a student tries to login via email/password, it technically could work but let's allow it or block it? Let's just allow it or block it later if strictly needed.
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get security question
// @route   POST /api/auth/get-security-question
// @access  Public
exports.getSecurityQuestion = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide an email' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      success: true,
      question: user.securityQuestion || 'What is your favorite color?'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password via security question
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email || !answer || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, answer, and new password' });
    }

    const user = await User.findOne({ email }).select('+password +securityAnswer');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Simple case-insensitive comparison
    if (user.securityAnswer.toLowerCase().trim() !== answer.toLowerCase().trim()) {
      return res.status(400).json({ message: 'Incorrect security answer' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};