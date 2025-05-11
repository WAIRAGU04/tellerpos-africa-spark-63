
/**
 * Offline caching service for the application
 * Handles caching and retrieving data for offline use
 */

// Generic function to cache data in localStorage
export const cacheData = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(`${key}_timestamp`, new Date().toISOString());
  } catch (error) {
    console.error(`Error caching data for ${key}:`, error);
  }
};

// Generic function to retrieve cached data
export const getCachedData = <T,>(key: string): { data: T | null; timestamp: string | null } => {
  try {
    const data = localStorage.getItem(key);
    const timestamp = localStorage.getItem(`${key}_timestamp`);
    return {
      data: data ? JSON.parse(data) : null,
      timestamp
    };
  } catch (error) {
    console.error(`Error retrieving cached data for ${key}:`, error);
    return { data: null, timestamp: null };
  }
};

// Function to check if cached data is stale (older than specified minutes)
export const isCachedDataStale = (timestamp: string | null, maxAgeMinutes: number = 60): boolean => {
  if (!timestamp) return true;
  
  const cachedTime = new Date(timestamp).getTime();
  const currentTime = new Date().getTime();
  const maxAgeMs = maxAgeMinutes * 60 * 1000;
  
  return currentTime - cachedTime > maxAgeMs;
};

// Standard cache keys
export const CACHE_KEYS = {
  ACCOUNTS: 'cached_accounts',
  TRANSACTIONS: 'cached_transactions',
  INVENTORY: 'cached_inventory',
  ACTIVE_SHIFT: 'cached_active_shift',
  SHIFT_HISTORY: 'cached_shift_history',
  SALES: 'cached_sales'
};
