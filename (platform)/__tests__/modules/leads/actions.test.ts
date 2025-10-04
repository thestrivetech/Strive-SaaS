/**
 * Leads Actions Test Suite
 * Tests for Lead CRUD operations with multi-tenant isolation and RBAC
 *
 * Coverage: createLead, updateLead, deleteLead, updateLeadScore,
 *           updateLeadStatus, bulkAssignLeads, convertLead
 */

import { LeadStatus, LeadSource, LeadScore, UserRole } from '@prisma/client';
import {
  testPrisma,
  cleanDatabase,
  createTestOrgWithUser,
  createTestUser,
  createTestOrganization,
  createOrganizationMember,
  connectTestDb,
  disconnectTestDb,
} from '@/__tests__/utils/test-helpers';
import {
  createLead,
  updateLead,
  deleteLead,
  updateLeadScore,
  updateLeadStatus,
  bulkAssignLeads,
  convertLead,
} from '@/lib/modules/leads/actions';
import type { OrgRole } from '@prisma/client';

// Mock auth helpers
jest.mock('@/lib/auth/auth-helpers', () => ({
  requireAuth: jest.fn(),
  getCurrentUser: jest.fn(),
}));

// Mock RBAC
jest.mock('@/lib/auth/rbac', () => ({
  canAccessCRM: jest.fn(() => true),
  canManageLeads: jest.fn(() => true),
  canDeleteLeads: jest.fn(() => true),
}));

// Mock Next.js cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock tenant context (for now, just execute the callback)
jest.mock('@/lib/database/utils', () => ({
  withTenantContext: jest.fn((callback) => callback()),
}));

