import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SmartCombo } from '@/components/SmartCombo';
import { useLeagues, useLeaguePlayerRankings } from '@/hooks/useLeagues';
import { useLeagueCurrent, useLeagueStandings, useLeagueFixtures } from '@/hooks/useLeagueStandings';
import { LeagueStandingTeam, LeagueSeason, LeaguePlayerRanking } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// Match card component for league fixtures
function LeagueMatchCard({ fixture, leagueName }: { fixture: any; leagueName?: string }) {
  const navigate = useNavigate();
  const match = fixture.fixture;

  const getDateTimeDisplay = () => {
    if (!match.starting_at) return 'TBD';
    const matchDate = new Date(match.starting_at);
    const today = new Date();
    const isToday =
      matchDate.getDate() === today.getDate() &&
      matchDate.getMonth() === today.getMonth() &&
      matchDate.getFullYear() === today.getFullYear();
    const time = matchDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today, ${time}`;
    const dayName = matchDate.toLocaleDateString('en-GB', { weekday: 'short' });
    const dayNum = matchDate.getDate();
    return `${dayName} ${dayNum}, ${time}`;
  };

  return (
    <div
      onClick={() => navigate(`/match/${match.fixture_id}`)}
      className="bg-white rounded-xl p-4 transition-shadow cursor-pointer"
      style={{ boxShadow: '0 0 12px rgba(0, 0, 0, 0.08)' }}
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

// Skeleton card for loading state
function SkeletonMatchCard() {
  return (
    <div className="bg-white rounded-xl p-4 animate-pulse">
      <div className="flex justify-center mb-1">
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
      <div className="flex justify-center mb-4">
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-1" />
          <div className="h-3 bg-gray-200 rounded w-8" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-px bg-gray-200" />
          <div className="h-3 bg-gray-200 rounded w-4" />
          <div className="w-8 h-px bg-gray-200" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-1" />
          <div className="h-3 bg-gray-200 rounded w-8" />
        </div>
      </div>
      <div className="flex justify-center">
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
}

// Player ranking card component
function PlayerRankingCard({
  title,
  players,
  isLoading,
}: {
  title: string;
  players: LeaguePlayerRanking[];
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
          <span className="text-xs text-gray-400">i</span>
        </div>
      </div>
      <div className="space-y-2">
        {isLoading ? (
          // Loading skeleton
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
              <div className="w-4 h-4 bg-gray-100 rounded text-xs flex items-center justify-center text-gray-400">{i}</div>
              <div className="w-7 h-7 bg-gray-100 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-3 bg-gray-100 rounded w-20 mb-1 animate-pulse" />
                <div className="h-2 bg-gray-100 rounded w-14 animate-pulse" />
              </div>
              <div className="h-4 bg-gray-100 rounded w-6 animate-pulse" />
            </div>
          ))
        ) : players.length > 0 ? (
          // Real data
          players.map((player, index) => (
            <div key={player.player_id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
              <div className="w-4 h-4 bg-gray-100 rounded text-xs flex items-center justify-center text-gray-500 font-medium">
                {index + 1}
              </div>
              {player.player_image_url ? (
                <img
                  src={player.player_image_url}
                  alt={player.player_name}
                  className="w-7 h-7 rounded-full object-cover bg-gray-100"
                  onError={(e) => {
                    // Hide broken image and show fallback
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center ${player.player_image_url ? 'hidden' : ''}`}>
                <span className="text-xs text-gray-400">{player.player_name?.charAt(0) || '?'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{player.player_name}</p>
                <div className="flex items-center gap-1">
                  {player.club_image_url && (
                    <img
                      src={player.club_image_url}
                      alt={player.club_name}
                      className="w-3 h-3 object-contain"
                    />
                  )}
                  <p className="text-xs text-gray-500 truncate">{player.club_name}</p>
                </div>
              </div>
              <div className="text-sm font-bold text-[#0d1a67]">
                {Number.isInteger(player.stat_value) ? player.stat_value : player.stat_value.toFixed(1)}
              </div>
            </div>
          ))
        ) : (
          // No data
          <div className="py-4 text-center text-sm text-gray-400">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}

