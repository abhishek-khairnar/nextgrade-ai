import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFound: React.FC = () => {
  useEffect(() => {
    document.title = 'Page Not Found | NextGrade AI';
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] text-[#2563EB] flex items-center justify-center font-extrabold text-2xl mb-6 shadow-sm border border-[#BFDBFE]">
        404
      </div>

      <h1 className="text-3xl font-extrabold text-[#0B2A4A] tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-[#64748B] max-w-md mb-8">
        The page you are looking for does not exist or has been relocated. Please check the URL or
        return to the prediction dashboard.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link to="/">
          <Button variant="secondary" leftIcon={<Home className="w-4 h-4" />}>
            Go Home
          </Button>
        </Link>
        <Link to="/predict">
          <Button leftIcon={<Sparkles className="w-4 h-4" />}>
            Open Predict
          </Button>
        </Link>
      </div>
    </div>
  );
};
