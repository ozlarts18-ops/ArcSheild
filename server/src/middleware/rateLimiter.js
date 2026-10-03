import rateLimit from 'express-rate-limit';
import { SECURITY_CONFIG } from '../config/security.js';
import { getRedisClient } from '../config/redis.js';

/**
 * Redis-backed store for express-rate-limit compatible with ioredis, Upstash, and in-memory fallback.
 */
class RedisRateLimitStore {
  constructor(prefix = 'rl:api:') {
    this.prefix = prefix;
    this.windowMs = 60 * 1000;
  }

  init(options) {
    this.windowMs = options.windowMs || 60 * 1000;
  }

  async increment(key) {
    const client = getRedisClient();
    const redisKey = `${this.prefix}${key}`;
    const totalHits = await client.incr(redisKey);
    if (totalHits === 1) {
      const ttlSecs = Math.max(1, Math.ceil(this.windowMs / 1000));
      await client.expire(redisKey, ttlSecs);
    }
    const ttl = await client.ttl(redisKey);
    const resetTime = new Date(Date.now() + (ttl > 0 ? ttl * 1000 : this.windowMs));
    return {
      totalHits,
      resetTime
    };
  }

  async decrement(key) {
    // Optional decrement
  }

  async resetKey(key) {
    const client = getRedisClient();
    const redisKey = `${this.prefix}${key}`;
    await client.del(redisKey);
  }
}

// Authentication endpoints limiter (Login, Register)
export const authLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.AUTH_RATE_LIMIT_WINDOW_MS,
  max: SECURITY_CONFIG.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisRateLimitStore('rl:auth:'),
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
  store: new RedisRateLimitStore('rl:api:'),
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
  store: new RedisRateLimitStore('rl:telemetry:'),
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
  store: new RedisRateLimitStore('rl:reports:'),
  message: {
    success: false,
    message: 'Report generation rate limit reached. Please wait before generating another report.'
  }
});
