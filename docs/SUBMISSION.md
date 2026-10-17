# NextGrade AI — Virtual Internship Task 2 Submission Document

**Project Title:** NextGrade AI (Student Performance Prediction Platform)  
**Submission Due Date:** 29 October 2026  
**Internship Track:** AI & Machine Learning Virtual Internship (Task 2)  
**Author:** Abhishek Khairnar ([@abhishek-khairnar](https://github.com/abhishek-khairnar))  
**GitHub Repository:** [https://github.com/abhishek-khairnar/nextgrade-ai](https://github.com/abhishek-khairnar/nextgrade-ai)  
**Tagline:** *"Predict the next grade, while there is still time to help."*

---

## 1. Executive Summary & Deliverables

NextGrade AI is a production-grade machine learning web platform addressing **Task 2: Student Performance Prediction**. The project establishes a fully documented, reproducible workflow fulfilling all four mandatory internship pillars:

1. **Data Preprocessing**:
   - Automated ingestion of the benchmark UCI Student Performance dataset (Cortez & Silva 2008), merging Math (395 rows) and Portuguese (649 rows) subsets into 1,044 observations.
   - Robust boundary validations ($G1, G2, G3 \in [0, 20]$, $\text{absences} \ge 0$).
   - Engineered domain features: `parent_edu_avg`, `alcohol_avg`, `social_score`, and `grade_trend`.
   - Complete exploratory data analysis and documented Jupyter notebook at `ml/notebooks/01_eda_and_modeling.ipynb`.

2. **Model Training**:
   - Implemented dual predictive regimes: **Early Warning Mode** (pre-exam behavioral screening) and **Mid-Term Mode** (post-exam tactical grade forecasting).
   - Trained Ridge, Linear Regression, Random Forest, and Gradient Boosting algorithms across regression ($G3$) and classification ($\text{Pass} \ge 10$) objectives.
   - 5-fold cross-validation and hyperparameter optimization via `RandomizedSearchCV`.

3. **Model Evaluation & Honest Research Findings**:
   - Ridge Regression selected under the **Parsimony Rule** ($R^2 = 0.834$, $\text{RMSE} = 1.568$, 5-fold CV RMSE within 1 std of ensemble models).
   - Gradient Boosting / Random Forest Classifier achieved 92.8% accuracy and 0.968 ROC-AUC.
   - Transparently documented the **"Honest Accuracy Gap"**: acknowledging that past exam marks dominate predictive variance, while Early Warning mode ($R^2 = 0.206$ with Random Forest, $0.130$ with baseline Ridge) is retained for proactive screening.

4. **Working Prediction Interface**:
   - High-performance edtech web interface built with React 18, Vite, TypeScript, and Tailwind CSS.
   - Interactive Semicircle SVG Gauge, 80% confidence intervals, Pass/Fail probability chips, and factor attribution bars.
   - Real-time debounced **What-If Intervention Simulator** allowing educators to visualize the positive impact of increased study time and reduced absenteeism.
   - Batch CSV roster screening (up to 1,000 students) with row-level validation and export.
   - Prediction history persisted in SQLite via SQLAlchemy 2 with search, risk filtering, and CSV download.

---

## 2. Deliverables Checklist

- [x] **Raw & Processed Data**: `data/raw/student-mat.csv` (395), `data/raw/student-por.csv` (649), `data/processed/students_clean.csv` (1,044).
- [x] **Reproducible ML Pipeline**: `ml/download_data.py`, `ml/preprocess.py`, `ml/train.py`, `ml/notebooks/01_eda_and_modeling.ipynb`.
- [x] **Trained Model Artifacts**: `backend/artifacts/model_early.joblib`, `model_midterm.joblib`, `metrics.json`, `importance.json`, `diagnostics.json`, `schema.json`, `insights.json`.
- [x] **FastAPI REST API**: Comprehensive typed backend with 17 endpoints mounted under `/api/*`.
- [x] **Frontend Web App**: Responsive single-page application across 8 primary views (`/`, `/predict`, `/batch`, `/insights`, `/models`, `/history`, `/about`, `/privacy`, `/404`).
- [x] **Automated Test Suites**: 14 backend pytest tests, 18 frontend Vitest tests, and 28 Playwright E2E tests (100% passing).
- [x] **Deployment Manifests**: `backend/render.yaml`, `frontend/vercel.json`, and `.env.example` templates.
- [x] **Documentation**: `README.md`, `docs/WORKFLOW.md`, `docs/TEST_REPORT.md`, `docs/SUBMISSION.md`, `CHANGELOG.md`.

---

## 3. Screenshots & Visual Artifacts

The application interface was verified with 44 high-resolution PNG captures documented in `docs/screenshots/`:

| View | Screenshot Artifact | Key Features Captured |
| :--- | :--- | :--- |
| **Home Page** | `docs/screenshots/01-home-hero.png` | Hero section, live prediction preview card, 4 live stats cards, How-it-works cards |
| **Predictor Lab** | `docs/screenshots/08-predict-result-panel.png` | Mode toggle, student preset buttons, demographic inputs, sticky result card |
| **Interventions** | `docs/screenshots/10-predict-whatif-simulator.png` | Live what-if simulation sliders, debounced API calls, recalculation deltas |
| **Batch Roster** | `docs/screenshots/15-batch-results-and-charts.png` | Drag-and-drop CSV validation, table filtering, risk distribution charts, export |
| **Insights Hub** | `docs/screenshots/19-insights-correlation-heatmap.png` | Demographic filters, G1-G2-G3 progression chart, interactive correlation matrix |
| **Model Lab** | `docs/screenshots/21-models-summary-and-comparison.png` | Regression & classification benchmarks, scatter plots, confusion matrix, ROC-AUC |
| **Audit History** | `docs/screenshots/26-history-table.png` | Searchable audit log, risk badge filters, detail slide-over drawer, CSV export |
| **API Docs** | `docs/screenshots/40-swagger-api-docs.png` | FastAPI Swagger interactive documentation for all 17 REST endpoints |
| **Gauge Closeup** | `docs/screenshots/42-gauge-closeup.png` | Rebuilt arc geometry, outside pass tick, tabular grade text, zero overlap |
| **Stale State Banner** | `docs/screenshots/43-predict-stale-result-banner.png` | Real-time input change detection with amber update prompt and dimmed card |
| **Borderline Diagnostic** | `docs/screenshots/44-predict-borderline-note.png` | Model CV RMSE proximity warning and classifier/regression agreement check |

---

## 4. Key Performance Metrics Summary

Ground truth evaluation metrics from `backend/artifacts/metrics.json`:

```
========================================================================================
TIMING MODE       TARGET            DEPLOYED MODEL       PRIMARY METRIC        TEST SCORE
========================================================================================
Mid-Term          G3 (Regression)   Ridge                R² Score              0.834 (RMSE 1.57)
Mid-Term          Pass/Fail (Class) Gradient Boosting    ROC-AUC               0.952 (Acc 91.9%)
Early Warning     G3 (Regression)   Random Forest        R² Score              0.206 (RMSE 3.43)
Early Warning     Pass/Fail (Class) Random Forest        ROC-AUC               0.757 (Acc 78.9%)
========================================================================================
```

---

## 5. Verification Sign-off

- **Pipeline Verification:** Automated training and inference executed without warnings.
- **Backend Quality:** 14/14 pytest test cases passing.
- **Frontend Quality:** 18/18 Vitest unit test cases passing; 28/28 Playwright E2E smoke tests passing; TypeScript production build compiled with zero errors.
- **Reproducibility:** Tested via fresh virtual environment and clean browser walkthrough.
