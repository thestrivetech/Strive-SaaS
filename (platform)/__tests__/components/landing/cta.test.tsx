/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { CTASection } from '@/components/features/landing/cta-section';

describe('CTASection', () => {
  it('should render the CTA section', () => {
    render(<CTASection />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Ready to get started?');
  });

  it('should display the CTA button', () => {
    render(<CTASection />);

    const ctaButton = screen.getByRole('link', { name: /start free trial/i });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', '/onboarding');
  });

  it('should display all 4 benefits', () => {
    render(<CTASection />);

    expect(screen.getByText('No credit card required')).toBeInTheDocument();
    expect(screen.getByText('14-day free trial')).toBeInTheDocument();
    expect(screen.getByText('Cancel anytime')).toBeInTheDocument();
    expect(screen.getByText('Full feature access')).toBeInTheDocument();
  });

  it('should have CheckCircle2 icons for each benefit', () => {
    const { container } = render(<CTASection />);

    // Check for SVG icons (Lucide icons render as SVG)
    const icons = container.querySelectorAll('svg');
    // At least 5 SVGs (4 benefits + 1 in CTA button)
    expect(icons.length).toBeGreaterThanOrEqual(5);
  });

  it('should have gradient background', () => {
    const { container } = render(<CTASection />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-gradient-to-b');
  });

  it('should display subtext with trial details', () => {
    render(<CTASection />);

    const subtext = screen.getByText(/No credit card required • Free 14-day trial/i);
    expect(subtext).toBeInTheDocument();
  });

  it('should have proper semantic HTML structure', () => {
    const { container } = render(<CTASection />);

    // Should be a section element
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();

    // Should have h2 heading
    const h2 = container.querySelector('h2');
    expect(h2).toBeInTheDocument();
  });

  it('should have hover-elevate effect on CTA button', () => {
    const { container } = render(<CTASection />);

    // Button should have hover-elevate class
    const button = container.querySelector('.hover-elevate');
    expect(button).toBeInTheDocument();
  });

  it('should have descriptive text about joining teams', () => {
    render(<CTASection />);

    const description = screen.getByText(/Join thousands of teams/i);
    expect(description).toBeInTheDocument();
  });
});
