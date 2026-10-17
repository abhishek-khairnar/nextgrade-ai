import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Download,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { HistoryItem, HistoryListResponse, RiskLevel } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { FactorBars } from '@/components/charts/FactorBars';
import { Gauge } from '@/components/charts/Gauge';

export const History: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<HistoryListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  // Detail drawer state
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  // Modal delete states
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState<boolean>(false);

  useEffect(() => {
    document.title = 'Prediction History | NextGrade AI';
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory({
        q: searchTerm || undefined,
        risk: riskFilter || undefined,
        page,
        page_size: 10,
      });
      setData(res);
    } catch (err) {
      console.error('History fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [searchTerm, riskFilter, page]);

  const confirmDeleteSingle = async () => {
    if (deleteId === null) return;
    try {
      await api.deleteHistoryItem(deleteId);
      showToast('Record deleted successfully', 'success');
      setDeleteId(null);
      if (selectedItem?.id === deleteId) {
        setSelectedItem(null);
      }
      fetchHistory();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete record', 'error');
    }
  };

  const confirmClearAll = async () => {
    try {
      const res = await api.clearAllHistory();
      showToast(`Cleared ${res.deleted_count} history records`, 'info');
      setIsClearAllModalOpen(false);
      setSelectedItem(null);
      fetchHistory();
    } catch (err: any) {
      showToast(err.message || 'Failed to clear history', 'error');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E9F2]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2A4A] tracking-tight">
            Prediction History
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Search, review, inspect factor contributions, and export past prediction records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {data && data.total > 0 && (
            <>
              <a href={api.getHistoryExportUrl()} download="nextgrade_history.csv">
                <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                  Export CSV
                </Button>
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClearAllModalOpen(true)}
                className="text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student label, subject, or mode..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-10 pl-9 pr-3 text-xs bg-white border border-[#E5E9F2] rounded-xl focus-ring w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 text-xs bg-white border border-[#E5E9F2] rounded-xl focus-ring font-medium"
            >
              <option value="">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results Content */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#64748B]">Loading prediction records...</div>
      ) : data && data.items.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop Table View (>= 640px) */}
          <div className="hidden sm:block">
            <Card className="overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E9F2] bg-[#F8FAFC] text-[#64748B] font-semibold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Student Label</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Predicted G3</th>
                    <th className="py-3 px-4">Outcome</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E9F2]">
                  {data.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#0B2A4A]">{item.label || '—'}</td>
                      <td className="py-3 px-4 capitalize text-[#0F172A]">{item.subject}</td>
                      <td className="py-3 px-4">
                        <Chip variant="mode" size="sm">
                          {item.mode === 'midterm' ? 'Mid-Term' : 'Early'}
                        </Chip>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-[#0B2A4A] tabular-nums">
                        {item.predicted_g3.toFixed(1)} / 20
                      </td>
                      <td className="py-3 px-4">
                        <Chip variant={item.predicted_pass ? 'pass' : 'fail'} size="sm">
                          {item.predicted_pass ? 'Pass' : 'Fail'}
                        </Chip>
                      </td>
                      <td className="py-3 px-4">
                        <Chip variant="risk" riskLevel={item.risk_level} size="sm">
                          {item.risk_level}
                        </Chip>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            aria-label="View prediction details"
                            className="p-1.5 rounded-lg text-[#2563EB] hover:bg-[#EEF2FF] transition-colors focus-ring"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(item.id)}
                            aria-label="Delete prediction"
                            className="p-1.5 rounded-lg text-[#DC2626] hover:bg-[#FEE2E2] transition-colors focus-ring"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Mobile Stacked Card View (< 640px) */}
          <div className="sm:hidden space-y-3">
            {data.items.map((item) => (
              <Card key={item.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#0B2A4A]">{item.label || 'Student'}</h4>
                    <span className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  <Chip variant="risk" riskLevel={item.risk_level} size="sm">
                    {item.risk_level}
                  </Chip>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E5E9F2]">
                  <div>
                    <span className="text-[#64748B] block">Predicted G3</span>
                    <span className="font-bold text-[#0B2A4A] text-sm tabular-nums">
                      {item.predicted_g3.toFixed(1)} / 20
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#64748B] block">Subject &amp; Mode</span>
                    <span className="font-medium text-[#0B2A4A] capitalize">
                      {item.subject} ({item.mode})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E9F2]">
                  <Button variant="secondary" size="sm" onClick={() => setSelectedItem(item)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteId(item.id)} className="text-[#DC2626] border-[#FECACA]">
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-between pt-4 text-xs text-[#64748B]">
              <div>
                Showing Page <span className="font-bold text-[#0B2A4A]">{data.page}</span> of{' '}
                <span className="font-bold text-[#0B2A4A]">{data.total_pages}</span> ({data.total} total)
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= data.total_pages}
                  onClick={() => setPage(page + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No Prediction Records Found"
          description="Generate your first student prediction to automatically save records into your permanent history log."
          actionText="Make a Prediction"
          onAction={() => (window.location.href = '/predict')}
          icon={<HistoryIcon className="w-7 h-7 text-[#2563EB]" />}
        />
      )}

      {/* Detail Slide-Over Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-[#0B2A4A]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedItem(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-[#E5E9F2]">
                  <div>
                    <h3 className="text-lg font-bold text-[#0B2A4A]">{selectedItem.label}</h3>
                    <span className="text-xs text-[#64748B]">{formatDate(selectedItem.created_at)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="p-1 rounded-lg text-[#64748B] hover:text-[#0B2A4A] hover:bg-[#EEF2FF]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Score & Gauge */}
                <div className="flex flex-col items-center p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                  <Gauge value={selectedItem.predicted_g3} />
                  <div className="flex items-center gap-2 mt-2">
                    <Chip variant="risk" riskLevel={selectedItem.risk_level}>
                      {selectedItem.risk_level} Risk
                    </Chip>
                    <Chip variant={selectedItem.predicted_pass ? 'pass' : 'fail'}>
                      {selectedItem.predicted_pass ? 'Passing Expected' : 'Failing Risk'}
                    </Chip>
                  </div>
                </div>

                {/* Dominant Factors */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#0B2A4A] uppercase tracking-wider block">
                    Driving Factors:
                  </span>
                  <FactorBars factors={selectedItem.factors} />
                </div>

                {/* Raw Input Attributes */}
                <div className="space-y-2 pt-2 border-t border-[#E5E9F2]">
                  <span className="text-xs font-bold text-[#0B2A4A] uppercase tracking-wider block">
                    Recorded Attributes:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(selectedItem.inputs)
                      .filter(([k]) => !['label', 'mode'].includes(k))
                      .slice(0, 10)
                      .map(([k, v]) => (
                        <div key={k} className="p-2 bg-[#F8FAFC] rounded-lg border border-[#E5E9F2]">
                          <span className="text-[#64748B] block text-[11px]">{k}</span>
                          <span className="font-bold text-[#0B2A4A]">{String(v)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-[#E5E9F2] flex items-center gap-3">
                <Button variant="secondary" fullWidth onClick={() => setSelectedItem(null)}>
                  Close
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => {
                    setDeleteId(selectedItem.id);
                  }}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Delete Record
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Confirmation Modal */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Prediction Record"
        description="Are you sure you want to permanently remove this record from history?"
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteSingle}>
            Yes, Delete Record
          </Button>
        </div>
      </Modal>

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        title="Clear Entire Prediction History"
        description="This action will delete all saved predictions and batch runs from the database. This cannot be undone."
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={() => setIsClearAllModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmClearAll}>
            Yes, Clear All History
          </Button>
        </div>
      </Modal>
    </div>
  );
};
