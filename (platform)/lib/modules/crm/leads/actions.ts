'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessCRM, canManageLeads, canDeleteLeads } from '@/lib/auth/rbac';
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
 * RBAC: Requires CRM access + lead creation permission
 *
 * @param input - Lead data
 * @returns Created lead
 */
export async function createLead(input: CreateLeadInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // Check RBAC permissions
  if (!canAccessCRM(user.role) || !canManageLeads(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to create leads');
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
      revalidatePath('/crm/dashboard');

      return lead;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Actions] createLead failed:', dbError);
      throw new Error('Failed to create lead');
    }
  });
}

/**
 * Update an existing lead
 *
 * @param input - Updated lead data
 * @returns Updated lead
 */
export async function updateLead(input: UpdateLeadInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role) || !canManageLeads(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to update leads');
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
      revalidatePath('/crm/dashboard');

      return lead;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Actions] updateLead failed:', dbError);
      throw new Error('Failed to update lead');
    }
  });
}

/**
 * Delete a lead
 *
 * @param leadId - Lead ID
 */
export async function deleteLead(leadId: string) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role) || !canDeleteLeads(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to delete leads');
  }

  return withTenantContext(async () => {
    try {
      await prisma.leads.delete({
        where: { id: leadId },
      });

      revalidatePath('/crm/leads');
      revalidatePath('/crm/dashboard');

      return { success: true };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Actions] deleteLead failed:', dbError);
      throw new Error('Failed to delete lead');
    }
  });
}

/**
 * Update lead score
 *
 * @param input - Lead ID and new score
 */
export async function updateLeadScore(input: UpdateLeadScoreInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions');
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
      console.error('[Leads Actions] updateLeadScore failed:', dbError);
      throw new Error('Failed to update lead score');
    }
  });
}

/**
 * Update lead status
 *
 * @param input - Lead ID and new status
 */
export async function updateLeadStatus(input: UpdateLeadStatusInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions');
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
      console.error('[Leads Actions] updateLeadStatus failed:', dbError);
      throw new Error('Failed to update lead status');
    }
  });
}

/**
 * Bulk assign leads to an agent
 *
 * @param input - Lead IDs and assignee ID
 */
export async function bulkAssignLeads(input: BulkAssignLeadsInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role) || !canManageLeads(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions');
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
      console.error('[Leads Actions] bulkAssignLeads failed:', dbError);
      throw new Error('Failed to assign leads');
    }
  });
}

/**
 * Convert lead to contact/customer
 *
 * @param leadId - Lead ID
 */
export async function convertLead(leadId: string) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role) || !canManageLeads(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions');
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
      revalidatePath('/crm/dashboard');

      return { contact };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Actions] convertLead failed:', dbError);
      throw new Error('Failed to convert lead');
    }
  });
}
