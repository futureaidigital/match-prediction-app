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
  // Blur all predictions (for free users beyond first page)
  blurAllPredictions?: boolean;
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
  onSeeMore: _onSeeMore,
  isPremium = false,
  blurAllPredictions = false,
  variant = 'default',
  isToday = false
}: MatchCardProps) {
  const navigate = useNavigate();
  const isCompact = variant === 'compact';

  const handleCardClick = () => {
    navigate(`/match/${id}`);
  };

  // For premium users: show ALL predictions (none blurred)
  // For free users on page 1: show 1 visible, blur the rest
  // For free users on page 2+: blur ALL predictions (blurAllPredictions=true)
  const visibleCount = isPremium ? predictions.length : (blurAllPredictions ? 0 : 1);

  const visiblePredictions = predictions.slice(0, visibleCount);
  const blurredPredictions = isPremium ? [] : predictions.slice(visibleCount);

  // Compact variant (for Smart Combo) - vertical team layout
  // Desktop: 412px width, Mobile: 318x295px
  // Only show 2 predictions in compact variant
  const compactVisiblePredictions = visiblePredictions.slice(0, 2);
  const compactBlurredPredictions = blurredPredictions.slice(0, Math.max(0, 2 - compactVisiblePredictions.length));

  if (isCompact) {
    return (
      <div
        onClick={handleCardClick}
        className="bg-white rounded-xl p-3 md:p-4 cursor-pointer transition-shadow w-[318px] md:w-[412px] h-[295px] md:h-auto mx-auto flex flex-col"
        style={{
          boxShadow: '0 0 12px rgba(0, 0, 0, 0.08)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.12)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 0, 0, 0.08)'}
      >
        {/* Competition Header */}
        <div className="text-gray-400 text-[14px] md:text-xs font-medium mb-2 md:mb-3 text-center">
          {competition}
        </div>

        {/* Teams and Time Row - Mobile: 288x63px with 20px gap, Desktop: 382x66px with original spacing */}
        <div className="flex items-center justify-between w-[288px] md:w-[382px] h-[63px] md:h-[66px] mx-auto mb-[20px] md:mb-4 pb-[20px] md:pb-4 border-b border-gray-100">
          {/* Home Team - Vertical, Mobile: 40x40 logo, Desktop: 34x34 logo */}
          <div className="md:hidden">
            <TeamAvatar
              logo={homeTeam.logo}
              name={homeTeam.name}
              shortName={homeTeam.shortName}
              size="xl"
              showName
              namePosition="bottom"
            />
          </div>
          <div className="hidden md:block">
            <TeamAvatar
              logo={homeTeam.logo}
              name={homeTeam.name}
              shortName={homeTeam.shortName}
              size="md"
              showName
              namePosition="bottom"
            />
          </div>

          {/* Time - auto spacing with justify-between */}
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-900 text-lg">{kickoffTime || DEFAULTS.KICKOFF_TIME}</span>
            {isToday && (
              <span className="text-gray-400 text-xs font-medium">{DEFAULTS.TODAY_LABEL}</span>
            )}
          </div>

          {/* Away Team - Vertical, Mobile: 40x40 logo, Desktop: 34x34 logo */}
          <div className="md:hidden">
            <TeamAvatar
              logo={awayTeam.logo}
              name={awayTeam.name}
              shortName={awayTeam.shortName}
              size="xl"
              showName
              namePosition="bottom"
            />
          </div>
          <div className="hidden md:block">
            <TeamAvatar
              logo={awayTeam.logo}
              name={awayTeam.name}
              shortName={awayTeam.shortName}
              size="md"
              showName
              namePosition="bottom"
            />
          </div>
        </div>

        {/* Predictions - Only show 2 in compact variant, Mobile: 288x134px box, stuck to bottom */}
        <div className="w-[288px] h-[134px] md:w-[382px] md:h-auto mx-auto space-y-3 flex flex-col justify-start mb-2 md:mb-0">
          {/* Visible Predictions (max 2) */}
          {compactVisiblePredictions.map((prediction) => (
            <PredictionBar
              key={prediction.id}
              label={prediction.label}
              percentage={prediction.percentage}
              trend={prediction.trend}
              size="sm"
            />
          ))}

          {/* Blurred Predictions (fill up to 2 total) */}
          {!isPremium && compactBlurredPredictions.map((prediction) => (
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
      className="bg-white rounded-2xl p-[15px] md:p-5 w-[334px] h-[380px] md:w-[290px] md:h-[500px] flex flex-col transition-shadow overflow-hidden"
      style={{
        boxShadow: '0 0 12px rgba(0, 0, 0, 0.08)'
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.12)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 0, 0, 0.08)'}
    >
      {/* Competition Header */}
      <div className="text-center text-gray-500 text-[12px] md:text-[14px] font-medium mb-3 truncate px-2 shrink-0 h-[17px] md:h-auto">
        {competition && competition.trim() ? competition : 'SPORTS Pred League'}
      </div>

      {/* Teams and Score Section - Horizontal Layout */}
      <div className="flex items-center justify-between mb-[12px] md:mb-4 px-0 md:px-2 shrink-0">
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
      <div className="h-px bg-gray-200 w-full md:-mx-2 md:w-auto mb-[12px] md:mb-3" />

      {/* Predictions Section */}
      {/* Mobile: Show only 1 prediction (unblurred for premium, unblurred for free on page 1) */}
      {/* Desktop: Show all predictions (premium sees all unblurred, free sees 1 unblurred + rest blurred) */}
      <div className="flex-1 space-y-2 overflow-hidden min-h-0 md:-mx-2 flex flex-col justify-center md:justify-start">
        {/* Mobile: Show first 2 predictions */}
        <div className="md:hidden space-y-2">
          {predictions.slice(0, 2).map((prediction, index) => (
            <PredictionBar
              key={`mobile-${prediction.id}-${index}`}
              label={prediction.label}
              percentage={prediction.percentage}
              trend={prediction.trend}
              size="md"
              showBackground
            />
          ))}
        </div>

        {/* Desktop: Show visible predictions (all for premium, 1 for free) */}
        <div className="hidden md:block space-y-2">
          {visiblePredictions.map((prediction, index) => (
            <PredictionBar
              key={`desktop-${prediction.id}-${index}`}
              label={prediction.label}
              percentage={prediction.percentage}
              trend={prediction.trend}
              size="md"
              showBackground
            />
          ))}

          {/* Desktop: Blurred Predictions (for non-premium only) */}
          {!isPremium && blurredPredictions.map((prediction) => (
            <PredictionBar
              key={`blurred-${prediction.id}`}
              label={prediction.label}
              percentage={prediction.percentage}
              trend={prediction.trend}
              size="md"
              showBackground
              isBlurred
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-[12px] md:pt-4 shrink-0">
        {/* Predictions Count Divider */}
        {totalPredictions && totalPredictions > 0 && (
          <div className="flex items-center justify-center mb-3">
            <div className="flex-1 h-px bg-gradient-to-r from-white to-gray-200" />
            <span className="px-3 text-[11px] md:text-xs text-gray-500 font-medium whitespace-nowrap">
              <span className="md:hidden">{Math.min(2, predictions.length)} out of {totalPredictions} Predictions</span>
              <span className="hidden md:inline">{predictions.length} out of {totalPredictions} Predictions</span>
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-white" />
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
          <div className="text-center text-[11px] md:text-xs text-gray-400 mt-3">
            Updated {lastUpdated}
          </div>
        )}
      </div>
    </div>
  );
}
