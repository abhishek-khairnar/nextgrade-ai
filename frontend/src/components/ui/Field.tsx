import React from 'react';
import clsx from 'clsx';

export interface FieldProps {
  label: string;
  htmlFor?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  htmlFor,
  helperText,
  error,
  required,
  children,
  className,
}) => {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-xs font-semibold text-[#0B2A4A] tracking-tight">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      </div>

      {children}

      {error ? (
        <span className="text-xs text-[#DC2626] font-medium animate-in fade-in">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[#64748B]">{helperText}</span>
      ) : null}
    </div>
  );
};
