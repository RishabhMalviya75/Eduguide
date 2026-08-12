const { School, Student } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const authService = require('../services/authService');

/**
 * Staff Login — email + password → JWT
 * POST /api/auth/staff/login
 */
async function staffLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  // Need to explicitly select password_hash since it's `select: false`
  const User = require('../models/User');
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password_hash')
    .setOptions({ bypassScope: true }); // Login doesn't have a school context yet

  if (!user || !user.is_active) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isPasswordValid = await authService.verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Update last login timestamp
  user.last_login = new Date();
  await user.save();

  // Generate JWT with user context
  const token = authService.generateToken({
    user_id: user._id.toString(),
    school_id: user.school_id.toString(),
    role: user.role,
  });

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        school_id: user.school_id,
      },
    },
  });
}

/**
 * Student Identity Verification — school_code + roll_no + DOB → identity token
 * POST /api/auth/student/verify-identity
 *
 * First step of the student first-login flow.
 * Returns a short-lived token that proves "I am this student" but
 * doesn't grant API access. Used to then set a PIN.
 */
async function verifyStudentIdentity(req, res) {
  const { school_code, roll_no, dob } = req.body;

  if (!school_code || !roll_no || !dob) {
    throw new ApiError(400, 'School code, roll number, and date of birth are required.');
  }

  // Find the school by code
  const school = await School.findOne({
    school_code: school_code.toUpperCase(),
    is_active: true,
  });

  if (!school) {
    // Don't reveal whether school exists
    throw new ApiError(401, 'Invalid credentials.');
  }

  // Find the student within that school
  const student = await Student.findOne({
    roll_no: roll_no.trim(),
    is_active: true,
  }).setOptions({ schoolId: school._id.toString() });

  if (!student) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  // Verify DOB matches
  const studentDob = new Date(student.dob).toISOString().split('T')[0];
  const providedDob = new Date(dob).toISOString().split('T')[0];

  if (studentDob !== providedDob) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  // Check if student already has a PIN
  if (student.has_set_pin) {
    throw new ApiError(400, 'PIN already set. Please use the login endpoint.');
  }

  // Generate short-lived identity token
  const identityToken = authService.generateIdentityToken({
    student_id: student._id.toString(),
    school_id: school._id.toString(),
  });

  res.json({
    success: true,
    data: {
      identity_token: identityToken,
      student_name: student.name,
      message: 'Identity verified. Use this token to set your PIN.',
    },
  });
}

/**
 * Set Student PIN — identity token + new PIN → full JWT
 * POST /api/auth/student/set-pin
 *
 * Second step of first-login flow. Requires the identity token from verify-identity.
 */
async function setStudentPin(req, res) {
  const { identity_token, pin } = req.body;

  if (!identity_token || !pin) {
    throw new ApiError(400, 'Identity token and PIN are required.');
  }

  // Validate PIN format (4-6 digits)
  if (!/^\d{4,6}$/.test(pin)) {
    throw new ApiError(400, 'PIN must be 4-6 digits.');
  }

  // Verify the identity token
  const decoded = authService.verifyToken(identity_token);

  if (decoded.purpose !== 'identity_verification') {
    throw new ApiError(401, 'Invalid identity token.');
  }

  // Find the student and set PIN
  const student = await Student.findById(decoded.student_id)
    .select('+pin_hash')
    .setOptions({ schoolId: decoded.school_id });

  if (!student || !student.is_active) {
    throw new ApiError(404, 'Student not found.');
  }

  if (student.has_set_pin) {
    throw new ApiError(400, 'PIN already set.');
  }

  // Hash and store the PIN
  student.pin_hash = await authService.hashPin(pin);
  student.has_set_pin = true;
  await student.save();

  // Generate full access JWT
  const token = authService.generateToken({
    student_id: student._id.toString(),
    school_id: student.school_id.toString(),
    role: 'Student',
  });

  res.status(201).json({
    success: true,
    data: {
      token,
      student: {
        id: student._id,
        name: student.name,
        grade: student.grade,
        section: student.section,
        school_id: student.school_id,
      },
      message: 'PIN set successfully. You are now logged in.',
    },
  });
}

/**
 * Student Login — school_code + roll_no + PIN → JWT
 * POST /api/auth/student/login
 */
async function studentLogin(req, res) {
  const { school_code, roll_no, pin } = req.body;

  if (!school_code || !roll_no || !pin) {
    throw new ApiError(400, 'School code, roll number, and PIN are required.');
  }

  // Find school
  const school = await School.findOne({
    school_code: school_code.toUpperCase(),
    is_active: true,
  });

  if (!school) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  // Find student with PIN hash
  const student = await Student.findOne({
    roll_no: roll_no.trim(),
    is_active: true,
  })
    .select('+pin_hash')
    .setOptions({ schoolId: school._id.toString() });

  if (!student) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  if (!student.has_set_pin || !student.pin_hash) {
    throw new ApiError(400, 'PIN not set. Please complete first-login setup.');
  }

  // Verify PIN
  const isPinValid = await authService.verifyPin(pin, student.pin_hash);
  if (!isPinValid) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  // Generate JWT
  const token = authService.generateToken({
    student_id: student._id.toString(),
    school_id: school._id.toString(),
    role: 'Student',
  });

  res.json({
    success: true,
    data: {
      token,
      student: {
        id: student._id,
        name: student.name,
        grade: student.grade,
        section: student.section,
        school_id: student.school_id,
      },
    },
  });
}

module.exports = {
  staffLogin,
  verifyStudentIdentity,
  setStudentPin,
  studentLogin,
};
