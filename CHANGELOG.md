# Changelog

All notable changes to the **NextGrade AI** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2026-10-18

### Fixed
- **Gauge Component Overlaps (`Gauge.tsx`):**
  - Rebuilt SVG geometry using `viewBox="0 0 240 140"`, arc radius 90, stroke 16, centered at `(120, 125)` with full padding so elements are never cut off.
  - Separated numeric predicted grade and `"out of 20"` caption completely into clean HTML tabular text rendered below the SVG, preventing needle collision.
  - Positioned the `"Pass 10"` threshold label outside the colored arc with $\ge 8\text{px}$ clearance and a distinct tick mark crossing the arc at G3 = 10.
  - Placed `"0"` and `"20"` end labels below the arc terminals.
  - Rendered three distinct risk color zones matching academic risk definitions: Red (0–10), Amber (10–14), Green (14–20).
  - Shortened needle to 62px ($< 82\text{px}$ inner arc radius) and animated needle with smooth CSS rotation around the hub while respecting `prefers-reduced-motion`.
  - Added `role="img"` and descriptive dynamic `aria-label` for full screen reader accessibility.
  - Clamped all edge cases (0, 10, 20, negative, >20, missing/NaN). Added 7 Vitest unit tests in `frontend/src/tests/gauge.test.tsx`.
- **Duplicate Toasts & Double Submit (`Toast.tsx`, `Predict.tsx`):**
  - Implemented 1.5s window toast deduplication by key.
  - Limited visible toasts to at most 3 with a 4-second auto-dismiss and pause-on-hover timer.
  - Added accessible close buttons and polite ARIA status announcements (`role="status"`, `aria-live="polite"`).
  - Positioned notifications on bottom-right for desktop and bottom-center on mobile devices.
  - Unified Tailwind z-index scale (`navbar: 40`, `drawer: 50`, `modal: 60`, `toast: 70`).
  - Added `isSubmittingRef` re-entry guard and disabled submit buttons while loading. Removed auto-submit on initial page mount.
- **Stale Result with Wrong Mode (`Predict.tsx`):**
  - Preserved prediction mode and input signature inside each result object.
  - The result panel header now strictly displays the mode of the prediction itself rather than the current toggle state.
  - Switching between Early Warning and Mid-Term modes immediately clears results and displays a friendly placeholder: *"Your prediction will appear here"*.
  - Editing input attributes after generating a prediction dims the panel and displays an amber notification: *"Inputs changed since this prediction. Generate again to update."*
  - What-If intervention sliders consistently simulate using the result's own mode.
- **Overconfident & Contradictory Probabilities (`predictor.py`, `Predict.tsx`, `Home.tsx`):**
  - Clipped backend `pass_probability` to $[0.01, 0.99]$ so probabilities are never overconfident 0% or 100%.
  - Rounded pass probability display to whole integer percentages.
  - Incorporated model Cross-Validation RMSE margins ($3.079$ for early warning, $1.588$ for midterm). If $|G3 - 10| \le \text{CV RMSE}$, surfaces *"Borderline - close to the pass mark."*
  - If classifier and regression diverge on pass status, surfaces *"The two models disagree. Treat this as borderline."*
- **Home Headline Spacing & 1440px Crowding (`Home.tsx`):**
  - Removed JSX line break spaces before punctuation marks (`"grade,"` and `"to help."`).
  - Applied fluid typography scaling via `clamp(2.25rem, 4.5vw, 3.75rem)`.
  - Upgraded hero layout to a two-column grid with `minmax(0, ...)` columns and a 56px gap (`gap-12 lg:gap-14`), eliminating card collisions on 1024, 1280, 1440, and 1920 displays.
- **Navbar Layout Link Stability (`Navbar.tsx`):**
  - Converted navigation bar to a 3-column grid (`[200px_1fr_200px]`) with fixed action width.
  - On `/predict`, hid the "Predict Now" action using `invisible pointer-events-none` with `tabIndex={-1}`, preserving identical horizontal positioning of center links across all routes.
- **Accidental History Saves (`predict.py`, `Home.tsx`, `Predict.tsx`):**
  - Added optional `save: bool = Field(default=True)` parameter to `POST /api/predict`.
  - Home live demonstration card and What-If simulator calls now explicitly supply `save=false`, eliminating accidental database writes.
  - Verified that browsing Home and manipulating sliders creates zero history rows. Added backend tests for `save=True` and `save=False`.
- **Sticky Result Panel Viewport Cutoff (`Predict.tsx`):**
  - Configured sticky panel with `lg:sticky lg:top-[80px] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto pr-1` so tall result panels scroll internally and never get cut off on laptop screens.

### Added
- **Playwright Automated E2E Smoke Suite (`frontend/e2e/smoke.spec.ts`):**
  - 28 automated tests verifying zero horizontal overflow (`scrollWidth <= innerWidth`) and zero console errors across all 9 application routes at 320px, 768px, and 1440px viewports.
  - Automated verification that one user click on "Generate Prediction" triggers exactly one request, one toast, and one database row.
  - Added npm script `"test:e2e"`.
- **New High-Resolution Screenshots:**
  - `42-gauge-closeup.png`: Detailed close-up of the rebuilt gauge component with outside Pass 10 label and tabular HTML score.
  - `43-predict-stale-result-banner.png`: Demonstration of the amber stale-result alert and dimmed result panel when inputs change.
  - `44-predict-borderline-note.png`: Demonstration of borderline evaluation and model disagreement callouts.
  - All 41 existing screenshots retaken and verified at modern resolutions under 1 MB.

---

## [1.0.0] - 2026-10-17

### Added
- Complete student performance prediction system (FastAPI + scikit-learn + React 18 + Vite + TypeScript + Tailwind CSS).
- Dual prediction modes: Early Warning (pre-exam behavioral triage) and Mid-Term Trajectory (exam-calibrated grade prediction).
- Explainable AI factor impact breakdown against median cohort baselines.
- Interactive What-If simulation engine for remediation scenario testing.
- Batch CSV prediction pipeline with automated schema validation.
- Interactive Exploratory Data Analysis (EDA) dashboard on UCI student dataset.
- Model Lab comparing Ridge, Random Forest, and Gradient Boosting with diagnostic scatter plots, residual distributions, confusion matrices, and ROC curves.
- Full prediction history ledger with SQLite persistence, CSV export, and detail inspection drawer.
