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
    max: 100, // 100 attempts per window for development (change back to 10 for production)
  },

  // Bcrypt
  bcryptRounds: 12,

  // CORS
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:5174'], // Vite default ports

  // AI Scoring
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || null,
    model: process.env.AI_SCORING_MODEL || 'gpt-4o-mini',
    confidenceThreshold: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD) || 0.7,
    scoringEnabled: process.env.AI_SCORING_ENABLED === 'true', // Feature flag: when true, AI score replaces rule-based
    // If no API key is set, the service automatically runs in mock mode
    get isMockMode() { return !this.openaiApiKey; },
  },
};

// Validate critical config at startup
const requiredVars = ['jwtSecret', 'mongoUri'];
for (const key of requiredVars) {
  if (!config[key]) {
    throw new Error(`Missing required config: ${key}. Check your .env file.`);
  }
}

module.exports = config;
