import time
from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query

from app.core.auth import get_current_user_optional
from app.core.database import get_database
from app.schemas.fixtures_schemas import (
    FixtureBasic,
    FixtureIdsResponse,
    FixtureItem,
    FixturesResponse,
    FixtureCommentaryItem,
    FixtureCommentaryResponse,
    FixtureStatistics,
    FixtureStatisticsResponse,
    FixtureWeather,
    FixtureWeatherResponse,
)
from app.schemas.predictions_schemas import (
    FixturePrediction,
    FixturePredictionList,
    FixturePredictionMinimal,
)
from app.schemas.responses_schemas import ErrorObject, StandardResponse
from app.core.monitoring import get_logger
from app.services.fixtures_service import FixturesService

logger = get_logger(__name__)

router = APIRouter()

def _serialize_document(document: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Convert MongoDB document into JSON-friendly dict."""
    if document is None:
        return None

    serialized = dict(document)

    if "_id" in serialized and isinstance(serialized["_id"], ObjectId):
        serialized["_id"] = str(serialized["_id"])

    return serialized


@router.get("", response_model=StandardResponse[FixturesResponse])
async def get_fixtures(
    fixture_ids: Optional[str] = Query(None, description="Comma-separated fixture IDs for specific fixtures"),
    leagues: Optional[str] = Query(None, description="Comma-separated league IDs. Omit or leave empty for all leagues."),
    match_type: Optional[str] = Query(None, description="Match type filter: 'live', 'upcoming', or 'finished'."),
    sort_by: str = Query("kickoff_asc", description="Sort option: 'kickoff_asc', 'kickoff_desc', 'prediction_accuracy_asc', 'prediction_accuracy_desc'."),
    date_from: Optional[str] = Query(None, description="Start date (ISO format: YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (ISO format: YYYY-MM-DD)"),
    _current_user: Optional[Dict[str, Any]] = get_current_user_optional(),
) -> StandardResponse[FixturesResponse]:
    """
    Get fixtures with predictions.

    - If fixture_ids provided: Returns only the requested fixtures with full data (ignores other filters)
    - If fixture_ids not provided: Returns filtered fixture IDs + first 6 fixtures with full data
    - Default date range is 7 days if no custom dates provided
    """
    request_start = time.time()

    try:
        # Check if fixture_ids were provided
        if fixture_ids:
            # Parse comma-separated fixture IDs
            try:
                id_list = [int(id.strip()) for id in fixture_ids.split(",") if id.strip()]
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="fixture_ids must be comma-separated integers.",
                )

            if not id_list:
                raise HTTPException(
                    status_code=400,
                    detail="fixture_ids cannot be empty when provided.",
                )

            logger.debug(
                "Fetching specific fixtures",
                extra={
                    "fixture_ids": id_list,
                    "count": len(id_list),
                },
            )

            # Fetch fixtures from fixtures_refactor collection (contains all fixtures including live)
            db = get_database()
            db_client = db.client
            fixtures_db = db_client["fourthofficial_refactor"]

            fixtures_documents: List[Dict[str, Any]] = []

            # Search fixtures_refactor collection
            cursor = fixtures_db["fixtures_refactor"].find({"_id": {"$in": id_list}})
            async for doc in cursor:
                fixtures_documents.append(doc)

            # Sort by starting_at
            fixtures_documents.sort(key=lambda x: x.get("starting_at", datetime.min))

            # Build fixtures with predictions using service method (applies obfuscation)
            fixtures_with_predictions = await FixturesService.build_fixtures_with_predictions(
                fixtures_documents=fixtures_documents,
                current_user=_current_user,
            )

            # Return only fixtures (no fixture_ids list)
            data = FixturesResponse(fixtures=fixtures_with_predictions)
            return StandardResponse[FixturesResponse].success_response(
                data=data,

            )

        else:
            # No fixture_ids provided - use new filtering logic

            # Parse and validate using Simao's existing methods
            league_ids = FixturesService.parse_league_ids(leagues)
            if match_type:
                FixturesService.validate_match_type(match_type)
            FixturesService.validate_sort_by(sort_by)
            date_range = FixturesService.parse_date_range(date_from, date_to)

            logger.debug(
                "Fetching fixtures with filters",
                extra={
                    "league_ids": league_ids,
                    "match_type": match_type,
                    "sort_by": sort_by,
                    "date_from": date_from,
                    "date_to": date_to,
                },
            )

            # Use new orchestration method
            return await FixturesService.process_fixtures_with_filters(
                league_ids=league_ids,
                match_type=match_type,
                sort_by=sort_by,
                date_range=date_range,
                current_user=_current_user
            )
    except HTTPException:
        raise
    except Exception as exc:
        error = ErrorObject(code="FIXTURES_ERROR", message=str(exc))
        return StandardResponse.error_response(
            errors=[error],
  
        )


@router.get("/predictions", response_model=StandardResponse[FixturePredictionList])
async def list_fixture_predictions(
    fixture_id: Optional[int] = Query(None, description="Filter by single fixture ID."),
    fixture_ids: Optional[List[int]] = Query(None, description="Filter by multiple fixture IDs."),
    sort_by: str = Query(
        "pct_change",
        description="Sort field: pct_change, prediction_pre_game, prediction, created_at.",
    ),
    sort_order: str = Query("desc", description="Sort direction: asc or desc."),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of predictions to return."),
    _current_user: Optional[Dict[str, Any]] = get_current_user_optional(),
) -> StandardResponse[FixturePredictionList]:
    """
    Get detailed fixture predictions with obfuscation for non-premium users.

    Premium users see all prediction details. Non-premium users see only the top prediction
    with full details, while other predictions have their values obfuscated.
    """
    request_start = time.time()

    try:
        # Use the FixturesService to get predictions with obfuscation applied
        raw_predictions = await FixturesService.get_fixture_predictions_detailed(
            fixture_id=fixture_id,
            fixture_ids=fixture_ids,
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
                doc["prediction_type"] = "fixture"
            if doc.get("pct_change_interval") is None:
                doc["pct_change_interval"] = 5.0

            predictions.append(FixturePrediction(**doc))

        payload = FixturePredictionList(predictions=predictions)
        return StandardResponse[FixturePredictionList].success_response(
            data=payload,
            request_start_time=request_start,
        )
    except Exception as exc:
        error = ErrorObject(code="FIXTURE_PREDICTION_ERROR", message=str(exc))
        return StandardResponse.error_response(
            errors=[error],
            request_start_time=request_start,
        )


"TODO:SIMAO SUGESTION START"

@router.get("/simao", response_model=StandardResponse[FixturesResponse])
async def get_all_fixtures_simao(
    leagues: Optional[str] = Query(None, description="Comma-separated league IDs. Omit or leave empty for all leagues."),
    match_type: str = Query("upcoming", description="Match type filter: 'live', 'upcoming', or 'finished'."),
    sort_by: str = Query("kickoff_asc", description="Sort option: 'kickoff_asc', 'kickoff_desc', 'league_asc', 'league_desc'."),
    _current_user: Optional[Dict[str, Any]] = get_current_user_optional(),
) -> StandardResponse[FixturesResponse]:
    """Return fixtures with predictions using match_type, leagues, and sort_by filters."""
    request_start = time.time()

    try:
        # Use service methods for validation and parsing
        league_ids = FixturesService.parse_league_ids(leagues)
        FixturesService.validate_match_type(match_type)
        FixturesService.validate_sort_by(sort_by)

        logger.debug(
            "Fetching fixtures with predictions",
            extra={
                "league_ids": league_ids,
                "match_type": match_type,
                "sort_by": sort_by,
            },
        )

        # Build query components using service
        filters = FixturesService.build_query_filters(league_ids)
        sort_spec = FixturesService.build_sort_specification(sort_by)

        # Query database for fixtures TODO: simao 
        db, fixtures_db = FixturesService.get_fixtures_database()
        cursor = fixtures_db["fixtures_refactor"].find(filters)

        if sort_spec:
            cursor = cursor.sort(sort_spec)

        # Limit to maximum 60 results
        cursor = cursor.limit(60)

        fixtures_documents: List[Dict[str, Any]] = []
        async for doc in cursor:
            fixtures_documents.append(doc)

        # Build and return response using service
        return await FixturesService.build_fixtures_response(
            fixtures_documents=fixtures_documents,
            current_user=_current_user,
        )
    except HTTPException:
        raise
    except Exception as exc:
        error = ErrorObject(code="FIXTURE_LIST_ERROR", message=str(exc))
        return StandardResponse.error_response(
            errors=[error],
        )


@router.get("/simao/ids", response_model=StandardResponse[FixtureIdsResponse])
async def get_fixture_ids_simao(
    leagues: Optional[str] = Query(None, description="Comma-separated league IDs. Omit or leave empty for all leagues."),
    match_type: str = Query("upcoming", description="Match type filter: 'live', 'upcoming', or 'finished'."),
    sort_by: str = Query("kickoff_asc", description="Sort option: 'kickoff_asc', 'kickoff_desc', 'league_asc', 'league_desc'."),
    _current_user: Optional[Dict[str, Any]] = get_current_user_optional(),
) -> StandardResponse[FixtureIdsResponse]:
    """Return list of fixture IDs based on filters."""
    request_start = time.time()

    try:
        # Use service methods for validation and parsing
        league_ids = FixturesService.parse_league_ids(leagues)
        FixturesService.validate_match_type(match_type)
        FixturesService.validate_sort_by(sort_by)

        logger.debug(
            "Fetching fixture IDs",
            extra={
                "league_ids": league_ids,
                "match_type": match_type,
                "sort_by": sort_by,
            },
        )

        # Build query components using service
        filters = FixturesService.build_query_filters(league_ids)
        sort_spec = FixturesService.build_sort_specification(sort_by)

        # Query database for fixture IDs
        db, fixtures_db = FixturesService.get_fixtures_database()
        cursor = fixtures_db["fixtures_refactor"].find(filters)

        if sort_spec:
            cursor = cursor.sort(sort_spec)

        # Limit to maximum 60 results
        cursor = cursor.limit(60)

        fixture_ids: List[int] = []
        async for doc in cursor:
            if "_id" in doc:
                fixture_ids.append(doc["_id"])

        logger.debug(
            "Fixture IDs query completed",
            extra={
                "match_type": match_type,
                "league_filter": league_ids,
                "sort_by": sort_by,
                "result_count": len(fixture_ids),
            },
        )

        data = FixtureIdsResponse(fixture_ids=fixture_ids)
        return StandardResponse[FixtureIdsResponse].success_response(
            data=data,
        )
    except HTTPException:
        raise
    except Exception as exc:
        error = ErrorObject(code="FIXTURE_IDS_ERROR", message=str(exc))
        return StandardResponse.error_response(
            errors=[error],
  
        )


@router.get("/simao/fixture", response_model=StandardResponse[FixturesResponse])
async def list_fixtures_simao(
    fixture_ids: str = Query(..., description="Comma-separated fixture IDs to fetch with predictions (max 6)."),
    _current_user: Optional[Dict[str, Any]] = get_current_user_optional(),
) -> StandardResponse[FixturesResponse]:
    """Return featured fixtures with predictions (3 for premium users, 1 for free/unauthenticated users)."""
    request_start = time.time()

    try:
        # Use service method to parse and validate fixture IDs
        id_list = FixturesService.parse_fixture_ids(fixture_ids, max_ids=6)

        logger.debug("Fetching featured fixtures", extra={"fixture_ids": id_list, "count": len(id_list)})

        # Fetch fixtures from fourthofficial_refactor database
        # Search both live and finished collections
        db, fixtures_db = FixturesService.get_fixtures_database()

        fixtures_documents: List[Dict[str, Any]] = []

        # Search fixtures_refactor collection
        cursor_finished = fixtures_db["fixtures_refactor"].find({"_id": {"$in": id_list}})
        async for doc in cursor_finished:
            fixtures_documents.append(doc)

        # Sort by starting_at
        fixtures_documents.sort(key=lambda x: x.get("starting_at", datetime.min))

        # Build and return response using service
        return await FixturesService.build_fixtures_response(
            fixtures_documents=fixtures_documents,
            current_user=_current_user,
  
        )
    except HTTPException:
        raise
    except Exception as exc:
        error = ErrorObject(code="FIXTURES_ERROR", message=str(exc))
        return StandardResponse.error_response(
            errors=[error],
        )
"SIMAO SUGESTION END"

@router.get(
    "/{fixture_id}/commentary",
    response_model=StandardResponse[FixtureCommentaryResponse],
)
async def get_fixture_commentary(
    fixture_id: int,
    _current_user: Optional[Dict[str, Any]] = get_current_user_optional(),
) -> StandardResponse[FixtureCommentaryResponse]:
    """Return commentary entries for a specific fixture."""
    request_start = time.time()

    try:
        # Get the refactor database for commentary
        db = get_database()
        db_client = db.client
        fixtures_db = db_client["fourthofficial_refactor"]

        # Query the fixture_commentary collection in the refactor database
        cursor = fixtures_db["fixture_commentary"].find(
            {"fixture_id": fixture_id}
        ).sort("created_at", 1)

        documents = []
        async for doc in cursor:
            serialized = _serialize_document(doc)
            if serialized is not None:
                documents.append(serialized)

        if not documents:
            raise HTTPException(
                status_code=404,
                detail="Fixture commentary not found.",
            )

        commentary_items = []
        for doc in documents:
            # Map commentary to commentary_details
            if 'commentary' in doc:
                doc['commentary_details'] = doc.pop('commentary')
            # Remove fixture_id from individual items since it's at root level
            doc.pop('fixture_id', None)
            commentary_items.append(FixtureCommentaryItem(**doc))
        data = FixtureCommentaryResponse(
            fixture_id=fixture_id,
            commentary=commentary_items,
        )

        return StandardResponse[FixtureCommentaryResponse].success_response(
            data=data,
  
        )
    except HTTPException:
        raise
    except Exception as exc:
        error = ErrorObject(code="FIXTURE_COMMENTARY_ERROR", message=str(exc))
        return StandardResponse.error_response(
            errors=[error],
  
        )


@router.get(
    "/{fixture_id}/weather",
    response_model=StandardResponse[FixtureWeatherResponse],
)
async def get_fixture_weather(
    fixture_id: int,
    _current_user: Optional[Dict[str, Any]] = get_current_user_optional(),
) -> StandardResponse[FixtureWeatherResponse]:
    """Return weather snapshot for a fixture."""
    request_start = time.time()

    try:
        # Get the refactor database for weather
        db = get_database()
        db_client = db.client
        fixtures_db = db_client["fourthofficial_refactor"]

        # Query the fixture_weather collection in the refactor database
        document = await fixtures_db["fixture_weather"].find_one({"fixture_id": fixture_id})
        document = _serialize_document(document)

        if document is None:
            raise HTTPException(status_code=404, detail="Fixture weather not found.")

        weather = FixtureWeather(**document)
        data = FixtureWeatherResponse(weather=weather)

        return StandardResponse[FixtureWeatherResponse].success_response(
            data=data,
  
        )
    except HTTPException:
        raise
    except Exception as exc:
        error = ErrorObject(code="FIXTURE_WEATHER_ERROR", message=str(exc))
        return StandardResponse.error_response(
            errors=[error],
  
        )


@router.get(
    "/{fixture_id}/statistics",
    response_model=StandardResponse[FixtureStatisticsResponse],
)
async def get_fixture_statistics(
    fixture_id: int,
    _current_user: Optional[Dict[str, Any]] = get_current_user_optional(),
) -> StandardResponse[FixtureStatisticsResponse]:
    """Return basic and advanced statistics for a fixture."""
    request_start = time.time()

    try:
        # Get the refactor database for statistics
        db = get_database()
        db_client = db.client
        fixtures_db = db_client["fourthofficial_refactor"]

        # Query the fixture_statistics collection in the refactor database
        document = await fixtures_db["fixture_statistics"].find_one({"fixture_id": fixture_id})
        document = _serialize_document(document)

        if document is None:
            raise HTTPException(
                status_code=404, detail="Fixture statistics not found."
            )

        statistics = FixtureStatistics(**document)
        data = FixtureStatisticsResponse(statistics=statistics)

        return StandardResponse[FixtureStatisticsResponse].success_response(
            data=data,
  
        )
    except HTTPException:
        raise
    except Exception as exc:
        error = ErrorObject(code="FIXTURE_STATISTICS_ERROR", message=str(exc))
        return StandardResponse.error_response(
            errors=[error],
  
        )
