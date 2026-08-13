const { User, Student } = require('../models');
const TestSession = require('../models/TestSession');
const { ApiError } = require('../middleware/errorHandler');
const authService = require('../services/authService');

async function getAdminStats(req, res, next) {
  try {
    const schoolId = req.schoolId;

    const [totalStudents, totalTeachers, totalTests] = await Promise.all([
      Student.countDocuments().setOptions({ schoolId }),
      User.countDocuments({ role: 'Teacher' }).setOptions({ schoolId }),
      TestSession.countDocuments({ status: 'completed' }).setOptions({ schoolId })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalTests
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new staff user (Admin or Teacher).
 * POST /api/users
 * Access: Admin only
 */
async function createUser(req, res) {
  const { name, email, password, role, assigned_classes } = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, 'Name, email, password, and role are required.');
  }

  // Hash the password
  const password_hash = await authService.hashPassword(password);

  const user = await User.create({
    school_id: req.schoolId,
    name,
    email,
    password_hash,
    role,
    assigned_classes: assigned_classes || [],
  });

  res.status(201).json({
    success: true,
    data: user,
  });
}

/**
 * Get all staff users for the current school.
 * GET /api/users
 * Access: Admin only
 */
async function getUsers(req, res) {
  const { role, is_active } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (is_active !== undefined) filter.is_active = is_active === 'true';

  const users = await User.find(filter).setOptions({ schoolId: req.schoolId });

  res.json({
    success: true,
    count: users.length,
    data: users,
  });
}

/**
 * Get a single staff user by ID.
 * GET /api/users/:id
 * Access: Admin, or the user themselves
 */
async function getUserById(req, res) {
  const user = await User.findById(req.params.id).setOptions({
    schoolId: req.schoolId,
  });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  res.json({
    success: true,
    data: user,
  });
}

/**
 * Update a staff user.
 * PUT /api/users/:id
 * Access: Admin only
 */
async function updateUser(req, res) {
  const { name, email, role, assigned_classes, is_active } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (role !== undefined) updateData.role = role;
  if (assigned_classes !== undefined) updateData.assigned_classes = assigned_classes;
  if (is_active !== undefined) updateData.is_active = is_active;

  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
    schoolId: req.schoolId,
  });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  res.json({
    success: true,
    data: user,
  });
}

/**
 * Reset a staff user's password.
 * PUT /api/users/:id/reset-password
 * Access: Admin only
 */
async function resetPassword(req, res) {
  const { new_password } = req.body;

  if (!new_password) {
    throw new ApiError(400, 'New password is required.');
  }

  if (new_password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters.');
  }

  const password_hash = await authService.hashPassword(new_password);

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { password_hash },
    { new: true, schoolId: req.schoolId }
  );

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  res.json({
    success: true,
    message: 'Password reset successfully.',
  });
}

module.exports = { getAdminStats, createUser, getUsers, getUserById, updateUser, resetPassword };
