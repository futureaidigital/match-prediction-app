# API Integration Guide

This guide shows how to use the newly integrated API service layer and authentication context in your Match Prediction App.

## Files Created

### 1. Environment Variables
- `.env` - Environment variables (DO NOT commit to git)
- `.env.example` - Template for environment variables
- `src/vite-env.d.ts` - TypeScript definitions for env variables

### 2. API Service Layer
- `src/services/api.ts` - Complete API client with all endpoints

### 3. Authentication Context
- `src/contexts/AuthContext.tsx` - React context for auth state management

### 4. Updated Files
- `src/main.tsx` - Wrapped app with AuthProvider

---

## Quick Start

### 1. Using Authentication in Components

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    login,
    logout,
    hasAccess
  } = useAuth();

  // Check if user is logged in
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Check if user has premium access
  if (!hasAccess()) {
    return <SubscriptionPrompt />;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 2. Login Example

```tsx
import { useAuth } from './contexts/AuthContext';
import { useState } from 'react';

function LoginForm() {
  const { login, error, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password });
      // Redirect to dashboard or home
    } catch (err) {
      // Error is handled by context and available in `error` state
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### 3. Fetching Fixtures

```tsx
import { api } from './services/api';
import { useState, useEffect } from 'react';
import { Fixture } from './services/api';

function FeaturedMatches() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const response = await api.getFixtures({
          has_predictions: true,
          is_live: true,
          limit: 10,
          sort_by: 'kickoff_at',
          sort_order: 'asc'
        });

        if (response.success) {
          setFixtures(response.data.fixtures);
        }
      } catch (error) {
        console.error('Failed to fetch fixtures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
  }, []);

  if (loading) return <div>Loading matches...</div>;

  return (
    <div>
      {fixtures.map(fixture => (
        <MatchCard key={fixture.id} fixture={fixture} />
      ))}
    </div>
  );
}
```

### 4. Fetching Predictions

```tsx
import { api } from './services/api';
import { useState, useEffect } from 'react';
import { Prediction } from './services/api';

function PredictionsList({ fixtureId }: { fixtureId: string }) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await api.getFixturePredictions({
          fixture_id: fixtureId,
          sort_by: 'pct_change',
          sort_order: 'desc',
          limit: 50
        });

        if (response.success) {
          setPredictions(response.data.predictions);
        }
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
      }
    };

    fetchPredictions();
  }, [fixtureId]);

  return (
    <div>
      {predictions.map(prediction => (
        <PredictionCard
          key={prediction.id}
          prediction={prediction}
        />
      ))}
    </div>
  );
}
```

### 5. Smart Combos

```tsx
import { api } from './services/api';
import { useState, useEffect } from 'react';
import { SmartCombo } from './services/api';

function SmartCombosList() {
  const [combos, setCombos] = useState<SmartCombo[]>([]);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await api.getSmartCombos({
          limit: 10,
          sort_by: 'accuracy_pct',
          sort_order: 'desc'
        });

        if (response.success) {
          setCombos(response.data.combos);
        }
      } catch (error) {
        console.error('Failed to fetch combos:', error);
      }
    };

    fetchCombos();
  }, []);

  return (
    <div>
      {combos.map(combo => (
        <SmartComboCard
          key={combo.id}
          combo={combo}
        />
      ))}
    </div>
  );
}
```

### 6. Checking Subscription Status

```tsx
import { useAuth } from './contexts/AuthContext';

