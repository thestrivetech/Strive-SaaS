/**
 * MetricCard Component Test Suite
 * Tests for REID metric card display component
 */

import { render, screen } from '@testing-library/react';
import { MetricCard } from '@/components/real-estate/reid/shared/MetricCard';
import { DollarSign, TrendingUp, Home } from 'lucide-react';

describe('MetricCard', () => {
  it('renders metric value and label', () => {
    render(
      <MetricCard
        label="Median Price"
        value="$1.2M"
      />
    );

    expect(screen.getByText('$1.2M')).toBeInTheDocument();
    expect(screen.getByText('Median Price')).toBeInTheDocument();
  });

  it('displays positive trend indicator when provided', () => {
    render(
      <MetricCard
        label="Price Change"
        value="+5.2%"
        trend={{ value: 5.2, isPositive: true }}
      />
    );

    const trendElement = screen.getByText(/↑ 5.2%/);
    expect(trendElement).toBeInTheDocument();
    expect(trendElement.textContent).toContain('↑');
    expect(trendElement).toHaveClass('text-green-400');
  });

  it('displays negative trend indicator when provided', () => {
    render(
      <MetricCard
        label="Inventory"
        value="-3.1%"
        trend={{ value: 3.1, isPositive: false }}
      />
    );

    const trendElement = screen.getByText(/↓ 3.1%/);
    expect(trendElement).toBeInTheDocument();
    expect(trendElement.textContent).toContain('↓');
    expect(trendElement).toHaveClass('text-red-400');
  });

  it('renders icon when provided', () => {
    const { container } = render(
      <MetricCard
        label="Revenue"
        value="$50K"
        icon={DollarSign}
      />
    );

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-cyan-400');
  });

  it('applies custom className', () => {
    const { container } = render(
      <MetricCard
        label="Test"
        value="123"
        className="custom-test-class"
      />
    );

    const metricCard = container.querySelector('.custom-test-class');
    expect(metricCard).toBeInTheDocument();
  });

  it('renders with reid-metric base class', () => {
    const { container } = render(
      <MetricCard
        label="Test"
        value="123"
      />
    );

    expect(container.querySelector('.reid-metric')).toBeInTheDocument();
  });

  it('renders numeric values', () => {
    render(
      <MetricCard
        label="Count"
        value={42}
      />
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders string values', () => {
    render(
      <MetricCard
        label="Status"
        value="Active"
      />
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders complex metric with all props', () => {
    const { container } = render(
      <MetricCard
        label="Market Value"
        value="$2.5M"
        icon={TrendingUp}
        trend={{ value: 12.5, isPositive: true }}
        className="market-metric"
      />
    );

    expect(screen.getByText('$2.5M')).toBeInTheDocument();
    expect(screen.getByText('Market Value')).toBeInTheDocument();
    expect(screen.getByText(/12.5%/)).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('.market-metric')).toBeInTheDocument();
  });

  it('handles zero trend value', () => {
    render(
      <MetricCard
        label="Change"
        value="0%"
        trend={{ value: 0, isPositive: true }}
      />
    );

    expect(screen.getByText(/↑ 0%/)).toBeInTheDocument();
  });

  it('renders multiple icons correctly', () => {
    const { container: container1 } = render(
      <MetricCard label="Homes" value="150" icon={Home} />
    );
    const { container: container2 } = render(
      <MetricCard label="Price" value="$1M" icon={DollarSign} />
    );

    expect(container1.querySelector('svg')).toBeInTheDocument();
    expect(container2.querySelector('svg')).toBeInTheDocument();
  });
});
