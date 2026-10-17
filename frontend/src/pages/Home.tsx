import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sliders,
  FileSpreadsheet,
  HelpCircle,
  Database,
  Cpu,
  LineChart,
} from 'lucide-react';
import { api } from '@/lib/api';
import { InsightsSummary, PredictResponse, FeatureImportanceItem } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Gauge } from '@/components/charts/Gauge';
import { FactorBars } from '@/components/charts/FactorBars';
import { CardSkeleton } from '@/components/ui/Skeleton';

export const Home: React.FC = () => {
  const [summary, setSummary] = useState<InsightsSummary | null>(null);
  const [demoResult, setDemoResult] = useState<PredictResponse | null>(null);
  const [topDrivers, setTopDrivers] = useState<FeatureImportanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Predict the Next Grade | NextGrade AI';

    async function loadHomeData() {
      try {
        const [sumRes, demoRes, driversRes] = await Promise.all([
          api.getInsightsSummary(),
          api.predict({
            mode: 'midterm',
            subject: 'math',
            studytime: 3,
            failures: 0,
            absences: 2,
            higher: 1,
            schoolsup: 0,
            G1: 14,
            G2: 15,
            label: 'Demo High-Trajectory Student',
          }),
          api.getModelImportance('midterm'),
        ]);

        setSummary(sumRes);
        setDemoResult(demoRes);
        setTopDrivers(driversRes.slice(0, 5));
      } catch (err) {
        console.error('Failed to load home page live data', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12">
      {/* 1. Hero Section */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Content (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EEF2FF] border border-[#BFDBFE] text-xs font-semibold text-[#0B2A4A]">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>AI-Powered Academic Early Intervention</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0B2A4A] tracking-tight leading-[1.15]">
              Predict the next grade,{' '}
              <span className="text-[#2563EB]">while there is still time to help.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Final exams are known too late to act. NextGrade AI forecasts final course grades
              (scale 0–20) and pass/fail risk early, explains the driving behavioral factors, and
              simulates what-if outcomes for timely interventions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link to="/predict" className="w-full sm:w-auto">
                <Button size="lg" fullWidth leftIcon={<Sparkles className="w-4 h-4" />}>
                  Predict a Student
                </Button>
              </Link>
              <Link to="/insights" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" fullWidth leftIcon={<BarChart3 className="w-4 h-4" />}>
                  Explore the Data
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Live Result Preview Card (5 cols) */}
          <div className="lg:col-span-5">
            {loading || !demoResult ? (
              <CardSkeleton lines={4} />
            ) : (
              <Card accent="blue" className="p-6 relative group hover:shadow-soft-hover">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E9F2]">
                  <div>
                    <span className="text-xs uppercase font-bold text-[#2563EB] tracking-wider">
                      Live Model Demonstration
                    </span>
                    <h3 className="font-bold text-[#0B2A4A] text-sm">Example: Math Mid-Term</h3>
                  </div>
                  <Chip variant="risk" riskLevel={demoResult.risk_level} size="sm">
                    {demoResult.risk_level} Risk
                  </Chip>
                </div>

                <div className="py-4 flex flex-col items-center">
                  <Gauge value={demoResult.predicted_g3} confidenceRange={demoResult.confidence_range} />
                </div>

                <div className="space-y-3 pt-2 border-t border-[#E5E9F2]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B] font-medium">Outcome Classification</span>
                    <Chip variant={demoResult.predicted_pass ? 'pass' : 'fail'} size="sm">
                      {demoResult.predicted_pass ? 'Pass Expected' : 'At Risk'} ({(demoResult.pass_probability * 100).toFixed(0)}%)
                    </Chip>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-[#0B2A4A] block mb-1.5">
                      Top Driver Contributions:
                    </span>
                    <FactorBars factors={demoResult.factors.slice(0, 3)} />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E9F2] flex items-center justify-between text-xs text-[#64748B]">
                  <span>Inputs: G1=14, G2=15, Study=3</span>
                  <Link to="/predict" className="font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                    Try custom inputs <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* 2. Live Stats Strip */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="p-5 text-center sm:text-left">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
              Students Analysed
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B2A4A] tabular-nums">
              {summary ? summary.total_students.toLocaleString() : '1,044'}
            </div>
            <span className="text-xs text-[#059669] font-medium mt-1 inline-block">
              UCI Math &amp; Portuguese
            </span>
          </Card>

          <Card className="p-5 text-center sm:text-left">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
              Average G3 Grade
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B2A4A] tabular-nums">
              {summary ? `${summary.avg_g3.toFixed(1)} / 20` : '11.3 / 20'}
            </div>
            <span className="text-xs text-[#64748B] font-medium mt-1 inline-block">
              Standard Dev: ±{summary ? summary.std_g3.toFixed(1) : '3.8'}
            </span>
          </Card>

          <Card className="p-5 text-center sm:text-left">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
              Pass Rate (G3 ≥ 10)
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#059669] tabular-nums">
              {summary ? `${summary.pass_rate.toFixed(1)}%` : '78.5%'}
            </div>
            <span className="text-xs text-[#64748B] font-medium mt-1 inline-block">
              Benchmark Passing Score
            </span>
          </Card>

          <Card className="p-5 text-center sm:text-left">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
              Best Model R²
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#2563EB] tabular-nums">
              {summary ? summary.best_r2_midterm.toFixed(3) : '0.834'}
            </div>
            <span className="text-xs text-[#64748B] font-medium mt-1 inline-block">
              Mid-Term Ridge Regression
            </span>
          </Card>
        </div>
      </section>

      {/* 3. How It Works: 4 Steps */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block mb-2">
            End-To-End ML Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2A4A]">How NextGrade AI Operates</h2>
          <p className="text-sm text-[#64748B] mt-2">
            Rigorous machine learning pipeline transforming raw demographic and academic logs into
            actionable guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/about#methodology" className="group">
            <Card hoverable className="p-6 h-full border-t-4 border-t-[#2563EB] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2563EB] flex items-center justify-center font-bold mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0B2A4A] group-hover:text-[#2563EB] transition-colors">
                  1. Preprocess
                </h3>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  Clean 1,044 records, assert boundary conditions, and engineer domain features
                  (parental capital, social indices).
                </p>
              </div>
              <span className="text-xs font-semibold text-[#2563EB] mt-4 flex items-center gap-1">
                View methodology <ArrowRight className="w-3 h-3" />
              </span>
            </Card>
          </Link>

          <Link to="/models" className="group">
            <Card hoverable className="p-6 h-full border-t-4 border-t-[#0B2A4A] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#0B2A4A] flex items-center justify-center font-bold mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0B2A4A] group-hover:text-[#2563EB] transition-colors">
                  2. Train
                </h3>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  Train linear baselines and ensemble models (Random Forest, Gradient Boosting)
                  using 5-fold cross-validation.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#2563EB] mt-4 flex items-center gap-1">
                See model lab <ArrowRight className="w-3 h-3" />
              </span>
            </Card>
          </Link>

          <Link to="/models" className="group">
            <Card hoverable className="p-6 h-full border-t-4 border-t-[#059669] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center font-bold mb-4">
                  <LineChart className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0B2A4A] group-hover:text-[#2563EB] transition-colors">
                  3. Evaluate
                </h3>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  Benchmark RMSE, MAE, R², F1, and permutation feature importances across Early
                  Warning and Mid-Term modes.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#2563EB] mt-4 flex items-center gap-1">
                Inspect diagnostics <ArrowRight className="w-3 h-3" />
              </span>
            </Card>
          </Link>

          <Link to="/predict" className="group">
            <Card hoverable className="p-6 h-full border-t-4 border-t-[#D97706] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-bold mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0B2A4A] group-hover:text-[#2563EB] transition-colors">
                  4. Predict &amp; Act
                </h3>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  Serve instant calibrated grade forecasts, factor explanations, and what-if
                  simulations for educators.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#2563EB] mt-4 flex items-center gap-1">
                Launch predictor <ArrowRight className="w-3 h-3" />
              </span>
            </Card>
          </Link>
        </div>
      </section>

      {/* 4. Feature Highlights */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2563EB] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#0B2A4A]">Early Warning Mode</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Identify struggling students before exams are administered using demographic and
              behavioral habits.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2563EB] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#0B2A4A]">What-If Simulator</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Adjust study time, absences, and homework dedication in real-time to observe grade
              impacts.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2563EB] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#0B2A4A]">Batch CSV Upload</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Screen an entire classroom or school cohort with automated row-level error validation.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2563EB] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#0B2A4A]">Explainable Factors</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Transparent feature attribution calculates exact grade-point gains or penalties per
              attribute.
            </p>
          </Card>
        </div>
      </section>

      {/* 5. Top Drivers Preview */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block mb-1">
                Permutation Importance Preview
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B2A4A]">
                Primary Determinants of Student Success
              </h2>
            </div>
            <Link to="/models">
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All 15 Drivers
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {topDrivers.length > 0 ? (
              topDrivers.map((item, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-[#0B2A4A]">
                    <span>
                      {idx + 1}. {item.feature.toUpperCase()}
                    </span>
                    <span className="tabular-nums font-bold text-[#2563EB]">
                      {(item.importance * 100).toFixed(1)}% Relative Influence
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#EEF2FF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(Math.max((item.importance / (topDrivers[0]?.importance || 1)) * 100, 5), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#64748B]">Loading feature importances...</div>
            )}
          </div>
        </Card>
      </section>

      {/* 6. Call to Action Band */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="bg-[#0B2A4A] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl">
          <div className="max-w-xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to support your students?
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Run a single student diagnostic or screen an entire roster to spot risks early and
              deliver timely guidance.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/predict" className="w-full sm:w-auto">
                <Button size="lg" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                  Start Prediction Now
                </Button>
              </Link>
              <Link to="/batch" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg">
                  Upload Class CSV
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
