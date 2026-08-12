const { verifyToken } = require('../services/authService');
const { ApiError } = require('./errorHandler');

/**
 * authenticate — JWT authentication middleware.
 *
 * Extracts token from Authorization header, verifies it, and attaches
 * user context to `req.user` and `req.schoolId`.
 *
 * Token payload expected:
 *   Staff:   { user_id, school_id, role: 'Admin'|'Teacher' }
 *   Student: { student_id, school_id, role: 'Student' }
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required. Provide a valid Bearer token.');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'Authentication required. Token is missing.');
  }

  // verifyToken throws JsonWebTokenError/TokenExpiredError on failure
  // Express 5 will catch these and forward to error handler
  const decoded = verifyToken(token);

  // Reject identity-verification tokens used as auth tokens
  if (decoded.purpose === 'identity_verification') {
    throw new ApiError(401, 'Identity verification tokens cannot be used for authentication.');
  }

  // Attach user context for downstream middleware and controllers
  req.user = {
    id: decoded.user_id || decoded.student_id,
    user_id: decoded.user_id || null,
    student_id: decoded.student_id || null,
    school_id: decoded.school_id,
    role: decoded.role,
  };

  // Convenience: schoolId available directly for Mongoose scoped queries
  req.schoolId = decoded.school_id;

  next();
}

module.exports = { authenticate };
