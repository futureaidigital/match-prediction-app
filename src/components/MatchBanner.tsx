import { useMemo } from 'react';

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
}

export function MatchBanner({ fixture, predictions = [], showPredictions = false, carouselCount = 0, activeIndex = 0, onCarouselChange, isPremium = false }: MatchBannerProps) {
  const homeScore = fixture.home_team_score ?? 0;
  const awayScore = fixture.away_team_score ?? 0;

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
      {/* Mobile Version - Fixed height to accommodate 2-line team names */}
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
          <div className="flex-1 flex flex-col justify-center pt-[8px]">
            {/* League Name & Live Badge - 182x41px container */}
            <div className="flex flex-col items-center w-[182px] h-[41px] mx-auto mb-[4px]">
              <span
                className="text-[#7c8a9c] text-[14px] font-medium leading-[150%] text-center"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {fixture.league_name || 'UEFA Champions League'}
              </span>

              {/* Live Badge */}
              <div className="flex items-center justify-center gap-[4px]">
                <img src="/live.svg" alt="Live" className="w-[18px] h-[18px]" />
                <span
                  className="text-[#e74c3c] text-[12px] font-bold uppercase"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Live
                </span>
              </div>
            </div>

            {/* Teams and Score - centered layout with names below logos */}
            <div className="flex items-start justify-center w-full px-4 gap-[20px]">
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
                <span
                  className="text-white font-medium text-[11px] leading-tight text-center mt-[4px] line-clamp-2 min-h-[26px]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {fixture.home_team_name || 'Home Team'}
                </span>
              </div>

              {/* Score - centered */}
              <div className="flex items-center justify-center min-w-[90px] h-[50px]">
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
                <span
                  className="text-white font-medium text-[11px] leading-tight text-center mt-[4px] line-clamp-2 min-h-[26px]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {fixture.away_team_name || 'Away Team'}
                </span>
              </div>
            </div>

            {/* Minutes - below score */}
            <div className="text-center mt-[2px]">
              <span
                className="text-white text-[14px] font-medium leading-[150%]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {fixture.minutes_elapsed ?? 0}'
              </span>
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

      {/* Desktop Version - Figma specs: 1440x330px */}
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
          <div className="flex-1 flex flex-col justify-center pt-[20px]">
            {/* League Name & Live Badge - 285x61px box */}
            <div className="flex flex-col items-center mb-[12px] w-[285px] h-[61px] mx-auto">
              {/* League name - 27px height, 22px text */}
              <span
                className="text-[#7c8a9c] text-[22px] font-medium leading-[27px] text-center h-[27px]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {fixture.league_name || 'UEFA Champions League'}
              </span>

              {/* Live Badge - 62x24px */}
              <div className="flex items-center justify-center gap-[4px] w-[62px] h-[24px] mt-[10px]">
                <img src="/live.svg" alt="Live" className="w-5 h-5" />
                <span
                  className="text-[#e74c3c] text-[16px] font-semibold uppercase"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Live
                </span>
              </div>
            </div>

            {/* Teams and Score Row - centered layout with names below logos */}
            <div className="flex flex-col items-center w-[1100px] mx-auto">
              {/* Main row with teams and score */}
              <div className="flex items-start justify-center w-full gap-[80px]">
                {/* Home Team - logo with name below */}
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
                    className="text-white font-medium text-[18px] leading-tight text-center mt-[8px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {fixture.home_team_name || 'Home Team'}
                  </span>
                </div>

                {/* Score - centered */}
                <div className="flex items-center justify-center min-w-[180px] h-[90px]">
                  <span
                    className="text-white text-[66px] font-semibold leading-none"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {homeScore}
                  </span>
                  <span
                    className="text-white text-[66px] font-semibold leading-none mx-[8px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    -
                  </span>
                  <span
                    className="text-white text-[66px] font-semibold leading-none"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {awayScore}
                  </span>
                </div>

                {/* Away Team - logo with name below */}
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
                    className="text-white font-medium text-[18px] leading-tight text-center mt-[8px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {fixture.away_team_name || 'Away Team'}
                  </span>
                </div>
              </div>

              {/* Minutes below score */}
              <span
                className="text-white text-[18px] font-medium leading-[150%] mt-[2px]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {fixture.minutes_elapsed ?? 0}'
              </span>
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
    </>
  );
}
