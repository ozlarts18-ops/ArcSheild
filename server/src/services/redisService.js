import { getRedisClient } from '../config/redis.js';
import { SECURITY_CONFIG } from '../config/security.js';

export const redisService = {
  /**
   * Track failed login attempts by normalized key (IP + email)
   */
  async recordFailedLogin(ip, email) {
    const client = getRedisClient();
    const key = `bf:login:${ip}:${email.toLowerCase().trim()}`;
    const attempts = await client.incr(key);

    if (attempts === 1) {
      await client.expire(key, SECURITY_CONFIG.LOCKOUT_DURATION_SECONDS);
    }
    return attempts;
  },

  /**
   * Check if an IP/account is currently throttled or locked out
   */
  async checkBruteForceLockout(ip, email) {
    const client = getRedisClient();
    const key = `bf:login:${ip}:${email.toLowerCase().trim()}`;
    const attemptsStr = await client.get(key);
    const attempts = parseInt(attemptsStr || '0', 10);

    if (attempts >= SECURITY_CONFIG.MAX_FAILED_LOGIN_ATTEMPTS) {
      return {
        locked: true,
        attempts,
        message: 'Too many authentication attempts. Please try again later.'
      };
    }

    // Progressive delay for 3+ failed attempts
    const delayMs = attempts >= 3 ? Math.min((attempts - 2) * 1000, 4000) : 0;
    return {
      locked: false,
      attempts,
      delayMs
    };
  },

  /**
   * Clear failed attempts upon successful login
   */
  async clearFailedLogin(ip, email) {
    const client = getRedisClient();
    const key = `bf:login:${ip}:${email.toLowerCase().trim()}`;
    await client.del(key);
  },

  /**
   * Invalidate a token on logout
   */
  async blacklistToken(token, expiresInSeconds = 3600) {
    const client = getRedisClient();
    const key = `bl:token:${token}`;
    await client.set(key, '1', 'EX', expiresInSeconds);
  },

  /**
   * Check if token is in blacklist
   */
  async isTokenBlacklisted(token) {
    const client = getRedisClient();
    const key = `bl:token:${token}`;
    const result = await client.get(key);
    return Boolean(result);
  },

  /**
   * General cache get
   */
  async getCache(key) {
    const client = getRedisClient();
    const data = await client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  },

  /**
   * General cache set
   */
  async setCache(key, value, ttlSeconds = 60) {
    const client = getRedisClient();
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    await client.set(key, serialized, 'EX', ttlSeconds);
  }
};

export default redisService;
