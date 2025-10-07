/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { FeaturesSection } from '@/components/features/landing/features-section';

describe('FeaturesSection', () => {
  it('should render the features section', () => {
    render(<FeaturesSection />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Everything you need to succeed');
  });

  it('should display all 9 features', () => {
    render(<FeaturesSection />);

    // Check for specific features
    expect(screen.getByText('Lightning Fast')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Security')).toBeInTheDocument();
    expect(screen.getByText('Team Collaboration')).toBeInTheDocument();
    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
    expect(screen.getByText('24/7 Support')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered')).toBeInTheDocument();
    expect(screen.getByText('Global CDN')).toBeInTheDocument();
    expect(screen.getByText('Data Privacy')).toBeInTheDocument();
    expect(screen.getByText('Rapid Deployment')).toBeInTheDocument();
  });

  it('should have feature descriptions', () => {
    render(<FeaturesSection />);

    // Check for descriptions
    expect(screen.getByText(/Built on cutting-edge tech/i)).toBeInTheDocument();
    expect(screen.getByText(/Bank-level encryption/i)).toBeInTheDocument();
    expect(screen.getByText(/Work together seamlessly/i)).toBeInTheDocument();
  });

  it('should have responsive grid layout', () => {
    const { container } = render(<FeaturesSection />);

    // Check for grid classes
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
  });

  it('should have hover-elevate effects on cards', () => {
    const { container } = render(<FeaturesSection />);

    // All cards should have hover-elevate class
    const cards = container.querySelectorAll('.hover-elevate');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should have proper semantic HTML structure', () => {
    const { container } = render(<FeaturesSection />);

    // Should be a section element
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();

    // Should have h2 heading
    const h2 = container.querySelector('h2');
    expect(h2).toBeInTheDocument();
  });

  it('should have icon containers with proper styling', () => {
    const { container } = render(<FeaturesSection />);

    // Check for icon containers
    const iconContainers = container.querySelectorAll('.bg-primary\\/10');
    expect(iconContainers.length).toBe(9);
  });

  it('should have section header with description', () => {
    render(<FeaturesSection />);

    const description = screen.getByText(/Powerful features designed/i);
    expect(description).toBeInTheDocument();
  });
});
