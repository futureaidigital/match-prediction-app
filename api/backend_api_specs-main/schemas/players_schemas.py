from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from app.schemas.predictions_schemas import PlayerPredictionMinimal

class PlayerCareerStats(BaseModel):
    name: str
    display_name: str
    firstname: str
    lastname: str
    common_name: str
    image_path: str
    date_of_birth: Optional[str]
    height: Optional[int]
    weight: Optional[int]
    nationality: str
    position: str
    games_played: int
    goals: int
    assists: int
    yellow_cards: int
    red_cards: int
    minutes_played: int
    shots: int
    shots_on_target: int

class PlayerSeasonStats(BaseModel):
    name: str
    display_name: str
    firstname: str
    lastname: str
    common_name: str
    image_path: str
    season_year: str
    position: str
    jersey_number: Optional[int]
    games_played: int
    goals: int
    assists: int
    yellow_cards: int
    red_cards: int
    minutes_played: int
    shots: int
    shots_on_target: int
    pass_accuracy: Optional[float]

class PlayerFixtureStats(BaseModel):
    name: str
    display_name: str
    firstname: str
    lastname: str
    common_name: str
    image_path: str
    fixture_date: str
    home_team: str
    away_team: str
    position: int
    jersey_number: Optional[int]


class PlayerSummary(BaseModel):
    """Player season statistics summary."""

    id: Optional[str] = Field(None, alias="_id")
    player_id: Optional[int] = None
    season_id: Optional[int] = None
    team_id: Optional[int] = None
    position_id: Optional[int] = None
    name: Optional[str] = None
    club: Optional[int] = Field(None, alias="team_id")
    position: Optional[int] = Field(None, alias="position_id")
    country: Optional[int] = None
    goals: Optional[int] = None
    assists: Optional[int] = None
    matches: Optional[int] = Field(None, alias="appearances")
    appearances: Optional[int] = None
    minutes: Optional[int] = Field(None, alias="minutes_played")
    minutes_played: Optional[int] = None
    passing_accuracy: Optional[float] = Field(None, alias="accurate_passes_percentage")
    accurate_passes_percentage: Optional[float] = None
    shots_on_target: Optional[int] = None
    avg_match_rating: Optional[float] = Field(None, alias="rating")
    rating: Optional[float] = None
    dribbles: Optional[int] = Field(None, alias="successful_dribbles")
    successful_dribbles: Optional[int] = None
    games: Optional[int] = Field(None, alias="appearances")
    yellowcards: Optional[int] = None
    yellow_cards: Optional[int] = Field(None, alias="yellowcards")
    fouls: Optional[int] = None
    freekicks: Optional[int] = Field(None, alias="free_kicks")
    free_kicks: Optional[int] = None

    class Config:
        populate_by_name = True


class PlayerListResponse(BaseModel):
    """Wrapper for player list responses."""

    players: List[PlayerSummary]


class PlayerStatisticRecord(BaseModel):
    """Player statistics record matching Mongo document."""

    id: Optional[str] = Field(None, alias="_id")
    player_id: int
    created_at: datetime
    updated_at: datetime
    basic: Dict[str, Any]
    advanced: Dict[str, Any]


class PlayerStatisticsResponse(BaseModel):
    """Wrapper for player statistics results."""

    statistics: List[PlayerStatisticRecord]


class PlayerWatchlistEntry(BaseModel):
    """Player watchlist entry."""

    id: Optional[str] = Field(None, alias="_id")
    year: int
    day: int
    created_at: datetime
    updated_at: datetime
    player_ids: List[int]


class PlayerWatchlistResponse(BaseModel):
    """Wrapper for watchlist results."""

    watchlist: List[PlayerWatchlistEntry]


class WatchlistPlayerDetail(BaseModel):
    """Player details with statistics for watchlist."""

    player_id:  Optional[int] = None
    display_name:  Optional[str] = None
    position_id: Optional[int] = None
    country_id: Optional[int] = None
    image_path: Optional[str] = None
    minutes_played: Optional[int] = None
    appearances: Optional[int] = None
    goals: Optional[int] = None
    assists: Optional[int] = None


class WatchlistPlayerResponse(BaseModel):
    """Wrapper for watchlist player details results."""

    players: List[WatchlistPlayerDetail]
