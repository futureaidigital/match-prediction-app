import { useState, useEffect } from 'react';
import { useFixtures } from '@/hooks/useFixtures';
import { MatchBanner } from '@/components/MatchBanner';

export function LiveMatchBanner() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch carousel fixtures (is_carousel filter)
  const {
    data: fixturesResponse,
    isLoading: isLoadingFixtures,
    error: fixturesError,
  } = useFixtures({
    carousel_only: true,
    with_predictions: true,
    limit: 10,
  });

  const fixtures = fixturesResponse?.data?.fixtures || [];
  const fixtureData = fixtures[activeIndex];
  const fixture = fixtureData?.fixture;
  const predictions = fixtureData?.predictions || [];
  const hasMultipleFixtures = fixtures.length > 1;

  // Reset active index if it's out of bounds
  useEffect(() => {
    if (activeIndex >= fixtures.length && fixtures.length > 0) {
      setActiveIndex(0);
    }
  }, [fixtures.length, activeIndex]);

  // Auto-rotate fixtures every 10 seconds
  useEffect(() => {
    if (!hasMultipleFixtures) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % fixtures.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [hasMultipleFixtures, fixtures.length]);

  // Loading state
  if (isLoadingFixtures) {
    return (
      <div className="w-full rounded-xl overflow-hidden bg-gradient-to-b from-[#1a2a4a] to-[#0d1829] animate-pulse">
        <div className="px-8 py-8">
          <div className="h-4 bg-white/20 rounded w-48 mx-auto mb-4" />
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20" />
              <div className="h-6 bg-white/20 rounded w-16" />
            </div>
            <div className="h-12 bg-white/20 rounded w-24" />
            <div className="flex items-center gap-4">
              <div className="h-6 bg-white/20 rounded w-16" />
              <div className="w-16 h-16 rounded-full bg-white/20" />
            </div>
          </div>
        </div>
        <div className="h-16 bg-[#0d1829]" />
      </div>
    );
  }

  // Error or no data state
  if (fixturesError || !fixture) {
    return (
      <div className="w-full rounded-xl overflow-hidden bg-gradient-to-b from-[#1a2a4a] to-[#0d1829]">
        <div className="px-8 py-12 text-center">
          <p className="text-white/70">No live match available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <MatchBanner
        fixture={fixture}
        predictions={predictions}
        showPredictions={true}
      />

      {/* Carousel Dots - Overlay on banner */}
      {hasMultipleFixtures && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1">
          {fixtures.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-0.5 rounded-full transition-all hover:bg-white/40 ${
                idx === activeIndex
                  ? 'w-5 bg-white/70'
                  : 'w-2.5 bg-white/25'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
