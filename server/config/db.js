const mongoose = require('mongoose');
const config = require('./index');

/**
 * Connect to MongoDB with retry logic and event logging.
 * Exits process on initial connection failure in production.
 */
async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri, {
      // Mongoose 8 uses the new URL parser and unified topology by default
    });

    console.log(`[DB] Connected to MongoDB: ${mongoose.connection.host}`);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('[DB] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] MongoDB disconnected. Attempting reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[DB] MongoDB reconnected.');
    });
  } catch (err) {
    console.error('[DB] Initial MongoDB connection failed:', err.message);

    if (config.isProduction) {
      process.exit(1);
    }

    // In development, retry after 5 seconds
    console.log('[DB] Retrying connection in 5 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return connectDB();
  }
}

/**
 * Gracefully close the MongoDB connection.
 */
async function disconnectDB() {
  await mongoose.connection.close();
  console.log('[DB] MongoDB connection closed gracefully.');
}

module.exports = { connectDB, disconnectDB };
