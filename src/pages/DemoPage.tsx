import { useMemo, useState, useEffect, useRef } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { SmartCombo } from '@/components/SmartCombo';
import { Pagination } from '@/components/Pagination';
import { PlayersToWatch } from '@/components/PlayersToWatch';
import { LiveMatchBanner } from '@/components/LiveMatchBanner';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ApiDebugInfo } from '@/components/ApiDebugInfo';
import { Calendar } from '@/components/ui/Calendar';
import { FilterPanel, FilterValues, SortOption } from '@/components/ui/FilterPanel';
import { useFixtures } from '@/hooks/useFixtures';
import { useAuth } from '@/contexts/AuthContext';
import { MatchCardSkeleton } from '@/components/ui/skeletons/MatchCardSkeleton';
import { fixtureToMatchCard } from '@/lib/transformers';
import { DEFAULTS } from '@/config/defaults';
import { COLORS } from '@/config/theme';

// Persist the last successful day offset across navigations (module-level)
let _lastGoodDayOffset = 0;

export function DemoPage() {
  const { hasAccess, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const itemsPerPage = DEFAULTS.ITEMS_PER_PAGE;

  // Filter state
  const [filterLeagues, setFilterLeagues] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('kickoff_asc');

  // Handler for filter apply
  const handleFilterApply = (filters: FilterValues) => {
    setFilterLeagues(filters.leagues);
    setSortBy(filters.sortBy);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Current filter values for passing to FilterPanel
  const currentFilters: FilterValues = {
    leagues: filterLeagues,
    sortBy: sortBy,
  };

  // Day fallback: if today has no fixtures, go back up to 7 days
  // Start from the last successful offset so we don't re-cascade on navigation back
  const [dayOffset, setDayOffset] = useState(_lastGoodDayOffset);

  // Check if any filters are active (leagues or date changed from today)
  const isDateFiltered = selectedDate.toDateString() !== new Date().toDateString();
  const hasActiveFilters = filterLeagues.length > 0 || isDateFiltered;

  // Format date as YYYY-MM-DD for API
  const formatDateForApi = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // The effective date to query (selected date minus dayOffset for auto-fallback)
  const effectiveDate = useMemo(() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - dayOffset);
    return d;
  }, [selectedDate, dayOffset]);

  // Build fixture params based on filters — always send single day
  const fixtureParams = useMemo(() => {
    const dateStr = formatDateForApi(effectiveDate);
    const params: any = {
      sort_by: sortBy,
      date_from: dateStr,
      date_to: dateStr,
    };

    // Add league filter
    if (filterLeagues.length > 0) {
      params.leagues = filterLeagues;
    }

    // Use return_all when filters are active to get all results
    if (hasActiveFilters) {
      params.return_all = true;
    }

    return params;
  }, [effectiveDate, filterLeagues, sortBy, hasActiveFilters]);

  // Step 1: Fetch initial fixtures (returns all fixture_ids + first 6 with details)
  const { data: fixturesResponse, isLoading: isLoadingInitial, error, refetch: refetchFixtures } = useFixtures(fixtureParams);

  // All fixture IDs from the initial response (used for pagination)
  const allFixtureIds = fixturesResponse?.data?.fixture_ids ?? [];
  const initialFixtures = fixturesResponse?.data?.fixtures ?? [];

  // Track whether fallback is allowed (only on initial load, not user date picks)
  const [fallbackAllowed, setFallbackAllowed] = useState(true);

  // Auto-fallback: only on initial load — find closest date with matches
  useEffect(() => {
    if (!fallbackAllowed || isLoadingInitial || error) return;
    if (!fixturesResponse?.data) return;
    const hasData = (fixturesResponse.data.fixtures?.length ?? 0) > 0 || (fixturesResponse.data.fixture_ids?.length ?? 0) > 0;
    if (hasData) {
      _lastGoodDayOffset = dayOffset;
      setFallbackAllowed(false); // Stop fallback once we found data
    } else if (dayOffset < 7) {
      setDayOffset(prev => prev + 1);
    } else {
      setFallbackAllowed(false); // Give up after 7 days
    }
  }, [fixturesResponse, isLoadingInitial, dayOffset, error, fallbackAllowed]);

  // When user manually picks a date, disable fallback and reset offset
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setDayOffset(0);
    setFallbackAllowed(false);
  }, [selectedDate]);

  // Step 2: Determine which fixture IDs we need for the current page
  const pageFixtureIds = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allFixtureIds.slice(startIndex, endIndex);
  }, [allFixtureIds, currentPage, itemsPerPage]);

  // Step 3: Check if we already have data for this page from the initial response
  const initialFixtureIds = useMemo(
    () => new Set(initialFixtures.map((f) => f.fixture.fixture_id)),
    [initialFixtures]
  );
  const needsFetch = pageFixtureIds.length > 0 && !pageFixtureIds.every((id) => initialFixtureIds.has(id));

  // Step 4: Fetch additional fixture details when paginating beyond the initial 6
  const { data: pageResponse, isLoading: isLoadingPage } = useFixtures(
    { fixture_ids: pageFixtureIds, sort_by: sortBy },
    { enabled: needsFetch && pageFixtureIds.length > 0 }
  );

  // Use page-specific data if we fetched it, otherwise use initial fixtures sliced for page 1
  const fixtures = useMemo(() => {
    if (needsFetch) {
      return pageResponse?.data?.fixtures ?? [];
    }
    // Page 1 (or pages covered by initial response) — slice from initial fixtures
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return initialFixtures.slice(startIndex, endIndex);
  }, [needsFetch, pageResponse, initialFixtures, currentPage, itemsPerPage]);

  const isLoading = isLoadingInitial || (needsFetch && isLoadingPage);

  // Refetch fixtures when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      refetchFixtures();
    }
  }, [isAuthenticated, refetchFixtures]);

  // Check if user is premium - use hasAccess() which checks both subscriptionStatus and demo_premium flag
  const isPremium = hasAccess();

  // Calculate total pages from all fixture IDs
  const totalPages = useMemo(() => {
    const totalCount = allFixtureIds.length;
    return Math.max(Math.ceil(totalCount / itemsPerPage), 1);
  }, [allFixtureIds.length, itemsPerPage]);

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

  // Track if we've ever loaded data (to distinguish initial load from filter changes)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Mark as loaded once we get data
  useEffect(() => {
    if (allFixtureIds.length > 0 && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [allFixtureIds.length, hasLoadedOnce]);


  // Only show full page skeleton on initial load, not when filters change
  if (isLoading && !hasLoadedOnce) {
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
                    endpoint="/api/v1/fixtures"
                    response={fixturesResponse?.data}
                    isLoading={isLoading}
                    error={error?.message}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 relative">
                {/* Calendar - display only, no effect on data */}
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={(date) => {
                    setSelectedDate(date);
                    setCurrentPage(1); // Reset to first page when date changes
                  }}
                />
                {/* Filter Button */}
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`w-[80px] h-[40px] rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
                    showFilterPanel || hasActiveFilters
                      ? 'bg-[#0d1a67] text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Filter
                  <img
                    src="/arrow-down.svg"
                    alt="Arrow"
                    className={`w-[15px] h-auto transition-transform ${showFilterPanel ? 'rotate-180' : ''}`}
                    style={showFilterPanel || hasActiveFilters ? { filter: 'invert(1)' } : {}}
                  />
                </button>
                {/* Filter Panel */}
                <FilterPanel
                  isOpen={showFilterPanel}
                  onClose={() => setShowFilterPanel(false)}
                  onApply={handleFilterApply}
                  initialFilters={currentFilters}
                />
              </div>
            </div>

            {/* Match Cards Grid - Desktop: 3 columns, Mobile: single column, both in off-white container */}
            <div className="bg-gray-100 rounded-2xl p-5 w-[358px] min-h-[622px] md:w-[960px] md:min-h-[1016px] mb-8 mx-auto md:mx-0">
              {isLoading ? (
                // Show skeletons while loading
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 place-items-center md:place-items-start">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={i > 2 ? 'hidden md:block' : ''}>
                      <MatchCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : paginatedCards.length === 0 ? (
                // Empty state - inside the grey container
                <div className="flex flex-col items-center justify-center h-full min-h-[580px] md:min-h-[980px]">
                  <img
                    src="/404.svg"
                    alt="No matches"
                    className="w-32 h-32 mb-6 opacity-60"
                  />
                  <p className="text-gray-500 font-medium text-lg text-center">
                    {error ? 'Unable to load fixtures' : 'No matches found for your filters'}
                  </p>
                  {hasActiveFilters && (
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or selecting a different date</p>
                  )}
                </div>
              ) : (
                // Show match cards
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 place-items-center md:place-items-start">
                  {paginatedCards.map((match, index) => (
                    <div key={match.id} className={index >= 2 ? 'hidden md:block' : ''}>
                      <MatchCard
                        {...match}
                        isPremium={isPremium}
                        blurAllPredictions={!isPremium && currentPage > 1}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

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
