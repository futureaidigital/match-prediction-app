/**
 * Theme Configuration
 *
 * Centralized color palette and design tokens.
 * Use these constants instead of hardcoded hex values.
 */

export const COLORS = {
  // Primary brand colors
  primary: {
    DEFAULT: '#0d1a67',
    hover: '#0a1452',
    light: '#1a237e',
    dark: '#091143',
  },

  // Status colors
  status: {
    live: '#ef4444', // red-500
    upcoming: '#6b7280', // gray-500
    finished: '#9ca3af', // gray-400
  },

  // Prediction confidence colors
  prediction: {
    high: '#22c55e', // green-500
    medium: '#f97316', // orange-500
    low: '#9ca3af', // gray-400
  },

  // Trend colors
  trend: {
    up: '#16a34a', // green-600
    down: '#ef4444', // red-500
  },
} as const;

/**
 * Get prediction bar color based on percentage
 */
export function getPredictionColor(percentage: number): string {
  if (percentage >= 70) return COLORS.prediction.high;
  if (percentage >= 50) return COLORS.prediction.medium;
  return COLORS.prediction.low;
}

/**
 * Get prediction bar Tailwind class based on percentage
 */
export function getPredictionColorClass(percentage: number): string {
  if (percentage >= 70) return 'bg-green-500';
  if (percentage >= 50) return 'bg-orange-400';
  return 'bg-gray-400';
}
