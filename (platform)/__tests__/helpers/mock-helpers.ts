/**
 * Type-safe mock helpers for Jest testing
 *
 * These utilities provide strongly-typed mocks for async/sync functions
 * and common setup patterns for auth and database mocks.
 */

/**
 * Type-safe mock helper for async functions
 *
 * @example
 * const mockFn = jest.fn();
 * const typedMock = mockAsyncFunction(mockFn);
 * typedMock.mockResolvedValue(result);
 */
export function mockAsyncFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T
): jest.MockedFunction<T> {
  return fn as jest.MockedFunction<T>;
}

/**
 * Type-safe mock helper for sync functions
 *
 * @example
 * const mockFn = jest.fn();
 * const typedMock = mockFunction(mockFn);
 * typedMock.mockReturnValue(result);
 */
export function mockFunction<T extends (...args: any[]) => any>(
  fn: T
): jest.MockedFunction<T> {
  return fn as jest.MockedFunction<T>;
}

/**
 * Setup common auth mocks
 * Returns mock user data for testing
 *
 * @example
 * beforeEach(() => {
 *   const { mockUser } = setupAuthMocks();
 *   // Use mockUser in tests
 * });
 */
export function setupAuthMocks() {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    organizationId: 'test-org-id',
    globalRole: 'USER' as const,
    organizationRole: 'ADMIN' as const,
  };

  const { getCurrentUser, requireAuth } = require('@/lib/auth/auth-helpers');

  mockAsyncFunction(getCurrentUser).mockResolvedValue(mockUser);
  mockAsyncFunction(requireAuth).mockResolvedValue({ user: mockUser });

  return { mockUser };
}

/**
 * Setup Prisma mocks
 * Returns mocked Prisma client for further configuration
 *
 * @example
 * beforeEach(() => {
 *   const prisma = setupPrismaMocks();
 *   mockAsyncFunction(prisma.customer.findMany).mockResolvedValue([...]);
 * });
 */
export function setupPrismaMocks() {
  const { prisma } = require('@/lib/database/prisma');

  // Return mock prisma for further configuration
  return prisma;
}
