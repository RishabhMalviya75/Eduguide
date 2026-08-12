const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  createSchool,
  getSchools,
  getSchoolById,
  updateSchool,
} = require('../controllers/schoolController');

const router = Router();

// Public: No auth required for school creation during initial setup/seed
// In production, this would be locked behind a superadmin auth
router.post('/', createSchool);

// Protected routes
router.get('/', authenticate, requireRole(['Admin']), getSchools);
router.get('/:id', authenticate, getSchoolById);
router.put('/:id', authenticate, requireRole(['Admin']), updateSchool);

module.exports = router;
