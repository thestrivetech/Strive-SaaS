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

    it('should allow EMPLOYEE limited permissions', () => {
      expect(hasPermissionSync('EMPLOYEE', 'canManageProjects')).toBe(true);
      expect(hasPermissionSync('EMPLOYEE', 'canManageCustomers')).toBe(true);
      expect(hasPermissionSync('EMPLOYEE', 'canViewAnalytics')).toBe(true);
      expect(hasPermissionSync('EMPLOYEE', 'canManageUsers')).toBe(false);
      expect(hasPermissionSync('EMPLOYEE', 'canManageSettings')).toBe(false);
    });

    it('should deny CLIENT most permissions', () => {
      expect(hasPermissionSync('CLIENT', 'canManageUsers')).toBe(false);
      expect(hasPermissionSync('CLIENT', 'canManageProjects')).toBe(false);
      expect(hasPermissionSync('CLIENT', 'canManageCustomers')).toBe(false);
      expect(hasPermissionSync('CLIENT', 'canManageBilling')).toBe(false);
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
        email: 'client@test.com',
        role: 'CLIENT',
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

    it('should deny CLIENT access to employee routes', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'client@test.com',
        role: 'CLIENT',
        organizationMembers: [],
      } as never);

      expect(await canAccessRoute('/crm')).toBe(false);
      expect(await canAccessRoute('/projects')).toBe(false);
      expect(await canAccessRoute('/admin')).toBe(false);
      expect(await canAccessRoute('/settings')).toBe(false);
    });

    it('should allow CLIENT to access dashboard', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'client@test.com',
        role: 'CLIENT',
        organizationMembers: [],
      } as never);

      expect(await canAccessRoute('/dashboard')).toBe(true);
    });

    it('should allow EMPLOYEE to access employee routes', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'employee@test.com',
        role: 'EMPLOYEE',
        organizationMembers: [],
      } as never);

      expect(await canAccessRoute('/crm')).toBe(true);
      expect(await canAccessRoute('/projects')).toBe(true);
      expect(await canAccessRoute('/ai')).toBe(true);
      expect(await canAccessRoute('/tools')).toBe(true);
    });

    it('should deny EMPLOYEE access to admin routes', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: '1',
        email: 'employee@test.com',
        role: 'EMPLOYEE',
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
        email: 'employee@test.com',
        role: 'EMPLOYEE',
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

    it('should exclude admin and settings for EMPLOYEE', () => {
      const items = getNavigationItems('EMPLOYEE');

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

    it('should only show dashboard for CLIENT', () => {
      const items = getNavigationItems('CLIENT');

      expect(items).toHaveLength(1);
      expect(items[0].href).toBe('/dashboard');
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
      expect(canManageOrganization('EMPLOYEE')).toBe(false);
      expect(canManageOrganization('CLIENT')).toBe(false);
    });

    it('should allow ADMIN and MODERATOR to invite members', () => {
      expect(canInviteMembers('ADMIN')).toBe(true);
      expect(canInviteMembers('MODERATOR')).toBe(true);
      expect(canInviteMembers('EMPLOYEE')).toBe(false);
      expect(canInviteMembers('CLIENT')).toBe(false);
    });

    it('should only allow ADMIN to delete members', () => {
      expect(canDeleteMembers('ADMIN')).toBe(true);
      expect(canDeleteMembers('MODERATOR')).toBe(false);
      expect(canDeleteMembers('EMPLOYEE')).toBe(false);
      expect(canDeleteMembers('CLIENT')).toBe(false);
    });
  });

  describe('Project Permissions', () => {
    it('should allow ADMIN, MODERATOR, and EMPLOYEE to edit projects', () => {
      expect(canEditProject('ADMIN')).toBe(true);
      expect(canEditProject('MODERATOR')).toBe(true);
      expect(canEditProject('EMPLOYEE')).toBe(true);
      expect(canEditProject('CLIENT')).toBe(false);
    });

    it('should allow all roles to view projects', () => {
      expect(canViewProject('ADMIN')).toBe(true);
      expect(canViewProject('MODERATOR')).toBe(true);
      expect(canViewProject('EMPLOYEE')).toBe(true);
      expect(canViewProject('CLIENT')).toBe(true);
    });
  });

  describe('Customer Management Permissions', () => {
    it('should allow ADMIN, MODERATOR, and EMPLOYEE to manage customers', () => {
      expect(canManageCustomer('ADMIN')).toBe(true);
      expect(canManageCustomer('MODERATOR')).toBe(true);
      expect(canManageCustomer('EMPLOYEE')).toBe(true);
      expect(canManageCustomer('CLIENT')).toBe(false);
    });

    it('should allow all except CLIENT to view customers', () => {
      expect(canViewCustomer('ADMIN')).toBe(true);
      expect(canViewCustomer('MODERATOR')).toBe(true);
      expect(canViewCustomer('EMPLOYEE')).toBe(true);
      expect(canViewCustomer('CLIENT')).toBe(false);
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
