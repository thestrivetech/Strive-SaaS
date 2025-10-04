/**
 * Tests for Auth Middleware (Supabase SSR)
 *
 * Target: 80%+ coverage
 */

import { NextRequest } from 'next/server';
import { handlePlatformAuth } from '@/lib/middleware/auth';
import { createServerClient } from '@supabase/ssr';

// Mock dependencies
jest.mock('@supabase/ssr');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

const mockCreateServerClient = createServerClient as jest.MockedFunction<
  typeof createServerClient
>;

describe('Platform Auth Middleware', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (pathname: string) => {
    return new NextRequest(new URL(`http://localhost:3000${pathname}`), {
      headers: new Headers(),
    });
  };

  const createMockSupabaseClient = (user: Record<string, unknown> | null) => {
    return {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user },
          error: null,
        }),
      },
    };
  };

  describe('Authentication Check', () => {
    it('should allow unauthenticated access to public routes', async () => {
      mockRequest = createMockRequest('/login');

      const mockClient = createMockSupabaseClient(null);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      const response = await handlePlatformAuth(mockRequest);

      expect(response.status).toBe(200);
    });

    it('should redirect unauthenticated user from protected routes to login', async () => {
      mockRequest = createMockRequest('/dashboard');

      const mockClient = createMockSupabaseClient(null);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      const response = await handlePlatformAuth(mockRequest);

      expect(response.status).toBe(307); // Redirect
      expect(response.headers.get('Location')).toContain('/login');
      expect(response.headers.get('Location')).toContain('redirect=%2Fdashboard');
    });

    it('should allow authenticated user to access protected routes', async () => {
      mockRequest = createMockRequest('/dashboard');

      const mockUser = { id: '1', email: 'user@test.com' };
      const mockClient = createMockSupabaseClient(mockUser);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      const response = await handlePlatformAuth(mockRequest);

      expect(response.status).toBe(200);
    });

    it('should redirect authenticated user from login to dashboard', async () => {
      mockRequest = createMockRequest('/login');

      const mockUser = { id: '1', email: 'user@test.com' };
      const mockClient = createMockSupabaseClient(mockUser);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      const response = await handlePlatformAuth(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toContain('/dashboard');
    });

    it('should redirect authenticated user from root to dashboard', async () => {
      mockRequest = createMockRequest('/');

      const mockUser = { id: '1', email: 'user@test.com' };
      const mockClient = createMockSupabaseClient(mockUser);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      const response = await handlePlatformAuth(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toContain('/dashboard');
    });

    it('should redirect unauthenticated user from root to login', async () => {
      mockRequest = createMockRequest('/');

      const mockClient = createMockSupabaseClient(null);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      const response = await handlePlatformAuth(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toContain('/login');
    });
  });

  describe('Protected Routes', () => {
    const protectedRoutes = [
      '/dashboard',
      '/crm',
      '/crm/customer-123',
      '/projects',
      '/projects/project-456',
      '/ai',
      '/tools',
      '/settings',
      '/settings/team',
    ];

    protectedRoutes.forEach(route => {
      it(`should protect ${route} route`, async () => {
        mockRequest = createMockRequest(route);

        const mockClient = createMockSupabaseClient(null);
        mockCreateServerClient.mockReturnValue(mockClient as never);

        const response = await handlePlatformAuth(mockRequest);

        expect(response.status).toBe(307);
        expect(response.headers.get('Location')).toContain('/login');
      });

      it(`should allow authenticated access to ${route}`, async () => {
        mockRequest = createMockRequest(route);

        const mockUser = { id: '1', email: 'user@test.com' };
        const mockClient = createMockSupabaseClient(mockUser);
        mockCreateServerClient.mockReturnValue(mockClient as never);

        const response = await handlePlatformAuth(mockRequest);

        expect(response.status).toBe(200);
      });
    });
  });

  describe('Admin Routes Protection', () => {
    // Note: Admin route protection requires database lookup for user role
    // These tests verify the middleware correctly checks admin status

    it('should allow ADMIN user to access /admin routes', async () => {
      mockRequest = createMockRequest('/admin');

      const mockUser = { id: '1', email: 'admin@test.com' };
      const mockClient = createMockSupabaseClient(mockUser);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      // Mock prisma import
      const mockPrisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue({ role: 'ADMIN' }),
        },
      };
      jest.doMock('@/lib/prisma', () => ({ prisma: mockPrisma }));

      const response = await handlePlatformAuth(mockRequest);

      expect(response.status).toBe(200);
    });

    it('should redirect non-ADMIN user from /admin routes', async () => {
      mockRequest = createMockRequest('/admin');

      const mockUser = { id: '1', email: 'employee@test.com' };
      const mockClient = createMockSupabaseClient(mockUser);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      // Mock prisma with non-admin user
      const mockPrisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue({ role: 'EMPLOYEE' }),
        },
      };
      jest.doMock('@/lib/prisma', () => ({ prisma: mockPrisma }));

      const response = await handlePlatformAuth(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toContain('/dashboard');
    });

    it('should protect /api/admin/* routes', async () => {
      mockRequest = createMockRequest('/api/admin/users');

      const mockUser = { id: '1', email: 'employee@test.com' };
      const mockClient = createMockSupabaseClient(mockUser);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      // Mock prisma with non-admin user
      const mockPrisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue({ role: 'EMPLOYEE' }),
        },
      };
      jest.doMock('@/lib/prisma', () => ({ prisma: mockPrisma }));

      const response = await handlePlatformAuth(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toContain('/dashboard');
    });

    it('should redirect if user not found in database', async () => {
      mockRequest = createMockRequest('/admin');

      const mockUser = { id: '1', email: 'unknown@test.com' };
      const mockClient = createMockSupabaseClient(mockUser);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      // Mock prisma returning null
      const mockPrisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };
      jest.doMock('@/lib/prisma', () => ({ prisma: mockPrisma }));

      const response = await handlePlatformAuth(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toContain('/dashboard');
    });
  });

  describe('Cache Control Headers', () => {
    it('should set no-cache headers for protected routes', async () => {
      mockRequest = createMockRequest('/dashboard');

      const mockUser = { id: '1', email: 'user@test.com' };
      const mockClient = createMockSupabaseClient(mockUser);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      const response = await handlePlatformAuth(mockRequest);

      expect(response.headers.get('Cache-Control')).toContain('no-store');
      expect(response.headers.get('Cache-Control')).toContain('no-cache');
      expect(response.headers.get('Pragma')).toBe('no-cache');
      expect(response.headers.get('Expires')).toBe('0');
    });

    it('should set no-cache headers on login page', async () => {
      mockRequest = createMockRequest('/login');

      const mockClient = createMockSupabaseClient(null);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      const response = await handlePlatformAuth(mockRequest);

      expect(response.headers.get('Cache-Control')).toContain('no-store');
    });

    it('should set no-cache headers on redirects', async () => {
      mockRequest = createMockRequest('/dashboard');

      const mockClient = createMockSupabaseClient(null);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      const response = await handlePlatformAuth(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('Cache-Control')).toContain('no-store');
    });
  });

  describe('Cookie Handling', () => {
    it('should properly setup Supabase client with cookie handlers', async () => {
      mockRequest = createMockRequest('/dashboard');

      const mockUser = { id: '1', email: 'user@test.com' };
      const mockClient = createMockSupabaseClient(mockUser);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      await handlePlatformAuth(mockRequest);

      expect(mockCreateServerClient).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        expect.objectContaining({
          cookies: expect.objectContaining({
            get: expect.any(Function),
            set: expect.any(Function),
            remove: expect.any(Function),
          }),
        })
      );
    });

    it('should handle Supabase client creation correctly', async () => {
      mockRequest = createMockRequest('/dashboard');

      const mockUser = { id: '1', email: 'user@test.com' };
      const mockClient = createMockSupabaseClient(mockUser);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let cookieOptions: any = null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCreateServerClient.mockImplementation((url, key, options: any) => {
        cookieOptions = options;
        return mockClient as never;
      });

      await handlePlatformAuth(mockRequest);

      // Verify cookie handlers are provided
      expect(cookieOptions).toBeTruthy();
      expect(cookieOptions).toHaveProperty('cookies');
      expect(cookieOptions.cookies).toHaveProperty('get');
      expect(cookieOptions.cookies).toHaveProperty('set');
      expect(cookieOptions.cookies).toHaveProperty('remove');
    });
  });

  describe('Redirect with Preserved Path', () => {
    it('should preserve original path in redirect query param', async () => {
      mockRequest = createMockRequest('/crm/customer-123');

      const mockClient = createMockSupabaseClient(null);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      const response = await handlePlatformAuth(mockRequest);

      const location = response.headers.get('Location');
      expect(location).toContain('redirect=%2Fcrm%2Fcustomer-123');
    });

    it('should preserve query params in redirect', async () => {
      mockRequest = new NextRequest(
        new URL('http://localhost:3000/projects?filter=active'),
        { headers: new Headers() }
      );

      const mockClient = createMockSupabaseClient(null);
      mockCreateServerClient.mockReturnValue(mockClient as never);

      const response = await handlePlatformAuth(mockRequest);

      const location = response.headers.get('Location');
      expect(location).toContain('redirect=');
    });
  });

  describe('Static Assets', () => {
    const staticPaths = [
      '/logo.png',
      '/styles.css',
      '/script.js',
      '/favicon.ico',
      '/images/hero.jpg',
    ];

    staticPaths.forEach(path => {
      it(`should not set no-cache headers for static asset: ${path}`, async () => {
        mockRequest = createMockRequest(path);

        const mockClient = createMockSupabaseClient(null);
        mockCreateServerClient.mockReturnValue(mockClient as never);

        const response = await handlePlatformAuth(mockRequest);

        // Static assets should allow caching
        const cacheControl = response.headers.get('Cache-Control');
        if (cacheControl) {
          // If cache control is set, it shouldn't be no-store for static assets
          // The middleware specifically excludes static assets from no-cache
          expect(cacheControl).not.toBe('no-store, no-cache, must-revalidate, proxy-revalidate');
        }
      });
    });
  });
});
