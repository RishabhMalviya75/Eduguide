const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  createPISession,
  getStudentPIHistory,
} = require('../controllers/piController');

const router = Router();

router.use(authenticate);

// Log a PI Session
router.post('/', requireRole(['Admin', 'Counselor']), createPISession);

// Get history
router.get('/student/:studentId', requireRole(['Admin', 'Counselor', 'Teacher', 'Student']), getStudentPIHistory);

// Get latest career interest
router.get('/student/:studentId/interest', requireRole(['Admin', 'Counselor', 'Teacher', 'Student']), require('../controllers/piController').getStudentCareerInterest);

module.exports = router;
