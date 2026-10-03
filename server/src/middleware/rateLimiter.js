import rateLimit from 'express-rate-limit';
import { SECURITY_CONFIG } from '../config/security.js';

// Authentication endpoints limiter (Login, Register)
export const authLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.AUTH_RATE_LIMIT_WINDOW_MS,
  max: SECURITY_CONFIG.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.'
  }
});

// General API requests limiter
export const apiLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.API_RATE_LIMIT_WINDOW_MS,
  max: SECURITY_CONFIG.API_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded. Please throttle your requests.'
  }
});

// Sensor telemetry ingestion rate limiter
export const sensorLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: SECURITY_CONFIG.SENSOR_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Telemetry ingestion rate limit exceeded for this unit.'
  }
});

// Report and export generation rate limiter
export const reportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Report generation rate limit reached. Please wait before generating another report.'
  }
});
