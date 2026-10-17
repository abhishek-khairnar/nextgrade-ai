import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Search,
  Save,
  BarChart2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '@/lib/api';
import { AcademicMode, BatchPredictionResponse, RiskLevel } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { DistributionChart } from '@/components/charts/DistributionChart';

const RISK_COLORS = {
  Low: '#059669',
  Medium: '#D97706',
  High: '#DC2626',
};

export const Batch: React.FC = () => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<AcademicMode>('midterm');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<BatchPredictionResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [savingHistory, setSavingHistory] = useState<boolean>(false);

  React.useEffect(() => {
    document.title = 'Batch CSV Prediction | NextGrade AI';
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        showToast('Please select a valid CSV file (.csv)', 'error');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showToast('Please select a CSV file first', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.predictBatch(file, mode);
      setResponse(res);
      showToast(
        `Batch completed: ${res.accepted_rows} rows accepted, ${res.rejected_rows} rejected`,
        res.rejected_rows > 0 ? 'info' : 'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Batch prediction failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllToHistory = async () => {
    if (!response || response.results.length === 0) return;
    setSavingHistory(true);
    try {
      await api.saveBatchHistory(response.batch_id, response.results);
      showToast(`Saved ${response.results.length} predictions to History!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save to history', 'error');
    } finally {
      setSavingHistory(false);
    }
  };

  const downloadResultsCsv = () => {
    if (!response || response.results.length === 0) return;

    const headers = ['Row', 'Label', 'Subject', 'Predicted_G3', 'Pass_Expected', 'Pass_Probability', 'Risk_Level'];
    const rows = response.results.map((r) => [
      r.row_index,
      `"${r.label}"`,
      r.subject,
      r.predicted_g3.toFixed(1),
      r.predicted_pass ? 'Pass' : 'Fail',
      (r.pass_probability * 100).toFixed(0) + '%',
      r.risk_level,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nextgrade_batch_results_${response.batch_id.substring(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = response?.results.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || item.risk_level === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const donutData = response
    ? [
        { name: 'Low Risk', value: response.risk_summary.Low || 0, color: RISK_COLORS.Low },
        { name: 'Medium Risk', value: response.risk_summary.Medium || 0, color: RISK_COLORS.Medium },
        { name: 'High Risk', value: response.risk_summary.High || 0, color: RISK_COLORS.High },
      ].filter((d) => d.value > 0)
    : [];

  const histData = response?.grade_distribution.map((d) => ({
    name: `${d.range} pts`,
    count: d.count,
  }));

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E9F2]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2A4A] tracking-tight">
            Batch Class Prediction
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Upload CSV rosters (up to 1,000 students) for cohort-wide grade forecasting and risk screening.
          </p>
        </div>

        <a href={api.getBatchTemplateUrl()} download="nextgrade_template.csv">
          <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            Download CSV Template
          </Button>
        </a>
      </div>

      {/* Upload & Instructions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload Card (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B2A4A] uppercase tracking-wider">
                Select Prediction Mode:
              </span>
              <div className="flex items-center gap-2 p-1 bg-[#EEF2FF] rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode('midterm')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    mode === 'midterm' ? 'bg-[#0B2A4A] text-white shadow-sm' : 'text-[#64748B]'
                  }`}
                >
                  Mid-Term (With G1 &amp; G2)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('early')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    mode === 'early' ? 'bg-[#0B2A4A] text-white shadow-sm' : 'text-[#64748B]'
                  }`}
                >
                  Early Warning (No Exams)
                </button>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                isDragging
                  ? 'border-[#2563EB] bg-[#EEF2FF]'
                  : 'border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#EEF2FF]/40'
              }`}
            >
              <UploadCloud className="w-12 h-12 text-[#2563EB] mb-3" />
              <div className="font-bold text-sm text-[#0B2A4A] mb-1">
                {file ? file.name : 'Choose a file or drag & drop here'}
              </div>
              <p className="text-xs text-[#64748B] mb-4">
                Accepts .csv up to 2 MB (max 1,000 rows). Comma or semicolon delimited.
              </p>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="inline-flex items-center justify-center h-10 px-4 text-xs font-semibold rounded-xl bg-white border border-[#CBD5E1] text-[#0B2A4A] hover:bg-[#F1F5F9] shadow-sm transition-all">
                  Browse Local CSV
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#64748B]">
                {file ? `${(file.size / 1024).toFixed(1)} KB selected` : 'No file selected'}
              </span>
              <div className="flex items-center gap-2">
                {file && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setResponse(null);
                    }}
                  >
                    Clear
                  </Button>
                )}
                <Button
                  onClick={handleUpload}
                  loading={loading}
                  disabled={!file}
                  leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                >
                  Process Batch
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Instructions Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 space-y-3 bg-[#F8FAFC]">
            <h3 className="font-bold text-sm text-[#0B2A4A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              Batch Formatting Requirements
            </h3>
            <ul className="space-y-2 text-xs text-[#64748B] list-disc pl-4 leading-relaxed">
              <li>
                <strong>Header Row:</strong> Include <code className="text-[#0B2A4A]">studytime</code>,{' '}
                <code className="text-[#0B2A4A]">failures</code>,{' '}
                <code className="text-[#0B2A4A]">absences</code>.
              </li>
              <li>
                <strong>Mid-Term Mode:</strong> Requires columns <code className="text-[#0B2A4A]">G1</code> and{' '}
                <code className="text-[#0B2A4A]">G2</code> (numeric scale 0 – 20).
              </li>
              <li>
                <strong>Early Warning Mode:</strong> Omit G1 and G2 for pre-exam cohort diagnosis.
              </li>
              <li>
                <strong>Missing Demographic Fields:</strong> Unfilled attributes default to dataset
                median/mode values automatically.
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Validation Summary & Results */}
      {response && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 border-l-4 border-l-[#2563EB]">
              <span className="text-xs text-[#64748B] font-medium block">Total Rows Processed</span>
              <span className="text-2xl font-extrabold text-[#0B2A4A] tabular-nums">
                {response.total_rows}
              </span>
            </Card>

            <Card className="p-4 border-l-4 border-l-[#059669]">
              <span className="text-xs text-[#64748B] font-medium block">Accepted Rows</span>
              <span className="text-2xl font-extrabold text-[#059669] tabular-nums">
                {response.accepted_rows}
              </span>
            </Card>

            <Card className="p-4 border-l-4 border-l-[#DC2626]">
              <span className="text-xs text-[#64748B] font-medium block">Rejected Rows</span>
              <span className="text-2xl font-extrabold text-[#DC2626] tabular-nums">
                {response.rejected_rows}
              </span>
            </Card>
          </div>

          {/* Rejected Details (if any) */}
          {response.rejected_rows > 0 && (
            <Card accent="danger" className="p-4 sm:p-5">
              <div className="flex items-center gap-2 font-bold text-xs text-[#DC2626] mb-3">
                <AlertTriangle className="w-4 h-4" />
                <span>Rejected Rows Notice:</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 text-xs text-[#64748B]">
                {response.rejected_details.map((rej, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-bold text-[#DC2626]">Row {rej.row}:</span>
                    <span>{rej.reason}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Charts Row: Risk Donut & Grade Histogram */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5 p-6">
              <h3 className="font-bold text-sm text-[#0B2A4A] mb-4">Cohort Risk Distribution</h3>
              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center gap-4 text-xs font-semibold pt-2">
                <span className="flex items-center gap-1.5 text-[#059669]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" /> Low ({response.risk_summary.Low || 0})
                </span>
                <span className="flex items-center gap-1.5 text-[#D97706]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> Med ({response.risk_summary.Medium || 0})
                </span>
                <span className="flex items-center gap-1.5 text-[#DC2626]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /> High ({response.risk_summary.High || 0})
                </span>
              </div>
            </Card>

            <Card className="lg:col-span-7 p-6">
              <h3 className="font-bold text-sm text-[#0B2A4A] mb-4">Predicted Final Grade Histogram</h3>
              {histData && <DistributionChart data={histData} />}
            </Card>
          </div>

          {/* Results Table Section */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search label or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 pl-9 pr-3 text-xs bg-white border border-[#E5E9F2] rounded-xl focus-ring w-48 sm:w-64"
                  />
                </div>

                {/* Risk Filter */}
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="h-9 px-3 text-xs bg-white border border-[#E5E9F2] rounded-xl focus-ring font-medium"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="Low">Low Risk Only</option>
                  <option value="Medium">Medium Risk Only</option>
                  <option value="High">High Risk Only</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={downloadResultsCsv}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download CSV
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveAllToHistory}
                  loading={savingHistory}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save All to History
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E9F2] text-[#64748B] font-semibold">
                    <th className="py-2.5 px-3">Row</th>
                    <th className="py-2.5 px-3">Student Label</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Predicted G3</th>
                    <th className="py-2.5 px-3">Pass Outcome</th>
                    <th className="py-2.5 px-3">Pass Probability</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E9F2]">
                  {filteredResults && filteredResults.length > 0 ? (
                    filteredResults.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#64748B] tabular-nums">
                          {item.row_index}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#0B2A4A]">{item.label}</td>
                        <td className="py-3 px-3 capitalize text-[#0F172A]">{item.subject}</td>
                        <td className="py-3 px-3 font-extrabold text-[#0B2A4A] tabular-nums">
                          {item.predicted_g3.toFixed(1)} / 20
                        </td>
                        <td className="py-3 px-3">
                          <Chip variant={item.predicted_pass ? 'pass' : 'fail'} size="sm">
                            {item.predicted_pass ? 'Pass' : 'Fail'}
                          </Chip>
                        </td>
                        <td className="py-3 px-3 font-medium tabular-nums text-[#0B2A4A]">
                          {(item.pass_probability * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-3">
                          <Chip variant="risk" riskLevel={item.risk_level} size="sm">
                            {item.risk_level}
                          </Chip>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#64748B]">
                        No matching student records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
