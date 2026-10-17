import json
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Batch, Prediction
from app.schemas import BatchPredictionResponse
from app.services.csv_batch import CSV_TEMPLATE_CONTENT, parse_and_validate_batch_csv

router = APIRouter(tags=["Batch Prediction"])

@router.get("/batch/template")
def get_batch_template():
    return Response(
        content=CSV_TEMPLATE_CONTENT,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=nextgrade_template.csv"}
    )

@router.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch(
    file: UploadFile = File(...),
    mode: str = Query("midterm", pattern="^(early|midterm)$")
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files (.csv) are accepted.")

    contents = await file.read()
    try:
        response = parse_and_validate_batch_csv(contents, file.filename, default_mode=mode)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected batch processing error: {str(e)}")

    return response

@router.post("/batch/save-history/{batch_id}")
def save_batch_to_history(batch_id: str, items: List[dict], db: Session = Depends(get_db)):
    if not items:
        raise HTTPException(status_code=400, detail="No items to save.")

    # Record batch
    batch_record = Batch(
        id=batch_id,
        created_at=datetime.utcnow(),
        filename="Batch Upload",
        row_count=len(items),
        rejected_count=0
    )
    db.add(batch_record)

    # Record predictions
    for item in items:
        pred = Prediction(
            created_at=datetime.utcnow(),
            label=item.get("label", "Batch Student"),
            subject=item.get("subject", "math"),
            mode=item.get("inputs", {}).get("mode", "midterm"),
            inputs_json=json.dumps(item.get("inputs", {})),
            predicted_g3=float(item.get("predicted_g3", 10.0)),
            pass_probability=float(item.get("pass_probability", 0.5)),
            predicted_pass=int(item.get("predicted_pass", 1)),
            risk_level=item.get("risk_level", "Medium"),
            factors_json=json.dumps([]),
            batch_id=batch_id
        )
        db.add(pred)

    db.commit()
    return {"status": "success", "saved_count": len(items), "batch_id": batch_id}
