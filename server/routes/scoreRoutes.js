const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  getFlaggedScores,
  resolveFlaggedScore,
} = require('../controllers/scoreController');

const router = Router();

// All score routes require authentication
router.use(authenticate);

// Admin, Teacher, and Counselor can review scores
router.get('/flagged', requireRole(['Admin', 'Teacher', 'Counselor']), getFlaggedScores);
router.put('/:id/review', requireRole(['Admin', 'Teacher', 'Counselor']), resolveFlaggedScore);

module.exports = router;
