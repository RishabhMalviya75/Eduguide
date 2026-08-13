const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

// Only students can view their own analytics for now
router.use(authenticate);

router.get(
  '/student/insights',
  requireRole(['Student']),
  analyticsController.getStudentAnalytics
);

module.exports = router;
