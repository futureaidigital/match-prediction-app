import React from 'react';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Types
interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
}

interface Prediction {
  id: string;
  label: string;
  percentage: number;
  trend?: 'up' | 'down';
  trendValue?: number;
  trendTimeframe?: string;
  isBlurred?: boolean;
}

interface ComboMatch {
  id: string;
  competition: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoffTime: string;
  kickoffLabel?: string;
  predictions: Prediction[];
}

interface SmartComboCardProps {
  title?: string;
  accuracyPercentage: number;
  accuracyLabel: string;
  matches: ComboMatch[];
  onSeeMore?: () => void;
  onInfoClick?: () => void;
}

const SmartComboCard: React.FC<SmartComboCardProps> = ({
  title = "Smart Combo",
  accuracyPercentage,
  accuracyLabel,
  matches,
  onSeeMore,
  onInfoClick
}) => {
  // Trend indicator
  const TrendIndicator = ({ trend, value, timeframe }: {
    trend?: 'up' | 'down';
    value?: number;
    timeframe?: string;
  }) => {
    if (!trend || !value) return null;

    const Icon = trend === 'up' ? TrendingUp : TrendingDown;
    const colorClass = trend === 'up' ? 'text-green-500' : 'text-red-500';

    return (
      <div className={`flex items-center gap-1 text-xs ${colorClass}`}>
        <Icon className="w-3 h-3" />
        <span>{value}% in the last {timeframe}</span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md bg-[#1a237e] rounded-2xl p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-2xl font-bold">{title}</h2>
        <button
          onClick={onInfoClick}
          className="text-white/80 hover:text-white transition-colors"
        >
          <Info className="w-6 h-6" />
        </button>
      </div>

      {/* White content card */}
      <Card className="bg-white border-0 shadow-none">
        <CardContent className="p-5 space-y-6">
          {/* Accuracy Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{accuracyPercentage}%</span>
              <span className="text-sm text-gray-500">{accuracyLabel}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${accuracyPercentage}%` }}
              />
            </div>
          </div>

          {/* Matches */}
          {matches.map((match, matchIndex) => (
            <div key={match.id} className={matchIndex > 0 ? 'pt-6 border-t border-gray-100' : ''}>
              {/* Competition */}
              <p className="text-center text-sm text-gray-400 mb-4">
                {match.competition}
              </p>

              {/* Teams and Time */}
              <div className="flex items-center justify-between mb-6">
                {/* Home Team */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-12 h-12 mb-2 flex items-center justify-center">
                    <img
                      src={match.homeTeam.logo}
                      alt={match.homeTeam.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/48?text=' + match.homeTeam.shortName;
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{match.homeTeam.shortName}</span>
                </div>

                {/* Time */}
                <div className="flex flex-col items-center px-4">
                  <span className="text-2xl font-bold text-gray-900 mb-1">{match.kickoffTime}</span>
                  <span className="text-xs text-gray-400 uppercase">{match.kickoffLabel || 'TODAY'}</span>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-12 h-12 mb-2 flex items-center justify-center">
                    <img
                      src={match.awayTeam.logo}
                      alt={match.awayTeam.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/48?text=' + match.awayTeam.shortName;
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{match.awayTeam.shortName}</span>
                </div>
              </div>

              {/* Predictions */}
              {match.predictions.length > 0 && (
                <div className="space-y-4">
                  {match.predictions.map((prediction) => (
                    <div key={prediction.id} className="space-y-1.5">
                      {/* Prediction Label and Percentage */}
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium text-gray-700 ${prediction.isBlurred ? 'blur-sm select-none' : ''}`}>
                          {prediction.label}
                        </span>
                        {prediction.isBlurred ? (
                          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded blur-sm select-none">
                            {prediction.percentage}%
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-green-600">
                            {prediction.percentage}%
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            prediction.percentage >= 70 ? 'bg-green-500' :
                            prediction.percentage >= 50 ? 'bg-orange-400' :
                            'bg-gray-400'
                          } ${prediction.isBlurred ? 'blur-sm' : ''}`}
                          style={{ width: `${prediction.percentage}%` }}
                        />
                      </div>

                      {/* Trend */}
                      {!prediction.isBlurred && prediction.trend && (
                        <TrendIndicator
                          trend={prediction.trend}
                          value={prediction.trendValue}
                          timeframe={prediction.trendTimeframe}
                        />
                      )}
                      {prediction.isBlurred && (
                        <div className="text-xs text-gray-400 blur-sm select-none">
                          ↓ 4% in the last 6 min
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* See More Button */}
          {onSeeMore && (
            <Button
              onClick={onSeeMore}
              variant="outline"
              className="w-full border-2 border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white font-semibold transition-colors"
            >
              See more
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartComboCard;
