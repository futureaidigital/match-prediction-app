import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api, Fixture, ApiResponse, Commentary, Weather, FixtureStatistics, FixturesResponse } from '@/services/api';
import { queryKeys } from '@/lib/queryClient';
import { CACHE_DURATIONS } from '@/config/cache';

export interface UseFixturesParams {
  fixture_ids?: number[];  // Specific fixture IDs to fetch
  leagues?: number[];      // Filter by league IDs
  match_type?: 'live' | 'upcoming' | 'finished';  // Match type filter
  sort_by?: 'kickoff_asc' | 'kickoff_desc' | 'prediction_accuracy_asc' | 'prediction_accuracy_desc';
  date_from?: string;      // Start date (ISO format: YYYY-MM-DD)
  date_to?: string;        // End date (ISO format: YYYY-MM-DD)
}

export function useFixtures(
  params?: UseFixturesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<FixturesResponse>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.fixtures.list(params as Record<string, unknown> | undefined),
    queryFn: () => api.getFixtures(params),
    refetchInterval: params?.match_type === 'live' ? CACHE_DURATIONS.LIVE_MATCH : false,
    staleTime: params?.match_type === 'live' ? CACHE_DURATIONS.LIVE_MATCH : CACHE_DURATIONS.FIXTURES,
    ...options,
  });
}

export function useFixture(
  fixtureId: string,
  options?: Omit<
    UseQueryOptions<ApiResponse<Fixture>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.fixtures.detail(fixtureId),
    queryFn: () => api.getFixtureById(fixtureId),
    enabled: !!fixtureId,
    ...options,
  });
}

export function useFixtureCommentary(
  fixtureId: string,
  options?: Omit<
    UseQueryOptions<ApiResponse<Commentary[]>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.fixtures.commentary(fixtureId),
    queryFn: () => api.getFixtureCommentary(fixtureId),
    enabled: !!fixtureId,
    ...options,
  });
}

export function useFixtureWeather(
  fixtureId: string,
  options?: Omit<
    UseQueryOptions<ApiResponse<Weather>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.fixtures.weather(fixtureId),
    queryFn: () => api.getFixtureWeather(fixtureId),
    enabled: !!fixtureId,
    staleTime: CACHE_DURATIONS.WEATHER,
    ...options,
  });
}

export function useFixtureStatistics(
  fixtureId: string,
  options?: Omit<
    UseQueryOptions<ApiResponse<FixtureStatistics>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.fixtures.statistics(fixtureId),
    queryFn: () => api.getFixtureStatistics(fixtureId),
    enabled: !!fixtureId,
    refetchInterval: CACHE_DURATIONS.LIVE_STATS,
    ...options,
  });
}