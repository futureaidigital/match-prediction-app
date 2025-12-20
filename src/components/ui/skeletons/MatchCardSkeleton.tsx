import { cn } from '@/lib/utils';

interface MatchCardSkeletonProps {
  variant?: 'default' | 'compact' | 'banner';
  className?: string;
}

/**
 * MatchCardSkeleton - Reusable skeleton loader for match cards
 *
 * Provides consistent loading states across the app.
 */
export function MatchCardSkeleton({ variant = 'default', className }: MatchCardSkeletonProps) {
  if (variant === 'banner') {
    return (
      <div className={cn(
        'w-[358px] h-[195px] md:w-full md:h-auto mx-auto rounded-xl overflow-hidden bg-gradient-to-b from-[#1a2a4a] to-[#0d1829] animate-pulse',
        className
      )}>
        <div className="px-8 py-8">
          <div className="h-4 bg-white/20 rounded w-48 mx-auto mb-4" />
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20" />
              <div className="h-6 bg-white/20 rounded w-16" />
            </div>
            <div className="h-12 bg-white/20 rounded w-24" />
            <div className="flex items-center gap-4">
              <div className="h-6 bg-white/20 rounded w-16" />
              <div className="w-16 h-16 rounded-full bg-white/20" />
            </div>
          </div>
        </div>
        <div className="h-16 bg-[#0d1829]" />
      </div>
    );
  }

  if (variant === 'compact') {
    // Compact variant for Smart Combo - matches 412x370 desktop
    return (
      <div className={cn(
        'bg-white rounded-xl border border-gray-200 p-4 animate-pulse w-full md:w-[412px] md:h-[370px]',
        className
      )}>
        <div className="h-3 bg-gray-200 rounded w-32 mx-auto mb-3" />
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div className="flex flex-col items-center gap-1">
            <div className="w-[34px] h-[34px] bg-gray-200 rounded-full" />
            <div className="h-3 bg-gray-200 rounded w-10" />
          </div>
          <div className="flex flex-col items-center">
            <div className="h-6 bg-gray-200 rounded w-14" />
            <div className="h-3 bg-gray-200 rounded w-10 mt-1" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-[34px] h-[34px] bg-gray-200 rounded-full" />
            <div className="h-3 bg-gray-200 rounded w-10" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 rounded-lg" />
          <div className="h-16 bg-gray-100 rounded-lg" />
          <div className="h-16 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  // Default variant - matches MatchCard dimensions: 334x293 mobile, 290x478 desktop
  return (
    <div className={cn(
      'bg-white rounded-2xl p-[15px] md:p-5 w-[334px] h-[293px] md:w-[290px] md:h-[478px] flex flex-col animate-pulse',
      className
    )}>
      {/* Competition Header */}
      <div className="h-[17px] md:h-[14px] flex items-center justify-center mb-3 shrink-0">
        <div className="h-3 bg-gray-200 rounded w-32" />
      </div>

      {/* Teams and Score Section */}
      <div className="flex items-center justify-between mb-[5px] md:mb-4 px-2 shrink-0">
        {/* Home Team */}
        <div className="flex flex-col items-center justify-center gap-1 w-[101px] h-[57px] shrink-0 md:w-20 md:h-auto">
          <div className="w-[34px] h-[34px] bg-gray-200 rounded-full" />
          <div className="h-3 bg-gray-200 rounded w-8" />
        </div>

        {/* Score */}
        <div className="flex flex-col items-center justify-center w-[101px] h-[57px] shrink-0 md:w-auto md:h-auto">
          <div className="h-6 md:h-8 bg-gray-200 rounded w-12" />
          <div className="h-3 bg-gray-200 rounded w-10 mt-1" />
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center justify-center gap-1 w-[101px] h-[57px] shrink-0 md:w-20 md:h-auto">
          <div className="w-[34px] h-[34px] bg-gray-200 rounded-full" />
          <div className="h-3 bg-gray-200 rounded w-8" />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 w-full mb-[5px] md:mb-4" />

      {/* Predictions Section */}
      <div className="flex-1 space-y-2 overflow-hidden min-h-0 flex flex-col justify-center md:justify-start">
        <div className="h-auto md:h-[64px]">
          <div className="flex justify-between mb-1">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-10" />
          </div>
          <div className="h-2 bg-gray-200 rounded-full mb-1" />
          <div className="h-3 bg-gray-200 rounded w-28" />
        </div>
        <div className="hidden md:block h-[64px]">
          <div className="flex justify-between mb-1">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-10" />
          </div>
          <div className="h-2 bg-gray-200 rounded-full mb-1" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
        <div className="hidden md:block h-[64px]">
          <div className="flex justify-between mb-1">
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-4 bg-gray-200 rounded w-10" />
          </div>
          <div className="h-2 bg-gray-200 rounded-full mb-1" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      </div>

      {/* Footer */}
      <div className="pt-[5px] md:pt-2 shrink-0">
        {/* Predictions Count */}
        <div className="hidden md:flex items-center justify-center mb-3">
          <div className="flex-1 h-px bg-gray-200" />
          <div className="px-3 h-3 bg-gray-200 rounded w-32" />
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <div className="w-[304px] md:w-[262px] h-[40px] bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * LeagueSectionSkeleton - Skeleton for a league section with multiple cards
 */
export function LeagueSectionSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gray-200 rounded" />
        <div className="h-5 bg-gray-200 rounded w-40" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <MatchCardSkeleton key={i} variant="compact" />
        ))}
      </div>
    </div>
  );
}