function ProtectedContent() {
  const { subscriptionStatus, hasAccess } = useAuth();

  if (!hasAccess()) {
    return (
      <div className="paywall">
        <h2>Premium Content</h2>
        <p>Subscribe to access predictions</p>
        <button>Subscribe Now</button>
      </div>
    );
  }

  return (
    <div>
      <p>Subscription active until: {subscriptionStatus?.access_expires_at}</p>
      <PredictionsList />
    </div>
  );
}
```

---

## API Service Features

### Authentication
- `api.register(data)` - Register new user
- `api.login(data)` - Login user
- `api.logout()` - Logout user
- `api.refreshToken()` - Refresh access token
- `api.forgotPassword(email)` - Send password reset email
- `api.resetPassword(code, password)` - Reset password

### User Management
- `api.getCurrentUser()` - Get current user profile
- `api.updateUserProfile(data)` - Update profile

### Payments & Subscriptions
- `api.getSubscriptionStatus()` - Check subscription
- `api.getSubscriptionPricing()` - Get pricing plans
- `api.createCustomer(data)` - Create payment customer
- `api.createSubscriptionIntent(data)` - Start subscription
- `api.cancelSubscription(reason)` - Cancel subscription

### Sports Data
- `api.getFixtures(params)` - Get fixtures with filters
- `api.getFixtureById(id)` - Get single fixture
- `api.getFixtureCommentary(id)` - Get commentary
- `api.getFixtureWeather(id)` - Get weather data
- `api.getFixtureStatistics(id)` - Get statistics
- `api.getPlayers(params)` - Get players

### Predictions
- `api.getFixturePredictions(params)` - Get fixture predictions
- `api.getPlayerPredictions(params)` - Get player predictions
- `api.getSmartCombos(params)` - Get smart combos
- `api.getSmartComboAccuracy(params)` - Get combo accuracy

---

## Auth Context Features

### State
- `user` - Current user object
- `subscriptionStatus` - Subscription info
- `isAuthenticated` - Boolean auth status
- `isLoading` - Loading state
- `error` - Error message

### Methods
- `login(credentials)` - Login user
- `register(data)` - Register user
- `logout()` - Logout user
- `updateProfile(data)` - Update user profile
- `updatePassword(current, new)` - Change password
- `refreshSubscriptionStatus()` - Refresh subscription
- `hasAccess()` - Check if user has access
- `clearError()` - Clear error state

---

## Error Handling

All API calls return a consistent error format:

```tsx
try {
  await api.login({ email, password });
} catch (error) {
  const apiError = error as ApiError;
  console.error(apiError.error.code); // ERROR_CODE
  console.error(apiError.error.message); // Human-readable message
}
```

Common error codes:
- `INVALID_CREDENTIALS` - Wrong email/password
- `USER_NOT_FOUND` - User doesn't exist
- `EMAIL_ALREADY_EXISTS` - Email in use
- `UNAUTHORIZED` - Token invalid/expired
- `NO_ACCESS` - Subscription required
- `NETWORK_ERROR` - Connection failed

---

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://api.fourthofficial.ai
VITE_API_VERSION=v1
```

Access in code:
```tsx
const baseUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## Next Steps

1. **Update your components** to use the API service instead of sample data
2. **Implement login/register pages** using the auth context
3. **Add protected routes** that check authentication status
4. **Implement subscription paywall** using `hasAccess()`
5. **Add loading states** and error handling to API calls
6. **Consider adding WebSocket** for real-time prediction updates

---

## Example: Convert App.tsx to Use Real Data

Instead of:
```tsx
const sampleMatches = [ /* hardcoded data */ ];
```

Use:
```tsx
const [matches, setMatches] = useState<Fixture[]>([]);

useEffect(() => {
  const fetchMatches = async () => {
    const response = await api.getFixtures({
      has_predictions: true,
      limit: 10
    });

    if (response.success) {
      setMatches(response.data.fixtures);
    }
  };

  fetchMatches();
}, []);
```

---

## Security Notes

1. **Never commit `.env`** to git (add to `.gitignore`)
2. **Tokens stored in localStorage** - cleared on logout
3. **Auto token refresh** handled by auth context
4. **API errors** handled consistently
5. **HTTPS required** in production

---

## Support

For API issues, check the Postman collection at:
`FourthOfficial_API.postman_collection.json`

Base URL: `https://api.fourthofficial.ai`
