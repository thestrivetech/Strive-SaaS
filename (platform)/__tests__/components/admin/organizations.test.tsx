import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminOrganizationsPage from '@/app/(admin)/admin/organizations/page';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/hooks/use-toast');
jest.mock('lucide-react', () => ({
  Search: () => <div>Search Icon</div>,
  Building2: () => <div>Building2 Icon</div>,
}));

// Mock fetch
global.fetch = jest.fn();

const mockOrganizations = {
  organizations: [
    {
      id: 'org-1',
      name: 'Acme Corp',
      website: 'https://acme.com',
      created_at: '2025-01-01T00:00:00Z',
      _count: {
        organization_members: 5,
      },
      subscriptions: {
        tier: 'ELITE',
        status: 'ACTIVE',
      },
    },
    {
      id: 'org-2',
      name: 'Test Inc',
      website: null,
      created_at: '2025-01-02T00:00:00Z',
      _count: {
        organization_members: 2,
      },
      subscriptions: {
        tier: 'STARTER',
        status: 'ACTIVE',
      },
    },
  ],
  total: 2,
};

describe('AdminOrganizationsPage', () => {
  let queryClient: QueryClient;
  const mockToast = jest.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockOrganizations,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render organizations table', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminOrganizationsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Inc')).toBeInTheDocument();
  });

  it('should display organization details', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminOrganizationsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });

    // Check member count
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Check tier badges
    expect(screen.getByText('ELITE')).toBeInTheDocument();
    expect(screen.getByText('STARTER')).toBeInTheDocument();
  });

  it('should filter organizations by search', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminOrganizationsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search organizations...');
    fireEvent.change(searchInput, { target: { value: 'acme' } });

    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });
  });

  it('should display empty state when no organizations', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ organizations: [], total: 0 }),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AdminOrganizationsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No organizations found')).toBeInTheDocument();
    });
  });

  it('should show view action', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminOrganizationsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'View Organization',
        description: 'Viewing details for Acme Corp',
      });
    });
  });
});
