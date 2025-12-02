import time
from typing import Any, Dict, List, Optional, Tuple

from bson import ObjectId
from fastapi import APIRouter, Query

from app.core.auth import get_current_user_optional
from app.core.database import get_database
from app.schemas.predictions_schemas import (
    SmartComboPrediction,
    SmartComboPredictionList,
)
from app.schemas.responses_schemas import ErrorObject, StandardResponse
from app.schemas.schemas import SubscriptionTier

router = APIRouter()


def _normalize_id(document: Dict[str, Any]) -> Dict[str, Any]:
    if "_id" in document and isinstance(document["_id"], ObjectId):
        document["_id"] = str(document["_id"])
    return document


def _resolve_sort(
    sort_by: str,
    sort_order: str,
    allowed_fields: Dict[str, str],
    default_field: str,
) -> Tuple[str, int]:
    field = allowed_fields.get(sort_by, default_field)
    direction = 1 if sort_order.lower() == "asc" else -1
    return field, direction


@router.get("/smart-combos", response_model=StandardResponse[SmartComboPredictionList])
async def list_smart_combo_predictions(
    fixture_id: Optional[int] = Query(None, description="Filter by fixture ID."),
    combo_id: Optional[int] = Query(None, description="Filter by combo ID."),
    sort_by: str = Query(
        "pct_change",
        description="Sort field: pct_change, prediction_pre_game, prediction, created_at.",
    ),
    sort_order: str = Query("desc", description="Sort direction asc or desc."),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records to return."),
    _current_user: Optional[Dict[str, Any]] = get_current_user_optional(),
) -> StandardResponse[SmartComboPredictionList]:
    request_start = time.time()

    try:
        filters: Dict[str, Any] = {}
        if fixture_id is not None:
            filters["fixture_id"] = fixture_id
        if combo_id is not None:
            filters["combo_id"] = combo_id

        sort_field, sort_direction = _resolve_sort(
            sort_by,
            sort_order,
            {
                "pct_change": "pct_change_value",
                "prediction_pre_game": "pre_game_prediction",
                "prediction": "prediction",
                "created_at": "created_at",
            },
            "pct_change_value",
        )

        db = get_database()
        cursor = (
            db.temp_smart_combo_predictions.find(filters)
            .sort(sort_field, sort_direction)
            .limit(limit)
        )

        predictions: List[SmartComboPrediction] = []
        async for document in cursor:
            normalized = _normalize_id(document)
            predictions.append(SmartComboPrediction(**normalized))

        payload = SmartComboPredictionList(predictions=predictions)
        return StandardResponse[SmartComboPredictionList].success_response(
            data=payload,
            request_start_time=request_start,
        )
    except Exception as exc:
        error = ErrorObject(code="SMART_COMBO_PREDICTION_ERROR", message=str(exc))
        return StandardResponse.error_response(
            errors=[error],
            request_start_time=request_start,
        )
