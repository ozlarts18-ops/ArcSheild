import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Safe dynamic fallback secrets generated with crypto if not provided in environment
const fallbackJwtSecret = crypto.randomBytes(32).toString('hex');
const fallbackRefreshSecret = crypto.randomBytes(32).toString('hex');

if (isProduction && !process.env.JWT_SECRET) {
  console.warn('[Security][WARNING] JWT_SECRET not provided in production environment. A secure runtime key was generated.');
}

const parseAllowedOrigins = () => {
  const configured = process.env.CLIENT_URL;
  const origins = [];

  if (configured) {
    configured.split(',').forEach(url => {
      const trimmed = url.trim().replace(/\/$/, '');
      if (trimmed) origins.push(trimmed);
    });
  }

  // Always strictly authorize production Vercel frontend
  origins.push('https://arc-sheild.vercel.app');

  if (!isProduction) {
    origins.push('http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173');
  }

  return [...new Set(origins)];
};

export const SECURITY_CONFIG = {
  // Environment Flag
  IS_PRODUCTION: isProduction,

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || fallbackJwtSecret,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || fallbackRefreshSecret,
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || '1h',
  REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || '7d',

  // Password Hashing
  BCRYPT_SALT_ROUNDS: 12,

  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',

  // CORS Allowed Origins
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  ALLOWED_ORIGINS: parseAllowedOrigins(),

  // Rate Limiting Defaults
  AUTH_RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),            // 10 attempts per 15 min
  API_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,                                              // 15 minutes
  API_RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),       // 100 requests per 15 min
  SENSOR_RATE_LIMIT_MAX: 120,                                                            // 120 packets per min
  REPORT_RATE_LIMIT_MAX: 20,                                                             // 20 requests per 15 min

  // Brute Force Lockout
  MAX_FAILED_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_SECONDS: 15 * 60, // 15 minutes lock
};

export default SECURITY_CONFIG;