export function LeaguePage() {
  // Auth context
  const { subscriptionStatus } = useAuth();
  // The API returns has_subscription, not has_access - check both for compatibility
  const isPremium = (subscriptionStatus as any)?.has_subscription || subscriptionStatus?.has_access || false;

  // League scroll refs and state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Matches scroll refs and state
  const matchesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollMatchesLeft, setCanScrollMatchesLeft] = useState(false);
  const [canScrollMatchesRight, setCanScrollMatchesRight] = useState(true);

  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);

  // Fetch leagues from API
  const { data: leaguesResponse, isLoading: isLoadingLeagues } = useLeagues();
  const leagues = leaguesResponse?.data?.leagues || [];

  // Fetch current league data (initial load - includes standings and available seasons)
  const { data: leagueCurrentResponse, isLoading: isLoadingCurrent } = useLeagueCurrent(selectedLeagueId);
  const leagueData = leagueCurrentResponse?.data;
  const availableSeasons = leagueData?.available_seasons || [];
  const currentSeason = leagueData?.current_season;

  // Fetch standings for a specific season (when user changes season)
  const isNonCurrentSeason = selectedSeasonId && currentSeason && selectedSeasonId !== currentSeason.season_id;
  const { data: standingsResponse, isLoading: isLoadingStandings } = useLeagueStandings(
    isNonCurrentSeason && selectedLeagueId ? {
      league_id: selectedLeagueId,
      season_id: selectedSeasonId,
    } : null
  );

  // Fetch league fixtures
  const { data: fixturesResponse, isLoading: isLoadingFixtures } = useLeagueFixtures(
    selectedLeagueId && selectedSeasonId ? {
      league_id: selectedLeagueId,
      season_id: selectedSeasonId,
    } : null
  );
  const fixtures = fixturesResponse?.data?.fixtures || [];

  // Fetch player rankings for this league/season
  const { data: playerRankingsResponse, isLoading: isLoadingRankings } = useLeaguePlayerRankings(
    selectedLeagueId && selectedSeasonId ? {
      league_id: selectedLeagueId,
      season_id: selectedSeasonId,
    } : null
  );
  const playerRankings = playerRankingsResponse?.data;

  // Standings filter tab
  const [standingsFilter, setStandingsFilter] = useState<'all' | 'home' | 'away' | 'form'>('all');

  // Use standings from either current response or season-specific response
  // API returns { all: [...], home: [...], away: [...], form: [...] }
  const standingsData = isNonCurrentSeason
    ? standingsResponse?.data?.standings
    : leagueData?.standings;

  // Get the correct standings array based on the selected filter
  const standings = standingsData?.[standingsFilter] || [];
  const isLoadingStandingsData = isNonCurrentSeason ? isLoadingStandings : isLoadingCurrent;

  // Set first league as selected when leagues load
  useEffect(() => {
    if (leagues.length > 0 && selectedLeagueId === null) {
      setSelectedLeagueId(leagues[0].league_id);
    }
  }, [leagues, selectedLeagueId]);

  // Set current season when league data loads
  useEffect(() => {
    if (currentSeason && selectedSeasonId === null) {
      setSelectedSeasonId(currentSeason.season_id);
    }
  }, [currentSeason, selectedSeasonId]);

  // Reset season when league changes
  useEffect(() => {
    if (selectedLeagueId) {
      setSelectedSeasonId(null);
    }
  }, [selectedLeagueId]);

  // Check scroll position to enable/disable arrows
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition();
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [leagues]);

  // Scroll handler for leagues
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Center selected league in carousel on mobile
  const centerSelectedLeague = (leagueId: number) => {
    // Only apply on mobile (< 768px)
    if (window.innerWidth >= 768) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // Small delay to ensure DOM is updated
    setTimeout(() => {
      const button = container.querySelector(`[data-league-id="${leagueId}"]`) as HTMLElement;
      if (!button) return;

      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      // Calculate the offset of button relative to container's scroll position
      const buttonCenter = buttonRect.left + buttonRect.width / 2;
      const containerCenter = containerRect.left + containerRect.width / 2;
      const scrollOffset = buttonCenter - containerCenter;

      container.scrollBy({
        left: scrollOffset,
        behavior: 'smooth',
      });
    }, 10);
  };

  // Check matches scroll position
  const checkMatchesScrollPosition = () => {
    const container = matchesScrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollMatchesLeft(scrollLeft > 0);
    setCanScrollMatchesRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = matchesScrollRef.current;
    if (container) {
      container.addEventListener('scroll', checkMatchesScrollPosition);
      // Initial check and delayed check to ensure layout is complete
      checkMatchesScrollPosition();
      const timeoutId = setTimeout(checkMatchesScrollPosition, 100);
      return () => {
        container.removeEventListener('scroll', checkMatchesScrollPosition);
        clearTimeout(timeoutId);
      };
    }
  }, [fixtures]);

  // Scroll handler for matches
  const scrollMatches = (direction: 'left' | 'right') => {
    const container = matchesScrollRef.current;
    if (!container) return;

    const scrollAmount = 320; // Roughly one card width
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });

    // Check scroll position after animation completes
    setTimeout(() => {
      checkMatchesScrollPosition();
    }, 350);
  };

  const selectedLeague = leagues.find(l => l.league_id === selectedLeagueId);
  const selectedSeasonData = availableSeasons.find(s => s.season_id === selectedSeasonId) || currentSeason;

  return (
    <div className="min-h-screen bg-white">
      <Header currentPage="league" />

      <main className="pb-16">
        {/* League Filter Bar */}
        <div className="bg-white">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="flex items-center gap-4 py-4">
              {/* Left Arrow - Hidden on mobile */}
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`hidden md:flex w-10 h-10 rounded-lg items-center justify-center shrink-0 transition-all border ${
                  canScrollLeft
                    ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    : 'bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {/* Scrollable League Pills */}
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-x-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {isLoadingLeagues ? (
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-36 bg-gray-100 rounded-full animate-pulse shrink-0"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-3">
                    {leagues.map((league) => {
                      const isSelected = league.league_id === selectedLeagueId;
                      return (
                        <button
                          key={league.league_id}
                          data-league-id={league.league_id}
                          onClick={() => {
                            setSelectedLeagueId(league.league_id);
                            centerSelectedLeague(league.league_id);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 shrink-0 transition-all font-medium text-sm rounded-lg ${
                            isSelected
                              ? 'bg-[#0d1a67] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {league.image_path && (
                            <div className="w-6 h-6 bg-white rounded flex items-center justify-center shrink-0">
                              <img
                                src={league.image_path}
                                alt={league.league_name}
                                className="w-5 h-5 object-contain"
                              />
                            </div>
                          )}
                          <span className="whitespace-nowrap">{league.league_name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Arrow - Hidden on mobile */}
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`hidden md:flex w-10 h-10 rounded-lg items-center justify-center shrink-0 transition-all ${
                  canScrollRight
                    ? 'bg-[#0d1a67] text-white hover:bg-[#0a1452]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* League Content Area */}
        <div className="bg-white min-h-[calc(100vh-200px)]">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 pb-6 md:py-6">
            {selectedLeague ? (
              <>
                {/* League Header - Mobile */}
                <div className="md:hidden bg-gray-100 rounded-xl p-4 flex items-center justify-between">
                  {/* Left side - Logo and League Info */}
                  <div className="flex items-center gap-3">
                    {selectedLeague.image_path ? (
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
                        <img
                          src={selectedLeague.image_path}
                          alt={selectedLeague.league_name}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-lg font-bold">
                          {selectedLeague.league_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h1 className="text-base font-bold text-gray-900">
                        {selectedLeague.league_name}
                      </h1>
                      <p className="text-xs text-orange-500">
                        {leagueData?.league?.country_name || 'England'}
                      </p>
                    </div>
                  </div>

                  {/* Right side - Season Dropdown as Pill */}
                  <div className="relative">
                    <button
                      onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>{selectedSeasonData?.season_name || 'Season'}</span>
                      <img src="/arrow-down.svg" alt="Arrow" className="w-[12px] h-auto" />
                    </button>

                    {/* Dropdown Menu */}
                    {isSeasonDropdownOpen && availableSeasons.length > 0 && (
                      <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-10">
                        {/* Current season first */}
                        {currentSeason && (
                          <button
                            onClick={() => {
                              setSelectedSeasonId(currentSeason.season_id);
                              setIsSeasonDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                              selectedSeasonId === currentSeason.season_id
                                ? 'text-[#0d1a67] font-medium'
                                : 'text-gray-700'
                            }`}
                          >
                            {currentSeason.season_name} (Current)
                          </button>
                        )}
                        {/* Past seasons */}
                        {availableSeasons.map((season: LeagueSeason) => (
                          <button
                            key={season.season_id}
                            onClick={() => {
                              setSelectedSeasonId(season.season_id);
                              setIsSeasonDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                              season.season_id === selectedSeasonId
                                ? 'text-[#0d1a67] font-medium'
                                : 'text-gray-700'
                            }`}
                          >
                            {season.season_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* League Header - Desktop */}
                <div className="hidden md:flex items-center justify-between py-2">
                  {/* Left side - Logo and League Info */}
                  <div className="flex items-center gap-4">
                    {selectedLeague.image_path ? (
                      <img
                        src={selectedLeague.image_path}
                        alt={selectedLeague.league_name}
                        className="w-16 h-16 object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-xl font-bold">
                          {selectedLeague.league_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">
                        {selectedLeague.league_name}
                      </h1>
                      <p className="text-sm text-orange-500">
                        {leagueData?.league?.country_name || 'England'}
                      </p>
                    </div>
                  </div>

                  {/* Right side - Season Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <span>{selectedSeasonData?.season_name || 'Select Season'}</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`transition-transform ${isSeasonDropdownOpen ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isSeasonDropdownOpen && availableSeasons.length > 0 && (
                      <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-10">
                        {/* Current season first */}
                        {currentSeason && (
                          <button
                            onClick={() => {
                              setSelectedSeasonId(currentSeason.season_id);
                              setIsSeasonDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                              selectedSeasonId === currentSeason.season_id
                                ? 'text-[#0d1a67] font-medium'
                                : 'text-gray-700'
                            }`}
                          >
                            {currentSeason.season_name} (Current)
                          </button>
                        )}
                        {/* Past seasons */}
                        {availableSeasons.map((season: LeagueSeason) => (
                          <button
                            key={season.season_id}
                            onClick={() => {
                              setSelectedSeasonId(season.season_id);
                              setIsSeasonDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                              season.season_id === selectedSeasonId
                                ? 'text-[#0d1a67] font-medium'
                                : 'text-gray-700'
                            }`}
                          >
                            {season.season_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Matches Section */}
                <div className="mt-4">
                  {/* Header with title and arrows (desktop only) */}
                  <div className="hidden md:flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Matches</h2>
                    {fixtures.length > 0 && (
                      <div className="flex items-center gap-2">
                        {/* Left Arrow */}
                        <button
                          onClick={() => scrollMatches('left')}
                          disabled={!canScrollMatchesLeft}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all border ${
                            canScrollMatchesLeft
                              ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              : 'bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        </button>
                        {/* Right Arrow */}
                        <button
                          onClick={() => scrollMatches('right')}
                          disabled={!canScrollMatchesRight}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                            canScrollMatchesRight
                              ? 'bg-[#0d1a67] text-white hover:bg-[#0a1452]'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {(isLoadingFixtures || !selectedSeasonId) ? (
                    <div className="bg-gray-100 rounded-xl py-4">
                      <div className="flex gap-4 px-4">
                        <SkeletonMatchCard />
                        <SkeletonMatchCard />
                        <SkeletonMatchCard />
                        <SkeletonMatchCard />
                      </div>
                    </div>
                  ) : fixtures.length > 0 ? (
                    <div className="bg-gray-100 rounded-xl">
                      {/* Scrollable Matches */}
                      <div
                        ref={matchesScrollRef}
                        className="overflow-x-auto scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        <div className="flex gap-5 py-4 px-4">
                          {fixtures.map((fixture: any) => (
                            <div key={fixture.fixture.fixture_id} className="w-[280px] shrink-0">
                              <LeagueMatchCard
                                fixture={fixture}
                                leagueName={selectedLeague?.league_name}
                              />
                            </div>
                          ))}
                          {/* Spacer to ensure last card is fully visible */}
                          <div className="w-1 shrink-0" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-xl p-8 text-center">
                      <p className="text-gray-500">No matches found for this league</p>
                    </div>
                  )}
                </div>

                {/* Standings Section */}
                <div className="mt-4">
                  {/* Standings Filter Tabs */}
                  <div className="flex gap-2 mb-4">
                    {(['all', 'home', 'away', 'form'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setStandingsFilter(filter)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          standingsFilter === filter
                            ? 'bg-[#0d1a67] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Standings Table and Smart Combo Row */}
                  <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
                    {/* Left Column - Standings Table */}
                    <div className="flex-1">
                      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                      {isLoadingStandingsData ? (
                        <div className="p-4 animate-pulse">
                          {[...Array(10)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100">
                              <div className="w-6 h-4 bg-gray-200 rounded" />
                              <div className="w-6 h-6 bg-gray-200 rounded-full" />
                              <div className="flex-1 h-4 bg-gray-200 rounded" />
                              <div className="w-8 h-4 bg-gray-200 rounded" />
                              <div className="w-8 h-4 bg-gray-200 rounded" />
                              <div className="w-8 h-4 bg-gray-200 rounded" />
                            </div>
                          ))}
                        </div>
                      ) : standings.length > 0 ? (
                        <>
                          {/* Mobile Standings Table - Simplified */}
                          <div className="md:hidden overflow-hidden">
                            <table className="w-full table-fixed">
                              <colgroup>
                                <col style={{ width: '12%' }} />
                                <col style={{ width: '46%' }} />
                                <col style={{ width: '14%' }} />
                                <col style={{ width: '14%' }} />
                                <col style={{ width: '14%' }} />
                              </colgroup>
                              <thead className="bg-[#0d1a67] text-white text-xs">
                                <tr>
                                  <th className="py-2 px-2 text-left font-medium">#</th>
                                  <th className="py-2 px-2 text-left font-medium">Team</th>
                                  <th className="py-2 px-2 text-center font-medium">MP</th>
                                  <th className="py-2 px-2 text-center font-medium">GD</th>
                                  <th className="py-2 px-2 text-center font-medium">PTS</th>
                                </tr>
                              </thead>
                              <LayoutGroup>
                                <tbody>
                                  <AnimatePresence mode="popLayout">
                                    {standings.map((team: LeagueStandingTeam) => (
                                      <motion.tr
                                        key={team.team.team_id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{
                                          layout: { type: "spring", stiffness: 350, damping: 30 },
                                          opacity: { duration: 0.2 }
                                        }}
                                        className="border-b border-gray-100"
                                      >
                                        <td className="py-2 px-2 text-xs font-medium text-gray-900">{team.position}</td>
                                        <td className="py-2 px-2">
                                          <div className="flex items-center gap-1.5">
                                            {team.team.team_logo ? (
                                              <img src={team.team.team_logo} alt={team.team.team_name} className="w-4 h-4 object-contain" />
                                            ) : (
                                              <div className="w-4 h-4 bg-gray-200 rounded-full" />
                                            )}
                                            <span className="text-xs font-medium text-gray-900">{team.team.team_name}</span>
                                          </div>
                                        </td>
                                        <td className="py-2 px-2 text-center text-xs text-gray-600">{team.matches_played}</td>
                                        <td className="py-2 px-2 text-center text-xs text-gray-600">
                                          {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                                        </td>
                                        <td className="py-2 px-2 text-center text-xs font-bold text-gray-900">{team.points}</td>
                                      </motion.tr>
                                    ))}
                                  </AnimatePresence>
                                </tbody>
                              </LayoutGroup>
                            </table>
                          </div>

                          {/* Desktop Standings Table - Full */}
                          <div className="hidden md:block overflow-hidden">
                            <table className="w-full table-fixed">
                              <colgroup>
                                <col style={{ width: '5%' }} />
                                <col style={{ width: '25%' }} />
                                <col style={{ width: '7%' }} />
                                <col style={{ width: '7%' }} />
                                <col style={{ width: '7%' }} />
                                <col style={{ width: '7%' }} />
                                <col style={{ width: '7%' }} />
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '18%' }} />
                                <col style={{ width: '9%' }} />
                              </colgroup>
                              <thead className="bg-[#0d1a67] text-white text-sm">
                                <tr>
                                  <th className="py-3 px-4 text-left font-medium">#</th>
                                  <th className="py-3 px-4 text-left font-medium">Team</th>
                                  <th className="py-3 px-2 text-center font-medium">MP</th>
                                  <th className="py-3 px-2 text-center font-medium">W</th>
                                  <th className="py-3 px-2 text-center font-medium">D</th>
                                  <th className="py-3 px-2 text-center font-medium">L</th>
                                  <th className="py-3 px-2 text-center font-medium">GD</th>
                                  <th className="py-3 px-2 text-center font-medium">PTS</th>
                                  <th className="py-3 px-4 text-center font-medium">Form</th>
                                  <th className="py-3 px-4 text-center font-medium">Next</th>
                                </tr>
                              </thead>
                              <LayoutGroup>
                                <tbody>
                                  <AnimatePresence mode="popLayout">
                                    {standings.map((team: LeagueStandingTeam) => (
                                      <motion.tr
                                        key={team.team.team_id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{
                                          layout: { type: "spring", stiffness: 350, damping: 30 },
                                          opacity: { duration: 0.2 }
                                        }}
                                        className="border-b border-gray-100 hover:bg-gray-50"
                                      >
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{team.position}</td>
                                        <td className="py-3 px-4">
                                          <div className="flex items-center gap-2">
                                            {team.team.team_logo ? (
                                              <img src={team.team.team_logo} alt={team.team.team_name} className="w-6 h-6 object-contain" />
                                            ) : (
                                              <div className="w-6 h-6 bg-gray-200 rounded-full" />
                                            )}
                                            <span className="text-sm font-medium text-gray-900">{team.team.team_name}</span>
                                          </div>
                                        </td>
                                        <td className="py-3 px-2 text-center text-sm text-gray-600">{team.matches_played}</td>
                                        <td className="py-3 px-2 text-center text-sm text-gray-600">{team.wins}</td>
                                        <td className="py-3 px-2 text-center text-sm text-gray-600">{team.draws}</td>
                                        <td className="py-3 px-2 text-center text-sm text-gray-600">{team.losses}</td>
                                        <td className="py-3 px-2 text-center text-sm text-gray-600">
                                          {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                                        </td>
                                        <td className="py-3 px-2 text-center text-sm font-bold text-gray-900">{team.points}</td>
                                        <td className="py-3 px-4">
                                          <div className="flex items-center justify-start gap-1 w-[124px]">
                                            {team.form && team.form.length > 0 ? (
                                              team.form.slice(0, 5).map((result, i) => (
                                                <span
                                                  key={i}
                                                  className={`w-5 h-5 rounded text-xs font-bold flex items-center justify-center ${
                                                    result === 'W' ? 'bg-green-500 text-white' :
                                                    result === 'D' ? 'bg-yellow-500 text-white' :
                                                    'bg-red-500 text-white'
                                                  }`}
                                                >
                                                  {result}
                                                </span>
                                              ))
                                            ) : (
                                              <span className="text-sm text-gray-400">-</span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          {team.next_fixture?.opponent_logo ? (
                                            <img
                                              src={team.next_fixture.opponent_logo}
                                              alt="Next opponent"
                                              className="w-6 h-6 object-contain mx-auto"
                                            />
                                          ) : (
                                            <span className="text-sm text-gray-400">-</span>
                                          )}
                                        </td>
                                      </motion.tr>
                                    ))}
                                  </AnimatePresence>
                                </tbody>
                              </LayoutGroup>
                            </table>
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          No standings data available
                        </div>
                      )}
                      </div>
                    </div>

                    {/* Right Column - Smart Combo */}
                    <div className="lg:w-[460px] shrink-0">
                      <SmartCombo isPremium={isPremium} />
                    </div>
                  </div>
                </div>

                {/* Top Players Statistics Section */}
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Top Players</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Top Scorers */}
                    <PlayerRankingCard
                      title="Top Scorers"
                      players={playerRankings?.top_scorers || []}
                      isLoading={isLoadingRankings}
                    />

                    {/* Best Defensive */}
                    <PlayerRankingCard
                      title="Best Defensive"
                      players={playerRankings?.best_defensive || []}
                      isLoading={isLoadingRankings}
                    />

                    {/* Most Aggressive */}
                    <PlayerRankingCard
                      title="Most Aggressive"
                      players={playerRankings?.most_aggressive || []}
                      isLoading={isLoadingRankings}
                    />

                    {/* Top Playmaker */}
                    <PlayerRankingCard
                      title="Top Playmaker"
                      players={playerRankings?.top_playmaker || []}
                      isLoading={isLoadingRankings}
                    />
                  </div>
                </div>
              </>
            ) : isLoadingLeagues ? (
              /* Loading skeleton while leagues are being fetched */
              <>
                {/* League Header Skeleton - Mobile */}
                <div className="md:hidden bg-gray-100 rounded-xl p-4 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded-lg w-24" />
                </div>

                {/* League Header Skeleton - Desktop */}
                <div className="hidden md:flex items-center justify-between py-2 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full" />
                    <div>
                      <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-20" />
                    </div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-28" />
                </div>

                {/* Matches Section Skeleton */}
                <div className="mt-6">
                  <div className="hidden md:flex items-center justify-between mb-4">
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
                  </div>
                  <div className="bg-gray-100 rounded-xl">
                    <div className="flex gap-4 px-4 py-4">
                      <SkeletonMatchCard />
                      <SkeletonMatchCard />
                      <SkeletonMatchCard />
                      <SkeletonMatchCard />
                    </div>
                  </div>
                </div>

                {/* Standings Section Skeleton */}
                <div className="mt-8">
                  <div className="hidden md:flex items-center justify-between mb-4">
                    <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 py-2">
                          <div className="w-6 h-4 bg-gray-100 rounded" />
                          <div className="w-8 h-8 bg-gray-100 rounded-full" />
                          <div className="h-4 bg-gray-100 rounded w-32" />
                          <div className="flex-1" />
                          <div className="h-4 bg-gray-100 rounded w-8" />
                          <div className="h-4 bg-gray-100 rounded w-8" />
                          <div className="h-4 bg-gray-100 rounded w-8" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a league to view details
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
