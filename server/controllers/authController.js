const { School, Student } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const authService = require('../services/authService');
const mongoose = require('mongoose');

// Helper to check DB connection state
const isDbConnected = () => mongoose.connection.readyState === 1;

// Mock Fallback Data (used when local MongoDB is not running)
const MOCK_SCHOOL_ID = '65e000000000000000000001';
const MOCK_STUDENT_ID = '65e000000000000000000002';

const MOCK_STUDENT_DATA = {
  id: MOCK_STUDENT_ID,
  name: 'Aarav Patel',
  grade: 10,
  section: 'A',
  school_id: MOCK_SCHOOL_ID,
  consent_flag: true,
};

const MOCK_USERS = {
  'admin@dps001.edu': {
    id: '65e000000000000000000003',
    name: 'Dr. Priya Sharma',
    email: 'admin@dps001.edu',
    role: 'Admin',
    school_id: MOCK_SCHOOL_ID,
    assigned_classes: [],
  },
  'rahul.verma@dps001.edu': {
    id: '65e000000000000000000004',
    name: 'Mr. Rahul Verma',
    email: 'rahul.verma@dps001.edu',
    role: 'Teacher',
    school_id: MOCK_SCHOOL_ID,
    assigned_classes: [{ grade: 10, section: 'A' }, { grade: 10, section: 'B' }],
  },
  'neha.gupta@dps001.edu': {
    id: '65e000000000000000000005',
    name: 'Ms. Neha Gupta',
    email: 'neha.gupta@dps001.edu',
    role: 'Counselor',
    school_id: MOCK_SCHOOL_ID,
    assigned_classes: [],
  },
};

/**
 * Staff Login — email + password → JWT
 * POST /api/auth/staff/login
 */
async function staffLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  // Offline fallback mode when MongoDB is not running
  if (!isDbConnected()) {
    const mockUser = MOCK_USERS[email.toLowerCase()];
    if (mockUser) {
      const token = authService.generateToken({
        user_id: mockUser.id,
        school_id: mockUser.school_id,
        role: mockUser.role,
      });
      return res.json({
        success: true,
        data: {
          token,
          user: mockUser,
        },
      });
    }
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Need to explicitly select password_hash since it's `select: false`
  const User = require('../models/User');
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password_hash')
    .setOptions({ bypassScope: true });

  if (!user || !user.is_active) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isPasswordValid = await authService.verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  user.last_login = new Date();
  await user.save();

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
        assigned_classes: user.assigned_classes || [],
      },
    },
  });
}

/**
 * Student Identity Verification — school_code + roll_no + DOB → identity token
 * POST /api/auth/student/verify-identity
 */
async function verifyStudentIdentity(req, res) {
  const { school_code, roll_no, dob } = req.body;

  if (!school_code || !roll_no || !dob) {
    throw new ApiError(400, 'School code, roll number, and date of birth are required.');
  }

  // Offline fallback mode when MongoDB is not running
  if (!isDbConnected()) {
    if (school_code.toUpperCase() === 'DPS001' && roll_no.trim() === '1001') {
      const identityToken = authService.generateIdentityToken({
        student_id: MOCK_STUDENT_ID,
        school_id: MOCK_SCHOOL_ID,
      });
      return res.json({
        success: true,
        data: {
          identity_token: identityToken,
          student_name: MOCK_STUDENT_DATA.name,
          message: 'Identity verified. Use this token to set your PIN.',
        },
      });
    }
    throw new ApiError(401, 'Invalid credentials.');
  }

  const school = await School.findOne({
    school_code: school_code.toUpperCase(),
    is_active: true,
  });

  if (!school) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  const student = await Student.findOne({
    roll_no: roll_no.trim(),
    is_active: true,
  }).setOptions({ schoolId: school._id.toString() });

  if (!student) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  const studentDob = new Date(student.dob).toISOString().split('T')[0];
  const providedDob = new Date(dob).toISOString().split('T')[0];

  if (studentDob !== providedDob) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  if (student.has_set_pin) {
    throw new ApiError(400, 'PIN already set. Please use the login endpoint.');
  }

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
 */
async function setStudentPin(req, res) {
  const { identity_token, pin } = req.body;

  if (!identity_token || !pin) {
    throw new ApiError(400, 'Identity token and PIN are required.');
  }

  if (!/^\d{4,6}$/.test(pin)) {
    throw new ApiError(400, 'PIN must be 4-6 digits.');
  }

  const decoded = authService.verifyToken(identity_token);

  if (decoded.purpose !== 'identity_verification') {
    throw new ApiError(401, 'Invalid identity token.');
  }

  // Offline fallback mode when MongoDB is not running
  if (!isDbConnected()) {
    const token = authService.generateToken({
      student_id: MOCK_STUDENT_ID,
      school_id: MOCK_SCHOOL_ID,
      role: 'Student',
    });
    return res.status(201).json({
      success: true,
      data: {
        token,
        student: MOCK_STUDENT_DATA,
        message: 'PIN set successfully. You are now logged in.',
      },
    });
  }

  const student = await Student.findById(decoded.student_id)
    .select('+pin_hash')
    .setOptions({ schoolId: decoded.school_id });

  if (!student || !student.is_active) {
    throw new ApiError(404, 'Student not found.');
  }

  if (student.has_set_pin) {
    throw new ApiError(400, 'PIN already set.');
  }

  student.pin_hash = await authService.hashPin(pin);
  student.has_set_pin = true;
  await student.save();

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

  // Offline fallback mode when MongoDB is not running
  if (!isDbConnected()) {
    if (school_code.toUpperCase() === 'DPS001' && roll_no.trim() === '1001') {
      const token = authService.generateToken({
        student_id: MOCK_STUDENT_ID,
        school_id: MOCK_SCHOOL_ID,
        role: 'Student',
      });
      return res.json({
        success: true,
        data: {
          token,
          student: MOCK_STUDENT_DATA,
        },
      });
    }
    throw new ApiError(401, 'Invalid credentials.');
  }

  const school = await School.findOne({
    school_code: school_code.toUpperCase(),
    is_active: true,
  });

  if (!school) {
    throw new ApiError(401, 'Invalid credentials.');
  }

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

  const isPinValid = await authService.verifyPin(pin, student.pin_hash);
  if (!isPinValid) {
    throw new ApiError(401, 'Invalid credentials.');
  }

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
