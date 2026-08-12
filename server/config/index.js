const dotenv = require('dotenv');
const path = require('path');

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/eduguide',

  // Auth
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  sessionTimeoutMin: parseInt(process.env.SESSION_TIMEOUT_MIN, 10) || 15,

  // Rate limiting
  authRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
  },

  // Bcrypt
  bcryptRounds: 12,

  // CORS
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173'], // Vite default port
};

// Validate critical config at startup
const requiredVars = ['jwtSecret', 'mongoUri'];
for (const key of requiredVars) {
  if (!config[key]) {
    throw new Error(`Missing required config: ${key}. Check your .env file.`);
  }
}

module.exports = config;
