import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MatchCard } from '@/components/MatchCard';
import { SmartCombo } from '@/components/SmartCombo';
import { Calendar } from '@/components/ui/Calendar';
import { FilterPanel, FilterValues, SortOption } from '@/components/ui/FilterPanel';
import { useFixtures } from '@/hooks/useFixtures';
import { useLeagues } from '@/hooks/useLeagues';
import { useAuth } from '@/contexts/AuthContext';

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

  // Format date and time display
  const getDateTimeDisplay = () => {
    if (!fixture.starting_at) return 'TBD';

    const matchDate = new Date(fixture.starting_at);
    const today = new Date();

    const isToday =
      matchDate.getDate() === today.getDate() &&
      matchDate.getMonth() === today.getMonth() &&
      matchDate.getFullYear() === today.getFullYear();

    const time = matchDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return `Today, ${time}`;
    }

    const dayName = matchDate.toLocaleDateString('en-GB', { weekday: 'short' });
    const dayNum = matchDate.getDate();
    return `${dayName} ${dayNum}, ${time}`;
  };

  return (
    <div
      onClick={() => navigate(`/match/${fixture.fixture_id}`)}
      className="bg-white rounded-xl p-4 transition-shadow min-w-[260px] md:min-w-0 cursor-pointer"
      style={{ boxShadow: '0 0 12px rgba(0, 0, 0, 0.08)' }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.12)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 0, 0, 0.08)'}
    >
      {/* League Name */}
      <div className="text-center text-gray-400 text-xs font-medium mb-1">
        {leagueName || fixture.league_name || 'League'}
      </div>

      {/* Date/Time */}
      <div className="text-center text-orange-500 text-sm font-medium mb-4">
        {getDateTimeDisplay()}
      </div>

      {/* Teams Row */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/* Home Team */}
        <div className="flex flex-col items-center">
          {fixture.home_team_image_path ? (
            <img src={fixture.home_team_image_path} alt={fixture.home_team_name} className="w-12 h-12 object-contain mb-1" />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
              <span className="text-xs font-bold text-gray-500">{fixture.home_team_short_code?.slice(0, 3) || 'HOM'}</span>
            </div>
          )}
          <span className="text-xs font-semibold text-gray-700">
            {fixture.home_team_short_code || fixture.home_team_name?.slice(0, 3).toUpperCase() || 'HOM'}
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
          {fixture.away_team_image_path ? (
            <img src={fixture.away_team_image_path} alt={fixture.away_team_name} className="w-12 h-12 object-contain mb-1" />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
              <span className="text-xs font-bold text-gray-500">{fixture.away_team_short_code?.slice(0, 3) || 'AWY'}</span>
            </div>
          )}
          <span className="text-xs font-semibold text-gray-700">
            {fixture.away_team_short_code || fixture.away_team_name?.slice(0, 3).toUpperCase() || 'AWY'}
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

