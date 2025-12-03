import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api, SmartComboCurrentResponse, ApiResponse } from '@/services/api';
import { queryKeys } from '@/lib/queryClient';
import { CACHE_DURATIONS } from '@/config/cache';

export function useCurrentSmartCombo(
  options?: Omit<
    UseQueryOptions<ApiResponse<SmartComboCurrentResponse>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.predictions.smartCombos({ current: true }),
    queryFn: () => api.getCurrentSmartCombo(),
    staleTime: CACHE_DURATIONS.SMART_COMBO,
    refetchInterval: CACHE_DURATIONS.SMART_COMBO,
    ...options,
  });
}