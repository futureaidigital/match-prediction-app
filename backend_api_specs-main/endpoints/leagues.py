import time
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query

from app.core.auth import get_current_user_optional
from app.core.database import get_database
from app.core.monitoring import get_logger
from app.schemas.fixtures_schemas import FixtureItem, FixturesResponse
from app.schemas.leagues_schemas import LeagueCurrentResponse, LeaguesListResponse, LeagueStandingsResponse
from app.schemas.responses_schemas import ErrorObject, StandardResponse
from app.services.fixtures_service import FixturesService
from app.services.leagues_service import LeaguesService

logger = get_logger(__name__)

router = APIRouter()


@router.get("", response_model=StandardResponse[LeaguesListResponse])
async def get_leagues() -> StandardResponse[LeaguesListResponse]:
    """
    Get all production leagues.

    Returns list of leagues marked as is_prod: true, sorted alphabetically.
    """
    request_start = time.time()

    try:
        logger.debug("Fetching production leagues")

        # Get database
        db, leagues_db = LeaguesService.get_leagues_database()

        # Get leagues
        response = await LeaguesService.get_prod_leagues(leagues_db)

        logger.info(
            "Successfully fetched production leagues",
            extra={"duration_ms": int((time.time() - request_start) * 1000)},
        )

        return response

    except Exception as exc:
        logger.error(
            "Failed to fetch production leagues",
            extra={
                "error": str(exc),
                "error_type": type(exc).__name__,
            },
        )
        error = ErrorObject(
            code="LEAGUES_FETCH_ERROR",
            message=f"Failed to fetch leagues: {str(exc)}",
        )
        return StandardResponse.error_response(errors=[error])


@router.get("/current", response_model=StandardResponse[LeagueCurrentResponse])
async def get_league_current(
    league_id: Optional[int] = Query(None, description="League ID (required)"),
) -> StandardResponse[LeagueCurrentResponse]:
    """
    Get current league season with standings and available seasons for dropdown.

    Returns:
    - League information (name, short code, country)
    - Current season details
    - List of last 5 seasons for dropdown selection
    - Current season standings with team stats, form, and next fixtures
    """
    request_start = time.time()

    try:
        # Validate required parameter
        LeaguesService.validate_league_id(league_id)

        logger.debug(
            "Fetching current league data",
            extra={"league_id": league_id},
        )

        # Get database
        db, leagues_db = LeaguesService.get_leagues_database()

        # Build and return response
        response = await LeaguesService.build_current_league_response(
            league_id=league_id,
            leagues_db=leagues_db,
        )

        logger.info(
            "Successfully fetched current league data",
            extra={
                "league_id": league_id,
                "duration_ms": int((time.time() - request_start) * 1000),
            },
        )

        return response

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(
            "Failed to fetch current league data",
            extra={
                "league_id": league_id,
                "error": str(exc),
                "error_type": type(exc).__name__,
            },
        )
        error = ErrorObject(
            code="LEAGUE_CURRENT_FETCH_ERROR",
            message=f"Failed to fetch current league data: {str(exc)}",
        )
        return StandardResponse.error_response(errors=[error])


