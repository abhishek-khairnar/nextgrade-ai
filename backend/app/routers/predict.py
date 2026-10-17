import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Prediction
from app.schemas import PredictRequest, PredictResponse
from app.services.predictor import predictor_service

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post("", response_model=PredictResponse)
def predict_single(data: PredictRequest, db: Session = Depends(get_db)):
    try:
        response, inputs_dict, factors_raw = predictor_service.predict(data)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

    if data.save:
        label = data.label or f"{data.subject.capitalize()} {data.mode.capitalize()} (Pred: {response.predicted_g3})"

        # Auto-save to SQLite history
        db_prediction = Prediction(
            created_at=datetime.utcnow(),
            label=label,
            subject=data.subject,
            mode=data.mode,
            inputs_json=json.dumps(inputs_dict),
            predicted_g3=response.predicted_g3,
            pass_probability=response.pass_probability,
            predicted_pass=response.predicted_pass,
            risk_level=response.risk_level,
            factors_json=json.dumps(factors_raw),
            batch_id=None
        )
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)

        response.id = db_prediction.id
    else:
        response.id = None

    return response

