import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MatchCard } from '@/components/MatchCard';
import { Calendar } from '@/components/ui/Calendar';
import { FilterPanel, FilterValues } from '@/components/ui/FilterPanel';
import { useFixtures } from '@/hooks/useFixtures';
import { useLeagueNames } from '@/hooks/useLeagues';

type TabType = 'live' | 'all';

// Skeleton card for loading state
function SkeletonMatchCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 min-w-[260px] md:min-w-0 animate-pulse">
      {/* League Name */}
      <div className="flex justify-center mb-1">
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>

      {/* Date/Time */}
      <div className="flex justify-center mb-4">
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>

      {/* Teams Row */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/* Home Team */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-1" />
          <div className="h-3 bg-gray-200 rounded w-8" />
        </div>

        {/* VS */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-px bg-gray-200" />
          <div className="h-3 bg-gray-200 rounded w-4" />
          <div className="w-8 h-px bg-gray-200" />
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-1" />
          <div className="h-3 bg-gray-200 rounded w-8" />
        </div>
      </div>

      {/* Learn More */}
      <div className="flex justify-center">
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
}

// Skeleton league section for loading state
function SkeletonLeagueSection() {
  return (
    <div>
      {/* League Header */}
      <div className="flex items-center gap-3 px-4 mb-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
      </div>

      {/* Horizontal Scrollable Cards */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4">
          <SkeletonMatchCard />
          <SkeletonMatchCard />
          <SkeletonMatchCard />
        </div>
      </div>
    </div>
  );
}

// Upcoming match card component (simpler design)
function UpcomingMatchCard({ fixture, leagueName }: { fixture: any; leagueName?: string }) {
  const navigate = useNavigate();
  const match = fixture.fixture;

  // Format date and time display
  const getDateTimeDisplay = () => {
    if (!match.starting_at) return 'TBD';

    const matchDate = new Date(match.starting_at);
    const today = new Date();

    const isToday =
      matchDate.getDate() === today.getDate() &&
      matchDate.getMonth() === today.getMonth() &&
      matchDate.getFullYear() === today.getFullYear();

    const time = matchDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return `Today, ${time}`;
    }

    // Format: "Mon 23, 16:15"
    const dayName = matchDate.toLocaleDateString('en-GB', { weekday: 'short' });
    const dayNum = matchDate.getDate();
    return `${dayName} ${dayNum}, ${time}`;
  };

  const handleClick = () => {
    navigate(`/match/${match.fixture_id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl p-4 transition-shadow min-w-[260px] md:min-w-0 cursor-pointer"
      style={{
        boxShadow: '0 0 12px rgba(0, 0, 0, 0.08)'
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.12)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 0, 0, 0.08)'}
    >
      {/* League Name */}
      <div className="text-center text-gray-400 text-xs font-medium mb-1">
        {leagueName || match.league_name || 'League'}
      </div>

      {/* Date/Time */}
      <div className="text-center text-orange-500 text-sm font-medium mb-4">
        {getDateTimeDisplay()}
      </div>

      {/* Teams Row */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/* Home Team */}
        <div className="flex flex-col items-center">
          {match.home_team_image_path ? (
            <img
              src={match.home_team_image_path}
              alt={match.home_team_name}
              className="w-12 h-12 object-contain mb-1"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
              <span className="text-xs font-bold text-gray-500">
                {match.home_team_short_code?.slice(0, 3) || 'HOM'}
              </span>
            </div>
          )}
          <span className="text-xs font-semibold text-gray-700">
            {match.home_team_short_code || match.home_team_name?.slice(0, 3).toUpperCase() || 'HOM'}
          </span>
        </div>

        {/* VS */}
        <div className="flex items-center gap-2 self-center mt-3">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-gray-900" />
          <span className="text-gray-900 text-xs font-medium leading-none">vs</span>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-gray-900" />
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center">
          {match.away_team_image_path ? (
            <img
              src={match.away_team_image_path}
              alt={match.away_team_name}
              className="w-12 h-12 object-contain mb-1"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
              <span className="text-xs font-bold text-gray-500">
                {match.away_team_short_code?.slice(0, 3) || 'AWY'}
              </span>
            </div>
          )}
          <span className="text-xs font-semibold text-gray-700">
            {match.away_team_short_code || match.away_team_name?.slice(0, 3).toUpperCase() || 'AWY'}
          </span>
        </div>
      </div>

      {/* Learn More */}
      <button className="w-full text-center text-[#0d1a67] text-sm font-semibold hover:underline">
        Learn More
      </button>
    </div>
  );
}

// Mobile Bottom Navigation
function MobileBottomNav({ activeTab }: { activeTab: string }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  // Show footer when user scrolls to bottom OR when page has no scroll
  useEffect(() => {
    const checkVisibility = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show if no scroll needed (content fits in viewport) or at bottom
      const hasNoScroll = documentHeight <= windowHeight + 10;
      const isAtBottom = scrollTop + windowHeight >= documentHeight - 50;
      setIsVisible(hasNoScroll || isAtBottom);
    };

    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);

    // Check after initial render and after content loads
    checkVisibility();
    const timeoutId = setTimeout(checkVisibility, 100);
    const timeoutId2 = setTimeout(checkVisibility, 500);

    // Also observe DOM changes
    const observer = new MutationObserver(checkVisibility);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      observer.disconnect();
    };
  }, []);

  const tabs = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'live', label: 'Live', path: '/matches' },
    { id: 'combos', label: 'Combos', path: '/smart-combo' },
    { id: 'login', label: 'Login', path: '/login' },
  ];

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-[#0d1a67] transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="flex items-center justify-center gap-8 py-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`text-sm font-medium ${
              activeTab === tab.id ? 'text-white' : 'text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="border-t border-white/20 py-4">
        <p className="text-center text-white/50 text-xs">
          © 2025 Sports Predictions Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export function MatchesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Filter state
  const [filterLeagues, setFilterLeagues] = useState<number[]>([]);
  const [filterMatchStatus, setFilterMatchStatus] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');

  // Handler for filter apply
  const handleFilterApply = (filters: FilterValues) => {
    setFilterLeagues(filters.leagues);
    setFilterMatchStatus(filters.matchStatus);
  };

  // Current filter values for passing to FilterPanel
  const currentFilters: FilterValues = {
    leagues: filterLeagues,
    matchStatus: filterMatchStatus,
  };

  // Check if any filters are active
  const hasActiveFilters = filterLeagues.length > 0 || filterMatchStatus !== 'all';

  // Format date as YYYY-MM-DD for API (using local date, not UTC)
  const formatDateForApi = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Step 1: Fetch fixture IDs for selected date/filters
  // When on "live" tab, fetch live matches; otherwise fetch by date
  // Filter panel match_type overrides tab selection when not 'all'
  const initialParams = {
    ...(activeTab === 'live'
      ? { match_type: 'live' as const }
      : {
          date_from: formatDateForApi(currentDate),
          date_to: formatDateForApi(currentDate),
          ...(filterMatchStatus !== 'all' && { match_type: filterMatchStatus }),
        }),
    ...(filterLeagues.length > 0 && { leagues: filterLeagues }),
    sort_by: 'kickoff_asc' as const,
  };

  const { data: initialResponse, isLoading: isLoadingInitial, isFetched: isInitialFetched } = useFixtures(initialParams);

  // Get all fixture IDs from initial response
  const allFixtureIds = initialResponse?.data?.fixture_ids ?? [];

  // Step 2: Fetch full fixture data for ALL fixture IDs (not just first 6)
  // Only fetch if we have fixture IDs to fetch
  const shouldFetchDetails = isInitialFetched && allFixtureIds.length > 0;

  const { data: fixturesResponse, isLoading: isLoadingFixtures } = useFixtures(
    shouldFetchDetails ? { fixture_ids: allFixtureIds, sort_by: 'kickoff_asc' } : undefined,
    { enabled: shouldFetchDetails }
  );

  // Loading state: still loading initial, OR we have IDs and are loading details
  const isLoading = isLoadingInitial || (shouldFetchDetails && isLoadingFixtures);

  // Use fixtures from detail fetch if available, otherwise use fixtures from initial response
  const fixtures = (shouldFetchDetails ? fixturesResponse?.data?.fixtures : initialResponse?.data?.fixtures) || [];

  // Fetch league names and images to fill in missing data from fixtures
  const { getLeagueName, getLeagueImage } = useLeagueNames();

  // Separate live and upcoming fixtures, group all by league
  const { liveFixtures, fixturesByLeague } = useMemo(() => {
    const live: any[] = [];
    const upcoming: any[] = [];
    const byLeague: Record<string, { leagueName: string; country: string; logo?: string; fixtures: any[] }> = {};

    fixtures.forEach((fixture: any) => {
      const match = fixture.fixture;
      const isLive = match.minutes_elapsed !== null && match.minutes_elapsed !== undefined;

      // Group ALL fixtures by league (not just upcoming)
      const leagueId = match.league_id || 'unknown';
      // Use league_name from fixture if available, otherwise look up from leagues endpoint
      const leagueName = match.league_name || (match.league_id ? getLeagueName(match.league_id) : 'Unknown League');
      // Use league_logo from fixture if available, otherwise look up from leagues endpoint
      const leagueLogo = match.league_logo || (match.league_id ? getLeagueImage(match.league_id) : undefined);

      if (!byLeague[leagueId]) {
        byLeague[leagueId] = {
          leagueName,
          country: match.country_name || '',
          logo: leagueLogo,
          fixtures: []
        };
      }
      byLeague[leagueId].fixtures.push(fixture);

      if (isLive) {
        live.push(fixture);
      } else {
        upcoming.push(fixture);
      }
    });

    return { liveFixtures: live, fixturesByLeague: byLeague };
  }, [fixtures, getLeagueName, getLeagueImage]);

  // Transform fixture to MatchCard format
  const transformToMatchCard = (fixtureItem: any) => {
    const fixture = fixtureItem.fixture;
    const predictions = fixtureItem.predictions || [];

    return {
      id: fixture.fixture_id.toString(),
      competition: fixture.league_name || (fixture.league_id ? getLeagueName(fixture.league_id) : 'League'),
      homeTeam: {
        id: fixture.home_team_id?.toString() || 'home',
        name: fixture.home_team_name || 'Home',
        shortName: fixture.home_team_short_code || fixture.home_team_name?.slice(0, 3).toUpperCase() || 'HOM',
        logo: fixture.home_team_image_path,
      },
      awayTeam: {
        id: fixture.away_team_id?.toString() || 'away',
        name: fixture.away_team_name || 'Away',
        shortName: fixture.away_team_short_code || fixture.away_team_name?.slice(0, 3).toUpperCase() || 'AWY',
        logo: fixture.away_team_image_path,
      },
      score: fixture.home_team_score !== undefined ? {
        home: fixture.home_team_score,
        away: fixture.away_team_score,
      } : undefined,
      status: fixture.minutes_elapsed !== null ? 'live' as const : 'upcoming' as const,
      currentMinute: fixture.minutes_elapsed,
      kickoffTime: fixture.starting_at
        ? new Date(fixture.starting_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : 'TBD',
      predictions: predictions.slice(0, 4).map((pred: any, index: number) => ({
        id: pred.prediction_id?.toString() || index.toString(),
        label: pred.prediction_display_name || 'Prediction',
        percentage: Math.round(pred.prediction || pred.pre_game_prediction || 0),
        trend: {
          direction: (pred.pct_change_value || 0) >= 0 ? 'up' as const : 'down' as const,
          value: Math.abs(pred.pct_change_value || 0),
          timeframe: '13 min',
        },
      })),
      totalPredictions: fixture.number_of_predictions || predictions.length || 5,
      lastUpdated: '2 mins ago',
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentPage="matches" />

      <main className="flex-1 pb-32 md:pb-0">
        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Mobile Tabs - Full Width */}
          <div className="px-4 pt-4">
            <div className="flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors ${
                  activeTab === 'all'
                    ? 'bg-[#0d1a67] text-white'
                    : 'text-gray-500'
                }`}
              >
                All Matches
              </button>
              <button
                onClick={() => setActiveTab('live')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors ${
                  activeTab === 'live'
                    ? 'bg-[#0d1a67] text-white'
                    : 'text-gray-500'
                }`}
              >
                Live Matches
              </button>
            </div>
          </div>

          {/* Mobile: Matches header with Filter (hidden on live tab) */}
          {activeTab !== 'live' && (
            <div className="flex items-center justify-between px-4 pt-6 pb-4">
              <h1 className="text-xl font-bold text-gray-900">Matches</h1>
              <div className="relative">
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    showFilterPanel || hasActiveFilters
                      ? 'bg-[#0d1a67] text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Filter
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                  <img
                    src="/arrow-down.svg"
                    alt="Arrow"
                    className={`w-[15px] h-auto transition-transform ${showFilterPanel ? 'rotate-180' : ''}`}
                    style={showFilterPanel || hasActiveFilters ? { filter: 'invert(1)' } : {}}
                  />
                </button>
                <FilterPanel
                  isOpen={showFilterPanel}
                  onClose={() => setShowFilterPanel(false)}
                  onApply={handleFilterApply}
                  initialFilters={currentFilters}
                />
              </div>
            </div>
          )}

          {/* Mobile: Date Navigation Bar (hidden on live tab) */}
          {activeTab !== 'live' && (
            <div className="mx-4 mb-4 flex items-center gap-2">
              {/* Arrows and Date in one grey bar */}
              <div className="flex-1 bg-gray-100 rounded-xl flex items-center justify-between px-3 py-2">
                {/* Left arrow */}
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getTime() - 86400000))}
                  className="w-[36px] h-[36px] rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                {/* Date display */}
                <span className="text-base font-semibold text-gray-900">
                  {currentDate.toDateString() === new Date().toDateString()
                    ? 'Today'
                    : currentDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>

                {/* Right arrow */}
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getTime() + 86400000))}
                  className="w-[36px] h-[36px] rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {/* Calendar in separate box */}
              <Calendar
                selectedDate={currentDate}
                onDateSelect={setCurrentDate}
                className="[&>button]:w-[52px] [&>button]:h-[52px] [&>button]:rounded-xl"
              />
            </div>
          )}

          {/* Mobile: Loading Skeleton */}
          {isLoading && (
            <div className="py-4 space-y-6">
              <SkeletonLeagueSection />
              <SkeletonLeagueSection />
              <SkeletonLeagueSection />
            </div>
          )}

          {/* Mobile: Matches by League */}
          {!isLoading && (
            <div className="py-4 space-y-6">
              {/* Live Tab - Show only live matches or empty state */}
              {activeTab === 'live' && (
                <>
                  {liveFixtures.length > 0 ? (
                    <div className="mx-4 bg-gray-100 rounded-xl p-3">
                      <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex gap-3">
                          {liveFixtures.map((fixture) => (
                            <UpcomingMatchCard
                              key={fixture.fixture.fixture_id}
                              fixture={fixture}
                              leagueName={fixture.fixture.league_name || (fixture.fixture.league_id ? getLeagueName(fixture.fixture.league_id) : undefined)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] mx-4 bg-white rounded-xl border border-gray-200">
                      <img
                        src="/404.svg"
                        alt="No live matches"
                        className="w-24 h-24 mb-4 opacity-60"
                      />
                      <p className="text-gray-500 font-medium">No matches are currently being played</p>
                    </div>
                  )}
                </>
              )}

              {/* All Tab - Show matches grouped by league */}
              {activeTab === 'all' && (
                <>
                  {Object.entries(fixturesByLeague).map(([leagueId, league]) => (
                    <div key={leagueId}>
                      {/* League Header */}
                      <div className="flex items-center gap-3 px-4 mb-3">
                        {league.logo ? (
                          <img src={league.logo} alt={league.leagueName} className="w-8 h-8 object-contain" />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full" />
                        )}
                        <div>
                          <h2 className="text-base font-bold text-gray-900">{league.leagueName}</h2>
                          {league.country && (
                            <p className="text-xs text-gray-500">{league.country}</p>
                          )}
                        </div>
                      </div>

                      {/* Horizontal Scrollable Cards */}
                      <div className="mx-4 bg-gray-100 rounded-xl p-3">
                        <div className="overflow-x-auto scrollbar-hide">
                          <div className="flex gap-3">
                            {league.fixtures.map((fixture) => (
                              <UpcomingMatchCard
                                key={fixture.fixture.fixture_id}
                                fixture={fixture}
                                leagueName={league.leagueName}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {Object.keys(fixturesByLeague).length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] mx-4 bg-white rounded-xl border border-gray-200">
                      <img
                        src="/404.svg"
                        alt="No matches"
                        className="w-24 h-24 mb-4 opacity-60"
                      />
                      <p className="text-gray-500 font-medium">No matches found for this date</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block max-w-[1400px] mx-auto px-6 py-6">
          {/* Tabs and Filters Row */}
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  activeTab === 'all'
                    ? 'bg-[#0d1a67] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Matches
              </button>
              <button
                onClick={() => setActiveTab('live')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  activeTab === 'live'
                    ? 'bg-[#0d1a67] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Live Matches
              </button>
            </div>

            {/* Date Navigation and Filter (hidden on live tab) */}
            <div className="flex items-center gap-3">
              {/* Date Navigation - only show when not on live tab */}
              {activeTab !== 'live' && (
                <>
                  {/* Left arrow in grey box */}
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getTime() - 86400000))}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  {/* Date display */}
                  <span className="text-sm font-semibold text-gray-900 min-w-[100px] text-center">
                    {currentDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>

                  {/* Right arrow in grey box */}
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getTime() + 86400000))}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  {/* Calendar in grey box */}
                  <Calendar
                    selectedDate={currentDate}
                    onDateSelect={setCurrentDate}
                  />
                </>
              )}

              {/* Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    showFilterPanel || hasActiveFilters
                      ? 'bg-[#0d1a67] text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Filter
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                  <img
                    src="/arrow-down.svg"
                    alt="Arrow"
                    className={`w-[15px] h-auto transition-transform ${showFilterPanel ? 'rotate-180' : ''}`}
                    style={showFilterPanel || hasActiveFilters ? { filter: 'invert(1)' } : {}}
                  />
                </button>
                <FilterPanel
                  isOpen={showFilterPanel}
                  onClose={() => setShowFilterPanel(false)}
                  onApply={handleFilterApply}
                  initialFilters={currentFilters}
                />
              </div>
            </div>
          </div>

          {/* Loading State - Desktop Skeleton */}
          {isLoading && (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  {/* League Header Skeleton */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                    <div>
                      <div className="h-5 bg-gray-200 rounded w-40 mb-1 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                    </div>
                  </div>
                  {/* Cards Grid Skeleton */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <SkeletonMatchCard />
                      <SkeletonMatchCard />
                      <SkeletonMatchCard />
                      <SkeletonMatchCard />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Live Matches Tab */}
          {activeTab === 'live' && !isLoading && (
            <>
              {/* Live Matches Section */}
              {liveFixtures.length > 0 && (
                <div className="mb-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {liveFixtures.map((fixture) => (
                      <MatchCard
                        key={fixture.fixture.fixture_id}
                        {...transformToMatchCard(fixture)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {liveFixtures.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] bg-white rounded-xl border border-gray-200">
                  <img
                    src="/404.svg"
                    alt="No live matches"
                    className="w-32 h-32 mb-6 opacity-60"
                  />
                  <p className="text-gray-500 font-medium text-lg">No matches are currently being played</p>
                </div>
              )}
            </>
          )}

          {/* All Matches Tab - Grouped by League */}
          {activeTab === 'all' && !isLoading && (
            <div className="space-y-8">
              {Object.entries(fixturesByLeague).map(([leagueId, league]) => (
                <div key={leagueId}>
                  {/* League Header */}
                  <div className="flex items-center gap-3 mb-4">
                    {league.logo ? (
                      <img src={league.logo} alt={league.leagueName} className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    )}
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{league.leagueName}</h2>
                      {league.country && (
                        <p className="text-sm text-gray-500">{league.country}</p>
                      )}
                    </div>
                  </div>

                  {/* League Matches */}
                  <div className="bg-gray-100 rounded-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {league.fixtures.slice(0, 4).map((fixture) => (
                        <UpcomingMatchCard
                          key={fixture.fixture.fixture_id}
                          fixture={fixture}
                          leagueName={league.leagueName}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {Object.keys(fixturesByLeague).length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] bg-white rounded-xl border border-gray-200">
                  <img
                    src="/404.svg"
                    alt="No matches"
                    className="w-32 h-32 mb-6 opacity-60"
                  />
                  <p className="text-gray-500 font-medium text-lg">No matches found for this date</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Desktop Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab="live" />
    </div>
  );
}
