import {
  BatchPredictionResponse,
  CorrelationData,
  DataQualityReport,
  DistributionData,
  FeatureImportanceItem,
  HistoryItem,
  HistoryListResponse,
  InsightsSummary,
  ModelDiagnostics,
  ModelMetricsReport,
  PredictFormValues,
  PredictResponse,
  ProgressionData,
  SchemaMetadata,
} from './types';

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: await response.text() };
    }
    const message = errorData.detail || errorData.message || `Request failed with status ${response.status}`;
    throw new ApiError(typeof message === 'string' ? message : JSON.stringify(message), response.status, errorData);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getHealth: () => request<{ status: string; models_loaded: boolean }>('/api/health'),
  getMeta: () => request<SchemaMetadata>('/api/meta'),

  predict: (data: PredictFormValues) =>
    request<PredictResponse>('/api/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  predictBatch: (file: File, mode: string = 'midterm') => {
    const formData = new FormData();
    formData.append('file', file);
    return request<BatchPredictionResponse>(`/api/predict/batch?mode=${encodeURIComponent(mode)}`, {
      method: 'POST',
      body: formData,
    });
  },

  saveBatchHistory: (batchId: string, items: any[]) =>
    request<{ status: string; saved_count: number }>(`/api/batch/save-history/${encodeURIComponent(batchId)}`, {
      method: 'POST',
      body: JSON.stringify(items),
    }),

  getBatchTemplateUrl: () => `${BASE_URL}/api/batch/template`,

  getInsightsSummary: () => request<InsightsSummary>('/api/insights/summary'),
  getInsightsProgression: () => request<ProgressionData>('/api/insights/progression'),
  getInsightsDistribution: (params?: { feature?: string; subject?: string; sex?: string; school?: string }) => {
    const query = new URLSearchParams();
    if (params?.feature) query.set('feature', params.feature);
    if (params?.subject) query.set('subject', params.subject);
    if (params?.sex) query.set('sex', params.sex);
    if (params?.school) query.set('school', params.school);
    return request<DistributionData>(`/api/insights/distribution?${query.toString()}`);
  },
  getInsightsCorrelations: () => request<CorrelationData>('/api/insights/correlations'),
  getInsightsQuality: () => request<DataQualityReport>('/api/insights/quality'),

  getModelMetrics: () => request<ModelMetricsReport>('/api/models/metrics'),
  getModelImportance: (mode?: string) =>
    request<FeatureImportanceItem[]>(`/api/models/importance${mode ? `?mode=${mode}` : ''}`),
  getModelDiagnostics: (mode?: string) =>
    request<ModelDiagnostics>(`/api/models/diagnostics${mode ? `?mode=${mode}` : ''}`),

  getHistory: (params?: { q?: string; risk?: string; page?: number; page_size?: number }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.risk) query.set('risk', params.risk);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.page_size) query.set('page_size', params.page_size.toString());
    return request<HistoryListResponse>(`/api/history?${query.toString()}`);
  },
  getHistoryDetail: (id: number) => request<HistoryItem>(`/api/history/${id}`),
  deleteHistoryItem: (id: number) =>
    request<{ status: string; id: number }>(`/api/history/${id}`, { method: 'DELETE' }),
  clearAllHistory: () =>
    request<{ status: string; deleted_count: number }>('/api/history', { method: 'DELETE' }),
  getHistoryExportUrl: () => `${BASE_URL}/api/history/export.csv`,
};