@router.get("/standings/{season_id}", response_model=StandardResponse[LeagueStandingsResponse])
async def get_league_standings_by_season(
    season_id: int,
    league_id: Optional[int] = Query(None, description="League ID (required)"),
) -> StandardResponse[LeagueStandingsResponse]:
    """
    Get league standings for a specific season.

    Returns standings sorted by position with:
    - Team information (name, logo)
    - Statistics (position, points, wins, draws, losses, matches played, goal difference)
    - Form (last 5 results as array of W/L/D)
    - Next upcoming fixture for each team
    """
    request_start = time.time()

    try:
        # Validate required parameters
        LeaguesService.validate_required_params(league_id, season_id)

        logger.debug(
            "Fetching league standings by season",
            extra={
                "league_id": league_id,
                "season_id": season_id,
            },
        )

        # Build query
        query = LeaguesService.build_standings_query(league_id, season_id)

        # Get database
        db, leagues_db = LeaguesService.get_leagues_database()

        # Fetch standings from standings_refactor collection
        standings_documents: List[Dict[str, Any]] = []
        cursor = leagues_db["standings_refactor"].find(query).sort([("position", 1)])

        async for doc in cursor:
            standings_documents.append(_serialize_document(doc))

        if not standings_documents:
            logger.info(
                "No standings found",
                extra={
                    "league_id": league_id,
                    "season_id": season_id,
                },
            )
            # Return empty standings response instead of 404
            data = LeagueStandingsResponse(
                league_id=league_id,
                season_id=season_id,
                standings=[],
            )
            return StandardResponse[LeagueStandingsResponse].success_response(data=data)

        # Build response with standings, form, and next fixtures
        response = await LeaguesService.build_standings_response(
            standings_documents=standings_documents,
            league_id=league_id,
            season_id=season_id,
            leagues_db=leagues_db,
        )

        logger.info(
            "Successfully fetched league standings by season",
            extra={
                "league_id": league_id,
                "season_id": season_id,
                "standings_count": len(standings_documents),
                "duration_ms": int((time.time() - request_start) * 1000),
            },
        )

        return response

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(
            "Failed to fetch league standings by season",
            extra={
                "league_id": league_id,
                "season_id": season_id,
                "error": str(exc),
                "error_type": type(exc).__name__,
            },
        )
        error = ErrorObject(
            code="STANDINGS_FETCH_ERROR",
            message=f"Failed to fetch league standings: {str(exc)}",
        )
        return StandardResponse.error_response(errors=[error])


@router.get("/{league_id}/fixtures", response_model=StandardResponse[FixturesResponse])
async def get_league_fixtures(
    league_id: int,
    season_id: int = Query(..., description="Season ID (required)"),
    _current_user: Optional[Dict[str, Any]] = get_current_user_optional(),
) -> StandardResponse[FixturesResponse]:
    """
    Get fixtures for a specific league and season.

    For current season: Returns next 10 matches from now (live + upcoming).
    For past season: Returns last 10 matches (most recent finished, in chronological order).

    Returns fixture cards with predictions.
    """
    request_start = time.time()

    try:
        logger.debug(
            "Fetching league fixtures",
            extra={
                "league_id": league_id,
                "season_id": season_id,
            },
        )

        # Get database to check if season is current
        db, leagues_db = LeaguesService.get_leagues_database()

        # Look up season to determine if it's current
        season_doc = await leagues_db["league_season_lookup"].find_one({
            "league_id": league_id,
            "season_id": season_id,
        })

        if not season_doc:
            raise HTTPException(
                status_code=404,
                detail=f"Season {season_id} not found for league {league_id}.",
            )

        is_current_season = season_doc.get("season_is_current", False)

        # If not marked as current, also check by date
        if not is_current_season:
            from datetime import datetime
            today = datetime.utcnow().strftime("%Y-%m-%d")
            start = season_doc.get("season_starting_at", "")
            end = season_doc.get("season_ending_at", "")
            if start and end and start <= today <= end:
                is_current_season = True

        # Get fixture IDs using the service
        fixture_ids = await FixturesService.get_league_fixture_ids(
            league_id=league_id,
            season_id=season_id,
            is_current_season=is_current_season,
            limit=10,
        )

        # If no fixture IDs found, return empty response
        if not fixture_ids:
            data = FixturesResponse(fixtures=[])
            return StandardResponse[FixturesResponse].success_response(data=data)

        # Fetch full fixture documents (same pattern as fixtures.py)
        db = get_database()
        db_client = db.client
        fixtures_db = db_client["fourthofficial_refactor"]

        fixtures_documents = []
        cursor = fixtures_db["fixtures_refactor"].find({"_id": {"$in": fixture_ids}})
        async for doc in cursor:
            fixtures_documents.append(doc)

        # Sort fixtures to match the order of fixture_ids
        fixtures_by_id = {doc["_id"]: doc for doc in fixtures_documents}
        fixtures_documents = [fixtures_by_id[fid] for fid in fixture_ids if fid in fixtures_by_id]

        # Build fixtures with predictions (same pattern as fixtures.py - direct call)
        fixtures_with_predictions = await FixturesService.build_fixtures_with_predictions(
            fixtures_documents=fixtures_documents,
            current_user=_current_user,
        )

        logger.info(
            "Successfully fetched league fixtures",
            extra={
                "league_id": league_id,
                "season_id": season_id,
                "is_current_season": is_current_season,
                "fixture_count": len(fixtures_with_predictions),
                "duration_ms": int((time.time() - request_start) * 1000),
            },
        )

        data = FixturesResponse(fixtures=fixtures_with_predictions)
        return StandardResponse[FixturesResponse].success_response(data=data)

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(
            "Failed to fetch league fixtures",
            extra={
                "league_id": league_id,
                "season_id": season_id,
                "error": str(exc),
                "error_type": type(exc).__name__,
            },
        )
        error = ErrorObject(
            code="LEAGUE_FIXTURES_FETCH_ERROR",
            message=f"Failed to fetch league fixtures: {str(exc)}",
        )
        return StandardResponse.error_response(errors=[error])


