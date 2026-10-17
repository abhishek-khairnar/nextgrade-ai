import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Gauge } from '../components/charts/Gauge';

describe('Gauge Component', () => {
  it('renders grade 0 correctly and clamps at lower bound', () => {
    const { container } = render(<Gauge value={0} />);
    expect(screen.getByText('0.0')).toBeInTheDocument();
    expect(screen.getByText(/out of 20/i)).toBeInTheDocument();
    const gaugeEl = screen.getByRole('img');
    expect(gaugeEl).toHaveAttribute('aria-label', expect.stringContaining('0.0 out of 20'));
    expect(gaugeEl).toHaveAttribute('aria-label', expect.stringContaining('high risk'));
  });

  it('renders grade 10 (pass threshold) correctly', () => {
    render(<Gauge value={10} />);
    expect(screen.getByText('10.0')).toBeInTheDocument();
    const gaugeEl = screen.getByRole('img');
    expect(gaugeEl).toHaveAttribute('aria-label', expect.stringContaining('10.0 out of 20'));
    expect(gaugeEl).toHaveAttribute('aria-label', expect.stringContaining('medium risk'));
  });

  it('renders grade 11.7 correctly', () => {
    render(<Gauge value={11.7} />);
    expect(screen.getByText('11.7')).toBeInTheDocument();
    const gaugeEl = screen.getByRole('img');
    expect(gaugeEl).toHaveAttribute('aria-label', 'Predicted grade 11.7 out of 20, medium risk');
  });

  it('renders grade 20 (maximum) correctly with low risk label', () => {
    render(<Gauge value={20} />);
    expect(screen.getByText('20.0')).toBeInTheDocument();
    const gaugeEl = screen.getByRole('img');
    expect(gaugeEl).toHaveAttribute('aria-label', expect.stringContaining('20.0 out of 20'));
    expect(gaugeEl).toHaveAttribute('aria-label', expect.stringContaining('low risk'));
  });

  it('clamps out-of-range values: negative clamped to 0, >20 clamped to 20', () => {
    const { rerender } = render(<Gauge value={-5} />);
    expect(screen.getByText('0.0')).toBeInTheDocument();

    rerender(<Gauge value={25} />);
    expect(screen.getByText('20.0')).toBeInTheDocument();
  });

  it('handles missing or NaN values gracefully with empty state', () => {
    const { rerender } = render(<Gauge value={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Predicted grade not available');

    rerender(<Gauge value={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(<Gauge value={NaN} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders confidence interval when provided', () => {
    render(<Gauge value={12.4} confidenceRange={{ min: 10.8, max: 14.0 }} />);
    expect(screen.getByText(/80% confidence interval:/i)).toBeInTheDocument();
    expect(screen.getByText(/10.8 – 14.0 pts/i)).toBeInTheDocument();
  });
});
