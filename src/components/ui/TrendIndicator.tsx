import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  direction: 'up' | 'down';
  value: number;
  timeframe?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * TrendIndicator - Reusable component for displaying trend changes
 *
 * Shows a directional arrow (up/down) with a percentage value and optional timeframe.
 * Can use either emoji arrows or Lucide icons.
 */
export function TrendIndicator({
  direction,
  value,
  timeframe,
  showIcon = false,
  size = 'sm',
  className,
}: TrendIndicatorProps) {
  const isUp = direction === 'up';
  const colorClass = isUp ? 'text-green-600' : 'text-red-500';
  const Icon = isUp ? TrendingUp : TrendingDown;
  const arrow = isUp ? '↑' : '↓';

  const iconSizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSizeClass = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className={cn('flex items-center gap-1', textSizeClass, className)}>
      {showIcon ? (
        <Icon className={cn(iconSizeClass, colorClass)} />
      ) : (
        <span className={cn('font-medium', colorClass)}>
          {arrow} {value.toFixed(0)}%
        </span>
      )}
      {showIcon && (
        <span className={colorClass}>
          {value.toFixed(0)}%
        </span>
      )}
      {timeframe && (
        <span className="text-gray-400 ml-1">
          in the last {timeframe}
        </span>
      )}
    </div>
  );
}
