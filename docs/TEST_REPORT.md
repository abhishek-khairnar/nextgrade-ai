# NextGrade AI — Comprehensive Test Report

**Project:** NextGrade AI (Student Performance Prediction)  
**Date of Testing:** 18 October 2026  
**Execution Environment:** Windows 11, Python 3.11.9, Node v22.14.0, Vite 5.4, Chrome Browser  

---

## 1. Executive Summary

NextGrade AI underwent systematic end-to-end automated and manual verification:
1. **Backend Unit & Integration Testing**: 11 pytest test cases covering REST endpoints, Pydantic v2 schemas, mode validation, batch processing, and SQLite persistence. **Result: 11 Passed (100%)**.
2. **Frontend Unit & Component Testing**: 11 Vitest test cases covering formatting utilities, Zod conditional validation schemas, Button, Chip, and Gauge components. **Result: 11 Passed (100%)**.
3. **End-to-End Browser Testing**: Complete browser subagent walkthrough validating all routes, responsive UI, What-if simulator reactivity, and interactive charts with video recording artifact.
4. **Screenshot Suite**: 40 clean, high-resolution PNG captures documented in `docs/screenshots/` (all under 250 KB).

---

## 2. Backend Automated Test Suite (pytest)

Execution command: `pytest -v`

| Test Name | File | Scope | Status |
| :--- | :--- | :--- | :--- |
| `test_health_check` | `backend/tests/test_api.py` | Validates `/api/health`, status 200, model loading state | **PASSED** |
| `test_metadata_endpoint` | `backend/tests/test_api.py` | Schema extraction, field ranges, student presets | **PASSED** |
| `test_predict_early_warning_mode` | `backend/tests/test_api.py` | Single inference without G1/G2; factors & suggestions | **PASSED** |
| `test_predict_midterm_mode_success` | `backend/tests/test_api.py` | Single inference with G1/G2; pass & risk calculation | **PASSED** |
| `test_predict_midterm_missing_grades_fails` | `backend/tests/test_api.py` | Asserts 422 Unprocessable Entity when G1/G2 omitted | **PASSED** |
| `test_predict_invalid_studytime_fails` | `backend/tests/test_api.py` | Boundary validation (studytime > 4 returns 422) | **PASSED** |
| `test_batch_template_download` | `backend/tests/test_api.py` | Validates CSV template attachment generation | **PASSED** |
| `test_batch_upload_valid_and_invalid_rows` | `backend/tests/test_api.py` | Multipart CSV processing, row-level validation | **PASSED** |
| `test_insights_endpoints` | `backend/tests/test_api.py` | Summary stats, progression, distribution, correlations | **PASSED** |
| `test_models_endpoints` | `backend/tests/test_api.py` | Benchmark metrics, importance rankings, diagnostics | **PASSED** |
| `test_history_crud_and_export` | `backend/tests/test_api.py` | History retrieval, detail query, export CSV, delete | **PASSED** |

**Summary: 11 passed in 2.22s.**

---

## 3. Frontend Automated Test Suite (Vitest)

Execution command: `npm test` inside `frontend/`

| Test File | Test Cases | Scope | Status |
| :--- | :--- | :--- | :--- |
| `src/tests/format.test.ts` | 4 tests | `formatGrade`, `formatPercent`, risk badge and pass badge styling | **PASSED** |
| `src/tests/schemas.test.ts` | 4 tests | Zod schema validation; conditional Mid-Term G1/G2 check | **PASSED** |
| `src/tests/components.test.tsx` | 3 tests | `Button` loading states, `Chip` accessibility, `Gauge` numeric rendering | **PASSED** |

**Summary: 11 passed across 3 test files.**

---

## 4. End-to-End Browser Subagent Verification

The browser subagent executed a full automated session traversing the live application at `http://127.0.0.1:5173`:

### Route-by-Route Findings:
1. **Home (`/`)**:
   - Branding "NextGrade AI" and tagline *"Predict the next grade, while there is still time to help."* rendered with high-contrast typography.
   - Live result preview card successfully fetched live inference from `/api/predict`.
   - 4 KPI cards loaded dynamic metrics from `/api/insights/summary` (1,044 students, 11.3 / 20 avg, 78.5% pass rate, 0.834 best R²).
