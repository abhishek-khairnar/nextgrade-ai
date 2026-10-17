export type AcademicMode = 'early' | 'midterm';
export type AcademicSubject = 'math' | 'portuguese';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface FactorImpact {
  feature: string;
  label: string;
  impact: number;
  current_value: string | number;
  baseline_value: string | number;
}

export interface ConfidenceRange {
  min: number;
  max: number;
}

export interface PredictResponse {
  id?: number;
  predicted_g3: number;
  predicted_g3_formatted: string;
  confidence_range: ConfidenceRange;
  predicted_pass: number;
  pass_probability: number;
  risk_level: RiskLevel;
  risk_label: string;
  mode: AcademicMode;
  factors: FactorImpact[];
  suggestions: string[];
  cv_rmse?: number;
  is_borderline?: boolean;
  model_disagreement?: boolean;
  borderline_note?: string | null;
}

export interface PredictFormValues {
  mode: AcademicMode;
  subject: AcademicSubject;
  studytime: number;
  failures: number;
  absences: number;
  higher: number;
  schoolsup: number;
  G1?: number;
  G2?: number;
  save?: boolean;
  school?: string;
  sex?: string;
  age?: number;
  address?: string;
  famsize?: string;
  Pstatus?: string;
  Medu?: number;
  Fedu?: number;
  Mjob?: string;
  Fjob?: string;
  reason?: string;
  guardian?: string;
  traveltime?: number;
  famsup?: number;
  paid?: number;
  activities?: number;
  nursery?: number;
  internet?: number;
  romantic?: number;
  famrel?: number;
  freetime?: number;
  goout?: number;
  Dalc?: number;
  Walc?: number;
  health?: number;
  label?: string;
}

export interface BatchValidationItem {
  row: number;
  reason: string;
}

export interface BatchPredictionItem {
  row_index: number;
  label: string;
  subject: string;
  predicted_g3: number;
  predicted_pass: number;
  pass_probability: number;
  risk_level: RiskLevel;
  inputs: Record<string, any>;
}

export interface BatchPredictionResponse {
  batch_id: string;
  filename: string;
  total_rows: number;
  accepted_rows: number;
  rejected_rows: number;
  rejected_details: BatchValidationItem[];
  results: BatchPredictionItem[];
  risk_summary: Record<string, number>;
  grade_distribution: { range: string; count: number }[];
}

export interface HistoryItem {
  id: number;
  created_at: string;
  label?: string;
  subject: string;
  mode: AcademicMode;
  predicted_g3: number;
  pass_probability: number;
  predicted_pass: number;
  risk_level: RiskLevel;
  inputs: Record<string, any>;
  factors: FactorImpact[];
}

export interface HistoryListResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface InsightsSummary {
  total_students: number;
  math_students: number;
  por_students: number;
  avg_g3: number;
  std_g3: number;
  pass_rate: number;
  zero_grades_count: number;
  zero_grades_pct: number;
  best_r2_early: number;
  best_r2_midterm: number;
}

export interface ProgressionData {
  overall: { g1: number; g2: number; g3: number };
  math: { g1: number; g2: number; g3: number };
  portuguese: { g1: number; g2: number; g3: number };
}

export interface DistributionData {
  feature: string;
  total_count: number;
  is_numeric: boolean;
  filters: { subject?: string; sex?: string; school?: string };
  distribution: { name: string; count: number; avg_g3?: number }[];
}

export interface CorrelationData {
  features: string[];
  matrix: number[][];
}

export interface DataQualityReport {
  total_rows: number;
  columns_count: number;
  missing_values_count: number;
  duplicate_rows: number;
  outliers_absences_over_30: number;
  applied_steps: string[];
}

export interface ModelMetricsReport {
  early: {
    regression: Record<string, { mae: number; rmse: number; r2: number; cv_rmse_mean: number; cv_rmse_std: number }>;
    classification: Record<string, { accuracy: number; precision: number; recall: number; f1: number; roc_auc: number; cv_f1_mean: number; cv_f1_std: number }>;
    best_regression: string;
    best_classification: string;
  };
  midterm: {
    regression: Record<string, { mae: number; rmse: number; r2: number; cv_rmse_mean: number; cv_rmse_std: number }>;
    classification: Record<string, { accuracy: number; precision: number; recall: number; f1: number; roc_auc: number; cv_f1_mean: number; cv_f1_std: number }>;
    best_regression: string;
    best_classification: string;
  };
  best: Record<string, any>;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  std: number;
}

export interface ModelDiagnostics {
  scatter: { actual: number; predicted: number; residual: number }[];
  residuals: { bin: string; count: number; center: number }[];
  confusion_matrix: { tn: number; fp: number; fn: number; tp: number; total: number };
  roc_curve: { fpr: number; tpr: number }[];
  test_size: number;
}

export interface SchemaMetadata {
  schema: {
    features: Record<string, any>;
    defaults: Record<string, any>;
  };
  examples: Record<string, PredictFormValues>;
}
