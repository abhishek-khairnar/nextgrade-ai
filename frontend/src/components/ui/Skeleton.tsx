import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  isColdStart?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, isColdStart = false, ...props }) => {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-xl bg-slate-200/80 animate-pulse',
        className
      )}
      {...props}
    >
      {isColdStart && (
        <div className="absolute inset-0 flex items-center justify-center p-3 bg-white/80 backdrop-blur-[2px] text-xs font-medium text-[#0B2A4A] gap-2 text-center animate-in fade-in">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />
          <span>Waking up the prediction service...</span>
        </div>
      )}
    </div>
  );
};

export const CardSkeleton: React.FC<{ isColdStart?: boolean; lines?: number }> = ({
  isColdStart = false,
  lines = 3,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E9F2] p-6 shadow-soft space-y-4">
      <Skeleton className="h-6 w-1/3" isColdStart={isColdStart} />
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
};
