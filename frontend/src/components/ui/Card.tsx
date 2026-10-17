import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: 'blue' | 'success' | 'warning' | 'danger' | 'none';
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, accent = 'none', hoverable = false, ...props }, ref) => {
    const accentBorder = {
      none: '',
      blue: 'border-l-4 border-l-[#2563EB]',
      success: 'border-l-4 border-l-[#059669]',
      warning: 'border-l-4 border-l-[#D97706]',
      danger: 'border-l-4 border-l-[#DC2626]',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'bg-white rounded-2xl border border-[#E5E9F2] shadow-soft overflow-hidden transition-all duration-200',
          hoverable && 'hover:shadow-soft-hover hover:border-[#CBD5E1]',
          accentBorder[accent],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
