import { useMemo, useState, useEffect } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { SmartCombo } from '@/components/SmartCombo';
import { Pagination } from '@/components/Pagination';
import { PlayersToWatch } from '@/components/PlayersToWatch';
import { LiveMatchBanner } from '@/components/LiveMatchBanner';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ApiDebugInfo } from '@/components/ApiDebugInfo';
import { Calendar } from '@/components/ui/Calendar';
import { FilterPanel } from '@/components/ui/FilterPanel';
import { useFixtures } from '@/hooks/useFixtures';
import { useAuth } from '@/contexts/AuthContext';
import { MatchCardSkeleton } from '@/components/ui/skeletons/MatchCardSkeleton';
import { fixtureToMatchCard } from '@/lib/transformers';
import { DEFAULTS } from '@/config/defaults';
import { COLORS } from '@/config/theme';

export function DemoPage() {
  const { hasAccess, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const itemsPerPage = DEFAULTS.ITEMS_PER_PAGE;

  // First fetch to get all fixture_ids
  const { data: initialResponse, isLoading: isLoadingInitial, error, refetch: refetchInitial } = useFixtures({
    sort_by: 'kickoff_asc',
  });

  // Get all fixture IDs from initial response
  const allFixtureIds = initialResponse?.data?.fixture_ids ?? [];

  // Calculate which fixture IDs to fetch for current page
  const pageFixtureIds = useMemo(() => {
    if (allFixtureIds.length === 0) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allFixtureIds.slice(startIndex, endIndex);
  }, [allFixtureIds, currentPage, itemsPerPage]);

  // Fetch fixtures for current page by IDs
  const { data: fixturesResponse, isLoading: isLoadingPage, refetch: refetchPage } = useFixtures(
    {
      fixture_ids: pageFixtureIds.length > 0 ? pageFixtureIds : undefined,
      sort_by: 'kickoff_asc',
    },
    {
      enabled: pageFixtureIds.length > 0 || currentPage === 1,
    }
  );

  // Use initial response for page 1, fetched response for other pages
  const fixtures = currentPage === 1 && initialResponse?.data?.fixtures
    ? initialResponse.data.fixtures
    : fixturesResponse?.data?.fixtures ?? [];

  const isLoading = isLoadingInitial || (currentPage > 1 && isLoadingPage && pageFixtureIds.length > 0);

  // Refetch fixtures when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      refetchInitial();
      if (pageFixtureIds.length > 0) {
        refetchPage();
      }
    }
  }, [isAuthenticated, refetchInitial, refetchPage, pageFixtureIds.length]);

  // Check if user is premium - use hasAccess() which checks both subscriptionStatus and demo_premium flag
  const isPremium = hasAccess();

  // Calculate total pages from fixture_ids (minimum 10 for demo)
  const totalPages = useMemo(() => {
    const totalCount = allFixtureIds.length > 0 ? allFixtureIds.length : fixtures.length;
    return Math.max(Math.ceil(totalCount / itemsPerPage), 10);
  }, [allFixtureIds, fixtures.length, itemsPerPage]);

  // Transform fixture data to match MatchCard interface
  const paginatedCards = useMemo(() => {
    if (!fixtures || fixtures.length === 0) {
      return [];
    }

    // Use shared transformer for consistent data transformation
    return fixtures.map((fixtureItem) => ({
      ...fixtureToMatchCard(fixtureItem),
      onSeeMore: () => console.log('See more clicked for:', fixtureItem.fixture.fixture_id),
    }));
  }, [fixtures]);

  // For empty state check
  const hasNoMatches = !isLoading && paginatedCards.length === 0 && currentPage === 1;


  if (isLoadingInitial) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto px-6 md:px-0 py-8 flex flex-col items-center">
          {/* Banner Skeleton */}
          <div className="w-full mb-8 md:w-[1440px]">
            <MatchCardSkeleton variant="banner" />
          </div>

          {/* Main Content Layout */}
          <div className="w-full md:flex md:gap-[30px] md:w-[1440px] md:min-h-[1124px]">
            {/* Left Side: Featured Matches */}
            <div className="flex-1 md:w-[960px] md:flex-none">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-6 md:h-8 bg-gray-200 rounded w-40 md:w-48 animate-pulse" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] bg-gray-200 rounded-lg animate-pulse" />
                  <div className="w-[80px] h-[40px] bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>

              {/* Match Cards Grid Skeleton - Same as finished layout */}
              <div className="bg-gray-100 rounded-2xl p-5 w-[358px] min-h-[622px] md:w-[960px] md:min-h-[1016px] mb-8 mx-auto md:mx-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 place-items-center md:place-items-start">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={i > 2 ? 'hidden md:block' : ''}>
                      <MatchCardSkeleton />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination Skeleton */}
              <div className="hidden md:flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* Right Side: Smart Combo Skeleton */}
            <div className="hidden xl:block w-[450px] min-h-[959px]">
              <div className="rounded-2xl overflow-hidden h-full p-[3px]" style={{ background: `linear-gradient(to top right, ${COLORS.primary.dark} 65%, ${COLORS.primary.light} 100%)` }}>
                <div className="text-white px-4 py-3">
                  <div className="h-6 bg-white/20 rounded w-32 animate-pulse" />
                </div>
                <div className="bg-white rounded-xl mx-1 mb-1 p-4">
                  {/* Accuracy Section Skeleton */}
                  <div className="px-4 py-3 border-b border-gray-100 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-5 bg-gray-200 rounded w-12 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <MatchCardSkeleton variant="compact" />
                    <MatchCardSkeleton variant="compact" />
                  </div>
                  {/* See More Button Skeleton */}
                  <div className="mt-4 px-4">
                    <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Smart Combo Skeleton */}
          <div className="xl:hidden mt-8 w-full">
            <div className="rounded-2xl overflow-hidden p-[3px]" style={{ background: `linear-gradient(to top right, ${COLORS.primary.dark} 65%, ${COLORS.primary.light} 100%)` }}>
              <div className="text-white px-4 py-3">
                <div className="h-6 bg-white/20 rounded w-32 animate-pulse" />
              </div>
              <div className="bg-white rounded-xl mx-1 mb-1 p-4">
                <div className="space-y-4">
                  <MatchCardSkeleton variant="compact" />
                  <MatchCardSkeleton variant="compact" />
                </div>
              </div>
            </div>
          </div>

          {/* Players to Watch Skeleton */}
          <div className="hidden md:block mt-8 w-[1440px] h-[397px] rounded-2xl animate-pulse" style={{ background: `linear-gradient(to top right, ${COLORS.primary.dark} 65%, ${COLORS.primary.light} 100%)` }}>
            <div className="px-4 py-3">
              <div className="h-6 bg-white/20 rounded w-40" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-[100vw] overflow-x-hidden md:overflow-x-visible md:max-w-none">
      {/* Header */}
      <Header />

      <div className="mx-auto px-6 md:px-0 py-8 flex flex-col items-center">
        {/* Live Match Banner - Full Width */}
        <div className="w-full mb-8 md:w-[1440px]">
          <LiveMatchBanner isPremium={isPremium} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">Failed to load fixtures: {error.message}</p>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="w-full md:flex md:gap-[30px] md:w-[1440px] md:min-h-[1124px] md:items-start">
          {/* Left Side: Featured Matches */}
          <div className="flex-1 md:w-[960px] md:flex-none">
            {/* Header - Mobile: match banner width (358px), Desktop: match grey container (960px), aligned with SmartCombo header */}
            <div className="flex items-center justify-between mb-6 w-[358px] mx-auto md:w-[960px] md:mx-0 md:pt-[15px]">
              <div className="flex items-center gap-3">
                <h1 className="text-[18px] md:text-2xl font-bold text-gray-900">Featured Matches</h1>
                <div className="text-gray-600">
                  <ApiDebugInfo
                    endpoint="/api/v1/fixtures?limit=100&with_predictions=true"
                    response={initialResponse?.data}
                    isLoading={isLoadingInitial}
                    error={error?.message}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 relative">
                {/* Calendar - display only, no effect on data */}
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
                {/* Filter Button */}
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`w-[80px] h-[40px] rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
                    showFilterPanel
                      ? 'bg-[#0d1a67] text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Filter
                  <img
                    src="/arrow-down.svg"
                    alt="Arrow"
                    className={`w-[15px] h-auto transition-transform ${showFilterPanel ? 'rotate-180 invert brightness-0' : ''}`}
                    style={showFilterPanel ? { filter: 'invert(1)' } : {}}
                  />
                </button>
                {/* Filter Panel */}
                <FilterPanel
                  isOpen={showFilterPanel}
                  onClose={() => setShowFilterPanel(false)}
                />
              </div>
            </div>

            {/* Match Cards Grid - Desktop: 3 columns, Mobile: single column, both in off-white container */}
            <div className="bg-gray-100 rounded-2xl p-5 w-[358px] min-h-[622px] md:w-[960px] md:min-h-[1016px] mb-8 mx-auto md:mx-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 place-items-center md:place-items-start">
                {isLoadingPage && currentPage > 1 ? (
                  // Show skeletons while loading new page
                  <>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className={i > 2 ? 'hidden md:block' : ''}>
                        <MatchCardSkeleton />
                      </div>
                    ))}
                  </>
                ) : (
                  paginatedCards.map((match, index) => (
                    <div key={match.id} className={index >= 2 ? 'hidden md:block' : ''}>
                      <MatchCard
                        {...match}
                        isPremium={isPremium}
                        blurAllPredictions={!isPremium && currentPage > 1}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Empty State */}
            {hasNoMatches && (
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-gray-200">
                <img
                  src="/404.svg"
                  alt="No matches"
                  className="w-32 h-32 mb-6 opacity-60"
                />
                <p className="text-gray-500 font-medium text-lg">
                  {error ? 'Unable to load fixtures' : 'No matches available at the moment'}
                </p>
              </div>
            )}

            {/* Mobile: View All Button */}
            <div className="md:hidden w-[358px] mx-auto">
              <button className="w-full py-3 border-2 border-[#0d1a67] text-[#0d1a67] font-bold rounded-xl hover:bg-[#0d1a67] hover:text-white transition-all">
                View All
              </button>
            </div>

            {/* Desktop: Pagination - Always visible, greyed out for free users */}
            <div className="hidden md:block mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>

          {/* Right Side: Smart Combo - Desktop only */}
          <div className="hidden xl:block">
            <SmartCombo isPremium={isPremium} />
          </div>
        </div>

        {/* Mobile: Smart Combo - Below Featured Matches */}
        <div className="xl:hidden mt-8">
          <SmartCombo isPremium={isPremium} />
        </div>

        {/* Players to Watch Section - Full Width on Desktop */}
        <div className="hidden md:block mt-8">
          <PlayersToWatch />
        </div>
      </div>

      {/* Players to Watch Section - Edge to Edge on Mobile */}
      <div className="md:hidden mt-8 mb-8">
        <PlayersToWatch />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
