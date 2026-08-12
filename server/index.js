const config = require('./config');
const { connectDB, disconnectDB } = require('./config/db');
const app = require('./app');

/**
 * EduGuide AI — Server Entry Point
 *
 * Connects to MongoDB, starts the Express server,
 * and handles graceful shutdown.
 */
async function startServer() {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start Express server
    const server = app.listen(config.port, () => {
      console.log(`\n🎓 EduGuide AI Server`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Port:        ${config.port}`);
      console.log(`   URL:         http://localhost:${config.port}`);
      console.log(`   Health:      http://localhost:${config.port}/api/health\n`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] Shutdown complete.');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        console.error('[Server] Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
}

startServer();
