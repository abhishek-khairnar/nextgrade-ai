import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import clsx from 'clsx';

export interface ToastItem {
  id: string;
  type?: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: 'success' | 'error' | 'info', title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, message, type, title };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none"
        aria-live="assertive"
      >
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />,
            info: <Info className="w-5 h-5 text-[#2563EB] shrink-0" />,
          };

          return (
            <div
              key={toast.id}
              role="alert"
              className={clsx(
                'pointer-events-auto flex items-start gap-3 p-4 bg-white rounded-xl border border-[#E5E9F2] shadow-xl animate-in slide-in-from-bottom-5 duration-200 text-sm'
              )}
            >
              {icons[toast.type || 'info']}
              <div className="flex-1">
                {toast.title && <div className="font-semibold text-[#0B2A4A]">{toast.title}</div>}
                <div className="text-[#0F172A]">{toast.message}</div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss toast"
                className="text-[#64748B] hover:text-[#0B2A4A] p-0.5 rounded transition-colors focus-ring"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
