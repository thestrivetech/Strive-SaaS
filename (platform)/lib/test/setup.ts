/**
 * Test Setup and Mock Utilities
 * Provides mock Prisma client, Supabase client, and auth helpers for unit tests
 */

import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

/**
 * Deep mock of Prisma client for unit tests
 * Use testPrisma from __tests__/utils/test-helpers.ts for integration tests
 */
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

/**
 * Reset all mocks to clean state
 * Call this in beforeEach() to ensure test isolation
 */
export function resetMocks(): void {
  mockReset(prismaMock);
}

/**
 * Mock Supabase client for unit tests
 * Provides basic auth and database mocks
 */
export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signOut: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    refreshSession: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      getPublicUrl: jest.fn(),
      createSignedUrl: jest.fn(),
    })),
  },
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  })),
};

/**
 * Mock authenticated user session for tests
 * Use in Server Actions and API routes that require auth
 */
export function mockAuthenticatedUser(user: {
  id: string;
  email: string;
  role?: string;
  organizationId?: string;
}) {
  const mockUser = {
    id: user.id,
    email: user.email,
    role: user.role || 'EMPLOYEE',
    organizationId: user.organizationId || 'test-org-id',
  };

  mockSupabaseClient.auth.getUser.mockResolvedValue({
    data: { user: mockUser as any },
    error: null,
  });

  mockSupabaseClient.auth.getSession.mockResolvedValue({
    data: {
      session: {
        user: mockUser as any,
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      },
    },
    error: null,
  });

  return mockUser;
}

/**
 * Mock unauthenticated session (no user)
 * Use to test auth-required routes/actions
 */
export function mockUnauthenticatedUser() {
  mockSupabaseClient.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: { message: 'Not authenticated', status: 401 } as any,
  });

  mockSupabaseClient.auth.getSession.mockResolvedValue({
    data: { session: null },
    error: { message: 'Not authenticated', status: 401 } as any,
  });
}

/**
 * Create mock Next.js Request object
 * Useful for testing middleware and API routes
 */
export function createMockRequest(options: {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
} = {}): Request {
  const url = options.url || 'http://localhost:3000/';
  const method = options.method || 'GET';
  const headers = new Headers(options.headers || {});

  return new Request(url, {
    method,
    headers,
    ...(options.body && { body: JSON.stringify(options.body) }),
  });
}

/**
 * Create mock Next.js Response object
 * Useful for testing middleware
 */
export function createMockResponse(data: any = {}, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Mock Next.js router for component tests
 * Returns mocked router with common methods
 */
export function mockNextRouter(overrides: {
  push?: jest.Mock;
  replace?: jest.Mock;
  pathname?: string;
  query?: Record<string, string>;
} = {}) {
  return {
    push: overrides.push || jest.fn(),
    replace: overrides.replace || jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: overrides.pathname || '/',
    query: overrides.query || {},
    asPath: overrides.pathname || '/',
  };
}

/**
 * Mock fetch for API calls
 * Returns a mock response with the given data
 */
export function mockFetch(response: any, status: number = 200): void {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: async () => response,
      text: async () => JSON.stringify(response),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    } as Response)
  );
}

/**
 * Async assertion helper
 * Expects a function to throw with a specific error message
 */
export async function expectToThrowAsync(
  fn: () => Promise<any>,
  errorMessage?: string | RegExp
): Promise<void> {
  let error: Error | undefined;

  try {
    await fn();
  } catch (e) {
    error = e as Error;
  }

  if (!error) {
    throw new Error('Expected function to throw an error, but it did not');
  }

  if (errorMessage) {
    if (typeof errorMessage === 'string') {
      expect(error.message).toContain(errorMessage);
    } else {
      expect(error.message).toMatch(errorMessage);
    }
  }
}

/**
 * Test that a Server Action succeeds
 * Expects result.success to be true
 */
export function expectServerActionSuccess(result: any): void {
  expect(result).toBeDefined();
  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
  expect(result.error).toBeUndefined();
}

/**
 * Test that a Server Action fails
 * Expects result.success to be false and error message to be present
 */
export function expectServerActionError(result: any, errorMessage?: string): void {
  expect(result).toBeDefined();
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();

  if (errorMessage) {
    expect(result.error).toContain(errorMessage);
  }
}

/**
 * Wait for async operations to complete
 * Useful for testing async state updates
 */
export async function waitForAsync(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Flush all pending promises
 * Useful after triggering async operations
 */
export async function flushPromises(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}
