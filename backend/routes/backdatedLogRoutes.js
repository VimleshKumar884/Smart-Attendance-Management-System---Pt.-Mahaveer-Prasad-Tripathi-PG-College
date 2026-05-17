const express = require('express');
const { getBackdatedLogs, createBackdatedLog, updateBackdatedLogStatus } = require('../controllers/backdatedLogController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin', 'teacher'), getBackdatedLogs)
  .post(authorize('teacher', 'admin'), createBackdatedLog);

router.route('/:id')
  .put(authorize('admin'), updateBackdatedLogStatus);

module.exports = router;
