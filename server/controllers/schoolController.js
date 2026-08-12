const { School } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Create a new school.
 * POST /api/schools
 * Access: System/Seed only (no auth required for initial setup)
 */
async function createSchool(req, res) {
  const { name, school_code, address, admin_contact } = req.body;

  const school = await School.create({
    name,
    school_code,
    address,
    admin_contact,
  });

  res.status(201).json({
    success: true,
    data: school,
  });
}

/**
 * Get all schools.
 * GET /api/schools
 * Access: System/Admin (for multi-school admin views later)
 */
async function getSchools(req, res) {
  const schools = await School.find({ is_active: true });

  res.json({
    success: true,
    count: schools.length,
    data: schools,
  });
}

/**
 * Get a single school by ID.
 * GET /api/schools/:id
 */
async function getSchoolById(req, res) {
  const school = await School.findById(req.params.id);

  if (!school) {
    throw new ApiError(404, 'School not found.');
  }

  res.json({
    success: true,
    data: school,
  });
}

/**
 * Update a school.
 * PUT /api/schools/:id
 * Access: Admin of that school
 */
async function updateSchool(req, res) {
  const { name, address, admin_contact, is_active } = req.body;

  const school = await School.findByIdAndUpdate(
    req.params.id,
    { name, address, admin_contact, is_active },
    { new: true, runValidators: true }
  );

  if (!school) {
    throw new ApiError(404, 'School not found.');
  }

  res.json({
    success: true,
    data: school,
  });
}

module.exports = { createSchool, getSchools, getSchoolById, updateSchool };
