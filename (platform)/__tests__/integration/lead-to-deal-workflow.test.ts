/**
 * CRM Lead-to-Deal Workflow Integration Test
 *
 * Tests the complete workflow:
 * 1. Create a lead
 * 2. Add activities to lead
 * 3. Update lead score based on engagement
 * 4. Convert lead to contact
 * 5. Create deal from contact
 * 6. Move deal through pipeline stages
 * 7. Close deal as won/lost
 *
 * This test verifies the entire CRM funnel works correctly with multi-tenancy
 */

import { UserRole, OrgRole, LeadStatus, LeadScore, LeadSource } from '@prisma/client';
import {
  testPrisma,
  cleanDatabase,
  createTestOrgWithUser,
  createTestUser,
  createOrganizationMember,
  connectTestDb,
  disconnectTestDb,
} from '@/__tests__/utils/test-helpers';
import { createLead, updateLeadScore, convertLead } from '@/lib/modules/crm/leads/actions';
import { createDeal, updateDealStage } from '@/lib/modules/crm/deals/actions';
import { getLeadById } from '@/lib/modules/crm/leads/queries';
import { getDealById } from '@/lib/modules/crm/deals/queries';

// Mock dependencies
jest.mock('@/lib/auth/auth-helpers', () => ({
  requireAuth: jest.fn(),
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/auth/rbac', () => ({
  canAccessCRM: jest.fn(() => true),
  canManageLeads: jest.fn(() => true),
  canManageDeals: jest.fn(() => true),
  canDeleteLeads: jest.fn(() => true),
  canDeleteDeals: jest.fn(() => true),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/lib/database/utils', () => ({
  withTenantContext: jest.fn((callback) => callback()),
}));

