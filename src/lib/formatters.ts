/**
 * Formatting Utilities
 *
 * Centralized functions for formatting dates, numbers, and strings.
 */

import { DEFAULTS } from '@/config/defaults';

/**
 * Format a date to kickoff time display (HH:MM)
 */
export function formatKickoffTime(
  date: Date | string | undefined | null,
  fallback: string = DEFAULTS.KICKOFF_TIME
): string {
  if (!date) return fallback;

  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return fallback;

    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return fallback;
  }
}

/**
 * Format a date for API requests (YYYY-MM-DD)
 */
export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format relative time (e.g., "2 mins ago", "just now")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  return `${diffDays} days ago`;
}

/**
 * Normalize a prediction value to percentage (1-99)
 *
 * API may return values as decimals (0-1) or percentages (0-100).
 * This normalizes to a consistent percentage range.
 */
export function normalizePercentage(value: number | undefined | null): number {
  if (value === undefined || value === null) return 0;

  let percentage: number;
  if (value > 1) {
    // Already a percentage
    percentage = Math.round(value);
  } else {
    // Decimal format, convert to percentage
    percentage = Math.round(value * 100);
  }

  // Clamp to 1-99 range (avoid extremes for visual purposes)
  return Math.max(1, Math.min(99, percentage));
}

/**
 * Format a percentage change interval to display string
 */
export function formatTrendTimeframe(
  interval: number | undefined | null,
  fallback: string = DEFAULTS.TREND_TIMEFRAME
): string {
  if (!interval) return fallback;
  return `${interval} min`;
}

/**
 * Format match minute display
 */
export function formatMatchMinute(minute: number | undefined | null): string {
  if (minute === undefined || minute === null) return '';
  return `${minute}'`;
}

/**
 * Pluralize a word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}
