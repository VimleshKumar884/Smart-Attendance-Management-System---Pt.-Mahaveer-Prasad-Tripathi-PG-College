const express = require('express');
const { markAttendance, getAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getAttendance)
  .post(protect, authorize('teacher', 'admin'), markAttendance);

module.exports = router;