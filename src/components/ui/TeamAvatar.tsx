import { cn } from '@/lib/utils';

interface TeamAvatarProps {
  logo?: string;
  name: string;
  shortName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showName?: boolean;
  namePosition?: 'bottom' | 'right';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-[34px] h-[34px]',
  lg: 'w-12 h-12',
};

const textSizeClasses = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
};

const nameSizeClasses = {
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm',
};

/**
 * TeamAvatar - Reusable component for displaying team logos with fallback
 *
 * Displays a team's logo image, or falls back to showing initials
 * in a gradient circle if no logo is available.
 */
export function TeamAvatar({
  logo,
  name,
  shortName,
  size = 'md',
  className,
  showName = false,
  namePosition = 'bottom',
}: TeamAvatarProps) {
  const displayShortName = shortName || name?.slice(0, 3).toUpperCase() || 'TBD';

  const avatarContent = logo ? (
    <img
      src={logo}
      alt={name}
      className={cn(sizeClasses[size], 'object-contain', className)}
      onError={(e) => {
        // Hide broken image and show fallback
        e.currentTarget.style.display = 'none';
        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
        if (fallback) {
          fallback.style.display = 'flex';
        }
      }}
    />
  ) : null;

  const fallbackContent = (
    <div
      className={cn(
        sizeClasses[size],
        'bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-gray-200',
        className,
        logo ? 'hidden' : ''
      )}
    >
      <span className={cn(textSizeClasses[size], 'font-bold text-gray-500')}>
        {displayShortName.slice(0, 3)}
      </span>
    </div>
  );

  const avatar = (
    <>
      {avatarContent}
      {fallbackContent}
    </>
  );

  if (!showName) {
    return <div className="flex items-center justify-center">{avatar}</div>;
  }

  const nameElement = (
    <span className={cn(nameSizeClasses[size], 'font-bold text-gray-900')}>
      {shortName || name}
    </span>
  );

  if (namePosition === 'right') {
    return (
      <div className="flex items-center gap-2">
        {avatar}
        {nameElement}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {avatar}
      {nameElement}
    </div>
  );
}
