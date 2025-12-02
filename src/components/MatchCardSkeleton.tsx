import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const MatchCardSkeleton: React.FC = () => {
  return (
    <Card className="w-full max-w-sm bg-white shadow-sm animate-pulse">
      {/* Header */}
      <CardHeader className="pb-3 bg-gray-50/50 border-b">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-200 rounded w-40"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Teams and Score */}
        <div className="flex items-center justify-between mb-6">
          {/* Home Team */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-12 h-12 mb-2 bg-gray-200 rounded-lg"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>

          {/* Score/VS */}
          <div className="px-6">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-12 h-12 mb-2 bg-gray-200 rounded-lg"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        </div>

        {/* Predictions */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          {/* Prediction 1 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <div className="h-3 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-10"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5"></div>
            <div className="h-2 bg-gray-200 rounded w-24"></div>
          </div>

          {/* Prediction 2 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <div className="h-3 bg-gray-200 rounded w-36"></div>
              <div className="h-3 bg-gray-200 rounded w-10"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5"></div>
            <div className="h-2 bg-gray-200 rounded w-28"></div>
          </div>

          {/* Prediction 3 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <div className="h-3 bg-gray-200 rounded w-40"></div>
              <div className="h-3 bg-gray-200 rounded w-10"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5"></div>
            <div className="h-2 bg-gray-200 rounded w-20"></div>
          </div>

          {/* Prediction Counter */}
          <div className="text-center pt-2">
            <div className="h-2 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>

        {/* See More Button */}
        <div className="mt-4">
          <div className="w-full h-10 bg-gray-200 rounded"></div>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-3">
          <div className="h-2 bg-gray-200 rounded w-24 mx-auto"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export { MatchCardSkeleton };
export default MatchCardSkeleton;
