import io
import uuid
from typing import Any, Dict, List, Tuple
import pandas as pd
from app.schemas import (
    BatchPredictionItem,
    BatchPredictionResponse,
    BatchValidationItem,
    PredictRequest
)
from app.services.predictor import predictor_service

CSV_TEMPLATE_CONTENT = """label,subject,studytime,failures,absences,higher,schoolsup,G1,G2,school,sex,age,Medu,Fedu,famrel,health
Student 1 (Math Midterm),math,3,0,2,1,0,14,15,GP,F,16,3,3,4,4
Student 2 (Math At-Risk),math,1,2,14,0,1,7,8,GP,M,17,1,1,3,2
Student 3 (Portuguese Early),portuguese,2,0,4,1,0,,,MS,F,15,2,2,5,3
Student 4 (High Achiever),portuguese,4,0,0,1,0,18,17,GP,F,16,4,4,5,5
Student 5 (Borderline Pass),math,2,1,6,1,0,10,10,MS,M,18,2,2,4,3
"""

def parse_and_validate_batch_csv(
    file_bytes: bytes,
    filename: str,
    default_mode: str = "midterm"
) -> BatchPredictionResponse:
    if len(file_bytes) > 2 * 1024 * 1024:
        raise ValueError("File exceeds 2 MB maximum size limit.")

    # Try reading CSV with comma or semicolon
    try:
        df_raw = pd.read_csv(io.BytesIO(file_bytes), sep=None, engine="python")
    except Exception as e:
        raise ValueError(f"Could not parse CSV file: {str(e)}")

    if len(df_raw) == 0:
        raise ValueError("Uploaded CSV is empty.")

    if len(df_raw) > 1000:
        raise ValueError("CSV exceeds 1,000 rows limit.")

    batch_id = str(uuid.uuid4())
    total_rows = len(df_raw)
    accepted_items: List[BatchPredictionItem] = []
    rejected_items: List[BatchValidationItem] = []

    risk_counts = {"Low": 0, "Medium": 0, "High": 0}
    grade_bins = [
        {"range": "0-4", "count": 0},
        {"range": "5-9", "count": 0},
        {"range": "10-13", "count": 0},
        {"range": "14-16", "count": 0},
        {"range": "17-20", "count": 0}
    ]

    for idx, row in df_raw.iterrows():
        row_num = int(idx) + 2  # 1-indexed header + row
        row_dict = row.to_dict()

        # Sanitize keys
        clean_row = {str(k).strip(): v for k, v in row_dict.items() if pd.notnull(v)}

        mode = clean_row.get("mode", default_mode).lower().strip()
        if mode not in ["early", "midterm"]:
            mode = default_mode

        subject = str(clean_row.get("subject", "math")).lower().strip()
        if subject not in ["math", "portuguese"]:
            subject = "math"

        # Validate core fields
        try:
            studytime = int(clean_row.get("studytime", 2))
            if studytime < 1 or studytime > 4:
                rejected_items.append(BatchValidationItem(row=row_num, reason="studytime must be between 1 and 4"))
                continue
        except (ValueError, TypeError):
            rejected_items.append(BatchValidationItem(row=row_num, reason="Invalid studytime value"))
            continue

        try:
            failures = int(clean_row.get("failures", 0))
            if failures < 0 or failures > 4:
                rejected_items.append(BatchValidationItem(row=row_num, reason="failures must be between 0 and 4"))
                continue
        except (ValueError, TypeError):
            rejected_items.append(BatchValidationItem(row=row_num, reason="Invalid failures value"))
            continue

        try:
            absences = int(clean_row.get("absences", 0))
            if absences < 0 or absences > 93:
                rejected_items.append(BatchValidationItem(row=row_num, reason="absences must be between 0 and 93"))
                continue
        except (ValueError, TypeError):
            rejected_items.append(BatchValidationItem(row=row_num, reason="Invalid absences value"))
            continue

        g1 = None
        g2 = None
        if mode == "midterm":
            try:
                if "G1" not in clean_row or "G2" not in clean_row:
                    rejected_items.append(BatchValidationItem(row=row_num, reason="Mid-Term mode requires G1 and G2 columns"))
                    continue
                g1 = int(float(clean_row["G1"]))
                g2 = int(float(clean_row["G2"]))
                if not (0 <= g1 <= 20 and 0 <= g2 <= 20):
                    rejected_items.append(BatchValidationItem(row=row_num, reason="G1 and G2 must be between 0 and 20"))
                    continue
            except (ValueError, TypeError):
                rejected_items.append(BatchValidationItem(row=row_num, reason="G1 and G2 must be valid integers (0-20)"))
                continue

        # Build PredictRequest
        req_kwargs = {
            "mode": mode,
            "subject": subject,
            "studytime": studytime,
            "failures": failures,
            "absences": absences,
            "higher": 1 if str(clean_row.get("higher", "1")).lower() in ["1", "yes", "true"] else 0,
            "schoolsup": 1 if str(clean_row.get("schoolsup", "0")).lower() in ["1", "yes", "true"] else 0,
            "label": str(clean_row.get("label", f"Student #{row_num}"))
        }
        if mode == "midterm":
            req_kwargs["G1"] = g1
            req_kwargs["G2"] = g2

        # Optional demographic attributes
        for col in ["school", "sex", "age", "address", "famsize", "Pstatus", "Medu", "Fedu", "Mjob", "Fjob", "reason", "guardian", "traveltime", "famrel", "freetime", "goout", "Dalc", "Walc", "health"]:
            if col in clean_row:
                try:
                    if col in ["age", "Medu", "Fedu", "traveltime", "famrel", "freetime", "goout", "Dalc", "Walc", "health"]:
                        req_kwargs[col] = int(float(clean_row[col]))
                    else:
                        req_kwargs[col] = str(clean_row[col]).strip()
                except Exception:
                    pass

        try:
            req_obj = PredictRequest(**req_kwargs)
            pred_resp, inputs_dict, _ = predictor_service.predict(req_obj)
            
            risk_counts[pred_resp.risk_level] = risk_counts.get(pred_resp.risk_level, 0) + 1
            
            g3_val = pred_resp.predicted_g3
            if g3_val <= 4:
                grade_bins[0]["count"] += 1
            elif g3_val <= 9:
                grade_bins[1]["count"] += 1
            elif g3_val <= 13:
                grade_bins[2]["count"] += 1
            elif g3_val <= 16:
                grade_bins[3]["count"] += 1
            else:
                grade_bins[4]["count"] += 1

            accepted_items.append(BatchPredictionItem(
                row_index=row_num,
                label=req_kwargs["label"],
                subject=subject,
                predicted_g3=pred_resp.predicted_g3,
                predicted_pass=pred_resp.predicted_pass,
                pass_probability=pred_resp.pass_probability,
                risk_level=pred_resp.risk_level,
                inputs=inputs_dict
            ))
        except Exception as e:
            rejected_items.append(BatchValidationItem(row=row_num, reason=f"Inference error: {str(e)}"))

    return BatchPredictionResponse(
        batch_id=batch_id,
        filename=filename,
        total_rows=total_rows,
        accepted_rows=len(accepted_items),
        rejected_rows=len(rejected_items),
        rejected_details=rejected_items,
        results=accepted_items,
        risk_summary=risk_counts,
        grade_distribution=grade_bins
    )