// League horizontal scroll row with dynamic left/right chevrons
function LeagueScrollRow({ league, leagueId, navigate, isPremium, transformToMatchCard }: {
  league: { leagueName: string; country: string; logo?: string; fixtures: any[] };
  leagueId: string;
  navigate: (path: string) => void;
  isPremium: boolean;
  transformToMatchCard: (f: any) => any;
}) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [league.fixtures.length]);

  return (
    <div className="rounded-[16px] bg-[#f7f8fa] p-[12px] flex flex-col gap-[12px]">
      {/* League header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          {league.logo ? <img src={league.logo} alt="" className="w-[24px] h-[24px] object-contain" /> : <div className="w-[24px] h-[24px] rounded-full bg-[#e1e4eb]" />}
          <span className="text-[14px] font-bold text-[#0a0a0a]">{league.leagueName}</span>
          {league.country && <span className="text-[14px] text-[#7c8a9c]">, {league.country}</span>}
        </div>
        <button onClick={() => navigate(`/league/${leagueId}`)} className="text-[14px] font-medium text-[#0d1a67] hover:underline">Live Table</button>
      </div>
      {/* Cards row */}
      <div className="relative">
        {/* Left fade + chevron */}
        {canScrollLeft && (
          <>
            <div className="absolute left-0 top-0 w-[71px] h-full pointer-events-none z-[5]" style={{ background: 'linear-gradient(to right, #f7f8fa, transparent)' }} />
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: -296, behavior: 'smooth' })}
              className="absolute left-[4px] top-1/2 -translate-y-1/2 w-[32px] h-[32px] rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center hover:bg-[#f7f8fa] transition-colors z-10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          </>
        )}
        {/* Scrollable cards */}
        <div ref={scrollRef} className="flex gap-[16px] overflow-x-auto scrollbar-hide scroll-smooth px-[2px] pb-[8px]" style={{ marginBottom: '-8px' }}>
          {league.fixtures.map((fixture: any) => {
            const match = fixture;
            const matchStart = match.starting_at ? new Date(match.starting_at).getTime() : 0;
            const isCurrentlyLive = match.minutes_elapsed != null;
            const isFinished = match.status === 'FT' || (!isCurrentlyLive && matchStart > 0 && Date.now() - matchStart > 2 * 60 * 60 * 1000);
            return (
              <div key={match.fixture_id} className="flex-shrink-0 w-[280px]">
                {isFinished
                  ? <MatchCard {...transformToMatchCard(fixture)} isPremium={isPremium} variant="minimal" />
                  : <UpcomingMatchCard fixture={fixture} leagueName={league.leagueName} />
                }
              </div>
            );
          })}
        </div>
        {/* Right fade + chevron */}
        {canScrollRight && (
          <>
            <div className="absolute right-0 top-0 w-[71px] h-full pointer-events-none z-[5]" style={{ background: 'linear-gradient(to left, #f7f8fa, transparent)' }} />
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: 296, behavior: 'smooth' })}
              className="absolute right-[4px] top-1/2 -translate-y-1/2 w-[32px] h-[32px] rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center hover:bg-[#f7f8fa] transition-colors z-10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function MatchesPage() {
  const navigate = useNavigate();
  const { hasAccess } = useAuth();
  const isPremium = hasAccess();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);

  // Fetch leagues for sidebar
  const { data: leaguesResponse } = useLeagues();
  const leagues = leaguesResponse?.data?.leagues || [];

  // Filter state
  const [filterLeagues, setFilterLeagues] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('kickoff_asc');

  // Handler for filter apply
  const handleFilterApply = (filters: FilterValues) => {
    setFilterLeagues(filters.leagues);
    setSortBy(filters.sortBy);
  };

  // Current filter values for passing to FilterPanel
  const currentFilters: FilterValues = {
    leagues: filterLeagues,
    sortBy: sortBy,
  };

  // Check if any filters are active
  const hasActiveFilters = filterLeagues.length > 0;

  // Format date as YYYY-MM-DD for API (using local date, not UTC)
  const formatDateForApi = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch fixtures with filters - use return_all to get all fixtures in single request
  // When on "live" tab, fetch live matches; otherwise fetch by date
  // Use selectedLeagueId from sidebar, or filterLeagues from filter panel
  const activeLeagues = selectedLeagueId ? [selectedLeagueId] : filterLeagues;

  const fixtureParams = {
    ...(activeTab === 'live'
      ? { match_type: 'live' as const }
      : {
          date_from: formatDateForApi(currentDate),
          date_to: formatDateForApi(currentDate),
        }),
    ...(activeLeagues.length > 0 && { leagues: activeLeagues }),
    sort_by: sortBy,
    group_by_league: true,
  };

  const { data: fixturesResponse, isLoading } = useFixtures(fixtureParams);

  // Data comes grouped by league in data.leagues[]
  const leaguesData: any[] = fixturesResponse?.data?.leagues || [];

  // Build fixturesByLeague directly from API response, extract live fixtures
  const { liveFixtures, fixturesByLeague } = useMemo(() => {
    const live: any[] = [];
    const byLeague: Record<string, { leagueName: string; country: string; logo?: string; fixtures: any[] }> = {};

    leaguesData.forEach((league: any) => {
      const leagueId = league.league_id.toString();
      // Normalize: some fixtures may be wrapped as {fixture: {...}, predictions: [...]}
      const rawFixtures = league.fixtures || [];
      const fixtures = rawFixtures.map((f: any) =>
        f.fixture_id != null ? f : { ...(f.fixture || f), prediction: f.prediction ?? (f.predictions?.[0] ?? null) }
      );

      byLeague[leagueId] = {
        leagueName: league.league_name,
        country: '',
        logo: league.league_image_path,
        fixtures,
      };

      fixtures.forEach((fixture: any) => {
        if (fixture.minutes_elapsed != null) {
          live.push({ ...fixture, _leagueName: league.league_name });
        }
      });
    });

    return { liveFixtures: live, fixturesByLeague: byLeague };
  }, [leaguesData]);

  // Transform fixture to MatchCard format (flat fixture object from group_by_league response)
  const transformToMatchCard = (fixtureItem: any, leagueName?: string) => {
    const fixture = fixtureItem;

    return {
      id: fixture.fixture_id.toString(),
      competition: leagueName || fixture._leagueName || fixture.league_name || 'League',
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
      score: (fixture.home_team_score ?? fixture.home_score) != null ? {
        home: fixture.home_team_score ?? fixture.home_score,
        away: fixture.away_team_score ?? fixture.away_score,
      } : undefined,
      status: fixture.minutes_elapsed != null ? 'live' as const
        : fixture.status === 'FT' ? 'finished' as const
        : 'upcoming' as const,
      currentMinute: fixture.minutes_elapsed,
      kickoffTime: fixture.starting_at
        ? new Date(fixture.starting_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : 'TBD',
      predictions: fixture.prediction ? [{
        id: '0',
        label: fixture.prediction.prediction_display_name || 'Prediction',
        percentage: Math.round(fixture.prediction.prediction || fixture.prediction.pre_game_prediction || 0),
        trend: {
          direction: (fixture.prediction.pct_change_value || 0) >= 0 ? 'up' as const : 'down' as const,
          value: Math.abs(fixture.prediction.pct_change_value || 0),
          timeframe: '13 min',
        },
      }] : [],
      totalPredictions: fixture.number_of_predictions || 1,
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
                              key={fixture.fixture_id}
                              fixture={fixture}
                              leagueName={fixture._leagueName || fixture.league_name}
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
                                key={fixture.fixture_id}
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

        {/* Desktop Layout — 3-column: Sidebar + Center + Smart Combo */}
        <div className="hidden md:flex max-w-[1440px] mx-auto px-6 py-6 gap-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>

          {/* LEFT SIDEBAR — 341x581, rounded-12, p-16, gap-16, white bg */}
          <div className="w-[341px] shrink-0 bg-white rounded-[12px] p-[16px] flex flex-col gap-[16px] self-start" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <h2 className="text-[16px] font-semibold text-[#0a0a0a]">Top leagues</h2>
            {/* League list — single solid bg, hover highlights */}
            <div className="rounded-[8px] bg-[#f7f8fa] p-[4px] flex flex-col">
              {leagues.slice(0, 9).map((league) => {
                const isSelected = selectedLeagueId === league.league_id;
                return (
                  <button
                    key={league.league_id}
                    onClick={() => setSelectedLeagueId(isSelected ? null : league.league_id)}
                    className={`flex items-center gap-[10px] px-[8px] py-[12px] rounded-[8px] transition-colors ${
                      isSelected ? 'bg-[#0d1a67]' : 'hover:bg-[#0d1a67]/10'
                    }`}
                  >
                    {league.image_path ? (
                      <img src={league.image_path} alt="" className="w-[24px] h-[24px] object-contain rounded-full" />
                    ) : (
                      <div className="w-[24px] h-[24px] rounded-full bg-[#e1e4eb]" />
                    )}
                    <span className={`text-[14px] font-semibold truncate flex-1 text-left ${isSelected ? 'text-white' : 'text-[#0a0a0a]'}`}>{league.league_name}</span>
                    {isSelected && (
                      <div className="w-[22px] h-[22px] rounded-full bg-[#f7f8fa] flex items-center justify-center shrink-0">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#000"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CENTER — 708px, rounded-12, p-16, gap-16, white bg */}
          <div className="flex-1 min-w-0 bg-white rounded-[12px] p-[16px] flex flex-col gap-[16px] self-start" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {/* Top bar — 676x44, horizontal, gap-10 */}
            <div className="flex items-center gap-[10px]">
              {/* Tabs — 264x44, #f7f8fa, rounded-10, p-4 */}
              <div className="flex bg-[#f7f8fa] rounded-[10px] p-[4px] h-[44px]">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`h-[36px] px-[20px] py-[6px] text-[14px] font-semibold rounded-[8px] transition-colors ${
                    activeTab === 'all' ? 'bg-[#0d1a67] text-white' : 'text-[#7c8a9c]'
                  }`}
                >
                  All Matches
                </button>
                <button
                  onClick={() => setActiveTab('live')}
                  className={`h-[36px] px-[20px] py-[6px] text-[14px] font-semibold rounded-[8px] transition-colors ${
                    activeTab === 'live' ? 'bg-[#0d1a67] text-white' : 'text-[#7c8a9c]'
                  }`}
                >
                  Live Matches
                </button>
              </div>

              <div className="flex-1" />

              {/* Date Navigation — 180x44, white bg, rounded-8, p-6, gap-16 */}
              {activeTab !== 'live' && (
                <div className="flex items-center h-[44px] px-[6px] gap-[16px] bg-white rounded-[8px]">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getTime() - 86400000))}
                    className="w-5 h-5 flex items-center justify-center hover:opacity-70"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <div className="flex items-center gap-[8px]">
                    <Calendar selectedDate={currentDate} onDateSelect={setCurrentDate} />
                    <span className="text-[14px] font-semibold text-[#0a0a0a] whitespace-nowrap">
                      {currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}{' '}
                      {currentDate.toLocaleDateString('en-GB', { weekday: 'short' })}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getTime() + 86400000))}
                    className="w-5 h-5 flex items-center justify-center hover:opacity-70"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>
              )}
            </div>

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <SkeletonMatchCard />
                      <SkeletonMatchCard />
                      <SkeletonMatchCard />
                      <SkeletonMatchCard />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Live Matches Tab */}
            {activeTab === 'live' && !isLoading && (
              <>
                {liveFixtures.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2">
                    {liveFixtures.map((fixture) => (
                      <div key={fixture.fixture_id} className="flex-shrink-0 w-[calc(50%-8px)]">
                        <MatchCard {...transformToMatchCard(fixture)} isPremium={isPremium} variant="minimal" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-[#e1e4eb]">
                    <img src="/404.svg" alt="No live matches" className="w-24 h-24 mb-4 opacity-60" />
                    <p className="text-[#7c8a9c] font-medium">No matches are currently being played</p>
                  </div>
                )}
              </>
            )}

            {/* All Matches Tab */}
            {activeTab === 'all' && !isLoading && (
              <div className="space-y-8">
                {/* When a league is selected — 2-column scrollable grid */}
                {selectedLeagueId && Object.entries(fixturesByLeague).map(([leagueId, league]) => (
                  <div key={leagueId} className="rounded-[16px] bg-[#f7f8fa] p-[12px] flex flex-col gap-[12px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-[10px]">
                        {league.logo ? <img src={league.logo} alt="" className="w-[24px] h-[24px] object-contain" /> : <div className="w-[24px] h-[24px] rounded-full bg-[#e1e4eb]" />}
                        <span className="text-[14px] font-bold text-[#0a0a0a]">{league.leagueName}</span>
                        {league.country && <span className="text-[14px] text-[#7c8a9c]">, {league.country}</span>}
                      </div>
                      <button onClick={() => navigate(`/league/${leagueId}`)} className="text-[14px] font-medium text-[#0d1a67] hover:underline">Live Table</button>
                    </div>
                    <div className="grid grid-cols-2 gap-[16px]">
                      {league.fixtures.map((fixture) => {
                        const match = fixture;
                        const matchStart = match.starting_at ? new Date(match.starting_at).getTime() : 0;
                        const isCurrentlyLive = match.minutes_elapsed != null;
            const isFinished = match.status === 'FT' || (!isCurrentlyLive && matchStart > 0 && Date.now() - matchStart > 2 * 60 * 60 * 1000);
                        return isFinished
                          ? <MatchCard key={match.fixture_id} {...transformToMatchCard(fixture)} isPremium={isPremium} variant="minimal" />
                          : <UpcomingMatchCard key={match.fixture_id} fixture={fixture} leagueName={league.leagueName} />;
                      })}
                    </div>
                  </div>
                ))}

                {/* When no league selected — horizontal scroll per league in #f7f8fa container */}
                {!selectedLeagueId && Object.entries(fixturesByLeague).map(([leagueId, league]) => (
                  <LeagueScrollRow key={leagueId} league={league} leagueId={leagueId} navigate={navigate} isPremium={isPremium} transformToMatchCard={transformToMatchCard} />
                ))}

                {Object.keys(fixturesByLeague).length === 0 && (
                  <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-[#e1e4eb]">
                    <img src="/404.svg" alt="No matches" className="w-24 h-24 mb-4 opacity-60" />
                    <p className="text-[#7c8a9c] font-medium">No matches found for this date</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR — Smart Combo */}
          <div className="w-[460px] shrink-0">
            <SmartCombo isPremium={isPremium} />
          </div>
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
