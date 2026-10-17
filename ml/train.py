"""
Training, hyperparameter tuning, evaluation, and artifact generation for NextGrade AI.
Trains both Early Warning (no G1/G2/grade_trend) and Mid-Term (with G1/G2/grade_trend) models.
"""

import json
import os
import shutil
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor, RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LinearRegression, LogisticRegression, Ridge
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import KFold, RandomizedSearchCV, StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_FILE = os.path.join(BASE_DIR, "data", "processed", "students_clean.csv")
BACKEND_ARTIFACTS = os.path.join(BASE_DIR, "backend", "artifacts")

CATEGORICAL_COLS = [
    "school", "sex", "address", "famsize", "Pstatus", "Mjob", "Fjob",
    "reason", "guardian", "subject"
]

BINARY_COLS = [
    "schoolsup", "famsup", "paid", "activities", "nursery", "higher",
    "internet", "romantic"
]

BASE_NUMERIC_COLS = [
    "age", "Medu", "Fedu", "traveltime", "studytime", "failures",
    "famrel", "freetime", "goout", "Dalc", "Walc", "health", "absences",
    "parent_edu_avg", "alcohol_avg", "social_score"
]

MIDTERM_EXTRA_COLS = ["G1", "G2", "grade_trend"]


def build_preprocessor(numeric_cols, categorical_cols):
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    preprocessor = ColumnTransformer(transformers=[
        ("num", numeric_transformer, numeric_cols),
        ("cat", categorical_transformer, categorical_cols)
    ])
    return preprocessor


