import { QueryClient } from '@tanstack/react-query';
import { CACHE_DURATIONS, RETRY_CONFIG } from '@/config/cache';

/**
 * React Query configuration
 *
 * Default options for all queries and mutations.
 * Uses centralized cache configuration from config/cache.ts
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: CACHE_DURATIONS.DEFAULT_STALE,

      // Keep unused data in cache for 10 minutes
      gcTime: CACHE_DURATIONS.DEFAULT_GC,

      // Retry failed requests with exponential backoff
      retry: RETRY_CONFIG.MAX_RETRIES,
      retryDelay: (attemptIndex) =>
        Math.min(
          RETRY_CONFIG.RETRY_DELAY_BASE * 2 ** attemptIndex,
          RETRY_CONFIG.RETRY_DELAY_MAX
        ),

      // Refetch on window focus for real-time data
      refetchOnWindowFocus: true,

      // Don't refetch on mount if data is fresh
      refetchOnMount: true,

      // Don't refetch on reconnect by default (we'll enable for specific queries)
      refetchOnReconnect: false,

      // Throw errors to error boundaries
      throwOnError: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,

      // Throw mutation errors to error boundaries
      throwOnError: false,
    },
  },
});

/**
 * Query keys factory for consistent cache key generation
 *
 * Centralized query keys prevent typos and make invalidation easier
 */
export const queryKeys = {
  // Auth keys
  auth: {
    user: ['auth', 'user'] as const,
    subscription: ['auth', 'subscription'] as const,
  },

  // Fixtures keys
  fixtures: {
    all: ['fixtures'] as const,
    list: (params?: Record<string, unknown>) =>
      ['fixtures', 'list', params] as const,
    detail: (id: string) =>
      ['fixtures', 'detail', id] as const,
    commentary: (id: string) =>
      ['fixtures', id, 'commentary'] as const,
    weather: (id: string) =>
      ['fixtures', id, 'weather'] as const,
    statistics: (id: string) =>
      ['fixtures', id, 'statistics'] as const,
  },

  // Predictions keys
  predictions: {
    all: ['predictions'] as const,
    fixture: (params?: Record<string, unknown>) =>
      ['predictions', 'fixture', params] as const,
    player: (params?: Record<string, unknown>) =>
      ['predictions', 'player', params] as const,
    smartCombos: (params?: Record<string, unknown>) =>
      ['predictions', 'smart-combos', params] as const,
    smartComboPredictions: (params?: Record<string, unknown>) =>
      ['predictions', 'smart-combo-predictions', params] as const,
    comboAccuracy: (params?: Record<string, unknown>) =>
      ['predictions', 'combo-accuracy', params] as const,
  },

  // Payments keys
  payments: {
    pricing: ['payments', 'pricing'] as const,
  },

  // Players keys
  players: {
    all: ['players'] as const,
    list: (params?: Record<string, unknown>) =>
      ['players', 'list', params] as const,
    detail: (params?: Record<string, unknown>) =>
      ['players', 'detail', params] as const,
    watchlist: (params?: Record<string, unknown>) =>
      ['players', 'watchlist', params] as const,
    statistics: (params?: Record<string, unknown>) =>
      ['players', 'statistics', params] as const,
  },
} as const;
