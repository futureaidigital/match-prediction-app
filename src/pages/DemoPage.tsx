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
import { FilterPanel, FilterValues, SortOption } from '@/components/ui/FilterPanel';
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

  // Build fixture params based on filters
  const fixtureParams = useMemo(() => {
    const params: any = {
      sort_by: sortBy,
    };

    // Add date filter
    if (isDateFiltered) {
      params.date_from = formatDateForApi(selectedDate);
      params.date_to = formatDateForApi(selectedDate);
    }

    // Add league filter
    if (filterLeagues.length > 0) {
      params.leagues = filterLeagues;
    }

    // Use return_all when filters are active to get all results
    if (hasActiveFilters) {
      params.return_all = true;
    }

    return params;
  }, [selectedDate, filterLeagues, sortBy, hasActiveFilters, isDateFiltered]);

  // Fetch fixtures with filters
  const { data: fixturesResponse, isLoading: isLoadingFixtures, error, refetch: refetchFixtures } = useFixtures(fixtureParams);

  // Get fixtures from response
  const allFixtures = fixturesResponse?.data?.fixtures ?? [];

  // Paginate fixtures client-side
  const fixtures = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allFixtures.slice(startIndex, endIndex);
  }, [allFixtures, currentPage, itemsPerPage]);

  const isLoading = isLoadingFixtures;

  // Refetch fixtures when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      refetchFixtures();
    }
  }, [isAuthenticated, refetchFixtures]);

  // Check if user is premium - use hasAccess() which checks both subscriptionStatus and demo_premium flag
  const isPremium = hasAccess();

  // Calculate total pages from all fixtures (minimum 10 for demo when no filters)
  const totalPages = useMemo(() => {
    const totalCount = allFixtures.length;
    // When filters are active, show actual pages; otherwise show minimum 10 for demo
    return hasActiveFilters ? Math.max(Math.ceil(totalCount / itemsPerPage), 1) : Math.max(Math.ceil(totalCount / itemsPerPage), 10);
  }, [allFixtures.length, itemsPerPage, hasActiveFilters]);

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
    if (allFixtures.length > 0 && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [allFixtures.length, hasLoadedOnce]);


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
