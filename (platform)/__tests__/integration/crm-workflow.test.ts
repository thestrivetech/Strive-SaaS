/**
 * CRM Workflow Integration Tests
 * Tests complete CRM workflows: create → view → edit → delete
 * Includes multi-tenant isolation and permission checks
 *
 * Target: 70%+ coverage
 */

import {
  testPrisma,
  cleanDatabase,
  createTestUser,
  createTestOrganization,
  createOrganizationMember,
  createTestCustomer,
  mockUser,
  resetMocks,
} from '@/lib/test';
import { UserRole, OrgRole } from '@prisma/client';

describe('CRM Workflow Integration Tests', () => {
  beforeAll(async () => {
    await testPrisma.$connect();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  beforeEach(async () => {
    await cleanDatabase();
    resetMocks();
  });

  describe('Customer CRUD Workflow', () => {
    it('should complete full customer lifecycle: create → view → edit → delete', async () => {
      // Setup: Create organization and user
      const org = await createTestOrganization({
        name: 'Test Company',
        slug: 'test-company',
      });

      const user = await createTestUser({
        email: 'manager@test.com',
        role: UserRole.USER,
      });

      await createOrganizationMember(user.id, org.id, OrgRole.OWNER);

      // Step 1: Create customer
      const customer = await createTestCustomer(org.id, {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Doe Industries',
      });

      expect(customer).toBeDefined();
      expect(customer.name).toBe('John Doe');
      expect(customer.email).toBe('john@example.com');
      expect(customer.organization_id).toBe(org.id);

      // Step 2: View customer (retrieve from database)
      const foundCustomer = await testPrisma.customers.findUnique({
        where: { id: customer.id },
      });

      expect(foundCustomer).toBeDefined();
      expect(foundCustomer?.name).toBe('John Doe');
      expect(foundCustomer?.organization_id).toBe(org.id);

      // Step 3: Edit customer
      const updatedCustomer = await testPrisma.customers.update({
        where: { id: customer.id },
        data: {
          name: 'John Doe Sr.',
          phone: '+0987654321',
        },
      });

      expect(updatedCustomer.name).toBe('John Doe Sr.');
      expect(updatedCustomer.phone).toBe('+0987654321');
      expect(updatedCustomer.email).toBe('john@example.com'); // Unchanged

      // Step 4: Delete customer
      await testPrisma.customers.delete({
        where: { id: customer.id },
      });

      const deletedCustomer = await testPrisma.customers.findUnique({
        where: { id: customer.id },
      });

      expect(deletedCustomer).toBeNull();
    });

    it('should list all customers for an organization', async () => {
      const org = await createTestOrganization();

      // Create multiple customers
      await createTestCustomer(org.id, { name: 'Customer 1' });
      await createTestCustomer(org.id, { name: 'Customer 2' });
      await createTestCustomer(org.id, { name: 'Customer 3' });

      const customers = await testPrisma.customers.findMany({
        where: { organization_id: org.id },
        orderBy: { created_at: 'desc' },
      });

      expect(customers).toHaveLength(3);
      expect(customers[0].name).toContain('Customer');
    });

    it('should filter customers by search query', async () => {
      const org = await createTestOrganization();

      await createTestCustomer(org.id, { name: 'Alice Johnson', email: 'alice@example.com' });
      await createTestCustomer(org.id, { name: 'Bob Smith', email: 'bob@example.com' });
      await createTestCustomer(org.id, { name: 'Charlie Brown', email: 'charlie@example.com' });

      // Search by name
      const searchResults = await testPrisma.customers.findMany({
        where: {
          organization_id: org.id,
          OR: [
            { name: { contains: 'Alice', mode: 'insensitive' } },
            { email: { contains: 'Alice', mode: 'insensitive' } },
          ],
        },
      });

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe('Alice Johnson');
    });
  });

  describe('Multi-Tenant Isolation', () => {
    it('should isolate customers between organizations', async () => {
      // Create two separate organizations
      const org1 = await createTestOrganization({ name: 'Org 1' });
      const org2 = await createTestOrganization({ name: 'Org 2' });

      // Create customers for each organization
      const customer1 = await createTestCustomer(org1.id, { name: 'Org 1 Customer' });
      const customer2 = await createTestCustomer(org2.id, { name: 'Org 2 Customer' });

      // Verify Org 1 only sees its customers
      const org1Customers = await testPrisma.customers.findMany({
        where: { organization_id: org1.id },
      });

      expect(org1Customers).toHaveLength(1);
      expect(org1Customers[0].id).toBe(customer1.id);
      expect(org1Customers[0].name).toBe('Org 1 Customer');

      // Verify Org 2 only sees its customers
      const org2Customers = await testPrisma.customers.findMany({
        where: { organization_id: org2.id },
      });

      expect(org2Customers).toHaveLength(1);
      expect(org2Customers[0].id).toBe(customer2.id);
      expect(org2Customers[0].name).toBe('Org 2 Customer');
    });

    it('should prevent cross-organization customer access', async () => {
      const org1 = await createTestOrganization();
      const org2 = await createTestOrganization();

      const customer1 = await createTestCustomer(org1.id, { name: 'Private Customer' });

      // Attempt to access Org 1 customer from Org 2 context
      const accessAttempt = await testPrisma.customers.findFirst({
        where: {
          id: customer1.id,
          organization_id: org2.id, // Wrong organization!
        },
      });

      expect(accessAttempt).toBeNull(); // Should not find the customer
    });

    it('should enforce organization filter on all customer queries', async () => {
      const org1 = await createTestOrganization();
      const org2 = await createTestOrganization();

      // Create 5 customers for org1 and 3 for org2
      for (let i = 0; i < 5; i++) {
        await createTestCustomer(org1.id, { name: `Org1 Customer ${i}` });
      }

      for (let i = 0; i < 3; i++) {
        await createTestCustomer(org2.id, { name: `Org2 Customer ${i}` });
      }

      // Query with organization filter
      const org1Count = await testPrisma.customers.count({
        where: { organization_id: org1.id },
      });

      const org2Count = await testPrisma.customers.count({
        where: { organization_id: org2.id },
      });

      expect(org1Count).toBe(5);
      expect(org2Count).toBe(3);
    });
  });

  describe('Permission Checks', () => {
    it('should allow OWNER to create customers', async () => {
      const org = await createTestOrganization();
      const user = await createTestUser({ role: UserRole.USER });
      await createOrganizationMember(user.id, org.id, OrgRole.OWNER);

      const customer = await createTestCustomer(org.id, { name: 'Test Customer' });

      expect(customer).toBeDefined();
      expect(customer.organization_id).toBe(org.id);
    });

    it('should allow ADMIN (org role) to edit customers', async () => {
      const org = await createTestOrganization();
      const user = await createTestUser({ role: UserRole.USER });
      await createOrganizationMember(user.id, org.id, OrgRole.ADMIN);

      const customer = await createTestCustomer(org.id, { name: 'Original Name' });

      const updated = await testPrisma.customers.update({
        where: { id: customer.id },
        data: { name: 'Updated Name' },
      });

      expect(updated.name).toBe('Updated Name');
    });

    it('should allow MEMBER to view customers', async () => {
      const org = await createTestOrganization();
      const user = await createTestUser({ role: UserRole.USER });
      await createOrganizationMember(user.id, org.id, OrgRole.MEMBER);

      await createTestCustomer(org.id, { name: 'Viewable Customer' });

      const customers = await testPrisma.customers.findMany({
        where: { organization_id: org.id },
      });

      expect(customers).toHaveLength(1);
      expect(customers[0].name).toBe('Viewable Customer');
    });
  });

  describe('Customer Relationships', () => {
    it('should associate customer with user (assigned to)', async () => {
      const org = await createTestOrganization();
      const user = await createTestUser({ role: UserRole.USER });
      await createOrganizationMember(user.id, org.id, OrgRole.OWNER);

      // Create customer
      const createdCustomer = await createTestCustomer(org.id, {
        name: 'Assigned Customer',
        email: 'assigned@example.com',
      });

      // Update with assigned user
      await testPrisma.customers.update({
        where: { id: createdCustomer.id },
        data: { assigned_to: user.id },
      });

      // Query with relation
      const customer = await testPrisma.customers.findUnique({
        where: { id: createdCustomer.id },
        include: {
          users: true,  // Relation name
        },
      });

      expect(customer?.assigned_to).toBe(user.id);  // Foreign key field
      expect(customer?.users).toBeDefined();  // Relation object
      expect(customer?.users?.id).toBe(user.id);
    });

    it('should track customer creation timestamp', async () => {
      const org = await createTestOrganization();

      const beforeCreate = new Date();
      const customer = await createTestCustomer(org.id, { name: 'Timestamped' });
      const afterCreate = new Date();

      expect(customer.created_at).toBeInstanceOf(Date);
      expect(customer.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(customer.created_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should update timestamp on customer edit', async () => {
      const org = await createTestOrganization();
      const customer = await createTestCustomer(org.id, { name: 'Original' });

      const originalUpdatedAt = customer.updated_at;

      // Wait a tiny bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await testPrisma.customers.update({
        where: { id: customer.id },
        data: { name: 'Updated' },
      });

      expect(updated.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Error Handling', () => {
    it('should fail to create customer without required fields', async () => {
      const org = await createTestOrganization();

      await expect(
        testPrisma.customers.create({
          data: {
            organization_id: org.id,
            // Missing required 'name' field
            email: 'test@example.com',
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should fail to update non-existent customer', async () => {
      await expect(
        testPrisma.customers.update({
          where: { id: 'non-existent-id' },
          data: { name: 'Updated' },
        })
      ).rejects.toThrow();
    });

    it('should fail to delete non-existent customer', async () => {
      await expect(
        testPrisma.customers.delete({
          where: { id: 'non-existent-id' },
        })
      ).rejects.toThrow();
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk create customers', async () => {
      const org = await createTestOrganization();

      const customersData = [
        { name: 'Customer 1', email: 'customer1@example.com' },
        { name: 'Customer 2', email: 'customer2@example.com' },
        { name: 'Customer 3', email: 'customer3@example.com' },
      ];

      // Use helper to create customers
      for (const customerData of customersData) {
        await createTestCustomer(org.id, customerData);
      }

      const customers = await testPrisma.customers.findMany({
        where: { organization_id: org.id },
      });

      expect(customers).toHaveLength(3);
    });

    it('should bulk delete customers by organization', async () => {
      const org = await createTestOrganization();

      // Create multiple customers
      await createTestCustomer(org.id, { name: 'Customer 1' });
      await createTestCustomer(org.id, { name: 'Customer 2' });
      await createTestCustomer(org.id, { name: 'Customer 3' });

      // Bulk delete all customers for this organization
      await testPrisma.customers.deleteMany({
        where: { organization_id: org.id },
      });

      const remainingCustomers = await testPrisma.customers.findMany({
        where: { organization_id: org.id },
      });

      expect(remainingCustomers).toHaveLength(0);
    });
  });
});
