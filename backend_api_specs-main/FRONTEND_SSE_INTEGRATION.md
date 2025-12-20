# Frontend SSE Integration Guide

## Quick Start

```tsx
// Subscribe to fixture updates
const fixtureIds = [19427274, 19425325, 19433497];
const eventSource = new EventSource(
  `/api/v1/fixtures/stream?fixture_ids=${fixtureIds.join(',')}`
);

eventSource.addEventListener('fixture_update', (event) => {
  const update = JSON.parse(event.data);
  console.log('Fixture updated:', update.fixture.fixture_id);
});

// Cleanup on unmount
eventSource.close();
```

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/fixtures?fixture_ids=1,2,3` | Initial data load |
| GET | `/api/v1/fixtures/stream?fixture_ids=1,2,3` | SSE stream (max 10 IDs) |

## Event Payload

Event name: `fixture_update`

```typescript
interface FixtureUpdate {
  fixture: {
    fixture_id: number;
    home_team_score: number | null;
    away_team_score: number | null;
    minutes_elapsed: number | null;
    home_team_id: number | null;
    home_team_short_code: string | null;
    home_team_image_path: string | null;
    away_team_id: number | null;
    away_team_short_code: string | null;
    away_team_image_path: string | null;
    number_of_predictions: number;
  };
  predictions: Array<{
    prediction_id: number;
    prediction_display_name: string;
    pre_game_prediction: number;
    prediction: number | null;
    pct_change_value: number | null;
    pct_change_interval: number;
    is_featured: boolean;
  }>;
}
```

## Notes

- Maximum 10 fixture IDs per stream connection
- Server sends keepalive pings every 15 seconds
- EventSource automatically reconnects on connection loss
- Always close the EventSource when the component unmounts
