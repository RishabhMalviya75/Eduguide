const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const testController = require('../controllers/testController');

const router = express.Router();

// All test routes require authentication and must be accessed by Students
router.use(authenticate);
router.use(requireRole(['Student']));

router.post('/start', testController.startTest);
router.post('/submit', testController.submitTest);
router.get('/history', testController.getTestHistory);

module.exports = router;
