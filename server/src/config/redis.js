import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

let redisClient = null;
let isRedisConnected = false;
let redisErrorMessage = null;

const isProduction = process.env.NODE_ENV === 'production';

// Fallback in-memory store for local development environments without Redis
class InMemoryFallbackStore {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
  }

  async get(key) {
    this._cleanup(key);
    return this.store.has(key) ? this.store.get(key) : null;
  }

  async set(key, value, ...args) {
    this.store.set(key, String(value));
    if (args[0] === 'EX' && typeof args[1] === 'number') {
      this.ttls.set(key, Date.now() + args[1] * 1000);
    }
    return 'OK';
  }

  async del(key) {
    this.store.delete(key);
    this.ttls.delete(key);
    return 1;
  }

  async incr(key) {
    this._cleanup(key);
    const current = parseInt(this.store.get(key) || '0', 10);
    const next = current + 1;
    this.store.set(key, String(next));
    return next;
  }

  async expire(key, seconds) {
    if (this.store.has(key)) {
      this.ttls.set(key, Date.now() + seconds * 1000);
      return 1;
    }
    return 0;
  }

  _cleanup(key) {
    if (this.ttls.has(key)) {
      const expiresAt = this.ttls.get(key);
      if (Date.now() > expiresAt) {
        this.store.delete(key);
        this.ttls.delete(key);
      }
    }
  }
}

const fallbackStore = new InMemoryFallbackStore();

export const initRedis = () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    if (isProduction) {
      redisErrorMessage = 'REDIS_URL is not configured in production environment.';
      console.error(`[Redis][CRITICAL] ${redisErrorMessage}`);
      console.error('[Redis] Distributed rate limiting and multi-instance session blacklist require Redis in production.');
    } else {
      console.log('[Redis] Notice: REDIS_URL not specified in development. Using in-memory state engine.');
    }
    return fallbackStore;
  }

  try {
    const isTls = redisUrl.startsWith('rediss://');
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      retryStrategy(times) {
        if (times > 3) {
          redisErrorMessage = 'Max reconnection attempts reached.';
          console.warn(`[Redis] ${redisErrorMessage}`);
          return null; // Stop retrying
        }
        return Math.min(times * 1000, 3000);
      },
      tls: isTls ? { rejectUnauthorized: false } : undefined,
      lazyConnect: true
    });

    redisClient.connect().then(() => {
      isRedisConnected = true;
      redisErrorMessage = null;
      console.log('[Redis] Connected securely to Redis distributed state store.');
    }).catch(err => {
      isRedisConnected = false;
      redisErrorMessage = err.message;
      if (isProduction) {
        console.error(`[Redis][CRITICAL] Production connection failed (${err.message}).`);
      } else {
        console.warn(`[Redis] Connection failed (${err.message}). Using development in-memory fallback.`);
      }
    });

    redisClient.on('error', (err) => {
      redisErrorMessage = err.message;
      if (isRedisConnected) {
        console.warn(`[Redis] Runtime error: ${err.message}`);
      }
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      redisErrorMessage = null;
    });

    return redisClient;
  } catch (error) {
    redisErrorMessage = error.message;
    console.error(`[Redis] Init error (${error.message}).`);
    return fallbackStore;
  }
};

export const getRedisClient = () => {
  if (redisClient && isRedisConnected) {
    return redisClient;
  }
  return fallbackStore;
};

export const getRedisStatus = () => {
  if (isRedisConnected) {
    return {
      connected: true,
      mode: 'Distributed Redis (Active)'
    };
  }

  if (isProduction) {
    return {
      connected: false,
      mode: `Unavailable (${redisErrorMessage || 'REDIS_URL not configured'})`
    };
  }

  return {
    connected: false,
    mode: 'Development In-Memory State Engine'
  };
};

export default getRedisClient;
