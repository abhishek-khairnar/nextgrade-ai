import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import clsx from 'clsx';

export interface ToastItem {
  id: string;
  key: string;
  type?: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: 'success' | 'error' | 'info', title?: string, key?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const [remaining, setRemaining] = useState<number>(toast.duration || 4000);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const startRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    startRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, remaining);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPaused, remaining, onDismiss, toast.id]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    const elapsed = Date.now() - startRef.current;
    setRemaining((prev) => Math.max(prev - elapsed, 500));
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#2563EB] shrink-0" />,
  };

  return (
    <div
      role="status"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        'pointer-events-auto flex items-start gap-3 p-4 bg-white rounded-xl border border-[#E5E9F2] shadow-xl',
        'animate-in slide-in-from-bottom-5 duration-200 text-sm transition-transform hover:scale-[1.01]'
      )}
    >
      {icons[toast.type || 'info']}
      <div className="flex-1 pr-1">
        {toast.title && <div className="font-semibold text-[#0B2A4A]">{toast.title}</div>}
        <div className="text-[#0F172A] leading-snug">{toast.message}</div>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Close notification"
        className="text-[#64748B] hover:text-[#0B2A4A] p-1 rounded-md transition-colors focus-ring"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const recentKeysRef = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string, customKey?: string) => {
      const dedupeKey = customKey || `${type}:${title || ''}:${message}`;
      const now = Date.now();
      const lastSent = recentKeysRef.current.get(dedupeKey);

      // Deduplicate: ignore if same key triggered within 1.5s (1500ms)
      if (lastSent && now - lastSent < 1500) {
        return;
      }
      recentKeysRef.current.set(dedupeKey, now);

      // Clean up stale dedupe keys older than 10s
      if (recentKeysRef.current.size > 20) {
        recentKeysRef.current.forEach((timestamp, key) => {
          if (now - timestamp > 10000) {
            recentKeysRef.current.delete(key);
          }
        });
      }

      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = {
        id,
        key: dedupeKey,
        message,
        type,
        title,
        duration: 4000,
      };

      // Cap at most 3 visible toasts
      setToasts((prev) => {
        const next = [...prev, newToast];
        return next.length > 3 ? next.slice(next.length - 3) : next;
      });
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Container: bottom-right on desktop, bottom-center on mobile, z-toast (70) */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 sm:bottom-6 z-toast flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
