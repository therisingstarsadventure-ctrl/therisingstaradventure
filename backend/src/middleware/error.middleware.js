import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  if (err.stack) {
    logger.debug(err.stack);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Prisma Specific Errors
  if (err.code === 'P2002') {
    statusCode = 400;
    message = `Unique constraint violation on field: ${err.meta?.target || 'unknown'}`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found.';
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