describe('Lead-to-Deal Workflow Integration', () => {
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

  it('should complete full lead-to-deal workflow successfully', async () => {
    // === SETUP ===
    const { organization, user } = await createTestOrgWithUser();
    const agent = await createTestUser({
      name: 'Sales Agent',
      role: UserRole.USER,
    });
    await createOrganizationMember(agent.id, organization.id, OrgRole.MEMBER);

    const { getCurrentUser } = require('@/lib/auth/auth-helpers');
    getCurrentUser.mockResolvedValue({
      ...user,
      organization_members: [{ organization_id: organization.id }],
    });

    // === STEP 1: Create Lead ===
    const leadData = {
      name: 'Jane Smith',
      email: 'jane@techcorp.com',
      phone: '+1-555-0100',
      company: 'TechCorp Inc',
      source: LeadSource.WEBSITE,
      status: LeadStatus.NEW_LEAD,
      score: LeadScore.COLD,
      score_value: 20,
      budget: 50000,
      timeline: '6 months',
      notes: 'Interested in enterprise solution',
      tags: ['enterprise', 'technology'],
      organization_id: organization.id,
      assigned_to_id: agent.id,
    };

    const lead = await createLead(leadData);

    expect(lead).toBeDefined();
    expect(lead.name).toBe('Jane Smith');
    expect(lead.status).toBe(LeadStatus.NEW_LEAD);
    expect(lead.organization_id).toBe(organization.id);

    // === STEP 2: Add Activities to Lead ===
    // Create call activity
    const callActivity = await testPrisma.activities.create({
      data: {
        type: 'CALL',
        title: 'Initial discovery call',
        description: 'Discussed requirements and timeline',
        lead_id: lead.id,
        organization_id: organization.id,
        created_by_id: agent.id,
        completed_at: new Date(),
      },
    });

    // Create meeting activity
    const meetingActivity = await testPrisma.activities.create({
      data: {
        type: 'MEETING',
        title: 'Product demo',
        description: 'Demonstrated key features',
        lead_id: lead.id,
        organization_id: organization.id,
        created_by_id: agent.id,
        completed_at: new Date(),
      },
    });

    // Create email activity
    const emailActivity = await testPrisma.activities.create({
      data: {
        type: 'EMAIL',
        title: 'Follow-up email',
        description: 'Sent pricing proposal',
        lead_id: lead.id,
        organization_id: organization.id,
        created_by_id: agent.id,
      },
    });

    // Verify activities were created
    const leadWithActivities = await getLeadById(lead.id);
    expect(leadWithActivities?.activities).toHaveLength(3);

    // === STEP 3: Update Lead Score (Engagement) ===
    // Lead showed interest, increase score
    const scoredLead = await updateLeadScore({
      id: lead.id,
      score: LeadScore.WARM,
      score_value: 65,
    });

    expect(scoredLead.score).toBe(LeadScore.WARM);
    expect(scoredLead.score_value).toBe(65);

    // Lead is very engaged, mark as hot
    const hotLead = await updateLeadScore({
      id: lead.id,
      score: LeadScore.HOT,
      score_value: 90,
    });

    expect(hotLead.score).toBe(LeadScore.HOT);
    expect(hotLead.score_value).toBe(90);

    // === STEP 4: Convert Lead to Contact ===
    const { contact } = await convertLead(lead.id);

    expect(contact).toBeDefined();
    expect(contact.name).toBe('Jane Smith');
    expect(contact.email).toBe('jane@techcorp.com');
    expect(contact.type).toBe('CLIENT');
    expect(contact.status).toBe('ACTIVE');
    expect(contact.organization_id).toBe(organization.id);

    // Verify lead status updated to CONVERTED
    const convertedLead = await testPrisma.leads.findUnique({
      where: { id: lead.id },
    });
    expect(convertedLead?.status).toBe(LeadStatus.CONVERTED);

    // === STEP 5: Create Deal from Contact ===
    const dealData = {
      title: 'TechCorp Enterprise License',
      value: 50000,
      stage: 'PROPOSAL' as const,
      status: 'ACTIVE' as const,
      probability: 50,
      expected_close_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      contact_id: contact.id,
      organization_id: organization.id,
      assigned_to_id: agent.id,
      notes: 'Enterprise license for 50 users',
      tags: ['enterprise', 'new-business'],
    };

    const deal = await createDeal(dealData);

    expect(deal).toBeDefined();
    expect(deal.title).toBe('TechCorp Enterprise License');
    expect(deal.value).toBe(50000);
    expect(deal.stage).toBe('PROPOSAL');
    expect(deal.contact_id).toBe(contact.id);
    expect(deal.organization_id).toBe(organization.id);

    // === STEP 6: Move Deal Through Pipeline ===
    // Stage: PROPOSAL (50%)
    let currentDeal = deal;

    // Move to NEGOTIATION (75%)
    currentDeal = await updateDealStage({
      id: currentDeal.id,
      stage: 'NEGOTIATION',
      probability: 75,
    });

    expect(currentDeal.stage).toBe('NEGOTIATION');
    expect(currentDeal.probability).toBe(75);

    // Move to CLOSING (90%)
    currentDeal = await updateDealStage({
      id: currentDeal.id,
      stage: 'CLOSING',
      probability: 90,
    });

    expect(currentDeal.stage).toBe('CLOSING');
    expect(currentDeal.probability).toBe(90);

    // === STEP 7: Close Deal as WON ===
    const wonDeal = await testPrisma.deals.update({
      where: { id: currentDeal.id },
      data: {
        status: 'WON',
        stage: 'CLOSED_WON',
        probability: 100,
        actual_close_date: new Date(),
      },
    });

    expect(wonDeal.status).toBe('WON');
    expect(wonDeal.stage).toBe('CLOSED_WON');
    expect(wonDeal.probability).toBe(100);
    expect(wonDeal.actual_close_date).toBeDefined();

    // === VERIFICATION ===
    // Verify complete pipeline
    const finalDeal = await getDealById(wonDeal.id);

    expect(finalDeal).toBeDefined();
    expect(finalDeal?.status).toBe('WON');
    expect(finalDeal?.value).toBe(50000);
    expect(finalDeal?.contact_id).toBe(contact.id);

    // Verify contact exists
    const finalContact = await testPrisma.contacts.findUnique({
      where: { id: contact.id },
    });

    expect(finalContact).toBeDefined();
    expect(finalContact?.name).toBe('Jane Smith');

    // Verify lead still exists (converted)
    const finalLead = await testPrisma.leads.findUnique({
      where: { id: lead.id },
    });

    expect(finalLead).toBeDefined();
    expect(finalLead?.status).toBe(LeadStatus.CONVERTED);

    // Verify all entities belong to same organization
    expect(finalLead?.organization_id).toBe(organization.id);
    expect(finalContact?.organization_id).toBe(organization.id);
    expect(finalDeal?.organization_id).toBe(organization.id);
  });

  it('should maintain multi-tenant isolation throughout workflow', async () => {
    // Create two organizations
    const { organization: org1, user: user1 } = await createTestOrgWithUser();
    const { organization: org2, user: user2 } = await createTestOrgWithUser();

    const { getCurrentUser } = require('@/lib/auth/auth-helpers');

    // === Org 1: Create and convert lead ===
    getCurrentUser.mockResolvedValue({
      ...user1,
      organization_members: [{ organization_id: org1.id }],
    });

    const lead1 = await createLead({
      name: 'Org 1 Lead',
      organization_id: org1.id, // Will be overridden by user's org
    } as any);

    const { contact: contact1 } = await convertLead(lead1.id);

    // === Org 2: Create and convert lead ===
    getCurrentUser.mockResolvedValue({
      ...user2,
      organization_members: [{ organization_id: org2.id }],
    });

    const lead2 = await createLead({
      name: 'Org 2 Lead',
      organization_id: org2.id,
    } as any);

    const { contact: contact2 } = await convertLead(lead2.id);

    // === Verification: Each org only sees its own data ===
    const org1Leads = await testPrisma.leads.findMany({
      where: { organization_id: org1.id },
    });

    const org2Leads = await testPrisma.leads.findMany({
      where: { organization_id: org2.id },
    });

    expect(org1Leads).toHaveLength(1);
    expect(org2Leads).toHaveLength(1);
    expect(org1Leads[0].id).toBe(lead1.id);
    expect(org2Leads[0].id).toBe(lead2.id);

    const org1Contacts = await testPrisma.contacts.findMany({
      where: { organization_id: org1.id },
    });

    const org2Contacts = await testPrisma.contacts.findMany({
      where: { organization_id: org2.id },
    });

    expect(org1Contacts).toHaveLength(1);
    expect(org2Contacts).toHaveLength(1);
    expect(org1Contacts[0].id).toBe(contact1.id);
    expect(org2Contacts[0].id).toBe(contact2.id);
  });

  it('should handle deal loss scenario', async () => {
    const { organization, user } = await createTestOrgWithUser();

    const { getCurrentUser } = require('@/lib/auth/auth-helpers');
    getCurrentUser.mockResolvedValue({
      ...user,
      organization_members: [{ organization_id: organization.id }],
    });

    // Create lead → contact → deal
    const lead = await createLead({
      name: 'Lost Deal Lead',
      organization_id: organization.id,
    } as any);

    const { contact } = await convertLead(lead.id);

    const deal = await createDeal({
      title: 'Deal to be Lost',
      value: 25000,
      contact_id: contact.id,
      organization_id: organization.id,
    } as any);

    // Move through pipeline
    await updateDealStage({
      id: deal.id,
      stage: 'PROPOSAL',
      probability: 50,
    });

    // Mark as LOST
    const lostDeal = await testPrisma.deals.update({
      where: { id: deal.id },
      data: {
        status: 'LOST',
        stage: 'CLOSED_LOST',
        probability: 0,
        actual_close_date: new Date(),
        lost_reason: 'Competitor pricing',
      },
    });

    expect(lostDeal.status).toBe('LOST');
    expect(lostDeal.stage).toBe('CLOSED_LOST');
    expect(lostDeal.probability).toBe(0);
    expect(lostDeal.lost_reason).toBe('Competitor pricing');
  });
});
