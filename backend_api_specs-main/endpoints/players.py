import time
from datetime import timedelta
from typing import Any, Dict, List, Optional, Tuple

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query

from app.core.auth import get_current_user_optional
from app.core.database import get_database
from app.core.monitoring import get_logger
from app.schemas.players_schemas import (
    PlayerResponse,
    PlayerStatisticsGetResponse,
    PlayerSummary,
    PlayerWatchlistEntry,
    PlayerWatchlistResponse,
    WatchlistPlayerDetail,
    WatchlistPlayerResponse,
)
from app.schemas.predictions_schemas import (
    PlayerPrediction,
    PlayerPredictionList,
)
from app.schemas.responses_schemas import ErrorObject, StandardResponse
from app.services.players_service import PlayersService

logger = get_logger(__name__)

router = APIRouter()


def _parse_optional_int(value: Optional[str], param_name: str) -> Optional[int]:
    if value in (None, "", "null", "None"):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail=f"Query parameter '{param_name}' must be an integer.",
        )


def _normalize_id(document: Dict[str, Any]) -> Dict[str, Any]:
    if "_id" in document and isinstance(document["_id"], ObjectId):
        document["_id"] = str(document["_id"])
    return document


def _resolve_sort(
    sort_by: Optional[str],
    sort_order: str,
    allowed_fields: Dict[str, str],
    default_field: Optional[str] = None,
) -> Optional[Tuple[str, int]]:
    if sort_by is None and default_field is None:
        return None

    field = allowed_fields.get(sort_by, default_field)
    if field is None:
        return None

    direction = 1 if sort_order.lower() == "asc" else -1
    return field, direction


