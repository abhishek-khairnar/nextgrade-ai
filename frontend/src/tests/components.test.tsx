import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Gauge } from '../components/charts/Gauge';

describe('UI Components', () => {
  it('renders Button with text and handles loading state', () => {
    const { rerender } = render(<Button>Predict Now</Button>);
    expect(screen.getByRole('button', { name: /predict now/i })).toBeInTheDocument();

    rerender(<Button loading>Predict Now</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders Chip with risk badge and accessibility labels', () => {
    render(<Chip variant="risk" riskLevel="High" />);
    expect(screen.getByText(/high risk/i)).toBeInTheDocument();
  });

  it('renders Gauge with predicted numeric score', () => {
    render(<Gauge value={14.5} confidenceRange={{ min: 13.0, max: 16.0 }} />);
    expect(screen.getByText('14.5')).toBeInTheDocument();
    expect(screen.getByText(/80% confidence interval:/i)).toBeInTheDocument();
  });
});
