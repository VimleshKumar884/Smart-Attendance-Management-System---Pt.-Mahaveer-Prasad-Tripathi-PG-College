const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { createObjectCsvStringifier } = require('csv-writer');

exports.createSession = async (req, res) => {
  try {
    const { subjectId, section, durationMinutes } = req.body;
    
    if (!subjectId || !section || !durationMinutes) {
      return res.status(400).json({ message: 'Missing required fields: subjectId, section, durationMinutes' });
    }

    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    const session = await Session.create({
      teacherId: req.user.id,
      subjectId,
      section,
      expiresAt
    });

    await AuditLog.create({
      action: 'SESSION_CREATED',
      performedBy: req.user.id,
      details: { sessionId: session._id, subjectId, section, expiresAt }
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.scanQr = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const studentId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ message: 'Missing sessionId' });
    }

    const session = await Session.findById(sessionId);
    if (!session || !session.isActive) {
      return res.status(400).json({ message: 'Invalid or inactive session' });
    }

    if (new Date() > new Date(session.expiresAt)) {
      session.isActive = false;
      await session.save();
      return res.status(400).json({ message: 'Session has expired' });
    }

    // Proxy prevention is handled by MongoDB unique index on studentId + sessionId
    // But we check explicitly to give a nice message
    const existing = await Attendance.findOne({ studentId, sessionId });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for this session' });
    }

    const attendance = await Attendance.create({
      studentId,
      teacherId: session.teacherId,
      subjectId: session.subjectId,
      sessionId: session._id,
      section: session.section,
      date: session.date,
      status: 'Present',
      markedAt: new Date()
    });

    await AuditLog.create({
      action: 'ATTENDANCE_MARKED_QR',
      performedBy: studentId,
      targetStudent: studentId,
      details: { sessionId: session._id, attendanceId: attendance._id }
    });

    res.status(200).json({ success: true, message: 'Attendance marked successfully via QR' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Attendance already marked for this session' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.exportCsv = async (req, res) => {
  try {
    const { subjectId, section, startDate, endDate } = req.query;
    
    let query = {};
    if (subjectId) query.subjectId = subjectId;
    if (section) query.section = section;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendances = await Attendance.find(query)
      .populate('studentId', 'name rollNumber email')
      .populate('subjectId', 'subjectName subjectCode');

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'rollNumber', title: 'Roll Number' },
        { id: 'name', title: 'Student Name' },
        { id: 'subject', title: 'Subject' },
        { id: 'date', title: 'Date' },
        { id: 'status', title: 'Status' }
      ]
    });

    const records = attendances.map(a => ({
      rollNumber: a.studentId?.rollNumber || 'N/A',
      name: a.studentId?.name || 'N/A',
      subject: a.subjectId?.subjectName || 'N/A',
      date: a.date ? a.date.toISOString().split('T')[0] : 'N/A',
      status: a.status
    }));

    const header = csvStringifier.getHeaderString();
    const rows = csvStringifier.stringifyRecords(records);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance.csv"');
    res.status(200).send(header + rows);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLowAttendanceAlerts = async (req, res) => {
  try {
    const studentId = req.user.id;
    // Get all unique subjects for the student
    const subjectIds = await Attendance.distinct('subjectId', { studentId });
    
    let alerts = [];
    
    for (let subId of subjectIds) {
      const total = await Attendance.countDocuments({ studentId, subjectId: subId });
      const present = await Attendance.countDocuments({ studentId, subjectId: subId, status: 'Present' });
      const late = await Attendance.countDocuments({ studentId, subjectId: subId, status: 'Late' });
      
      const effectivePresent = present + (late * 0.5);
      const percentage = total > 0 ? (effectivePresent / total) * 100 : 0;
      
      if (percentage < 75 && total >= 3) {
        // Calculate classes needed to recover
        // (effectivePresent + X) / (total + X) >= 0.75
        // effectivePresent + X >= 0.75 * total + 0.75 * X
        // 0.25 * X >= 0.75 * total - effectivePresent
        // X = (0.75 * total - effectivePresent) / 0.25
        const needed = Math.ceil((0.75 * total - effectivePresent) / 0.25);
        alerts.push({
          subjectId: subId,
          percentage: percentage.toFixed(2),
          classesNeeded: needed > 0 ? needed : 0
        });
      }
    }

    res.status(200).json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
