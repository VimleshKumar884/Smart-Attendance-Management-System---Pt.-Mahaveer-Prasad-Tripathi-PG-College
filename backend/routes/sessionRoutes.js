const express = require('express');
const { createSession, scanQr, exportCsv, getLowAttendanceAlerts } = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', protect, authorize('teacher', 'admin'), createSession);
router.post('/scan', protect, authorize('student'), scanQr);
router.get('/export', protect, authorize('teacher', 'admin'), exportCsv);
router.get('/alerts', protect, authorize('student'), getLowAttendanceAlerts);

module.exports = router;
