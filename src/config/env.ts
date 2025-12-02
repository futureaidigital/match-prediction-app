/**
 * Environment Configuration
 *
 * Centralized, type-safe environment variable management with validation
 */

// ==================== Types ====================

interface EnvConfig {
  // API Configuration
  API_BASE_URL: string;
  API_TIMEOUT: number;

  // Feature Flags
  ENABLE_DEVTOOLS: boolean;
  ENABLE_MOCK_DATA: boolean;
  ENABLE_DEBUG_LOGGING: boolean;

  // App Configuration
  APP_NAME: string;
  APP_VERSION: string;
  APP_ENV: 'development' | 'production' | 'staging';

  // Optional Analytics
  SENTRY_DSN?: string;
  GA_TRACKING_ID?: string;
}

// ==================== Validation ====================

/**
 * Validates that required environment variables are set
 * Throws an error on app startup if validation fails
 */
function validateEnv(): void {
  // Validate that API_BASE_URL is set in production
  if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL is required in production environment.\n' +
      'Please set it in your .env.production file.'
    );
  }

  // Add additional required variable checks here as needed
  // Example:
  // if (!import.meta.env.VITE_REQUIRED_VAR) {
  //   throw new Error('VITE_REQUIRED_VAR is required');
  // }
}

// ==================== Helpers ====================

/**
 * Parses a string boolean environment variable
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === '') return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Parses a string number environment variable
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (value === undefined || value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Gets environment name with fallback
 */
function getEnvironment(): 'development' | 'production' | 'staging' {
  const mode = import.meta.env.MODE;
  if (mode === 'production') return 'production';
  if (mode === 'staging') return 'staging';
  return 'development';
}

// ==================== Configuration ====================

// Validate on module load
validateEnv();

/**
 * Validated and type-safe environment configuration
 *
 * All environment variables are processed and validated here
 * Use this instead of accessing import.meta.env directly
 */
export const env: EnvConfig = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  API_TIMEOUT: parseNumber(import.meta.env.VITE_API_TIMEOUT, 30000),

  // Feature Flags
  ENABLE_DEVTOOLS: parseBoolean(
    import.meta.env.VITE_ENABLE_DEVTOOLS,
    import.meta.env.DEV // Default to true in development
  ),
  ENABLE_MOCK_DATA: parseBoolean(
    import.meta.env.VITE_ENABLE_MOCK_DATA,
    false
  ),
  ENABLE_DEBUG_LOGGING: parseBoolean(
    import.meta.env.VITE_ENABLE_DEBUG_LOGGING,
    import.meta.env.DEV // Default to true in development
  ),

  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'FourthOfficial',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_ENV: getEnvironment(),

  // Optional Analytics (undefined if not set)
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  GA_TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID,
};

// ==================== Helpers for Components ====================

/**
 * Check if app is running in development mode
 */
export const isDevelopment = env.APP_ENV === 'development';

/**
 * Check if app is running in production mode
 */
export const isProduction = env.APP_ENV === 'production';

/**
 * Check if app is running in staging mode
 */
export const isStaging = env.APP_ENV === 'staging';

/**
 * Logger that only logs in development or when debug is enabled
 */
export const devLog = {
  log: (...args: any[]) => {
    if (env.ENABLE_DEBUG_LOGGING) {
      console.log('[DEV]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (env.ENABLE_DEBUG_LOGGING) {
      console.error('[DEV ERROR]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (env.ENABLE_DEBUG_LOGGING) {
      console.warn('[DEV WARN]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (env.ENABLE_DEBUG_LOGGING) {
      console.info('[DEV INFO]', ...args);
    }
  },
};

// ==================== Development Helpers ====================

if (import.meta.env.DEV) {
  // Log configuration in development for debugging
  console.log('🔧 Environment Configuration:', {
    API_BASE_URL: env.API_BASE_URL || '(using Vite proxy)',
    APP_ENV: env.APP_ENV,
    ENABLE_DEVTOOLS: env.ENABLE_DEVTOOLS,
    ENABLE_MOCK_DATA: env.ENABLE_MOCK_DATA,
    ENABLE_DEBUG_LOGGING: env.ENABLE_DEBUG_LOGGING,
  });
}

// Make env readonly in development to prevent accidental mutations
if (import.meta.env.DEV) {
  Object.freeze(env);
}
