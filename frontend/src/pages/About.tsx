import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BookOpen,
  Database,
  GitBranch,
  ShieldAlert,
  CheckCircle,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const About: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = 'About & Methodology | NextGrade AI';

    // Handle hash scrolling to #methodology
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const apiDocsUrl = `${import.meta.env.VITE_API_URL || ''}/docs`;

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-12">
      {/* 1. Project Goal */}
      <section className="space-y-4">
        <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
          Internship Task 2 Deliverable
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B2A4A] tracking-tight">
          NextGrade AI — Student Performance Prediction
        </h1>
        <p className="text-base text-[#64748B] leading-relaxed">
          NextGrade AI was engineered as an end-to-end Machine Learning web application designed to
          bridge the gap between educational data science and practical pedagogical intervention.
          By predicting final student outcomes early in the academic semester, educators can
          prescribe tailored remedial tutoring and attendance counseling while there is still
          sufficient time to alter trajectories.
        </p>
      </section>

      {/* 2. Dataset Attribution */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 font-bold text-xl text-[#0B2A4A]">
          <Database className="w-5 h-5 text-[#2563EB]" />
          <h2>Dataset Origin &amp; Citation</h2>
        </div>
        <Card className="p-6 space-y-3 bg-white">
          <p className="text-sm text-[#0F172A] leading-relaxed">
            The system utilizes the celebrated <strong>UCI Student Performance Data Set</strong>,
            collected from two Portuguese public secondary schools (Gabriel Pereira and Mousinho da
            Silveira) during the 2005–2006 academic year.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
            <div className="p-3 bg-[#EEF2FF] rounded-xl border border-[#BFDBFE]">
              <span className="text-[#64748B] block">Math Cohort (mat)</span>
              <span className="font-bold text-[#0B2A4A] text-sm">395 Students</span>
            </div>
            <div className="p-3 bg-[#EEF2FF] rounded-xl border border-[#BFDBFE]">
              <span className="text-[#64748B] block">Portuguese Cohort (por)</span>
              <span className="font-bold text-[#0B2A4A] text-sm">649 Students</span>
            </div>
            <div className="p-3 bg-[#EEF2FF] rounded-xl border border-[#BFDBFE]">
              <span className="text-[#64748B] block">Total Combined</span>
              <span className="font-bold text-[#0B2A4A] text-sm">1,044 Observations</span>
            </div>
          </div>
          <div className="p-3 bg-[#F8FAFC] border border-[#E5E9F2] rounded-xl text-xs text-[#64748B] italic">
            Citation: Cortez, P., &amp; Silva, A. (2008). <em>Using Data Mining to Predict Secondary
            School Student Performance</em>. Proceedings of 5th FUture BUsiness TEChnology Conference
            (FUBUTEC 2008), Porto, Portugal.
          </div>
        </Card>
      </section>

      {/* 3. Methodology & Workflow (id="methodology") */}
      <section id="methodology" className="space-y-6 pt-4 scroll-mt-24">
        <div className="flex items-center gap-2 font-bold text-xl text-[#0B2A4A]">
          <GitBranch className="w-5 h-5 text-[#2563EB]" />
          <h2>Methodology &amp; Architecture Workflow</h2>
        </div>

        {/* Workflow Diagram Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs">
          <div className="p-3 bg-white rounded-xl border border-[#E5E9F2] shadow-sm font-semibold text-[#0B2A4A]">
            1. Collect
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#E5E9F2] shadow-sm font-semibold text-[#0B2A4A]">
            2. Clean
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#E5E9F2] shadow-sm font-semibold text-[#0B2A4A]">
            3. Engineer
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#E5E9F2] shadow-sm font-semibold text-[#0B2A4A]">
            4. Train &amp; Tune
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#E5E9F2] shadow-sm font-semibold text-[#0B2A4A]">
            5. Evaluate
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#E5E9F2] shadow-sm font-semibold text-[#2563EB] bg-[#EEF2FF]">
            6. Serve API
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-[#0B2A4A]">Feature Engineering &amp; Preprocessing Details</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            All preprocessing operations are integrated inside an immutable scikit-learn{' '}
            <code className="text-[#0B2A4A]">Pipeline</code> with a{' '}
            <code className="text-[#0B2A4A]">ColumnTransformer</code>. Numerical features are imputed
            via median and standardized via <code className="text-[#0B2A4A]">StandardScaler</code>.
            Categorical columns are one-hot encoded with unknown handling ignored to prevent serving
            crashes.
          </p>
          <div className="space-y-2 text-xs">
            <div className="font-semibold text-[#0B2A4A]">Engineered Domain Metrics:</div>
            <ul className="list-disc pl-4 space-y-1 text-[#64748B]">
              <li>
                <strong>parent_edu_avg:</strong> Average of Mother’s and Father’s education capital
                levels.
              </li>
              <li>
                <strong>alcohol_avg:</strong> Weighted formula prioritizing weekday consumption:{' '}
                <code className="text-[#0B2A4A]">(Dalc * 5 + Walc * 2) / 7.0</code>.
              </li>
              <li>
                <strong>social_score:</strong> Composite average of free time and peer outing
                frequency.
              </li>
              <li>
                <strong>grade_trend:</strong> Momentum differential between Term 2 and Term 1 ({' '}
                <code className="text-[#0B2A4A]">G2 - G1</code>) in Mid-Term mode.
              </li>
            </ul>
          </div>
        </Card>
      </section>

      {/* 4. Limitations and Ethics */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 font-bold text-xl text-[#0B2A4A]">
          <ShieldAlert className="w-5 h-5 text-[#D97706]" />
          <h2>Limitations, Bias &amp; Ethical Considerations</h2>
        </div>
        <Card accent="warning" className="p-6 space-y-3">
          <p className="text-xs text-[#64748B] leading-relaxed">
            <strong>Decision Support, Not Human Verdict:</strong> Machine learning predictions are
            probabilistic estimates intended exclusively to assist educators in allocating
            support resources. They must never be utilized to restrict student opportunities,
            determine academic tracking, or penalize students.
          </p>
          <p className="text-xs text-[#64748B] leading-relaxed">
            <strong>Demographic Variables &amp; Proxy Risks:</strong> Attributes such as parental
            status or family size reflect socioeconomic realities rather than personal academic
            capability. Models are rigorously audited to prevent over-indexing on immutable
            background traits.
          </p>
          <p className="text-xs text-[#64748B] leading-relaxed">
            <strong>Sample Size &amp; Cultural Context:</strong> The dataset comprises 1,044 students
            within a specific Portuguese secondary school setting. Transferability to modern
            international curricula must be validated before large-scale district adoption.
          </p>
        </Card>
      </section>

      {/* 5. Testing Summary */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 font-bold text-xl text-[#0B2A4A]">
          <CheckCircle className="w-5 h-5 text-[#059669]" />
          <h2>Testing &amp; Quality Assurance</h2>
        </div>
        <Card className="p-6 space-y-3">
          <p className="text-xs text-[#64748B] leading-relaxed">
            NextGrade AI maintains automated unit, integration, and browser validation tests across
            the entire stack:
          </p>
          <ul className="text-xs text-[#64748B] space-y-1.5 list-disc pl-4">
            <li>
              <strong>pytest (Backend):</strong> 11 tests covering health, schema range assertions,
              mode requirements, batch validation, history persistence, and JSON serialization.
            </li>
            <li>
              <strong>Vitest &amp; RTL (Frontend):</strong> Component rendering, format utilities,
              and form validation.
            </li>
            <li>
              <strong>Browser Automation:</strong> Full multi-screen walkthrough verifying
              responsive layouts (320px–1440px), modal focus traps, and chart tooltips.
            </li>
          </ul>
        </Card>
      </section>

      {/* 6. Tech Stack & API Link */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 font-bold text-xl text-[#0B2A4A]">
          <Code2 className="w-5 h-5 text-[#2563EB]" />
          <h2>Technology Stack</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white rounded-xl border border-[#E5E9F2]">
            <span className="font-bold text-[#0B2A4A] block mb-1">ML Core</span>
            <span className="text-[#64748B]">Python 3.11, scikit-learn, pandas, joblib</span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[#E5E9F2]">
            <span className="font-bold text-[#0B2A4A] block mb-1">API Backend</span>
            <span className="text-[#64748B]">FastAPI, Pydantic v2, Uvicorn, SQLAlchemy</span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[#E5E9F2]">
            <span className="font-bold text-[#0B2A4A] block mb-1">Web UI</span>
            <span className="text-[#64748B]">React 18, Vite, TypeScript, Tailwind CSS 3</span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[#E5E9F2]">
            <span className="font-bold text-[#0B2A4A] block mb-1">Charts &amp; DB</span>
            <span className="text-[#64748B]">Recharts, Lucide Icons, SQLite 3</span>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <a href={apiDocsUrl} target="_blank" rel="noopener noreferrer">
            <Button leftIcon={<ExternalLink className="w-4 h-4" />}>Open Interactive API Docs (/docs)</Button>
          </a>
        </div>
      </section>
    </div>
  );
};
