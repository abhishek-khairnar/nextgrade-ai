import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/predict', label: 'Predict' },
  { to: '/batch', label: 'Batch Predict' },
  { to: '/insights', label: 'Data Insights' },
  { to: '/models', label: 'Model Lab' },
  { to: '/history', label: 'History' },
  { to: '/about', label: 'About & Methodology' },
];

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const firstFocusable = menuRef.current?.querySelector<HTMLElement>('button, a');
      firstFocusable?.focus();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();

      if (e.key === 'Tab' && menuRef.current) {
        const focusables = menuRef.current.querySelectorAll<HTMLElement>('button, a');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B2A4A]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over drawer */}
      <div
        ref={menuRef}
        className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E9F2]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B2A4A] flex items-center justify-center relative shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] absolute top-1 left-1" />
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H9M17 7V15" />
                </svg>
              </div>
              <span className="font-heading font-bold text-lg text-[#0B2A4A]">NextGrade <span className="text-[#2563EB]">AI</span></span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="p-2 rounded-lg text-[#64748B] hover:text-[#0B2A4A] hover:bg-[#EEF2FF] focus-ring"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#EEF2FF] text-[#0B2A4A] font-bold border-l-4 border-l-[#2563EB]'
                      : 'text-[#64748B] hover:text-[#0B2A4A] hover:bg-[#F8FAFC]'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom CTA */}
        <div className="pt-4 border-t border-[#E5E9F2]">
          <NavLink to="/predict" onClick={onClose}>
            <Button fullWidth leftIcon={<Sparkles className="w-4 h-4" />}>
              Predict Now
            </Button>
          </NavLink>
        </div>
      </div>
    </div>
  );
};
