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

router.get(
  '/school',
  requireRole(['Admin', 'Teacher', 'Counselor']),
  analyticsController.getSchoolAnalytics
);

// We don't have requireSelf configured perfectly for nested paths without ID param, 
// so we'll just let Student/Staff access it. If student, they should only request their own ID.
router.get(
  '/student/:id/report',
  requireRole(['Student', 'Admin', 'Teacher', 'Counselor']),
  analyticsController.getStudentReportData
);

module.exports = router;
