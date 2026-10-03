import Redis from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

let activeClient = null;
let redisType = 'none'; // 'local' | 'upstash' | 'in-memory'
let isRedisConnected = false;
let redisErrorMessage = null;

const isProduction = process.env.NODE_ENV === 'production';

// ==========================================
// 1. In-Memory Resilient Fallback Engine
// ==========================================
export class InMemoryFallbackStore {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
  }

  async get(key) {
    this._cleanup(key);
    return this.store.has(key) ? this.store.get(key) : null;
  }

  async set(key, value, ...args) {
    this.store.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    if (args.length >= 2 && (args[0] === 'EX' || args[0] === 'ex') && typeof args[1] === 'number') {
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

  async ttl(key) {
    if (!this.store.has(key)) return -2;
    if (!this.ttls.has(key)) return -1;
    const remaining = Math.ceil((this.ttls.get(key) - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  async exists(key) {
    this._cleanup(key);
    return this.store.has(key) ? 1 : 0;
  }

  async ping() {
    return 'PONG';
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

// ==========================================
// 2. Upstash Cloud Redis Adapter
// ==========================================
export class UpstashRedisAdapter {
  constructor(upstashClient) {
    this.client = upstashClient;
  }

  async get(key) {
    try {
      const val = await this.client.get(key);
      if (val === null || val === undefined) return null;
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    } catch (err) {
      console.warn(`[Redis Upstash] Get error: ${err.message}`);
      return fallbackStore.get(key);
    }
  }

  async set(key, value, ...args) {
    try {
      let options = {};
      if (args.length >= 2 && (args[0] === 'EX' || args[0] === 'ex') && typeof args[1] === 'number') {
        options = { ex: args[1] };
      } else if (args[0] && typeof args[0] === 'object') {
        options = args[0];
      }
      return await this.client.set(key, value, options);
    } catch (err) {
      console.warn(`[Redis Upstash] Set error: ${err.message}`);
      return fallbackStore.set(key, value, ...args);
    }
  }

  async del(key) {
    try {
      return await this.client.del(key);
    } catch (err) {
      console.warn(`[Redis Upstash] Del error: ${err.message}`);
      return fallbackStore.del(key);
    }
  }

  async incr(key) {
    try {
      return await this.client.incr(key);
    } catch (err) {
      console.warn(`[Redis Upstash] Incr error: ${err.message}`);
      return fallbackStore.incr(key);
    }
  }

  async expire(key, seconds) {
    try {
      return await this.client.expire(key, seconds);
    } catch (err) {
      console.warn(`[Redis Upstash] Expire error: ${err.message}`);
      return fallbackStore.expire(key, seconds);
    }
  }

  async ttl(key) {
    try {
      return await this.client.ttl(key);
    } catch (err) {
      console.warn(`[Redis Upstash] TTL error: ${err.message}`);
      return fallbackStore.ttl(key);
    }
  }

  async exists(key) {
    try {
      return await this.client.exists(key);
    } catch (err) {
      console.warn(`[Redis Upstash] Exists error: ${err.message}`);
      return fallbackStore.exists(key);
    }
  }

  async ping() {
    try {
      return await this.client.ping();
    } catch (err) {
      console.warn(`[Redis Upstash] Ping error: ${err.message}`);
      return 'PONG';
    }
  }
}

// ==========================================
// 3. Redis Initialization & Selection
// ==========================================
// ==========================================
// 3. Redis Initialization & Selection
// ==========================================
export const initRedis = async () => {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  const localRedisUrl = process.env.REDIS_URL?.trim();

  // Mode Selection:
  // In production, prioritize Upstash Cloud Redis if configured.
  // In development, prioritize Local Redis (REDIS_URL) if configured.
  const hasUpstashConfig = Boolean(upstashUrl && upstashToken);
  const hasLocalConfig = Boolean(localRedisUrl);

  const tryUpstash = async () => {
    if (!hasUpstashConfig) return false;
    try {
      const upstashInstance = new UpstashRedis({
        url: upstashUrl,
        token: upstashToken
      });

      // Test connectivity
      await upstashInstance.ping();

      activeClient = new UpstashRedisAdapter(upstashInstance);
      redisType = 'upstash';
      isRedisConnected = true;
      redisErrorMessage = null;
      console.log('[Redis] Using Upstash Redis');
      return true;
    } catch (err) {
      isRedisConnected = false;
      redisErrorMessage = err.message;
      console.warn(`[Redis] Upstash connection check failed: ${err.message}`);
      return false;
    }
  };

  const tryLocal = async () => {
    if (!hasLocalConfig) return false;
    try {
      const isTls = localRedisUrl.startsWith('rediss://');
      const ioredisClient = new Redis(localRedisUrl, {
        maxRetriesPerRequest: 2,
        retryStrategy(times) {
          if (times > 2) {
            redisErrorMessage = 'Max local Redis reconnection attempts reached.';
            return null;
          }
          return Math.min(times * 1000, 2000);
        },
        tls: isTls ? { rejectUnauthorized: false } : undefined,
        lazyConnect: true,
        connectTimeout: 3000
      });

      let connected = false;
      await ioredisClient.connect().then(() => {
        activeClient = ioredisClient;
        redisType = 'local';
        isRedisConnected = true;
        redisErrorMessage = null;
        connected = true;
        console.log('[Redis] Local Redis connected');
      }).catch(err => {
        isRedisConnected = false;
        redisErrorMessage = err.message;
        if (isProduction) {
          console.error(`[Redis][CRITICAL] Production local Redis connection failed: ${err.message}`);
        } else {
          console.log('[Redis] Notice: Local Redis not reachable. Using in-memory fallback.');
        }
      });

      ioredisClient.on('error', (err) => {
        redisErrorMessage = err.message;
        if (isRedisConnected) {
          console.warn(`[Redis] Local Redis runtime error: ${err.message}`);
        }
        isRedisConnected = false;
      });

      ioredisClient.on('connect', () => {
        isRedisConnected = true;
        redisErrorMessage = null;
      });

      return connected;
    } catch (error) {
      redisErrorMessage = error.message;
      console.warn(`[Redis] Local Redis initialization error: ${error.message}`);
      return false;
    }
  };

  if (isProduction) {
    // Cloud / Production: Try Upstash first, then fallback to Local Redis URL
    if (await tryUpstash()) return activeClient;
    if (await tryLocal()) return activeClient;
  } else {
    // Local Development: Try Local Redis first, then fallback to Upstash if provided
    if (await tryLocal()) return activeClient;
    if (await tryUpstash()) return activeClient;
  }

  // Fallback: In-Memory Engine
  activeClient = fallbackStore;
  redisType = 'in-memory';
  isRedisConnected = false;

  if (isProduction) {
    redisErrorMessage = 'Neither UPSTASH_REDIS_REST_URL nor REDIS_URL could connect in production.';
    console.error(`[Redis][CRITICAL] ${redisErrorMessage}`);
  } else {
    console.log('[Redis] Notice: Using development in-memory state engine.');
  }

  return fallbackStore;
};

export const getRedisClient = () => {
  if (activeClient) {
    return activeClient;
  }
  return fallbackStore;
};

export const getRedisStatus = () => {
  if (isRedisConnected) {
    return {
      connected: true,
      mode: redisType === 'upstash' ? 'Upstash Cloud Redis (Active)' : 'Local Redis (Active)',
      type: redisType
    };
  }

  if (isProduction) {
    return {
      connected: false,
      mode: `Unavailable (${redisErrorMessage || 'Redis not configured'})`,
      type: 'error'
    };
  }

  return {
    connected: false,
    mode: 'Development In-Memory State Engine',
    type: 'in-memory'
  };
};

export default getRedisClient;
