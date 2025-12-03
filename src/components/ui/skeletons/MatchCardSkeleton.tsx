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
        'w-full rounded-xl overflow-hidden bg-gradient-to-b from-[#1a2a4a] to-[#0d1829] animate-pulse',
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
    return (
      <div className={cn(
        'bg-white rounded-xl border border-gray-200 p-4 animate-pulse',
        className
      )}>
        <div className="h-3 bg-gray-200 rounded w-24 mx-auto mb-3" />
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="h-3 bg-gray-200 rounded w-8" />
          </div>
          <div className="flex flex-col items-center">
            <div className="h-6 bg-gray-200 rounded w-12" />
            <div className="h-3 bg-gray-200 rounded w-10 mt-1" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="h-3 bg-gray-200 rounded w-8" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 p-4 animate-pulse',
      className
    )}>
      <div className="h-3 bg-gray-200 rounded w-32 mb-3" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-16" />
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-12" />
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-12 bg-gray-100 rounded-lg" />
        <div className="h-12 bg-gray-100 rounded-lg" />
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
