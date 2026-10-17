import { describe, it, expect } from 'vitest';
import { predictFormSchema } from '../lib/schemas';

describe('predictFormSchema Zod Validation', () => {
  it('validates a valid early warning payload without G1 and G2', () => {
    const validEarly = {
      mode: 'early',
      subject: 'math',
      studytime: 2,
      failures: 0,
      absences: 4,
      higher: 1,
      schoolsup: 0,
    };
    const result = predictFormSchema.safeParse(validEarly);
    expect(result.success).toBe(true);
  });

  it('validates a valid mid-term payload with G1 and G2', () => {
    const validMidterm = {
      mode: 'midterm',
      subject: 'math',
      studytime: 3,
      failures: 0,
      absences: 2,
      higher: 1,
      schoolsup: 0,
      G1: 14,
      G2: 15,
    };
    const result = predictFormSchema.safeParse(validMidterm);
    expect(result.success).toBe(true);
  });

  it('fails mid-term mode if G1 or G2 are missing', () => {
    const invalidMidterm = {
      mode: 'midterm',
      subject: 'math',
      studytime: 3,
      failures: 0,
      absences: 2,
      higher: 1,
      schoolsup: 0,
      // G1 and G2 missing
    };
    const result = predictFormSchema.safeParse(invalidMidterm);
    expect(result.success).toBe(false);
  });

  it('rejects studytime out of range', () => {
    const outOfRange = {
      mode: 'early',
      subject: 'math',
      studytime: 5, // max 4
      failures: 0,
      absences: 2,
      higher: 1,
      schoolsup: 0,
    };
    const result = predictFormSchema.safeParse(outOfRange);
    expect(result.success).toBe(false);
  });
});
