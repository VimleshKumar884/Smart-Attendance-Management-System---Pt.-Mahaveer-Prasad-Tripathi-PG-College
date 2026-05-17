const express = require('express');
const { markAttendance, getAttendance, updateAttendance, generateOtp, cancelOtp, verifyOtp } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getAttendance)
  .post(protect, authorize('teacher', 'admin'), markAttendance);

router.route('/otp/generate')
  .post(protect, authorize('teacher', 'admin'), generateOtp);

router.route('/otp/cancel')
  .post(protect, authorize('teacher', 'admin'), cancelOtp);

router.route('/otp/verify')
  .post(protect, authorize('student'), verifyOtp);

router.route('/:id')
  .put(protect, authorize('teacher', 'admin'), updateAttendance);

module.exports = router;
