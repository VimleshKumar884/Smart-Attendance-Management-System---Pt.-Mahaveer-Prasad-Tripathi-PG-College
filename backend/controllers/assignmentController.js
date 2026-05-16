const Assignment = require('../models/Assignment');
const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Get assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'teacher') {
      query.facultyId = req.user.id;
    }
    const assignments = await Assignment.find(query)
      .populate('subjectId', 'subjectName subjectCode')
      .populate('facultyId', 'name email');
      
    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create assignment (Assign subject to faculty)
// @route   POST /api/assignments
// @access  Private/Admin
exports.createAssignment = async (req, res) => {
  try {
    const { facultyId, subjectId, section, semester } = req.body;
    
    // Check for existing assignment
    const existing = await Assignment.findOne({ facultyId, subjectId, section });
    if (existing) {
      return res.status(400).json({ message: 'This subject is already assigned to the faculty for this section.' });
    }

    const assignment = await Assignment.create({ facultyId, subjectId, section, semester });
    
    // Populate for response
    await assignment.populate('subjectId', 'subjectName subjectCode');
    await assignment.populate('facultyId', 'name email');
    
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Admin
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    await assignment.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};