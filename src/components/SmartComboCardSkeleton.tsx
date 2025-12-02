import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const SmartComboCardSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-md bg-[#1a237e] rounded-2xl p-4 shadow-lg animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-7 bg-white/20 rounded w-32"></div>
        <div className="w-6 h-6 bg-white/20 rounded-full"></div>
      </div>

      {/* White content card */}
      <Card className="bg-white border-0 shadow-none">
        <CardContent className="p-5 space-y-6">
          {/* Accuracy Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2"></div>
          </div>

          {/* Match 1 */}
          <div>
            {/* Competition */}
            <div className="text-center mb-4">
              <div className="h-3 bg-gray-200 rounded w-56 mx-auto"></div>
            </div>

            {/* Teams and Time */}
            <div className="flex items-center justify-between mb-6">
              {/* Home Team */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 mb-2 bg-gray-200 rounded-lg"></div>
                <div className="h-3 bg-gray-200 rounded w-10"></div>
              </div>

              {/* Time */}
              <div className="flex flex-col items-center px-4">
                <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-12"></div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 mb-2 bg-gray-200 rounded-lg"></div>
                <div className="h-3 bg-gray-200 rounded w-10"></div>
              </div>
            </div>

            {/* Predictions */}
            <div className="space-y-4">
              {/* Prediction 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 rounded w-36"></div>
                  <div className="h-3 bg-gray-200 rounded w-10"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5"></div>
                <div className="h-2 bg-gray-200 rounded w-24"></div>
              </div>

              {/* Prediction 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 rounded w-40"></div>
                  <div className="h-3 bg-gray-200 rounded w-10"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5"></div>
                <div className="h-2 bg-gray-200 rounded w-28"></div>
              </div>

              {/* Prediction 3 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-10"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5"></div>
                <div className="h-2 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>

          {/* Match 2 */}
          <div className="pt-6 border-t border-gray-100">
            {/* Competition */}
            <div className="text-center mb-4">
              <div className="h-3 bg-gray-200 rounded w-56 mx-auto"></div>
            </div>

            {/* Teams and Time */}
            <div className="flex items-center justify-between mb-6">
              {/* Home Team */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 mb-2 bg-gray-200 rounded-lg"></div>
                <div className="h-3 bg-gray-200 rounded w-10"></div>
              </div>

              {/* Time */}
              <div className="flex flex-col items-center px-4">
                <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-12"></div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 mb-2 bg-gray-200 rounded-lg"></div>
                <div className="h-3 bg-gray-200 rounded w-10"></div>
              </div>
            </div>

            {/* Predictions */}
            <div className="space-y-4">
              {/* Prediction 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 rounded w-40"></div>
                  <div className="h-3 bg-gray-200 rounded w-10"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5"></div>
                <div className="h-2 bg-gray-200 rounded w-28"></div>
              </div>

              {/* Prediction 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 rounded w-36"></div>
                  <div className="h-3 bg-gray-200 rounded w-10"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5"></div>
                <div className="h-2 bg-gray-200 rounded w-24"></div>
              </div>

              {/* Prediction 3 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-10"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5"></div>
                <div className="h-2 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>

          {/* See More Button */}
          <div className="w-full h-10 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartComboCardSkeleton;
