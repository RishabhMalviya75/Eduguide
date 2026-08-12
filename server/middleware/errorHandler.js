/**
 * Centralized error handling middleware for Express 5.
 *
 * Express 5 automatically catches promise rejections from async route handlers,
 * so we don't need express-async-errors. All errors flow here.
 */

/**
 * Custom API error class with status code.
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

/**
 * Not Found handler — catch 404s for unmatched routes.
 */
function notFound(req, res, next) {
  const error = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
}

/**
 * Global error handler — formats all errors into consistent JSON responses.
 * Must have 4 parameters for Express to recognize it as an error handler.
 */
function errorHandler(err, req, res, next) {
  // Default to 500 if no status code set
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Mongoose validation error → 400
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key error → 409
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'unknown';
    message = `Duplicate value for: ${field}`;
    details = err.keyValue;
  }

  // Mongoose cast error (invalid ObjectId, etc.) → 400
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}: ${err.value}`;
  }

  // JWT errors → 401
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Tenant scope violations → 403
  if (err.message && err.message.includes('[TenantScope]')) {
    statusCode = 403;
    message = 'Access denied: tenant scope violation';
    // Don't leak internal scope details to client
    details = null;
    // But DO log it — this is a security event
    console.error('[SECURITY] Tenant scope violation:', err.message);
  }

  // Log server errors
  if (statusCode >= 500) {
    console.error(`[ERROR] ${statusCode} ${req.method} ${req.originalUrl}:`, err);
  }

  // Never leak stack traces in production
  const response = {
    success: false,
    error: {
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  };

  res.status(statusCode).json(response);
}

module.exports = { ApiError, notFound, errorHandler };
