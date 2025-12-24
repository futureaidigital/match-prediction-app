// API Service Layer for FourthOfficial API
import { env } from '@/config/env';
import { buildQueryString, parseApiError } from '@/lib/queryHelpers';

const API_BASE_URL = env.API_BASE_URL;
const BASE_PATH = `/api/v1`;

// ==================== Types ====================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// Auth Types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  country: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  country: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Subscription Types
export interface SubscriptionStatus {
  has_access: boolean;
  access_type: 'subscription' | 'time_based' | null;
  access_expires_at: string | null;
  provider: 'stripe' | 'paystack' | null;
  subscription_id?: string;
  plan_name?: string;
  status?: string;
}

export interface SubscriptionPricingPlan {
  name: string;
  price: number;
  currency: string;
  interval: 'week' | 'month';
  stripe_price_id?: string;
  paystack_plan_code?: string;
}

export interface SubscriptionPricingResponse {
  country: string;
  currency: string;
  provider: 'stripe' | 'paystack';
  plans: SubscriptionPricingPlan[];
}

// Sports Data Types
export interface Fixture {
  _id: string;
  fixture_id: number;
  league_id: number;
  home_team_id: number;
  home_team_name: string;
  home_team_abbreviation: string;
  home_team_logo_location: string;
  away_team_id: number;
  away_team_name: string;
  away_team_abbreviation: string;
  away_team_logo_location: string;
  kickoff_at: string;
  is_live: boolean;
  minutes_elapsed: number;
  home_score?: number;
  away_score?: number;
  has_predictions: boolean;
  number_of_predictions?: number;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  _id: string;
  prediction_id: number;
  fixture_id?: number;
  player_id?: number;
  prediction_type: string;
  prediction_display_name: string;
  prediction: number;
  pre_game_prediction?: number;
  pct_change_value?: number;
  pct_change_interval?: number;
  prediction_reasons?: string[];
  pre_game_prediction_reasons?: string[];
  created_at: string;
  updated_at: string;
}

export interface SmartCombo {
  id: string;
  name: string;
  fixtures: Fixture[];
  predictions: Prediction[];
  accuracy_pct?: number;
  accuracy_label?: string;
}

export interface Commentary {
  id: string;
  fixture_id: number;
  minute: number;
  comment: string;
  important: boolean;
  created_at: string;
}

export interface Weather {
  temperature: number;
  humidity: number;
  wind_speed: number;
  conditions: string;
  forecast_time: string;
}

export interface FixtureStatistics {
  fixture_id: number;
  home_team_stats: TeamStatistics;
  away_team_stats: TeamStatistics;
}

export interface TeamStatistics {
  possession: number;
  shots_on_target: number;
  shots_off_target: number;
  total_shots: number;
  corner_kicks: number;
  fouls: number;
  yellow_cards: number;
  red_cards: number;
  passes_total: number;
  passes_accurate: number;
}

export interface ComboAccuracy {
  combo_id: string;
  year: number;
  week: number;
  accuracy_percentage: number;
  correct_predictions: number;
  total_predictions: number;
  recorded_at: string;
}

export interface SmartComboSummary {
  combo_id: number;
  name: string;
  description?: string;
  starts_at: string;
  expires_at: string;
  confidence: number;
  total_odds: number;
  fixture_ids: number[];
  is_active: boolean;
  previous_week_combo_accuracy?: number;
}

export interface SmartComboFixtureSummary {
  fixture_id: number;
  league_name?: string;
  home_team_name?: string;
  away_team_name?: string;
  starting_at?: string;
  // Logo fields (may need backend update to include these)
  home_team_image_path?: string;
  away_team_image_path?: string;
  home_team_logo_location?: string;
  away_team_logo_location?: string;
}

export interface SmartComboPrediction {
  id?: string;
  fixture_id: number;
  combo_id: number;
  created_at: string;
  updated_at: string;
  prediction_type: string;
  prediction_id: number;
  prediction_display_name: string;
  pre_game_prediction: number;
  pre_game_prediction_reasons: string[];
  prediction?: number;
  prediction_reasons?: string[];
  pct_change_value?: number;
  pct_change_interval: number;
}

export interface SmartComboPredictionList {
  predictions: SmartComboPrediction[];
}

// Player Types

