import { auditLogger } from '../services/auditLogger.js';

/**
 * Enforce minimum required role
 */
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.role !== requiredRole && req.user.role !== 'ADMIN') {
      // Log unauthorized elevation attempt
      auditLogger.logEvent({
        eventType: 'RBAC_VIOLATION',
        userId: req.user.id,
        role: req.user.role,
        ipAddress: req.ip || req.connection?.remoteAddress,
        resource: req.originalUrl,
        action: req.method,
        success: false,
        metadata: {
          requiredRole,
          attemptedRole: req.user.role
        }
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient administrative privileges.'
      });
    }

    next();
  };
};

/**
 * Enforce strict admin-only access
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Enforce user ownership of a resource (prevents accessing other workers' data)
 */
export const requireOwnership = (paramKey = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // Admins can view any user
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const requestedUserId = req.params[paramKey] || req.query[paramKey] || req.body[paramKey];

    if (requestedUserId && requestedUserId !== req.user.id) {
      auditLogger.logEvent({
        eventType: 'UNAUTHORIZED_DATA_ACCESS',
        userId: req.user.id,
        role: req.user.role,
        ipAddress: req.ip || req.connection?.remoteAddress,
        resource: req.originalUrl,
        action: req.method,
        success: false,
        metadata: { attemptedTargetId: requestedUserId }
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own personal safety records.'
      });
    }

    next();
  };
};
