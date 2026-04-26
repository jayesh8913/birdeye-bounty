type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<any>>();
const THIRTY_MINUTES = 30 * 60 * 1000;

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = THIRTY_MINUTES
): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < ttl) {
    console.log(`[Cache] Hit: ${key}`);
    return cached.data;
  }

  console.log(`[Cache] Miss: ${key}. Fetching new data...`);
  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  return data;
}