describe('Leads Actions', () => {
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

  describe('createLead', () => {
    it('should create a lead successfully', async () => {
      const { organization, user } = await createTestOrgWithUser();

      // Mock getCurrentUser to return our test user with organization membership
      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const leadData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Corp',
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW_LEAD,
        score: LeadScore.WARM,
        score_value: 50,
        budget: 10000,
        timeline: '3 months',
        notes: 'Interested in enterprise plan',
        tags: ['enterprise', 'high-priority'],
        organization_id: organization.id,
      };

      const lead = await createLead(leadData);

      expect(lead).toBeDefined();
      expect(lead.name).toBe('John Doe');
      expect(lead.email).toBe('john@example.com');
      expect(lead.organization_id).toBe(organization.id);
      expect(lead.status).toBe(LeadStatus.NEW_LEAD);
      expect(lead.score).toBe(LeadScore.WARM);

      // Verify in database
      const dbLead = await testPrisma.leads.findUnique({
        where: { id: lead.id },
      });
      expect(dbLead).toBeDefined();
      expect(dbLead?.name).toBe('John Doe');
    });

    it('should validate required fields', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const invalidData = {
        name: 'J', // Too short (min 2 characters)
        organization_id: organization.id,
      };

      await expect(createLead(invalidData as any)).rejects.toThrow();
    });

    it('should validate email format if provided', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email', // Invalid email
        organization_id: organization.id,
      };

      await expect(createLead(invalidData as any)).rejects.toThrow();
    });

    it('should enforce RBAC permissions', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const { canAccessCRM, canManageLeads } = require('@/lib/auth/rbac');
      canAccessCRM.mockReturnValue(false);

      const leadData = {
        name: 'John Doe',
        organization_id: organization.id,
      };

      await expect(createLead(leadData as any)).rejects.toThrow(
        'Unauthorized: Insufficient permissions'
      );

      // Reset for next test
      canAccessCRM.mockReturnValue(true);
      canManageLeads.mockReturnValue(false);

      await expect(createLead(leadData as any)).rejects.toThrow(
        'Unauthorized: Insufficient permissions'
      );
    });

    it('should auto-assign organizationId from current user', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const leadData = {
        name: 'Test Lead',
        organization_id: 'different-org-id', // Should be overridden
      };

      const lead = await createLead(leadData as any);

      // Should use user's organization, not the provided one
      expect(lead.organization_id).toBe(organization.id);
    });
  });

  describe('updateLead', () => {
    it('should update lead successfully', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      // Create a lead first
      const lead = await testPrisma.leads.create({
        data: {
          name: 'Original Name',
          organization_id: organization.id,
          status: LeadStatus.NEW_LEAD,
          score: LeadScore.COLD,
        },
      });

      const updateData = {
        id: lead.id,
        name: 'Updated Name',
        status: LeadStatus.QUALIFIED,
        score: LeadScore.HOT,
      };

      const updated = await updateLead(updateData);

      expect(updated.name).toBe('Updated Name');
      expect(updated.status).toBe(LeadStatus.QUALIFIED);
      expect(updated.score).toBe(LeadScore.HOT);
    });

    it('should throw error for non-existent lead', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const updateData = {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Updated',
      };

      await expect(updateLead(updateData)).rejects.toThrow();
    });
  });

  describe('deleteLead', () => {
    it('should delete lead successfully', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const lead = await testPrisma.leads.create({
        data: {
          name: 'Test Lead',
          organization_id: organization.id,
        },
      });

      const result = await deleteLead(lead.id);

      expect(result.success).toBe(true);

      // Verify deletion
      const deleted = await testPrisma.leads.findUnique({
        where: { id: lead.id },
      });
      expect(deleted).toBeNull();
    });

    it('should enforce delete permissions', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const { canDeleteLeads } = require('@/lib/auth/rbac');
      canDeleteLeads.mockReturnValue(false);

      const lead = await testPrisma.leads.create({
        data: {
          name: 'Test Lead',
          organization_id: organization.id,
        },
      });

      await expect(deleteLead(lead.id)).rejects.toThrow(
        'Unauthorized: Insufficient permissions'
      );
    });
  });

  describe('updateLeadScore', () => {
    it('should update lead score successfully', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const lead = await testPrisma.leads.create({
        data: {
          name: 'Test Lead',
          organization_id: organization.id,
          score: LeadScore.COLD,
          score_value: 10,
        },
      });

      const updated = await updateLeadScore({
        id: lead.id,
        score: LeadScore.HOT,
        score_value: 95,
      });

      expect(updated.score).toBe(LeadScore.HOT);
      expect(updated.score_value).toBe(95);
    });

    it('should validate score_value range (0-100)', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const lead = await testPrisma.leads.create({
        data: {
          name: 'Test Lead',
          organization_id: organization.id,
        },
      });

      await expect(
        updateLeadScore({
          id: lead.id,
          score: LeadScore.HOT,
          score_value: 150, // Invalid: > 100
        })
      ).rejects.toThrow();

      await expect(
        updateLeadScore({
          id: lead.id,
          score: LeadScore.HOT,
          score_value: -10, // Invalid: < 0
        })
      ).rejects.toThrow();
    });
  });

  describe('updateLeadStatus', () => {
    it('should update lead status successfully', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const lead = await testPrisma.leads.create({
        data: {
          name: 'Test Lead',
          organization_id: organization.id,
          status: LeadStatus.NEW_LEAD,
        },
      });

      const updated = await updateLeadStatus({
        id: lead.id,
        status: LeadStatus.QUALIFIED,
      });

      expect(updated.status).toBe(LeadStatus.QUALIFIED);
    });
  });

  describe('bulkAssignLeads', () => {
    it('should assign multiple leads to an agent', async () => {
      const { organization, user } = await createTestOrgWithUser();
      const agent = await createTestUser({ role: UserRole.EMPLOYEE });
      await createOrganizationMember(agent.id, organization.id, 'MEMBER' as OrgRole);

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      // Create 3 leads
      const lead1 = await testPrisma.leads.create({
        data: { name: 'Lead 1', organization_id: organization.id },
      });
      const lead2 = await testPrisma.leads.create({
        data: { name: 'Lead 2', organization_id: organization.id },
      });
      const lead3 = await testPrisma.leads.create({
        data: { name: 'Lead 3', organization_id: organization.id },
      });

      const result = await bulkAssignLeads({
        lead_ids: [lead1.id, lead2.id, lead3.id],
        assigned_to_id: agent.id,
      });

      expect(result.count).toBe(3);

      // Verify assignments
      const assignedLeads = await testPrisma.leads.findMany({
        where: { assigned_to_id: agent.id },
      });
      expect(assignedLeads).toHaveLength(3);
    });

    it('should validate lead_ids array', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      // Empty array
      await expect(
        bulkAssignLeads({
          lead_ids: [],
          assigned_to_id: user.id,
        })
      ).rejects.toThrow();

      // Too many (>100)
      const tooMany = Array(101).fill('00000000-0000-0000-0000-000000000000');
      await expect(
        bulkAssignLeads({
          lead_ids: tooMany,
          assigned_to_id: user.id,
        })
      ).rejects.toThrow();
    });
  });

  describe('convertLead', () => {
    it('should convert lead to contact successfully', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      const lead = await testPrisma.leads.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          company: 'Acme Corp',
          notes: 'Great prospect',
          tags: ['vip'],
          organization_id: organization.id,
          status: LeadStatus.QUALIFIED,
        },
      });

      const result = await convertLead(lead.id);

      expect(result.contact).toBeDefined();
      expect(result.contact.name).toBe('John Doe');
      expect(result.contact.email).toBe('john@example.com');
      expect(result.contact.type).toBe('CLIENT');
      expect(result.contact.status).toBe('ACTIVE');

      // Verify lead status updated
      const updatedLead = await testPrisma.leads.findUnique({
        where: { id: lead.id },
      });
      expect(updatedLead?.status).toBe(LeadStatus.CONVERTED);
    });

    it('should throw error for non-existent lead', async () => {
      const { organization, user } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user,
        organization_members: [{ organization_id: organization.id }],
      });

      await expect(
        convertLead('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow('Lead not found');
    });
  });

  describe('Multi-tenant Isolation', () => {
    it('should prevent accessing leads from other organizations', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser();
      const { organization: org2 } = await createTestOrgWithUser();

      const { getCurrentUser } = require('@/lib/auth/auth-helpers');
      getCurrentUser.mockResolvedValue({
        ...user1,
        organization_members: [{ organization_id: org1.id }],
      });

      // Create lead in org2
      const lead2 = await testPrisma.leads.create({
        data: {
          name: 'Org 2 Lead',
          organization_id: org2.id,
        },
      });

      // User from org1 should use org1's organizationId
      const createdLead = await createLead({
        name: 'New Lead',
        organization_id: org2.id, // Try to use org2 (should be overridden)
      } as any);

      // Should create in org1, not org2
      expect(createdLead.organization_id).toBe(org1.id);
    });
  });
});
