import { render, screen } from '@testing-library/react';
import { PricingTiers } from '@/components/features/pricing/pricing-tiers';

describe('PricingTiers', () => {
  it('should display all 4 pricing tiers', () => {
    render(<PricingTiers />);
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Growth')).toBeInTheDocument();
    expect(screen.getByText('Elite')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('should mark Growth as most popular', () => {
    render(<PricingTiers />);
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('should display correct pricing for monthly billing', () => {
    render(<PricingTiers />);
    expect(screen.getByText('$299')).toBeInTheDocument();
    expect(screen.getByText('$699')).toBeInTheDocument();
    expect(screen.getByText('$1,999')).toBeInTheDocument();
  });

  it('should display CTA buttons with correct links', () => {
    render(<PricingTiers />);
    const starterCTA = screen.getAllByText('Start Free Trial')[0];
    expect(starterCTA.closest('a')).toHaveAttribute('href', '/onboarding?tier=starter');
  });

  it('should display billing toggle', () => {
    render(<PricingTiers />);
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Yearly')).toBeInTheDocument();
  });

  it('should display free trial information', () => {
    render(<PricingTiers />);
    expect(screen.getByText(/All plans include a 14-day free trial/i)).toBeInTheDocument();
  });
});
