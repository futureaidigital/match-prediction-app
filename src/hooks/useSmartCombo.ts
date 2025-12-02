import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api, SmartComboCurrentResponse, ApiResponse } from '@/services/api';
import { queryKeys } from '@/lib/queryClient';

export function useCurrentSmartCombo(
  options?: Omit<
    UseQueryOptions<ApiResponse<SmartComboCurrentResponse>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.predictions.smartCombos({ current: true }),
    queryFn: () => api.getCurrentSmartCombo(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    ...options,
  });
}