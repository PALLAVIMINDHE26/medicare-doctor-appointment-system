/**
 * Central error handler. Normalizes Mongoose/JWT/validation errors into a
 * consistent { success: false, message, errors? } shape so the frontend
 * never has to special-case error formats.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  let message = err.message || 'Server error';
  let errors = err.errors && Array.isArray(err.errors) ? err.errors : undefined;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
  }

  // Mongoose duplicate key error (e.g. duplicate email, or double-booked slot)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    if (field === 'startTime' || Object.keys(err.keyPattern || {}).includes('date')) {
      message = 'This time slot was just booked by someone else. Please pick another slot.';
    } else {
      message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Value'} already exists`;
    }
  }

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };
