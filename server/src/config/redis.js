import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

let redisClient = null;
let isRedisConnected = false;

// Fallback in-memory store for local environments without Redis
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
    console.log('[Redis] Notice: REDIS_URL not specified. Using resilient in-memory state engine.');
    return fallbackStore;
  }

  try {
    const isTls = redisUrl.startsWith('rediss://');
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('[Redis] Max reconnection attempts reached. Switching to in-memory fallback.');
          return null; // Stop retrying
        }
        return Math.min(times * 1000, 3000);
      },
      tls: isTls ? { rejectUnauthorized: false } : undefined,
      lazyConnect: true
    });

    redisClient.connect().then(() => {
      isRedisConnected = true;
      console.log('[Redis] Connected securely to Redis distributed state store.');
    }).catch(err => {
      isRedisConnected = false;
      console.warn(`[Redis] Connection failed (${err.message}). Using in-memory fallback.`);
    });

    redisClient.on('error', (err) => {
      if (isRedisConnected) {
        console.warn(`[Redis] Runtime warning: ${err.message}`);
      }
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
    });

    return redisClient;
  } catch (error) {
    console.warn(`[Redis] Init error (${error.message}). Using in-memory fallback.`);
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
  return {
    connected: isRedisConnected,
    mode: isRedisConnected ? 'Distributed Redis' : 'In-Memory Resilient Engine'
  };
};

export default getRedisClient;
