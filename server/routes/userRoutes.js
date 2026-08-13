const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  resetPassword,
  getAdminStats,
} = require('../controllers/userController');

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Admin-only: manage staff users
router.post('/', requireRole(['Admin']), createUser);
router.get('/', requireRole(['Admin']), getUsers);
router.get('/admin/stats', requireRole(['Admin']), getAdminStats);
router.get('/:id', requireRole(['Admin', 'Teacher']), getUserById);
router.put('/:id', requireRole(['Admin']), updateUser);
router.put('/:id/reset-password', requireRole(['Admin']), resetPassword);

module.exports = router;
