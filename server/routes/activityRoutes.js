const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  cancelActivity,
  registerStudent,
  unregisterStudent,
  getActivityParticipants,
} = require('../controllers/activityController');

const router = Router();

// All activity routes require authentication
router.use(authenticate);

// List activities (all authenticated roles)
router.get('/', getActivities);

// Create activity (Teacher and Admin)
router.post('/', requireRole(['Teacher', 'Admin']), createActivity);

// Get single activity details
router.get('/:id', getActivityById);

// Update activity (Teacher and Admin)
router.put('/:id', requireRole(['Teacher', 'Admin']), updateActivity);

// Cancel activity (Teacher and Admin)
router.delete('/:id', requireRole(['Teacher', 'Admin']), cancelActivity);

// Student join / register
router.post('/:id/register', requireRole(['Student']), registerStudent);

// Student unregister / leave
router.delete('/:id/register', requireRole(['Student']), unregisterStudent);

// View activity participants (Teacher and Admin)
router.get('/:id/participants', requireRole(['Teacher', 'Admin']), getActivityParticipants);

module.exports = router;
