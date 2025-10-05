/**
 * Contacts Queries Test Suite
 * Tests for Contact data fetching with filtering, sorting, and pagination
 *
 * Coverage: getContacts, getContactById, getContactWithFullHistory,
 *           getContactStats, getContactsCount
 */

import { ContactStatus, ContactType, UserRole } from '@prisma/client';
import {
  testPrisma,
  cleanDatabase,
  createTestOrgWithUser,
  connectTestDb,
  disconnectTestDb,
} from '@/__tests__/utils/test-helpers';
import {
  getContacts,
  getContactById,
  getContactWithFullHistory,
  getContactStats,
  getContactsCount,
} from '@/lib/modules/crm/contacts/queries';

// Mock auth helpers
jest.mock('@/lib/auth/auth-helpers', () => ({
  requireAuth: jest.fn(),
  getCurrentUser: jest.fn(),
}));

// Mock RBAC
jest.mock('@/lib/auth/rbac', () => ({
  canAccessCRM: jest.fn(() => true),
}));

// Mock tenant context
jest.mock('@/lib/database/utils', () => ({
  withTenantContext: jest.fn((callback) => callback()),
}));

describe('Contacts Queries', () => {
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

  describe('getContacts', () => {
    it('should return all contacts for an organization', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      // Create test contacts
      await testPrisma.contacts.createMany({
        data: [
          { name: 'Contact 1', organization_id: organization.id },
          { name: 'Contact 2', organization_id: organization.id },
          { name: 'Contact 3', organization_id: organization.id },
        ],
      });

      const contacts = await getContacts();

      expect(contacts).toHaveLength(3);
      expect(contacts.every(c => c.organization_id === organization.id)).toBe(true);
    });

    it('should filter contacts by type', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      await testPrisma.contacts.createMany({
        data: [
          { name: 'Prospect 1', organization_id: organization.id, type: ContactType.PROSPECT },
          { name: 'Client 1', organization_id: organization.id, type: ContactType.CLIENT },
          { name: 'Client 2', organization_id: organization.id, type: ContactType.CLIENT },
        ],
      });

      const clients = await getContacts({ type: ContactType.CLIENT });

      expect(clients).toHaveLength(2);
      expect(clients.every(c => c.type === ContactType.CLIENT)).toBe(true);
    });

    it('should filter contacts by status', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      await testPrisma.contacts.createMany({
        data: [
          { name: 'Active 1', organization_id: organization.id, status: ContactStatus.ACTIVE },
          { name: 'Active 2', organization_id: organization.id, status: ContactStatus.ACTIVE },
          { name: 'Inactive 1', organization_id: organization.id, status: ContactStatus.INACTIVE },
        ],
      });

      const activeContacts = await getContacts({ status: ContactStatus.ACTIVE });

      expect(activeContacts).toHaveLength(2);
      expect(activeContacts.every(c => c.status === ContactStatus.ACTIVE)).toBe(true);
    });

    it('should search contacts by name, email, company', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      await testPrisma.contacts.createMany({
        data: [
          { name: 'John Smith', email: 'john@example.com', organization_id: organization.id },
          { name: 'Jane Doe', email: 'jane@acmecorp.com', company: 'Acme Corp', organization_id: organization.id },
          { name: 'Bob Johnson', email: 'bob@test.com', organization_id: organization.id },
        ],
      });

      const results = await getContacts({ search: 'Acme' });

      expect(results).toHaveLength(1);
      expect(results[0].company).toBe('Acme Corp');
    });

    it('should paginate results', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      // Create 10 contacts
      const contactsData = Array.from({ length: 10 }, (_, i) => ({
        name: `Contact ${i + 1}`,
        organization_id: organization.id,
      }));
      await testPrisma.contacts.createMany({ data: contactsData });

      // Get first page (5 items)
      const page1 = await getContacts({ limit: 5, offset: 0 });
      expect(page1).toHaveLength(5);

      // Get second page (5 items)
      const page2 = await getContacts({ limit: 5, offset: 5 });
      expect(page2).toHaveLength(5);

      // Ensure different contacts
      const page1Ids = page1.map(c => c.id);
      const page2Ids = page2.map(c => c.id);
      expect(page1Ids.some(id => page2Ids.includes(id))).toBe(false);
    });

    it('should sort contacts by specified field', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      await testPrisma.contacts.createMany({
        data: [
          { name: 'Charlie', organization_id: organization.id },
          { name: 'Alice', organization_id: organization.id },
          { name: 'Bob', organization_id: organization.id },
        ],
      });

      const sorted = await getContacts({ sort_by: 'name', sort_order: 'asc' });

      expect(sorted[0].name).toBe('Alice');
      expect(sorted[1].name).toBe('Bob');
      expect(sorted[2].name).toBe('Charlie');
    });

    it('should enforce multi-tenant isolation', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser();
      const { organization: org2 } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user1,
        organization_members: [{ organization_id: org1.id }],
      });

      // Create contacts for both orgs
      await testPrisma.contacts.create({
        data: { name: 'Org 1 Contact', organization_id: org1.id },
      });
      await testPrisma.contacts.create({
        data: { name: 'Org 2 Contact', organization_id: org2.id },
      });

      const contacts = await getContacts();

      expect(contacts).toHaveLength(1);
      expect(contacts[0].organization_id).toBe(org1.id);
    });
  });

  describe('getContactById', () => {
    it('should return contact by ID', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const created = await testPrisma.contacts.create({
        data: {
          name: 'Test Contact',
          email: 'test@example.com',
          organization_id: organization.id,
        },
      });

      const contact = await getContactById(created.id);

      expect(contact).toBeDefined();
      expect(contact?.id).toBe(created.id);
      expect(contact?.name).toBe('Test Contact');
    });

    it('should return null for non-existent contact', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const contact = await getContactById('00000000-0000-0000-0000-000000000000');

      expect(contact).toBeNull();
    });

    it('should enforce multi-tenant isolation', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser();
      const { organization: org2 } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user1,
        organization_members: [{ organization_id: org1.id }],
      });

      // Create contact in org2
      const org2Contact = await testPrisma.contacts.create({
        data: {
          name: 'Org 2 Contact',
          organization_id: org2.id,
        },
      });

      // Try to access from org1
      const contact = await getContactById(org2Contact.id);

      expect(contact).toBeNull(); // Should not be accessible
    });
  });

  describe('getContactWithFullHistory', () => {
    it('should return contact with activities and deals', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      // Create contact
      const contact = await testPrisma.contacts.create({
        data: {
          name: 'Test Contact',
          organization_id: organization.id,
        },
      });

      // Create activities
      await testPrisma.activities.createMany({
        data: [
          {
            type: 'CALL',
            title: 'Initial call',
            contact_id: contact.id,
            organization_id: organization.id,
            created_by_id: user.id,
          },
          {
            type: 'EMAIL',
            title: 'Follow-up email',
            contact_id: contact.id,
            organization_id: organization.id,
            created_by_id: user.id,
          },
        ],
      });

      const fullContact = await getContactWithFullHistory(contact.id);

      expect(fullContact).toBeDefined();
      expect(fullContact?.activities).toBeDefined();
      expect(fullContact?.activities).toHaveLength(2);
    });

    it('should limit activities to 50 recent entries', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const contact = await testPrisma.contacts.create({
        data: {
          name: 'Test Contact',
          organization_id: organization.id,
        },
      });

      // Create 60 activities
      const activitiesData = Array.from({ length: 60 }, (_, i) => ({
        type: 'NOTE' as const,
        title: `Activity ${i + 1}`,
        contact_id: contact.id,
        organization_id: organization.id,
        created_by_id: user.id,
      }));
      await testPrisma.activities.createMany({ data: activitiesData });

      const fullContact = await getContactWithFullHistory(contact.id);

      expect(fullContact?.activities).toHaveLength(50); // Limited to 50
    });
  });

  describe('getContactStats', () => {
    it('should return correct contact statistics', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      // Create various contacts
      await testPrisma.contacts.createMany({
        data: [
          { name: 'Active Prospect', organization_id: organization.id, type: ContactType.PROSPECT, status: ContactStatus.ACTIVE },
          { name: 'Client 1', organization_id: organization.id, type: ContactType.CLIENT, status: ContactStatus.ACTIVE },
          { name: 'Client 2', organization_id: organization.id, type: ContactType.CLIENT, status: ContactStatus.ACTIVE },
          { name: 'Past Client', organization_id: organization.id, type: ContactType.PAST_CLIENT, status: ContactStatus.INACTIVE },
          { name: 'Inactive Contact', organization_id: organization.id, type: ContactType.PROSPECT, status: ContactStatus.INACTIVE },
        ],
      });

      const stats = await getContactStats();

      expect(stats.total).toBe(5);
      expect(stats.active).toBe(3); // Active Prospect + 2 Clients
      expect(stats.clients).toBe(2);
      expect(stats.pastClients).toBe(1);
    });

    it('should only count contacts from current organization', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser();
      const { organization: org2 } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user1,
        organization_members: [{ organization_id: org1.id }],
      });

      // Create contacts in both orgs
      await testPrisma.contacts.createMany({
        data: [
          { name: 'Org 1 Contact 1', organization_id: org1.id },
          { name: 'Org 1 Contact 2', organization_id: org1.id },
          { name: 'Org 2 Contact 1', organization_id: org2.id },
          { name: 'Org 2 Contact 2', organization_id: org2.id },
        ],
      });

      const stats = await getContactStats();

      expect(stats.total).toBe(2); // Only org1 contacts
    });
  });

  describe('getContactsCount', () => {
    it('should return total count of contacts', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      await testPrisma.contacts.createMany({
        data: [
          { name: 'Contact 1', organization_id: organization.id },
          { name: 'Contact 2', organization_id: organization.id },
          { name: 'Contact 3', organization_id: organization.id },
        ],
      });

      const count = await getContactsCount();

      expect(count).toBe(3);
    });

    it('should return filtered count', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      await testPrisma.contacts.createMany({
        data: [
          { name: 'Client 1', organization_id: organization.id, type: ContactType.CLIENT },
          { name: 'Client 2', organization_id: organization.id, type: ContactType.CLIENT },
          { name: 'Prospect 1', organization_id: organization.id, type: ContactType.PROSPECT },
        ],
      });

      const count = await getContactsCount({ type: ContactType.CLIENT });

      expect(count).toBe(2);
    });
  });
});
