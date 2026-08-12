const { Student } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Create a new student.
 * POST /api/students
 * Access: Admin only
 */
async function createStudent(req, res) {
  const { roll_no, name, grade, section, dob, consent_flag } = req.body;

  if (!roll_no || !name || !grade || !section || !dob) {
    throw new ApiError(
      400,
      'Roll number, name, grade, section, and date of birth are required.'
    );
  }

  const student = await Student.create({
    school_id: req.schoolId,
    roll_no,
    name,
    grade,
    section,
    dob,
    consent_flag: consent_flag || false,
  });

  res.status(201).json({
    success: true,
    data: student,
  });
}

/**
 * Create multiple students (batch import).
 * POST /api/students/batch
 * Access: Admin only
 */
async function createStudentsBatch(req, res) {
  const { students } = req.body;

  if (!Array.isArray(students) || students.length === 0) {
    throw new ApiError(400, 'An array of students is required.');
  }

  // Add school_id to each student record
  const studentsWithSchool = students.map((s) => ({
    ...s,
    school_id: req.schoolId,
  }));

  const created = await Student.insertMany(studentsWithSchool, {
    ordered: false, // Continue on individual errors
    runValidators: true,
  });

  res.status(201).json({
    success: true,
    count: created.length,
    data: created,
  });
}

/**
 * Get all students for the current school.
 * GET /api/students
 * Access: Admin, Teacher (filtered to assigned classes)
 * Query params: grade, section, is_active
 */
async function getStudents(req, res) {
  const { grade, section, is_active } = req.query;

  const filter = {};
  if (grade) filter.grade = parseInt(grade, 10);
  if (section) filter.section = section.toUpperCase();
  if (is_active !== undefined) filter.is_active = is_active === 'true';

  const students = await Student.find(filter)
    .sort({ grade: 1, section: 1, roll_no: 1 })
    .setOptions({ schoolId: req.schoolId });

  res.json({
    success: true,
    count: students.length,
    data: students,
  });
}

/**
 * Get a single student by ID.
 * GET /api/students/:id
 * Access: Admin, Teacher, or the student themselves (via requireSelf)
 */
async function getStudentById(req, res) {
  const student = await Student.findById(req.params.id).setOptions({
    schoolId: req.schoolId,
  });

  if (!student) {
    throw new ApiError(404, 'Student not found.');
  }

  res.json({
    success: true,
    data: student,
  });
}

/**
 * Update a student.
 * PUT /api/students/:id
 * Access: Admin only
 */
async function updateStudent(req, res) {
  const { name, grade, section, dob, consent_flag, is_active } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (grade !== undefined) updateData.grade = grade;
  if (section !== undefined) updateData.section = section;
  if (dob !== undefined) updateData.dob = dob;
  if (consent_flag !== undefined) updateData.consent_flag = consent_flag;
  if (is_active !== undefined) updateData.is_active = is_active;

  const student = await Student.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
    schoolId: req.schoolId,
  });

  if (!student) {
    throw new ApiError(404, 'Student not found.');
  }

  res.json({
    success: true,
    data: student,
  });
}

/**
 * Reset a student's PIN (Admin action).
 * PUT /api/students/:id/reset-pin
 * Access: Admin only
 * Clears the PIN so the student must go through first-login flow again.
 */
async function resetStudentPin(req, res) {
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { pin_hash: null, has_set_pin: false },
    { new: true, schoolId: req.schoolId }
  );

  if (!student) {
    throw new ApiError(404, 'Student not found.');
  }

  res.json({
    success: true,
    message: `PIN reset for student ${student.name}. They must set a new PIN at next login.`,
  });
}

module.exports = {
  createStudent,
  createStudentsBatch,
  getStudents,
  getStudentById,
  updateStudent,
  resetStudentPin,
};
