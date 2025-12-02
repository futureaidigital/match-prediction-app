# Backend API Specs

Backend API specs and functions for assistance during the frontend development.

## Overview

Complete API testing collection for FourthOfficial sports betting platform including:
- Firebase Authentication
- Sports Data Endpoints (Leagues, Teams, Fixtures)
- Smart Combos & Predictions
- Complete Payment Integration (Stripe & Paystack)
- User Management
- Subscription Management

## Postman Collection Setup

### Base URL Configuration
- **Production**: `https://api.fourthofficial.ai`
- **Local Development**: `http://localhost:8000`

### Authentication
The API uses Firebase Authentication with JWT tokens. You'll need to login with one of the following test users:

#### Test Users
- **Free User**: `free@fourthofficial.ai`
- **Premium User**: `premium@fourthofficial.ai`
- **Password** (for all test users): `TestPassword123!`

### How to Use the Postman Collection

1. **Import the Collection**
   - Open Postman
   - Click "Import" and select the `FourthOfficial_API.postman_collection.json` file from this repository

2. **Configure Environment**
   - Set `base_url` variable (default: `http://localhost:8000`)
   - Other variables will be auto-populated by test scripts

3. **Authenticate**
   - Use the login endpoint with one of the test user credentials above
   - The auth token will be automatically saved to the environment variable
   - Subsequent requests will use this token automatically

4. **Making API Requests**
   - All authenticated endpoints use `Bearer {{auth_token}}` in headers
   - The collection includes pre-request scripts and tests to manage tokens

## Payment Providers

### Stripe (UK, EU, US)
- Card subscriptions (weekly, monthly, yearly)
- Payment Element integration
- Subscription management
- Provider auto-selected for UK/EU/US users

### Paystack (Ghana, Nigeria, Kenya, South Africa)
- One-time payments for time-based access (3, 7, 30 days)
- Mobile money support (MTN, Vodafone, Tigo, M-Pesa)
- Card subscriptions
- USSD payments
- Provider auto-selected for GH/NG/KE/ZA users

## API Endpoint Categories

### 1. Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/refresh-token` - Refresh Firebase ID token
- `POST /api/v1/auth/forgot-password` - Send password reset email
- `POST /api/v1/auth/reset-password` - Reset password with code
- `POST /api/v1/auth/update-password` - Update password (authenticated)
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/verify-email` - Verify email with code
- `POST /api/v1/auth/resend-verification` - Resend verification email

### 2. User Management
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile

### 3. Payments
- `GET /api/v1/payments/subscription-status` - Get subscription status
- `GET /api/v1/payments/subscription-pricing` - Get country-specific pricing
- `POST /api/v1/payments/create-customer` - Create/get payment customer
- `POST /api/v1/payments/cancel-subscription` - Cancel subscription
- `POST /api/v1/payments/create-subscription-intent` - Create subscription with payment
- `POST /api/v1/payments/change-subscription-plan` - Change subscription plan
- `POST /api/v1/payments/update-payment-setup` - Update payment method
- `GET /api/v1/payments/invoices` - List customer invoices
- `POST /api/v1/payments/test-complete-payment` - Test payment completion (dev only)
- `POST /api/v1/payments/initialize-payment` - Initialize one-time payment (Paystack)

### 4. Sports Data - Fixtures
- `GET /api/v1/fixtures` - Get fixtures (default 7 days)
  - Query params: `leagues`, `match_type` (live/upcoming/finished), `sort_by`, `date_from`, `date_to`, `fixture_ids`
  - Returns all fixture IDs + full data for first 6 fixtures
  - Use `fixture_ids` param for pagination
- `GET /api/v1/fixtures/{fixture_id}/commentary` - Get match commentary
- `GET /api/v1/fixtures/{fixture_id}/weather` - Get weather data
- `GET /api/v1/fixtures/{fixture_id}/statistics` - Get match statistics
- `GET /api/v1/fixtures/predictions` - List fixture predictions (detailed)
  - Query params: `fixture_id`, `fixture_ids`, `sort_by`, `sort_order`, `limit`
  - Premium users see full details, free users see obfuscated data

### 5. Sports Data - Leagues & Teams
- `GET /api/v1/leagues/standings` - Get league standings (public endpoint)
  - Query params: `league_id` (required), `season_id` (required)
  - Returns positions, points, form, next fixtures

### 6. Sports Data - Players
- `GET /api/v1/players` - List players
- `GET /api/v1/players/statistics` - Get player statistics
- `GET /api/v1/players/watchlist` - Get daily player watchlist
- `GET /api/v1/players/predictions` - List player predictions (detailed)
  - Free users see obfuscated prediction names but real numeric values

### 7. Predictions - Smart Combos
- `GET /api/v1/smart-combos/predictions` - List smart combo predictions
- `GET /api/v1/smart-combos/current` - Get current active smart combo
- `GET /api/v1/smart-combos/accuracy` - Get smart combo accuracy metrics

### 8. Health Check
- `GET /health` - API health check
- `GET /api/v1/health/db` - Database health check

## Testing Flow

1. **Authentication** → Register/Login to get auth token
2. **User Profile** → Get/Update user info
3. **Sports Data** → Browse leagues, teams, fixtures
4. **Payments** → Create customer, initialize payment
5. **Subscriptions** → Check status, manage subscription

## Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "data": { ... }
}
```

## Notes

- Authentication is required for most endpoints (marked with Bearer token in headers)
- Some endpoints are public (e.g., league standings, API health)
- Payment provider is auto-selected based on user's country
- Free vs Premium users have different access levels for predictions
- The Postman collection includes automatic token management via test scripts
