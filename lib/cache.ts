import { Redis } from "@upstash/redis";
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from "./types";

// Initialize Redis client if credentials are provided
const redis = UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Fallback in-memory cache for local development or if Redis is not configured
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};
const memoryCache = new Map<string, CacheEntry<any>>();
const inFlight = new Map<string, Promise<any>>();

const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Generic caching function that supports both Upstash Redis (persistent)
 * and an in-memory fallback.
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 1800 // Default 30 minutes in seconds for Redis
): Promise<T> {
  // 1. Try Redis first if available
  if (redis) {
    try {
      const cached = await redis.get<T>(key);
      if (cached) {
        console.log(`[Redis Cache] Hit: ${key}`);
        return cached;
      }
    } catch (error) {
      console.error(`[Redis Cache] Error reading key ${key}:`, error);
      // Fall through to in-memory/fetcher if Redis fails
    }
  } else {
    // 2. Fallback to In-Memory Cache
    const cached = memoryCache.get(key);
    const now = Date.now();
    const ttlMs = ttlSeconds * 1000;

    if (cached && now - cached.timestamp < ttlMs) {
      console.log(`[Memory Cache] Hit: ${key}`);
      return cached.data;
    }
  }

  // 3. Handle In-Flight requests (prevent cache stampede)
  if (inFlight.has(key)) {
    console.log(`[Cache] In-flight: ${key}. Waiting for existing request...`);
    return inFlight.get(key);
  }

  // 4. Fetch new data
  console.log(`[Cache] Miss: ${key}. Fetching new data...`);
  
  const promise = (async () => {
    try {
      const data = await fetcher();
      
      // Save to Redis if available
      if (redis) {
        await redis.set(key, data, { ex: ttlSeconds });
        console.log(`[Redis Cache] Saved: ${key} (TTL: ${ttlSeconds}s)`);
      } else {
        // Save to Memory
        memoryCache.set(key, { data, timestamp: Date.now() });
        console.log(`[Memory Cache] Saved: ${key}`);
      }
      
      return data;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

/**
 * Force clear a cache key
 */
export async function invalidateCache(key: string) {
  if (redis) {
    await redis.del(key);
  }
  memoryCache.delete(key);
}
