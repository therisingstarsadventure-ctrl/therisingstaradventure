import { cache } from '../utils/redis.js';
import { logger } from '../utils/logger.js';

/**
 * Cache middleware factory.
 * @param {string} keyFn - Function (req) => cacheKey, or a static string
 * @param {number} ttl - TTL in seconds
 */
export const cacheMiddleware = (keyFn, ttl = 60) => async (req, res, next) => {
  const key = typeof keyFn === 'function' ? keyFn(req) : keyFn;

  try {
    const cached = await cache.get(key);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }
    res.setHeader('X-Cache', 'MISS');
  } catch (err) {
    logger.warn(`Cache read error for key ${key}: ${err.message}`);
  }

  // Monkey-patch res.json to capture and cache the response
  const originalJson = res.json.bind(res);
  res.json = async (data) => {
    try {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await cache.set(key, JSON.stringify(data), ttl);
      }
    } catch (err) {
      logger.warn(`Cache write error for key ${key}: ${err.message}`);
    }
    return originalJson(data);
  };

  next();
};

/**
 * Invalidate one or more cache keys.
 */
export const invalidateCache = async (...keys) => {
  for (const key of keys) {
    if (key.includes('*')) {
      await cache.invalidatePattern(key);
    } else {
      await cache.del(key);
    }
  }
};
