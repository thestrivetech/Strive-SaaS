import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDashboardPage from '@/app/(admin)/admin/page';
import { AdminSidebar } from '@/components/features/admin/admin-sidebar';
import { StatCard } from '@/components/features/admin/stat-card';
import { Building2 } from 'lucide-react';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Wrapper component for tests
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Admin Dashboard', () => {
  beforeEach(() => {
    // Mock fetch for metrics API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            total_orgs: 150,
            total_users: 500,
            mrr_cents: 50000,
            new_orgs: 5,
            active_users: 450,
            free_count: 50,
            starter_count: 40,
            growth_count: 30,
            elite_count: 20,
            enterprise_count: 10,
          }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('StatCard Component', () => {
    it('should render stat card with data', () => {
      render(
        <StatCard
          title="Total Organizations"
          value={150}
          change="+5 today"
          icon={Building2}
        />
      );

      expect(screen.getByText('Total Organizations')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('+5 today')).toBeInTheDocument();
    });

    it('should render loading skeleton when loading', () => {
      const { container } = render(
        <StatCard
          title="Total Organizations"
          value={150}
          change="+5 today"
          icon={Building2}
          loading={true}
        />
      );

      // Check for skeleton elements
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('AdminSidebar Component', () => {
    it('should render all navigation items', () => {
      const mockSetActiveTab = jest.fn();

      render(
        <AdminSidebar activeTab="dashboard" setActiveTab={mockSetActiveTab} />
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Organizations')).toBeInTheDocument();
      expect(screen.getByText('Subscriptions')).toBeInTheDocument();
      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
      expect(screen.getByText('System Alerts')).toBeInTheDocument();
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should call setActiveTab when navigation item is clicked', () => {
      const mockSetActiveTab = jest.fn();

      render(
        <AdminSidebar activeTab="dashboard" setActiveTab={mockSetActiveTab} />
      );

      fireEvent.click(screen.getByText('Users'));
      expect(mockSetActiveTab).toHaveBeenCalledWith('users');
    });

    it('should highlight active tab', () => {
      const mockSetActiveTab = jest.fn();

      const { container } = render(
        <AdminSidebar activeTab="users" setActiveTab={mockSetActiveTab} />
      );

      // Find the Users button and check if it has the active class
      const usersButton = screen.getByText('Users').closest('button');
      expect(usersButton).toHaveClass('bg-primary');
    });

    it('should render Exit Admin button', () => {
      const mockSetActiveTab = jest.fn();

      render(
        <AdminSidebar activeTab="dashboard" setActiveTab={mockSetActiveTab} />
      );

      expect(screen.getByText('Exit Admin')).toBeInTheDocument();
    });
  });

  describe('Admin Dashboard Page', () => {
    it('should render dashboard with sidebar and content', async () => {
      render(<AdminDashboardPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should switch tabs when sidebar item is clicked', async () => {
      render(<AdminDashboardPage />, { wrapper });

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      // Click on Users tab
      fireEvent.click(screen.getByText('Users'));

      // Check if content changed
      await waitFor(() => {
        expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
      });
    });
  });

  describe('Metrics Display', () => {
    it('should display platform metrics', async () => {
      render(<AdminDashboardPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument(); // Total orgs
        expect(screen.getByText('500')).toBeInTheDocument(); // Total users
      });
    });

    it('should show loading state initially', () => {
      const { container } = render(<AdminDashboardPage />, { wrapper });

      // Check for loading skeletons
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});
