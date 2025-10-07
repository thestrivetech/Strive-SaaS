/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/features/landing/hero-section';

describe('HeroSection', () => {
  it('should render the hero section', () => {
    render(<HeroSection />);

    // Check for main heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Build Better Products');
  });

  it('should have proper heading hierarchy', () => {
    render(<HeroSection />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Build Better Products');
  });

  it('should have accessible CTA buttons', () => {
    render(<HeroSection />);

    // Check for Get Started button
    const ctaButton = screen.getByRole('link', { name: /get started free/i });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', '/onboarding');
  });

  it('should display the AI badge', () => {
    render(<HeroSection />);

    const badge = screen.getByText('Powered by AI');
    expect(badge).toBeInTheDocument();
  });

  it('should display trust indicators', () => {
    render(<HeroSection />);

    const trustText = screen.getByText('Trusted by thousands of teams worldwide');
    expect(trustText).toBeInTheDocument();

    // Check for partner logo placeholders (5 logos)
    const logos = screen.getAllByLabelText(/partner logo/i);
    expect(logos).toHaveLength(5);
  });

  it('should have responsive layout classes', () => {
    const { container } = render(<HeroSection />);

    // Check for responsive classes
    const section = container.querySelector('section');
    expect(section).toHaveClass('px-6', 'py-24', 'sm:py-32', 'lg:px-8');
  });

  it('should have proper semantic HTML', () => {
    const { container } = render(<HeroSection />);

    // Should be a section element
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();

    // Should have heading structure
    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
  });

  it('should have background decoration with aria-hidden', () => {
    const { container } = render(<HeroSection />);

    // Background decoration should be hidden from screen readers
    const decoration = container.querySelector('[aria-hidden="true"]');
    expect(decoration).toBeInTheDocument();
  });
});
