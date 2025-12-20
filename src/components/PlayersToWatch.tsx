import { useState, useRef, useMemo } from 'react';
import { usePlayersWatchlist, useMultiplePlayerStatistics, useMultiplePlayerDetails } from '@/hooks/usePlayers';
import { ApiDebugInfo } from '@/components/ApiDebugInfo';
import { PlayerStatisticsResponse } from '@/services/api';

interface PlayerCardProps {
  player: {
    player_id: number;
    position_id?: number;
    position_name?: string;
    goals?: number;
    assists?: number;
    appearances?: number;
    minutes_played?: number;
    player_name?: string;
    team_id?: number;
    team_name?: string;
    country_name?: string;
    image_path?: string;
  };
  onViewProfile?: (playerId: number) => void;
  variant?: 'default' | 'mobile';
}

// Map position IDs to display names (fallback if API doesn't provide name)
const getPositionName = (positionName?: string, positionId?: number): string => {
  if (positionName) return positionName;
  const positions: Record<number, string> = {
    24: 'Goalkeeper',
    25: 'Defender',
    26: 'Midfielder',
    27: 'Forward',
  };
  return positions[positionId || 0] || 'Player';
};

// Get player name - use provided name or show ID
const getPlayerName = (playerId: number, name?: string): string => {
  if (name) return name;
  return `Player #${playerId}`;
};

