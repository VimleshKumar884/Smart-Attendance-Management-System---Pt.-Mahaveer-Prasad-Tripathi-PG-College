const express = require('express');
const { getFacultyLogs, getMyFacultyLogs, updateFacultyLog } = require('../controllers/facultyLogController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin'), getFacultyLogs);

router.route('/me')
  .get(authorize('teacher'), getMyFacultyLogs);

router.route('/:id')
  .put(authorize('admin'), updateFacultyLog);

module.exports = router;
