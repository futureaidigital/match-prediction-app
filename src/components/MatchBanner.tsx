import { useMemo, useState, useEffect } from 'react';

interface MatchBannerProps {
  fixture: {
    league_name?: string;
    home_team_name?: string;
    home_team_short_code?: string;
    home_team_image_path?: string;
    away_team_name?: string;
    away_team_short_code?: string;
    away_team_image_path?: string;
    home_team_score?: number;
    away_team_score?: number;
    minutes_elapsed?: number | null;
    kickoff_at?: string;
    starting_at?: string; // Alias for kickoff_at from some API responses
    is_live?: boolean;
  };
  predictions?: Array<{
    prediction_id?: number;
    prediction_display_name?: string;
    prediction?: number;
    pre_game_prediction?: number;
  }>;
  showPredictions?: boolean;
  carouselCount?: number;
  activeIndex?: number;
  onCarouselChange?: (index: number) => void;
  isPremium?: boolean;
  /** Mobile layout variant: 'full' (215px with team names) or 'compact' (85px with short codes) */
  variant?: 'full' | 'compact';
}

// Helper to format countdown
function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Starting soon';

  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const days = Math.floor(totalMinutes / 60 / 24);

  // For times up to 100 minutes, show mm:ss format
  if (totalMinutes <= 100) {
    const paddedSeconds = seconds.toString().padStart(2, '0');
    return `${totalMinutes}:${paddedSeconds}`;
  }

  // For longer times, show days + hours or hours + minutes
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (days > 0) {
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
}

// Helper to format kickoff time (e.g., "Today, 14:30" or "Mon 23, 14:30")
function formatKickoffTime(dateString: string): string {
  const matchDate = new Date(dateString);
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
}

