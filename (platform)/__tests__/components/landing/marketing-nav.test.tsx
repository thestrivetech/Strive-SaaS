/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { MarketingNav } from '@/components/shared/layouts/marketing-nav';

describe('MarketingNav', () => {
  it('should render the navigation header', () => {
    render(<MarketingNav />);

    // Check for logo
    const logo = screen.getByText('Strive');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('href', '/');
  });

  it('should have desktop navigation links', () => {
    render(<MarketingNav />);

    // These links are in desktop nav (hidden on mobile)
    const featuresLinks = screen.getAllByText('Features');
    const pricingLinks = screen.getAllByText('Pricing');
    const docsLinks = screen.getAllByText('Docs');

    // Should have links for both desktop and mobile
    expect(featuresLinks.length).toBeGreaterThan(0);
    expect(pricingLinks.length).toBeGreaterThan(0);
    expect(docsLinks.length).toBeGreaterThan(0);
  });

  it('should have auth buttons', () => {
    render(<MarketingNav />);

    const signInButtons = screen.getAllByText('Sign in');
    const getStartedButtons = screen.getAllByText('Get Started');

    expect(signInButtons.length).toBeGreaterThan(0);
    expect(getStartedButtons.length).toBeGreaterThan(0);
  });

  it('should have mobile menu button', () => {
    render(<MarketingNav />);

    const menuButton = screen.getByLabelText('Toggle mobile menu');
    expect(menuButton).toBeInTheDocument();
  });

  it('should toggle mobile menu on button click', () => {
    render(<MarketingNav />);

    const menuButton = screen.getByLabelText('Toggle mobile menu');

    // Mobile menu should not be visible initially
    const mobileMenuContainer = document.querySelector('.lg\\:hidden.border-t');
    expect(mobileMenuContainer).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(menuButton);

    // Now mobile menu should be visible
    const mobileMenu = document.querySelector('.lg\\:hidden.border-t');
    expect(mobileMenu).toBeInTheDocument();
  });

  it('should have sticky positioning', () => {
    const { container } = render(<MarketingNav />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('sticky', 'top-0', 'z-50');
  });

  it('should have backdrop blur effect', () => {
    const { container } = render(<MarketingNav />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('backdrop-blur');
  });

  it('should have correct link hrefs', () => {
    render(<MarketingNav />);

    // Get all links and check hrefs (checking desktop nav only)
    const links = screen.getAllByRole('link');

    // Check logo href
    const logoLink = links.find(link => link.getAttribute('href') === '/');
    expect(logoLink).toBeInTheDocument();
  });

  it('should have responsive classes for desktop/mobile', () => {
    const { container } = render(<MarketingNav />);

    // Desktop nav should have lg:flex
    const desktopNav = container.querySelector('.hidden.lg\\:flex');
    expect(desktopNav).toBeInTheDocument();

    // Mobile button should have lg:hidden
    const mobileButton = container.querySelector('.flex.lg\\:hidden');
    expect(mobileButton).toBeInTheDocument();
  });
});
