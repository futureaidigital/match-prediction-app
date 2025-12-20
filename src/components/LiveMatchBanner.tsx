import { useState, useEffect } from 'react';
import { useFixtures } from '@/hooks/useFixtures';
import { MatchBanner } from '@/components/MatchBanner';

interface LiveMatchBannerProps {
  isPremium?: boolean;
}

export function LiveMatchBanner({ isPremium = false }: LiveMatchBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch live fixtures for carousel display
  const {
    data: liveResponse,
    isLoading: isLoadingLive,
  } = useFixtures({
    match_type: 'live',
    sort_by: 'kickoff_asc',
  });

  // Fetch featured fixtures as fallback when no live matches
  const {
    data: featuredResponse,
    isLoading: isLoadingFeatured,
  } = useFixtures({
    sort_by: 'kickoff_asc',
  });

  const liveFixtures = liveResponse?.data?.fixtures || [];
  const featuredFixtures = featuredResponse?.data?.fixtures || [];

  // Use live fixtures if available, otherwise fall back to featured
  const isLive = liveFixtures.length > 0;
  const fixtures = isLive ? liveFixtures : featuredFixtures;
  const isLoading = isLoadingLive || (liveFixtures.length === 0 && isLoadingFeatured);

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
  if (isLoading) {
    return (
      <>
        {/* Mobile Skeleton - matches MatchBanner mobile: 358x195px, rounded-[14px] */}
        <div className="md:hidden w-[358px] h-[195px] mx-auto rounded-[14px] overflow-hidden animate-pulse"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(9, 17, 67, 0) 0%, rgba(9, 17, 67, 1) 100%), linear-gradient(0deg, rgba(13, 26, 103, 0.55) 0%, rgba(13, 26, 103, 0.55) 100%)`,
            backgroundColor: '#0d1a67',
          }}
        >
          <div className="flex flex-col h-full pt-[12px]">
            {/* League Name & Live Badge */}
            <div className="flex flex-col items-center gap-[2px] mb-[8px]">
              <div className="h-[21px] bg-white/20 rounded w-40" />
              <div className="h-[18px] bg-white/20 rounded w-12 mt-1" />
            </div>

            {/* Teams and Score Row */}
            <div className="flex items-center justify-between px-[4px] mx-auto w-full max-w-[350px]">
              {/* Home Team */}
              <div className="w-[104px] flex items-center gap-[10px]">
                <div className="w-[50px] h-[50px] rounded-lg bg-white/20" />
                <div className="h-[24px] bg-white/20 rounded w-10" />
              </div>

              {/* Score */}
              <div className="flex items-center gap-[4px]">
                <div className="h-[46px] bg-white/20 rounded w-[90px]" />
              </div>

              {/* Away Team */}
              <div className="w-[104px] flex items-center justify-end gap-[10px]">
                <div className="h-[24px] bg-white/20 rounded w-10" />
                <div className="w-[50px] h-[50px] rounded-lg bg-white/20" />
              </div>
            </div>

            {/* Minutes */}
            <div className="text-center mt-[4px]">
              <div className="h-[21px] bg-white/20 rounded w-8 mx-auto" />
            </div>

            {/* Predictions */}
            <div className="px-[14px] pb-[10px] mt-auto">
              <div className="h-[17px] bg-white/20 rounded w-36 mb-[10px]" />
              <div className="flex gap-[14px]">
                <div className="h-[22px] bg-white/20 rounded w-24" />
                <div className="h-[22px] bg-white/20 rounded w-28" />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Skeleton - matches MatchBanner desktop: 1440x330px, rounded-[20px] */}
        <div className="hidden md:block w-full max-w-[1440px] mx-auto h-[330px] rounded-[20px] overflow-hidden animate-pulse"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(9, 17, 67, 0) 0%, rgba(9, 17, 67, 1) 100%), linear-gradient(0deg, rgba(13, 26, 103, 0.55) 0%, rgba(13, 26, 103, 0.55) 100%)`,
            backgroundColor: '#0d1a67',
          }}
        >
          <div className="flex flex-col h-full pt-[12px]">
            {/* League Name & Live Badge - 285x61px box */}
            <div className="flex flex-col items-center mb-[20px] w-[285px] h-[61px] mx-auto">
              {/* League name - 27px height */}
              <div className="h-[27px] bg-white/20 rounded w-[285px]" />
              {/* Live badge - 62x24px */}
              <div className="h-[24px] bg-white/20 rounded w-[62px] mt-[10px]" />
            </div>

            {/* Teams and Score Row - 1228x92px */}
            <div className="flex flex-col items-center w-[1228px] mx-auto">
              {/* Main row with teams and score */}
              <div className="flex items-center justify-between w-full">
                {/* Home Team - 350px */}
                <div className="flex items-center gap-[20px] w-[350px]">
                  <div className="w-[90px] h-[90px] rounded-lg bg-white/20" />
                  <div className="h-[33px] bg-white/20 rounded w-32" />
                </div>

                {/* Score - 150px center */}
                <div className="flex items-center justify-center w-[150px]">
                  <div className="h-[66px] bg-white/20 rounded w-[150px]" />
                </div>

                {/* Away Team - 350px */}
                <div className="flex items-center justify-end gap-[20px] w-[350px]">
                  <div className="h-[33px] bg-white/20 rounded w-32" />
                  <div className="w-[90px] h-[90px] rounded-lg bg-white/20" />
                </div>
              </div>

              {/* Minutes below score */}
              <div className="h-[27px] bg-white/20 rounded w-10 mt-[8px]" />
            </div>

            {/* Predictions - 55px container */}
            <div className="mt-auto h-[55px] px-6 flex flex-col justify-center mb-[20px]">
              {/* Label - 12px height */}
              <div className="h-[17px] bg-white/20 rounded w-40 mb-[6px]" />
              {/* Pills - 22px height each */}
              <div className="flex gap-[14px]">
                <div className="h-[22px] bg-white/20 rounded-[4px] w-24" />
                <div className="h-[22px] bg-white/20 rounded-[4px] w-28" />
                <div className="h-[22px] bg-white/20 rounded-[4px] w-24" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // No data state (both live and featured are empty)
  if (!fixture) {
    return (
      <div className="w-[358px] h-[195px] md:w-full md:h-auto mx-auto rounded-xl overflow-hidden bg-gradient-to-b from-[#1a2a4a] to-[#0d1829]">
        <div className="px-8 py-12 text-center">
          <p className="text-white/70">No matches available</p>
        </div>
      </div>
    );
  }

  return (
    <MatchBanner
      fixture={fixture}
      predictions={predictions}
      showPredictions={true}
      carouselCount={fixtures.length}
      activeIndex={activeIndex}
      onCarouselChange={setActiveIndex}
      isPremium={isPremium}
    />
  );
}