function PlayerCard({ player, onViewProfile, variant = 'default' }: PlayerCardProps) {
  const positionName = getPositionName(player.position_name, player.position_id);
  // Use team_name if available, otherwise show team_id
  const teamDisplay = player.team_name || (player.team_id ? `Team ${player.team_id}` : undefined);
  const playerName = getPlayerName(player.player_id, player.player_name);

  // Mobile variant - 335x303px card per Figma specs
  if (variant === 'mobile') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 w-[335px] h-[303px] mx-auto shadow-sm flex flex-col">
        {/* Player Image */}
        <div className="flex justify-center mb-4">
          {player.image_path ? (
            <img
              src={player.image_path}
              alt={playerName}
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 shadow-sm"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-gray-100 shadow-sm">
              <span className="text-3xl font-bold text-white">
                {playerName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Player Name */}
        <h3 className="text-center font-bold text-gray-900 text-xl mb-2">
          {playerName}
        </h3>

        {/* Position with Club & Country */}
        <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-500">
          <span className="font-medium text-[#0d1a67]">{positionName}</span>
          {teamDisplay && (
            <>
              <span className="text-gray-300">|</span>
              <span className="font-medium text-gray-600">{teamDisplay.slice(0, 3).toUpperCase()}</span>
            </>
          )}
          {player.country_name && (
            <>
              <span className="text-gray-300">|</span>
              <span className="font-medium text-gray-600">{player.country_name}</span>
            </>
          )}
        </div>

        {/* Stats Row - 295x59px container, 10px gap, each box 66.25x59px with grey bg */}
        <div className="flex items-center gap-[10px] w-[295px] h-[59px] mx-auto mb-6">
          <div
            className="w-[66.25px] h-[59px] bg-[#f7f8fa] rounded-[8px] p-[6px] flex flex-col items-center justify-center gap-[4px]"
          >
            <div
              className="text-[16px] font-semibold text-[#0a0a0a]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {player.goals ?? 0}
            </div>
            <div
              className="text-[14px] font-medium text-[#7c8a9c]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Goals
            </div>
          </div>
          <div
            className="w-[66.25px] h-[59px] bg-[#f7f8fa] rounded-[8px] p-[6px] flex flex-col items-center justify-center gap-[4px]"
          >
            <div
              className="text-[16px] font-semibold text-[#0a0a0a]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {player.assists ?? 0}
            </div>
            <div
              className="text-[14px] font-medium text-[#7c8a9c]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Assists
            </div>
          </div>
          <div
            className="w-[66.25px] h-[59px] bg-[#f7f8fa] rounded-[8px] p-[6px] flex flex-col items-center justify-center gap-[4px]"
          >
            <div
              className="text-[16px] font-semibold text-[#0a0a0a]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {player.appearances ?? 0}
            </div>
            <div
              className="text-[14px] font-medium text-[#7c8a9c]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Matches
            </div>
          </div>
          <div
            className="w-[66.25px] h-[59px] bg-[#f7f8fa] rounded-[8px] p-[6px] flex flex-col items-center justify-center gap-[4px]"
          >
            <div
              className="text-[16px] font-semibold text-[#0a0a0a]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {player.minutes_played?.toLocaleString() ?? '-'}
            </div>
            <div
              className="text-[14px] font-medium text-[#7c8a9c]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Minutes
            </div>
          </div>
        </div>

        {/* View Profile Link */}
        <button
          onClick={() => onViewProfile?.(player.player_id)}
          className="w-full text-center text-[#0d1a67] text-base font-semibold hover:text-[#0d1a67]/80 transition-colors py-2"
        >
          View Profile
        </button>
      </div>
    );
  }

  // Default variant - compact card for desktop (335x302px)
  return (
    <div className="bg-white rounded-2xl border border-gray-200 w-[335px] h-[302px] shrink-0 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center pt-4">
      {/* Top section: Photo, Name, Position/Team/Country - 224x142px box */}
      <div className="w-[224px] h-[142px] flex flex-col items-center">
        {/* Player Image - 80x80px */}
        <div className="mb-2">
          {player.image_path ? (
            <img
              src={player.image_path}
              alt={playerName}
              className="w-[80px] h-[80px] rounded-full object-cover border-4 border-gray-100 shadow-sm"
            />
          ) : (
            <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-gray-100 shadow-sm">
              <span className="text-2xl font-bold text-white">
                {playerName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Player Name - 18px Semibold Montserrat */}
        <h3
          className="text-center font-semibold text-gray-900 text-[18px] mb-1"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {playerName}
        </h3>

        {/* Position with Club & Country - only show items that have values */}
        <div className="flex items-center justify-center gap-1.5 text-[13px]">
          <span className="font-medium text-[#0d1a67]">{positionName}</span>
          {teamDisplay && teamDisplay !== 'Unknown' && (
            <>
              <span className="text-gray-300">|</span>
              <span className="font-medium text-gray-600">{teamDisplay.slice(0, 3).toUpperCase()}</span>
            </>
          )}
          {player.country_name && player.country_name !== 'Unknown' && (
            <>
              <span className="text-gray-300">|</span>
              <span className="font-medium text-gray-600">{player.country_name}</span>
            </>
          )}
        </div>
      </div>

      {/* Stats Row - Each stat in its own grey box */}
      <div className="flex items-center gap-2 px-4 mt-3 w-full">
        <div className="flex-1 bg-gray-100 rounded-xl py-2.5 text-center">
          <div className="text-[18px] font-bold text-gray-900">{player.goals ?? 0}</div>
          <div className="text-[11px] text-gray-400">Goals</div>
        </div>
        <div className="flex-1 bg-gray-100 rounded-xl py-2.5 text-center">
          <div className="text-[18px] font-bold text-gray-900">{player.assists ?? 0}</div>
          <div className="text-[11px] text-gray-400">Assists</div>
        </div>
        <div className="flex-1 bg-gray-100 rounded-xl py-2.5 text-center">
          <div className="text-[18px] font-bold text-gray-900">{player.appearances ?? 0}</div>
          <div className="text-[11px] text-gray-400">Matches</div>
        </div>
        <div className="flex-1 bg-gray-100 rounded-xl py-2.5 text-center">
          <div className="text-[18px] font-bold text-gray-900">{player.minutes_played?.toLocaleString() ?? '-'}</div>
          <div className="text-[11px] text-gray-400">Minutes</div>
        </div>
      </div>

      {/* View Profile Link */}
      <button
        onClick={() => onViewProfile?.(player.player_id)}
        className="w-full text-center text-[#0d1a67] text-[14px] font-semibold hover:text-[#0d1a67]/80 transition-colors py-3 mt-auto"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        View Profile
      </button>
    </div>
  );
}

export function PlayersToWatch() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [mobileIndex, setMobileIndex] = useState(0);

  // Step 1: Fetch watchlist to get player IDs
  const {
    data: watchlistResponse,
    isLoading: isLoadingWatchlist,
    error: watchlistError
  } = usePlayersWatchlist();

  // Extract player IDs from watchlist
  const playerIds = useMemo(() => {
    const watchlist = watchlistResponse?.data?.watchlist || [];
    if (watchlist.length === 0) return [];
    const latestEntry = watchlist[0];
    return latestEntry?.player_ids || [];
  }, [watchlistResponse]);

  // Step 2: Fetch player details (name, image, team, nationality) from /players/player endpoint
  const playerDetailsQueries = useMultiplePlayerDetails(playerIds);

  // Step 3: Fetch statistics for each player
  const playerStatsQueries = useMultiplePlayerStatistics(playerIds);

  // Check if any queries are still loading
  const isLoadingDetails = playerDetailsQueries.some((q) => q.isLoading);
  const isLoadingStats = playerStatsQueries.some((q) => q.isLoading);

  // Transform and merge player data from both endpoints
  const players = useMemo(() => {
    return playerIds
      .map((playerId, index) => {
        const detailsQuery = playerDetailsQueries[index];
        const statsQuery = playerStatsQueries[index];

        const playerData = detailsQuery?.data?.data?.player;
        const statsData = statsQuery?.data?.data as PlayerStatisticsResponse | undefined;

        // If we have neither details nor stats, skip this player
        if (!playerData && !statsData) return null;

        // Get nationality name from the nested object
        const nationalityName = playerData?.nationality?.name || playerData?.country?.name;

        // Get position from nested object or position_id
        const positionId = playerData?.position?.id || playerData?.position_id || statsData?.position_id;
        const positionName = playerData?.position?.name;

        // Get team info - team_id is available, team_name might not be
        const teamId = playerData?.current_team?.team_id;
        const teamName = playerData?.team_name;

        return {
          player_id: playerId,
          position_id: positionId,
          position_name: positionName,
          // Player details from /players/player endpoint
          player_name: playerData?.display_name || playerData?.common_name || playerData?.player_name,
          image_path: playerData?.image_path,
          team_id: teamId,
          team_name: teamName,
          country_name: nationalityName,
          // Statistics from /players/statistics endpoint
          goals: statsData?.statistics?.attacking?.goals || 0,
          assists: statsData?.statistics?.attacking?.assists || 0,
          appearances: statsData?.statistics?.appearances?.appearances || 0,
          minutes_played: statsData?.statistics?.appearances?.minutes_played || 0,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [playerDetailsQueries, playerStatsQueries, playerIds]);

  const isLoading = isLoadingWatchlist || isLoadingDetails || isLoadingStats;
  const error = watchlistError;

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 220;
      const newScrollLeft =
        direction === 'left'
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });

      setTimeout(updateScrollButtons, 300);
    }
  };

  const scrollMobile = (direction: 'left' | 'right') => {
    if (direction === 'left' && mobileIndex > 0) {
      setMobileIndex(mobileIndex - 1);
    } else if (direction === 'right' && mobileIndex < players.length - 1) {
      setMobileIndex(mobileIndex + 1);
    }
  };

  const handleViewProfile = (playerId: number) => {
    console.log('View profile for player:', playerId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className="w-full max-w-[100vw] h-[381px] md:w-[1440px] md:h-[397px] md:mx-auto md:rounded-2xl overflow-hidden box-border"
        style={{ background: 'linear-gradient(to top right, #091143 65%, #11207f 100%)' }}
      >
        <div className="px-4 pt-[16px] md:pt-2 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/players-star-icon.png" alt="" className="w-[26px] h-[26px] md:w-6 md:h-6" />
              <h2
                className="text-white font-semibold text-[22px] md:text-lg md:font-bold"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Players to Watch
              </h2>
            </div>
            <div className="hidden md:block text-white">
              <ApiDebugInfo
                endpoint="/api/v1/players/watchlist + /api/v1/players/statistics"
                response={null}
                isLoading={true}
              />
            </div>
            {/* Mobile arrow placeholder */}
            <div className="md:hidden flex items-center gap-[10px] w-[70px] h-[30px]">
              <div className="w-[30px] h-[30px] rounded-lg bg-transparent border-2 border-white/50" />
              <div className="w-[30px] h-[30px] rounded-lg bg-transparent border-2 border-white/50" />
            </div>
          </div>
        </div>
        {/* Mobile Loading - 335x303px card */}
        <div className="md:hidden pt-[15px] pb-[16px] flex justify-center">
          <div className="bg-white rounded-2xl w-[335px] h-[303px] animate-pulse flex flex-col items-center pt-4">
            <div className="w-28 h-28 rounded-full bg-gray-200 mb-4" />
            <div className="h-6 bg-gray-200 rounded w-40 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-48 mb-6" />
            <div className="flex gap-3 w-full px-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-1 border border-gray-200 rounded-xl py-3">
                  <div className="h-6 bg-gray-200 rounded mx-auto w-8 mb-1" />
                  <div className="h-3 bg-gray-200 rounded mx-auto w-12" />
                </div>
              ))}
            </div>
            <div className="h-5 bg-gray-200 rounded w-24" />
          </div>
        </div>
        {/* Desktop Loading */}
        <div className="hidden md:block px-[20px] py-[20px]">
          <div className="flex gap-[20px]">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 p-4 w-[335px] h-[302px] shrink-0 animate-pulse shadow-sm"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200" />
                </div>
                <div className="h-5 bg-gray-200 rounded mx-auto w-28 mb-2" />
                <div className="h-3 bg-gray-200 rounded mx-auto w-32 mb-4" />
                <div className="flex items-center justify-between mb-4 px-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex-1 text-center">
                      <div className="h-5 bg-gray-200 rounded mb-1 mx-auto w-8" />
                      <div className="h-2 bg-gray-200 rounded mx-auto w-10" />
                    </div>
                  ))}
                </div>
                <div className="h-8 bg-gray-200 rounded mx-auto w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="w-full max-w-[100vw] h-[381px] md:w-[1440px] md:h-[397px] md:mx-auto md:rounded-2xl overflow-hidden box-border"
        style={{ background: 'linear-gradient(to top right, #091143 65%, #11207f 100%)' }}
      >
        <div className="px-4 pt-[16px] md:pt-2 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/players-star-icon.png" alt="" className="w-[26px] h-[26px] md:w-6 md:h-6" />
              <h2
                className="text-white font-semibold text-[22px] md:text-lg md:font-bold"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Players to Watch
              </h2>
            </div>
            <div className="hidden md:block text-white">
              <ApiDebugInfo
                endpoint="/api/v1/players/watchlist + /api/v1/players/statistics"
                response={watchlistResponse?.data}
                error={error?.message}
              />
            </div>
          </div>
        </div>
        <div className="px-4 py-6 text-center">
          <div className="text-red-400 mb-2">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-white font-medium">Failed to load players</p>
          <p className="text-white/70 text-sm mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (players.length === 0) {
    return (
      <div
        className="w-full max-w-[100vw] h-[381px] md:w-[1440px] md:h-[397px] md:mx-auto md:rounded-2xl overflow-hidden box-border"
        style={{ background: 'linear-gradient(to top right, #091143 65%, #11207f 100%)' }}
      >
        <div className="px-4 pt-[16px] md:pt-2 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/players-star-icon.png" alt="" className="w-[26px] h-[26px] md:w-6 md:h-6" />
              <h2
                className="text-white font-semibold text-[22px] md:text-lg md:font-bold"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Players to Watch
              </h2>
            </div>
            <div className="hidden md:block text-white">
              <ApiDebugInfo
                endpoint="/api/v1/players/watchlist + /api/v1/players/statistics"
                response={watchlistResponse?.data}
              />
            </div>
          </div>
        </div>
        <div className="px-4 py-6 text-center">
          <div className="text-white/50 mb-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-white font-medium">No players to watch</p>
          <p className="text-white/70 text-sm mt-1">
            Check back later for player recommendations
          </p>
        </div>
      </div>
    );
  }

  const canScrollMobileLeft = mobileIndex > 0;
  const canScrollMobileRight = mobileIndex < players.length - 1;

  return (
    <div
      className="w-full max-w-[100vw] h-[381px] md:w-[1440px] md:h-[397px] md:mx-auto md:rounded-2xl overflow-hidden box-border"
      style={{ background: 'linear-gradient(to top right, #091143 65%, #11207f 100%)' }}
    >
      {/* Header - Mobile: pt-16px, Desktop: pt-2 */}
      <div className="px-4 pt-[16px] md:pt-2 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/players-star-icon.png" alt="" className="w-[26px] h-[26px] md:w-6 md:h-6" />
            <h2
              className="text-white font-semibold text-[22px] md:text-lg md:font-bold"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Players to Watch
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* API Debug Info - Desktop only */}
            <div className="hidden md:block text-white">
              <ApiDebugInfo
                endpoint="/api/v1/players/watchlist + /api/v1/players/statistics"
                response={watchlistResponse?.data}
              />
            </div>

            {/* Mobile Navigation Arrows - 70x30px total, each arrow box 30x30, arrow icon 24x24, gap 10px */}
            <div className="md:hidden flex items-center gap-[10px] w-[70px] h-[30px]">
              <button
                onClick={() => scrollMobile('left')}
                disabled={!canScrollMobileLeft}
                className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center transition-all ${
                  canScrollMobileLeft
                    ? 'bg-white text-[#091143]'
                    : 'bg-transparent border-2 border-white/50 text-white/50 cursor-not-allowed'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={() => scrollMobile('right')}
                disabled={!canScrollMobileRight}
                className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center transition-all ${
                  canScrollMobileRight
                    ? 'bg-white text-[#091143]'
                    : 'bg-transparent border-2 border-white/50 text-white/50 cursor-not-allowed'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Desktop Navigation Arrows */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? 'bg-white text-[#091143]'
                    : 'bg-transparent border-2 border-white/50 text-white/50 cursor-not-allowed'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  canScrollRight
                    ? 'bg-white text-[#091143]'
                    : 'bg-transparent border-2 border-white/50 text-white/50 cursor-not-allowed'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Carousel with peek - 15px gap after header, 16px padding left/bottom, peek of next card on right */}
      <div className="md:hidden pt-[15px] pb-[16px] overflow-hidden">
        <div
          className="flex gap-[12px] transition-transform duration-300 ease-out pl-[16px]"
          style={{ transform: `translateX(-${mobileIndex * (335 + 12)}px)` }}
        >
          {players.map((player) => (
            <div key={player.player_id} className="flex-shrink-0">
              <PlayerCard
                player={player}
                onViewProfile={handleViewProfile}
                variant="mobile"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Horizontal Scroll - 20px margin from container edges */}
      <div className="hidden md:block px-[20px] py-[20px]">
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollButtons}
          className="flex gap-[20px]"
        >
          {players.map((player) => (
            <PlayerCard
              key={player.player_id}
              player={player}
              onViewProfile={handleViewProfile}
              variant="default"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
