/**
 * Query Helper Utilities
 *
 * Centralized functions for building API query strings and handling responses.
 */

/**
 * Build a query string from parameters object
 *
 * Filters out undefined/null values and converts all values to strings.
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, value.toString());
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Build a query string for array parameters
 *
 * Handles arrays by joining with commas (common API pattern).
 */
export function buildQueryStringWithArrays(
  params: Record<string, string | number | boolean | (string | number)[] | undefined | null>
): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      if (value.length > 0) {
        query.append(key, value.join(','));
      }
    } else {
      query.append(key, value.toString());
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * API Error class for typed error handling
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, code: string = 'UNKNOWN_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  /**
   * Check if error is a specific HTTP status
   */
  isStatus(status: number): boolean {
    return this.statusCode === status;
  }

  /**
   * Check if error is authentication related
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Check if error should trigger a retry
   */
  shouldRetry(): boolean {
    // Retry on server errors, timeouts, and rate limiting
    return (
      this.isServerError() ||
      this.statusCode === 408 || // Request Timeout
      this.statusCode === 429    // Too Many Requests
    );
  }
}

/**
 * Parse API error response
 */
export function parseApiError(response: Response, body?: unknown): ApiError {
  const errorBody = body as { error?: { code?: string; message?: string } } | undefined;

  const message = errorBody?.error?.message || response.statusText || 'An error occurred';
  const code = errorBody?.error?.code || `HTTP_${response.status}`;

  return new ApiError(message, response.status, code, body);
}

/**
 * Retry configuration for API calls
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig = { maxRetries: 3, baseDelay: 1000, maxDelay: 30000 }
): number {
  const delay = config.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * Create a fetch request with timeout
 */
export function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
}
