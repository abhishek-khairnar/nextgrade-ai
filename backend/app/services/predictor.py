import json
import os
from typing import Any, Dict, List, Optional, Tuple
import joblib
import numpy as np
import pandas as pd
from app.config import settings
from app.schemas import ConfidenceRange, FactorImpact, PredictRequest, PredictResponse

FEATURE_LABELS = {
    "G2": "Term 2 Grade",
    "G1": "Term 1 Grade",
    "failures": "Past Failures",
    "absences": "School Absences",
    "studytime": "Weekly Study Time",
    "higher": "Desire for Higher Ed",
    "parent_edu_avg": "Parental Education",
    "schoolsup": "Extra School Support",
    "alcohol_avg": "Alcohol Consumption",
    "social_score": "Social / Free Time",
    "grade_trend": "Grade Progression Trend",
    "freetime": "Free Time",
    "goout": "Going Out with Friends",
    "health": "Current Health Status",
    "Medu": "Mother's Education",
    "Fedu": "Father's Education",
    "traveltime": "Travel Time to School",
    "famrel": "Family Relationship Quality",
    "subject": "Academic Subject",
    "school": "School Name"
}

def to_native_py(val: Any) -> Any:
    if hasattr(val, "item"):
        return val.item()
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return float(val)
    return val

