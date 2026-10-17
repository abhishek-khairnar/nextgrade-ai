import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const repoUrl = import.meta.env.VITE_REPO_URL;
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const apiDocsUrl = `${apiUrl}/docs`;

  return (
    <footer className="bg-white border-t border-[#E5E9F2] text-sm text-[#64748B] mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0B2A4A] flex items-center justify-center relative shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] absolute top-1 left-1" />
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M17 7H9M17 7V15" />
                </svg>
              </div>
              <span className="font-heading font-extrabold text-xl text-[#0B2A4A] tracking-tight">
                NextGrade <span className="text-[#2563EB]">AI</span>
              </span>
            </Link>

            <p className="text-sm text-[#0F172A] font-medium max-w-sm">
              Predict the next grade, while there is still time to help.
            </p>
            <p className="text-xs text-[#64748B]">
              Built for the AI &amp; ML Virtual Internship, Task 2 (Student Performance Prediction).
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <div className="font-semibold text-xs text-[#0B2A4A] uppercase tracking-wider">Product</div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/predict" className="hover:text-[#2563EB] transition-colors">
                  Single Predictor
                </Link>
              </li>
              <li>
                <Link to="/batch" className="hover:text-[#2563EB] transition-colors">
                  Batch Predict (CSV)
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#2563EB] transition-colors">
                  Prediction History
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn Links */}
          <div className="space-y-3">
            <div className="font-semibold text-xs text-[#0B2A4A] uppercase tracking-wider">Research</div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/insights" className="hover:text-[#2563EB] transition-colors">
                  Data Insights (EDA)
                </Link>
              </li>
              <li>
                <Link to="/models" className="hover:text-[#2563EB] transition-colors">
                  Model Lab &amp; Tuning
                </Link>
              </li>
              <li>
                <a
                  href="/about#methodology"
                  className="hover:text-[#2563EB] transition-colors"
                >
                  Methodology
                </a>
              </li>
            </ul>
          </div>

          {/* Project Links */}
          <div className="space-y-3">
            <div className="font-semibold text-xs text-[#0B2A4A] uppercase tracking-wider">Project</div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-[#2563EB] transition-colors">
                  About &amp; Ethics
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#2563EB] transition-colors">
                  Privacy &amp; Data Use
                </Link>
              </li>
              <li>
                <a
                  href={apiDocsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#2563EB] transition-colors"
                >
                  <span>API Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              {repoUrl && (
                <li>
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-[#2563EB] transition-colors"
                  >
                    <span>Source Code</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-[#E5E9F2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div>
            &copy; {currentYear} <span className="font-semibold text-[#0B2A4A]">NextGrade AI</span>. All rights reserved.
          </div>
          <div className="bg-[#EEF2FF] text-[#0B2A4A] font-medium px-3 py-1 rounded-full border border-[#BFDBFE]">
            Predictions are decision support only. Not a final judgment on any student.
          </div>
        </div>
      </div>
    </footer>
  );
};
