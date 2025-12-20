from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class StandingTeam(BaseModel):
    """Team information within a standing."""

    model_config = ConfigDict(populate_by_name=True)

    team_id: int
    team_name: str
    team_logo: Optional[str] = None


class NextFixture(BaseModel):
    """Next upcoming fixture for a team."""

    model_config = ConfigDict(populate_by_name=True)

    fixture_id: int
    opponent_logo: Optional[str] = None


class StandingItem(BaseModel):
    """Individual team standing with statistics and form."""

    model_config = ConfigDict(populate_by_name=True)

    position: int
    points: int
    goal_difference: int
    wins: int
    draws: int
    losses: int
    matches_played: int
    form: List[str] = Field(default_factory=list)  # e.g., ['W', 'W', 'L', 'D', 'L']
    team: StandingTeam
    next_fixture: Optional[NextFixture] = None


class LeagueStandingsResponse(BaseModel):
    """Response for league standings endpoint."""

    model_config = ConfigDict(populate_by_name=True)

    league_id: int
    season_id: int
    updated_at: Optional[datetime] = None
    standings: List[StandingItem] = Field(default_factory=list)


class SeasonOption(BaseModel):
    """Season option for dropdown selection."""

    model_config = ConfigDict(populate_by_name=True)

    season_id: int
    season_name: str
    is_current: bool = False


class LeagueInfo(BaseModel):
    """Basic league information."""

    model_config = ConfigDict(populate_by_name=True)

    league_id: int
    league_name: str
    league_short_code: Optional[str] = None
    country_name: Optional[str] = None


class LeagueCurrentResponse(BaseModel):
    """Response for GET /leagues/current endpoint."""

    model_config = ConfigDict(populate_by_name=True)

    league: LeagueInfo
    current_season: SeasonOption
    available_seasons: List[SeasonOption] = Field(default_factory=list)
    standings: List[StandingItem] = Field(default_factory=list)
    updated_at: Optional[datetime] = None


class LeagueSummary(BaseModel):
    """Summary league information for leagues list."""

    model_config = ConfigDict(populate_by_name=True)

    league_id: int
    league_name: str
    short_code: Optional[str] = None
    country_id: Optional[int] = None
    league_type: Optional[str] = None
    league_sub_type: Optional[str] = None
    image_path: Optional[str] = None


class LeaguesListResponse(BaseModel):
    """Response for GET /leagues endpoint."""

    model_config = ConfigDict(populate_by_name=True)

    leagues: List[LeagueSummary] = Field(default_factory=list)
