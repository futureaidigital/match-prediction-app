import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MatchCard } from '@/components/MatchCard';
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

  const kickoffTime = match.starting_at
    ? new Date(match.starting_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : 'TBD';

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
        Today, {kickoffTime}
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
        <div className="flex items-center gap-2">
          <div className="w-8 h-px bg-gradient-to-r from-white to-gray-400" />
          <span className="text-gray-400 text-xs">vs</span>
          <div className="w-8 h-px bg-gradient-to-r from-gray-400 to-white" />
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

  const tabs = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'live', label: 'Live', path: '/matches' },
    { id: 'combos', label: 'Combos', path: '/smart-combo' },
    { id: 'login', label: 'Login', path: '/login' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d1a67]">
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

  // Format date as YYYY-MM-DD for API (using local date, not UTC)
  const formatDateForApi = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch fixtures for selected date
  // When on "live" tab, fetch live matches; otherwise fetch by date
  const { data: fixturesResponse, isLoading } = useFixtures(
    activeTab === 'live'
      ? { match_type: 'live', sort_by: 'kickoff_asc' }
      : {
          date_from: formatDateForApi(currentDate),
          date_to: formatDateForApi(currentDate),
          sort_by: 'kickoff_asc',
        }
  );

  // Fetch league names and images to fill in missing data from fixtures
  const { getLeagueName, getLeagueImage } = useLeagueNames();

  const fixtures = fixturesResponse?.data?.fixtures || [];

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

  const formatDate = (date: Date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentPage="matches" />

      <main className="flex-1 pb-28 md:pb-0">
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

          {/* Mobile: Matches Title + Filter (hidden on live tab) */}
          {activeTab !== 'live' && (
            <div className="flex items-center justify-between px-4 pt-6 pb-2">
              <h1 className="text-xl font-bold text-gray-900">Matches</h1>
              <button className="flex items-center gap-1 text-sm font-medium text-gray-600">
                Filter
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
          )}

          {/* Mobile: Date Navigation - Full Width (hidden on live tab) */}
          {activeTab !== 'live' && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getTime() - 86400000))}
                className="p-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-gray-900">
                {formatDate(currentDate)}
              </span>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getTime() + 86400000))}
                className="p-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getTime() - 86400000))}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
                      {formatDate(currentDate)}
                    </span>
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getTime() + 86400000))}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>

                  {/* Calendar */}
                  <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </button>
                </>
              )}

              {/* Filter */}
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700">
                Filter
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
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
