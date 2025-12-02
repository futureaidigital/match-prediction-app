import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api, Prediction, SmartCombo, ComboAccuracy, SmartComboPredictionList, ApiResponse } from '@/services/api';
import { queryKeys } from '@/lib/queryClient';

export function useFixturePredictions(
  params: {
    fixture_id?: number;
    prediction_type?: string;
    page?: number;
    limit?: number;
  },
  options?: Omit<
    UseQueryOptions<ApiResponse<Prediction[]>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.predictions.fixture(params),
    queryFn: () => api.getFixturePredictions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    ...options,
  });
}

export function usePlayerPredictions(
  params: {
    player_id?: number;
    fixture_id?: number;
    prediction_type?: string;
    page?: number;
    limit?: number;
  },
  options?: Omit<
    UseQueryOptions<ApiResponse<Prediction[]>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.predictions.player(params),
    queryFn: () => api.getPlayerPredictions(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useSmartCombos(
  params: {
    week?: number;
    year?: number;
    page?: number;
    limit?: number;
  } = {},
  options?: Omit<
    UseQueryOptions<ApiResponse<SmartCombo[]>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.predictions.smartCombos(params),
    queryFn: () => api.getSmartCombos(params),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    ...options,
  });
}

export function useSmartComboAccuracy(
  params: {
    combo_id?: string;
    year?: number;
    week?: number;
  },
  options?: Omit<
    UseQueryOptions<ApiResponse<ComboAccuracy[]>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.predictions.comboAccuracy(params),
    queryFn: () => api.getSmartComboAccuracy(params),
    staleTime: 60 * 60 * 1000, // 1 hour cache
    ...options,
  });
}

export function useSmartComboPredictions(
  params: {
    combo_id?: number;
    fixture_id?: number;
    sort_by?: 'pct_change' | 'prediction_pre_game' | 'prediction' | 'created_at';
    sort_order?: 'asc' | 'desc';
    limit?: number;
  } = {},
  options?: Omit<
    UseQueryOptions<ApiResponse<SmartComboPredictionList>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.predictions.smartComboPredictions(params),
    queryFn: () => api.getSmartComboPredictions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes for live updates
    ...options,
  });
}