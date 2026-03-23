import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api, NewsResponse, ApiResponse } from '@/services/api';
import { queryKeys } from '@/lib/queryClient';

export function useNewsByLeague(
  leagueId: number,
  limit = 5,
  options?: Omit<UseQueryOptions<ApiResponse<NewsResponse>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.news.byLeague(leagueId, limit),
    queryFn: () => api.getNewsByLeague(leagueId, limit),
    staleTime: 5 * 60 * 1000,
    enabled: leagueId > 0,
    ...options,
  });
}
