/**
 * Contacts Actions Test Suite
 * Tests for Contact CRUD operations with multi-tenant isolation and RBAC
 *
 * Coverage: createContact, updateContact, deleteContact, logCommunication,
 *           updateContactStatus, bulkAssignContacts
 */

import { ContactStatus, ContactType, UserRole, ActivityType } from '@prisma/client';
import {
  testPrisma,
  cleanDatabase,
  createTestOrgWithUser,
  createTestUser,
  createOrganizationMember,
  connectTestDb,
  disconnectTestDb,
} from '@/__tests__/utils/test-helpers';
import {
  createContact,
  updateContact,
  deleteContact,
  logCommunication,
  updateContactStatus,
  bulkAssignContacts,
} from '@/lib/modules/crm/contacts/actions';
import type { OrgRole } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessCRM, canManageContacts, canDeleteContacts } from '@/lib/auth/rbac';
import { mockAsyncFunction, mockFunction } from '@/__tests__/helpers/mock-helpers';

// Mock auth helpers
jest.mock('@/lib/auth/auth-helpers', () => ({
  requireAuth: jest.fn(),
  getCurrentUser: jest.fn(),
}));

// Mock RBAC
jest.mock('@/lib/auth/rbac', () => ({
  canAccessCRM: jest.fn(() => true),
  canManageContacts: jest.fn(() => true),
  canDeleteContacts: jest.fn(() => true),
}));

// Mock Next.js cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock tenant context
jest.mock('@/lib/database/utils', () => ({
  withTenantContext: jest.fn((callback) => callback()),
}));

