from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict


class FixturePrediction(BaseModel):
    """Prediction details tied to a fixture."""

    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    fixture_id: int
    created_at: datetime
    updated_at: datetime
    prediction_type: str
    prediction_id: int
    prediction_display_name: str
    pre_game_prediction: float
    pre_game_prediction_reasons: List[str] = Field(default_factory=list)
    prediction: Optional[float] = None
    prediction_reasons: Optional[List[str]] = None
    pct_change_value: Optional[float] = None
    pct_change_interval: float


class FixturePredictionList(BaseModel):
    """Wrapper for fixture prediction list responses."""

    predictions: List[FixturePrediction]


class PlayerPrediction(BaseModel):
    """Prediction details tied to a player."""

    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    player_id: int
    created_at: datetime
    updated_at: datetime
    prediction_type: str
    prediction_id: int
    prediction_display_name: str
    pre_game_prediction: float
    pre_game_prediction_reasons: List[str] = Field(default_factory=list)
    prediction: Optional[float] = None
    prediction_reasons: Optional[List[str]] = None
    pct_change_value: Optional[float] = None
    pct_change_interval: float


class PlayerPredictionList(BaseModel):
    """Wrapper for player prediction list responses."""

    predictions: List[PlayerPrediction]


class SmartComboPrediction(BaseModel):
    """Prediction details for smart combos."""

    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    fixture_id: int
    combo_id: int
    created_at: datetime
    updated_at: datetime
    prediction_type: str
    prediction_id: int
    prediction_display_name: str
    pre_game_prediction: float
    pre_game_prediction_reasons: List[str] = Field(default_factory=list)
    prediction: Optional[float] = None
    prediction_reasons: Optional[List[str]] = None
    pct_change_value: Optional[float] = None
    pct_change_interval: float


class SmartComboPredictionList(BaseModel):
    """Wrapper for smart combo prediction list responses."""

    predictions: List[SmartComboPrediction]


class FixturePredictionMinimal(BaseModel):
    """Minimal prediction details for fixtures (used in match cards)."""

    model_config = ConfigDict(populate_by_name=True)

    prediction_id: int
    prediction_display_name: str
    pre_game_prediction: float
    prediction: Optional[float] = None
    pct_change_value: Optional[float] = None
    pct_change_interval: float


class PlayerPredictionMinimal(BaseModel):
    """Minimal prediction details for players (used in player cards)."""

    model_config = ConfigDict(populate_by_name=True)

    prediction_id: int
    prediction_display_name: str
    pre_game_prediction: float
    prediction: Optional[float] = None
    pct_change_value: Optional[float] = None
    pct_change_interval: float


class SmartComboFixtureSummary(BaseModel):
    """Lightweight fixture representation for smart combo bundles."""

    fixture_id: int
    league_name: Optional[str] = None
    home_team_name: Optional[str] = None
    away_team_name: Optional[str] = None
    starting_at: Optional[datetime] = None


class SmartComboSummary(BaseModel):
    """High-level smart combo information for the current combo endpoint."""

    combo_id: int
    name: str
    description: Optional[str] = None
    starts_at: datetime
    expires_at: datetime
    confidence: float
    total_odds: float
    fixture_ids: List[int] = Field(default_factory=list)
    is_active: bool
    previous_week_combo_accuracy: Optional[float] = None


class SmartComboFixturePredictions(BaseModel):
    """Fixture plus predictions grouping for the current smart combo."""

    fixture: SmartComboFixtureSummary
    predictions: List[SmartComboPrediction]


class SmartComboCurrentResponse(BaseModel):
    """Payload returned by /smart-combos/current."""

    combo: SmartComboSummary
    fixtures: List[SmartComboFixturePredictions]
