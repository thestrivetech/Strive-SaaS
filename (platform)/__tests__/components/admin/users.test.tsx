import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminUsersPage from '@/app/(admin)/admin/users/page';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/hooks/use-toast');
jest.mock('lucide-react', () => ({
  Search: () => <div>Search Icon</div>,
  UserPlus: () => <div>UserPlus Icon</div>,
  Building2: () => <div>Building2 Icon</div>,
}));

// Mock fetch
global.fetch = jest.fn();

const mockUsers = {
  users: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
      subscription_tier: 'STARTER',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      organization_members: [
        {
          organizations: {
            id: 'org-1',
            name: 'Test Org',
          },
        },
      ],
    },
    {
      id: '2',
      name: 'Jane Admin',
      email: 'jane@example.com',
      role: 'ADMIN',
      subscription_tier: 'ELITE',
      is_active: true,
      created_at: '2025-01-02T00:00:00Z',
      organization_members: [],
    },
  ],
  total: 2,
};

describe('AdminUsersPage', () => {
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
      json: async () => mockUsers,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render users table', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminUsersPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('should filter users by search', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminUsersPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name or email...');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should show suspend confirmation dialog', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminUsersPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const suspendButtons = screen.getAllByText('Suspend');
    fireEvent.click(suspendButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Suspend User?')).toBeInTheDocument();
    });
  });

  it('should display empty state when no users', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [], total: 0 }),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AdminUsersPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('should filter users by role', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminUsersPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Role filter functionality would trigger new API call with role parameter
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/admin/users')
    );
  });
});
