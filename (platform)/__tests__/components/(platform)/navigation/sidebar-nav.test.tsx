import { render, screen } from '@testing-library/react';
import { SidebarNav, defaultNavItems } from '@/components/(platform)/shared/navigation/sidebar-nav';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('SidebarNav', () => {
  it('renders all provided nav items', () => {
    render(<SidebarNav items={defaultNavItems} />);

    // Check for nav items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('CRM')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders Strive Tech branding', () => {
    render(<SidebarNav items={defaultNavItems} />);

    expect(screen.getByText('Strive Tech')).toBeInTheDocument();
  });

  it('highlights active route', () => {
    render(<SidebarNav items={defaultNavItems} />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-primary');
  });

  it('renders with filtered nav items', () => {
    const filteredItems = defaultNavItems.filter(
      (item) => !item.adminOnly
    );

    render(<SidebarNav items={filteredItems} />);

    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders icons for each nav item', () => {
    render(<SidebarNav items={defaultNavItems} />);

    // Check that nav has icons (lucide-react renders svg elements)
    const navElement = screen.getByRole('navigation');
    const svgElements = navElement.querySelectorAll('svg');

    // Should have icons for all nav items
    expect(svgElements.length).toBeGreaterThanOrEqual(defaultNavItems.length);
  });
});
