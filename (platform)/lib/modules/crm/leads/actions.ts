'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessCRM, canManageLeads, canDeleteLeads } from '@/lib/auth/rbac';
import { hasOrgPermission } from '@/lib/auth/org-rbac';
import { canAccessFeature } from '@/lib/auth/subscription';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadScoreSchema,
  updateLeadStatusSchema,
  bulkAssignLeadsSchema,
  type CreateLeadInput,
  type UpdateLeadInput,
  type UpdateLeadScoreInput,
  type UpdateLeadStatusInput,
  type BulkAssignLeadsInput,
} from './schemas';

/**
 * Create a new lead
 *
 * @param input - Lead data including name, email, phone, source, score
 * @returns Created lead record with generated ID and timestamps
 * @throws {Error} If user lacks permissions, validation fails, or database error occurs
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with CRM access
 * - Requires OrganizationRole: MEMBER or higher (leads:write permission)
 */
export async function createLead(input: CreateLeadInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(user.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(user.role) || !canManageLeads(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to create leads');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'leads:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions to create leads');
  }

  // Validate input
  const validated = createLeadSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const lead = await prisma.leads.create({
        data: {
          ...validated,
          organization_id: user.organization_members[0].organization_id,
        },
        include: {
          assigned_to: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      });

      // Revalidate leads page
      revalidatePath('/crm/leads');
      revalidatePath('/crm/crm-dashboard');

      return lead;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Leads] createLead failed:', dbError);
      throw new Error(
        `[CRM:Leads] Failed to create lead: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Update an existing lead
 *
 * @param input - Updated lead data with ID and fields to modify
 * @returns Updated lead record
 * @throws {Error} If lead not found, access denied, or update fails
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with CRM access
 * - Requires OrganizationRole: MEMBER or higher (leads:write permission)
 */
export async function updateLead(input: UpdateLeadInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(user.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(user.role) || !canManageLeads(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to update leads');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'leads:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions to update leads');
  }

  const validated = updateLeadSchema.parse(input);
  const { id, ...updateData } = validated;

  return withTenantContext(async () => {
    try {
      const lead = await prisma.leads.update({
        where: { id },
        data: updateData,
        include: {
          assigned_to: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      });

      revalidatePath('/crm/leads');
      revalidatePath(`/crm/leads/${id}`);
      revalidatePath('/crm/crm-dashboard');

      return lead;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Leads] updateLead failed:', dbError);
      throw new Error(
        `[CRM:Leads] Failed to update lead: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Delete a lead
 *
 * @param leadId - Lead ID to delete
 * @returns Success status object
 * @throws {Error} If access denied or deletion fails
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with delete permissions
 * - Requires OrganizationRole: ADMIN or OWNER (leads:manage permission)
 */
export async function deleteLead(leadId: string) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(user.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(user.role) || !canDeleteLeads(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to delete leads');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'leads:manage')) {
    throw new Error('Unauthorized: Insufficient organization permissions to delete leads');
  }

  return withTenantContext(async () => {
    try {
      await prisma.leads.delete({
        where: { id: leadId },
      });

      revalidatePath('/crm/leads');
      revalidatePath('/crm/crm-dashboard');

      return { success: true };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Leads] deleteLead failed:', dbError);
      throw new Error(
        `[CRM:Leads] Failed to delete lead: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Update lead score
 *
 * @param input - Lead ID and new score/score_value
 * @returns Updated lead record with new score
 * @throws {Error} If lead not found, access denied, or update fails
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with CRM access
 * - Requires OrganizationRole: MEMBER or higher (leads:write permission)
 */
export async function updateLeadScore(input: UpdateLeadScoreInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(user.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'leads:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions');
  }

  const validated = updateLeadScoreSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const lead = await prisma.leads.update({
        where: { id: validated.id },
        data: {
          score: validated.score,
          score_value: validated.score_value,
        },
      });

      revalidatePath('/crm/leads');
      revalidatePath(`/crm/leads/${validated.id}`);

      return lead;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Leads] updateLeadScore failed:', dbError);
      throw new Error(
        `[CRM:Leads] Failed to update lead score: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Update lead status
 *
 * @param input - Lead ID and new status (NEW, CONTACTED, QUALIFIED, etc.)
 * @returns Updated lead record
 * @throws {Error} If lead not found, access denied, or update fails
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with CRM access
 * - Requires OrganizationRole: MEMBER or higher (leads:write permission)
 */
export async function updateLeadStatus(input: UpdateLeadStatusInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(user.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'leads:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions');
  }

  const validated = updateLeadStatusSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const lead = await prisma.leads.update({
        where: { id: validated.id },
        data: {
          status: validated.status,
          // Optionally log status change as an activity
        },
      });

      // If status changed to CONVERTED, could trigger deal creation here

      revalidatePath('/crm/leads');
      revalidatePath(`/crm/leads/${validated.id}`);

      return lead;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Leads] updateLeadStatus failed:', dbError);
      throw new Error(
        `[CRM:Leads] Failed to update lead status: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Bulk assign leads to an agent
 *
 * @param input - Lead IDs array and target assignee user ID
 * @returns Count of updated leads
 * @throws {Error} If access denied or assignment fails
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with CRM access
 * - Requires OrganizationRole: ADMIN or OWNER (leads:manage permission)
 */
export async function bulkAssignLeads(input: BulkAssignLeadsInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(user.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(user.role) || !canManageLeads(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'leads:manage')) {
    throw new Error('Unauthorized: Insufficient organization permissions');
  }

  const validated = bulkAssignLeadsSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const result = await prisma.leads.updateMany({
        where: {
          id: { in: validated.lead_ids },
        },
        data: {
          assigned_to_id: validated.assigned_to_id,
        },
      });

      revalidatePath('/crm/leads');

      return { count: result.count };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Leads] bulkAssignLeads failed:', dbError);
      throw new Error(
        `[CRM:Leads] Failed to bulk assign leads: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Convert lead to contact/customer
 *
 * Creates a new contact from the lead data and marks the lead as CONVERTED.
 *
 * @param leadId - Lead ID to convert
 * @returns Object containing the newly created contact
 * @throws {Error} If lead not found, already converted, or conversion fails
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with CRM access
 * - Requires OrganizationRole: MEMBER or higher (leads:write permission)
 */
export async function convertLead(leadId: string) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // 1. Check subscription tier
  if (!canAccessFeature(user.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 2. Check GlobalRole
  if (!canAccessCRM(user.role) || !canManageLeads(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'leads:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions');
  }

  return withTenantContext(async () => {
    try {
      // Get lead data
      const lead = await prisma.leads.findFirst({
        where: { id: leadId },
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      // Create contact from lead
      const contact = await prisma.contacts.create({
        data: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          type: 'CLIENT',
          status: 'ACTIVE',
          notes: lead.notes,
          tags: lead.tags,
          organization_id: lead.organization_id,
          assigned_to_id: lead.assigned_to_id,
        },
      });

      // Update lead status
      await prisma.leads.update({
        where: { id: leadId },
        data: { status: 'CONVERTED' },
      });

      revalidatePath('/crm/leads');
      revalidatePath('/crm/contacts');
      revalidatePath('/crm/crm-dashboard');

      return { contact };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Leads] convertLead failed:', dbError);
      throw new Error(
        `[CRM:Leads] Failed to convert lead: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}
