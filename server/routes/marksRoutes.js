const express = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const marksController = require('../controllers/marksController');

const router = express.Router();

// Configure multer for memory storage (we parse the buffer directly)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Protect all marks routes
router.use(authenticate);

// Only Teachers can upload and confirm marks
router.post(
  '/upload',
  requireRole(['Teacher']),
  upload.single('file'), // Expecting a file field named 'file'
  marksController.uploadCSV
);

router.post(
  '/confirm',
  requireRole(['Teacher']),
  marksController.confirmUpload
);

module.exports = router;
