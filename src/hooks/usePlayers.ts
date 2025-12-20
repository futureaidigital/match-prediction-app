import { useQuery, useQueries, UseQueryOptions } from '@tanstack/react-query';
import {
  api,
  WatchlistResponse,
  PlayerStatisticsResponse,
  PlayersResponse,
  ApiResponse,
} from '@/services/api';
import { queryKeys } from '@/lib/queryClient';

// Fetch players by IDs (returns player details including image_path, display_name)
export function usePlayers(
  params: {
    player_id?: number | number[];
    limit?: number;
  } = {},
  options?: Omit<
    UseQueryOptions<ApiResponse<PlayersResponse>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.players.list(params),
    queryFn: () => api.getPlayers(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function usePlayersWatchlist(
  params: {
    year?: number;
    day?: number;
  } = {},
  options?: Omit<
    UseQueryOptions<ApiResponse<WatchlistResponse>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.players.watchlist(params),
    queryFn: () => api.getPlayersWatchlist(params),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    ...options,
  });
}

export function usePlayerStatistics(
  params: {
    player_id: number;
  },
  options?: Omit<
    UseQueryOptions<ApiResponse<PlayerStatisticsResponse>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.players.statistics(params),
    queryFn: () => api.getPlayerStatistics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    ...options,
  });
}

// Fetch statistics for multiple players
export function useMultiplePlayerStatistics(playerIds: number[]) {
  return useQueries({
    queries: playerIds.map((player_id) => ({
      queryKey: queryKeys.players.statistics({ player_id }),
      queryFn: () => api.getPlayerStatistics({ player_id }),
      staleTime: 5 * 60 * 1000,
      enabled: player_id > 0,
      retry: false, // Don't retry 404s - player stats may not exist
    })),
  });
}

// Fetch player details for multiple players using /players/player endpoint
export function useMultiplePlayerDetails(playerIds: number[]) {
  return useQueries({
    queries: playerIds.map((player_id) => ({
      queryKey: queryKeys.players.detail({ player_id }),
      queryFn: () => api.getPlayer({ player_id }),
      staleTime: 5 * 60 * 1000,
      enabled: player_id > 0,
      retry: false, // Don't retry 404s - player may not exist
    })),
  });
}
