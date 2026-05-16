const express = require('express');
const { markAttendance, getAttendance, updateAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getAttendance)
  .post(protect, authorize('teacher', 'admin'), markAttendance);

router.route('/:id')
  .put(protect, authorize('teacher', 'admin'), updateAttendance);

module.exports = router;