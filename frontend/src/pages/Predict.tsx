import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sparkles,
  RotateCcw,
  UserCheck,
  Copy,
  Printer,
  ChevronDown,
  ChevronUp,
  Sliders,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  Info,
} from 'lucide-react';
import { api } from '@/lib/api';
import { predictFormSchema, PredictFormSchemaType } from '@/lib/schemas';
import { AcademicMode, PredictResponse, SchemaMetadata } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { Gauge } from '@/components/charts/Gauge';
import { FactorBars } from '@/components/charts/FactorBars';

function computeInputsHash(values: Record<string, any>, m: AcademicMode): string {
  const primaryKeys = [
    'subject',
    'studytime',
    'failures',
    'absences',
    'higher',
    'schoolsup',
    'school',
    'sex',
    'age',
    'address',
    'famsize',
    'Pstatus',
    'Medu',
    'Fedu',
    'Mjob',
    'Fjob',
    'reason',
    'guardian',
    'traveltime',
    'famsup',
    'paid',
    'activities',
    'nursery',
    'internet',
    'romantic',
    'famrel',
    'freetime',
    'goout',
    'Dalc',
    'Walc',
    'health',
  ];
  if (m === 'midterm') {
    primaryKeys.push('G1', 'G2');
  }
  return primaryKeys
    .map((k) => {
      const v = values[k];
      return `${k}:${v !== undefined && v !== null ? String(v).trim() : ''}`;
    })
    .join(';');
}

