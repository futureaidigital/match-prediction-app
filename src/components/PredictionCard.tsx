import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Types
interface Insight {
  id: string;
  text: string;
  icon?: React.ReactNode;
}

interface PredictionCardProps {
  id: string;
  title: string;
  category: string; // "Player", "Team", "Match", etc.
  percentage: number;
  trend?: 'up' | 'down';
  trendValue?: number;
  trendTimeframe?: string;
  preGamePrediction?: number;
  insights?: Insight[];
  insightTitle?: string;
  defaultExpanded?: boolean;
  onCategoryClick?: () => void;
}

const PredictionCard: React.FC<PredictionCardProps> = ({
  // id, // Reserved for future use
  title,
  category,
  percentage,
  trend,
  trendValue,
  trendTimeframe,
  preGamePrediction,
  insights = [],
  insightTitle,
  defaultExpanded = false,
  onCategoryClick
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const TrendIndicator = () => {
    if (!trend || !trendValue) return null;

    const Icon = trend === 'up' ? TrendingUp : TrendingDown;
    const colorClass = trend === 'up' ? 'text-green-500' : 'text-red-500';

    return (
      <div className={`flex items-center gap-1 text-sm ${colorClass}`}>
        <Icon className="w-4 h-4" />
        <span>{trendValue}% in the last {trendTimeframe}</span>
      </div>
    );
  };

  const PredictionContent = ({ isInExpanded = false }: { isInExpanded?: boolean }) => (
    <div className={isInExpanded ? 'mb-6' : ''}>
      <div className="flex items-center justify-between mb-2">
        <span className={`font-bold ${isInExpanded ? 'text-white text-2xl' : 'text-green-600 text-3xl'}`}>
          {percentage}%
        </span>
        <TrendIndicator />
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            percentage >= 70 ? 'bg-green-500' :
            percentage >= 50 ? 'bg-orange-400' :
            'bg-gray-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {preGamePrediction !== undefined && (
        <div className="flex items-center justify-between text-sm">
          <span className={isInExpanded ? 'text-white/70' : 'text-gray-500'}>Pre-game Prediction:</span>
          <span className={isInExpanded ? 'text-white font-semibold' : 'text-green-600 font-semibold'}>
            {preGamePrediction}%
          </span>
        </div>
      )}
    </div>
  );

  return (
    <Card
      className={`w-full border-0 shadow-md overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded && insights.length > 0 ? 'bg-[#1a237e]' : 'bg-white border border-gray-200'
      } ${!isExpanded ? 'hover:shadow-lg' : ''}`}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold transition-colors duration-500 ${
            isExpanded && insights.length > 0 ? 'text-white' : 'text-gray-900'
          }`}>
            {isExpanded && insights.length > 0 ? (insightTitle || title) : title}
          </h3>
          <div className="flex items-center gap-2">
            {isExpanded && insights.length > 0 ? (
              <button
                onClick={() => setIsExpanded(false)}
                className="flex items-center gap-2 bg-white hover:bg-gray-100 text-[#1a237e] px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                {category}
                <ChevronUp className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Badge
                  onClick={onCategoryClick}
                  className="bg-[#E8EAF6] text-[#1a237e] hover:bg-[#C5CAE9] cursor-pointer px-3 py-1 text-sm font-semibold"
                >
                  {category}
                </Badge>
                {insights.length > 0 && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Prediction Content */}
        {isExpanded && insights.length > 0 ? (
          <div className="bg-white rounded-lg p-4 mb-4 animate-slide-in-from-top">
            <PredictionContent isInExpanded={false} />
          </div>
        ) : (
          <PredictionContent />
        )}

        {/* Insights - Animated */}
        {isExpanded && insights.length > 0 && (
          <div className="space-y-3 animate-slide-in-from-bottom">
            {insights.map((insight, index) => (
              <div
                key={insight.id}
                className="flex items-start gap-3 text-white animate-slide-in-from-left"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {insight.icon ? (
                  <div className="mt-0.5 flex-shrink-0">{insight.icon}</div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-[#1a237e]" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="8" />
                    </svg>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionCard;
