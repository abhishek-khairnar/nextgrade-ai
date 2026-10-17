import { RiskLevel } from './types';

export function formatGrade(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return `${val.toFixed(1)} / 20`;
}

export function formatPercent(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return `${(val * 100).toFixed(1)}%`;
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function getRiskBadgeConfig(risk: RiskLevel | string) {
  switch (risk) {
    case 'High':
      return {
        bg: 'bg-[#FEE2E2]',
        text: 'text-[#DC2626]',
        border: 'border-[#FECACA]',
        label: 'High Risk (< 10)',
        dot: 'bg-[#DC2626]',
      };
    case 'Medium':
      return {
        bg: 'bg-[#FEF3C7]',
        text: 'text-[#D97706]',
        border: 'border-[#FDE68A]',
        label: 'Medium Risk (10–13.9)',
        dot: 'bg-[#D97706]',
      };
    case 'Low':
    default:
      return {
        bg: 'bg-[#D1FAE5]',
        text: 'text-[#059669]',
        border: 'border-[#A7F3D0]',
        label: 'Low Risk (≥ 14)',
        dot: 'bg-[#059669]',
      };
  }
}

export function getPassBadgeConfig(isPass: number | boolean) {
  const pass = Boolean(isPass);
  if (pass) {
    return {
      bg: 'bg-[#D1FAE5]',
      text: 'text-[#059669]',
      border: 'border-[#A7F3D0]',
      label: 'Pass Expected',
    };
  }
  return {
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#DC2626]',
    border: 'border-[#FECACA]',
    label: 'At Risk of Failing',
  };
}