@router.get("/player", response_model=StandardResponse[PlayerResponse])
async def get_player(
    player_id: int = Query(..., description="Player ID to fetch."),
    _current_user: Optional[Dict[str, Any]] = get_current_user_optional(),
) -> StandardResponse[PlayerResponse]:
    """
    Return core player information from players_refactor collection.

    This is the fundamental player endpoint that returns the latest player information:
    - Basic player info (name, common name, display name, etc.)
    - Country and nationality details
    - Position information
    - Physical attributes (height, weight, preferred foot)
    - Current team information with contract details
    - Last 10 predictions for the player (detailed format)

    For season-specific statistics, use the dedicated endpoints like /player/statistics.
    """
    request_start = time.time()

    try:
        logger.debug(
            "Player endpoint called",
            extra={"player_id": player_id}
        )

        # Fetch core player data
        base_player = await PlayersService.fetch_player_core_by_id(player_id)

        if base_player is None:
            logger.info(
                "Player not found",
                extra={"player_id": player_id}
            )
            raise HTTPException(
                status_code=404,
                detail=f"Player with ID {player_id} not found."
            )

        # Fetch last 10 predictions for this player
        predictions = await PlayersService.fetch_recent_player_predictions(
            player_id=player_id,
            limit=10,
            current_user=_current_user,
        )

        # Wrap in PlayerResponse
        player_response = PlayerResponse(player=base_player, predictions=predictions)

        logger.debug(
            "Player endpoint completed",
            extra={
                "player_id": player_id,
                "player_name": base_player.display_name,
                "predictions_count": len(predictions),
                "duration_ms": round((time.time() - request_start) * 1000, 2),
            }
        )

        return StandardResponse[PlayerResponse].success_response(
            data=player_response,
            request_start_time=request_start,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(
            "Player endpoint failed",
            extra={
                "player_id": player_id,
                "error": str(exc),
                "error_type": type(exc).__name__,
            }
        )
        error = ErrorObject(code="PLAYER_ERROR", message=str(exc))
        return StandardResponse.error_response(
            errors=[error],
            request_start_time=request_start,
        )


@router.get("/predictions", response_model=StandardResponse[PlayerPredictionList])
async def list_player_predictions(
    player_id: int = Query(..., description="Player ID (required)"),
    sort_by: str = Query(
        "pct_change",
        description="Sort field: pct_change, prediction_pre_game, prediction, created_at.",
    ),
    sort_order: str = Query("desc", description="Sort direction: asc or desc."),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of predictions to return."),
    _current_user: Optional[Dict[str, Any]] = get_current_user_optional(),
) -> StandardResponse[PlayerPredictionList]:
    """
    Get detailed player predictions from the last 3 fixtures.

    Premium users see all prediction details. Non-premium users see all predictions
    but with obfuscated text (random prediction names, real numeric values).
    """
    request_start = time.time()

    try:
        # Use the PlayersService to get predictions with text obfuscation applied
        raw_predictions = await PlayersService.get_player_predictions_detailed(
            player_id=player_id,
            sort_by=sort_by,
            sort_order=sort_order,
            limit=limit,
            current_user=_current_user,
        )

        # Convert to Pydantic models with defaults for optional fields
        from datetime import datetime
        predictions = []
        for doc in raw_predictions:
            # Add defaults for optional fields if missing
            if "created_at" not in doc:
                doc["created_at"] = datetime.utcnow()
            if "updated_at" not in doc:
                doc["updated_at"] = datetime.utcnow()
            if "prediction_type" not in doc:
                doc["prediction_type"] = "player_match"
            if doc.get("pct_change_interval") is None:
                doc["pct_change_interval"] = 5.0

            predictions.append(PlayerPrediction(**doc))

        payload = PlayerPredictionList(predictions=predictions)
        return StandardResponse[PlayerPredictionList].success_response(
            data=payload,
            request_start_time=request_start,
        )
    except Exception as exc:
        error = ErrorObject(code="PLAYER_PREDICTION_ERROR", message=str(exc))
        return StandardResponse.error_response(
            errors=[error],
            request_start_time=request_start,
        )


@router.get("/statistics", response_model=StandardResponse[PlayerStatisticsGetResponse])
async def get_player_statistics(
    player_id: int = Query(..., description="Player ID (required)"),
    season_id: Optional[int] = Query(None, description="Season ID. If not provided, uses current/latest season."),
    _current_user: Optional[Dict[str, Any]] = get_current_user_optional(),
) -> StandardResponse[PlayerStatisticsGetResponse]:
    """
    Get player season statistics grouped by category.

    Returns statistics for a player in a specific season, organized into groups:
    - appearances: Games, lineups, bench, minutes, substitutions
    - attacking: Goals, assists, chances created/missed, offsides
    - shooting: Shots total, on/off target, blocked, inside/outside box
    - passing: Passes, accuracy, key passes, crosses, long balls, through balls
    - dribbling: Dribble attempts/success, dispossessed, touches, ball recovery
    - defending: Tackles, interceptions, clearances, blocks, cleansheets
    - duels: Total duels, won/lost, aerials
    - discipline: Fouls, cards
    - goalkeeper: Saves, punches, claims (for goalkeepers)
    - penalties: Won, scored, missed, committed
    - team_results: Wins, draws, losses when player participated
    - rating: Average, highest, lowest match ratings

    If season_id is not provided, automatically uses the current/latest season.
    """
    request_start = time.time()

    try:
        logger.debug(
            "Player statistics endpoint called",
            extra={"player_id": player_id, "season_id": season_id}
        )

        # Determine season_id if not provided
        season_source = "provided"
        if season_id is None:
            season_id = await PlayersService.get_current_season_id_for_player(player_id)
            season_source = "current_season_lookup"

            if season_id is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"No statistics found for player {player_id}. Player may not have any recorded seasons."
                )

            logger.debug(
                "Season ID determined from lookup",
                extra={"player_id": player_id, "season_id": season_id, "source": season_source}
            )

        # Fetch statistics
        document = await PlayersService.fetch_player_season_statistics(player_id, season_id)

        if document is None:
            raise HTTPException(
                status_code=404,
                detail=f"Statistics not found for player {player_id} in season {season_id}."
            )

        # Transform to grouped statistics
        grouped_stats = PlayersService.transform_to_grouped_statistics(document)

        payload = PlayerStatisticsGetResponse(
            player_id=player_id,
            season_id=season_id,
            team_id=document.get("team_id"),
            jersey_number=document.get("jersey_number"),
            position_id=document.get("position_id"),
            statistics=grouped_stats,
            season_source=season_source,
        )

        logger.debug(
            "Player statistics endpoint completed",
            extra={
                "player_id": player_id,
                "season_id": season_id,
                "season_source": season_source,
                "duration_ms": round((time.time() - request_start) * 1000, 2),
            }
        )

        return StandardResponse[PlayerStatisticsGetResponse].success_response(
            data=payload,
            request_start_time=request_start,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(
            "Player statistics endpoint failed",
            extra={
                "player_id": player_id,
                "season_id": season_id,
                "error": str(exc),
                "error_type": type(exc).__name__,
            }
        )
        error = ErrorObject(code="PLAYER_STATISTICS_ERROR", message=str(exc))
        return StandardResponse.error_response(
            errors=[error],
            request_start_time=request_start,
        )


@router.get("/watchlist", response_model=StandardResponse[PlayerWatchlistResponse])
async def list_player_watchlist(
    player_id: Optional[str] = Query(None, description="Return watchlist entries containing this player ID."),
    year: Optional[int] = Query(None, description="Filter by year."),
    day: Optional[int] = Query(None, description="Filter by day of year."),
    sort_by: Optional[str] = Query(
        "year",
        description="Sort field: year or day.",
    ),
    sort_order: str = Query("desc", description="Sort direction asc or desc."),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records to return."),
    _current_user: Optional[Dict[str, Any]] = get_current_user_optional(),
) -> StandardResponse[PlayerWatchlistResponse]:
    """
    Return player watchlist entries with graceful fallback for missing dates.

    If the exact date is not found, the endpoint will return the most recent
    available data with a warning message for monitoring purposes.
    """
    request_start = time.time()

    try:
        from datetime import datetime

        # Use current date if not specified
        if year is None or day is None:
            now = datetime.now()
            year = year or now.year
            day = day or now.timetuple().tm_yday

        db = get_database()
        db_client = db.client
        players_db = db_client["fourthofficial_refactor"]
        collection = players_db["players_watchlist_temp"]

        # Build filters
        filters: Dict[str, Any] = {"year": year, "day": day}
        player_id_int = _parse_optional_int(player_id, "player_id")
        if player_id_int is not None:
            filters["player_ids"] = player_id_int

        # Try to find exact match first
        cursor = collection.find(filters)

        sort_tuple = _resolve_sort(
            sort_by,
            sort_order,
            {
                "year": "year",
                "day": "day",
            },
            default_field="year",
        )
        if sort_tuple:
            cursor = cursor.sort(*sort_tuple)
        cursor = cursor.limit(limit)

        entries: List[PlayerWatchlistEntry] = []
        warning: Optional[str] = None

        async for document in cursor:
            normalized = _normalize_id(document)
            entries.append(PlayerWatchlistEntry(**normalized))

        # If no exact match found, try to find the most recent available data
        if not entries:
            logger.warning(
                "No watchlist entry found for exact date, falling back to most recent",
                extra={"year": year, "day": day}
            )

            # Find the most recent entry before the requested date
            fallback_filters: Dict[str, Any] = {
                "$or": [
                    {"year": year, "day": {"$lt": day}},
                    {"year": {"$lt": year}}
                ]
            }
            if player_id_int is not None:
                fallback_filters["player_ids"] = player_id_int

            fallback_cursor = collection.find(fallback_filters).sort([("year", -1), ("day", -1)]).limit(limit)

            async for document in fallback_cursor:
                normalized = _normalize_id(document)
                entries.append(PlayerWatchlistEntry(**normalized))

            # Set warning message if we found fallback data
            if entries:
                fallback_entry = entries[0]
                requested_date = datetime(year, 1, 1) + timedelta(days=day - 1)
                fallback_date = datetime(fallback_entry.year, 1, 1) + timedelta(days=fallback_entry.day - 1)
                warning = (
                    f"Watchlist data for {requested_date.strftime('%Y-%m-%d')} not available. "
                    f"Returning most recent data from {fallback_date.strftime('%Y-%m-%d')}. "
                    f"This may indicate a data pipeline issue."
                )

                logger.warning(
                    "Returning fallback watchlist data",
                    extra={
                        "requested_year": year,
                        "requested_day": day,
                        "fallback_year": fallback_entry.year,
                        "fallback_day": fallback_entry.day,
                    }
                )

        # If still no data found, return empty with warning
        if not entries:
            warning = f"No watchlist data available for {year}-{day} or any previous dates."
            logger.error(
                "No watchlist data found even with fallback",
                extra={"year": year, "day": day}
            )

        payload = PlayerWatchlistResponse(watchlist=entries, warning=warning)
        return StandardResponse[PlayerWatchlistResponse].success_response(
            data=payload,
            request_start_time=request_start,
        )
    except Exception as exc:
        error = ErrorObject(code="PLAYER_WATCHLIST_ERROR", message=str(exc))
        return StandardResponse.error_response(
            errors=[error],
            request_start_time=request_start,
        )


@router.get("/watchlist_tmp", response_model=StandardResponse[WatchlistPlayerResponse])
async def watchlist_tmp(
    _current_user: Optional[Dict[str, Any]] = get_current_user_optional(),
) -> StandardResponse[WatchlistPlayerResponse]:
    """Return player watchlist entries for today's date with player details and statistics."""
    request_start = time.time()

    try:
        from datetime import datetime

        # Get current year and day of year
        now = datetime.now()
        current_year = now.year
        current_day = now.timetuple().tm_yday

        db = get_database()

        # Aggregation pipeline to join watchlist, players, and statistics
        pipeline = [
            # Match today's watchlist entries
            {
                "$match": {
                    "year": 2024,
                    "day": 16,
                }
            },
            # Limit to 1 watchlist document (should only be one per day anyway)
            {"$limit": 1},
            # Unwind the player_ids array to get individual player IDs
            {"$unwind": "$player_ids"},
            # Limit to 20 players
            {"$limit": 20},
            # Lookup player details
            {
                "$lookup": {
                    "from": "temp_players",
                    "localField": "player_ids",
                    "foreignField": "player_id",
                    "as": "player_info"
                }
            },
            # Lookup player career statistics
            {
                "$lookup": {
                    "from": "temp_player_statistics",
                    "localField": "player_ids",
                    "foreignField": "player_id",
                    "as": "player_stats"
                }
            },
            # Unwind player info and stats (should be 1 each)
            {"$unwind": {"path": "$player_info", "preserveNullAndEmptyArrays": True}},
            {"$unwind": {"path": "$player_stats", "preserveNullAndEmptyArrays": True}},
            # Project the fields we need
            {
                "$project": {
                    "player_id": "$player_ids",
                    "display_name": "$player_info.display_name",
                    "position_id": "$player_info.position_id",
                    "nationality_id": "$player_info.nationality_id",
                    "image_path": "$player_info.head_shot_location",
                    "minutes_played": "$player_stats.basic.minutes_played",
                    "appearances": "$player_stats.basic.games",
                    "goals": "$player_stats.basic.goals",
                    "assists": "$player_stats.basic.assists",
                }
            }
        ]
        players: List[WatchlistPlayerDetail] = []
        async for document in await db.temp_players_watchlist.aggregate(pipeline):
            players.append(WatchlistPlayerDetail(**document))

        payload = WatchlistPlayerResponse(players=players)
        return StandardResponse[WatchlistPlayerResponse].success_response(
            data=payload,
            request_start_time=request_start,
        )
    except Exception as exc:
        error = ErrorObject(code="PLAYER_WATCHLIST_ERROR", message=str(exc))
        return StandardResponse.error_response(
            errors=[error],
            request_start_time=request_start,
        )
