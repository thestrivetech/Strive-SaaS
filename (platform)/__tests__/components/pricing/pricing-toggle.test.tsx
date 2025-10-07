import { render, screen, fireEvent } from '@testing-library/react';
import { PricingToggle } from '@/components/features/pricing/pricing-toggle';

describe('PricingToggle', () => {
  it('should toggle between monthly and yearly', () => {
    const onToggle = jest.fn();
    render(<PricingToggle billingCycle="monthly" onToggle={onToggle} />);

    const yearlyButton = screen.getByText('Yearly');
    fireEvent.click(yearlyButton);

    expect(onToggle).toHaveBeenCalledWith('yearly');
  });

  it('should highlight active billing cycle', () => {
    const onToggle = jest.fn();
    const { rerender } = render(
      <PricingToggle billingCycle="monthly" onToggle={onToggle} />
    );

    const monthlyButton = screen.getByText('Monthly');
    expect(monthlyButton.closest('button')).toHaveClass('bg-primary');

    rerender(<PricingToggle billingCycle="yearly" onToggle={onToggle} />);
    const yearlyButton = screen.getByText('Yearly');
    expect(yearlyButton.closest('button')).toHaveClass('bg-primary');
  });

  it('should display savings badge on yearly option', () => {
    const onToggle = jest.fn();
    render(<PricingToggle billingCycle="monthly" onToggle={onToggle} />);

    expect(screen.getByText('Save 17%')).toBeInTheDocument();
  });
});
