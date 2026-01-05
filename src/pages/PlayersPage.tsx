import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { usePlayersWatchlist, useMultiplePlayerDetails } from '@/hooks/usePlayers';

// Skeleton card for loading state
function SkeletonPlayerCard() {
  return (
    <div className="bg-white rounded-xl p-4 min-w-[200px] md:min-w-0 animate-pulse">
      {/* Player Image */}
      <div className="flex justify-center mb-3">
        <div className="w-16 h-16 bg-gray-200 rounded-full" />
      </div>

      {/* Player Name */}
      <div className="flex justify-center mb-1">
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>

      {/* Position */}
      <div className="flex justify-center mb-3">
        <div className="h-3 bg-gray-200 rounded w-16" />
      </div>

      {/* View Profile */}
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
          <SkeletonPlayerCard />
          <SkeletonPlayerCard />
          <SkeletonPlayerCard />
        </div>
      </div>
    </div>
  );
}

// League Section with arrow navigation for desktop
function LeagueSection({
  league,
}: {
  league: {
    leagueName: string;
    country: string;
    logo?: string;
    players: any[];
  };
}) {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 4;
  const totalPlayers = league.players.length;
  const canGoLeft = startIndex > 0;
  const canGoRight = startIndex + itemsPerPage < totalPlayers;

  const handlePrev = () => {
    if (canGoLeft) {
      setStartIndex(Math.max(0, startIndex - itemsPerPage));
    }
  };

  const handleNext = () => {
    if (canGoRight) {
      setStartIndex(startIndex + itemsPerPage);
    }
  };

  const visiblePlayers = league.players.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {/* League/Team Header with arrows */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {league.logo ? (
            <img src={league.logo} alt={league.leagueName} className="w-8 h-8 object-contain" />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
          )}
          <div>
            <h2 className="text-lg font-bold text-gray-900">{league.leagueName}</h2>
            {league.country && <p className="text-sm text-gray-500">{league.country}</p>}
          </div>
        </div>

        {/* Navigation Arrows - only show if more than 4 players */}
        {totalPlayers > itemsPerPage && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={!canGoLeft}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                canGoLeft
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={!canGoRight}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                canGoRight
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Players Grid */}
      <div className="bg-gray-100 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visiblePlayers.map((player) => (
            <PlayerCard key={player.player_id} player={player} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Player Card component
function PlayerCard({
  player,
}: {
  player: {
    player_id: number;
    display_name?: string;
    common_name?: string;
    player_name?: string;
    image_path?: string;
    position_name?: string;
    team_name?: string;
    team_logo?: string;
  };
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/player/${player.player_id}`);
  };

  const playerName = player.display_name || player.common_name || player.player_name || 'Unknown Player';

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl p-4 transition-shadow min-w-[200px] md:min-w-0 cursor-pointer"
      style={{
        boxShadow: '0 0 12px rgba(0, 0, 0, 0.08)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.12)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 0, 0, 0.08)')}
    >
      {/* Player Image */}
      <div className="flex justify-center mb-3">
        {player.image_path ? (
          <img
            src={player.image_path}
            alt={playerName}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-bold">
              {playerName.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Player Name */}
      <div className="text-center text-gray-900 text-sm font-semibold mb-1 truncate">
        {playerName}
      </div>

      {/* Position */}
      <div className="text-center text-gray-500 text-xs font-medium mb-1">
        {player.position_name || 'Player'}
      </div>

      {/* Team */}
      {player.team_name && (
        <div className="flex items-center justify-center gap-1 mb-3">
          {player.team_logo && (
            <img src={player.team_logo} alt={player.team_name} className="w-4 h-4 object-contain" />
          )}
          <span className="text-gray-400 text-xs">{player.team_name}</span>
        </div>
      )}

      {/* View Profile */}
      <button className="w-full text-center text-[#0d1a67] text-sm font-semibold hover:underline">
        View Profile
      </button>
    </div>
  );
}

// Mobile Bottom Navigation
function MobileBottomNav({ activeTab }: { activeTab: string }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const hasNoScroll = documentHeight <= windowHeight + 10;
      const isAtBottom = scrollTop + windowHeight >= documentHeight - 50;
      setIsVisible(hasNoScroll || isAtBottom);
    };

    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);

    checkVisibility();
    const timeoutId = setTimeout(checkVisibility, 100);
    const timeoutId2 = setTimeout(checkVisibility, 500);

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
    { id: 'players', label: 'Players', path: '/players' },
    { id: 'login', label: 'Login', path: '/login' },
  ];

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 bg-[#0d1a67] transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <div className="flex items-center justify-center gap-8 py-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`text-sm font-medium ${activeTab === tab.id ? 'text-white' : 'text-white/60'}`}
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

export function PlayersPage() {
  // Fetch players from watchlist
  const { data: watchlistResponse, isLoading: isLoadingWatchlist } = usePlayersWatchlist();

  // Get player IDs from watchlist - watchlist entries have player_ids array
  const playerIds = useMemo(() => {
    const watchlistEntries = watchlistResponse?.data?.watchlist || [];
    // Flatten all player_ids from all watchlist entries
    const allPlayerIds = watchlistEntries.flatMap((entry: any) => entry.player_ids || []);
    // Remove duplicates and filter valid IDs
    return [...new Set(allPlayerIds)].filter((id: number) => id > 0);
  }, [watchlistResponse]);

  // Fetch player details
  const playerDetailsQueries = useMultiplePlayerDetails(playerIds);

  const isLoading = isLoadingWatchlist || playerDetailsQueries.some((q) => q.isLoading);

  // Group players by league/team
  const playersByLeague = useMemo(() => {
    const byLeague: Record<
      string,
      {
        leagueName: string;
        country: string;
        logo?: string;
        players: any[];
      }
    > = {};

    // Iterate through player IDs and their corresponding details
    playerIds.forEach((playerId: number, index: number) => {
      const playerDetail = playerDetailsQueries[index]?.data?.data?.player as any;

      // Skip if we don't have player details yet
      if (!playerDetail) return;

      // Get team/league info from player details
      const teamName =
        playerDetail?.team?.team_name ||
        playerDetail?.current_team?.team_name ||
        'Unknown Team';
      const teamLogo =
        playerDetail?.team?.image_path || playerDetail?.current_team?.image_path;
      const leagueId = playerDetail?.team?.team_id || playerDetail?.current_team?.team_id || 'unknown';

      if (!byLeague[leagueId]) {
        byLeague[leagueId] = {
          leagueName: teamName,
          country: playerDetail?.nationality?.name || playerDetail?.country?.name || '',
          logo: teamLogo,
          players: [],
        };
      }

      byLeague[leagueId].players.push({
        player_id: playerId,
        display_name: playerDetail?.display_name,
        common_name: playerDetail?.common_name,
        player_name: playerDetail?.player_name,
        image_path: playerDetail?.image_path,
        position_name: playerDetail?.position?.name,
        team_name: teamName,
        team_logo: teamLogo,
      });
    });

    return byLeague;
  }, [playerIds, playerDetailsQueries]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentPage="players" />

      <main className="flex-1 pb-32 md:pb-0">
        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 pt-6 pb-4">
            <h1 className="text-xl font-bold text-gray-900">Players</h1>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700">
              Filter
              <img src="/arrow-down.svg" alt="Arrow" className="w-[15px] h-auto" />
            </button>
          </div>

          {/* Mobile: Loading Skeleton */}
          {isLoading && (
            <div className="py-4 space-y-6">
              <SkeletonLeagueSection />
              <SkeletonLeagueSection />
              <SkeletonLeagueSection />
            </div>
          )}

          {/* Mobile: Players by Team/League */}
          {!isLoading && (
            <div className="py-4 space-y-6">
              {Object.entries(playersByLeague).map(([leagueId, league]) => (
                <div key={leagueId}>
                  {/* League/Team Header */}
                  <div className="flex items-center gap-3 px-4 mb-3">
                    {league.logo ? (
                      <img src={league.logo} alt={league.leagueName} className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    )}
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{league.leagueName}</h2>
                      {league.country && <p className="text-xs text-gray-500">{league.country}</p>}
                    </div>
                  </div>

                  {/* Horizontal Scrollable Cards */}
                  <div className="mx-4 bg-gray-100 rounded-xl p-3">
                    <div className="overflow-x-auto scrollbar-hide">
                      <div className="flex gap-3">
                        {league.players.map((player) => (
                          <PlayerCard key={player.player_id} player={player} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {Object.keys(playersByLeague).length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] mx-4 bg-white rounded-xl border border-gray-200">
                  <img src="/404.svg" alt="No players" className="w-24 h-24 mb-4 opacity-60" />
                  <p className="text-gray-500 font-medium">No players found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block max-w-[1400px] mx-auto px-6 py-6">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Players to Watch</h1>

            {/* Filter */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700">
              Filter
              <img src="/arrow-down.svg" alt="Arrow" className="w-[15px] h-auto" />
            </button>
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
                  <div className="bg-gray-100 rounded-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <SkeletonPlayerCard />
                      <SkeletonPlayerCard />
                      <SkeletonPlayerCard />
                      <SkeletonPlayerCard />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Players Grouped by Team/League */}
          {!isLoading && (
            <div className="space-y-8">
              {Object.entries(playersByLeague).map(([leagueId, league]) => (
                <LeagueSection key={leagueId} league={league} />
              ))}

              {Object.keys(playersByLeague).length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] bg-white rounded-xl border border-gray-200">
                  <img src="/404.svg" alt="No players" className="w-32 h-32 mb-6 opacity-60" />
                  <p className="text-gray-500 font-medium text-lg">No players found</p>
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
      <MobileBottomNav activeTab="players" />
    </div>
  );
}
