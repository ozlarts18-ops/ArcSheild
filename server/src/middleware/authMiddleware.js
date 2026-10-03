import jwt from 'jsonwebtoken';
import { SECURITY_CONFIG } from '../config/security.js';
import { redisService } from '../services/redisService.js';

export const authenticateJwt = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No access token provided.'
      });
    }

    // Check if token was revoked / blacklisted in Redis
    const isBlacklisted = await redisService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Session has been invalidated. Please log in again.'
      });
    }

    // Verify JWT
    jwt.verify(token, SECURITY_CONFIG.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Session token has expired. Please refresh your session.',
            code: 'TOKEN_EXPIRED'
          });
        }
        return res.status(401).json({
          success: false,
          message: 'Invalid authorization token.'
        });
      }

      req.user = decoded;
      req.token = token;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication processing error.'
    });
  }
};

/**
 * Optional authentication middleware that extracts user info if present without blocking
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    jwt.verify(token, SECURITY_CONFIG.JWT_SECRET, (err, decoded) => {
      if (!err && decoded) {
        req.user = decoded;
      }
      next();
    });
  } else {
    next();
  }
};
