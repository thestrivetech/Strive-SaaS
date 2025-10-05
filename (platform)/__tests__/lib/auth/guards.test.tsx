/**
 * Tests for Auth Component Guards
 *
 * Target: 80%+ coverage
 */

import { redirect } from 'next/navigation';
import {
  RequireAuth,
  RequireRole,
  RequirePermission,
  RequireOrgPermission,
  RequireOrganization,
  RequireTier,
} from '@/lib/auth/guards';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { hasPermission } from '@/lib/auth/rbac';

// Mock dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/lib/auth/auth-helpers', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/auth/rbac', () => ({
  hasPermission: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockHasPermission = hasPermission as jest.MockedFunction<typeof hasPermission>;

describe('Auth Component Guards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RequireAuth', () => {
    it('should render children when user is authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        organizationMembers: [],
      } as never);

      const TestChildren = () => <div>Protected Content</div>;

      const result = await RequireAuth({
        children: <TestChildren />,
      });

      expect(result).toBeDefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should redirect when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const TestChildren = () => <div>Protected Content</div>;

      await RequireAuth({
        children: <TestChildren />,
      });

      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('RequireRole', () => {
    it('should render children when user has required role', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        role: 'ADMIN',
        organizationMembers: [],
      } as never);

      const TestChildren = () => <div>Admin Content</div>;

      const result = await RequireRole({
        role: 'ADMIN',
        children: <TestChildren />,
      });

      expect(result).toBeDefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should redirect when user does not have required role', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        organizationMembers: [],
      } as never);

      const TestChildren = () => <div>Admin Content</div>;

      await RequireRole({
        role: 'ADMIN',
        children: <TestChildren />,
      });

      expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
    });

    it('should allow ADMIN to bypass role check', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        role: 'ADMIN',
        organizationMembers: [],
      } as never);

      const TestChildren = () => <div>Content</div>;

      const result = await RequireRole({
        role: 'MODERATOR',
        children: <TestChildren />,
      });

      expect(result).toBeDefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should redirect to login when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const TestChildren = () => <div>Content</div>;

      await RequireRole({
        role: 'ADMIN',
        children: <TestChildren />,
      });

      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    it('should use custom fallbackUrl', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        organizationMembers: [],
      } as never);

      const TestChildren = () => <div>Content</div>;

      await RequireRole({
        role: 'ADMIN',
        fallbackUrl: '/unauthorized',
        children: <TestChildren />,
      });

      expect(mockRedirect).toHaveBeenCalledWith('/unauthorized');
    });
  });

  describe('RequirePermission', () => {
    it('should render children when user has permission', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        organizationMembers: [],
      } as never);

      mockHasPermission.mockResolvedValue(true);

      const TestChildren = () => <div>CRM Content</div>;

      const result = await RequirePermission({
        permission: 'canManageCustomers',
        children: <TestChildren />,
      });

      expect(result).toBeDefined();
      expect(mockHasPermission).toHaveBeenCalledWith('canManageCustomers');
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should redirect when user lacks permission', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        organizationMembers: [],
      } as never);

      mockHasPermission.mockResolvedValue(false);

      const TestChildren = () => <div>CRM Content</div>;

      await RequirePermission({
        permission: 'canManageCustomers',
        children: <TestChildren />,
      });

      expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
    });

    it('should redirect to login when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const TestChildren = () => <div>Content</div>;

      await RequirePermission({
        permission: 'canManageCustomers',
        children: <TestChildren />,
      });

      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    it('should use custom fallbackUrl', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        organizationMembers: [],
      } as never);

      mockHasPermission.mockResolvedValue(false);

      const TestChildren = () => <div>Content</div>;

      await RequirePermission({
        permission: 'canManageCustomers',
        fallbackUrl: '/upgrade',
        children: <TestChildren />,
      });

      expect(mockRedirect).toHaveBeenCalledWith('/upgrade');
    });
  });

  describe('RequireOrgPermission', () => {
    it('should render children when user has org permission', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        organizationMembers: [
          {
            role: 'ADMIN',
            organization: { id: 'org-1', name: 'Test Org' },
          },
        ],
      } as never);

      const TestChildren = () => <div>Org Settings</div>;

      const result = await RequireOrgPermission({
        permission: 'settings:edit',
        children: <TestChildren />,
      });

      expect(result).toBeDefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should redirect when user lacks org permission', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        organizationMembers: [
          {
            role: 'VIEWER',
            organization: { id: 'org-1', name: 'Test Org' },
          },
        ],
      } as never);

      const TestChildren = () => <div>Org Settings</div>;

      await RequireOrgPermission({
        permission: 'settings:edit',
        children: <TestChildren />,
      });

      expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
    });

    it('should redirect to org onboarding when user has no organization', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        organizationMembers: [],
      } as never);

      const TestChildren = () => <div>Org Settings</div>;

      await RequireOrgPermission({
        permission: 'settings:edit',
        children: <TestChildren />,
      });

      expect(mockRedirect).toHaveBeenCalledWith('/onboarding/organization');
    });

    it('should redirect to login when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const TestChildren = () => <div>Content</div>;

      await RequireOrgPermission({
        permission: 'settings:edit',
        children: <TestChildren />,
      });

      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    it('should allow global ADMIN to bypass org permission', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        role: 'ADMIN',
        organizationMembers: [
          {
            role: 'VIEWER',
            organization: { id: 'org-1', name: 'Test Org' },
          },
        ],
      } as never);

      const TestChildren = () => <div>Org Settings</div>;

      const result = await RequireOrgPermission({
        permission: 'org:delete',
        children: <TestChildren />,
      });

      expect(result).toBeDefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('RequireOrganization', () => {
    it('should render children when user is in an organization', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        organizationMembers: [
          {
            role: 'MEMBER',
            organization: { id: 'org-1', name: 'Test Org' },
          },
        ],
      } as never);

      const TestChildren = () => <div>Org Content</div>;

      const result = await RequireOrganization({
        children: <TestChildren />,
      });

      expect(result).toBeDefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should redirect when user is not in an organization', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        organizationMembers: [],
      } as never);

      const TestChildren = () => <div>Org Content</div>;

      await RequireOrganization({
        children: <TestChildren />,
      });

      expect(mockRedirect).toHaveBeenCalledWith('/onboarding/organization');
    });

    it('should redirect to login when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const TestChildren = () => <div>Content</div>;

      await RequireOrganization({
        children: <TestChildren />,
      });

      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('RequireTier', () => {
    it('should render children when user has required tier', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        subscriptionTier: 'TIER_2',
        organizationMembers: [],
      } as never);

      const TestChildren = () => <div>Premium Content</div>;

      const result = await RequireTier({
        tier: 'TIER_2',
        children: <TestChildren />,
      });

      expect(result).toBeDefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should allow higher tier to access lower tier content', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        subscriptionTier: 'TIER_3',
        organizationMembers: [],
      } as never);

      const TestChildren = () => <div>Content</div>;

      const result = await RequireTier({
        tier: 'TIER_1',
        children: <TestChildren />,
      });

      expect(result).toBeDefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should redirect when user tier is below required', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        subscriptionTier: 'FREE',
        organizationMembers: [],
      } as never);

      const TestChildren = () => <div>Premium Content</div>;

      await RequireTier({
        tier: 'TIER_2',
        children: <TestChildren />,
      });

      expect(mockRedirect).toHaveBeenCalledWith('/settings/billing');
    });

    it('should use custom fallbackUrl', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        subscriptionTier: 'FREE',
        organizationMembers: [],
      } as never);

      const TestChildren = () => <div>Content</div>;

      await RequireTier({
        tier: 'TIER_2',
        fallbackUrl: '/pricing',
        children: <TestChildren />,
      });

      expect(mockRedirect).toHaveBeenCalledWith('/pricing');
    });

    it('should redirect to login when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const TestChildren = () => <div>Content</div>;

      await RequireTier({
        tier: 'TIER_2',
        children: <TestChildren />,
      });

      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('Guard Composition', () => {
    it('should work with nested guards', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        role: 'ADMIN',
        subscriptionTier: 'TIER_3',
        organizationMembers: [
          {
            role: 'OWNER',
            organization: { id: 'org-1', name: 'Test Org' },
          },
        ],
      } as never);

      mockHasPermission.mockResolvedValue(true);

      const TestChildren = () => <div>Protected Content</div>;

      const result = await RequireAuth({
        children: await RequireRole({
          role: 'ADMIN',
          children: await RequireOrgPermission({
            permission: 'org:delete',
            children: <TestChildren />,
          }),
        }),
      });

      expect(result).toBeDefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
