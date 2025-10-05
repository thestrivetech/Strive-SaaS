import { render, screen } from '@testing-library/react';
import { AdminLayout } from '@/components/layouts/admin-layout';

// Mock auth guards
jest.mock('@/lib/auth/guards', () => ({
  RequireRole: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock getCurrentUser
jest.mock('@/lib/auth/auth-helpers', () => ({
  getCurrentUser: jest.fn(() =>
    Promise.resolve({
      id: '1',
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'ADMIN',
    })
  ),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/admin',
}));

// Mock navigation components
jest.mock('@/components/shared/navigation/sidebar-nav', () => ({
  SidebarNav: ({ items }: { items: Array<{ href: string; title: string }> }) => (
    <div data-testid="sidebar-nav">
      {items.map((item) => (
        <div key={item.href}>{item.title}</div>
      ))}
    </div>
  ),
  defaultNavItems: [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: () => <div>Icon</div>,
    },
    {
      title: 'Admin',
      href: '/dashboard/admin',
      icon: () => <div>Icon</div>,
      adminOnly: true,
    },
  ],
}));

// Mock header
jest.mock('@/components/shared/navigation/header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

describe('AdminLayout', () => {
  it('renders children correctly', async () => {
    const AdminLayoutResolved = await AdminLayout({
      children: <div data-testid="admin-content">Admin Content</div>,
    });

    render(AdminLayoutResolved);

    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('renders sidebar navigation', async () => {
    const AdminLayoutResolved = await AdminLayout({
      children: <div>Content</div>,
    });

    render(AdminLayoutResolved);

    expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument();
  });

  it('renders header', async () => {
    const AdminLayoutResolved = await AdminLayout({
      children: <div>Content</div>,
    });

    render(AdminLayoutResolved);

    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('includes admin nav items for admin users', async () => {
    const AdminLayoutResolved = await AdminLayout({
      children: <div>Content</div>,
    });

    render(AdminLayoutResolved);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
});