// Player details from /players endpoint
export interface Player {
  player_id: number;
  player_name?: string;
  display_name?: string;
  name?: string;
  common_name?: string;
  firstname?: string;
  lastname?: string;
  position_id?: number;
  position?: {
    id?: number;
    name?: string;
    code?: string;
  };
  country_id?: number;
  nationality?: {
    country_id?: number;
    name?: string;
    iso2?: string;
  };
  country?: {
    country_id?: number;
    name?: string;
    iso2?: string;
  };
  image_path?: string;
  team_id?: number;
  team_name?: string;
  current_team?: {
    team_id?: number;
    jersey_number?: number;
  };
  goals?: number;
  assists?: number;
  appearances?: number;
  minutes_played?: number;
}

// Response from /players/player endpoint (single player)
export interface PlayerDetailResponse {
  player: Player;
  predictions?: Array<{
    prediction_id?: number;
    prediction_display_name?: string;
    prediction?: number;
    pre_game_prediction?: number;
  }>;
}

export interface PlayersResponse {
  players: Player[];
}

// Watchlist entry containing player IDs
export interface WatchlistEntry {
  _id?: string;
  year: number;
  day: number;
  created_at: string;
  updated_at: string;
  player_ids: number[];
}

export interface WatchlistResponse {
  watchlist: WatchlistEntry[];
  warning?: string | null;
}

// Player statistics response (from /players/statistics)
export interface PlayerStatistics {
  appearances?: {
    appearances?: number;
    lineups?: number;
    bench?: number;
    minutes_played?: number;
    captain?: number;
    substitutions?: { in?: number; out?: number };
  };
  attacking?: {
    goals?: number;
    assists?: number;
    big_chances_created?: number;
    big_chances_missed?: number;
    offsides?: number;
    hit_woodwork?: number;
  };
  shooting?: {
    shots_total?: number;
    shots_on_target?: number;
    shots_off_target?: number;
    shots_blocked?: number;
  };
  passing?: {
    passes?: number;
    accurate_passes?: number;
    accurate_passes_percentage?: number;
    key_passes?: number;
  };
  defending?: {
    tackles?: number;
    interceptions?: number;
    clearances?: number;
    blocked_shots?: number;
  };
  discipline?: {
    fouls?: number;
    fouls_drawn?: number;
    yellowcards?: number;
    redcards?: number;
  };
  rating?: number;
}

export interface PlayerStatisticsData {
  player_id: number;
  season_id?: number;
  team_id?: number;
  jersey_number?: number;
  position_id?: number;
  statistics: PlayerStatistics;
  season_source?: string;
}

export interface PlayerStatisticsResponse {
  player_id: number;
  season_id?: number;
  team_id?: number;
  jersey_number?: number;
  position_id?: number;
  statistics: PlayerStatistics;
  season_source?: string;
}

export interface SmartComboFixturePredictions {
  fixture: SmartComboFixtureSummary;
  predictions: SmartComboPrediction[];
}

export interface SmartComboCurrentResponse {
  combo: SmartComboSummary;
  fixtures: SmartComboFixturePredictions[];
}

// League Types
export interface League {
  league_id: number;
  league_name: string;
  short_code?: string;
  image_path?: string;
  country?: string;
  country_id?: number;
  league_type?: string;
  league_sub_type?: string;
  is_active?: boolean;
}

export interface LeaguesResponse {
  leagues: League[];
}

// League Standings Types (matches actual API response)
export interface LeagueStandingTeam {
  position: number;
  points: number;
  goal_difference: number;
  wins: number;
  draws: number;
  losses: number;
  matches_played: number;
  form: string[];  // Array of 'W', 'D', 'L' for recent results
  team: {
    team_id: number;
    team_name: string;
    team_logo: string;
  };
  next_fixture?: {
    fixture_id: number;
    opponent_logo: string;
  } | null;
}

export interface LeagueSeason {
  season_id: number;
  season_name: string;
  is_current: boolean;
}

export interface LeagueCurrentResponse {
  league: {
    league_id: number;
    league_name: string;
    league_short_code: string;
    country_name: string;
  };
  current_season: LeagueSeason;
  available_seasons: LeagueSeason[];
  standings: LeagueStandingTeam[];
  updated_at?: string;
}

export interface LeagueStandingsResponse {
  league_id: number;
  season_id: number;
  standings: LeagueStandingTeam[];
  updated_at?: string;
}

