/** React Query cache timing constants (in milliseconds). */
export const CACHE_CONFIG = {
  /** Data stays fresh before a background refetch is triggered. */
  STALE_TIME: 1000 * 60 * 5,   // 5 min
  /** Inactive cache entries are garbage-collected after this time. */
  GC_TIME: 1000 * 60 * 10,     // 10 min
} as const;
