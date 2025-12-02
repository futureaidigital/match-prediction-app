import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Types
interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
}

interface UpcomingMatchCardProps {
  id: string;
  competition: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoffTime: string;
  onLearnMore?: () => void;
}

const UpcomingMatchCard: React.FC<UpcomingMatchCardProps> = ({
  // id, // Reserved for future use
  competition,
  homeTeam,
  awayTeam,
  kickoffTime,
  onLearnMore
}) => {
  return (
    <Card className="w-full max-w-sm bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden">
      <CardContent className="p-6 text-center">
        {/* Competition */}
        <h3 className="text-gray-400 text-sm font-medium mb-2">
          {competition}
        </h3>

        {/* Kickoff Time */}
        <p className="text-orange-500 text-xl font-bold mb-6">
          {kickoffTime}
        </p>

        {/* Teams */}
        <div className="flex items-center justify-center gap-8 mb-6">
          {/* Home Team */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-3 flex items-center justify-center">
              <img
                src={homeTeam.logo}
                alt={homeTeam.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/64?text=' + homeTeam.shortName;
                }}
              />
            </div>
            <span className="text-gray-900 text-lg font-bold">{homeTeam.shortName}</span>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-px bg-gray-300"></div>
              <span className="text-gray-400 text-sm font-semibold">vs</span>
              <div className="w-8 h-px bg-gray-300"></div>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-3 flex items-center justify-center">
              <img
                src={awayTeam.logo}
                alt={awayTeam.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/64?text=' + awayTeam.shortName;
                }}
              />
            </div>
            <span className="text-gray-900 text-lg font-bold">{awayTeam.shortName}</span>
          </div>
        </div>

        {/* Learn More Link */}
        {onLearnMore && (
          <button
            onClick={onLearnMore}
            className="text-[#5B6EE1] text-base font-semibold hover:text-[#4A5AD0] transition-colors"
          >
            Learn More
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingMatchCard;
