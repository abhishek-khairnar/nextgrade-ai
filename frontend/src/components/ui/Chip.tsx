import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import clsx from 'clsx';
import { RiskLevel } from '@/lib/types';
import { getRiskBadgeConfig } from '@/lib/format';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'risk' | 'pass' | 'fail' | 'mode' | 'neutral';
  riskLevel?: RiskLevel | string;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  className,
  variant = 'neutral',
  riskLevel = 'Low',
  size = 'md',
  icon,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1 font-medium',
    md: 'text-xs px-3 py-1 gap-1.5 font-semibold',
  };

  if (variant === 'risk') {
    const config = getRiskBadgeConfig(riskLevel);
    const RiskIcon =
      riskLevel === 'High'
        ? AlertCircle
        : riskLevel === 'Medium'
        ? AlertTriangle
        : CheckCircle;

    return (
      <span
        className={clsx(
          'inline-flex items-center rounded-full border',
          sizeClasses[size],
          config.bg,
          config.text,
          config.border,
          className
        )}
        {...props}
      >
        {icon || <RiskIcon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
        <span>{children || config.label}</span>
      </span>
    );
  }

  if (variant === 'pass') {
    return (
      <span
        className={clsx(
          'inline-flex items-center rounded-full border bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {icon || <CheckCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
        <span>{children || 'Pass'}</span>
      </span>
    );
  }

  if (variant === 'fail') {
    return (
      <span
        className={clsx(
          'inline-flex items-center rounded-full border bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {icon || <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
        <span>{children || 'Fail'}</span>
      </span>
    );
  }

  if (variant === 'mode') {
    return (
      <span
        className={clsx(
          'inline-flex items-center rounded-full border bg-[#EEF2FF] text-[#2563EB] border-[#BFDBFE]',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {icon || <Info className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
        <span>{children}</span>
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
};
