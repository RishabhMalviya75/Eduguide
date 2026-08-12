const { ApiError } = require('./errorHandler');

/**
 * requireRole — Role-based access control middleware.
 *
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 *   e.g., requireRole(['Admin']), requireRole(['Admin', 'Teacher'])
 * @returns Express middleware
 *
 * Must be used AFTER authenticate middleware.
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}.`
      );
    }

    next();
  };
}

/**
 * requireSelf — Ensures the requesting user can only access their own resource.
 *
 * @param {string} paramKey - The route parameter name containing the target ID
 *   e.g., requireSelf('id') checks req.params.id against req.user.student_id
 *
 * Used for Student routes where a student should only access their own data.
 * Admin and Teacher roles bypass this check (they can access any student in their scope).
 */
function requireSelf(paramKey = 'id') {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required.');
    }

    // Admin and Teacher can access any student within their school scope
    if (req.user.role === 'Admin' || req.user.role === 'Teacher') {
      return next();
    }

    // Students can only access their own data
    const targetId = req.params[paramKey];
    if (req.user.student_id !== targetId) {
      throw new ApiError(
        403,
        'Access denied. You can only access your own data.'
      );
    }

    next();
  };
}

/**
 * requireClassAccess — Ensures a Teacher can only access classes they're assigned to.
 *
 * Reads grade/section from req.params or req.query and checks against
 * the teacher's assigned_classes from the token or a DB lookup.
 *
 * NOTE: This performs a lightweight check. The teacher's assigned_classes
 * should be embedded in the JWT payload or fetched fresh per request.
 * For Phase 0, we'll fetch from DB to keep the token small.
 */
function requireClassAccess() {
  return async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required.');
    }

    // Admins can access all classes within their school
    if (req.user.role === 'Admin') {
      return next();
    }

    if (req.user.role !== 'Teacher') {
      throw new ApiError(403, 'Access denied.');
    }

    // Get target grade/section from params or query
    const grade = parseInt(req.params.grade || req.query.grade, 10);
    const section = (req.params.section || req.query.section || '').toUpperCase();

    // If no grade/section specified, let the controller handle filtering
    if (!grade || !section) {
      return next();
    }

    // Fetch teacher's assigned classes from DB
    const User = require('../models/User');
    const teacher = await User.findById(req.user.user_id)
      .select('assigned_classes')
      .setOptions({ schoolId: req.schoolId });

    if (!teacher) {
      throw new ApiError(404, 'Teacher profile not found.');
    }

    const hasAccess = teacher.assigned_classes.some(
      (c) => c.grade === grade && c.section === section
    );

    if (!hasAccess) {
      throw new ApiError(
        403,
        `Access denied. You are not assigned to Grade ${grade} Section ${section}.`
      );
    }

    next();
  };
}

module.exports = { requireRole, requireSelf, requireClassAccess };
