import Redis from 'ioredis';
import { logger } from './logger.js';
import { cacheHits, cacheMisses } from './metrics.js';

let redisClient = null;
const memoryStore = new Map();
const memoryTTL = new Map();

const cleanMemoryStore = () => {
  const now = Date.now();
  for (const [key, expiry] of memoryTTL.entries()) {
    if (expiry < now) {
      memoryStore.delete(key);
      memoryTTL.delete(key);
    }
  }
};
setInterval(cleanMemoryStore, 30000);

try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) return null;
        return Math.min(times * 200, 3000);
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => logger.warn(`Redis error: ${err.message} - using in-memory fallback`));
  }
} catch (e) {
  logger.warn(`Redis init skipped: ${e.message}`);
}

const isReady = () => redisClient && redisClient.status === 'ready';

export const cache = {
  async get(key) {
    try {
      if (isReady()) {
        const val = await redisClient.get(key);
        if (val !== null) { cacheHits.inc({ cache_key: key.split(':')[0] }); return val; }
        cacheMisses.inc({ cache_key: key.split(':')[0] });
        return null;
      }
    } catch (e) { logger.warn(`Redis GET failed: ${e.message}`); }

    const now = Date.now();
    if (memoryTTL.has(key) && memoryTTL.get(key) < now) {
      memoryStore.delete(key); memoryTTL.delete(key);
    }
    const val = memoryStore.get(key) || null;
    if (val) cacheHits.inc({ cache_key: key.split(':')[0] });
    else cacheMisses.inc({ cache_key: key.split(':')[0] });
    return val;
  },

  async set(key, value, ttlSeconds = 0) {
    try {
      if (isReady()) {
        return ttlSeconds > 0
          ? await redisClient.set(key, value, 'EX', ttlSeconds)
          : await redisClient.set(key, value);
      }
    } catch (e) { logger.warn(`Redis SET failed: ${e.message}`); }

    memoryStore.set(key, value);
    if (ttlSeconds > 0) memoryTTL.set(key, Date.now() + ttlSeconds * 1000);
  },

  async del(...keys) {
    try {
      if (isReady()) return await redisClient.del(...keys);
    } catch (e) { logger.warn(`Redis DEL failed: ${e.message}`); }
    keys.forEach(k => { memoryStore.delete(k); memoryTTL.delete(k); });
  },

  async invalidatePattern(pattern) {
    try {
      if (isReady()) {
        const keys = await redisClient.keys(pattern);
        if (keys.length) await redisClient.del(...keys);
        return;
      }
    } catch (e) { logger.warn(`Redis SCAN failed: ${e.message}`); }
    for (const k of memoryStore.keys()) {
      if (k.startsWith(pattern.replace('*', ''))) {
        memoryStore.delete(k); memoryTTL.delete(k);
      }
    }
  },
};

export { redisClient };
