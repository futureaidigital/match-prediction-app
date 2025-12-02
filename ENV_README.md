# Environment Variables Guide

This document explains how environment variables are configured and used in the FourthOfficial application.

## Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment-specific values in `.env`

3. The app will validate required variables on startup

## Available Environment Variables

### API Configuration

#### `VITE_API_BASE_URL`
- **Type:** `string`
- **Required:** Yes in production, optional in development
- **Default:** Empty string (uses Vite proxy in development)
- **Example:** `https://api.fourthofficial.ai`
- **Description:** Base URL for the FourthOfficial API. Leave empty in development to use the Vite dev server proxy (avoids CORS issues).

#### `VITE_API_TIMEOUT`
- **Type:** `number` (milliseconds)
- **Required:** No
- **Default:** `30000` (30 seconds)
- **Example:** `60000`
- **Description:** Maximum time to wait for API responses before timing out.

---

### Feature Flags

#### `VITE_ENABLE_DEVTOOLS`
- **Type:** `boolean`
- **Required:** No
- **Default:** `true` in development, `false` in production
- **Values:** `true`, `false`, `1`, `0`
- **Description:** Show React Query DevTools for debugging queries and cache.

#### `VITE_ENABLE_MOCK_DATA`
- **Type:** `boolean`
- **Required:** No
- **Default:** `false`
- **Values:** `true`, `false`, `1`, `0`
- **Description:** Use mock data instead of making real API calls (useful for development/testing).

#### `VITE_ENABLE_DEBUG_LOGGING`
- **Type:** `boolean`
- **Required:** No
- **Default:** `true` in development, `false` in production
- **Values:** `true`, `false`, `1`, `0`
- **Description:** Enable verbose console logging for debugging.

---

### App Configuration

#### `VITE_APP_NAME`
- **Type:** `string`
- **Required:** No
- **Default:** `"FourthOfficial"`
- **Example:** `"FourthOfficial Dev"`
- **Description:** Application name displayed in the UI.

#### `VITE_APP_VERSION`
- **Type:** `string`
- **Required:** No
- **Default:** `"1.0.0"`
- **Example:** `"1.2.3"`
- **Description:** Application version number.

---

### Optional Analytics & Monitoring

#### `VITE_SENTRY_DSN`
- **Type:** `string`
- **Required:** No
- **Default:** `undefined`
- **Example:** `https://abc123@o123.ingest.sentry.io/123`
- **Description:** Sentry DSN for error tracking and monitoring.

#### `VITE_GA_TRACKING_ID`
- **Type:** `string`
- **Required:** No
- **Default:** `undefined`
- **Example:** `G-XXXXXXXXXX`
- **Description:** Google Analytics tracking ID for usage analytics.

---

## Environment Files

The project uses multiple `.env` files for different environments:

### `.env`
- Used during local development
- Gitignored (never committed to version control)
- Copy from `.env.example` to get started

### `.env.example`
- Template showing all available variables
- Committed to git
- Used as reference for setting up new environments

### `.env.production`
- Production environment configuration
- Can be committed to git (no secrets)
- Used when running `npm run build`

### `.env.local` (optional)
- Local overrides that take precedence
- Gitignored
- Useful for developer-specific settings

---

## Using Environment Variables

### In TypeScript/React Code

**✅ Recommended:**
```typescript
import { env } from '@/config/env';

// Type-safe, validated access
const apiUrl = env.API_BASE_URL;
const debugMode = env.ENABLE_DEBUG_LOGGING;
```

**❌ Not Recommended:**
```typescript
// Direct access (no validation, no type safety)
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

### Conditional Logging

Use the `devLog` helper for development-only logging:

```typescript
import { devLog } from '@/config/env';

// Only logs when VITE_ENABLE_DEBUG_LOGGING is true
devLog.log('User logged in:', user);
devLog.error('API Error:', error);
devLog.warn('Deprecated method called');
devLog.info('Cache hit for key:', key);
```

### Environment Checks

```typescript
import { isDevelopment, isProduction, isStaging } from '@/config/env';

if (isDevelopment) {
  // Development-only code
  console.log('Running in development mode');
}

if (isProduction) {
  // Production-only code
  initializeAnalytics();
}
```

---

## Validation

The `src/config/env.ts` module validates all required environment variables on app startup. If validation fails, the app will throw an error with a helpful message.

### Example Error

```
Error: VITE_API_BASE_URL is required in production environment.
Please set it in your .env.production file.
```

---

## Security Best Practices

### ✅ DO:
- ✅ Keep `.env` files in `.gitignore`
- ✅ Use `.env.example` to document variables
- ✅ Validate required variables on startup
- ✅ Use the `env` module instead of `import.meta.env` directly
- ✅ Prefix all Vite variables with `VITE_`

### ❌ DON'T:
- ❌ Commit `.env` files with secrets to git
- ❌ Store API keys or secrets in environment variables (use them only on the backend)
- ❌ Hardcode sensitive values in code
- ❌ Use environment variables for secrets in client-side code (everything is visible)

---

## Troubleshooting

### Variables not updating?

1. Restart the development server (`npm run dev`)
2. Clear browser cache
3. Check that variable names start with `VITE_`

### Getting "variable is undefined"?

1. Make sure you copied `.env.example` to `.env`
2. Check spelling (variable names are case-sensitive)
3. Ensure you're using `env.VARIABLE_NAME`, not `import.meta.env.VITE_VARIABLE_NAME`

### Production build failing?

1. Check that `VITE_API_BASE_URL` is set in `.env.production`
2. Verify all required variables are present
3. Run `npm run build` to test locally

---

## Example Configurations

### Development (`.env`)
```bash
VITE_API_BASE_URL=
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_DEBUG_LOGGING=true
VITE_ENABLE_MOCK_DATA=false
```

### Staging (`.env.staging`)
```bash
VITE_API_BASE_URL=https://staging-api.fourthofficial.ai
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_DEBUG_LOGGING=true
VITE_ENABLE_MOCK_DATA=false
VITE_SENTRY_DSN=https://xxx@sentry.io/staging
```

### Production (`.env.production`)
```bash
VITE_API_BASE_URL=https://api.fourthofficial.ai
VITE_ENABLE_DEVTOOLS=false
VITE_ENABLE_DEBUG_LOGGING=false
VITE_ENABLE_MOCK_DATA=false
VITE_SENTRY_DSN=https://xxx@sentry.io/production
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## Further Reading

- [Vite Environment Variables Documentation](https://vitejs.dev/guide/env-and-mode.html)
- [Why Prefix with VITE_?](https://vitejs.dev/guide/env-and-mode.html#env-variables-and-modes)
- [React Environment Variables Best Practices](https://create-react-app.dev/docs/adding-custom-environment-variables/)
