/**
 * Test Utilities - Centralized Exports
 * Single import source for all test utilities, mocks, and helpers
 *
 * @example
 * import { prismaMock, mockUser, createTestUser } from '@/lib/test';
 */

// ========================================
// Mock Setup & Utilities (lib/test/)
// ========================================

// Re-export everything from setup.ts (Prisma mocks, Supabase mocks, auth helpers)
export {
  prismaMock,
  resetMocks,
  mockSupabaseClient,
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
  createMockRequest,
  createMockResponse,
  mockNextRouter,
  mockFetch,
  expectToThrowAsync,
  expectServerActionSuccess,
  expectServerActionError,
  waitForAsync,
  flushPromises,
} from './setup';

// Re-export everything from utils.ts (test utilities, assertions, helpers)
export {
  isTestEnvironment,
  getTestDatabaseUrl,
  generateTestId,
  generateTestEmail,
  cleanTestEnv,
  setupTestEnv,
  suppressConsoleLogs,
  captureConsole,
  retryUntilSuccess,
  createSnapshotName,
  assertDeepEqualExcept,
  assertInRange,
  assertRecentTimestamp,
  measureExecutionTime,
  assertExecutesWithin,
} from './utils';

// ========================================
// Mock Factories (__tests__/utils/)
// ========================================

// Re-export mock factories from existing test utilities
export {
  mockUser,
  mockOrganization,
  mockOrganizationMember,
  mockCustomer,
  mockProject,
  mockTask,
  mockNotification,
  mockAttachment,
  mockAIConversation,
  mockSubscription,
  mockMany,
} from '../../__tests__/utils/mock-factories';

// ========================================
// Integration Test Helpers (__tests__/utils/)
// ========================================

// Re-export database test helpers
export {
  testPrisma,
  cleanDatabase,
  connectTestDb,
  disconnectTestDb,
  createTestUser,
  createTestOrganization,
  createOrganizationMember,
  createTestOrgWithUser,
  createTestCustomer,
  waitFor,
  createMockFile,
  delay,
} from '../../__tests__/utils/test-helpers';

// ========================================
// Test Fixtures (__tests__/fixtures/)
// ========================================

// Re-export test fixtures (predefined users, test cases)
export {
  testUsers,
  passwordTestCases,
  emailTestCases,
} from '../../__tests__/fixtures/users';

// Re-export organization fixtures (if exists)
export type { } from '../../__tests__/fixtures/organizations';

// Re-export project fixtures (if exists)
export type { } from '../../__tests__/fixtures/projects';

// ========================================
// Type Exports
// ========================================

// Export types for better TypeScript support
export type {
  PrismaClient,
} from '@prisma/client';

/**
 * @example
 * // Unit Test Example (with mocks)
 * import { prismaMock, mockUser, resetMocks } from '@/lib/test';
 *
 * describe('UserService', () => {
 *   beforeEach(() => resetMocks());
 *
 *   it('should create user', async () => {
 *     const mockData = mockUser({ email: 'test@example.com' });
 *     prismaMock.user.create.mockResolvedValue(mockData);
 *
 *     const result = await createUser({ email: 'test@example.com' });
 *     expect(result).toEqual(mockData);
 *   });
 * });
 *
 * @example
 * // Integration Test Example (with real database)
 * import { testPrisma, cleanDatabase, createTestUser } from '@/lib/test';
 *
 * describe('User Integration Tests', () => {
 *   beforeEach(async () => await cleanDatabase());
 *
 *   it('should persist user to database', async () => {
 *     const user = await createTestUser({ email: 'test@example.com' });
 *     const found = await testPrisma.user.findUnique({ where: { id: user.id } });
 *
 *     expect(found).toBeDefined();
 *     expect(found?.email).toBe('test@example.com');
 *   });
 * });
 */
