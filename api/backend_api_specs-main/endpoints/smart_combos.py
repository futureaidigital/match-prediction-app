from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, List, Optional
import time
from app.core.auth import get_current_user
from app.schemas.responses_schemas import StandardResponse, ErrorObject
from app.core.database import get_database
from app.schemas.predictions_schemas import (
    SmartComboPrediction,
    SmartComboPredictionList,
    SmartComboCurrentResponse,
    SmartComboSummary,
    SmartComboFixtureSummary,
    SmartComboFixturePredictions,
)

router = APIRouter()


def _build_fixture_summary(doc: Dict[str, Any]) -> SmartComboFixtureSummary:
    """Map a fixtures_refactor document to SmartComboFixtureSummary."""
    home_name = doc.get("home_team_name")
    away_name = doc.get("away_team_name")

    # Fallback if nested objects are used
    if not home_name and isinstance(doc.get("home_team"), dict):
        home_name = doc["home_team"].get("name")
    if not away_name and isinstance(doc.get("away_team"), dict):
        away_name = doc["away_team"].get("name")

    return SmartComboFixtureSummary(
        fixture_id=doc.get("_id") or doc.get("fixture_id"),
        league_name=doc.get("league_name") or doc.get("league", {}).get("name"),
        home_team_name=home_name,
        away_team_name=away_name,
        starting_at=doc.get("starting_at"),
    )


@router.get("/current", response_model=StandardResponse[SmartComboCurrentResponse])
async def get_current_smart_combo(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> StandardResponse[SmartComboCurrentResponse]:
    """Return the active (or next) smart combo with fixtures and predictions."""
    request_start = time.time()

    try:
        db = get_database()
        db_client = db.client
        # TODO: Move back to the primary database after MVP deployment.
        db_refactor = db_client["fourthofficial_refactor"]

        combo = await db_refactor.smart_combos.find_one(
            {"is_active": True},
            sort=[("starts_at", 1)]
        )

        if combo is None:
            error = ErrorObject(
                code="SMART_COMBO_NOT_FOUND",
                message="No active smart combo is available. Please try again later."
            )
            return StandardResponse.error_response(
                errors=[error],
                request_start_time=request_start
            )

        combo_id = combo["combo_id"]
        fixture_ids: List[int] = combo.get("fixture_ids", [])

        # Fetch predictions tied to this combo
        predictions_cursor = db_refactor.smart_combo_predictions.find({"combo_id": combo_id})
        fixture_predictions: Dict[int, List[SmartComboPrediction]] = {}

        async for pred in predictions_cursor:
            schema_pred = SmartComboPrediction(
                _id=str(pred.get("_id")) if pred.get("_id") else None,
                fixture_id=pred["fixture_id"],
                combo_id=pred["combo_id"],
                created_at=pred["created_at"],
                updated_at=pred["updated_at"],
                prediction_type=pred["prediction_type"],
                prediction_id=pred["prediction_id"],
                prediction_display_name=pred["prediction_display_name"],
                pre_game_prediction=pred["pre_game_prediction"],
                pre_game_prediction_reasons=pred.get("pre_game_prediction_reasons", []),
                prediction=pred.get("prediction"),
                prediction_reasons=pred.get("prediction_reasons"),
                pct_change_value=pred.get("pct_change_value"),
                pct_change_interval=pred["pct_change_interval"]
            )
            fixture_predictions.setdefault(schema_pred.fixture_id, []).append(schema_pred)

        fixture_map: Dict[int, Dict[str, Any]] = {}
        if fixture_ids:
            cursor = db_refactor.fixtures_refactor.find({"_id": {"$in": fixture_ids}})
            async for fixture in cursor:
                fixture_map[fixture["_id"]] = fixture

        fixtures_payload: List[SmartComboFixturePredictions] = []
        for fixture_id in fixture_ids:
            fixture_doc = fixture_map.get(fixture_id, {"_id": fixture_id})
            fixture_summary = _build_fixture_summary(fixture_doc)
            fixtures_payload.append(
                SmartComboFixturePredictions(
                    fixture=fixture_summary,
                    predictions=fixture_predictions.get(fixture_id, [])
                )
            )

        combo_summary = SmartComboSummary(
            combo_id=combo_id,
            name=combo.get("name", f"Combo {combo_id}"),
            description=combo.get("description"),
            starts_at=combo["starts_at"],
            expires_at=combo["expires_at"],
            confidence=combo.get("confidence", 0.0),
            total_odds=combo.get("total_odds", 0.0),
            fixture_ids=fixture_ids,
            is_active=combo.get("is_active", False),
            previous_week_combo_accuracy=combo.get("previous_week_combo_accuracy"),
        )

        payload = SmartComboCurrentResponse(
            combo=combo_summary,
            fixtures=fixtures_payload
        )

        return StandardResponse[SmartComboCurrentResponse].success_response(
            data=payload,
            request_start_time=request_start
        )

    except Exception as e:
        error = ErrorObject(
            code="SMART_COMBO_CURRENT_ERROR",
            message=str(e)
        )
        return StandardResponse.error_response(
            errors=[error],
            request_start_time=request_start
        )


@router.get("/predictions", response_model=StandardResponse)
async def get_smart_combo_predictions(
    smart_combo_id: Optional[int] = Query(None, description="Filter by specific smart combo ID"),
    fixture_id: Optional[int] = Query(None, description="Filter by specific fixture ID"),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> StandardResponse:
    """Get smart combo predictions data"""
    request_start = time.time()

    try:
        db = get_database()
        db_client = db.client
        # TODO: Move back to the primary database after MVP deployment.
        db_refactor = db_client["fourthofficial_refactor"]

        # Build query
        query = {}
        if smart_combo_id is not None:
            query["combo_id"] = smart_combo_id
        if fixture_id is not None:
            query["fixture_id"] = fixture_id

        # Get predictions from collection
        predictions = []
        cursor = db_refactor.smart_combo_predictions.find(query)

        async for pred in cursor:
            predictions.append(
                SmartComboPrediction(
                    _id=str(pred.get("_id")) if pred.get("_id") else None,
                    fixture_id=pred["fixture_id"],
                    combo_id=pred["combo_id"],
                    created_at=pred["created_at"],
                    updated_at=pred["updated_at"],
                    prediction_type=pred["prediction_type"],
                    prediction_id=pred["prediction_id"],
                    prediction_display_name=pred["prediction_display_name"],
                    pre_game_prediction=pred["pre_game_prediction"],
                    pre_game_prediction_reasons=pred.get("pre_game_prediction_reasons", []),
                    prediction=pred.get("prediction"),
                    prediction_reasons=pred.get("prediction_reasons"),
                    pct_change_value=pred.get("pct_change_value"),
                    pct_change_interval=pred["pct_change_interval"]
                )
            )

        return StandardResponse.success_response(
            data=SmartComboPredictionList(predictions=predictions).model_dump(),
            request_start_time=request_start
        )

    except Exception as e:
        error = ErrorObject(
            code="SMART_COMBO_PREDICTIONS_ERROR",
            message=str(e)
        )
        return StandardResponse.error_response(
            errors=[error],
            request_start_time=request_start
        )
