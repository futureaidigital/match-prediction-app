# FourthOfficial - Issues & Feedback Report

**Date:** December 15, 2025

---

## Part 1: API Issues (Backend)

### Summary

The frontend is connected to the API correctly, but the backend is returning empty/incomplete data.

| Endpoint | Status | Issue |
|----------|--------|-------|
| `/api/v1/fixtures` | Empty `[]` | No fixtures in database for current dates |
| `/api/v1/smart-combos/current` | Partial data | Fixtures exist but `home_team_name`/`away_team_name` are null |

### 1. Fixtures Endpoint

**Request:**
```bash
curl "https://api.fourthofficial.ai/api/v1/fixtures"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fixture_ids": [],
    "fixtures": []
  },
  "errors": []
}
```

**Tested variations:**
- `/fixtures` (default) → Empty
- `/fixtures?match_type=live` → Empty
- `/fixtures?date_from=2025-12-14&date_to=2025-12-21` → Empty

**Result:** No fixtures available for any date range.

### 2. Smart Combos Endpoint

**Response:** Returns combo with fixtures, BUT:
- `fixture.home_team_name` = null
- `fixture.away_team_name` = null
- Predictions data IS populated correctly

**Frontend displays:**
- Team names fall back to "HOM" / "AWY"
- Predictions show correctly (e.g., "Over 1.5 Goals First Half", "Both Teams to Score")

### Required Backend Actions

1. **Load fixture data** for current/upcoming dates into the database
2. **Populate team names** in smart combo fixtures:
   - `home_team_name`
   - `away_team_name`
   - `home_team_image_path`
   - `away_team_image_path`

---

## Part 2: Frontend Feedback (3rd December)

### FUNCTIONALITY (Priority)

#### Home Page Carousel
- [ ] Handle long team names
- [ ] Web: team names/badges on outer part of component (per designs)
- [ ] Premium users should see unscrambled predictions (currently stay scrambled)
- [ ] Add blur on scrambled predictions for free users (like match cards)

#### Match Cards
- [ ] Change API to use `/api/v1/fixtures` endpoint
- [ ] Use `number_of_predictions` field from API for "3 out of X" section

#### Smart Combo
- [ ] "See more" button not working
- [ ] Smart Combo page missing

#### Players to Watch
- [ ] Web: player boxes expand incorrectly (should stay square)
- [ ] Mobile: enable swipe gestures instead of button clicks

#### Matches Page
- [ ] Mobile: remove "Matches" title text
- [ ] Prevent API spam when on "Live" toggle but clicking through dates

#### Pricing Page
- [ ] Call `/api/v1/payments/subscription-pricing` for dynamic values/currency
- [ ] Handle unsupported country errors (e.g., India)

#### Individual Match Page
- [ ] Banner text size inconsistent with home screen
- [ ] Mobile: nav bar (predictions/stats/commentary) needs to be scrollable
- [ ] Nav bar should be inline with filter button
- [ ] Weather not working on mobile, needs scrolling

#### Missing Pages
- [ ] Players page
- [ ] Leagues page
- [ ] Register page
- [ ] Login page

---

### STYLING (Later)

#### Global
- [ ] Check font weight (may be too thick)
- [ ] Add branding/logo to navbar

#### Home Page Carousel
- [ ] Add red "LIVE" icon
- [ ] Fix score dash alignment (moves for different scores)

#### Match Cards
- [ ] Cards too long/thin - should fit 2 on mobile (or 1.5 min)
- [ ] Prediction boxes should be white (not grey)
- [ ] Remove padding between prediction boxes
- [ ] Remove card outline/border
- [ ] Cards inside grey box with shadow
- [ ] Keep hover shadow effect
- [ ] Add divider line between scores and first prediction
- [ ] Reduce white space at bottom of third prediction

#### Smart Combo
- [ ] Component too narrow
- [ ] White box with shadow (remove border)
- [ ] 72% accuracy in own grey box, remove divider
- [ ] Reduce blue space above/below "Smart Combo" text
- [ ] Move gradient more to top-left

#### Players to Watch
- [ ] Fix gap between loading skeleton and populated state
- [ ] Blue space around "player watchlist" shifts on load

#### Matches Page
- [ ] Grey background with white cards and shadow
- [ ] Center "VS" text with lines
- [ ] Lines should be black with fade effect

#### Pricing Page
- [ ] Align weekly button with monthly (pad from bottom)

#### Individual Match Page
- [ ] Remove outline, add shadow
- [ ] Only blue highlight for `is_featured` predictions
- [ ] Reduce white space in closed predictions
- [ ] Weather: rounded bottom, more rounded main box

---

## Part 3: API Specs Reference

### Key Fields for Frontend Fixes

| Feedback Item | API Field/Endpoint |
|--------------|-------------------|
| "3 out of X" predictions | `fixture.number_of_predictions` |
| Featured prediction (blue) | `prediction.is_featured` |
| 72% accuracy display | `smart_combo.previous_week_combo_accuracy` |
| Dynamic pricing | `GET /api/v1/payments/subscription-pricing` |

### SSE Real-time Updates

```typescript
// Subscribe to fixture updates (max 10 IDs)
GET /api/v1/fixtures/stream?fixture_ids=1,2,3

// Event: "fixture_update"
```

### New Endpoints for Missing Pages

**Leagues:**
- `GET /api/v1/leagues`
- `GET /api/v1/leagues/current?league_id=X`
- `GET /api/v1/leagues/{league_id}/fixtures?season_id=X`

**Players:**
- `GET /api/v1/players/player?player_id=X`
- `GET /api/v1/players/statistics?player_id=X`
- `GET /api/v1/players/watchlist`

---

## Test Credentials

```
Premium User:
  Email: premium@fourthofficial.ai
  Password: TestPassword123!

Free User:
  Email: free@fourthofficial.ai
  Password: TestPassword123!
```

---

## How to Run

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`
