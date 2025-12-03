/**
 * Cache Duration Configuration
 *
 * Centralized cache timing constants for React Query and data fetching.
 * All values are in milliseconds.
 */

export const CACHE_DURATIONS = {
  // Live match data - refresh frequently
  LIVE_MATCH: 30 * 1000, // 30 seconds

  // Match statistics during live games
  LIVE_STATS: 60 * 1000, // 1 minute

  // Predictions data
  PREDICTIONS: 2 * 60 * 1000, // 2 minutes

  // Fixture lists
  FIXTURES: 5 * 60 * 1000, // 5 minutes

  // Smart combo data
  SMART_COMBO: 5 * 60 * 1000, // 5 minutes

  // Weather data - rarely changes
  WEATHER: 60 * 60 * 1000, // 1 hour

  // Player data
  PLAYERS: 10 * 60 * 1000, // 10 minutes

  // Default stale time
  DEFAULT_STALE: 5 * 60 * 1000, // 5 minutes

  // Default garbage collection time
  DEFAULT_GC: 10 * 60 * 1000, // 10 minutes
} as const;

/**
 * API Timeout Configuration
 */
export const API_TIMEOUTS = {
  DEFAULT: 30 * 1000, // 30 seconds
  LONG_RUNNING: 60 * 1000, // 1 minute
} as const;

/**
 * Retry Configuration
 */
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000, // 1 second
  RETRY_DELAY_MAX: 30000, // 30 seconds
} as const;
