import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api, ApiResponse, LeaguesResponse, LeaguePlayerRankingsResponse } from '@/services/api';
import { queryKeys } from '@/lib/queryClient';
import { CACHE_DURATIONS } from '@/config/cache';

export function useLeagues(
  options?: Omit<
    UseQueryOptions<ApiResponse<LeaguesResponse>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.leagues.all(),
    queryFn: () => api.getLeagues(),
    staleTime: CACHE_DURATIONS.LEAGUES,
    ...options,
  });
}

// League info including name and image
interface LeagueInfo {
  name: string;
  image_path?: string;
}

// Helper hook to get a map of league_id -> league info (name + image)
export function useLeagueNames() {
  const { data, ...rest } = useLeagues();

  const leagueMap = new Map<number, LeagueInfo>();

  if (data?.data?.leagues) {
    data.data.leagues.forEach((league) => {
      leagueMap.set(league.league_id, {
        name: league.league_name,
        image_path: league.image_path,
      });
    });
  }

  return {
    leagueMap,
    getLeagueName: (leagueId: number) => leagueMap.get(leagueId)?.name || `League ${leagueId}`,
    getLeagueImage: (leagueId: number) => leagueMap.get(leagueId)?.image_path,
    getLeagueInfo: (leagueId: number) => leagueMap.get(leagueId),
    ...rest,
  };
}

// Hook to fetch player rankings for a league/season
export function useLeaguePlayerRankings(
  params: { league_id: number; season_id: number } | null,
  options?: Omit<
    UseQueryOptions<ApiResponse<LeaguePlayerRankingsResponse>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.leagues.playerRankings(params?.league_id ?? 0, params?.season_id ?? 0),
    queryFn: () => api.getLeaguePlayerRankings({
      league_id: params!.league_id,
      season_id: params!.season_id,
    }),
    enabled: !!params?.league_id && !!params?.season_id,
    staleTime: CACHE_DURATIONS.LEAGUES,
    ...options,
  });
}
