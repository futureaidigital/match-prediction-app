import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { usePlayerStatistics, useMultiplePlayerDetails } from '@/hooks/usePlayers';

// Default theme color for player banner (darker navy blue)
const DEFAULT_PLAYER_THEME_COLOR = '#060d33';

// Player Banner component - similar to MatchBanner but for players
function PlayerBanner({
  player,
  stats,
  themeColor,
}: {
  player: {
    player_name?: string;
    image_path?: string;
    position_name?: string;
    team_name?: string;
    team_short_code?: string;
    team_logo?: string;
    country_name?: string;
    country_iso2?: string;
    country_flag?: string;
  };
  stats: {
    goals?: number;
    assists?: number;
    appearances?: number;
    minutes_played?: number;
  };
  themeColor?: string;
}) {
  // Use provided theme color or fallback to default
  const bgColor = themeColor || DEFAULT_PLAYER_THEME_COLOR;
  return (
    <>
      {/* Mobile Version - reduced height */}
      <div className="md:hidden w-full max-w-[358px] mx-auto rounded-[14px] overflow-hidden shadow-2xl">
        <div
          className="relative flex flex-col h-full"
          style={{
            backgroundColor: bgColor,
          }}
        >
          {/* Player Info - Side by side layout */}
          <div className="flex flex-col justify-center px-[14px] py-[14px]">
            {/* Player Image and Name row */}
            <div className="flex items-center gap-[16px]">
              {/* Player Image */}
              <div className="relative shrink-0">
                {player.image_path ? (
                  <img
                    src={player.image_path}
                    alt={player.player_name}
                    className="w-[70px] h-[70px] rounded-full object-cover"
                  />
                ) : (
                  <div className="w-[70px] h-[70px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {player.player_name?.slice(0, 2).toUpperCase() || 'PL'}
                    </span>
                  </div>
                )}
              </div>

              {/* Player Name and Info */}
              <div>
                {/* Player Name */}
                <h1
                  className="text-white font-semibold text-[22px] leading-[125%] mb-[6px]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {player.player_name || 'Player Name'}
                </h1>

                {/* Position | Team | Country row */}
                <div className="flex items-center gap-[8px] flex-wrap">
                  <span
                    className="text-white font-medium text-[12px] leading-[150%]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {player.position_name || 'Forward'}
                  </span>

                  <div className="w-px h-[14px] bg-white" />
                  <div className="flex items-center gap-[4px]">
                    {player.team_logo ? (
                      <img
                        src={player.team_logo}
                        alt={player.team_short_code || 'Team'}
                        className="w-[16px] h-[16px] rounded-full object-contain"
                      />
                    ) : (
                      <div className="w-[16px] h-[16px] rounded-full bg-white/20" />
                    )}
                    <span
                      className="text-white font-medium text-[12px] leading-[150%]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {player.team_short_code || 'N/A'}
                    </span>
                  </div>

                  {player.country_name && (
                    <>
                      <div className="w-px h-[14px] bg-white" />
                      <div className="flex items-center gap-[4px]">
                        {player.country_flag ? (
                          <img
                            src={player.country_flag}
                            alt={player.country_name}
                            className="w-[16px] h-[16px] rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-[16px] h-[16px] rounded-full bg-white/20" />
                        )}
                        <span
                          className="text-white font-medium text-[12px] leading-[150%]"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          {player.country_name}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - 2x2 layout with 8px gap */}
          <div className="px-[14px] pb-[14px]">
            <div className="flex flex-col gap-[8px]">
              {/* First row: Goals, Assists */}
              <div className="flex gap-[8px]">
                <div
                  className="flex-1 h-[65px] rounded-[8px] flex flex-col items-center justify-center p-[10px] gap-[2px]"
                  style={{ backgroundColor: 'rgba(13, 26, 103, 0.65)' }}
                >
                  <span
                    className="text-white text-[20px] font-bold leading-[125%]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {stats.goals ?? 0}
                  </span>
                  <span
                    className="text-white text-[11px] font-medium leading-[150%]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Goals
                  </span>
                </div>
                <div
                  className="flex-1 h-[65px] rounded-[8px] flex flex-col items-center justify-center p-[10px] gap-[2px]"
                  style={{ backgroundColor: 'rgba(13, 26, 103, 0.65)' }}
                >
                  <span
                    className="text-white text-[20px] font-bold leading-[125%]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {stats.assists ?? 0}
                  </span>
                  <span
                    className="text-white text-[11px] font-medium leading-[150%]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Assists
                  </span>
                </div>
              </div>
              {/* Second row: Matches, Minutes */}
              <div className="flex gap-[8px]">
                <div
                  className="flex-1 h-[65px] rounded-[8px] flex flex-col items-center justify-center p-[10px] gap-[2px]"
                  style={{ backgroundColor: 'rgba(13, 26, 103, 0.65)' }}
                >
                  <span
                    className="text-white text-[20px] font-bold leading-[125%]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {stats.appearances ?? 0}
                  </span>
                  <span
                    className="text-white text-[11px] font-medium leading-[150%]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Matches
                  </span>
                </div>
                <div
                  className="flex-1 h-[65px] rounded-[8px] flex flex-col items-center justify-center p-[10px] gap-[2px]"
                  style={{ backgroundColor: 'rgba(13, 26, 103, 0.65)' }}
                >
                  <span
                    className="text-white text-[20px] font-bold leading-[125%]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {stats.minutes_played?.toLocaleString() ?? 0}
                  </span>
                  <span
                    className="text-white text-[11px] font-medium leading-[150%]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Minutes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Version - Half height with 2x2 stats grid on right */}
      <div className="hidden md:block w-full max-w-[1440px] mx-auto h-[190px] rounded-[20px] overflow-hidden shadow-2xl">
        <div
          className="relative h-full flex items-center justify-between px-[30px]"
          style={{
            backgroundColor: bgColor,
          }}
        >
          {/* Left side - Player Info */}
          <div className="flex items-center gap-[20px]">
            {/* Player Image - 80x80px circular */}
            <div className="relative shrink-0">
              {player.image_path ? (
                <img
                  src={player.image_path}
                  alt={player.player_name}
                  className="w-[80px] h-[80px] rounded-full object-cover"
                />
              ) : (
                <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {player.player_name?.slice(0, 2).toUpperCase() || 'PL'}
                  </span>
                </div>
              )}
            </div>

            {/* Player Name and Info */}
            <div>
              {/* Player Name - 24px SemiBold */}
              <h1
                className="text-white font-semibold text-[24px] leading-[130%] mb-[6px]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {player.player_name || 'Player Name'}
              </h1>

              {/* Position | Team | Country row - 14px Medium with dividers */}
              <div className="flex items-center gap-[10px] text-[14px]">
                <span
                  className="text-white font-medium leading-[20px]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {player.position_name || 'Forward'}
                </span>

                <div className="w-px h-[17px] bg-white" />
                <div className="flex items-center gap-[6px]">
                  {player.team_logo ? (
                    <img
                      src={player.team_logo}
                      alt={player.team_short_code || 'Team'}
                      className="w-[20px] h-[20px] object-contain"
                    />
                  ) : (
                    <div className="w-[20px] h-[20px] rounded-full bg-white/20" />
                  )}
                  <span
                    className="text-white font-medium leading-[20px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {player.team_short_code || 'N/A'}
                  </span>
                </div>

                {player.country_name && (
                  <>
                    <div className="w-px h-[17px] bg-white" />
                    <div className="flex items-center gap-[6px]">
                      {player.country_flag ? (
                        <img
                          src={player.country_flag}
                          alt={player.country_name}
                          className="w-[20px] h-[15px] object-cover rounded-sm"
                        />
                      ) : (
                        <div className="w-[20px] h-[15px] rounded-sm bg-white/20" />
                      )}
                      <span
                        className="text-white font-medium leading-[20px]"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {player.country_name}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Stats 2x2 Grid (50% of banner width) */}
          <div className="w-1/2 grid grid-cols-2 gap-[10px]">
            {/* Goals */}
            <div
              className="h-[70px] rounded-[10px] flex flex-col items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <span
                className="text-white text-[22px] font-bold leading-none"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {stats.goals ?? 0}
              </span>
              <span
                className="text-white/80 text-[12px] font-medium leading-[18px] mt-[2px]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Goals
              </span>
            </div>

            {/* Assists */}
            <div
              className="h-[70px] rounded-[10px] flex flex-col items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <span
                className="text-white text-[22px] font-bold leading-none"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {stats.assists ?? 0}
              </span>
              <span
                className="text-white/80 text-[12px] font-medium leading-[18px] mt-[2px]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Assists
              </span>
            </div>

            {/* Matches */}
            <div
              className="h-[70px] rounded-[10px] flex flex-col items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <span
                className="text-white text-[22px] font-bold leading-none"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {stats.appearances ?? 0}
              </span>
              <span
                className="text-white/80 text-[12px] font-medium leading-[18px] mt-[2px]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Matches
              </span>
            </div>

            {/* Minutes */}
            <div
              className="h-[70px] rounded-[10px] flex flex-col items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <span
                className="text-white text-[22px] font-bold leading-none"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {stats.minutes_played?.toLocaleString() ?? 0}
              </span>
              <span
                className="text-white/80 text-[12px] font-medium leading-[18px] mt-[2px]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Minutes
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Key Statistics Item - Desktop: equal width, horizontal layout with icon on right
function KeyStatItem({
  value,
  label,
  icon,
  showDivider = true,
}: {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  showDivider?: boolean;
}) {
  return (
    <div className="flex-1 min-w-0 flex items-center">
      {/* Stat content - flex-1 to stretch equally */}
      <div className="flex-1 min-w-0 h-[60px] flex items-center justify-between px-3">
        <div className="flex flex-col min-w-0">
          <span
            className="text-[#0a0a0a] text-[24px] font-bold leading-[125%]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {value}
          </span>
          <span
            className="text-[#7c8a9c] text-[12px] font-medium leading-[150%] whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {label}
          </span>
        </div>
        <div className="w-[24px] h-[24px] flex-shrink-0 ml-2">
          {icon}
        </div>
      </div>
      {/* Vertical divider - 1px #e1e4eb */}
      {showDivider && (
        <div className="w-px h-[60px] bg-[#e1e4eb] flex-shrink-0" />
      )}
    </div>
  );
}

// Player Prediction Card
function PlayerPredictionCard({
  title,
  percentage,
  change,
  preGamePercentage,
}: {
  title: string;
  percentage: number;
  change?: number;
  preGamePercentage: number;
}) {
  const isPositiveChange = (change ?? 0) >= 0;

  return (
    <div className="bg-white rounded-[14px] border border-[#e1e4eb] shadow-[0_1px_15px_rgba(0,0,0,0.1)] p-4">
      <div className="flex items-center justify-between mb-3">
        <h4
          className="text-[#0a0a0a] text-[14px] font-semibold"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {title}
        </h4>
        <svg
          className="w-5 h-5 text-[#7c8a9c]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[#27ae60] text-[16px] font-semibold"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {percentage}%
        </span>
        {change !== undefined && (
          <span
            className={`text-[12px] font-medium ${isPositiveChange ? 'text-[#27ae60]' : 'text-red-500'}`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {isPositiveChange ? '↑' : '↓'} {Math.abs(change)}% in the last 13 min
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#0a0a0a]/10 rounded-[10px] h-2 mb-2">
        <div
          className="bg-[#27ae60] h-2 rounded-[100px] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span
          className="text-[#7c8a9c] text-[12px] font-medium"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Pre-game Prediction:
        </span>
        <span
          className="text-[#27ae60] text-[14px] font-semibold"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {preGamePercentage}%
        </span>
      </div>
    </div>
  );
}

// Stats Bar component - Mobile: 16px Medium labels, centered
function StatBar({
  label,
  homeValue,
  awayValue,
  isPercentage = false,
  homeLabel = '',
  awayLabel = '',
}: {
  label: string;
  homeValue: number;
  awayValue: number;
  isPercentage?: boolean;
  homeLabel?: string;
  awayLabel?: string;
}) {
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;
  const homeWinning = homeValue > awayValue;
  const awayWinning = awayValue > homeValue;

  return (
    <div>
      {/* Label - 16px Medium, centered */}
      <p
        className="text-center text-[#0a0a0a] font-medium text-[16px] leading-[150%] mb-1"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        {label}
      </p>
      {/* Values and bars */}
      <div className="flex items-center gap-1">
        <span
          className={`w-10 text-left font-semibold text-[14px] ${homeWinning ? 'text-[#27ae60]' : 'text-[#0a0a0a]'}`}
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {isPercentage ? `${homeValue}%` : homeValue}
        </span>
        <div className="flex-1 flex h-[6px] gap-1">
          {/* Home bar - grows from center to left */}
          <div className="flex-1 flex justify-end bg-[#e1e4eb] rounded-full">
            <div
              className={`h-full rounded-full ${homeWinning ? 'bg-[#27ae60]' : 'bg-[#0a0a0a]'}`}
              style={{ width: `${homePercent}%` }}
            />
          </div>
          {/* Away bar - grows from center to right */}
          <div className="flex-1 flex justify-start bg-[#e1e4eb] rounded-full">
            <div
              className={`h-full rounded-full ${awayWinning ? 'bg-[#27ae60]' : 'bg-[#0a0a0a]'}`}
              style={{ width: `${awayPercent}%` }}
            />
          </div>
        </div>
        <span
          className={`w-10 text-right font-semibold text-[14px] ${awayWinning ? 'text-[#27ae60]' : 'text-[#0a0a0a]'}`}
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {isPercentage ? `${awayValue}%` : awayValue}
        </span>
      </div>
      {(homeLabel || awayLabel) && (
        <div className="flex justify-between mt-1 text-[10px] text-[#7c8a9c]">
          <span>{homeLabel}</span>
          <span>{awayLabel}</span>
        </div>
      )}
    </div>
  );
}

export function PlayerPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const playerIdNum = parseInt(playerId || '0', 10);

  // Fetch player details
  const playerDetailsQueries = useMultiplePlayerDetails([playerIdNum]);
  const playerDetailsQuery = playerDetailsQueries[0];

  // Fetch player statistics
  const { data: statsResponse, isLoading: isLoadingStats } = usePlayerStatistics(
    { player_id: playerIdNum },
    { enabled: playerIdNum > 0 }
  );

  const isLoading = playerDetailsQuery?.isLoading || isLoadingStats;
  const playerData = playerDetailsQuery?.data?.data?.player as any;
  const statsData = statsResponse?.data;

  // Extract player info
  const teamName = playerData?.team?.team_name || playerData?.current_team?.team_name || playerData?.team_name;
  const teamShortCode = playerData?.team?.short_code || playerData?.current_team?.short_code || teamName?.substring(0, 3).toUpperCase();
  const teamLogo = playerData?.team?.image_path || playerData?.current_team?.image_path;

  // Country flag: prefer API image_path, fallback to flagcdn with iso2
  const countryIso2 = playerData?.nationality?.iso2 || playerData?.country?.iso2;
  const countryFlag = playerData?.nationality?.image_path || playerData?.country?.image_path ||
    (countryIso2 ? `https://flagcdn.com/w40/${countryIso2.toLowerCase()}.png` : undefined);

  const player = {
    player_name: playerData?.display_name || playerData?.common_name || playerData?.player_name || 'Unknown Player',
    image_path: playerData?.image_path,
    position_name: playerData?.position?.name || 'Forward',
    team_name: teamName,
    team_short_code: teamShortCode,
    team_logo: teamLogo,
    country_name: playerData?.nationality?.name || playerData?.country?.name,
    country_iso2: countryIso2,
    country_flag: countryFlag,
  };

  const stats = {
    goals: statsData?.statistics?.attacking?.goals || 20,
    assists: statsData?.statistics?.attacking?.assists || 12,
    appearances: statsData?.statistics?.appearances?.appearances || 38,
    minutes_played: statsData?.statistics?.appearances?.minutes_played || 3240,
  };

  // Key statistics mock data (would come from API)
  // Note: rating can be a number or an object {average, highest, lowest}
  const ratingValue = statsData?.statistics?.rating;
  const avgRating = typeof ratingValue === 'object' && ratingValue !== null
    ? (ratingValue as { average?: number }).average
    : ratingValue;

  const keyStats = {
    passingAccuracy: statsData?.statistics?.passing?.accurate_passes_percentage || 87,
    shotsOnTarget: statsData?.statistics?.shooting?.shots_on_target || 70,
    avgMatchRating: avgRating || 8.2,
    tacklesWon: statsData?.statistics?.defending?.tackles || 68,
    dribblesPerGame: 4.3,
    yellowCards: statsData?.statistics?.discipline?.yellowcards || 3,
  };

  // Mock predictions data
  const predictions = [
    { title: 'Lanre to Score 2.5', percentage: 82, change: 6, preGamePercentage: 76 },
    { title: 'Mbappe to register an assist in next match', percentage: 82, change: 6, preGamePercentage: 76 },
  ];

  // Mock summary text
  const summaryText = `${player.player_name} is in exceptional form this season, delivering consistent performances in Ligue 1 and the Champions League. Known for his blistering pace, precise finishing, and attacking intelligence, he remains PSG's key offensive threat.\n\nWith high goal involvement and impressive match ratings, ${player.player_name} continues to influence every game at the highest level.`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="players" />
        <main className="pb-32 md:pb-0">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6">
            {/* Banner skeleton */}
            <div className="w-full h-[207px] bg-gray-200 rounded-[20px] animate-pulse" />
          </div>
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[400px] bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-[400px] bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="players" />

      <main className="pb-32 md:pb-0">
        {/* Back button */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Player Banner */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <PlayerBanner player={player} stats={stats} />
        </div>

        {/* Key Statistics - Desktop per Figma: 90px height, 16px radius, #f7f8fa bg */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
          <h2
            className="text-[#0a0a0a] text-[22px] font-semibold mb-4"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Key Statistics
          </h2>
          {/* Container: 90px height, 16px border-radius, #f7f8fa background - scrollable on mobile */}
          <div className="bg-[#f7f8fa] rounded-[16px] h-[90px] flex items-center overflow-x-auto md:overflow-x-visible">
            <div className="flex items-center w-full md:w-full min-w-max md:min-w-0">
              <KeyStatItem
                value={`${keyStats.passingAccuracy}%`}
                label="Passing Accuracy"
                icon={<img src="/Football.svg" alt="Passing" className="w-6 h-6" />}
              />
              <KeyStatItem
                value={`${keyStats.shotsOnTarget}%`}
                label="Shots on Target"
                icon={<img src="/Target.svg" alt="Target" className="w-6 h-6" />}
              />
              <KeyStatItem
                value={keyStats.avgMatchRating}
                label="Avg. Match Rating"
                icon={<img src="/Star.svg" alt="Rating" className="w-6 h-6" />}
              />
              <KeyStatItem
                value={`${keyStats.tacklesWon}%`}
                label="Tackles Won"
                icon={<img src="/Tackle.svg" alt="Tackle" className="w-6 h-6" />}
              />
              <KeyStatItem
                value={keyStats.dribblesPerGame}
                label="Dribbles/Game"
                icon={<img src="/Dribble.svg" alt="Dribble" className="w-6 h-6" />}
              />
              <KeyStatItem
                value={keyStats.yellowCards}
                label="Yellow Cards"
                showDivider={false}
                icon={<img src="/Yellow_Card.svg" alt="Yellow Card" className="w-6 h-6" />}
              />
            </div>
          </div>
        </div>

        {/* Player Predictions and Summary */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Player Predictions */}
            <div>
              <h2
                className="text-[#0a0a0a] text-[18px] font-bold mb-4"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Player Predictions
              </h2>
              <div className="space-y-4">
                {predictions.map((pred, idx) => (
                  <PlayerPredictionCard
                    key={idx}
                    title={pred.title}
                    percentage={pred.percentage}
                    change={pred.change}
                    preGamePercentage={pred.preGamePercentage}
                  />
                ))}
              </div>
            </div>

            {/* Summary - Mobile: 358px, 15px gap, 10px radius, #f7f8fa bg */}
            <div className="flex flex-col gap-[15px]">
              <h2
                className="text-[#0a0a0a] text-[18px] font-semibold"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Summary
              </h2>
              <div className="bg-[#f7f8fa] rounded-[10px] p-[14px]">
                <p
                  className="text-[#0a0a0a] text-[14px] font-medium leading-[20px] whitespace-pre-line"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {summaryText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section - Mobile: 358px wide, 20px gap, nested containers */}
        <div className="max-w-[358px] md:max-w-[1400px] mx-auto px-4 md:px-6 pb-6">
          {/* Header row - Stats title + Basic dropdown */}
          <div className="flex items-center justify-between mb-5 h-[40px]">
            <h2
              className="text-[#0a0a0a] text-[18px] font-semibold"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Stats
            </h2>
            <div className="relative">
              <select
                className="appearance-none bg-[#f7f8fa] rounded-[7px] px-[10px] py-[10px] pr-[38px] text-[12px] font-medium text-[#0a0a0a] cursor-pointer focus:outline-none h-[40px]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <option value="basic">Basic</option>
                <option value="advanced">Advanced</option>
              </select>
              <svg
                className="absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none text-[#0a0a0a]"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Outer container - #f7f8fa background, 20px radius, 14px padding */}
          <div className="bg-[#f7f8fa] rounded-[20px] p-[14px]">
            {/* Inner white card - 15px radius, 14px padding */}
            <div className="bg-white rounded-[15px] p-[14px]">
              {/* Stats list with 16px gap */}
              <div className="flex flex-col gap-[16px]">
                <StatBar
                  label="Ball possession"
                  homeValue={60}
                  awayValue={38}
                  isPercentage
                />
                <div className="h-px bg-[#e1e4eb]" />
                <StatBar
                  label="Total shots"
                  homeValue={10}
                  awayValue={15}
                />
                <div className="h-px bg-[#e1e4eb]" />
                <StatBar
                  label="Goals"
                  homeValue={8}
                  awayValue={2}
                />
                <div className="h-px bg-[#e1e4eb]" />
                <StatBar
                  label="Fouls"
                  homeValue={8}
                  awayValue={2}
                />
                <div className="h-px bg-[#e1e4eb]" />
                <StatBar
                  label="Free Kicks"
                  homeValue={3}
                  awayValue={10}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
