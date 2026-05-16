const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Mark attendance (Single or Bulk)
// @route   POST /api/attendance
// @access  Private/Teacher/Admin
exports.markAttendance = async (req, res) => {
  try {
    const { subjectId, records, date } = req.body;
    // records is an array of { studentId, status }
    
    if (!subjectId || !records || records.length === 0) {
      return res.status(400).json({ message: 'Please provide subject and attendance records' });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0); // Normalize to start of day

    const attendanceDocs = records.map(record => ({
      studentId: record.studentId,
      teacherId: req.user.id,
      subjectId,
      date: attendanceDate,
      status: record.status
    }));

    // This will fail if duplicate for same student, subject, date exists due to unique index
    const inserted = await Attendance.insertMany(attendanceDocs);

    // After marking attendance, recalculate student attendance percentage
    // This could be optimized or moved to a background job
    for (let record of records) {
      const studentId = record.studentId;
      const totalClasses = await Attendance.countDocuments({ studentId });
      const presentClasses = await Attendance.countDocuments({ studentId, status: 'Present' });
      const lateClasses = await Attendance.countDocuments({ studentId, status: 'Late' });
      
      const effectivePresent = presentClasses + (lateClasses * 0.5); // Example rule: Late = 0.5 present
      const percentage = totalClasses > 0 ? (effectivePresent / totalClasses) * 100 : 0;
      
      await User.findByIdAndUpdate(studentId, { attendancePercentage: percentage });
    }

    res.status(201).json({ success: true, count: inserted.length, data: inserted });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Attendance already marked for some students on this date' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    let query;

    // Student can only see their own
    if (req.user.role === 'student') {
      query = Attendance.find({ studentId: req.user.id });
    } 
    // Teacher can see records they marked
    else if (req.user.role === 'teacher') {
      query = Attendance.find({ teacherId: req.user.id });
    } 
    // Admin can see all
    else {
      query = Attendance.find();
    }

    // Populate data
    query = query.populate({
      path: 'studentId',
      select: 'name rollNumber department'
    }).populate({
      path: 'subjectId',
      select: 'subjectName subjectCode'
    });

    const attendance = await query;
    res.status(200).json({ success: true, count: attendance.length, data: attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};