export interface LeagueFixturesResponse {
  fixtures: FixtureWithPredictions[];
  fixture_ids?: number[] | null;
  fixture_ids_by_league?: Record<string, number[]> | null;
}

// Fixtures response types (actual API structure)
export interface FixtureWithPredictions {
  fixture: {
    fixture_id: number;
    league_id?: number;
    league_name?: string;
    home_team_id: number;
    home_team_name?: string;
    home_team_short_code?: string;
    home_team_image_path?: string;
    away_team_id: number;
    away_team_name?: string;
    away_team_short_code?: string;
    away_team_image_path?: string;
    starting_at?: string;
    home_team_score?: number;
    away_team_score?: number;
    minutes_elapsed?: number | null;
    number_of_predictions?: number;
  };
  predictions: Array<{
    prediction_id?: number;
    prediction_display_name?: string;
    prediction?: number;
    pre_game_prediction?: number;
    pct_change_value?: number;
    pct_change_interval?: number;
  }>;
}

export interface FixturesResponse {
  fixtures: FixtureWithPredictions[];
  fixture_ids?: number[];
}

// ==================== API Client ====================

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${BASE_PATH}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.API_TIMEOUT);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
      } catch {
        // Response body is not JSON
      }
      throw parseApiError(response, errorBody);
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.request<AuthResponse>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/users/me');
  }

  async updateUserProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(code: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ code, new_password: newPassword }),
    });
  }

  // Subscription endpoints
  async getSubscriptionStatus(): Promise<ApiResponse<SubscriptionStatus>> {
    return this.request<SubscriptionStatus>('/payments/subscription-status');
  }

  async getSubscriptionPricing(): Promise<ApiResponse<SubscriptionPricingResponse>> {
    return this.request<SubscriptionPricingResponse>('/payments/subscription-pricing');
  }

  // Fixtures endpoints
  async getFixtures(params: {
    fixture_ids?: number[];  // Comma-separated fixture IDs for specific fixtures
    leagues?: number[];      // Comma-separated league IDs
    match_type?: 'live' | 'upcoming' | 'finished';  // Match type filter
    sort_by?: 'kickoff_asc' | 'kickoff_desc' | 'prediction_accuracy_asc' | 'prediction_accuracy_desc';
    date_from?: string;      // Start date (ISO format: YYYY-MM-DD)
    date_to?: string;        // End date (ISO format: YYYY-MM-DD)
    season_id?: number;      // Season ID filter
    has_predictions?: boolean; // Filter fixtures with predictions
  } = {}): Promise<ApiResponse<FixturesResponse>> {
    // Build query string with correct parameter names for backend
    const query = new URLSearchParams();

    if (params.fixture_ids?.length) {
      query.append('fixture_ids', params.fixture_ids.join(','));
    }
    if (params.leagues?.length) {
      query.append('league_id', params.leagues.join(','));
    }
    if (params.match_type) {
      query.append('match_type', params.match_type);
    }
    if (params.sort_by) {
      query.append('sort_by', params.sort_by);
    }
    if (params.date_from) {
      query.append('date_from', params.date_from);
    }
    if (params.date_to) {
      query.append('date_to', params.date_to);
    }
    if (params.season_id) {
      query.append('season_id', params.season_id.toString());
    }
    if (params.has_predictions !== undefined) {
      query.append('has_predictions', params.has_predictions.toString());
    }

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<FixturesResponse>(`/fixtures${queryString}`);
  }

  async getFixtureById(fixtureId: string): Promise<ApiResponse<Fixture>> {
    return this.request<Fixture>(`/fixtures/${fixtureId}`);
  }

  async getFixtureCommentary(fixtureId: string): Promise<ApiResponse<Commentary[]>> {
    return this.request<Commentary[]>(`/fixtures/${fixtureId}/commentary`);
  }

  async getFixtureWeather(fixtureId: string): Promise<ApiResponse<Weather>> {
    return this.request<Weather>(`/fixtures/${fixtureId}/weather`);
  }

  async getFixtureStatistics(fixtureId: string): Promise<ApiResponse<FixtureStatistics>> {
    return this.request<FixtureStatistics>(`/fixtures/${fixtureId}/statistics`);
  }

  // Predictions endpoints
  async getFixturePredictions(params: {
    fixture_id?: number;
    prediction_type?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Prediction[]>> {
    const queryString = buildQueryString(params);
    return this.request<Prediction[]>(`/predictions${queryString}`);
  }

  async getPlayerPredictions(params: {
    player_id?: number;
    fixture_id?: number;
    prediction_type?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Prediction[]>> {
    const queryString = buildQueryString(params);
    return this.request<Prediction[]>(`/predictions/players${queryString}`);
  }

  async getSmartCombos(params: {
    week?: number;
    year?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<SmartCombo[]>> {
    const queryString = buildQueryString(params);
    return this.request<SmartCombo[]>(`/smart-combos${queryString}`);
  }

  async getSmartComboAccuracy(params: {
    combo_id?: string;
    year?: number;
    week?: number;
  }): Promise<ApiResponse<ComboAccuracy[]>> {
    const queryString = buildQueryString(params);
    return this.request<ComboAccuracy[]>(`/smart-combos/accuracy${queryString}`);
  }

  async getCurrentSmartCombo(): Promise<ApiResponse<SmartComboCurrentResponse>> {
    return this.request<SmartComboCurrentResponse>('/smart-combos/current');
  }

  async getSmartComboPredictions(params: {
    combo_id?: number;
    fixture_id?: number;
    sort_by?: 'pct_change' | 'prediction_pre_game' | 'prediction' | 'created_at';
    sort_order?: 'asc' | 'desc';
    limit?: number;
  } = {}): Promise<ApiResponse<SmartComboPredictionList>> {
    const queryString = buildQueryString(params);
    // Use /predictions/smart-combos endpoint which supports sorting
    return this.request<SmartComboPredictionList>(`/predictions/smart-combos${queryString}`);
  }

  // Player endpoints

  // Get single player details from /players/player endpoint
  async getPlayer(params: {
    player_id: number;
  }): Promise<ApiResponse<PlayerDetailResponse>> {
    const query = new URLSearchParams();
    query.append('player_id', params.player_id.toString());
    return this.request<PlayerDetailResponse>(`/players/player?${query.toString()}`);
  }

  // Legacy: kept for backwards compatibility but may not work with current API
  async getPlayers(params: {
    player_id?: number | number[];
    limit?: number;
  } = {}): Promise<ApiResponse<PlayersResponse>> {
    const query = new URLSearchParams();
    if (params.player_id !== undefined) {
      const ids = Array.isArray(params.player_id) ? params.player_id.join(',') : params.player_id.toString();
      query.append('player_id', ids);
    }
    if (params.limit !== undefined) {
      query.append('limit', params.limit.toString());
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<PlayersResponse>(`/players${queryString}`);
  }

  async getPlayersWatchlist(params: {
    year?: number;
    day?: number;
  } = {}): Promise<ApiResponse<WatchlistResponse>> {
    const queryString = buildQueryString(params);
    return this.request<WatchlistResponse>(`/players/watchlist${queryString}`);
  }

  async getPlayerStatistics(params: {
    player_id: number;
  }): Promise<ApiResponse<PlayerStatisticsResponse>> {
    const query = new URLSearchParams();
    query.append('player_id', params.player_id.toString());

    return this.request<PlayerStatisticsResponse>(`/players/statistics?${query.toString()}`);
  }

  // League endpoints
  async getLeagues(): Promise<ApiResponse<LeaguesResponse>> {
    return this.request<LeaguesResponse>('/leagues');
  }

  // League Current endpoint - returns league info, current season, available seasons, and standings
  async getLeagueCurrent(league_id: number): Promise<ApiResponse<LeagueCurrentResponse>> {
    return this.request<LeagueCurrentResponse>(`/leagues/current?league_id=${league_id}`);
  }

  // League Standings by Season endpoint - returns standings for a specific season
  async getLeagueStandings(params: {
    league_id: number;
    season_id: number;
  }): Promise<ApiResponse<LeagueStandingsResponse>> {
    return this.request<LeagueStandingsResponse>(`/leagues/standings/${params.season_id}?league_id=${params.league_id}`);
  }

  // League Fixtures endpoint - returns fixtures for a league and season
  async getLeagueFixtures(params: {
    league_id: number;
    season_id: number;
  }): Promise<ApiResponse<LeagueFixturesResponse>> {
    return this.request<LeagueFixturesResponse>(`/leagues/${params.league_id}/fixtures?season_id=${params.season_id}`);
  }
}

// Export singleton instance
export const api = new ApiClient();