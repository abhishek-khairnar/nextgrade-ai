import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { MobileMenu } from './MobileMenu';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/predict', label: 'Predict' },
  { to: '/batch', label: 'Batch' },
  { to: '/insights', label: 'Insights' },
  { to: '/models', label: 'Model Lab' },
  { to: '/history', label: 'History' },
  { to: '/about', label: 'About' },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isPredictPage = location.pathname === '/predict';

  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-40 w-full transition-all duration-200 bg-white/95 backdrop-blur-md',
          isScrolled ? 'shadow-nav border-b border-[#E5E9F2]' : 'border-b border-transparent'
        )}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between lg:grid lg:grid-cols-[200px_1fr_200px] gap-4">
          {/* Column 1: Logo */}
          <div className="flex items-center justify-start">
            <NavLink
              to="/"
              className="flex items-center gap-2.5 focus-ring rounded-lg py-1 px-1.5 -ml-1.5"
              aria-label="NextGrade AI Home"
            >
              <div className="w-9 h-9 rounded-xl bg-[#0B2A4A] flex items-center justify-center relative shadow-sm shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] absolute top-1 left-1" />
                <svg
                  className="w-5 h-5 text-white"
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
              <span className="font-heading font-extrabold text-xl text-[#0B2A4A] tracking-tight whitespace-nowrap">
                NextGrade <span className="text-[#2563EB]">AI</span>
              </span>
            </NavLink>
          </div>

          {/* Column 2: Desktop Nav Links (Centered) */}
          <nav className="hidden lg:flex items-center justify-center gap-1.5" aria-label="Main Navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx(
                    'px-3.5 py-2 text-sm transition-all relative font-medium rounded-lg whitespace-nowrap',
                    isActive
                      ? 'text-[#0B2A4A] font-bold after:content-[""] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-[#2563EB]'
                      : 'text-[#64748B] hover:text-[#0B2A4A] hover:bg-[#EEF2FF]/60'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Column 3: Right Action Area (Fixed width reserved so links never shift) */}
          <div className="flex items-center justify-end gap-3">
            <div className={clsx('hidden sm:inline-flex', isPredictPage && 'invisible pointer-events-none')}>
              <NavLink to="/predict" tabIndex={isPredictPage ? -1 : 0}>
                <Button size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Predict Now
                </Button>
              </NavLink>
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#0B2A4A] hover:bg-[#EEF2FF] focus-ring"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};