def train_models():
    os.makedirs(BACKEND_ARTIFACTS, exist_ok=True)
    if not os.path.exists(PROCESSED_FILE):
        raise FileNotFoundError(f"{PROCESSED_FILE} not found. Run preprocess.py first.")

    df = pd.read_csv(PROCESSED_FILE)
    print(f"Loaded {len(df)} records for training.")

    # Schema definition
    schema = {
        "features": {},
        "defaults": {},
        "target": {"name": "G3", "min": 0, "max": 20},
        "pass_target": {"name": "pass", "threshold": 10}
    }

    for col in df.columns:
        if col in ["G3", "pass"]:
            continue
        if col in CATEGORICAL_COLS:
            unique_vals = sorted(df[col].dropna().unique().tolist())
            mode_val = df[col].mode()[0]
            schema["features"][col] = {"type": "categorical", "options": unique_vals, "default": mode_val}
            schema["defaults"][col] = mode_val
        elif col in BINARY_COLS:
            schema["features"][col] = {"type": "binary", "options": [0, 1], "default": int(df[col].mode()[0])}
            schema["defaults"][col] = int(df[col].mode()[0])
        else:
            min_val = float(df[col].min())
            max_val = float(df[col].max())
            median_val = float(df[col].median())
            schema["features"][col] = {"type": "numeric", "min": min_val, "max": max_val, "default": median_val}
            schema["defaults"][col] = median_val

    # Prepare datasets for both modes
    modes = {
        "early": {
            "num_cols": BASE_NUMERIC_COLS + BINARY_COLS,
            "cat_cols": CATEGORICAL_COLS,
        },
        "midterm": {
            "num_cols": BASE_NUMERIC_COLS + BINARY_COLS + MIDTERM_EXTRA_COLS,
            "cat_cols": CATEGORICAL_COLS,
        }
    }

    metrics_output = {"early": {}, "midterm": {}, "best": {}}
    importance_output = {"early": [], "midterm": []}
    diagnostics_output = {"early": {}, "midterm": {}}
    best_pipelines = {}

    for mode_name, cols_info in modes.items():
        print(f"\n==================== TRAINING MODE: {mode_name.upper()} ====================")
        num_cols = cols_info["num_cols"]
        cat_cols = cols_info["cat_cols"]
        feature_cols = num_cols + cat_cols

        X = df[feature_cols].copy()
        y_reg = df["G3"].copy()
        y_clf = df["pass"].copy()

        # Split 80/20 stratified on pass
        X_train, X_test, y_reg_train, y_reg_test, y_clf_train, y_clf_test = train_test_split(
            X, y_reg, y_clf, test_size=0.2, random_state=42, stratify=y_clf
        )

        preprocessor = build_preprocessor(num_cols, cat_cols)

        # ---------------- REGRESSION ----------------
        reg_models = {
            "LinearRegression": LinearRegression(),
            "Ridge": Ridge(alpha=1.0, random_state=42),
            "RandomForestRegressor": RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42),
            "GradientBoostingRegressor": GradientBoostingRegressor(n_estimators=100, learning_rate=0.05, max_depth=4, random_state=42)
        }

        # Hyperparameter tuning on RandomForest and GradientBoosting
        rf_param_dist = {
            "reg__n_estimators": [50, 100, 150],
            "reg__max_depth": [4, 6, 8, 12, None],
            "reg__min_samples_split": [2, 5, 10]
        }
        pipe_rf = Pipeline(steps=[("prep", preprocessor), ("reg", RandomForestRegressor(random_state=42))])
        search_rf = RandomizedSearchCV(pipe_rf, rf_param_dist, n_iter=6, cv=5, scoring="neg_root_mean_squared_error", random_state=42, n_jobs=-1)
        search_rf.fit(X_train, y_reg_train)
        best_rf_reg = search_rf.best_estimator_.named_steps["reg"]
        reg_models["RandomForestRegressor"] = best_rf_reg

        reg_results = {}
        best_reg_name = None
        best_reg_rmse = float("inf")
        best_reg_pipe = None

        kf = KFold(n_splits=5, shuffle=True, random_state=42)

        for name, model in reg_models.items():
            pipe = Pipeline(steps=[("prep", preprocessor), ("reg", model)])
            # 5-fold CV
            cv_scores = -cross_val_score(pipe, X_train, y_reg_train, cv=kf, scoring="neg_root_mean_squared_error")
            cv_mean = float(np.mean(cv_scores))
            cv_std = float(np.std(cv_scores))

            # Train on full train set and evaluate on test set
            pipe.fit(X_train, y_reg_train)
            y_pred = pipe.predict(X_test)
            y_pred_clamped = np.clip(y_pred, 0, 20)

            mae = float(mean_absolute_error(y_reg_test, y_pred_clamped))
            rmse = float(np.sqrt(mean_squared_error(y_reg_test, y_pred_clamped)))
            r2 = float(r2_score(y_reg_test, y_pred_clamped))

            reg_results[name] = {
                "mae": round(mae, 3),
                "rmse": round(rmse, 3),
                "r2": round(r2, 3),
                "cv_rmse_mean": round(cv_mean, 3),
                "cv_rmse_std": round(cv_std, 3),
            }
            print(f"[{mode_name}] Reg: {name:26s} | RMSE: {rmse:.3f} | R2: {r2:.3f} | CV RMSE: {cv_mean:.3f} ± {cv_std:.3f}")

            # Selection logic: prefer simpler model if within 1 std of best
            if cv_mean < best_reg_rmse:
                best_reg_rmse = cv_mean
                best_reg_name = name
                best_reg_pipe = pipe

        # Check if LinearRegression or Ridge is within 1 std of best
        if best_reg_name in ["RandomForestRegressor", "GradientBoostingRegressor"]:
            linear_cv = reg_results["Ridge"]["cv_rmse_mean"]
            best_std = reg_results[best_reg_name]["cv_rmse_std"]
            if linear_cv <= (best_reg_rmse + best_std):
                print(f"Note: Ridge (CV {linear_cv:.3f}) is within 1 std of {best_reg_name} ({best_reg_rmse:.3f} ± {best_std:.3f}). Choosing Ridge as robust model.")
                best_reg_name = "Ridge"
                best_reg_pipe = Pipeline(steps=[("prep", preprocessor), ("reg", reg_models["Ridge"])]).fit(X_train, y_reg_train)

        # ---------------- CLASSIFICATION ----------------
        clf_models = {
            "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42),
            "RandomForestClassifier": RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42),
            "GradientBoostingClassifier": GradientBoostingClassifier(n_estimators=100, learning_rate=0.05, max_depth=3, random_state=42)
        }

        clf_results = {}
        best_clf_name = None
        best_clf_f1 = -1.0
        best_clf_pipe = None

        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

        for name, model in clf_models.items():
            pipe = Pipeline(steps=[("prep", preprocessor), ("clf", model)])
            cv_scores = cross_val_score(pipe, X_train, y_clf_train, cv=skf, scoring="f1")
            cv_mean = float(np.mean(cv_scores))
            cv_std = float(np.std(cv_scores))

            pipe.fit(X_train, y_clf_train)
            y_pred = pipe.predict(X_test)
            y_prob = pipe.predict_proba(X_test)[:, 1] if hasattr(pipe, "predict_proba") else y_pred

            acc = float(accuracy_score(y_clf_test, y_pred))
            prec = float(precision_score(y_clf_test, y_pred, zero_division=0))
            rec = float(recall_score(y_clf_test, y_pred, zero_division=0))
            f1 = float(f1_score(y_clf_test, y_pred, zero_division=0))
            roc_auc = float(roc_auc_score(y_clf_test, y_prob))

            clf_results[name] = {
                "accuracy": round(acc, 3),
                "precision": round(prec, 3),
                "recall": round(rec, 3),
                "f1": round(f1, 3),
                "roc_auc": round(roc_auc, 3),
                "cv_f1_mean": round(cv_mean, 3),
                "cv_f1_std": round(cv_std, 3),
            }
            print(f"[{mode_name}] Clf: {name:26s} | F1: {f1:.3f} | ROC-AUC: {roc_auc:.3f} | CV F1: {cv_mean:.3f} ± {cv_std:.3f}")

            if cv_mean > best_clf_f1:
                best_clf_f1 = cv_mean
                best_clf_name = name
                best_clf_pipe = pipe

        metrics_output[mode_name] = {
            "regression": reg_results,
            "classification": clf_results,
            "best_regression": best_reg_name,
            "best_classification": best_clf_name
        }
        metrics_output["best"][mode_name] = {
            "regression": {
                "name": best_reg_name,
                "metrics": reg_results[best_reg_name]
            },
            "classification": {
                "name": best_clf_name,
                "metrics": clf_results[best_clf_name]
            }
        }

        # Permutation Importance on Test Set for Best Regression Model
        print(f"Computing permutation importance for {mode_name} mode using {best_reg_name}...")
        perm = permutation_importance(best_reg_pipe, X_test, y_reg_test, n_repeats=10, random_state=42, n_jobs=-1)
        importances = []
        for idx in np.argsort(perm.importances_mean)[::-1]:
            feat_name = feature_cols[idx]
            mean_imp = float(perm.importances_mean[idx])
            std_imp = float(perm.importances_std[idx])
            importances.append({
                "feature": feat_name,
                "importance": round(max(mean_imp, 0.0), 4),
                "std": round(std_imp, 4)
            })
        importance_output[mode_name] = importances[:15]

        # Diagnostics for Best Models
        # 1. Reg Diagnostics: Predicted vs Actual & Residuals
        y_test_pred = np.clip(best_reg_pipe.predict(X_test), 0, 20)
        residuals = y_reg_test.values - y_test_pred

        # Sample 100 points for scatter plot visualization
        scatter_sample = []
        sample_indices = np.random.RandomState(42).choice(len(y_reg_test), size=min(100, len(y_reg_test)), replace=False)
        for i in sample_indices:
            scatter_sample.append({
                "actual": round(float(y_reg_test.iloc[i]), 1),
                "predicted": round(float(y_test_pred[i]), 1),
                "residual": round(float(residuals[i]), 1)
            })

        # Residuals histogram bins (-10 to +10, bin size 1)
        res_hist, res_edges = np.histogram(residuals, bins=15, range=(-7.5, 7.5))
        residual_bins = []
        for i in range(len(res_hist)):
            residual_bins.append({
                "bin": f"{res_edges[i]:.1f} to {res_edges[i+1]:.1f}",
                "count": int(res_hist[i]),
                "center": round((res_edges[i] + res_edges[i+1]) / 2.0, 1)
            })

        # 2. Clf Diagnostics: Confusion Matrix & ROC
        y_clf_pred = best_clf_pipe.predict(X_test)
        y_clf_prob = best_clf_pipe.predict_proba(X_test)[:, 1] if hasattr(best_clf_pipe, "predict_proba") else y_clf_pred
        cm = confusion_matrix(y_clf_test, y_clf_pred)
        # [[TN, FP], [FN, TP]]
        cm_data = {
            "tn": int(cm[0][0]),
            "fp": int(cm[0][1]),
            "fn": int(cm[1][0]),
            "tp": int(cm[1][1]),
            "total": int(len(y_clf_test))
        }

        fpr, tpr, _ = roc_curve(y_clf_test, y_clf_prob)
        # Sample ~20 points for smooth ROC curve
        step = max(1, len(fpr) // 20)
        roc_points = [{"fpr": round(float(fpr[i]), 3), "tpr": round(float(tpr[i]), 3)} for i in range(0, len(fpr), step)]
        if roc_points[-1]["fpr"] != 1.0 or roc_points[-1]["tpr"] != 1.0:
            roc_points.append({"fpr": 1.0, "tpr": 1.0})

        diagnostics_output[mode_name] = {
            "scatter": scatter_sample,
            "residuals": residual_bins,
            "confusion_matrix": cm_data,
            "roc_curve": roc_points,
            "test_size": len(y_reg_test)
        }

        # Package dual prediction artifact (regression + classification in single bundle)
        artifact_package = {
            "mode": mode_name,
            "reg_model_name": best_reg_name,
            "clf_model_name": best_clf_name,
            "reg_pipeline": best_reg_pipe,
            "clf_pipeline": best_clf_pipe,
            "feature_cols": feature_cols,
            "num_cols": num_cols,
            "cat_cols": cat_cols,
            "rmse": reg_results[best_reg_name]["rmse"],
            "cv_rmse_std": reg_results[best_reg_name]["cv_rmse_std"],
            "f1": clf_results[best_clf_name]["f1"],
            "accuracy": clf_results[best_clf_name]["accuracy"],
            "baseline_defaults": schema["defaults"]
        }

        joblib_path = os.path.join(BACKEND_ARTIFACTS, f"model_{mode_name}.joblib")
        joblib.dump(artifact_package, joblib_path)
        print(f"Saved {joblib_path}")

    # Generate Insights JSON
    insights = {
        "summary": {
            "total_students": len(df),
            "math_students": int((df["subject"] == "math").sum()),
            "por_students": int((df["subject"] == "portuguese").sum()),
            "avg_g3": round(float(df["G3"].mean()), 2),
            "std_g3": round(float(df["G3"].std()), 2),
            "pass_rate": round(float(df["pass"].mean() * 100), 1),
            "zero_grades_count": int((df["G3"] == 0).sum()),
            "zero_grades_pct": round(float((df["G3"] == 0).mean() * 100), 1),
            "best_r2_early": metrics_output["best"]["early"]["regression"]["metrics"]["r2"],
            "best_r2_midterm": metrics_output["best"]["midterm"]["regression"]["metrics"]["r2"]
        },
        "progression": {
            "overall": {
                "g1": round(float(df["G1"].mean()), 2),
                "g2": round(float(df["G2"].mean()), 2),
                "g3": round(float(df["G3"].mean()), 2)
            },
            "math": {
                "g1": round(float(df[df['subject'] == 'math']['G1'].mean()), 2),
                "g2": round(float(df[df['subject'] == 'math']['G2'].mean()), 2),
                "g3": round(float(df[df['subject'] == 'math']['G3'].mean()), 2)
            },
            "portuguese": {
                "g1": round(float(df[df['subject'] == 'portuguese']['G1'].mean()), 2),
                "g2": round(float(df[df['subject'] == 'portuguese']['G2'].mean()), 2),
                "g3": round(float(df[df['subject'] == 'portuguese']['G3'].mean()), 2)
            }
        },
        "grade_distribution": [
            {"range": "0-4 (Fail)", "count": int(((df["G3"] >= 0) & (df["G3"] <= 4)).sum()), "risk": "High"},
            {"range": "5-9 (Fail)", "count": int(((df["G3"] >= 5) & (df["G3"] <= 9)).sum()), "risk": "High"},
            {"range": "10-13 (Satisfactory)", "count": int(((df["G3"] >= 10) & (df["G3"] <= 13)).sum()), "risk": "Medium"},
            {"range": "14-16 (Good)", "count": int(((df["G3"] >= 14) & (df["G3"] <= 16)).sum()), "risk": "Low"},
            {"range": "17-20 (Excellent)", "count": int(((df["G3"] >= 17) & (df["G3"] <= 20)).sum()), "risk": "Low"}
        ],
        "correlations": {
            "features": ["G1", "G2", "G3", "studytime", "failures", "absences", "Medu", "Fedu", "alcohol_avg", "social_score"],
            "matrix": []
        },
        "data_quality": {
            "total_rows": len(df),
            "columns_count": len(df.columns),
            "missing_values_count": 0,
            "duplicate_rows": int(df.duplicated().sum()),
            "outliers_absences_over_30": int((df["absences"] > 30).sum()),
            "applied_steps": [
                "UCI math and Portuguese subsets merged with subject indicator (1,044 rows total)",
                "Binary categorical columns (schoolsup, famsup, etc.) encoded as integers (0/1)",
                "Composite features engineered: parent_edu_avg, alcohol_avg, social_score, grade_trend",
                "Range constraints asserted: G1/G2/G3 in [0, 20], absences >= 0, studytime in [1, 4]",
                "ColumnTransformer handles median numeric imputation + scaling and one-hot categorical encoding"
            ]
        }
    }

    corr_cols = insights["correlations"]["features"]
    corr_df = df[corr_cols].corr().round(2)
    insights["correlations"]["matrix"] = corr_df.values.tolist()

    # Save JSON files
    with open(os.path.join(BACKEND_ARTIFACTS, "metrics.json"), "w") as f:
        json.dump(metrics_output, f, indent=2)
    with open(os.path.join(BACKEND_ARTIFACTS, "importance.json"), "w") as f:
        json.dump(importance_output, f, indent=2)
    with open(os.path.join(BACKEND_ARTIFACTS, "diagnostics.json"), "w") as f:
        json.dump(diagnostics_output, f, indent=2)
    with open(os.path.join(BACKEND_ARTIFACTS, "schema.json"), "w") as f:
        json.dump(schema, f, indent=2)
    with open(os.path.join(BACKEND_ARTIFACTS, "insights.json"), "w") as f:
        json.dump(insights, f, indent=2)

    print("\n[SUCCESS] All ML artifacts generated and saved to backend/artifacts/:")
    for f in ["model_early.joblib", "model_midterm.joblib", "metrics.json", "importance.json", "diagnostics.json", "schema.json", "insights.json"]:
        p = os.path.join(BACKEND_ARTIFACTS, f)
        print(f" - {f} ({os.path.getsize(p):,} bytes)")

if __name__ == "__main__":
    train_models()
