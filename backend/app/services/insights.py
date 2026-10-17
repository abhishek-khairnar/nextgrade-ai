import json
import os
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from app.config import settings

class InsightsService:
    def __init__(self):
        self.artifacts_dir = settings.ARTIFACTS_DIR
        self.processed_csv = settings.PROCESSED_CSV_PATH
        self._cached_insights = None
        self._df = None

    def _get_df(self) -> pd.DataFrame:
        if self._df is None:
            if os.path.exists(self.processed_csv):
                self._df = pd.read_csv(self.processed_csv)
            else:
                raise FileNotFoundError(f"Processed dataset not found at {self.processed_csv}")
        return self._df

    def _load_insights_json(self) -> Dict[str, Any]:
        if self._cached_insights is None:
            insights_path = os.path.join(self.artifacts_dir, "insights.json")
            if os.path.exists(insights_path):
                with open(insights_path, "r", encoding="utf-8") as f:
                    self._cached_insights = json.load(f)
            else:
                self._cached_insights = {}
        return self._cached_insights

    def get_summary(self) -> Dict[str, Any]:
        return self._load_insights_json().get("summary", {})

    def get_progression(self) -> Dict[str, Any]:
        return self._load_insights_json().get("progression", {})

    def get_correlations(self) -> Dict[str, Any]:
        return self._load_insights_json().get("correlations", {})

    def get_quality(self) -> Dict[str, Any]:
        return self._load_insights_json().get("data_quality", {})

    def get_distribution(
        self,
        feature: str = "G3",
        subject: Optional[str] = None,
        sex: Optional[str] = None,
        school: Optional[str] = None
    ) -> Dict[str, Any]:
        df = self._get_df().copy()

        # Apply optional filters
        if subject and subject.lower() in ["math", "portuguese"]:
            df = df[df["subject"].str.lower() == subject.lower()]
        if sex and sex.upper() in ["M", "F"]:
            df = df[df["sex"].str.upper() == sex.upper()]
        if school and school.upper() in ["GP", "MS"]:
            df = df[df["school"].str.upper() == school.upper()]

        if feature not in df.columns:
            feature = "G3"

        is_numeric = pd.api.types.is_numeric_dtype(df[feature]) and df[feature].nunique() > 6 and feature not in ["studytime", "failures", "famrel", "freetime", "goout", "Dalc", "Walc", "health", "Medu", "Fedu"]

        if is_numeric:
            # Generate histogram bins
            series = df[feature].dropna()
            counts, bin_edges = np.histogram(series, bins=10)
            data_points = []
            for i in range(len(counts)):
                label = f"{bin_edges[i]:.1f}-{bin_edges[i+1]:.1f}"
                data_points.append({
                    "name": label,
                    "count": int(counts[i]),
                    "avg_g3": round(float(df[(df[feature] >= bin_edges[i]) & (df[feature] <= bin_edges[i+1])]["G3"].mean()), 2)
                })
        else:
            # Categorical grouping with average G3
            grouped = df.groupby(feature).agg(
                count=("G3", "count"),
                avg_g3=("G3", "mean")
            ).reset_index()
            data_points = []
            for _, r in grouped.iterrows():
                data_points.append({
                    "name": str(r[feature]),
                    "count": int(r["count"]),
                    "avg_g3": round(float(r["avg_g3"]), 2)
                })

        return {
            "feature": feature,
            "total_count": len(df),
            "filters": {"subject": subject, "sex": sex, "school": school},
            "is_numeric": is_numeric,
            "distribution": data_points
        }

insights_service = InsightsService()
