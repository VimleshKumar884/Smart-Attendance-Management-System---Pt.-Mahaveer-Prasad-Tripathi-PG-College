const Attendance = require('../models/Attendance');
const User = require('../models/User');
const BackdatedLog = require('../models/BackdatedLog');
const AttendanceOtp = require('../models/AttendanceOtp');
const crypto = require('crypto');

// @desc    Mark attendance (Single or Bulk)
// @route   POST /api/attendance
// @access  Private/Teacher/Admin
exports.markAttendance = async (req, res) => {
  try {
    const { subjectId, section, lecture_no, records, date, isBackdated, reason } = req.body;
    
    if (!subjectId || !section || !lecture_no || !records || records.length === 0) {
      return res.status(400).json({ message: 'Please provide subject, section, lecture number and attendance records' });
    }

    if (isBackdated && !reason) {
      return res.status(400).json({ message: 'Reason is required for backdated attendance' });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Check for duplicate attendance submission for the whole class
    const existingSubmission = await Attendance.findOne({ subjectId, section, date: attendanceDate, lecture_no });
    if (existingSubmission) {
      return res.status(400).json({ message: 'Attendance already submitted for this lecture' });
    }

    const attendanceDocs = records.map(record => ({
      studentId: record.studentId,
      teacherId: req.user.id,
      subjectId,
      section,
      lecture_no,
      date: attendanceDate,
      status: record.status,
      isBackdated: isBackdated || false,
      markedAt: new Date()
    }));

    // This will fail if duplicate for same student, subject, date exists due to unique index
    const inserted = await Attendance.insertMany(attendanceDocs);

    // If backdated, create a log for admin approval
    if (isBackdated) {
      await BackdatedLog.create({
        facultyId: req.user.id,
        subjectId,
        section,
        date: attendanceDate,
        reason,
        adminStatus: 'pending'
      });
    }

    // After marking attendance, recalculate student attendance percentage
    const Notification = require('../models/Notification');
    for (let record of records) {
      const studentId = record.studentId;
      const totalClasses = await Attendance.countDocuments({ studentId });
      const presentClasses = await Attendance.countDocuments({ studentId, status: 'Present' });
      const lateClasses = await Attendance.countDocuments({ studentId, status: 'Late' });
      
      const effectivePresent = presentClasses + (lateClasses * 0.5); // Example rule: Late = 0.5 present
      const percentage = totalClasses > 0 ? (effectivePresent / totalClasses) * 100 : 0;
      
      await User.findByIdAndUpdate(studentId, { attendancePercentage: percentage });

      // Notify if below 75%
      if (percentage < 75 && totalClasses >= 5) {
        // Debounce notifications (e.g., only one active warning at a time)
        const recentWarning = await Notification.findOne({
           userId: studentId,
           type: 'alert',
           message: { $regex: /attendance is low/i },
           createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // within last 7 days
        });

        if (!recentWarning) {
           await Notification.create({
              userId: studentId,
              userRole: 'student',
              type: 'alert',
              message: `Warning: Your overall attendance is low (${Math.round(percentage)}%). Please attend classes regularly to meet the 75% requirement.`
           });
        }
      }
    }

    res.status(201).json({ success: true, count: inserted.length, data: inserted });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Attendance already marked for some students on this date' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate OTP for attendance
// @route   POST /api/attendance/otp/generate
// @access  Private/Teacher
exports.generateOtp = async (req, res) => {
  try {
    const { subjectId, section, date } = req.body;
    if (!subjectId || !section || !date) {
      return res.status(400).json({ message: 'Subject, section, and date are required' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Deactivate any existing active OTP for this class today
    await AttendanceOtp.updateMany({ subjectId, section, date: attendanceDate, isActive: true }, { isActive: false });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins from now

    const otp = await AttendanceOtp.create({
      facultyId: req.user.id,
      subjectId,
      section,
      date: attendanceDate,
      otpCode,
      expiresAt
    });

    res.status(201).json({ success: true, data: otp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel OTP
// @route   POST /api/attendance/otp/cancel
// @access  Private/Teacher
exports.cancelOtp = async (req, res) => {
  try {
    const { otpId } = req.body;
    const otp = await AttendanceOtp.findById(otpId);
    if (!otp) return res.status(404).json({ message: 'OTP not found' });
    if (otp.facultyId.toString() !== req.user.id && req.user.role !== 'admin') {
       return res.status(403).json({ message: 'Not authorized' });
    }
    otp.isActive = false;
    await otp.save();
    res.status(200).json({ success: true, data: otp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and mark student present
// @route   POST /api/attendance/otp/verify
// @access  Private/Student
exports.verifyOtp = async (req, res) => {
  try {
    const { otpCode } = req.body;
    const studentId = req.user.id;

    if (!otpCode) {
      return res.status(400).json({ message: 'Please provide the OTP code' });
    }

    // Find active OTP matching the code
    const otp = await AttendanceOtp.findOne({ 
      otpCode, 
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if student belongs to the section the OTP was generated for
    const student = await User.findById(studentId);
    if (!student || student.section !== otp.section) {
       return res.status(403).json({ message: 'You are not authorized to use this OTP for this class' });
    }

    // Check if already marked present
    const existingAttendance = await Attendance.findOne({
      studentId,
      subjectId: otp.subjectId,
      date: otp.date,
      lecture_no: 1 // Assuming 1 for simplicity based on prompt
    });

    if (existingAttendance) {
      if (existingAttendance.status === 'Present') {
         return res.status(400).json({ message: 'You have already marked attendance for this session' });
      } else {
         // Update to present
         existingAttendance.status = 'Present';
         existingAttendance.markedAt = new Date();
         await existingAttendance.save();
      }
    } else {
      // Create new attendance record
      await Attendance.create({
        studentId,
        teacherId: otp.facultyId,
        subjectId: otp.subjectId,
        section: otp.section,
        lecture_no: 1,
        date: otp.date,
        status: 'Present',
        markedAt: new Date()
      });
    }

    // Log OTP usage
    const OtpUsageLog = require('../models/OtpUsageLog');
    await OtpUsageLog.create({
      otpId: otp._id,
      studentId
    });

    res.status(200).json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Attendance
// @route   PUT /api/attendance/:id
// @access  Private/Teacher/Admin
exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Auto Attendance Lock (15 minutes limit for teachers)
    if (req.user.role === 'teacher') {
      const timeDiff = (new Date() - new Date(attendance.markedAt)) / 1000 / 60; // in minutes
      if (timeDiff > 15) {
        return res.status(403).json({ message: 'Editing is locked 15 minutes after attendance submission.' });
      }
    }

    attendance.status = req.body.status || attendance.status;
    await attendance.save();

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
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