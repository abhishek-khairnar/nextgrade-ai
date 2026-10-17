import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-ring disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const sizeClasses = {
      sm: 'h-9 px-3.5 text-xs gap-1.5',
      md: 'h-12 px-5 text-sm gap-2',
      lg: 'h-14 px-7 text-base gap-2.5',
    };

    const variantClasses = {
      primary: 'bg-[#0B2A4A] text-white hover:bg-[#081F37] shadow-sm',
      secondary: 'bg-white text-[#0B2A4A] border border-[#E5E9F2] hover:bg-[#F8FAFC] shadow-sm',
      outline: 'bg-transparent text-[#0B2A4A] border border-[#0B2A4A] hover:bg-[#EEF2FF]',
      danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-sm',
      ghost: 'bg-transparent text-[#64748B] hover:text-[#0B2A4A] hover:bg-[#EEF2FF]/60',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
