import { cn } from '@/lib/utils';

interface PredictionBarProps {
  label: string;
  percentage: number;
  trend?: {
    direction: 'up' | 'down';
    value: number;
    timeframe: string;
  };
  isBlurred?: boolean;
  size?: 'sm' | 'md';
  showBackground?: boolean;
  className?: string;
}

const barHeightClasses = {
  sm: 'h-1.5',
  md: 'h-2',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
};

/**
 * PredictionBar - Reusable component for displaying predictions with progress bars
 *
 * Shows a prediction label, percentage, progress bar, and optional trend indicator.
 * Supports blurred state for premium-locked content.
 */
export function PredictionBar({
  label,
  percentage,
  trend,
  isBlurred = false,
  size = 'sm',
  showBackground = false,
  className,
}: PredictionBarProps) {
  const content = (
    <div className={cn(isBlurred && 'blur-[4px] select-none pointer-events-none')}>
      {/* Label and Percentage */}
      <div className="flex items-center justify-between mb-1">
        <span className={cn('text-gray-800 font-medium', size === 'sm' ? 'text-sm' : 'text-sm')}>
          {label}
        </span>
        <span className={cn('text-green-600 font-bold', textSizeClasses[size])}>
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className={cn('w-full bg-gray-200 rounded-full mb-1', barHeightClasses[size])}>
        <div
          className={cn(
            'bg-green-500 rounded-full transition-all duration-300',
            barHeightClasses[size]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Trend Indicator */}
      {trend && (
        <div className="flex items-center text-xs">
          <span
            className={cn(
              'font-medium',
              trend.direction === 'up' ? 'text-green-600' : 'text-red-500'
            )}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value.toFixed(0)}%
          </span>
          <span className="text-gray-400 ml-1">
            in the last {trend.timeframe}
          </span>
        </div>
      )}
    </div>
  );

  if (showBackground) {
    return (
      <div className={cn('bg-gray-50/50 rounded-lg p-3', className)}>
        {content}
      </div>
    );
  }

  return <div className={className}>{content}</div>;
}
