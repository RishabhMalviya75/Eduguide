const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole, requireSelf } = require('../middleware/rbac');
const {
  createStudent,
  createStudentsBatch,
  getStudents,
  getStudentById,
  updateStudent,
  resetStudentPin,
} = require('../controllers/studentController');

const router = Router();

// All student routes require authentication
router.use(authenticate);

// Admin-only: create and manage students
router.post('/', requireRole(['Admin']), createStudent);
router.post('/batch', requireRole(['Admin']), createStudentsBatch);

// Admin & Teacher: list students (teacher sees assigned classes via controller filtering)
router.get('/', requireRole(['Admin', 'Teacher']), getStudents);

// Admin, Teacher, or the student themselves
router.get('/:id', requireRole(['Admin', 'Teacher', 'Student']), requireSelf('id'), getStudentById);

// Admin-only: update student and reset PIN
router.put('/:id', requireRole(['Admin']), updateStudent);
router.put('/:id/reset-pin', requireRole(['Admin']), resetStudentPin);

module.exports = router;
