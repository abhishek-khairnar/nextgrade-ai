# NextGrade AI — Comprehensive Test Report

**Project:** NextGrade AI (Student Performance Prediction)  
**Date of Testing:** 18 October 2026  
**Execution Environment:** Windows 11, Python 3.11.9, Node v22.14.0, Vite 5.4, Chrome Browser  

---

## 1. Executive Summary

NextGrade AI underwent systematic end-to-end automated and manual verification:
1. **Backend Unit & Integration Testing**: 14 pytest test cases covering REST endpoints, Pydantic v2 schemas, mode validation, batch processing, SQLite persistence, history bypass, probability clipping, and borderline diagnostic logic. **Result: 14 Passed (100%)**.
2. **Frontend Unit & Component Testing**: 18 Vitest test cases covering formatting utilities, Zod conditional validation schemas, Button, Chip, and rebuilt Gauge components. **Result: 18 Passed (100%)**.
3. **End-to-End Automated Testing**: 28 Playwright tests across 9 routes and 3 responsive viewports, verifying zero overflow, zero console errors, and single-submit toast/DB integrity. **Result: 28 Passed (100%)**.
4. **End-to-End Browser Walkthrough**: Complete verification validating all routes, responsive UI, What-if simulator reactivity, and interactive charts.
5. **Screenshot Suite**: 44 clean, high-resolution PNG captures documented in `docs/screenshots/` (all under 250 KB).

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

---

## 6. UI Audit and Fixes (v1.0.1)

A systematic end-to-end audit was conducted across all pages, viewports (320px, 375px, 390px, 768px, 1024px, 1280px, 1440px, 1920px), and Windows scaling factors (125%, 150%). The following 10 issues were diagnosed, resolved, and verified:

| # | Issue Identified | Affected Component | Technical Resolution | Verification Status |
|---|------------------|--------------------|----------------------|---------------------|
| **1** | **Gauge Layout Overlap & Collision** | `frontend/src/components/charts/Gauge.tsx` | Rebuilt SVG with `viewBox="0 0 240 140"`, arc radius 90, stroke 16, centered at `(120, 125)`. Moved numeric grade and "OUT OF 20" entirely into tabular HTML below SVG. Positioned "Pass 10" tick label outside arc ($\ge 8\text{px}$ clearance). Rendered 3 distinct risk bands (Red 0–10, Amber 10–14, Green 14–20) with rounded endcaps. Shortened needle to 62px ($< 82\text{px}$ inner arc). Added `role="img"`, dynamic `aria-label`, and `motion-reduce:transition-none`. | Verified via 7 Vitest tests and screenshot `42-gauge-closeup.png` |
| **2** | **Duplicate Toasts & Double Submit** | `frontend/src/components/ui/Toast.tsx`, `frontend/src/pages/Predict.tsx` | Implemented key-based deduplication window (1.5s), maximum 3 visible toasts, 4s auto-dismiss with hover-pause, dismiss button, and polite live region. Unified Tailwind z-index scale (navbar 40, drawer 50, modal 60, toast 70). Added `isSubmittingRef` re-entry guard and disabled button during request. Removed auto-trigger on initial page load. | Verified in Playwright test: 1 click = exactly 1 toast & 1 DB row |
| **3** | **Stale Result with Outdated Mode** | `frontend/src/pages/Predict.tsx` | Mode and input hash are stored inside the prediction result. Result header reads mode strictly from `result.mode`. Mode toggle switch immediately clears old results and displays friendly placeholder *"Your prediction will appear here"*. Editing inputs after prediction displays amber notice *"Inputs changed since this prediction. Generate again to update."* and dims card opacity. What-If simulator uses `result.mode`. | Verified in screenshot `43-predict-stale-result-banner.png` |
| **4** | **Overconfident Probabilities & Model Disagreement** | `backend/app/services/predictor.py`, `frontend/src/pages/Predict.tsx` | Clipped backend `pass_probability` to $[0.01, 0.99]$ (never 0% or 100%). Rounded display to integer percentage. Calculated CV RMSE margin ($3.079$ early, $1.588$ midterm): if $|G3 - 10| \le \text{CV RMSE}$, surfaces *"Borderline - close to the pass mark."* If classifier and regression diverge on pass status, surfaces *"The two models disagree. Treat this as borderline."* | Verified in backend tests and screenshot `44-predict-borderline-note.png` |
| **5** | **Home Headline Spacing & Crowding** | `frontend/src/pages/Home.tsx` | Removed stray whitespace before punctuation marks (`"grade,"` and `"to help."`). Applied fluid clamp font size `clamp(2.25rem, 4.5vw, 3.75rem)` and two-column grid with `minmax(0, ...)` and 56px gap (`gap-12 lg:gap-14`) to prevent collision with live demo card on 1440px displays. | Verified across 320 to 1920px viewports; screenshot `01-home-hero.png` |
| **6** | **Navbar Links Jumping Across Routes** | `frontend/src/components/layout/Navbar.tsx` | Replaced flex distribution with desktop 3-column CSS grid (`[200px_1fr_200px]`). On `/predict`, the "Predict Now" CTA button is hidden using `invisible pointer-events-none` with `tabIndex={-1}`, preserving exact action width so navigation links remain fixed in identical horizontal position. | Verified across all route switches |
| **7** | **Accidental History Saves from Demos & Sliders** | `backend/app/routers/predict.py`, `frontend/src/pages/Home.tsx`, `frontend/src/pages/Predict.tsx` | Added `save: bool = Field(default=True)` parameter to `PredictRequest`. Home page live demo and What-If simulator calls explicitly supply `save=false`, bypassing SQLite persistence. Only user-pressed "Generate Prediction" actions create history rows. | Verified: 0 rows added on Home visits & slider manipulation |
| **8** | **Sticky Result Panel Viewport Cutoff** | `frontend/src/pages/Predict.tsx` | Configured sticky result column with `lg:sticky lg:top-[80px] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto pr-1` so tall result panels scroll internally and never extend beyond screen viewport on small desktop/laptop screens. | Verified at 1440x900 and 1280x720 |
| **9** | **Vitest Test Discovery Conflict** | `frontend/vite.config.ts` | Configured Vitest test include path to `src/**/*.{test,spec}.{ts,tsx}` and excluded `e2e/**` to decouple unit tests from Playwright browser automation tests. | Verified: 18 Vitest unit tests pass cleanly |
| **10** | **Playwright Automated E2E Smoke Suite** | `frontend/e2e/smoke.spec.ts` | Implemented 28 automated Playwright tests asserting zero horizontal scroll (`scrollWidth <= innerWidth`) and zero console errors across 9 routes at 320px, 768px, and 1440px viewports, plus single-submit integrity. Added npm script `"test:e2e"`. | 28 / 28 Playwright tests passing |

### Automated Test Suite Summary (v1.0.1)

```text
Backend Tests (Pytest):
  14 passed in 2.35s (test_api.py: health, meta, early/midterm predict, batch, insights, models, history, save flag, probability clipping, borderline)

Frontend Unit Tests (Vitest):
  18 passed in 1.50s (format.test.ts, schemas.test.ts, gauge.test.tsx, components.test.tsx)

Playwright E2E Smoke Tests:
  28 passed in 37.0s (smoke.spec.ts: 9 routes x 3 viewports = 27 responsive/no-overflow checks + 1 prediction integrity check)

Production Build (Vite + TypeScript):
  tsc && vite build completed in 4.85s with 0 errors.
```

