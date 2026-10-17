import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Filter,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Database,
  Layers,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  CorrelationData,
  DataQualityReport,
  DistributionData,
  InsightsSummary,
  ProgressionData,
} from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { ProgressionChart } from '@/components/charts/ProgressionChart';
import { DistributionChart } from '@/components/charts/DistributionChart';
import { Heatmap } from '@/components/charts/Heatmap';
import { CardSkeleton } from '@/components/ui/Skeleton';

const EXPLORER_FEATURES = [
  { value: 'G3', label: 'Final Grade (G3)' },
  { value: 'studytime', label: 'Study Time (1-4)' },
  { value: 'failures', label: 'Past Failures (0-4)' },
  { value: 'absences', label: 'Absences (Days)' },
  { value: 'Medu', label: "Mother's Education (0-4)" },
  { value: 'Fedu', label: "Father's Education (0-4)" },
  { value: 'higher', label: 'Desire for Higher Ed' },
  { value: 'schoolsup', label: 'Extra School Support' },
  { value: 'internet', label: 'Internet Access at Home' },
  { value: 'romantic', label: 'Romantic Relationship' },
  { value: 'goout', label: 'Going Out Frequency (1-5)' },
  { value: 'health', label: 'Current Health (1-5)' },
];

export const Insights: React.FC = () => {
  const [summary, setSummary] = useState<InsightsSummary | null>(null);
  const [progression, setProgression] = useState<ProgressionData | null>(null);
  const [correlations, setCorrelations] = useState<CorrelationData | null>(null);
  const [quality, setQuality] = useState<DataQualityReport | null>(null);
  const [distData, setDistData] = useState<DistributionData | null>(null);

  // Filters
  const [selectedFeature, setSelectedFeature] = useState<string>('G3');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterSex, setFilterSex] = useState<string>('');
  const [filterSchool, setFilterSchool] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    document.title = 'Data Insights & EDA | NextGrade AI';

    async function loadData() {
      try {
        const [sumRes, progRes, corrRes, qualRes] = await Promise.all([
          api.getInsightsSummary(),
          api.getInsightsProgression(),
          api.getInsightsCorrelations(),
          api.getInsightsQuality(),
        ]);
        setSummary(sumRes);
        setProgression(progRes);
        setCorrelations(corrRes);
        setQuality(qualRes);
      } catch (err) {
        console.error('Failed to load insights', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Fetch dynamic distribution when filters change
  useEffect(() => {
    api
      .getInsightsDistribution({
        feature: selectedFeature,
        subject: filterSubject || undefined,
        sex: filterSex || undefined,
        school: filterSchool || undefined,
      })
      .then((res) => setDistData(res))
      .catch((e) => console.error('Dist error', e));
  }, [selectedFeature, filterSubject, filterSex, filterSchool]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-[#E5E9F2]">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2A4A] tracking-tight">
          Exploratory Data Insights
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Empirical distributions, grade progression lines, and correlation matrices from 1,044 secondary student records.
        </p>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
            Total Observations
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B2A4A] tabular-nums">
            {summary?.total_students.toLocaleString() || '1,044'}
          </div>
          <span className="text-xs text-[#2563EB] font-medium mt-1 inline-block">
            {summary?.math_students || 395} Math, {summary?.por_students || 649} Portuguese
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
            Average Final Grade (G3)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B2A4A] tabular-nums">
            {summary?.avg_g3.toFixed(2) || '11.34'} / 20
          </div>
          <span className="text-xs text-[#64748B] font-medium mt-1 inline-block">
            Std Dev: ±{summary?.std_g3.toFixed(2) || '3.86'}
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
            Pass Rate (G3 ≥ 10)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#059669] tabular-nums">
            {summary?.pass_rate.toFixed(1) || '78.5'}%
          </div>
          <span className="text-xs text-[#64748B] font-medium mt-1 inline-block">
            Baseline Satisfactory Standing
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
            Zero Final Grades (G3 = 0)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#DC2626] tabular-nums">
            {summary?.zero_grades_count || 53}{' '}
            <span className="text-base font-normal text-[#64748B]">
              ({summary?.zero_grades_pct.toFixed(1) || '5.1'}%)
            </span>
          </div>
          <span className="text-xs text-[#DC2626] font-medium mt-1 inline-block">
            Dropouts &amp; Exam Absentees
          </span>
        </Card>
      </div>

      {/* Global Filter Bar */}
      <Card className="p-4 sm:p-5 bg-white border border-[#E5E9F2]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B2A4A] uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#2563EB]" />
            <span>Interactive Demographic Filters:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-[#E5E9F2] rounded-xl focus-ring font-medium"
            >
              <option value="">All Subjects (Math &amp; Por)</option>
              <option value="math">Mathematics Only</option>
              <option value="portuguese">Portuguese Only</option>
            </select>

            <select
              value={filterSex}
              onChange={(e) => setFilterSex(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-[#E5E9F2] rounded-xl focus-ring font-medium"
            >
              <option value="">All Genders</option>
              <option value="F">Female Students Only</option>
              <option value="M">Male Students Only</option>
            </select>

            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-[#E5E9F2] rounded-xl focus-ring font-medium"
            >
              <option value="">All Schools</option>
              <option value="GP">Gabriel Pereira (GP)</option>
              <option value="MS">Mousinho da Silveira (MS)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Progression Line & Feature Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Progression Chart (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#0B2A4A]">Period Progression (G1 → G2 → G3)</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Term 1, Term 2, and Final exam score stability
                </p>
              </div>
            </div>
            {progression ? <ProgressionChart data={progression} /> : <CardSkeleton />}
          </Card>
        </div>

        {/* Feature Explorer (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#0B2A4A]">Feature Explorer</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Filtered sample distribution across attributes
                </p>
              </div>

              <select
                value={selectedFeature}
                onChange={(e) => setSelectedFeature(e.target.value)}
                className="h-8 px-2 text-xs bg-white border border-[#E5E9F2] rounded-lg font-semibold text-[#0B2A4A] focus-ring"
              >
                {EXPLORER_FEATURES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {distData ? (
              <DistributionChart data={distData.distribution} isNumeric={distData.isNumeric} />
            ) : (
              <CardSkeleton />
            )}
          </Card>
        </div>
      </div>

      {/* Correlation Matrix Heatmap */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="font-bold text-base text-[#0B2A4A]">
            Pearson Correlation Matrix: Academic &amp; Behavioral Metrics
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Hover over any cell to inspect pairwise Pearson correlation coefficients (r).
          </p>
        </div>

        {correlations ? <Heatmap data={correlations} /> : <CardSkeleton />}
      </Card>

      {/* Data Quality & Cleaning Audit Card */}
      {quality && (
        <Card accent="blue" className="p-6 sm:p-8 space-y-4 bg-white">
          <div className="flex items-center gap-2 font-bold text-base text-[#0B2A4A]">
            <CheckCircle2 className="w-5 h-5 text-[#059669]" />
            <h3>Data Quality &amp; Preprocessing Verification Report</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <span className="text-[#64748B] block mb-0.5">Missing Values:</span>
              <span className="text-base font-extrabold text-[#059669] tabular-nums">
                {quality.missing_values_count} (0.0%)
              </span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <span className="text-[#64748B] block mb-0.5">Duplicate Records:</span>
              <span className="text-base font-extrabold text-[#059669] tabular-nums">
                {quality.duplicate_rows}
              </span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <span className="text-[#64748B] block mb-0.5">Outlier Absences (&gt;30):</span>
              <span className="text-base font-extrabold text-[#D97706] tabular-nums">
                {quality.outliers_absences_over_30} students
              </span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <span className="text-[#64748B] block mb-0.5">Total Schema Columns:</span>
              <span className="text-base font-extrabold text-[#0B2A4A] tabular-nums">
                {quality.columns_count} attributes
              </span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs font-bold text-[#0B2A4A] uppercase tracking-wider block mb-2">
              Preprocessing Transformations Applied:
            </span>
            <ul className="space-y-1.5 text-xs text-[#64748B]">
              {quality.applied_steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};
