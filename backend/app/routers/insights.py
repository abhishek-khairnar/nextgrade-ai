from typing import Optional
from fastapi import APIRouter, Query
from app.services.insights import insights_service

router = APIRouter(prefix="/insights", tags=["Insights"])

@router.get("/summary")
def get_insights_summary():
    return insights_service.get_summary()

@router.get("/progression")
def get_insights_progression():
    return insights_service.get_progression()

@router.get("/distribution")
def get_insights_distribution(
    feature: str = Query("G3"),
    subject: Optional[str] = Query(None),
    sex: Optional[str] = Query(None),
    school: Optional[str] = Query(None)
):
    return insights_service.get_distribution(
        feature=feature,
        subject=subject,
        sex=sex,
        school=school
    )

@router.get("/correlations")
def get_insights_correlations():
    return insights_service.get_correlations()

@router.get("/quality")
def get_insights_quality():
    return insights_service.get_quality()
