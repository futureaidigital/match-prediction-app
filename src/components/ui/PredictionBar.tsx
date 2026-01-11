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
  sm: 'h-[8px]',
  md: 'h-[8px]',
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
  // For blurred state, use a single blur container with gradient mask for soft edges
  if (isBlurred) {
    return (
      <div className={cn(className, 'relative select-none pointer-events-none')}>
        <div
          className="h-auto md:h-[64px]"
          style={{
            filter: 'blur(5px)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          }}
        >
          {/* Label and Percentage */}
          <div className="flex items-center justify-between mb-1 gap-2">
            <span className="text-gray-800 font-medium text-[14px] truncate min-w-0 opacity-70">
              {label}
            </span>
            <span className="text-green-600 font-semibold text-[14px] shrink-0 whitespace-nowrap opacity-70">
              {percentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className={cn('w-full bg-gray-200 rounded-full mb-1 opacity-70', barHeightClasses[size])}>
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
            <div className="flex items-center text-[12px] opacity-70">
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
      </div>
    );
  }

  const content = (
    <div className="h-auto md:h-[64px]">
      {/* Label and Percentage */}
      <div className="flex items-center justify-between mb-1 gap-2">
        <span className="text-gray-800 font-medium text-[14px] truncate min-w-0">
          {label}
        </span>
        <span className="text-green-600 font-semibold text-[14px] shrink-0 whitespace-nowrap">
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
        <div className="flex items-center text-[12px]">
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
      <div className={cn(className)}>
        {content}
      </div>
    );
  }

  return <div className={className}>{content}</div>;
}