export const Predict: React.FC = () => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<AcademicMode>('midterm');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [meta, setMeta] = useState<SchemaMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [resultInputHash, setResultInputHash] = useState<string>('');
  const [basePrediction, setBasePrediction] = useState<number | null>(null);
  const isSubmittingRef = useRef(false);

  // What-if simulator state
  const [simStudytime, setSimStudytime] = useState<number>(2);
  const [simAbsences, setSimAbsences] = useState<number>(4);
  const [simFailures, setSimFailures] = useState<number>(0);
  const [simDelta, setSimDelta] = useState<number | null>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);

  const debouncedSimStudy = useDebounce(simStudytime, 400);
  const debouncedSimAbsences = useDebounce(simAbsences, 400);
  const debouncedSimFailures = useDebounce(simFailures, 400);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<PredictFormSchemaType>({
    mode: 'onChange',
    resolver: zodResolver(predictFormSchema),
    defaultValues: {
      mode: 'midterm',
      subject: 'math',
      studytime: 2,
      failures: 0,
      absences: 4,
      higher: 1,
      schoolsup: 0,
      G1: 11,
      G2: 12,
      school: 'GP',
      sex: 'F',
      age: 17,
      address: 'U',
      famsize: 'GT3',
      Pstatus: 'T',
      Medu: 2,
      Fedu: 2,
      Mjob: 'other',
      Fjob: 'other',
      reason: 'course',
      guardian: 'mother',
      traveltime: 1,
      famsup: 1,
      paid: 0,
      activities: 1,
      nursery: 1,
      internet: 1,
      romantic: 0,
      famrel: 4,
      freetime: 3,
      goout: 3,
      Dalc: 1,
      Walc: 1,
      health: 3,
    },
  });

  const currentValues = watch();
  const currentInputHash = result ? computeInputsHash(currentValues, result.mode) : '';
  const isStale = Boolean(result && resultInputHash && currentInputHash !== resultInputHash);

  useEffect(() => {
    document.title = 'Student Grade Prediction | NextGrade AI';

    api.getMeta().then((res) => {
      setMeta(res);
    });
  }, []);

  const handleModeChange = (newMode: AcademicMode) => {
    if (newMode !== mode) {
      setMode(newMode);
      setValue('mode', newMode);
      setResult(null);
      setResultInputHash('');
      setBasePrediction(null);
      setSimDelta(null);
    }
  };

  const loadExample = (type: 'at_risk' | 'average' | 'high_achiever') => {
    if (!meta?.examples?.[type]) return;
    const example = meta.examples[type];
    reset(example as any);
    setMode(example.mode);
    setValue('mode', example.mode);
    setSimStudytime(example.studytime);
    setSimAbsences(example.absences);
    setSimFailures(example.failures);
    handleFormSubmit(example as any);
  };

  const handleFormSubmit = async (values: PredictFormSchemaType) => {
    if (loading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);
    try {
      const payload: any = { ...values, save: true };
      if (mode === 'early') {
        delete payload.G1;
        delete payload.G2;
      }
      const resp = await api.predict(payload);
      setResult(resp);
      setResultInputHash(computeInputsHash(values, resp.mode));
      setBasePrediction(resp.predicted_g3);
      setSimStudytime(values.studytime);
      setSimAbsences(values.absences);
      setSimFailures(values.failures);
      setSimDelta(0);
      showToast('Prediction generated and auto-saved to History!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate prediction', 'error');
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Run What-If simulator on debounced values
  useEffect(() => {
    if (!result || basePrediction === null) return;

    // Check if what-if parameters actually changed from base
    const currentVals = watch();
    if (
      debouncedSimStudy === currentVals.studytime &&
      debouncedSimAbsences === currentVals.absences &&
      debouncedSimFailures === currentVals.failures
    ) {
      setSimDelta(0);
      return;
    }

    setSimLoading(true);
    const simPayload: any = {
      ...currentVals,
      mode: result.mode, // Use result's mode for consistency
      studytime: debouncedSimStudy,
      absences: debouncedSimAbsences,
      failures: debouncedSimFailures,
      save: false, // What-if calls must not auto-save to history
    };
    if (result.mode === 'early') {
      delete simPayload.G1;
      delete simPayload.G2;
    }

    api
      .predict(simPayload)
      .then((res) => {
        const delta = Math.round((res.predicted_g3 - basePrediction) * 10) / 10;
        setSimDelta(delta);
      })
      .catch((e) => console.error('Sim error', e))
      .finally(() => setSimLoading(false));
  }, [debouncedSimStudy, debouncedSimAbsences, debouncedSimFailures, basePrediction, result?.mode]);


  const copySummary = () => {
    if (!result) return;
    const summaryText = `NextGrade AI Prediction Summary:
- Mode: ${result.mode.toUpperCase()}
- Predicted Final Grade (G3): ${result.predicted_g3} / 20
- Pass Expectation: ${result.predicted_pass ? 'Pass' : 'Fail'} (${(result.pass_probability * 100).toFixed(0)}% probability)
- Risk Level: ${result.risk_level}
- Top Factor: ${result.factors[0]?.label || 'Standard'} (${result.factors[0]?.impact > 0 ? '+' : ''}${result.factors[0]?.impact || 0} pts)
- Actionable Advice: ${result.suggestions.join('; ')}
(Decision support only. NextGrade AI)`;

    navigator.clipboard.writeText(summaryText);
    showToast('Prediction summary copied to clipboard!', 'info');
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E9F2]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2A4A] tracking-tight">
            Student Performance Predictor
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Predict final course outcomes (G3), diagnose risk factors, and simulate remedial interventions.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 p-1.5 bg-[#EEF2FF] border border-[#BFDBFE] rounded-2xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => handleModeChange('early')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'early'
                ? 'bg-[#0B2A4A] text-white shadow-sm'
                : 'text-[#0B2A4A] hover:bg-white/60'
            }`}
          >
            Early Warning (No Exams)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('midterm')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'midterm'
                ? 'bg-[#0B2A4A] text-white shadow-sm'
                : 'text-[#0B2A4A] hover:bg-white/60'
            }`}
          >
            Mid-Term (With G1 &amp; G2)
          </button>
        </div>
      </div>

      {/* Main 60 / 40 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column (60% -> 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6">
            {/* Quick Actions & Examples */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-[#E5E9F2]">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Load Student Preset:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadExample('at_risk')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] hover:bg-[#FCA5A5] transition-colors"
                >
                  At-Risk Student
                </button>
                <button
                  type="button"
                  onClick={() => loadExample('average')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] hover:bg-[#FCD34D] transition-colors"
                >
                  Average Trajectory
                </button>
                <button
                  type="button"
                  onClick={() => loadExample('high_achiever')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] hover:bg-[#6EE7B7] transition-colors"
                >
                  High Achiever
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Primary Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Academic Subject" htmlFor="subject" required error={errors.subject?.message}>
                  <select
                    id="subject"
                    {...register('subject')}
                    className="h-11 px-3 text-sm bg-white border border-[#E5E9F2] rounded-xl focus-ring text-[#0F172A]"
                  >
                    <option value="math">Mathematics (student-mat)</option>
                    <option value="portuguese">Portuguese Language (student-por)</option>
                  </select>
                </Field>

                <Field
                  label="Student Label (Optional)"
                  htmlFor="label"
                  helperText="Identify record in History"
                >
                  <input
                    id="label"
                    type="text"
                    placeholder="e.g. Jane Doe - Grade 11"
                    {...register('label')}
                    className="h-11 px-3 text-sm bg-white border border-[#E5E9F2] rounded-xl focus-ring text-[#0F172A]"
                  />
                </Field>

                <Field
                  label="Weekly Study Time"
                  htmlFor="studytime"
                  required
                  error={errors.studytime?.message}
                  helperText="Self-study hours outside class"
                >
                  <select
                    id="studytime"
                    {...register('studytime')}
                    className="h-11 px-3 text-sm bg-white border border-[#E5E9F2] rounded-xl focus-ring text-[#0F172A]"
                  >
                    <option value="1">Level 1 (&lt; 2 hours / week)</option>
                    <option value="2">Level 2 (2 to 5 hours / week)</option>
                    <option value="3">Level 3 (5 to 10 hours / week)</option>
                    <option value="4">Level 4 (&gt; 10 hours / week)</option>
                  </select>
                </Field>

                <Field
                  label="Past Class Failures"
                  htmlFor="failures"
                  required
                  error={errors.failures?.message}
                  helperText="Past subject course failures"
                >
                  <select
                    id="failures"
                    {...register('failures')}
                    className="h-11 px-3 text-sm bg-white border border-[#E5E9F2] rounded-xl focus-ring text-[#0F172A]"
                  >
                    <option value="0">0 past failures (clean standing)</option>
                    <option value="1">1 failure</option>
                    <option value="2">2 failures</option>
                    <option value="3">3 failures</option>
                    <option value="4">4+ failures (high risk)</option>
                  </select>
                </Field>

                <Field
                  label="School Absences (0 - 93)"
                  htmlFor="absences"
                  required
                  error={errors.absences?.message}
                  helperText="Days missed in semester"
                >
                  <input
                    id="absences"
                    type="number"
                    min="0"
                    max="93"
                    {...register('absences')}
                    className="h-11 px-3 text-sm bg-white border border-[#E5E9F2] rounded-xl focus-ring text-[#0F172A]"
                  />
                </Field>

                <Field label="Desire for Higher Education" htmlFor="higher" required>
                  <select
                    id="higher"
                    {...register('higher')}
                    className="h-11 px-3 text-sm bg-white border border-[#E5E9F2] rounded-xl focus-ring text-[#0F172A]"
                  >
                    <option value="1">Yes (Aims for college / university)</option>
                    <option value="0">No</option>
                  </select>
                </Field>
              </div>

              {/* Conditional Mid-Term Required Grades */}
              {mode === 'midterm' ? (
                <div className="p-4 bg-[#EEF2FF] border border-[#BFDBFE] rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0B2A4A]">
                    <Sparkles className="w-4 h-4 text-[#2563EB]" />
                    <span>Mid-Term Examination Grades (Scale 0 – 20)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Term 1 Grade (G1: 0 - 20)"
                      htmlFor="G1"
                      required
                      error={errors.G1?.message}
                      helperText="First period recorded mark"
                    >
                      <input
                        id="G1"
                        type="number"
                        min="0"
                        max="20"
                        {...register('G1')}
                        className="h-11 px-3 text-sm bg-white border border-[#E5E9F2] rounded-xl focus-ring text-[#0F172A]"
                      />
                    </Field>

                    <Field
                      label="Term 2 Grade (G2: 0 - 20)"
                      htmlFor="G2"
                      required
                      error={errors.G2?.message}
                      helperText="Second period recorded mark"
                    >
                      <input
                        id="G2"
                        type="number"
                        min="0"
                        max="20"
                        {...register('G2')}
                        className="h-11 px-3 text-sm bg-white border border-[#E5E9F2] rounded-xl focus-ring text-[#0F172A]"
                      />
                    </Field>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-2 text-xs text-[#64748B]">
                  <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span>
                    Early Warning mode is active. Period grades G1 and G2 are excluded to simulate
                    pre-exam screening.
                  </span>
                </div>
              )}

              {/* Advanced Attributes Collapsible Section */}
              <div className="pt-2 border-t border-[#E5E9F2]">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full py-2 text-xs font-bold text-[#0B2A4A] hover:text-[#2563EB] transition-colors"
                >
                  <span>
                    {showAdvanced ? 'Hide Advanced Attributes' : 'Show All Demographic & Lifestyle Fields (24 additional attributes)'}
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <p className="text-[11px] text-[#64748B]">
                  Unspecified advanced fields automatically adopt UCI dataset median/mode baselines.
                </p>

                {showAdvanced && (
                  <div className="mt-4 space-y-6 pt-3 border-t border-dashed border-[#CBD5E1] animate-in fade-in duration-200">
                    {/* Personal Group */}
                    <div>
                      <h4 className="text-xs font-bold text-[#0B2A4A] uppercase tracking-wider mb-2.5">
                        Personal &amp; Demographics
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field label="School" htmlFor="school">
                          <select id="school" {...register('school')} className="h-9 px-2 text-xs bg-white border rounded-lg">
                            <option value="GP">Gabriel Pereira (GP)</option>
                            <option value="MS">Mousinho da Silveira (MS)</option>
                          </select>
                        </Field>
                        <Field label="Sex" htmlFor="sex">
                          <select id="sex" {...register('sex')} className="h-9 px-2 text-xs bg-white border rounded-lg">
                            <option value="F">Female (F)</option>
                            <option value="M">Male (M)</option>
                          </select>
                        </Field>
                        <Field label="Age" htmlFor="age">
                          <input id="age" type="number" min="15" max="22" {...register('age')} className="h-9 px-2 text-xs bg-white border rounded-lg" />
                        </Field>
                      </div>
                    </div>

                    {/* Family Group */}
                    <div>
                      <h4 className="text-xs font-bold text-[#0B2A4A] uppercase tracking-wider mb-2.5">
                        Family Background
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field label="Mother Edu (0-4)" htmlFor="Medu">
                          <input id="Medu" type="number" min="0" max="4" {...register('Medu')} className="h-9 px-2 text-xs bg-white border rounded-lg" />
                        </Field>
                        <Field label="Father Edu (0-4)" htmlFor="Fedu">
                          <input id="Fedu" type="number" min="0" max="4" {...register('Fedu')} className="h-9 px-2 text-xs bg-white border rounded-lg" />
                        </Field>
                        <Field label="Family Relations (1-5)" htmlFor="famrel">
                          <input id="famrel" type="number" min="1" max="5" {...register('famrel')} className="h-9 px-2 text-xs bg-white border rounded-lg" />
                        </Field>
                      </div>
                    </div>

                    {/* Lifestyle Group */}
                    <div>
                      <h4 className="text-xs font-bold text-[#0B2A4A] uppercase tracking-wider mb-2.5">
                        Lifestyle &amp; Health
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <Field label="Free Time (1-5)" htmlFor="freetime">
                          <input id="freetime" type="number" min="1" max="5" {...register('freetime')} className="h-9 px-2 text-xs bg-white border rounded-lg" />
                        </Field>
                        <Field label="Go Out (1-5)" htmlFor="goout">
                          <input id="goout" type="number" min="1" max="5" {...register('goout')} className="h-9 px-2 text-xs bg-white border rounded-lg" />
                        </Field>
                        <Field label="Weekday Alcohol (1-5)" htmlFor="Dalc">
                          <input id="Dalc" type="number" min="1" max="5" {...register('Dalc')} className="h-9 px-2 text-xs bg-white border rounded-lg" />
                        </Field>
                        <Field label="Current Health (1-5)" htmlFor="health">
                          <input id="health" type="number" min="1" max="5" {...register('health')} className="h-9 px-2 text-xs bg-white border rounded-lg" />
                        </Field>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
                <Button type="submit" loading={loading} fullWidth leftIcon={<Sparkles className="w-4 h-4" />}>
                  Generate Prediction
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    reset();
                    showToast('Form fields reset to defaults', 'info');
                  }}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Sticky Result Column (40% -> 5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-[80px] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto pr-1">
          {result ? (
            <Card
              accent={result.risk_level === 'High' ? 'danger' : result.risk_level === 'Medium' ? 'warning' : 'success'}
              className={`p-6 space-y-6 transition-opacity duration-200 ${isStale ? 'opacity-80' : ''}`}
            >
              {/* Stale Result Banner */}
              {isStale && (
                <div
                  role="status"
                  className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 animate-in fade-in duration-150"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Inputs changed since this prediction. Generate again to update.</span>
                </div>
              )}

              {/* Header Status - always reads mode from result itself */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E9F2]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Predicted Outcome
                  </span>
                  <div className="text-xs font-semibold text-[#0B2A4A]">
                    Mode: {result.mode === 'midterm' ? 'Mid-Term Trajectory' : 'Early Warning Baseline'}
                  </div>
                </div>
                <Chip variant="risk" riskLevel={result.risk_level}>
                  {result.risk_level} Risk
                </Chip>
              </div>

              {/* Gauge Display */}
              <div className="flex flex-col items-center">
                <Gauge value={result.predicted_g3} confidenceRange={result.confidence_range} />
              </div>

              {/* Outcome Badge Row with Borderline Note */}
              <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-[#64748B] font-medium">Pass Probability</div>
                    <div className="text-base font-extrabold text-[#0B2A4A] tabular-nums">
                      {Math.round(result.pass_probability * 100)}%
                    </div>
                  </div>
                  <Chip variant={result.predicted_pass ? 'pass' : 'fail'}>
                    {result.predicted_pass ? 'Passing Expected' : 'Failing Expected'}
                  </Chip>
                </div>

                {/* Borderline note or model disagreement */}
                {result.borderline_note && (
                  <div className="flex items-start gap-2 pt-2 border-t border-[#E2E8F0] text-[11px] text-amber-900 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{result.borderline_note}</span>
                  </div>
                )}
              </div>

              {/* Factor Contribution Bars */}
              <div className="space-y-2 pt-2 border-t border-[#E5E9F2]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B2A4A]">Dominant Factor Impacts</span>
                  <span className="text-[10px] text-[#64748B]">vs Median Baseline</span>
                </div>
                <FactorBars factors={result.factors} />
              </div>

              {/* Remedial Recommendations */}
              <div className="space-y-2 pt-2 border-t border-[#E5E9F2]">
                <span className="text-xs font-bold text-[#0B2A4A] block">
                  Actionable Recommendations:
                </span>
                <ul className="space-y-1.5 text-xs text-[#0F172A]">
                  {result.suggestions.map((sug, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-[#E5E9F2]">
                <Button variant="secondary" size="sm" fullWidth onClick={copySummary} leftIcon={<Copy className="w-3.5 h-3.5" />}>
                  Copy Summary
                </Button>
                <Button variant="secondary" size="sm" fullWidth onClick={() => window.print()} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                  Print
                </Button>
              </div>

              {/* Interactive What-If Simulator */}
              <div className="p-4 bg-[#EEF2FF] border border-[#BFDBFE] rounded-2xl space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#0B2A4A]">
                    <Sliders className="w-4 h-4 text-[#2563EB]" />
                    <span>What-If Intervention Simulator</span>
                  </div>
                  {simLoading ? (
                    <span className="text-[10px] text-[#64748B]">Simulating...</span>
                  ) : simDelta !== null && simDelta !== 0 ? (
                    <span
                      className={`text-xs font-extrabold tabular-nums px-2 py-0.5 rounded-full ${
                        simDelta > 0
                          ? 'bg-[#D1FAE5] text-[#059669]'
                          : 'bg-[#FEE2E2] text-[#DC2626]'
                      }`}
                    >
                      {simDelta > 0 ? `+${simDelta.toFixed(1)}` : simDelta.toFixed(1)} pts
                    </span>
                  ) : null}
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1 font-medium text-[#0B2A4A]">
                      <span>Study Time:</span>
                      <span className="font-bold">Level {simStudytime}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={simStudytime}
                      onChange={(e) => setSimStudytime(Number(e.target.value))}
                      className="w-full accent-[#2563EB]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 font-medium text-[#0B2A4A]">
                      <span>Absences (Days):</span>
                      <span className="font-bold">{simAbsences} days</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={simAbsences}
                      onChange={(e) => setSimAbsences(Number(e.target.value))}
                      className="w-full accent-[#2563EB]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 font-medium text-[#0B2A4A]">
                      <span>Past Failures:</span>
                      <span className="font-bold">{simFailures}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="4"
                      value={simFailures}
                      onChange={(e) => setSimFailures(Number(e.target.value))}
                      className="w-full accent-[#2563EB]"
                    />
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-[#64748B] text-center italic">
                Decision support only. Not a final judgment on any student.
              </p>
            </Card>
          ) : (
            <Card className="p-8 text-center text-[#64748B] space-y-3 border-dashed">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center text-[#2563EB] mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#0B2A4A]">Your prediction will appear here</div>
                <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                  Adjust student indicators on the left and click &quot;Generate Prediction&quot; to see the forecast, risk level, and explanations.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
