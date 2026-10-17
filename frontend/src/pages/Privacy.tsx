import React, { useEffect } from 'react';
import { ShieldCheck, Lock, EyeOff, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export const Privacy: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy & Data Use | NextGrade AI';
  }, []);

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-8">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-[#E5E9F2]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D1FAE5] text-[#059669] text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Student Privacy &amp; Data Ethics</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#0B2A4A] tracking-tight">
          Privacy Policy &amp; Data Governance
        </h1>
        <p className="text-sm text-[#64748B] leading-relaxed">
          NextGrade AI is designed in strict accordance with educational privacy standards and data minimization principles.
        </p>
      </div>

      {/* Grid of Key Commitments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2563EB] flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#0B2A4A]">Zero PII Stored</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            The platform never requests or records Personally Identifiable Information (PII) such as
            student legal names, social security numbers, birthdates, or contact details.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2563EB] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#0B2A4A]">Local &amp; Isolated Storage</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Prediction inputs and generated scores are persisted solely in the local SQLite database
            instance for your session's historical auditing.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2563EB] flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#0B2A4A]">Full Data Erasure</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Educators and administrators retain complete control over recorded predictions. You may
            delete individual student records or clear the entire history log with a single click.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2563EB] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#0B2A4A]">Zero Third-Party Trackers</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            We utilize no advertising pixels, behavioral trackers, or external marketing telemetry.
            Your academic queries remain confidential.
          </p>
        </Card>
      </div>

      {/* Educational Use Disclaimer */}
      <Card accent="blue" className="p-6 space-y-3 bg-[#F8FAFC]">
        <h3 className="font-bold text-sm text-[#0B2A4A]">Responsible Decision Support</h3>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Predictions are provided strictly as decision-support heuristics to assist educators in
          identifying students who may benefit from academic support. Models should never be
          utilized as the sole determinant for grading, academic promotion, or punitive measures.
        </p>
      </Card>
    </div>
  );
};
