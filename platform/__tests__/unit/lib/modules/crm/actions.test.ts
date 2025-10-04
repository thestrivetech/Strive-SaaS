/**
 * CRM Actions Test Suite
 * Tests for Customer CRUD operations with multi-tenant isolation
 */

import { CustomerStatus, CustomerSource } from '@prisma/client';
import {
  testPrisma,
  cleanDatabase,
  createTestOrgWithUser,
  createTestCustomer,
  connectTestDb,
  disconnectTestDb,
} from '@/__tests__/utils/test-helpers';
import { createCustomer, updateCustomer, deleteCustomer } from '@/lib/modules/crm/actions';

// Mock Supabase auth
jest.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClientWithAuth: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({
        data: {
          user: { id: 'mock-user-id', email: 'test@example.com' },
        },
      })),
    },
  })),
}));

// Mock organization queries
jest.mock('@/lib/modules/organization/queries', () => ({
  getUserOrganizations: jest.fn((userId: string) =>
    Promise.resolve([
      { organizationId: 'mock-org-id', role: 'OWNER' },
    ])
  ),
}));

// Mock Next.js cache revalidation
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('CRM Actions', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  describe('createCustomer', () => {
    it('should create a customer successfully', async () => {
      const { organization } = await createTestOrgWithUser();

      // Mock getUserOrganizations to return the test organization
      const { getUserOrganizations } = require('@/lib/modules/organization/queries');
      getUserOrganizations.mockResolvedValueOnce([
        { organizationId: organization.id, role: 'OWNER' },
      ]);

      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Corp',
        status: CustomerStatus.LEAD,
        source: CustomerSource.WEBSITE,
        tags: ['vip', 'enterprise'],
        organizationId: organization.id,
      };

      const customer = await createCustomer(input);

      expect(customer).toBeDefined();
      expect(customer.name).toBe('John Doe');
      expect(customer.email).toBe('john@example.com');
      expect(customer.status).toBe(CustomerStatus.LEAD);
      expect(customer.tags).toEqual(['vip', 'enterprise']);

      // Verify customer exists in database
      const dbCustomer = await testPrisma.customer.findUnique({
        where: { id: customer.id },
      });
      expect(dbCustomer).toBeDefined();
      expect(dbCustomer?.name).toBe('John Doe');
    });

    it('should validate required fields', async () => {
      const { organization } = await createTestOrgWithUser();

      const invalidInput = {
        name: 'J', // Too short (min 2 characters)
        status: CustomerStatus.LEAD,
        source: CustomerSource.WEBSITE,
        tags: [],
        organizationId: organization.id,
      };

      await expect(createCustomer(invalidInput)).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const { organization } = await createTestOrgWithUser();

      const invalidInput = {
        name: 'John Doe',
        email: 'invalid-email', // Invalid email format
        status: CustomerStatus.LEAD,
        source: CustomerSource.WEBSITE,
        tags: [],
        organizationId: organization.id,
      };

      await expect(createCustomer(invalidInput)).rejects.toThrow();
    });

    it('should prevent unauthorized access', async () => {
      const { organization } = await createTestOrgWithUser();

      // Mock getUserOrganizations to return empty (no access)
      const { getUserOrganizations } = require('@/lib/modules/organization/queries');
      getUserOrganizations.mockResolvedValueOnce([]);

      const input = {
        name: 'John Doe',
        status: CustomerStatus.LEAD,
        source: CustomerSource.WEBSITE,
        tags: [],
        organizationId: organization.id,
      };

      await expect(createCustomer(input)).rejects.toThrow(
        'You do not have access to this organization'
      );
    });

    it('should create activity log on customer creation', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getUserOrganizations } = require('@/lib/modules/organization/queries');
      getUserOrganizations.mockResolvedValueOnce([
        { organizationId: organization.id, role: 'OWNER' },
      ]);

      // Update mock to return actual user ID
      const { createServerSupabaseClientWithAuth } = require('@/lib/supabase-server');
      createServerSupabaseClientWithAuth.mockReturnValueOnce({
        auth: {
          getUser: jest.fn(() => ({
            data: { user: { id: user.id, email: user.email } },
          })),
        },
      });

      const input = {
        name: 'John Doe',
        status: CustomerStatus.LEAD,
        source: CustomerSource.WEBSITE,
        tags: [],
        organizationId: organization.id,
      };

      const customer = await createCustomer(input);

      // Check activity log was created
      const activityLog = await testPrisma.activityLog.findFirst({
        where: {
          resourceType: 'customer',
          resourceId: customer.id,
          action: 'created_customer',
        },
      });

      expect(activityLog).toBeDefined();
      expect(activityLog?.userId).toBe(user.id);
    });
  });

  describe('updateCustomer', () => {
    it('should update customer successfully', async () => {
      const { organization } = await createTestOrgWithUser();
      const customer = await createTestCustomer(organization.id, {
        name: 'Original Name',
        status: CustomerStatus.LEAD,
      });

      const { getUserOrganizations } = require('@/lib/modules/organization/queries');
      getUserOrganizations.mockResolvedValueOnce([
        { organizationId: organization.id, role: 'OWNER' },
      ]);

      const updateInput = {
        id: customer.id,
        name: 'Updated Name',
        status: CustomerStatus.ACTIVE,
      };

      const updated = await updateCustomer(updateInput);

      expect(updated.name).toBe('Updated Name');
      expect(updated.status).toBe(CustomerStatus.ACTIVE);

      // Verify in database
      const dbCustomer = await testPrisma.customer.findUnique({
        where: { id: customer.id },
      });
      expect(dbCustomer?.name).toBe('Updated Name');
    });

    it('should reject update for non-existent customer', async () => {
      await createTestOrgWithUser();

      const updateInput = {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Updated Name',
      };

      await expect(updateCustomer(updateInput)).rejects.toThrow('Customer not found');
    });

    it('should prevent unauthorized update', async () => {
      const { organization } = await createTestOrgWithUser();
      const customer = await createTestCustomer(organization.id);

      const { getUserOrganizations } = require('@/lib/modules/organization/queries');
      getUserOrganizations.mockResolvedValueOnce([]); // No access

      const updateInput = {
        id: customer.id,
        name: 'Updated Name',
      };

      await expect(updateCustomer(updateInput)).rejects.toThrow(
        'You do not have access to this organization'
      );
    });
  });

  describe('deleteCustomer', () => {
    it('should delete customer successfully', async () => {
      const { organization } = await createTestOrgWithUser();
      const customer = await createTestCustomer(organization.id);

      const { getUserOrganizations } = require('@/lib/modules/organization/queries');
      getUserOrganizations.mockResolvedValueOnce([
        { organizationId: organization.id, role: 'OWNER' },
      ]);

      const result = await deleteCustomer(customer.id);

      expect(result.success).toBe(true);

      // Verify customer is deleted
      const dbCustomer = await testPrisma.customer.findUnique({
        where: { id: customer.id },
      });
      expect(dbCustomer).toBeNull();
    });

    it('should reject delete for non-existent customer', async () => {
      await createTestOrgWithUser();

      await expect(
        deleteCustomer('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow('Customer not found');
    });

    it('should prevent unauthorized delete', async () => {
      const { organization } = await createTestOrgWithUser();
      const customer = await createTestCustomer(organization.id);

      const { getUserOrganizations } = require('@/lib/modules/organization/queries');
      getUserOrganizations.mockResolvedValueOnce([]); // No access

      await expect(deleteCustomer(customer.id)).rejects.toThrow(
        'You do not have access to this organization'
      );
    });

    it('should create activity log on deletion', async () => {
      const { organization, user } = await createTestOrgWithUser();
      const customer = await createTestCustomer(organization.id);

      const { getUserOrganizations } = require('@/lib/modules/organization/queries');
      getUserOrganizations.mockResolvedValueOnce([
        { organizationId: organization.id, role: 'OWNER' },
      ]);

      const { createServerSupabaseClientWithAuth } = require('@/lib/supabase-server');
      createServerSupabaseClientWithAuth.mockReturnValueOnce({
        auth: {
          getUser: jest.fn(() => ({
            data: { user: { id: user.id, email: user.email } },
          })),
        },
      });

      await deleteCustomer(customer.id);

      // Check activity log
      const activityLog = await testPrisma.activityLog.findFirst({
        where: {
          resourceType: 'customer',
          resourceId: customer.id,
          action: 'deleted_customer',
        },
      });

      expect(activityLog).toBeDefined();
    });
  });

  describe('Multi-tenant Isolation', () => {
    it('should prevent accessing customers from other organizations', async () => {
      const { organization: org1 } = await createTestOrgWithUser();
      const { organization: org2 } = await createTestOrgWithUser();

      const customer1 = await createTestCustomer(org1.id);
      const customer2 = await createTestCustomer(org2.id);

      // User from org1 trying to access customer from org2
      const { getUserOrganizations } = require('@/lib/modules/organization/queries');
      getUserOrganizations.mockResolvedValueOnce([
        { organizationId: org1.id, role: 'OWNER' },
      ]);

      await expect(updateCustomer({ id: customer2.id, name: 'Hacked' })).rejects.toThrow(
        'You do not have access to this organization'
      );

      await expect(deleteCustomer(customer2.id)).rejects.toThrow(
        'You do not have access to this organization'
      );
    });
  });
});
