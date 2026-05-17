const FacultyLoginLog = require('../models/FacultyLoginLog');

// @desc    Get all faculty login logs
// @route   GET /api/faculty-logs
// @access  Private/Admin
exports.getFacultyLogs = async (req, res) => {
  try {
    const logs = await FacultyLoginLog.find().populate('facultyId', 'name email employeeId department');
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current faculty login logs
// @route   GET /api/faculty-logs/me
// @access  Private/Teacher
exports.getMyFacultyLogs = async (req, res) => {
  try {
    const logs = await FacultyLoginLog.find({ facultyId: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a faculty login log (manual override by admin)
// @route   PUT /api/faculty-logs/:id
// @access  Private/Admin
exports.updateFacultyLog = async (req, res) => {
  try {
    const { status, loginTime, logoutTime } = req.body;
    let log = await FacultyLoginLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    log.status = status || log.status;
    if (loginTime !== undefined) log.loginTime = loginTime;
    if (logoutTime !== undefined) log.logoutTime = logoutTime;

    await log.save();
    
    // Populate for returning updated data
    log = await FacultyLoginLog.findById(log._id).populate('facultyId', 'name email employeeId department');

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
