/**
 * Default Values Configuration
 *
 * Centralized default strings and fallback values.
 * Use these instead of hardcoding values in components.
 */

export const DEFAULTS = {
  // Time display
  KICKOFF_TIME: 'TBD',
  TREND_TIMEFRAME: '13 min',
  LAST_UPDATED: 'just now',

  // Team names
  HOME_TEAM: 'Home',
  AWAY_TEAM: 'Away',
  UNKNOWN_TEAM: 'TBD',

  // Competition
  COMPETITION: 'International Match',
  SMART_COMBO_COMPETITION: 'International • WC Qualification, UEFA',

  // Predictions
  PREDICTION_COUNT: 5,

  // Labels
  TODAY_LABEL: 'TODAY',
  LIVE_LABEL: 'LIVE',

  // Pagination
  ITEMS_PER_PAGE: 6,

  // Position mappings for players
  POSITION_MAP: {
    24: 'GK',
    25: 'DF',
    26: 'MF',
    27: 'FW',
  } as Record<number, string>,
} as const;

/**
 * Demo/Test Credentials
 *
 * These should ideally come from environment variables in production.
 * For development/demo purposes only.
 */
export const TEST_CREDENTIALS = {
  FREE: {
    email: 'free@fourthofficial.ai',
    password: 'TestPassword123!',
  },
  PREMIUM: {
    email: 'premium@fourthofficial.ai',
    password: 'TestPassword123!',
  },
} as const;

/**
 * Placeholder/Fallback Images
 */
export const FALLBACK_IMAGES = {
  TEAM_LOGO: '/images/team-placeholder.svg',
  PLAYER_AVATAR: '/images/player-placeholder.svg',
  LEAGUE_LOGO: '/images/league-placeholder.svg',
} as const;

/**
 * Get team short code from name
 */
export function getTeamShortCode(
  teamName: string | undefined,
  fallback: string = DEFAULTS.UNKNOWN_TEAM
): string {
  if (!teamName) return fallback;
  return teamName.slice(0, 3).toUpperCase();
}

/**
 * Get position abbreviation from position ID
 */
export function getPositionAbbreviation(positionId: number | undefined): string {
  if (!positionId) return 'N/A';
  return DEFAULTS.POSITION_MAP[positionId] || 'N/A';
}
