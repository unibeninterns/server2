import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  const error = err;
  error.statusCode = error.statusCode || 500;
  error.status =
    error.statusCode >= 400 && error.statusCode < 500 ? 'fail' : 'error';

  // Handle MongoDB duplicate key error
  if (err.name === 'MongoServerError' && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.statusCode = 400;
    error.status = 'fail';
    error.message = `A record with this ${field} already exists`;
    error.isOperational = true;
  }

  // Handle MongoDB validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((err) => err.message);
    error.statusCode = 400;
    error.status = 'fail';
    error.message = `Validation Error: ${errors.join('. ')}`;
    error.isOperational = true;
  }

  // Handle Cast Errors (malformed MongoDB IDs)
  if (err.name === 'CastError') {
    error.statusCode = 400;
    error.status = 'fail';
    error.message = `Invalid ${err.path}: ${err.value}`;
    error.isOperational = true;
  }

  // Handle Multer Errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.statusCode = 400;
    error.status = 'fail';
    error.message = 'File too large. Maximum size is 3MB.';
    error.isOperational = true;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.status = 'fail';
    error.message = 'Invalid token';
    error.isOperational = true;
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.status = 'fail';
    error.message = 'Token expired';
    error.isOperational = true;
  }

  logger.error('Error', error);

  if (process.env.NODE_ENV === 'development') {
    res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  } else if (process.env.NODE_ENV === 'production') {
    const prodError = { ...error };
    prodError.message = error.message;

    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Server Error!, Something went wrong!',
      });
    }
  }
};

export default errorHandler;
