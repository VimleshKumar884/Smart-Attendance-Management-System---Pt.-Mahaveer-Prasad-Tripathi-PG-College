const User = require('../models/User');
const Assignment = require('../models/Assignment');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin/Teacher
exports.getUsers = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'teacher') {
      const assignments = await Assignment.find({ facultyId: req.user.id });
      if (!assignments.length) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      query = {
        role: 'student',
        $or: assignments.map((assignment) => ({
          semester: assignment.semester,
          section: assignment.section
        }))
      };
    }
    const users = await User.find(query);
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin/Teacher
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.user.role === 'teacher' && user.role !== 'student') {
       return res.status(403).json({ message: 'Not authorized' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin/Teacher
exports.createUser = async (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      req.body.role = 'student'; // Teachers can only create students
    }
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin/Teacher
exports.updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.user.role === 'teacher' && user.role !== 'student') {
       return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.user.role === 'teacher' && req.body.role && req.body.role !== 'student') {
       req.body.role = 'student';
    }
    
    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin/Teacher
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.user.role === 'teacher' && user.role !== 'student') {
       return res.status(403).json({ message: 'Not authorized' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
