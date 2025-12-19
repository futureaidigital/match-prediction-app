import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { PredictionBar } from '@/components/ui/PredictionBar';
import { DEFAULTS } from '@/config/defaults';

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
          <TeamAvatar
            logo={homeTeam.logo}
            name={homeTeam.name}
            shortName={homeTeam.shortName}
            size="md"
            showName
            namePosition="bottom"
          />

          {/* Time */}
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-900 text-lg">{kickoffTime || DEFAULTS.KICKOFF_TIME}</span>
            {isToday && (
              <span className="text-gray-400 text-xs font-medium">{DEFAULTS.TODAY_LABEL}</span>
            )}
          </div>

          {/* Away Team - Vertical */}
          <TeamAvatar
            logo={awayTeam.logo}
            name={awayTeam.name}
            shortName={awayTeam.shortName}
            size="md"
            showName
            namePosition="bottom"
          />
        </div>

        {/* Predictions */}
        <div className="space-y-3">
          {/* Visible Predictions */}
          {visiblePredictions.map((prediction) => (
            <PredictionBar
              key={prediction.id}
              label={prediction.label}
              percentage={prediction.percentage}
              trend={prediction.trend}
              size="sm"
            />
          ))}

          {/* Blurred Predictions */}
          {!isPremium && blurredPredictions.map((prediction) => (
            <PredictionBar
              key={prediction.id}
              label={prediction.label}
              percentage={prediction.percentage}
              trend={prediction.trend}
              size="sm"
              isBlurred
            />
          ))}
        </div>
      </div>
    );
  }

  // Default variant (for Featured Matches)
  return (
    <div
      className="bg-white rounded-2xl p-[15px] md:p-5 w-[334px] h-[293px] md:w-[290px] md:h-[478px] flex flex-col hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Competition Header */}
      <div className="text-center text-gray-500 text-[12px] md:text-[14px] font-medium mb-3 truncate px-2 shrink-0 h-[17px] md:h-auto">
        {competition && competition.trim() ? competition : 'SPORTS Pred League'}
      </div>

      {/* Teams and Score Section - Horizontal Layout */}
      <div className="flex items-center justify-between mb-[10px] md:mb-4 px-2 shrink-0">
        {/* Home Team */}
        <div className="flex flex-col items-center justify-center gap-1 w-[101px] h-[57px] shrink-0 md:w-20 md:h-auto">
          <div className="md:mb-2">
            <TeamAvatar
              logo={homeTeam.logo}
              name={homeTeam.name}
              shortName={homeTeam.shortName}
              size="md"
            />
          </div>
          <span className="font-semibold md:font-bold text-black text-[12px] md:text-[14px] md:tracking-wide">{homeTeam.shortName}</span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center justify-center w-[101px] h-[57px] shrink-0 md:w-auto md:h-auto">
          <div className="text-[22px] md:text-3xl font-bold text-gray-900 md:tracking-tight">
            {score ? `${score.home} - ${score.away}` : 'vs'}
          </div>
          {status === 'live' && currentMinute && (
            <span className="text-blue-500 text-[13px] md:text-[14px] font-semibold md:font-bold mt-1">
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
        <div className="flex flex-col items-center justify-center gap-1 w-[101px] h-[57px] shrink-0 md:w-20 md:h-auto">
          <div className="md:mb-2">
            <TeamAvatar
              logo={awayTeam.logo}
              name={awayTeam.name}
              shortName={awayTeam.shortName}
              size="md"
            />
          </div>
          <span className="font-semibold md:font-bold text-black text-[12px] md:text-[14px] md:tracking-wide">{awayTeam.shortName}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 w-full md:-mx-2 md:w-auto mb-[10px] md:mb-4" />

      {/* Predictions Section */}
      <div className="flex-1 space-y-2 overflow-hidden min-h-0 md:-mx-2">
        {/* Visible Predictions */}
        {visiblePredictions.map((prediction, index) => (
          <PredictionBar
            key={`${prediction.id}-${index}`}
            label={prediction.label}
            percentage={prediction.percentage}
            trend={prediction.trend}
            size="md"
            showBackground
          />
        ))}

        {/* Blurred Predictions (for non-premium) */}
        {!isPremium && blurredPredictions.map((prediction) => (
          <PredictionBar
            key={prediction.id}
            label={prediction.label}
            percentage={prediction.percentage}
            trend={prediction.trend}
            size="md"
            showBackground
            isBlurred
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-0 pt-2 shrink-0">
        {/* Predictions Count Divider */}
        {totalPredictions && totalPredictions > 0 && (
          <div className="flex items-center justify-center mb-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="px-3 text-xs text-gray-500 font-medium whitespace-nowrap">
              <span className="md:hidden">{visiblePredictions.length} out of {totalPredictions} Predictions</span>
              <span className="hidden md:inline">{predictions.length} out of {totalPredictions} Predictions</span>
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}

        {/* See More Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleCardClick}
            className="w-[304px] md:w-[262px] h-[40px] bg-[#0d1a67] hover:bg-[#0a1452] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
          {!isPremium && <img src="/Lock.svg" alt="" className="w-3.5 h-4" />}
            See More
          </Button>
        </div>

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
