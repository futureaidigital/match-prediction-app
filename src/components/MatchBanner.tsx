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
}

export function MatchBanner({ fixture, predictions = [], showPredictions = false }: MatchBannerProps) {
  const isLive = fixture.minutes_elapsed !== null && fixture.minutes_elapsed !== undefined;
  const homeScore = fixture.home_team_score ?? 0;
  const awayScore = fixture.away_team_score ?? 0;

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-2xl">
      {/* Main Content with stadium background */}
      <div
        className="relative flex flex-col"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(30, 58, 95, 0.85) 0%, rgba(13, 24, 41, 0.95) 100%), url('/stadium-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Main Content Area */}
        <div className="relative py-6 md:py-8">
          {/* League Name */}
          <div className="text-center mb-2">
            <span className="text-blue-300 text-sm md:text-base font-medium tracking-wide">
              {fixture.league_name || 'League'}
            </span>
          </div>

          {/* Live Badge */}
          {isLive && (
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-500">
                  <circle cx="12" cy="12" r="3" fill="currentColor" className="animate-pulse" />
                  <path d="M8.5 8.5C7 10 7 14 8.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M15.5 8.5C17 10 17 14 15.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M5.5 5.5C2.5 8.5 2.5 15.5 5.5 18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M18.5 5.5C21.5 8.5 21.5 15.5 18.5 18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-red-500 text-sm font-bold">LIVE</span>
              </div>
            </div>
          )}

          {/* Teams and Score Row */}
          <div className="flex items-center justify-center px-4 md:px-8 gap-4 md:gap-8">
            {/* Home Team */}
            <div className="flex items-center gap-2 md:gap-4">
              {fixture.home_team_image_path ? (
                <img
                  src={fixture.home_team_image_path}
                  alt={fixture.home_team_name}
                  className="w-12 h-12 md:w-20 md:h-20 object-contain"
                />
              ) : (
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="text-white font-bold text-xs md:text-base">
                    {fixture.home_team_short_code?.slice(0, 3) || 'HOM'}
                  </span>
                </div>
              )}
              <span className="text-white font-semibold text-sm md:text-2xl">
                {fixture.home_team_short_code || fixture.home_team_name?.slice(0, 3).toUpperCase() || 'HOM'}
              </span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              <div className="text-white text-4xl md:text-7xl font-bold tracking-tight">
                {homeScore} - {awayScore}
              </div>
              {isLive && fixture.minutes_elapsed && (
                <span className="text-white/50 text-sm md:text-xl mt-1">
                  {fixture.minutes_elapsed}'
                </span>
              )}
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-2 md:gap-4">
              <span className="text-white font-semibold text-sm md:text-2xl">
                {fixture.away_team_short_code || fixture.away_team_name?.slice(0, 3).toUpperCase() || 'AWY'}
              </span>
              {fixture.away_team_image_path ? (
                <img
                  src={fixture.away_team_image_path}
                  alt={fixture.away_team_name}
                  className="w-12 h-12 md:w-20 md:h-20 object-contain"
                />
              ) : (
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="text-white font-bold text-xs md:text-base">
                    {fixture.away_team_short_code?.slice(0, 3) || 'AWY'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Predictions Section */}
        {showPredictions && predictions.length > 0 && (
          <div>
            {/* Label Row */}
            <div className="px-6 pt-2 pb-2">
              <span className="text-white/40 text-xs">
                High confidence predictions
              </span>
            </div>

            {/* Predictions Pills */}
            <div className="flex gap-2.5 px-6 pb-4 overflow-x-auto scrollbar-hide">
              {predictions.map((pred, idx) => {
                const percentage = Math.round(pred.prediction || pred.pre_game_prediction || 0);
                const isHighConfidence = percentage >= 70;
                const isLowConfidence = percentage < 50;

                return (
                  <div
                    key={pred.prediction_id || idx}
                    className="flex items-center gap-2 bg-white/10 border border-white/30 rounded-lg px-3 py-1.5 shrink-0"
                  >
                    <span
                      className={`text-xs font-semibold ${
                        isHighConfidence
                          ? 'text-green-400'
                          : isLowConfidence
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      {percentage}%
                    </span>
                    <span className="text-white/90 text-xs whitespace-nowrap">
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
  );
}
