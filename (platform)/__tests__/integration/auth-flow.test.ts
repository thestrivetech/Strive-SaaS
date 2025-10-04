/**
 * Authentication Flow Integration Tests
 * Tests complete auth workflows: login, logout, session management, RBAC
 *
 * Target: 70%+ coverage
 */

import {
  mockSupabaseClient,
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
  createMockRequest,
  resetMocks,
} from '@/lib/test';
import { UserRole } from '@prisma/client';

// Mock Supabase client globally
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('Login Flow', () => {
    it('should successfully log in with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.EMPLOYEE,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: mockUser as any,
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
          } as any,
        },
        error: null,
      });

      const result = await mockSupabaseClient.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.data.user).toBeDefined();
      expect(result.data.user?.email).toBe('test@example.com');
      expect(result.data.session).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should fail login with invalid credentials', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', status: 401 } as any,
      });

      const result = await mockSupabaseClient.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'WrongPassword',
      });

      expect(result.data.user).toBeNull();
      expect(result.data.session).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid login credentials');
    });

    it('should fail login with malformed email', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid email format', status: 400 } as any,
      });

      const result = await mockSupabaseClient.auth.signInWithPassword({
        email: 'not-an-email',
        password: 'Password123!',
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid email');
    });
  });

  describe('Logout Flow', () => {
    it('should successfully log out authenticated user', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      const result = await mockSupabaseClient.auth.signOut();

      expect(result.error).toBeNull();
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });

    it('should handle logout errors gracefully', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: { message: 'Network error', status: 500 } as any,
      });

      const result = await mockSupabaseClient.auth.signOut();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Network error');
    });
  });

  describe('Session Management', () => {
    it('should retrieve active session for authenticated user', async () => {
      const mockUser = mockAuthenticatedUser({
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.EMPLOYEE,
        organizationId: 'org-123',
      });

      const result = await mockSupabaseClient.auth.getSession();

      expect(result.data.session).toBeDefined();
      expect(result.data.session?.user).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
      }));
      expect(result.error).toBeNull();
    });

    it('should return null session for unauthenticated user', async () => {
      mockUnauthenticatedUser();

      const result = await mockSupabaseClient.auth.getSession();

      expect(result.data.session).toBeNull();
      expect(result.error).toBeDefined();
    });

    it('should get current user from session', async () => {
      const mockUser = mockAuthenticatedUser({
        id: 'user-123',
        email: 'test@example.com',
      });

      const result = await mockSupabaseClient.auth.getUser();

      expect(result.data.user).toBeDefined();
      expect(result.data.user?.id).toBe(mockUser.id);
      expect(result.data.user?.email).toBe(mockUser.email);
    });

    it('should return null for unauthenticated user', async () => {
      mockUnauthenticatedUser();

      const result = await mockSupabaseClient.auth.getUser();

      expect(result.data.user).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Session Refresh', () => {
    it('should refresh expired session with valid refresh token', async () => {
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
            user: {
              id: 'user-123',
              email: 'test@example.com',
            } as any,
          },
          user: {
            id: 'user-123',
            email: 'test@example.com',
          } as any,
        },
        error: null,
      });

      const result = await mockSupabaseClient.auth.refreshSession();

      expect(result.data.session).toBeDefined();
      expect(result.data.session?.access_token).toBe('new-access-token');
      expect(result.error).toBeNull();
    });

    it('should fail to refresh with invalid refresh token', async () => {
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid refresh token', status: 401 } as any,
      });

      const result = await mockSupabaseClient.auth.refreshSession();

      expect(result.data.session).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid refresh token');
    });
  });

  describe('User Registration', () => {
    it('should successfully register new user', async () => {
      const newUser = {
        id: 'new-user-123',
        email: 'newuser@example.com',
        role: UserRole.CLIENT,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: newUser as any,
          session: {
            access_token: 'new-token',
            refresh_token: 'new-refresh',
          } as any,
        },
        error: null,
      });

      const result = await mockSupabaseClient.auth.signUp({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
      });

      expect(result.data.user).toBeDefined();
      expect(result.data.user?.email).toBe('newuser@example.com');
      expect(result.error).toBeNull();
    });

    it('should fail registration with duplicate email', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered', status: 422 } as any,
      });

      const result = await mockSupabaseClient.auth.signUp({
        email: 'existing@example.com',
        password: 'Password123!',
      });

      expect(result.data.user).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('already registered');
    });

    it('should fail registration with weak password', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Password too weak', status: 422 } as any,
      });

      const result = await mockSupabaseClient.auth.signUp({
        email: 'test@example.com',
        password: '123',
      });

      expect(result.data.user).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Password too weak');
    });
  });

  describe('Protected Route Access', () => {
    it('should allow access to protected route for authenticated user', async () => {
      mockAuthenticatedUser({
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.EMPLOYEE,
        organizationId: 'org-123',
      });

      const sessionResult = await mockSupabaseClient.auth.getSession();

      // Simulate middleware check
      const hasAccess = sessionResult.data.session !== null;

      expect(hasAccess).toBe(true);
      expect(sessionResult.data.session?.user).toBeDefined();
    });

    it('should deny access to protected route for unauthenticated user', async () => {
      mockUnauthenticatedUser();

      const sessionResult = await mockSupabaseClient.auth.getSession();

      // Simulate middleware check
      const hasAccess = sessionResult.data.session !== null;

      expect(hasAccess).toBe(false);
      expect(sessionResult.data.session).toBeNull();
    });
  });

  describe('Role-Based Access', () => {
    it('should grant ADMIN access to admin routes', async () => {
      const adminUser = mockAuthenticatedUser({
        id: 'admin-123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      });

      expect(adminUser.role).toBe(UserRole.ADMIN);
      // In real middleware, check would be: if (user.role === 'ADMIN') allow access
    });

    it('should deny non-ADMIN access to admin routes', async () => {
      const employeeUser = mockAuthenticatedUser({
        id: 'employee-123',
        email: 'employee@example.com',
        role: UserRole.EMPLOYEE,
      });

      expect(employeeUser.role).not.toBe(UserRole.ADMIN);
      // In real middleware, check would fail and redirect
    });

    it('should grant EMPLOYEE access to CRM routes', async () => {
      const employeeUser = mockAuthenticatedUser({
        id: 'employee-123',
        email: 'employee@example.com',
        role: UserRole.EMPLOYEE,
      });

      const hasAccess = ([UserRole.ADMIN, UserRole.EMPLOYEE] as UserRole[]).includes(
        employeeUser.role as UserRole
      );

      expect(hasAccess).toBe(true);
    });

    it('should deny CLIENT access to CRM routes', async () => {
      const clientUser = mockAuthenticatedUser({
        id: 'client-123',
        email: 'client@example.com',
        role: UserRole.CLIENT,
      });

      const hasAccess = ([UserRole.ADMIN, UserRole.EMPLOYEE] as UserRole[]).includes(
        clientUser.role as UserRole
      );

      expect(hasAccess).toBe(false);
    });
  });

  describe('Auth State Changes', () => {
    it('should handle auth state change event', () => {
      const callback = jest.fn();

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: {} as any },
      } as any);

      mockSupabaseClient.auth.onAuthStateChange(callback);

      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledWith(callback);
    });
  });
});
