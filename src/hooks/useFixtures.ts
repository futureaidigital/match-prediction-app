import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api, Fixture, ApiResponse, Commentary, Weather, FixtureStatistics, FixturesResponse } from '@/services/api';
import { queryKeys } from '@/lib/queryClient';

export function useFixtures(
  params?: {
    date?: string;
    league_id?: number;
    team_id?: number;
    live_only?: boolean;
    carousel_only?: boolean;
    with_predictions?: boolean;
    page?: number;
    limit?: number;
  },
  options?: Omit<
    UseQueryOptions<ApiResponse<FixturesResponse>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.fixtures.list(params),
    queryFn: () => api.getFixtures(params),
    refetchInterval: params?.live_only ? 30 * 1000 : false,
    staleTime: params?.live_only ? 30 * 1000 : 5 * 60 * 1000,
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
    staleTime: 60 * 60 * 1000, // Weather data cached for 1 hour
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
    refetchInterval: 60 * 1000, // Refetch stats every minute for live matches
    ...options,
  });
}