export function MatchBanner({ fixture, predictions = [], showPredictions = false, carouselCount = 0, activeIndex = 0, onCarouselChange, isPremium = false, variant = 'full' }: MatchBannerProps) {
  const homeScore = fixture.home_team_score ?? 0;
  const awayScore = fixture.away_team_score ?? 0;

  // Get kickoff time (prefer kickoff_at, fallback to starting_at)
  const kickoffTime = fixture.kickoff_at || fixture.starting_at;

  // Determine match status: 'live', 'upcoming', or 'finished'
  const matchStatus = useMemo(() => {
    if (fixture.is_live) return 'live';

    if (kickoffTime) {
      const kickoff = new Date(kickoffTime);
      const now = new Date();

      if (kickoff > now) return 'upcoming';
      // If kickoff is in the past and not live, it's finished
      return 'finished';
    }

    // Fallback: if minutes_elapsed exists and > 0, assume live or finished
    if (fixture.minutes_elapsed && fixture.minutes_elapsed > 0) {
      // If minutes >= 90, likely finished
      if (fixture.minutes_elapsed >= 90) return 'finished';
      return 'live';
    }

    return 'upcoming'; // Default fallback
  }, [fixture.is_live, kickoffTime, fixture.minutes_elapsed]);

  // Countdown state for upcoming matches
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    if (matchStatus !== 'upcoming' || !kickoffTime) {
      setCountdown('');
      return;
    }

    const updateCountdown = () => {
      const kickoff = new Date(kickoffTime);
      const now = new Date();
      const diff = kickoff.getTime() - now.getTime();
      setCountdown(formatCountdown(diff));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [matchStatus, kickoffTime]);

  // Dedupe predictions by prediction_id first, then by display name as fallback
  const uniquePredictions = useMemo(() => {
    const seen = new Set<string>();
    return predictions.filter((pred) => {
      // Create unique key from prediction_id or display_name
      const key = pred.prediction_id != null
        ? `id-${pred.prediction_id}`
        : `name-${pred.prediction_display_name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [predictions]);

  return (
    <>
      {/* Mobile Version - Compact variant (logos with names below) */}
      {variant === 'compact' && (
        <div className="md:hidden w-full mx-auto rounded-[12px] overflow-hidden shadow-2xl">
          <div
            className="relative py-[12px] flex flex-col items-center justify-center"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(9, 17, 67, 0) 0%, rgba(9, 17, 67, 1) 100%), linear-gradient(0deg, rgba(13, 26, 103, 0.55) 0%, rgba(13, 26, 103, 0.55) 100%), url('/stadium-bg.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
            }}
          >
            <div className="flex items-end justify-center w-full px-4 gap-[20px]">
              {/* Home Team - Logo with name below */}
              <div className="flex flex-col items-center w-[80px]">
                {fixture.home_team_image_path ? (
                  <img
                    src={fixture.home_team_image_path}
                    alt={fixture.home_team_name}
                    className="w-[40px] h-[40px] object-contain"
                  />
                ) : (
                  <div className="w-[40px] h-[40px] rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                    <span className="text-white font-bold text-[10px]">
                      {fixture.home_team_short_code?.slice(0, 3) || 'HOM'}
                    </span>
                  </div>
                )}
                <span
                  className="text-white font-medium text-[10px] leading-tight text-center mt-[4px] line-clamp-2"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {fixture.home_team_name || 'Home Team'}
                </span>
              </div>

              {/* Score box with status info */}
              <div className="flex flex-col items-center justify-center min-w-[90px]">
                {/* Status Badge - shown for finished/upcoming, empty space for live to maintain size */}
                {matchStatus === 'finished' && (
                  <span
                    className="text-[#7c8a9c] text-[10px] font-medium h-[18px] mb-[2px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Full Time
                  </span>
                )}
                {matchStatus === 'upcoming' && kickoffTime && (
                  <span
                    className="text-[#7c8a9c] text-[10px] font-medium h-[18px] mb-[2px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {formatKickoffTime(kickoffTime)}
                  </span>
                )}
                {matchStatus === 'live' && (
                  <div className="h-[18px] mb-[2px]" />
                )}

                {/* Score */}
                <div className="flex items-center justify-center">
                  <span
                    className="text-white text-[32px] font-semibold leading-none"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {homeScore}
                  </span>
                  <span
                    className="text-white text-[32px] font-semibold leading-none mx-[4px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    -
                  </span>
                  <span
                    className="text-white text-[32px] font-semibold leading-none"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {awayScore}
                  </span>
                </div>

                {/* Countdown/Minutes - below score */}
                {matchStatus === 'upcoming' && countdown && (
                  <span
                    className="text-[#7c8a9c] text-[12px] font-medium mt-[2px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {countdown}
                  </span>
                )}
                {matchStatus === 'live' && (
                  <span
                    className="text-[#7c8a9c] text-[12px] font-medium mt-[2px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {fixture.minutes_elapsed ?? 0}'
                  </span>
                )}
                {matchStatus === 'finished' && (
                  <span
                    className="text-[#7c8a9c] text-[12px] font-medium mt-[2px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {fixture.minutes_elapsed || 90}'
                  </span>
                )}
              </div>

              {/* Away Team - Logo with name below */}
              <div className="flex flex-col items-center w-[80px]">
                {fixture.away_team_image_path ? (
                  <img
                    src={fixture.away_team_image_path}
                    alt={fixture.away_team_name}
                    className="w-[40px] h-[40px] object-contain"
                  />
                ) : (
                  <div className="w-[40px] h-[40px] rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                    <span className="text-white font-bold text-[10px]">
                      {fixture.away_team_short_code?.slice(0, 3) || 'AWY'}
                    </span>
                  </div>
                )}
                <span
                  className="text-white font-medium text-[10px] leading-tight text-center mt-[4px] line-clamp-2"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {fixture.away_team_name || 'Away Team'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Version - Full variant (215px height with team names below logos) */}
      {variant === 'full' && (
      <div className="md:hidden w-[358px] h-[215px] mx-auto rounded-[14px] overflow-hidden shadow-2xl">
        <div
          className="relative flex flex-col h-full"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(9, 17, 67, 0) 0%, rgba(9, 17, 67, 1) 100%), linear-gradient(0deg, rgba(13, 26, 103, 0.55) 0%, rgba(13, 26, 103, 0.55) 100%), url('/stadium-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
          }}
        >
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col justify-center">
            {/* League Name & Live Badge container (fixed size) */}
            <div className="flex flex-col items-center gap-[4px] mx-auto mb-[4px]">
              <span
                className="text-[#7c8a9c] text-[14px] font-medium leading-[150%] text-center"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {fixture.league_name || 'UEFA Champions League'}
              </span>

              {/* Live badge - only shown for live matches, otherwise empty space to maintain size */}
              {matchStatus === 'live' ? (
                <div className="flex items-center justify-center gap-[4px] h-[18px]">
                  <img src="/live.svg" alt="Live" className="w-[14px] h-[14px]" />
                  <span
                    className="text-[#e74c3c] text-[10px] font-bold uppercase"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Live
                  </span>
                </div>
              ) : (
                <div className="h-[18px]" />
              )}
            </div>

            {/* Teams and Score - centered layout with names below logos */}
            <div className="flex items-end justify-center w-full px-4 gap-[20px]">
              {/* Home Team - logo with name below */}
              <div className="flex flex-col items-center w-[90px]">
                {fixture.home_team_image_path ? (
                  <img
                    src={fixture.home_team_image_path}
                    alt={fixture.home_team_name}
                    className="w-[50px] h-[50px] object-contain"
                  />
                ) : (
                  <div className="w-[50px] h-[50px] rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                    <span className="text-white font-bold text-[10px]">
                      {fixture.home_team_short_code?.slice(0, 3) || 'HOM'}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-center min-h-[26px] mt-[4px]">
                  <span
                    className="text-white font-medium text-[11px] leading-tight text-center line-clamp-2"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {fixture.home_team_name || 'Home Team'}
                  </span>
                </div>
              </div>

              {/* Score box with status info */}
              <div className="flex flex-col items-center justify-center min-w-[90px]">
                {/* Status Badge - shown for finished/upcoming, empty space for live to maintain size */}
                {matchStatus === 'finished' && (
                  <span
                    className="text-[#7c8a9c] text-[10px] font-medium h-[18px] mb-[2px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Full Time
                  </span>
                )}
                {matchStatus === 'upcoming' && kickoffTime && (
                  <span
                    className="text-[#7c8a9c] text-[10px] font-medium h-[18px] mb-[2px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {formatKickoffTime(kickoffTime)}
                  </span>
                )}
                {matchStatus === 'live' && (
                  <div className="h-[18px] mb-[2px]" />
                )}

                {/* Score */}
                <div className="flex items-center justify-center">
                  <span
                    className="text-white text-[42px] font-semibold leading-none"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {homeScore}
                  </span>
                  <span
                    className="text-white text-[42px] font-semibold leading-none mx-[4px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    -
                  </span>
                  <span
                    className="text-white text-[42px] font-semibold leading-none"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {awayScore}
                  </span>
                </div>

                {/* Countdown/Minutes - below score */}
                {matchStatus === 'upcoming' && countdown && (
                  <span
                    className="text-[#7c8a9c] text-[12px] font-medium mt-[2px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {countdown}
                  </span>
                )}
                {matchStatus === 'live' && (
                  <span
                    className="text-[#7c8a9c] text-[12px] font-medium mt-[2px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {fixture.minutes_elapsed ?? 0}'
                  </span>
                )}
                {matchStatus === 'finished' && (
                  <span
                    className="text-[#7c8a9c] text-[12px] font-medium mt-[2px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {fixture.minutes_elapsed || 90}'
                  </span>
                )}
              </div>

              {/* Away Team - logo with name below */}
              <div className="flex flex-col items-center w-[90px]">
                {fixture.away_team_image_path ? (
                  <img
                    src={fixture.away_team_image_path}
                    alt={fixture.away_team_name}
                    className="w-[50px] h-[50px] object-contain"
                  />
                ) : (
                  <div className="w-[50px] h-[50px] rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                    <span className="text-white font-bold text-[10px]">
                      {fixture.away_team_short_code?.slice(0, 3) || 'AWY'}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-center min-h-[26px] mt-[4px]">
                  <span
                    className="text-white font-medium text-[11px] leading-tight text-center line-clamp-2"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {fixture.away_team_name || 'Away Team'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Predictions Section - Mobile: 330x49px, aligned to right edge */}
          {showPredictions && uniquePredictions.length > 0 && (
            <div className="w-[330px] h-[49px] ml-auto mr-[14px] flex flex-col justify-center mb-[10px]">
              <div className="h-[17px] mb-[6px]">
                <span
                  className="text-[#7c8a9c] text-[12px] font-normal leading-[140%]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  High confidence predictions
                </span>
              </div>

              <div className="flex gap-[14px] overflow-x-auto scrollbar-hide">
                {uniquePredictions.map((pred, idx) => {
                  const percentage = Math.round(pred.prediction || pred.pre_game_prediction || 0);
                  const isHighConfidence = percentage >= 70;
                  const isLowConfidence = percentage < 50;
                  const shouldBlur = !isPremium && idx > 0;

                  return (
                    <div
                      key={`mobile-${pred.prediction_id ?? idx}-${pred.prediction_display_name}`}
                      className="h-[21px] flex items-center gap-[6px] bg-[#ffffff26] border border-[#7c8a9c] rounded-[4px] px-[12px] py-[2px] shrink-0"
                      style={{ boxShadow: '0 0 20px rgba(0, 0, 0, 0.04)' }}
                    >
                      <span
                        className={`text-[12px] font-semibold leading-[18px] ${shouldBlur ? 'blur-[2px] select-none' : ''} ${
                          isHighConfidence
                            ? 'text-[#27ae60]'
                            : isLowConfidence
                            ? 'text-red-400'
                            : 'text-[#f39c12]'
                        }`}
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {percentage}%
                      </span>
                      <span
                        className={`text-white text-[12px] font-medium leading-[18px] whitespace-nowrap ${shouldBlur ? 'blur-[2px] select-none' : ''}`}
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {pred.prediction_display_name || 'Prediction'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Desktop Version - Compact variant (207px height) for Match Detail page */}
      {variant === 'compact' && (
        <div className="hidden md:block w-full max-w-[1440px] mx-auto h-[207px] rounded-[20px] overflow-hidden shadow-2xl">
          <div
            className="relative flex items-center justify-center h-full"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(9, 17, 67, 0) 0%, rgba(9, 17, 67, 1) 100%), linear-gradient(0deg, rgba(13, 26, 103, 0.55) 0%, rgba(13, 26, 103, 0.55) 100%), url('/stadium-bg.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
            }}
          >
            {/* Match Info Container - 950px width, centered */}
            <div className="flex items-start justify-between w-[950px]">
              {/* Home Team - Logo with name below */}
              <div className="flex flex-col items-center w-[200px]">
                {fixture.home_team_image_path ? (
                  <img
                    src={fixture.home_team_image_path}
                    alt={fixture.home_team_name}
                    className="w-[90px] h-[90px] object-contain"
                  />
                ) : (
                  <div className="w-[90px] h-[90px] rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                    <span className="text-white font-bold text-base">
                      {fixture.home_team_short_code?.slice(0, 3) || 'HOM'}
                    </span>
                  </div>
                )}
                <span
                  className="text-white font-medium text-[16px] leading-tight text-center mt-[8px]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {fixture.home_team_name || 'Home Team'}
                </span>
              </div>

              {/* Score and Status - centered */}
              <div className="flex flex-col items-center justify-center">
                {/* Kickoff Time - for upcoming matches, show time above score */}
                {matchStatus === 'upcoming' && kickoffTime && (
                  <span
                    className="text-[#7c8a9c] text-[18px] font-medium leading-[135%] mb-[6px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {formatKickoffTime(kickoffTime)}
                  </span>
                )}
                {/* Live status - icon + text above score */}
                {matchStatus === 'live' && (
                  <div className="flex items-center justify-center gap-[4px] mb-[6px]">
                    <img src="/live.svg" alt="Live" className="w-[18px] h-[18px]" />
                    <span
                      className="text-[#e74c3c] text-[18px] font-bold uppercase"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Live
                    </span>
                  </div>
                )}
                {/* Full Time label - above score for finished matches */}
                {matchStatus === 'finished' && (
                  <span
                    className="text-[#7c8a9c] text-[18px] font-medium leading-[135%] mb-[6px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Full Time
                  </span>
                )}
                <div className="flex items-center justify-center">
                  <span
                    className="text-white text-[66px] font-semibold leading-none w-[50px] text-center"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {homeScore}
                  </span>
                  <span
                    className="text-white text-[66px] font-semibold leading-none w-[50px] text-center"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    -
                  </span>
                  <span
                    className="text-white text-[66px] font-semibold leading-none w-[50px] text-center"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {awayScore}
                  </span>
                </div>
                {/* Countdown - for upcoming matches, show below score */}
                {matchStatus === 'upcoming' && countdown && (
                  <span
                    className="text-[#7c8a9c] text-[14px] font-medium leading-[135%] mt-[6px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {countdown}
                  </span>
                )}
                {/* Minutes elapsed - for live matches, show below score */}
                {matchStatus === 'live' && (
                  <span
                    className="text-[#7c8a9c] text-[14px] font-medium leading-[135%] mt-[6px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {fixture.minutes_elapsed ?? 0}'
                  </span>
                )}
                {/* Minutes - for finished matches (show 90' as fallback) */}
                {matchStatus === 'finished' && (
                  <span
                    className="text-[#7c8a9c] text-[14px] font-medium leading-[135%] mt-[6px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {fixture.minutes_elapsed || 90}'
                  </span>
                )}
              </div>

              {/* Away Team - Logo with name below */}
              <div className="flex flex-col items-center w-[200px]">
                {fixture.away_team_image_path ? (
                  <img
                    src={fixture.away_team_image_path}
                    alt={fixture.away_team_name}
                    className="w-[90px] h-[90px] object-contain"
                  />
                ) : (
                  <div className="w-[90px] h-[90px] rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                    <span className="text-white font-bold text-base">
                      {fixture.away_team_short_code?.slice(0, 3) || 'AWY'}
                    </span>
                  </div>
                )}
                <span
                  className="text-white font-medium text-[16px] leading-tight text-center mt-[8px]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {fixture.away_team_name || 'Away Team'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Version - Full variant (330px height) for Home page */}
      {variant === 'full' && (
      <div className="hidden md:block w-full max-w-[1440px] mx-auto h-[330px] rounded-[20px] overflow-hidden shadow-2xl">
        <div
          className="relative flex flex-col h-full"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(9, 17, 67, 0) 0%, rgba(9, 17, 67, 1) 100%), linear-gradient(0deg, rgba(13, 26, 103, 0.55) 0%, rgba(13, 26, 103, 0.55) 100%), url('/stadium-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
          }}
        >
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col justify-center">
            {/* League Name & Status Badge - 285x61px container (fixed size) */}
            <div className="flex flex-col items-center gap-[10px] w-[285px] h-[61px] mx-auto mb-[12px]">
              {/* League name - 285px wide, 27px height */}
              <span
                className="text-[#7c8a9c] text-[22px] font-medium leading-[27px] text-center w-[285px] h-[27px]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {fixture.league_name || 'UEFA Champions League'}
              </span>

              {/* Live badge - only shown for live matches, otherwise empty space (24px) to maintain container size */}
              {matchStatus === 'live' ? (
                <div className="flex items-center justify-center gap-[4px] h-[24px]">
                  <img src="/live.svg" alt="Live" className="w-[20px] h-[20px]" />
                  <span
                    className="text-[#e74c3c] text-[16px] font-bold uppercase leading-[24px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Live
                  </span>
                </div>
              ) : (
                <div className="h-[24px]" />
              )}
            </div>

            {/* Teams and Score Row - 1228x92px container */}
            <div className="flex items-center justify-between w-[1228px] h-[92px] mx-auto gap-[46px]">
              {/* Home Team - logo + name horizontal, ~350px */}
              <div className="flex items-center gap-[20px]">
                {fixture.home_team_image_path ? (
                  <img
                    src={fixture.home_team_image_path}
                    alt={fixture.home_team_name}
                    className="w-[90px] h-[90px] object-contain shrink-0"
                  />
                ) : (
                  <div className="w-[90px] h-[90px] rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                    <span className="text-white font-bold text-base">
                      {fixture.home_team_short_code?.slice(0, 3) || 'HOM'}
                    </span>
                  </div>
                )}
                <span
                  className="text-white font-medium text-[22px] leading-[27px] text-left w-[240px]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {fixture.home_team_name || 'Home Team'}
                </span>
              </div>

                {/* Score box */}
                <div className="flex flex-col items-center justify-center min-w-[180px]">
                  {/* Status Badge - shown for finished/upcoming, empty space for live to maintain size */}
                  {matchStatus === 'finished' && (
                    <span
                      className="text-[#7c8a9c] text-[16px] font-medium leading-[24px] h-[24px] mb-[8px]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Full Time
                    </span>
                  )}
                  {matchStatus === 'upcoming' && kickoffTime && (
                    <span
                      className="text-[#7c8a9c] text-[16px] font-medium leading-[24px] h-[24px] mb-[8px]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {formatKickoffTime(kickoffTime)}
                    </span>
                  )}
                  {matchStatus === 'live' && (
                    <div className="h-[24px] mb-[8px]" />
                  )}

                  {/* Score container */}
                  <div className="flex items-center justify-center w-[150px]">
                    <span
                      className="text-white text-[66px] font-semibold leading-none w-[50px] text-center"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {homeScore}
                    </span>
                    <span
                      className="text-white text-[66px] font-semibold leading-none w-[50px] text-center"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      -
                    </span>
                    <span
                      className="text-white text-[66px] font-semibold leading-none w-[50px] text-center"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {awayScore}
                    </span>
                  </div>

                  {/* Countdown/Minutes - below score: 18px Montserrat Medium, white, 135% line height */}
                  {matchStatus === 'upcoming' && countdown && (
                    <span
                      className="text-white text-[18px] font-medium leading-[135%] text-center mt-[12px]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {countdown}
                    </span>
                  )}
                  {matchStatus === 'live' && (
                    <span
                      className="text-white text-[18px] font-medium leading-[135%] text-center mt-[12px]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {fixture.minutes_elapsed ?? 0}'
                    </span>
                  )}
                  {matchStatus === 'finished' && (
                    <span
                      className="text-white text-[18px] font-medium leading-[135%] text-center mt-[12px]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {fixture.minutes_elapsed || 90}'
                    </span>
                  )}
                </div>

              {/* Away Team - name + logo horizontal (reversed order), ~352px */}
              <div className="flex items-center gap-[20px]">
                <span
                  className="text-white font-medium text-[22px] leading-[27px] text-right w-[240px]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {fixture.away_team_name || 'Away Team'}
                </span>
                {fixture.away_team_image_path ? (
                  <img
                    src={fixture.away_team_image_path}
                    alt={fixture.away_team_name}
                    className="w-[92px] h-[92px] object-contain shrink-0"
                  />
                ) : (
                  <div className="w-[92px] h-[92px] rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                    <span className="text-white font-bold text-base">
                      {fixture.away_team_short_code?.slice(0, 3) || 'AWY'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Predictions Section - Desktop: 55px tall container */}
          {showPredictions && uniquePredictions.length > 0 && (
            <div className="h-[55px] px-6 flex flex-col justify-center mb-[20px]">
              {/* Top row: Label on left, Carousel dots centered */}
              <div className="flex items-center mb-[6px] relative">
                {/* Label - 12px text */}
                <span
                  className="text-[#7c8a9c] text-[12px] font-normal leading-[140%]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  High confidence predictions
                </span>

                {/* Carousel dots - centered */}
                {carouselCount > 1 && (
                  <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
                    {Array.from({ length: carouselCount }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => onCarouselChange?.(idx)}
                        className={`h-[3px] rounded-[1px] transition-all hover:bg-white/40 ${
                          idx === activeIndex
                            ? 'w-[25px] bg-white'
                            : 'w-[10px] bg-white/25'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Predictions Pills - 22px height each */}
              <div className="flex gap-[14px] overflow-x-auto scrollbar-hide">
                {uniquePredictions.map((pred, idx) => {
                  const percentage = Math.round(pred.prediction || pred.pre_game_prediction || 0);
                  const isHighConfidence = percentage >= 70;
                  const isLowConfidence = percentage < 50;
                  const shouldBlur = !isPremium && idx > 0;

                  return (
                    <div
                      key={`desktop-${pred.prediction_id ?? idx}-${pred.prediction_display_name}`}
                      className="h-[22px] flex items-center gap-[6px] bg-[#ffffff26] border border-[#7c8a9c] rounded-[4px] px-[12px] py-[2px] shrink-0"
                      style={{ boxShadow: '0 0 20px rgba(0, 0, 0, 0.04)' }}
                    >
                      <span
                        className={`text-[12px] font-semibold leading-[18px] ${shouldBlur ? 'blur-[2px] select-none' : ''} ${
                          isHighConfidence
                            ? 'text-[#27ae60]'
                            : isLowConfidence
                            ? 'text-red-400'
                            : 'text-[#f39c12]'
                        }`}
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {percentage}%
                      </span>
                      <span
                        className={`text-white text-[12px] font-medium leading-[18px] whitespace-nowrap ${shouldBlur ? 'blur-[2px] select-none' : ''}`}
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {pred.prediction_display_name || 'Prediction'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </>
  );
}
