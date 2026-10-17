import csv
import io
import json
import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import desc, or_
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Prediction
from app.schemas import HistoryItem, HistoryListResponse

router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=HistoryListResponse)
def get_prediction_history(
    q: Optional[str] = Query(None),
    risk: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Prediction)

    if q and q.strip():
        search = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Prediction.label.ilike(search),
                Prediction.subject.ilike(search),
                Prediction.mode.ilike(search)
            )
        )

    if risk and risk in ["Low", "Medium", "High"]:
        query = query.filter(Prediction.risk_level == risk)

    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))
    offset = (page - 1) * page_size

    rows = query.order_by(desc(Prediction.created_at)).offset(offset).limit(page_size).all()

    items = []
    for r in rows:
        try:
            inputs = json.loads(r.inputs_json)
        except Exception:
            inputs = {}
        try:
            factors = json.loads(r.factors_json)
        except Exception:
            factors = []

        items.append(HistoryItem(
            id=r.id,
            created_at=r.created_at,
            label=r.label,
            subject=r.subject,
            mode=r.mode,
            predicted_g3=r.predicted_g3,
            pass_probability=r.pass_probability,
            predicted_pass=r.predicted_pass,
            risk_level=r.risk_level,
            inputs=inputs,
            factors=factors
        ))

    return HistoryListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/export.csv")
def export_history_csv(db: Session = Depends(get_db)):
    rows = db.query(Prediction).order_by(desc(Prediction.created_at)).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "id", "created_at", "label", "subject", "mode",
        "predicted_g3", "predicted_pass", "pass_probability", "risk_level"
    ])

    for r in rows:
        writer.writerow([
            r.id,
            r.created_at.isoformat() if r.created_at else "",
            r.label or "",
            r.subject,
            r.mode,
            round(r.predicted_g3, 2),
            r.predicted_pass,
            round(r.pass_probability, 2),
            r.risk_level
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=nextgrade_history.csv"}
    )

@router.get("/{id}", response_model=HistoryItem)
def get_prediction_detail(id: int, db: Session = Depends(get_db)):
    record = db.query(Prediction).filter(Prediction.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction record not found.")

    try:
        inputs = json.loads(record.inputs_json)
    except Exception:
        inputs = {}
    try:
        factors = json.loads(record.factors_json)
    except Exception:
        factors = []

    return HistoryItem(
        id=record.id,
        created_at=record.created_at,
        label=record.label,
        subject=record.subject,
        mode=record.mode,
        predicted_g3=record.predicted_g3,
        pass_probability=record.pass_probability,
        predicted_pass=record.predicted_pass,
        risk_level=record.risk_level,
        inputs=inputs,
        factors=factors
    )

@router.delete("/{id}")
def delete_prediction(id: int, db: Session = Depends(get_db)):
    record = db.query(Prediction).filter(Prediction.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    db.delete(record)
    db.commit()
    return {"status": "deleted", "id": id}

@router.delete("")
def clear_all_history(db: Session = Depends(get_db)):
    count = db.query(Prediction).delete()
    db.commit()
    return {"status": "cleared", "deleted_count": count}
