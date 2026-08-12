const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const {
  staffLogin,
  verifyStudentIdentity,
  setStudentPin,
  studentLogin,
} = require('../controllers/authController');

const router = Router();

// Rate limit all auth endpoints — 10 attempts per 15 min per IP
const authLimiter = rateLimit({
  windowMs: config.authRateLimit.windowMs,
  max: config.authRateLimit.max,
  message: {
    success: false,
    error: {
      message: 'Too many login attempts. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Staff auth
router.post('/staff/login', authLimiter, staffLogin);

// Student auth (zero-email flow)
router.post('/student/verify-identity', authLimiter, verifyStudentIdentity);
router.post('/student/set-pin', authLimiter, setStudentPin);
router.post('/student/login', authLimiter, studentLogin);

module.exports = router;
