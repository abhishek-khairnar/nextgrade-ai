import { describe, it, expect } from 'vitest';
import { formatGrade, formatPercent, getRiskBadgeConfig, getPassBadgeConfig } from '../lib/format';

describe('format utilities', () => {
  it('formats grades with scale suffix', () => {
    expect(formatGrade(14.2)).toBe('14.2 / 20');
    expect(formatGrade(0)).toBe('0.0 / 20');
    expect(formatGrade(null)).toBe('—');
  });

  it('formats percentages accurately', () => {
    expect(formatPercent(0.852)).toBe('85.2%');
    expect(formatPercent(1.0)).toBe('100.0%');
    expect(formatPercent(null)).toBe('—');
  });

  it('returns proper risk badge configurations', () => {
    const high = getRiskBadgeConfig('High');
    expect(high.text).toBe('text-[#DC2626]');
    expect(high.label).toContain('High Risk');

    const low = getRiskBadgeConfig('Low');
    expect(low.text).toBe('text-[#059669]');
  });

  it('returns proper pass/fail badge configurations', () => {
    const pass = getPassBadgeConfig(1);
    expect(pass.label).toBe('Pass Expected');

    const fail = getPassBadgeConfig(0);
    expect(fail.label).toBe('At Risk of Failing');
  });
});
