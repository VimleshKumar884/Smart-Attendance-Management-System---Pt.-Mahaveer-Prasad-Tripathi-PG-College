const express = require('express');
const { getAssignments, createAssignment, deleteAssignment, syncFacultyAssignments } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAssignments)
  .post(authorize('admin'), createAssignment);

router.route('/faculty/:facultyId')
  .put(authorize('admin'), syncFacultyAssignments);

router.route('/:id')
  .delete(authorize('admin'), deleteAssignment);

module.exports = router;
