const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const marksRoutes = require('./routes/marksRoutes');
const testRoutes = require('./routes/testRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const piRoutes = require('./routes/piRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

// --- Security & Parsing Middleware ---
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' })); // For CSV/batch payloads
app.use(express.urlencoded({ extended: true }));

// --- Request Logging ---
if (!config.isProduction) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
    },
  });
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/pi', piRoutes);
app.use('/api/activities', activityRoutes);


// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