2. **Predictor (`/predict`)**:
   - Toggled seamlessly between **Early Warning (No Exams)** and **Mid-Term (With G1 & G2)**.
   - Tested student presets: `At-Risk Student`, `Average Trajectory`, `High Achiever`. Form fields updated instantly.
   - Semicircle SVG Gauge rendered with dynamic needle rotation and 80% confidence interval band.
   - What-If Intervention Simulator sliders adjusted values; debounced re-prediction calculated positive or negative delta point shifts.
   - Clipboard copy button successfully formatted and copied prediction summary with toast notice.
3. **Batch Predictor (`/batch`)**:
   - Download CSV template link generated valid `nextgrade_template.csv`.
   - Drag-and-drop zone responded with hover styling.
   - Uploaded `data/sample_batch.csv` and verified row-level validation summary and risk charts.
4. **Data Insights (`/insights`)**:
   - KPI counters and G1 → G2 → G3 progression line chart rendered smoothly.
   - Feature explorer dropdown displayed histogram distributions for chosen features.
   - Correlation heatmap rendered Pearson r values with interactive hover tooltips.
5. **Model Lab (`/models`)**:
   - Comparative evaluation table displayed Ridge, LinearRegression, RandomForest, and GradientBoosting metrics.
   - Scatter plot showed predicted vs actual grades with diagonal alignment.
   - Residuals histogram centered at 0.
   - Confusion matrix and ROC curve (AUC 0.968) rendered with zero console warnings.
   - Permutation feature importance listed top 15 drivers (G2, G1, failures, absences, studytime).
6. **Prediction History (`/history`)**:
   - Auto-saved predictions displayed with timestamp, subject, mode, predicted G3, and risk status.
   - Detail slide-over drawer opened and displayed individual feature contributions.
   - Delete confirmation modal opened with focus trap and closed on Cancel.
   - Empty state verified when filtering for non-existent records.
7. **About & Methodology (`/about`)**:
   - Complete dataset documentation, Cortez & Silva (2008) citation, `#methodology` anchor, and limitations.
8. **Privacy (`/privacy`)**:
   - Clear disclosure of zero PII collection, local persistence, and user erasure controls.
9. **404 Not Found (`/random-invalid-url`)**:
   - Rendered friendly error message with "Go Home" and "Open Predict" navigation buttons.

---

## 5. Bugs Discovered & Resolved During Phase A

1. **NumPy Type Serialization Error:**
   - *Issue:* NumPy scalar types (`np.float64`, `np.int64`) produced by the factor impact calculation caused standard `json.dumps()` in SQLite database persistence to fail with `TypeError: Object of type int64 is not JSON serializable`.
   - *Fix:* Implemented recursive `to_native_py(val)` in `backend/app/services/predictor.py` converting NumPy primitives into Python standard `float`, `int`, and `bool` before database insert.

2. **FastAPI Query Regex Deprecation:**
   - *Issue:* FastAPI/Pydantic emitted deprecation warnings regarding `regex="^(early|midterm)$"` in `Query()`.
   - *Fix:* Updated parameter in `backend/app/routers/models.py` to `pattern="^(early|midterm)$"`.

3. **Early Warning R² Inconsistency Reconciliation:**
   - *Issue:* Earlier project notes mentioned Early Warning regression $R^2$ as 0.130 in one place and ~0.26 in another.
   - *Resolution:* Cross-referenced ground-truth `backend/artifacts/metrics.json`:
     - Baseline Ridge Regression: $R^2 = 0.130$, $\text{RMSE} = 3.592$.
     - Benchmarked Gradient Boosting: $R^2 = 0.262$, $\text{RMSE} = 3.309$.
     - Selected & Deployed Model (`RandomForestRegressor`): $R^2 = 0.206$, $\text{RMSE} = 3.432$, $\text{CV RMSE} = 3.079 \pm 0.154$.
   - Unified this exact breakdown across `frontend/src/pages/Models.tsx`, `docs/WORKFLOW.md`, `docs/SUBMISSION.md`, and `README.md`.

4. **Pytest Scanning `node_modules`:**
   - *Issue:* Running pytest from repository root without configuration caused pytest to traverse `frontend/node_modules/`, taking ~40s.
   - *Fix:* Added root `pytest.ini` with `norecursedirs = node_modules frontend .venv venv .git` and `pythonpath = backend`. Test execution now finishes in 2.2s.

5. **Repository URL Environment Configuration:**
   - *Issue:* Footer "Source Code" link required target repository URL.
   - *Fix:* Configured `VITE_REPO_URL=https://github.com/abhishek-khairnar/nextgrade-ai` in `frontend/.env.example` and `frontend/.env`.
