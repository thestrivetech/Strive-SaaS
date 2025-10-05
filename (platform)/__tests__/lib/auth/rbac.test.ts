/**
 * Tests for Global Role-Based Access Control (RBAC)
 *
 * Target: 90%+ coverage
 */

import {
  hasPermissionSync,
  requirePermission,
  canAccessRoute,
  getNavigationItems,
  canManageOrganization,
  canInviteMembers,
  canDeleteMembers,
  canEditProject,
  canViewProject,
  canManageCustomer,
  canViewCustomer,
  canUsePremiumTools,
  getToolLimit,
} from '@/lib/auth/rbac';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import type { UserRole } from '@/lib/auth/constants';

// Mock dependencies
jest.mock('@/lib/auth/auth-helpers');
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

describe('Global RBAC System', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hasPermissionSync', () => {
    it('should allow ADMIN all permissions', () => {
      expect(hasPermissionSync('ADMIN', 'canViewAllOrganizations')).toBe(true);
      expect(hasPermissionSync('ADMIN', 'canManageUsers')).toBe(true);
      expect(hasPermissionSync('ADMIN', 'canManageBilling')).toBe(true);
      expect(hasPermissionSync('ADMIN', 'canManageSettings')).toBe(true);
    });

    it('should allow MODERATOR most permissions except admin-only', () => {
      expect(hasPermissionSync('MODERATOR', 'canManageUsers')).toBe(true);
      expect(hasPermissionSync('MODERATOR', 'canManageProjects')).toBe(true);
      expect(hasPermissionSync('MODERATOR', 'canManageCustomers')).toBe(true);
      expect(hasPermissionSync('MODERATOR', 'canViewAllOrganizations')).toBe(false);
      expect(hasPermissionSync('MODERATOR', 'canManageBilling')).toBe(false);
    });

    it('should allow USER limited permissions', () => {
      expect(hasPermissionSync('USER', 'canManageProjects')).toBe(true);
      expect(hasPermissionSync('USER', 'canManageCustomers')).toBe(true);
      expect(hasPermissionSync('USER', 'canViewAnalytics')).toBe(true);
      expect(hasPermissionSync('USER', 'canManageUsers')).toBe(false);
      expect(hasPermissionSync('USER', 'canManageSettings')).toBe(false);
    });

    it('should deny USER most permissions when not in organization', () => {
      expect(hasPermissionSync('USER', 'canManageUsers')).toBe(false);
      expect(hasPermissionSync('USER', 'canManageProjects')).toBe(true);
      expect(hasPermissionSync('USER', 'canManageCustomers')).toBe(true);
      expect(hasPermissionSync('USER', 'canManageBilling')).toBe(false);
    });

    it('should return false for invalid role', () => {
      expect(hasPermissionSync('INVALID' as UserRole, 'canManageUsers')).toBe(false);
    });
  });

  describe('requirePermission', () => {
    it('should not throw for user with permission', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        role: 'ADMIN',
        organizationMembers: [],
      } as never);

      await expect(requirePermission('canManageUsers')).resolves.not.toThrow();
    });

    it('should throw for user without permission', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        organizationMembers: [],
      } as never);

      await expect(requirePermission('canManageUsers')).rejects.toThrow(
        'Forbidden: Missing permission canManageUsers'
      );
    });

    it('should throw for unauthenticated user', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      await expect(requirePermission('canManageUsers')).rejects.toThrow();
    });
  });

  describe('canAccessRoute', () => {
    it('should allow ADMIN to access all routes', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        role: 'ADMIN',
        organizationMembers: [],
      } as never);

      expect(await canAccessRoute('/admin')).toBe(true);
      expect(await canAccessRoute('/dashboard')).toBe(true);
      expect(await canAccessRoute('/crm')).toBe(true);
      expect(await canAccessRoute('/settings')).toBe(true);
    });

    it('should allow USER access to user routes', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        organizationMembers: [],
      } as never);

      expect(await canAccessRoute('/dashboard')).toBe(true);
      expect(await canAccessRoute('/crm')).toBe(true);
      expect(await canAccessRoute('/projects')).toBe(true);
      expect(await canAccessRoute('/ai')).toBe(true);
      expect(await canAccessRoute('/tools')).toBe(true);
    });

    it('should deny USER access to admin routes', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        organizationMembers: [],
      } as never);

      expect(await canAccessRoute('/admin')).toBe(false);
      expect(await canAccessRoute('/settings')).toBe(false);
    });

    it('should return false for unauthenticated user', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      expect(await canAccessRoute('/dashboard')).toBe(false);
    });

    it('should allow access to undefined routes by default', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        role: 'USER',
        organizationMembers: [],
      } as never);

      expect(await canAccessRoute('/custom-route')).toBe(true);
    });
  });

  describe('getNavigationItems', () => {
    it('should return all items for ADMIN', () => {
      const items = getNavigationItems('ADMIN');

      expect(items).toHaveLength(7);
      expect(items.map(i => i.href)).toEqual([
        '/dashboard',
        '/crm',
        '/projects',
        '/ai',
        '/tools',
        '/settings',
        '/admin',
      ]);
    });

    it('should exclude admin and settings for USER', () => {
      const items = getNavigationItems('USER');

      expect(items).toHaveLength(5);
      expect(items.map(i => i.href)).toEqual([
        '/dashboard',
        '/crm',
        '/projects',
        '/ai',
        '/tools',
      ]);
      expect(items.find(i => i.href === '/admin')).toBeUndefined();
      expect(items.find(i => i.href === '/settings')).toBeUndefined();
    });

    it('should include settings for MODERATOR', () => {
      const items = getNavigationItems('MODERATOR');

      expect(items.map(i => i.href)).toContain('/settings');
      expect(items.map(i => i.href)).not.toContain('/admin');
    });
  });

  describe('Organization Management Permissions', () => {
    it('should allow ADMIN and MODERATOR to manage organization', () => {
      expect(canManageOrganization('ADMIN')).toBe(true);
      expect(canManageOrganization('MODERATOR')).toBe(true);
      expect(canManageOrganization('USER')).toBe(false);
    });

    it('should allow ADMIN and MODERATOR to invite members', () => {
      expect(canInviteMembers('ADMIN')).toBe(true);
      expect(canInviteMembers('MODERATOR')).toBe(true);
      expect(canInviteMembers('USER')).toBe(false);
    });

    it('should only allow ADMIN to delete members', () => {
      expect(canDeleteMembers('ADMIN')).toBe(true);
      expect(canDeleteMembers('MODERATOR')).toBe(false);
      expect(canDeleteMembers('USER')).toBe(false);
    });
  });

  describe('Project Permissions', () => {
    it('should allow ADMIN, MODERATOR, and USER to edit projects', () => {
      expect(canEditProject('ADMIN')).toBe(true);
      expect(canEditProject('MODERATOR')).toBe(true);
      expect(canEditProject('USER')).toBe(true);
    });

    it('should allow all roles to view projects', () => {
      expect(canViewProject('ADMIN')).toBe(true);
      expect(canViewProject('MODERATOR')).toBe(true);
      expect(canViewProject('USER')).toBe(true);
    });
  });

  describe('Customer Management Permissions', () => {
    it('should allow ADMIN, MODERATOR, and USER to manage customers', () => {
      expect(canManageCustomer('ADMIN')).toBe(true);
      expect(canManageCustomer('MODERATOR')).toBe(true);
      expect(canManageCustomer('USER')).toBe(true);
    });

    it('should allow all roles to view customers', () => {
      expect(canViewCustomer('ADMIN')).toBe(true);
      expect(canViewCustomer('MODERATOR')).toBe(true);
      expect(canViewCustomer('USER')).toBe(true);
    });
  });

  describe('Subscription Tier Permissions', () => {
    it('should allow premium tools for non-FREE tiers', () => {
      expect(canUsePremiumTools('FREE')).toBe(false);
      expect(canUsePremiumTools('TIER_1')).toBe(true);
      expect(canUsePremiumTools('TIER_2')).toBe(true);
      expect(canUsePremiumTools('TIER_3')).toBe(true);
    });

    it('should return correct tool limits per tier', () => {
      expect(getToolLimit('FREE')).toBe(0);
      expect(getToolLimit('TIER_1')).toBe(3);
      expect(getToolLimit('TIER_2')).toBe(10);
      expect(getToolLimit('TIER_3')).toBe(Infinity);
    });

    it('should return 0 for invalid tier', () => {
      expect(getToolLimit('INVALID')).toBe(0);
    });
  });
});
