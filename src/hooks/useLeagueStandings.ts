import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api, ApiResponse, LeagueCurrentResponse, LeagueStandingsResponse, LeagueFixturesResponse } from '@/services/api';
import { CACHE_DURATIONS } from '@/config/cache';

// Hook to get current league data (initial page load)
export function useLeagueCurrent(
  league_id: number | null,
  options?: Omit<
    UseQueryOptions<ApiResponse<LeagueCurrentResponse>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['league-current', league_id],
    queryFn: () => api.getLeagueCurrent(league_id!),
    enabled: !!league_id,
    staleTime: CACHE_DURATIONS.FIXTURES,
    ...options,
  });
}

// Hook to get standings for a specific season (when user changes season)
export function useLeagueStandings(
  params: { league_id: number; season_id: number } | null,
  options?: Omit<
    UseQueryOptions<ApiResponse<LeagueStandingsResponse>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['league-standings', params?.league_id, params?.season_id],
    queryFn: () => api.getLeagueStandings(params!),
    enabled: !!params?.league_id && !!params?.season_id,
    staleTime: CACHE_DURATIONS.FIXTURES,
    ...options,
  });
}

// Hook to get fixtures for a league and season
export function useLeagueFixtures(
  params: { league_id: number; season_id: number } | null,
  options?: Omit<
    UseQueryOptions<ApiResponse<LeagueFixturesResponse>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['league-fixtures', params?.league_id, params?.season_id],
    queryFn: () => api.getLeagueFixtures(params!),
    enabled: !!params?.league_id && !!params?.season_id,
    staleTime: CACHE_DURATIONS.FIXTURES,
    ...options,
  });
}
