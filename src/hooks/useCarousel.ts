import { useState, useEffect, useMemo } from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api, CarouselResponse, ApiResponse, FixtureWithPredictions } from '@/services/api';
import { queryKeys } from '@/lib/queryClient';
import { useFixtures } from './useFixtures';

export function useCurrentCarousel(
  options?: Omit<UseQueryOptions<ApiResponse<CarouselResponse>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.carousel.current,
    queryFn: () => api.getCurrentCarousel(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Persist last successful carousel fallback offset
let _carouselLastGoodOffset = 0;

/**
 * Fetches carousel data, falling back to latest day's fixtures if carousel is empty.
 * Tries today, then goes back up to 7 days to find fixtures.
 */
export function useCarouselWithFallback() {
  const { data: carouselResponse, isLoading: isLoadingCarousel, error: carouselError } = useCurrentCarousel();
  const [dayOffset, setDayOffset] = useState(_carouselLastGoodOffset);

  const carouselFixtures = carouselResponse?.data?.fixtures ?? [];
  const hasCarouselData = carouselFixtures.length > 0;

  // Compute fallback date
  const fallbackDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [dayOffset]);

  // Fetch fallback fixtures when carousel is empty or errored (e.g. logged out)
  const needsFallback = !isLoadingCarousel && !hasCarouselData;
  const { data: fallbackResponse, isLoading: isLoadingFallback, error: fallbackError } = useFixtures(
    { date_from: fallbackDate, date_to: fallbackDate },
    { enabled: needsFallback }
  );

  const fallbackFixtures = fallbackResponse?.data?.fixtures ?? [];

  // If fallback returned a successful but empty response, try previous day (up to 7 days back)
  // Don't fallback on errors (e.g. 401 when logged out)
  useEffect(() => {
    if (isLoadingCarousel || hasCarouselData || isLoadingFallback || fallbackError) return;
    if (!fallbackResponse?.data) return;
    if (fallbackFixtures.length > 0) {
      _carouselLastGoodOffset = dayOffset;
    } else if (dayOffset < 7) {
      setDayOffset(prev => prev + 1);
    }
  }, [fallbackFixtures, isLoadingCarousel, hasCarouselData, isLoadingFallback, dayOffset, fallbackError, fallbackResponse]);

  const fixtures: FixtureWithPredictions[] = hasCarouselData ? carouselFixtures : fallbackFixtures;
  const isLoading = isLoadingCarousel || (needsFallback && isLoadingFallback);

  return { fixtures, isLoading, isCarousel: hasCarouselData, error: carouselError || fallbackError };
}
