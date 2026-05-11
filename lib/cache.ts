type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<any>>();
const inFlight = new Map<string, Promise<any>>();
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

  // Check if there's already a request in flight for this key
  if (inFlight.has(key)) {
    console.log(`[Cache] In-flight: ${key}. Waiting for existing request...`);
    return inFlight.get(key);
  }

  console.log(`[Cache] Miss: ${key}. Fetching new data...`);
  
  const promise = fetcher().then(data => {
    cache.set(key, { data, timestamp: Date.now() });
    inFlight.delete(key);
    return data;
  }).catch(error => {
    inFlight.delete(key);
    throw error;
  });

  inFlight.set(key, promise);
  return promise;
}
