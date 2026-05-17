const BackdatedLog = require('../models/BackdatedLog');
const Attendance = require('../models/Attendance');

// @desc    Get all backdated logs
// @route   GET /api/backdated-logs
// @access  Private/Admin/Teacher
exports.getBackdatedLogs = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'teacher') {
      query.facultyId = req.user.id;
    }
    const logs = await BackdatedLog.find(query)
      .populate('facultyId', 'name email employeeId')
      .populate('subjectId', 'subjectName subjectCode department section')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new backdated log request
// @route   POST /api/backdated-logs
// @access  Private/Faculty
exports.createBackdatedLog = async (req, res) => {
  try {
    const { subjectId, section, date, reason } = req.body;
    const facultyId = req.user.id;

    if (!subjectId || !section || !date || !reason) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const log = await BackdatedLog.create({
      facultyId,
      subjectId,
      section,
      date,
      reason
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update backdated log status (Approve/Reject)
// @route   PUT /api/backdated-logs/:id
// @access  Private/Admin
exports.updateBackdatedLogStatus = async (req, res) => {
  try {
    const { adminStatus, adminReason } = req.body;
    let log = await BackdatedLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ message: 'Backdated log request not found' });
    }

    log.adminStatus = adminStatus;
    log.adminReason = adminReason;
    log.reviewedAt = Date.now();

    await log.save();

    // Notify the faculty
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: log.facultyId,
      userRole: 'teacher',
      type: adminStatus === 'approved' ? 'success' : 'alert',
      message: `Your backdated attendance request for ${new Date(log.date).toLocaleDateString()} was ${adminStatus}. ${adminReason ? `Reason: ${adminReason}` : ''}`
    });

    if (adminStatus === 'rejected') {
       // Find attendance marked by this faculty for this subject on this date and revert to 'Absent'
       const attendanceDate = new Date(log.date);
       attendanceDate.setHours(0, 0, 0, 0);
       
       await Attendance.updateMany(
         { 
           teacherId: log.facultyId, 
           subjectId: log.subjectId, 
           date: attendanceDate,
           isBackdated: true
         },
         { status: 'Absent' }
       );
    }

    log = await BackdatedLog.findById(log._id)
      .populate('facultyId', 'name email employeeId')
      .populate('subjectId', 'subjectName subjectCode department section');

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
