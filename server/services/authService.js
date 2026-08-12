const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Auth Service — password/PIN hashing and JWT operations.
 * Centralized so hashing strategy changes propagate everywhere.
 */

// --- Password Hashing (for Staff users) ---

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, config.bcryptRounds);
}

async function verifyPassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

// --- PIN Hashing (for Students) ---
// Same bcrypt approach — PINs are short but still need proper hashing

async function hashPin(plainPin) {
  return bcrypt.hash(plainPin, config.bcryptRounds);
}

async function verifyPin(plainPin, hash) {
  return bcrypt.compare(plainPin, hash);
}

// --- JWT Operations ---

/**
 * Generate a JWT token.
 * @param {Object} payload - Token payload (user_id/student_id, school_id, role)
 * @returns {string} Signed JWT
 */
function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Verify and decode a JWT token.
 * @param {string} token - JWT to verify
 * @returns {Object} Decoded payload
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

/**
 * Generate a short-lived identity verification token (for student first-login flow).
 * This token proves "I verified my DOB" but doesn't grant full access.
 * @param {Object} payload - { student_id, school_id }
 * @returns {string} Signed JWT valid for 10 minutes
 */
function generateIdentityToken(payload) {
  return jwt.sign({ ...payload, purpose: 'identity_verification' }, config.jwtSecret, {
    expiresIn: '10m',
  });
}

module.exports = {
  hashPassword,
  verifyPassword,
  hashPin,
  verifyPin,
  generateToken,
  verifyToken,
  generateIdentityToken,
};
