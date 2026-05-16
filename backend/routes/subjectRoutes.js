const express = require('express');
const { getSubjects, createSubject } = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getSubjects)
  .post(protect, authorize('admin'), createSubject);

module.exports = router;