/**
 * Shared test setup for Marketplace Tools tests
 */

import { ToolCategory, ToolTier } from '@prisma/client';
import {
  testPrisma,
  cleanDatabase,
  connectTestDb,
  disconnectTestDb,
} from '@/__tests__/utils/test-helpers';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessMarketplace, canPurchaseTools } from '@/lib/auth/rbac';

// Mock auth helpers
jest.mock('@/lib/auth/auth-helpers', () => ({
  requireAuth: jest.fn(),
  getCurrentUser: jest.fn(),
}));

// Mock RBAC
jest.mock('@/lib/auth/rbac', () => ({
  canAccessMarketplace: jest.fn(() => true),
  canPurchaseTools: jest.fn(() => true),
}));

// Mock Next.js cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock tenant context
jest.mock('@/lib/database/utils', () => ({
  withTenantContext: jest.fn((callback) => callback()),
}));

export const setupMarketplaceToolsTests = () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await cleanDatabase();
    jest.clearAllMocks();
  });
};

export { testPrisma, getCurrentUser, canAccessMarketplace, canPurchaseTools, ToolCategory, ToolTier };
