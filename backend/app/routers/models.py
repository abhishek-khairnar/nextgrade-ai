import json
import os
from typing import Optional
from fastapi import APIRouter, Query
from app.config import settings

router = APIRouter(prefix="/models", tags=["Models"])

@router.get("/metrics")
def get_model_metrics():
    path = os.path.join(settings.ARTIFACTS_DIR, "metrics.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

@router.get("/importance")
def get_feature_importance(mode: Optional[str] = Query(None)):
    path = os.path.join(settings.ARTIFACTS_DIR, "importance.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if mode and mode in data:
                return data[mode]
            return data
    return {}

@router.get("/diagnostics")
def get_model_diagnostics(mode: Optional[str] = Query(None)):
    path = os.path.join(settings.ARTIFACTS_DIR, "diagnostics.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if mode and mode in data:
                return data[mode]
            return data
    return {}
