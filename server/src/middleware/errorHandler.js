import { auditLogger } from '../services/auditLogger.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const isProduction = process.env.NODE_ENV === 'production';

  // Log server-side for troubleshooting without exposing to client
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);
  if (!isProduction && err.stack) {
    console.error(err.stack);
  }

  // Record unexpected 500 errors in security log
  if (statusCode >= 500) {
    auditLogger.logEvent({
      eventType: 'SERVER_ERROR',
      userId: req.user?.id || null,
      role: req.user?.role || 'ANONYMOUS',
      ipAddress: req.ip || req.connection?.remoteAddress,
      resource: req.originalUrl,
      action: req.method,
      success: false,
      metadata: { error: err.message }
    });
  }

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500 
      ? 'An unexpected error occurred. Please try again later.' 
      : err.message || 'Request could not be processed.',
    ...(isProduction ? {} : { stack: err.stack })
  });
};

export default errorHandler;