describe('Contacts Actions', () => {
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

  describe('createContact', () => {
    it('should create a contact successfully', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const contactData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567890',
        company: 'Smith Industries',
        position: 'CEO',
        type: ContactType.PROSPECT,
        status: ContactStatus.ACTIVE,
        linkedin_url: 'https://linkedin.com/in/janesmith',
        preferred_contact_method: 'email' as const,
        notes: 'Met at conference 2024',
        tags: ['vip', 'conference'],
        organization_id: organization.id,
      };

      const contact = await createContact(contactData);

      expect(contact).toBeDefined();
      expect(contact.name).toBe('Jane Smith');
      expect(contact.email).toBe('jane@example.com');
      expect(contact.organization_id).toBe(organization.id);
      expect(contact.type).toBe(ContactType.PROSPECT);
      expect(contact.status).toBe(ContactStatus.ACTIVE);

      // Verify in database
      const dbContact = await testPrisma.contact.findUnique({
        where: { id: contact.id },
      });
      expect(dbContact).toBeDefined();
      expect(dbContact?.name).toBe('Jane Smith');
    });

    it('should validate required fields', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const invalidData = {
        name: 'J', // Too short (min 2 characters)
        organization_id: organization.id,
      };

      await expect(createContact(invalidData as any)).rejects.toThrow();
    });

    it('should validate email format if provided', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const invalidData = {
        name: 'Jane Smith',
        email: 'invalid-email', // Invalid email
        organization_id: organization.id,
      };

      await expect(createContact(invalidData as any)).rejects.toThrow();
    });

    it('should enforce RBAC permissions', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      mockFunction(canAccessCRM).mockReturnValue(false);

      const contactData = {
        name: 'Jane Smith',
        organization_id: organization.id,
      };

      await expect(createContact(contactData as any)).rejects.toThrow(
        'Unauthorized: Insufficient permissions'
      );

      // Reset for next test
      mockFunction(canAccessCRM).mockReturnValue(true);
      mockFunction(canManageContacts).mockReturnValue(false);

      await expect(createContact(contactData as any)).rejects.toThrow(
        'Unauthorized: Insufficient permissions'
      );
    });

    it('should auto-assign organizationId from current user', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const contactData = {
        name: 'Test Contact',
        organization_id: 'different-org-id', // Should be overridden
      };

      const contact = await createContact(contactData as any);

      // Should use user's organization, not the provided one
      expect(contact.organization_id).toBe(organization.id);
    });
  });

  describe('updateContact', () => {
    it('should update contact successfully', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      // Create a contact first
      const contact = await testPrisma.contact.create({
        data: {
          name: 'Original Name',
          organization_id: organization.id,
          type: ContactType.PROSPECT,
          status: ContactStatus.ACTIVE,
        },
      });

      const updateData = {
        id: contact.id,
        name: 'Updated Name',
        status: ContactStatus.INACTIVE,
        position: 'VP Sales',
      };

      const updated = await updateContact(updateData);

      expect(updated.name).toBe('Updated Name');
      expect(updated.status).toBe(ContactStatus.INACTIVE);
      expect(updated.position).toBe('VP Sales');
    });

    it('should throw error for non-existent contact', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const updateData = {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Updated',
      };

      await expect(updateContact(updateData)).rejects.toThrow();
    });

    it('should prevent updating contact from another organization', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser();
      const { organization: org2 } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user1,
        organization_members: [{ organization_id: org1.id }],
      });

      // Create contact in org2
      const contact2 = await testPrisma.contact.create({
        data: {
          name: 'Org 2 Contact',
          organization_id: org2.id,
        },
      });

      // Try to update from org1
      await expect(
        updateContact({
          id: contact2.id,
          name: 'Hacked',
        })
      ).rejects.toThrow('Contact not found or access denied');
    });
  });

  describe('deleteContact', () => {
    it('should delete contact successfully', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const contact = await testPrisma.contact.create({
        data: {
          name: 'Test Contact',
          organization_id: organization.id,
        },
      });

      const result = await deleteContact(contact.id);

      expect(result.success).toBe(true);

      // Verify deletion
      const deleted = await testPrisma.contact.findUnique({
        where: { id: contact.id },
      });
      expect(deleted).toBeNull();
    });

    it('should enforce delete permissions', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      mockFunction(canDeleteContacts).mockReturnValue(false);

      const contact = await testPrisma.contact.create({
        data: {
          name: 'Test Contact',
          organization_id: organization.id,
        },
      });

      await expect(deleteContact(contact.id)).rejects.toThrow(
        'Unauthorized: Insufficient permissions'
      );
    });

    it('should prevent deleting contact from another organization', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser();
      const { organization: org2 } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user1,
        organization_members: [{ organization_id: org1.id }],
      });

      // Create contact in org2
      const contact2 = await testPrisma.contact.create({
        data: {
          name: 'Org 2 Contact',
          organization_id: org2.id,
        },
      });

      // Try to delete from org1
      await expect(deleteContact(contact2.id)).rejects.toThrow(
        'Contact not found or access denied'
      );
    });
  });

  describe('logCommunication', () => {
    it('should log communication and update last_contact_at', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      // Create a contact
      const contact = await testPrisma.contact.create({
        data: {
          name: 'Test Contact',
          organization_id: organization.id,
        },
      });

      const communicationData = {
        contact_id: contact.id,
        type: ActivityType.CALL,
        title: 'Discussed partnership opportunity',
        description: 'Had a great conversation about potential collaboration',
        outcome: 'Scheduled follow-up meeting',
        duration_minutes: 30,
      };

      const activity = await logCommunication(communicationData);

      expect(activity).toBeDefined();
      expect(activity.type).toBe(ActivityType.CALL);
      expect(activity.title).toBe('Discussed partnership opportunity');
      expect(activity.contact_id).toBe(contact.id);

      // Verify last_contact_at was updated
      const updatedContact = await testPrisma.contact.findUnique({
        where: { id: contact.id },
      });
      expect(updatedContact?.last_contact_at).toBeDefined();
      expect(updatedContact?.last_contact_at).toBeInstanceOf(Date);
    });

    it('should validate communication input', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const contact = await testPrisma.contact.create({
        data: {
          name: 'Test Contact',
          organization_id: organization.id,
        },
      });

      const invalidData = {
        contact_id: contact.id,
        type: ActivityType.CALL,
        title: '', // Empty title (invalid)
      };

      await expect(logCommunication(invalidData as any)).rejects.toThrow();
    });
  });

  describe('updateContactStatus', () => {
    it('should update contact status successfully', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const contact = await testPrisma.contact.create({
        data: {
          name: 'Test Contact',
          organization_id: organization.id,
          status: ContactStatus.ACTIVE,
        },
      });

      const updated = await updateContactStatus({
        id: contact.id,
        status: ContactStatus.INACTIVE,
      });

      expect(updated.status).toBe(ContactStatus.INACTIVE);
    });

    it('should create activity when notes provided', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const contact = await testPrisma.contact.create({
        data: {
          name: 'Test Contact',
          organization_id: organization.id,
          status: ContactStatus.ACTIVE,
        },
      });

      await updateContactStatus({
        id: contact.id,
        status: ContactStatus.INACTIVE,
        notes: 'Contact requested to be marked inactive',
      });

      // Verify activity was created
      const activities = await testPrisma.activity.findMany({
        where: { contact_id: contact.id },
      });

      expect(activities).toHaveLength(1);
      expect(activities[0].type).toBe('NOTE');
      expect(activities[0].description).toContain('Contact requested');
    });
  });

  describe('bulkAssignContacts', () => {
    it('should assign multiple contacts to an agent', async () => {
      const { organization, user } = await createTestOrgWithUser();
      const agent = await createTestUser({ role: UserRole.USER });
      await createOrganizationMember(agent.id, organization.id, 'MEMBER' as OrgRole);

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      // Create 3 contacts
      const contact1 = await testPrisma.contact.create({
        data: { name: 'Contact 1', organization_id: organization.id },
      });
      const contact2 = await testPrisma.contact.create({
        data: { name: 'Contact 2', organization_id: organization.id },
      });
      const contact3 = await testPrisma.contact.create({
        data: { name: 'Contact 3', organization_id: organization.id },
      });

      const result = await bulkAssignContacts({
        contact_ids: [contact1.id, contact2.id, contact3.id],
        assigned_to_id: agent.id,
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(3);

      // Verify assignments
      const assignedContacts = await testPrisma.contact.findMany({
        where: { assigned_to_id: agent.id },
      });
      expect(assignedContacts).toHaveLength(3);
    });

    it('should validate contact_ids array', async () => {
      const { organization, user } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      // Empty array
      await expect(
        bulkAssignContacts({
          contact_ids: [],
          assigned_to_id: user.id,
        })
      ).rejects.toThrow();

      // Too many (>100)
      const tooMany = Array(101).fill('00000000-0000-0000-0000-000000000000');
      await expect(
        bulkAssignContacts({
          contact_ids: tooMany,
          assigned_to_id: user.id,
        })
      ).rejects.toThrow();
    });
  });

  describe('Multi-tenant Isolation', () => {
    it('should prevent accessing contacts from other organizations', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser();
      const { organization: org2 } = await createTestOrgWithUser();

      mockAsyncFunction(getCurrentUser).mockResolvedValue({
        ...user1,
        organization_members: [{ organization_id: org1.id }],
      });

      // Create contact in org2
      const contact2 = await testPrisma.contact.create({
        data: {
          name: 'Org 2 Contact',
          organization_id: org2.id,
        },
      });

      // User from org1 should use org1's organizationId
      const createdContact = await createContact({
        name: 'New Contact',
        organization_id: org2.id, // Try to use org2 (should be overridden)
      } as any);

      // Should create in org1, not org2
      expect(createdContact.organization_id).toBe(org1.id);
    });
  });
});
