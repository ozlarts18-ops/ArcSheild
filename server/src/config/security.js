import dotenv from 'dotenv';
dotenv.config();

export const SECURITY_CONFIG = {
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'arcshield_default_jwt_secret_change_in_production_key_982347',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'arcshield_default_jwt_refresh_secret_key_849201',
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || '1h',
  REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || '7d',

  // Password Hashing
  BCRYPT_SALT_ROUNDS: 12,

  // CORS Allowed Origins
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  ALLOWED_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    process.env.CLIENT_URL
  ].filter(Boolean),

  // Rate Limiting Defaults
  AUTH_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_RATE_LIMIT_MAX: 10,                   // 10 attempts per 15 min
  API_RATE_LIMIT_WINDOW_MS: 1 * 60 * 1000,   // 1 minute
  API_RATE_LIMIT_MAX: 120,                   // 120 requests per min
  SENSOR_RATE_LIMIT_MAX: 60,                 // 60 telemetry packets per min

  // Brute Force Lockout
  MAX_FAILED_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_SECONDS: 15 * 60,          // 15 minutes lock
};
