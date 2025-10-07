import { render, screen } from '@testing-library/react';
import { PricingFAQ } from '@/components/features/pricing/pricing-faq';

describe('PricingFAQ', () => {
  it('should display FAQ section heading', () => {
    render(<PricingFAQ />);
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  });

  it('should display at least 6 FAQ items', () => {
    render(<PricingFAQ />);
    expect(screen.getByText('Can I change plans anytime?')).toBeInTheDocument();
    expect(screen.getByText('Is there a free trial?')).toBeInTheDocument();
    expect(screen.getByText('What happens to my data if I cancel?')).toBeInTheDocument();
    expect(screen.getByText('Do you offer refunds?')).toBeInTheDocument();
    expect(screen.getByText('What payment methods do you accept?')).toBeInTheDocument();
    expect(screen.getByText('Can I get a custom plan?')).toBeInTheDocument();
  });

  it('should display contact support CTA', () => {
    render(<PricingFAQ />);
    expect(screen.getByText('Still have questions?')).toBeInTheDocument();
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });

  it('should have contact link with correct href', () => {
    render(<PricingFAQ />);
    const contactLink = screen.getByText('Contact Support').closest('a');
    expect(contactLink).toHaveAttribute('href', '/contact');
  });
});