def _serialize_document(document: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Convert MongoDB document into JSON-friendly dict."""
    if document is None:
        return None

    serialized = dict(document)

    if "_id" in serialized and isinstance(serialized["_id"], ObjectId):
        serialized["_id"] = str(serialized["_id"])

    return serialized


@router.get("/standings", response_model=StandardResponse[LeagueStandingsResponse])
async def get_league_standings(
    league_id: Optional[int] = Query(None, description="League ID (required)"),
    season_id: Optional[int] = Query(None, description="Season ID (required)"),
) -> StandardResponse[LeagueStandingsResponse]:
    """
    Get league standings with team statistics, form, and next fixtures.

    Returns standings sorted by position with:
    - Team information (name, logo)
    - Statistics (position, points, wins, draws, losses, matches played, goal difference)
    - Form (last 5 results as array of W/L/D)
    - Next upcoming fixture for each team
    """
    request_start = time.time()

    try:
        # Validate required parameters
        LeaguesService.validate_required_params(league_id, season_id)

        logger.debug(
            "Fetching league standings",
            extra={
                "league_id": league_id,
                "season_id": season_id,
            },
        )

        # Build query
        query = LeaguesService.build_standings_query(league_id, season_id)

        # Get database
        db, leagues_db = LeaguesService.get_leagues_database()

        # Fetch standings from standings_refactor collection
        standings_documents: List[Dict[str, Any]] = []
        cursor = leagues_db["standings_refactor"].find(query).sort([("position", 1)])

        async for doc in cursor:
            standings_documents.append(_serialize_document(doc))

        if not standings_documents:
            logger.info(
                "No standings found",
                extra={
                    "league_id": league_id,
                    "season_id": season_id,
                },
            )
            # Return empty standings response instead of 404
            data = LeagueStandingsResponse(
                league_id=league_id,
                season_id=season_id,
                standings=[],
            )
            return StandardResponse[LeagueStandingsResponse].success_response(data=data)

        # Build response with standings, form, and next fixtures
        response = await LeaguesService.build_standings_response(
            standings_documents=standings_documents,
            league_id=league_id,
            season_id=season_id,
            leagues_db=leagues_db,
        )

        logger.info(
            "Successfully fetched league standings",
            extra={
                "league_id": league_id,
                "season_id": season_id,
                "standings_count": len(standings_documents),
            },
        )

        return response

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(
            "Failed to fetch league standings",
            extra={
                "league_id": league_id,
                "season_id": season_id,
                "error": str(exc),
                "error_type": type(exc).__name__,
            },
        )
        error = ErrorObject(
            code="STANDINGS_FETCH_ERROR",
            message=f"Failed to fetch league standings: {str(exc)}",
        )
        return StandardResponse.error_response(errors=[error])
