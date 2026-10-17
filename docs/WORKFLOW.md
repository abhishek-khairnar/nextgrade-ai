# Machine Learning Workflow & Methodology — NextGrade AI

**Project:** NextGrade AI  
**Internship Task:** Task 2 — Student Performance Prediction  
**Dataset:** Cortez, P., & Silva, A. (2008). *Using Data Mining to Predict Secondary School Student Performance*. EUROSIS-ETI.

---

## 1. Executive Summary & Problem Formulation

In secondary education, final grades ($G3$) are typically received when it is too late for remedial intervention. NextGrade AI addresses this challenge by framing student academic outcomes into two complementary prediction regimes:

1. **Early Warning Mode**: Predicts performance **prior to semester examinations**, utilizing demographic, familial, sociological, and baseline academic habits. Excludes $G1$, $G2$, and grade progression trends.
2. **Mid-Term Mode**: Predicts final grade $G3$ **after period 1 and 2 grades are recorded**, providing high-fidelity estimates ($R^2 \ge 0.83$) to identify students on the cusp of failing or dropping out.

Targets:
- **Regression**: Final grade $G3 \in [0, 20]$.
- **Classification**: Binary status $\text{Pass} = \mathbb{I}(G3 \ge 10)$.

---

## 2. Data Acquisition, Cleaning & Engineering

### 2.1 Dataset Ingestion
- Raw datasets: `student-mat.csv` (395 records) and `student-por.csv` (649 records).
- Automated script: `ml/download_data.py` downloads directly from the official UCI repository, verifies integrity, and provides a deterministic synthetic fallback for offline resilience.
- Merged dataset: 1,044 observations across 33 initial attributes.

### 2.2 Feature Engineering
Four composite domain features were formulated during preprocessing:
1. `parent_edu_avg`: $\frac{\text{Medu} + \text{Fedu}}{2.0}$ — Captures holistic household academic capital.
2. `alcohol_avg`: $\frac{5 \cdot \text{Dalc} + 2 \cdot \text{Walc}}{7.0}$ — Weighted weekly alcohol consumption favoring school-day impact.
3. `social_score`: $\frac{\text{freetime} + \text{goout}}{2.0}$ — Composite metric of peer engagement and free time.
4. `grade_trend`: $G2 - G1$ (Mid-Term mode only) — Tracks positive or negative academic momentum.

### 2.3 Zero-Grade Handling & Dropout Analysis
53 students ($5.1\%$) scored $G3 = 0$. In Portuguese secondary schooling, a score of zero denotes either dropout status, exam disqualification, or severe absenteeism rather than incremental test performance. We retained these instances in training to ensure the model learns severe failure modes, while documenting that zero grades exert high leverage on regression residuals.

---

## 3. Preprocessing Architecture

To ensure strict prevention of data leakage and identical serving transformations, scikit-learn `Pipeline` and `ColumnTransformer` constructs are serialized with `joblib`:
- **Numeric Features**: Imputed with `median`, followed by `StandardScaler`.
- **Categorical Features**: Imputed with `most_frequent`, followed by `OneHotEncoder(handle_unknown='ignore', sparse_output=False)`.

Train-test partitioning: 80% train, 20% test (stratified on binary `pass` outcome, `random_state=42`).

---

## 4. Modeling, Cross-Validation & Parsimony Selection

### 4.1 Regression Evaluation (5-Fold Cross-Validation)

| Mode | Model | Test MAE | Test RMSE | Test $R^2$ | 5-Fold CV RMSE |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Early Warning** | Linear Regression | 2.632 | 3.605 | 0.124 | 3.426 ± 0.191 |
| **Early Warning** | Ridge Regression | 2.622 | 3.592 | 0.130 | 3.417 ± 0.190 |
| **Early Warning** | **Random Forest Regressor (Selected)** | **2.452** | **3.432** | **0.206** | **3.079 ± 0.154** |
| **Early Warning** | Gradient Boosting Regressor | 2.415 | 3.309 | 0.262 | 3.121 ± 0.160 |
| **Mid-Term** | Linear Regression | 0.974 | 1.569 | 0.834 | 1.595 ± 0.249 |
| **Mid-Term** | **Ridge Regression (Selected)** | **0.973** | **1.568** | **0.834** | **1.588 ± 0.249** |
| **Mid-Term** | Random Forest Regressor | 0.852 | 1.248 | 0.895 | 1.530 ± 0.213 |
| **Mid-Term** | Gradient Boosting Regressor | 0.886 | 1.310 | 0.884 | 1.509 ± 0.165 |

**Parsimony Rule Decision**: In Mid-Term mode, Ridge Regression's CV score (1.588) lies within one standard deviation (0.165) of Gradient Boosting (1.509). Following Occam's razor and internship research findings, Ridge was selected for deployment due to lower latency, superior explainability, and immunity to tree-based overfitting on small tabular datasets.

### 4.2 Classification Evaluation ($G3 \ge 10$)

| Mode | Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Early Warning** | Logistic Regression | 80.4% | 0.845 | 0.880 | 0.862 | 0.731 |
| **Early Warning** | Random Forest Classifier | 82.8% | 0.852 | 0.906 | 0.878 | 0.757 |
| **Early Warning** | Gradient Boosting Classifier | 83.3% | 0.861 | 0.901 | 0.881 | 0.773 |
| **Mid-Term** | Logistic Regression | 92.3% | 0.941 | 0.948 | 0.944 | 0.960 |
| **Mid-Term** | **Random Forest Classifier** | **93.8%** | **0.950** | **0.961** | **0.955** | **0.968** |
| **Mid-Term** | Gradient Boosting Classifier | 92.8% | 0.945 | 0.952 | 0.948 | 0.952 |

---

## 5. Permutation Feature Importance & Findings

Permutation importance evaluated on unseen test data reveals:

### Early Warning Dominant Factors
1. `failures` (Past class failures): -0.18 grade impact per failure
2. `studytime` (Weekly study dedication): +0.12 grade impact
3. `higher` (Desire for higher education): +0.09 impact
4. `absences` (School absenteeism): -0.07 impact
5. `parent_edu_avg` (Parental education): +0.06 impact
6. `schoolsup` (Extra school instructional support): -0.05 impact (indicates remedial assignment)

### Mid-Term Dominant Factors
1. `G2` (Second period examination grade): **0.62 relative importance**
2. `G1` (First period examination grade): **0.24 relative importance**
3. `failures`: 0.04 relative importance
4. `absences`: 0.03 relative importance
5. `studytime`: 0.02 relative importance

### The "Honest Accuracy Gap"
The empirical gap between Early Warning (best $R^2 = 0.206$ with Random Forest, or $0.130$ with baseline Ridge) and Mid-Term ($R^2 = 0.834$ with Ridge) highlights that while static student habits explain long-term baselines, active academic mastery demonstrated on tests is the primary determinant of the final grade. The application interface explicitly surfaces this distinction, empowering educators to use Early Warning mode for preventive support and Mid-Term mode for tactical grade rescue.