class PredictorService:
    def __init__(self):
        self.artifacts_dir = settings.ARTIFACTS_DIR
        self.models: Dict[str, Any] = {}
        self.schema: Dict[str, Any] = {}
        self.is_ready: bool = False
        self.load_artifacts()

    def load_artifacts(self):
        early_path = os.path.join(self.artifacts_dir, "model_early.joblib")
        midterm_path = os.path.join(self.artifacts_dir, "model_midterm.joblib")
        schema_path = os.path.join(self.artifacts_dir, "schema.json")

        if not os.path.exists(early_path) or not os.path.exists(midterm_path):
            print(f"[WARN] Artifacts missing in {self.artifacts_dir}. Waiting for training...")
            return

        self.models["early"] = joblib.load(early_path)
        self.models["midterm"] = joblib.load(midterm_path)

        with open(schema_path, "r", encoding="utf-8") as f:
            self.schema = json.load(f)

        self.is_ready = True
        print("[OK] PredictorService loaded Early Warning and Mid-Term artifacts.")

    def _prepare_dataframe(self, data: PredictRequest, mode: str) -> pd.DataFrame:
        raw_dict = data.model_dump()
        
        # Calculate engineered features
        medu = raw_dict.get("Medu", 2)
        fedu = raw_dict.get("Fedu", 2)
        raw_dict["parent_edu_avg"] = round((medu + fedu) / 2.0, 2)

        dalc = raw_dict.get("Dalc", 1)
        walc = raw_dict.get("Walc", 1)
        raw_dict["alcohol_avg"] = round((dalc * 5.0 + walc * 2.0) / 7.0, 2)

        freetime = raw_dict.get("freetime", 3)
        goout = raw_dict.get("goout", 3)
        raw_dict["social_score"] = round((freetime + goout) / 2.0, 2)

        if mode == "midterm":
            g1 = raw_dict.get("G1", 10) or 10
            g2 = raw_dict.get("G2", 10) or 10
            raw_dict["grade_trend"] = g2 - g1

        model_pkg = self.models[mode]
        feature_cols = model_pkg["feature_cols"]

        row = {col: raw_dict.get(col, model_pkg["baseline_defaults"].get(col, 0)) for col in feature_cols}
        return pd.DataFrame([row])

    def predict(self, req: PredictRequest) -> Tuple[PredictResponse, Dict[str, Any], List[Dict[str, Any]]]:
        if not self.is_ready:
            raise RuntimeError("Model artifacts are not loaded.")

        mode = req.mode
        pkg = self.models[mode]
        reg_pipe = pkg["reg_pipeline"]
        clf_pipe = pkg["clf_pipeline"]

        df_single = self._prepare_dataframe(req, mode)

        # Regression inference
        raw_g3 = float(reg_pipe.predict(df_single)[0])
        pred_g3 = float(np.clip(raw_g3, 0.0, 20.0))

        # Classification inference
        if hasattr(clf_pipe, "predict_proba"):
            probs = clf_pipe.predict_proba(df_single)[0]
            pass_prob = float(probs[1]) if len(probs) > 1 else 0.5
        else:
            pass_prob = 1.0 if pred_g3 >= 10.0 else 0.0
            
        pred_pass = 1 if pred_g3 >= 10.0 or pass_prob >= 0.5 else 0

        # Risk level determination
        if pred_g3 < 10.0:
            risk_level = "High"
            risk_label = "High Academic Risk (< 10)"
        elif pred_g3 < 14.0:
            risk_level = "Medium"
            risk_label = "Medium Risk / Passing (10 – 13.9)"
        else:
            risk_level = "Low"
            risk_label = "Low Risk / High Standing (≥ 14)"

        # Confidence interval from CV RMSE
        cv_spread = pkg.get("cv_rmse_std", 1.2) * 1.28  # ~80% prediction interval
        conf_min = round(float(np.clip(pred_g3 - cv_spread, 0.0, 20.0)), 1)
        conf_max = round(float(np.clip(pred_g3 + cv_spread, 0.0, 20.0)), 1)

        # Factor Impact Computation (Difference against dataset median/mode baseline)
        defaults = pkg["baseline_defaults"]
        factor_impacts: List[FactorImpact] = []
        raw_inputs = req.model_dump()

        test_features = ["G2", "G1", "failures", "absences", "studytime", "higher", "schoolsup", "parent_edu_avg", "alcohol_avg", "social_score"]
        if mode == "early":
            test_features = [f for f in test_features if f not in ["G1", "G2", "grade_trend"]]

        for feat in test_features:
            if feat in df_single.columns and feat in defaults:
                curr_val = to_native_py(df_single[feat].iloc[0])
                base_val = to_native_py(defaults[feat])
                
                # Perturb feature to baseline
                df_perturbed = df_single.copy()
                df_perturbed[feat] = base_val
                
                # In midterm, re-evaluate dependent grade_trend if G1 or G2 changes
                if mode == "midterm":
                    if feat == "G1":
                        df_perturbed["grade_trend"] = df_perturbed["G2"].iloc[0] - base_val
                    elif feat == "G2":
                        df_perturbed["grade_trend"] = base_val - df_perturbed["G1"].iloc[0]

                perturbed_g3 = float(np.clip(reg_pipe.predict(df_perturbed)[0], 0.0, 20.0))
                impact = round(pred_g3 - perturbed_g3, 2)
                
                if abs(impact) >= 0.05:
                    label = FEATURE_LABELS.get(feat, feat.replace("_", " ").title())
                    factor_impacts.append(FactorImpact(
                        feature=feat,
                        label=label,
                        impact=impact,
                        current_value=curr_val,
                        baseline_value=base_val
                    ))

        # Sort factors by absolute magnitude and cap at 6
        factor_impacts.sort(key=lambda x: abs(x.impact), reverse=True)
        top_factors = factor_impacts[:6]

        # Actionable Rule-Based Suggestions
        suggestions: List[str] = []
        if req.absences >= 8:
            suggestions.append(f"Target reducing absences from {req.absences} to under 4 days to prevent learning gaps.")
        if req.failures > 0:
            suggestions.append(f"Enroll in structured tutoring to overcome foundational knowledge gaps from {req.failures} past failure(s).")
        if req.studytime <= 2:
            suggestions.append("Increase weekly focused study time to at least 5–10 hours (Level 3 or 4).")
        if req.higher == 0:
            suggestions.append("Meet with academic guidance counselor to explore career goals and tertiary education motivation.")
        if req.schoolsup == 1:
            suggestions.append("Continue active participation in school support programs to reinforce classroom instruction.")
        if mode == "midterm" and req.G1 is not None and req.G2 is not None and req.G2 < req.G1:
            suggestions.append(f"Investigate the drop between Term 1 ({req.G1}) and Term 2 ({req.G2}) with teacher feedback.")
        if not suggestions:
            suggestions.append("Maintain positive current academic study habits and consistent attendance.")

        response = PredictResponse(
            predicted_g3=round(pred_g3, 1),
            predicted_g3_formatted=f"{pred_g3:.1f} / 20",
            confidence_range=ConfidenceRange(min=conf_min, max=conf_max),
            predicted_pass=pred_pass,
            pass_probability=round(pass_prob, 2),
            risk_level=risk_level,
            risk_label=risk_label,
            mode=mode,
            factors=top_factors,
            suggestions=suggestions[:4]
        )

        factors_raw = [f.model_dump() for f in top_factors]
        return response, raw_inputs, factors_raw

predictor_service = PredictorService()
