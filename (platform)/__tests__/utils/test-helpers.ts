/**
 * Test Utilities and Helpers
 * Provides database cleanup, test data creation, and utility functions for tests
 */

import { PrismaClient, UserRole, SubscriptionTier, OrgRole, SubscriptionStatus } from '@prisma/client';

// Create a separate Prisma client for tests
export const testPrisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: process.env.TEST_DEBUG === 'true' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Clean all tables in the database
 * IMPORTANT: Call this in beforeEach to ensure test isolation
 */
export async function cleanDatabase() {
  const tables = [
    'activity_logs',
    'ai_conversations',
    'appointments',
    'attachments',
    'content',
    'conversations',
    'customers',
    'notifications',
    'organization_members',
    'projects',
    'subscriptions',
    'tasks',
    'usage_tracking',
    'organizations',
    'users',
  ];

  // Disable foreign key checks, truncate tables, re-enable checks
  await testPrisma.$executeRawUnsafe('SET session_replication_role = replica;');

  for (const table of tables) {
    await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }

  await testPrisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');
}

/**
 * Connect to test database
 */
export async function connectTestDb() {
  await testPrisma.$connect();
}

/**
 * Disconnect from test database
 */
export async function disconnectTestDb() {
  await testPrisma.$disconnect();
}

/**
 * Create a test user
 */
export async function createTestUser(overrides: Partial<{
  email: string;
  name: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  isActive: boolean;
}> = {}) {
  return await testPrisma.users.create({
    data: {
      email: overrides.email || `test-${Date.now()}@example.com`,
      name: overrides.name || 'Test User',
      role: overrides.role || UserRole.USER,
      subscription_tier: overrides.subscriptionTier || SubscriptionTier.FREE,
      is_active: overrides.isActive ?? true,
    },
  });
}

/**
 * Create a test organization
 */
export async function createTestOrganization(overrides: Partial<{
  name: string;
  slug: string;
  description: string;
  subscriptionStatus: SubscriptionStatus;
}> = {}) {
  const timestamp = Date.now();
  return await testPrisma.organizations.create({
    data: {
      name: overrides.name || `Test Org ${timestamp}`,
      slug: overrides.slug || `test-org-${timestamp}`,
      description: overrides.description || 'Test organization',
      subscription_status: overrides.subscriptionStatus || SubscriptionStatus.TRIAL,
    },
  });
}

/**
 * Create organization member (link user to organization)
 */
export async function createOrganizationMember(
  userId: string,
  organizationId: string,
  role: OrgRole = OrgRole.MEMBER
) {
  return await testPrisma.organization_members.create({
    data: {
      user_id: userId,
      organization_id: organizationId,
      role,
    },
  });
}

/**
 * Create a complete test setup: organization + user + membership
 */
export async function createTestOrgWithUser(userRole: OrgRole = OrgRole.OWNER) {
  const organization = await createTestOrganization();
  const user = await createTestUser();
  const membership = await createOrganizationMember(user.id, organization.id, userRole);

  return { organization, user, membership };
}

/**
 * Create a test customer
 */
export async function createTestCustomer(
  organizationId: string,
  overrides: Partial<{
    name: string;
    email: string;
    phone: string;
    company: string;
    status: any;
  }> = {}
) {
  const timestamp = Date.now();
  return await testPrisma.customers.create({
    data: {
      organizationId,
      name: overrides.name || `Test Customer ${timestamp}`,
      email: overrides.email || `customer-${timestamp}@example.com`,
      phone: overrides.phone || '+1234567890',
      company: overrides.company || `Test Company ${timestamp}`,
      ...(overrides.status && { status: overrides.status }),
    },
  });
}

/**
 * Wait for a condition to be true (useful for async operations)
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Create a mock file for upload testing
 */
export function createMockFile(
  filename: string = 'test.pdf',
  type: string = 'application/pdf',
  size: number = 1024
): File {
  const blob = new Blob(['test content'], { type });
  return new File([blob], filename, { type });
}

/**
 * Delay execution (useful for testing timeouts)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
