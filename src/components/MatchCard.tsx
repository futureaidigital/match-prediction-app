import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Team {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
}

interface Score {
  home: number;
  away: number;
}

interface Prediction {
  id: string;
  label: string;
  percentage: number;
  trend?: {
    direction: 'up' | 'down';
    value: number;
    timeframe: string;
  };
  isBlurred?: boolean;
}

interface MatchCardProps {
  id: string;
  competition: string;
  homeTeam: Team;
  awayTeam: Team;
  score?: Score;
  status: 'live' | 'upcoming' | 'finished';
  currentMinute?: number;
  kickoffTime?: string;
  predictions: Prediction[];
  totalPredictions?: number;
  lastUpdated?: string;
  onSeeMore?: () => void;
  isPremium?: boolean;
  // Variant for different layouts
  variant?: 'default' | 'compact';
  // For compact variant
  isToday?: boolean;
}

export function MatchCard({
  id,
  competition,
  homeTeam,
  awayTeam,
  score,
  status,
  currentMinute,
  kickoffTime,
  predictions,
  totalPredictions,
  lastUpdated,
  onSeeMore,
  isPremium = false,
  variant = 'default',
  isToday = false
}: MatchCardProps) {
  const navigate = useNavigate();
  const isCompact = variant === 'compact';

  const handleCardClick = () => {
    navigate(`/match/${id}`);
  };

  // For premium users: show ALL predictions (none blurred)
  // For free users: show 1 visible, blur the rest (for both default and compact)
  const visibleCount = isPremium ? predictions.length : 1;

  const visiblePredictions = predictions.slice(0, visibleCount);
  const blurredPredictions = isPremium ? [] : predictions.slice(visibleCount);

  // Compact variant (for Smart Combo) - vertical team layout
  if (isCompact) {
    return (
      <div
        onClick={handleCardClick}
        className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      >
        {/* Competition Header */}
        <div className="text-gray-400 text-xs font-medium mb-3 text-center">
          {competition}
        </div>

        {/* Teams and Time Row - Vertical team layout */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          {/* Home Team - Vertical */}
          <div className="flex flex-col items-center gap-1">
            {homeTeam.logo ? (
              <img
                src={homeTeam.logo}
                alt={homeTeam.name}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-gray-200">
                <span className="text-xs font-bold text-gray-500">
                  {homeTeam.shortName?.slice(0, 3)}
                </span>
              </div>
            )}
            <span className="font-bold text-gray-900 text-xs">{homeTeam.shortName}</span>
          </div>

          {/* Time */}
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-900 text-lg">{kickoffTime || 'TBD'}</span>
            {isToday && (
              <span className="text-gray-400 text-xs font-medium">TODAY</span>
            )}
          </div>

          {/* Away Team - Vertical */}
          <div className="flex flex-col items-center gap-1">
            {awayTeam.logo ? (
              <img
                src={awayTeam.logo}
                alt={awayTeam.name}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-gray-200">
                <span className="text-xs font-bold text-gray-500">
                  {awayTeam.shortName?.slice(0, 3)}
                </span>
              </div>
            )}
            <span className="font-bold text-gray-900 text-xs">{awayTeam.shortName}</span>
          </div>
        </div>

        {/* Predictions */}
        <div className="space-y-3">
          {/* Visible Prediction */}
          {visiblePredictions.map((prediction) => (
            <div key={prediction.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-800 font-medium text-sm">
                  {prediction.label}
                </span>
                <span className="text-green-600 font-bold text-sm">
                  {prediction.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${prediction.percentage}%` }}
                />
              </div>
              {prediction.trend && (
                <div className="flex items-center text-xs">
                  <span className={`font-medium ${prediction.trend.direction === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                    {prediction.trend.direction === 'up' ? '↑' : '↓'} {prediction.trend.value.toFixed(0)}%
                  </span>
                  <span className="text-gray-400 ml-1">
                    in the last {prediction.trend.timeframe}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Blurred Predictions */}
          {!isPremium && blurredPredictions.map((prediction) => (
            <div key={prediction.id} className="blur-[4px] select-none pointer-events-none">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-800 font-medium text-sm">
                  {prediction.label}
                </span>
                <span className="text-green-600 font-bold text-sm">
                  {prediction.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                <div
                  className="bg-green-500 h-1.5 rounded-full"
                  style={{ width: `${prediction.percentage}%` }}
                />
              </div>
              {prediction.trend && (
                <div className="flex items-center text-xs">
                  <span className={`font-medium ${prediction.trend.direction === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                    {prediction.trend.direction === 'up' ? '↑' : '↓'} {prediction.trend.value.toFixed(0)}%
                  </span>
                  <span className="text-gray-400 ml-1">in the last {prediction.trend.timeframe}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default variant (for Featured Matches)
  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-5 w-full flex flex-col cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Competition Header */}
      <div className="text-center text-gray-400 text-xs font-medium mb-4 truncate px-2">
        {competition}
      </div>

      {/* Teams and Score Section - Horizontal Layout */}
      <div className="flex items-center justify-between mb-5 px-2">
        {/* Home Team */}
        <div className="flex flex-col items-center w-20">
          {homeTeam.logo ? (
            <img
              src={homeTeam.logo}
              alt={homeTeam.name}
              className="w-12 h-12 object-contain mb-2"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-2 border border-gray-200">
              <span className="text-sm font-bold text-gray-500">
                {homeTeam.shortName?.slice(0, 3)}
              </span>
            </div>
          )}
          <span className="font-bold text-gray-900 text-sm tracking-wide">{homeTeam.shortName}</span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold text-gray-900 tracking-tight">
            {score ? `${score.home} - ${score.away}` : 'vs'}
          </div>
          {status === 'live' && currentMinute && (
            <span className="text-blue-500 text-sm font-bold mt-1">
              {currentMinute}'
            </span>
          )}
          {status === 'upcoming' && kickoffTime && (
            <span className="text-gray-500 text-sm font-medium mt-1">
              {kickoffTime}
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center w-20">
          {awayTeam.logo ? (
            <img
              src={awayTeam.logo}
              alt={awayTeam.name}
              className="w-12 h-12 object-contain mb-2"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-2 border border-gray-200">
              <span className="text-sm font-bold text-gray-500">
                {awayTeam.shortName?.slice(0, 3)}
              </span>
            </div>
          )}
          <span className="font-bold text-gray-900 text-sm tracking-wide">{awayTeam.shortName}</span>
        </div>
      </div>

      {/* Predictions Section */}
      <div className="flex-1 space-y-3">
        {/* Visible Predictions */}
        {visiblePredictions.map((prediction, index) => (
          <div key={`${prediction.id}-${index}`} className="bg-gray-50/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-800 font-semibold text-sm truncate pr-2">
                {prediction.label}
              </span>
              <span className="text-green-600 font-bold text-base">
                {prediction.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${prediction.percentage}%` }}
              />
            </div>
            {prediction.trend && (
              <div className="flex items-center text-xs">
                <span className={`font-medium ${prediction.trend.direction === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                  {prediction.trend.direction === 'up' ? '↑' : '↓'} {prediction.trend.value.toFixed(0)}%
                </span>
                <span className="text-gray-400 ml-1">
                  in the last {prediction.trend.timeframe}
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Blurred Predictions (for non-premium) */}
        {!isPremium && blurredPredictions.map((prediction) => (
          <div key={prediction.id} className="relative bg-gray-50/50 rounded-lg p-3">
            <div className="blur-[6px] select-none pointer-events-none">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-800 font-semibold text-sm">
                  {prediction.label}
                </span>
                <span className="text-green-600 font-bold text-base">
                  {prediction.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${prediction.percentage}%` }}
                />
              </div>
              {prediction.trend && (
                <div className="flex items-center text-xs">
                  <span className={`font-medium ${prediction.trend.direction === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                    {prediction.trend.direction === 'up' ? '↑' : '↓'} {prediction.trend.value.toFixed(0)}%
                  </span>
                  <span className="text-gray-400 ml-1">in the last {prediction.trend.timeframe}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3">
        {/* Predictions Count Divider */}
        {totalPredictions && totalPredictions > 0 && (
          <div className="flex items-center justify-center mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="px-4 text-xs text-gray-500 font-medium whitespace-nowrap">
              {predictions.length} out of {totalPredictions} Predictions
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}

        {/* See More Button */}
        <Button
          onClick={onSeeMore}
          className="w-full bg-[#0d1a67] hover:bg-[#0a1452] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {!isPremium && <img src="/Lock.svg" alt="" className="w-3.5 h-4" />}
          {isPremium ? 'View Details' : 'See More'}
        </Button>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-center text-xs text-gray-400 mt-3">
            Updated {lastUpdated}
          </div>
        )}
      </div>
    </div>
  );
}
