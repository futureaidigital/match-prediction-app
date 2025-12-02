from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict

# Import prediction schema for fixtures
from app.schemas.predictions_schemas import FixturePredictionMinimal


class FixtureSummary(BaseModel):
    """Lightweight representation of a fixture for list responses."""

    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    fixture_id: int
    league_id: int
    venue_id: Optional[int] = None
    home_team_id: int
    away_team_id: int
    created_at: datetime
    updated_at: datetime
    home_team_name: str
    away_team_name: str
    home_team_abbreviation: Optional[str] = None
    away_team_abbreviation: Optional[str] = None
    home_team_logo_location: Optional[str] = None
    away_team_logo_location: Optional[str] = None
    kickoff_at: datetime
    minutes_elapsed: Optional[int] = None
    is_live: bool = False
    is_carousel: bool = False
    has_predictions: bool = False


class FixtureListResponse(BaseModel):
    """Wrapper for fixture list responses."""

    fixtures: List[FixtureSummary]


class FixtureCommentaryItem(BaseModel):
    """Single commentary entry for a fixture."""

    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    commentary_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    commentary_type: Optional[str] = None
    commentary_details: Dict[str, Any] = Field(default_factory=dict)


class FixtureCommentaryResponse(BaseModel):
    """Fixture commentary payload."""

    fixture_id: int
    commentary: List[FixtureCommentaryItem]


class FixtureWeather(BaseModel):
    """Weather information associated with a fixture."""

    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    fixture_id: int
    venue_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    weather_by_hour: Dict[str, Any] = Field(default_factory=dict)
    fixture_window_start_at: Optional[datetime] = None
    fixture_window_end_at: Optional[datetime] = None


class FixtureWeatherResponse(BaseModel):
    """Fixture weather payload."""

    weather: FixtureWeather


class FixtureStatistics(BaseModel):
    """Basic and advanced statistics for a fixture."""

    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    fixture_id: int
    created_at: datetime
    updated_at: datetime
    basic: Dict[str, Any] = Field(default_factory=dict)
    advanced: Dict[str, Any] = Field(default_factory=dict)


class FixtureStatisticsResponse(BaseModel):
    """Fixture statistics payload."""

    statistics: FixtureStatistics


class FixtureBasic(BaseModel):
    """Minimal fixture information for match cards."""

    model_config = ConfigDict(populate_by_name=True)

    fixture_id: int
    away_team_score: Optional[int] = None
    home_team_score: Optional[int] = None
    minutes_elapsed: Optional[int] = None
    # Home team info
    home_team_id: Optional[int] = None
    home_team_short_code: Optional[str] = None
    home_team_image_path: Optional[str] = None
    # Away team info
    away_team_id: Optional[int] = None
    away_team_short_code: Optional[str] = None
    away_team_image_path: Optional[str] = None


class FixtureItem(BaseModel):
    """A fixture with its associated predictions."""

    model_config = ConfigDict(populate_by_name=True)

    fixture: FixtureBasic
    predictions: List[FixturePredictionMinimal] = Field(default_factory=list)


class FixturesResponse(BaseModel):
    """Response for fixtures endpoint with optional fixture IDs list."""

    fixture_ids: Optional[List[int]] = None  # Only included when no fixture_ids param
    fixtures: List[FixtureItem]

class FixtureIdsResponse(BaseModel):
    """Response containing list of fixture IDs based on filters."""

    fixture_ids: List[int]
