/**
 * Data Transformation Utilities
 *
 * Centralized functions for transforming API responses to component props.
 */

import { FixtureWithPredictions } from '@/services/api';
import { formatKickoffTime, normalizePercentage, formatTrendTimeframe } from './formatters';
import { DEFAULTS, getTeamShortCode } from '@/config/defaults';

/**
 * Team interface used by components
 */
export interface TeamData {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
}

/**
 * Prediction interface used by components
 */
export interface PredictionData {
  id: string;
  label: string;
  percentage: number;
  trend?: {
    direction: 'up' | 'down';
    value: number;
    timeframe: string;
  };
  isBlurred?: boolean;
}

/**
 * Match card data interface
 */
export interface MatchCardData {
  id: string;
  competition: string;
  homeTeam: TeamData;
  awayTeam: TeamData;
  score?: {
    home: number;
    away: number;
  };
  status: 'live' | 'upcoming' | 'finished';
  currentMinute?: number;
  kickoffTime?: string;
  predictions: PredictionData[];
  totalPredictions?: number;
  lastUpdated?: string;
}

/**
 * Transform API fixture response to MatchCard component props
 */
export function fixtureToMatchCard(fixtureItem: FixtureWithPredictions): MatchCardData {
  const fixture = fixtureItem.fixture;
  const predictions = fixtureItem.predictions || [];

  // Determine match status
  let status: 'live' | 'upcoming' | 'finished' = 'upcoming';
  if (fixture.minutes_elapsed !== null && fixture.minutes_elapsed !== undefined) {
    status = 'live';
  }

  return {
    id: fixture.fixture_id.toString(),
    competition: fixture.league_name || DEFAULTS.COMPETITION,
    homeTeam: {
      id: fixture.home_team_id.toString(),
      name: fixture.home_team_name || fixture.home_team_short_code || DEFAULTS.HOME_TEAM,
      shortName:
        fixture.home_team_short_code ||
        getTeamShortCode(fixture.home_team_name, 'HOM'),
      logo: fixture.home_team_image_path,
    },
    awayTeam: {
      id: fixture.away_team_id.toString(),
      name: fixture.away_team_name || fixture.away_team_short_code || DEFAULTS.AWAY_TEAM,
      shortName:
        fixture.away_team_short_code ||
        getTeamShortCode(fixture.away_team_name, 'AWY'),
      logo: fixture.away_team_image_path,
    },
    score:
      fixture.home_team_score !== undefined && fixture.away_team_score !== undefined
        ? {
            home: fixture.home_team_score,
            away: fixture.away_team_score,
          }
        : undefined,
    status,
    currentMinute: fixture.minutes_elapsed ?? undefined,
    kickoffTime: formatKickoffTime(fixture.starting_at),
    predictions: transformPredictions(predictions),
    totalPredictions: predictions.length || DEFAULTS.PREDICTION_COUNT,
    lastUpdated: '2 mins ago',
  };
}

/**
 * Transform API predictions to component format
 */
export function transformPredictions(
  predictions: Array<{
    prediction_id?: number;
    prediction_display_name?: string;
    prediction?: number;
    pre_game_prediction?: number;
    pct_change_value?: number;
    pct_change_interval?: number;
  }>
): PredictionData[] {
  return predictions.map((pred, index) => {
    const predValue = pred.prediction ?? pred.pre_game_prediction ?? 0;
    const percentage = normalizePercentage(predValue);
    const changeValue = pred.pct_change_value || 0;

    return {
      id: pred.prediction_id?.toString() || index.toString(),
      label: pred.prediction_display_name || `Prediction ${index + 1}`,
      percentage,
      trend: {
        direction: changeValue >= 0 ? 'up' : 'down',
        value: Math.abs(changeValue),
        timeframe: formatTrendTimeframe(pred.pct_change_interval),
      },
      isBlurred: false,
    };
  });
}

/**
 * Safely extract data from API response
 */
export function extractApiData<T>(
  response: { data?: T } | undefined | null,
  fallback: T
): T {
  return response?.data ?? fallback;
}

/**
 * Group fixtures by league
 */
export function groupFixturesByLeague(
  fixtures: FixtureWithPredictions[]
): Map<string, FixtureWithPredictions[]> {
  const grouped = new Map<string, FixtureWithPredictions[]>();

  fixtures.forEach((fixtureItem) => {
    const leagueName = fixtureItem.fixture.league_name || DEFAULTS.COMPETITION;
    const existing = grouped.get(leagueName) || [];
    existing.push(fixtureItem);
    grouped.set(leagueName, existing);
  });

  return grouped;
}

/**
 * Check if a fixture is today
 */
export function isFixtureToday(startingAt: string | undefined): boolean {
  if (!startingAt) return false;

  const fixtureDate = new Date(startingAt);
  const today = new Date();

  return (
    fixtureDate.getDate() === today.getDate() &&
    fixtureDate.getMonth() === today.getMonth() &&
    fixtureDate.getFullYear() === today.getFullYear()
  );
}
