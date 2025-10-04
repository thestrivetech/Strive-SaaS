'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessCRM, canManageContacts, canDeleteContacts } from '@/lib/auth/rbac';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import {
  createContactSchema,
  updateContactSchema,
  logCommunicationSchema,
  updateContactStatusSchema,
  bulkAssignContactsSchema,
  type CreateContactInput,
  type UpdateContactInput,
  type LogCommunicationInput,
  type UpdateContactStatusInput,
  type BulkAssignContactsInput,
} from './schemas';

/**
 * Create a new contact
 *
 * RBAC: Requires CRM access + contact creation permission
 *
 * @param input - Contact data
 * @returns Created contact
 */
export async function createContact(input: CreateContactInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // Check RBAC permissions
  if (!canAccessCRM(user.role) || !canManageContacts(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to create contacts');
  }

  // Validate input
  const validated = createContactSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const contact = await prisma.contacts.create({
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

      // Revalidate contacts page
      revalidatePath('/crm/contacts');
      revalidatePath('/crm/dashboard');

      return contact;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Contacts Actions] createContact failed:', dbError);
      throw new Error('Failed to create contact');
    }
  });
}

/**
 * Update an existing contact
 *
 * @param input - Updated contact data
 * @returns Updated contact
 */
export async function updateContact(input: UpdateContactInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role) || !canManageContacts(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to update contacts');
  }

  const validated = updateContactSchema.parse(input);
  const { id, ...updateData } = validated;

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      // Verify contact belongs to user's organization
      const existingContact = await prisma.contacts.findFirst({
        where: {
          id,
          organization_id: orgId,
        },
      });

      if (!existingContact) {
        throw new Error('Contact not found or access denied');
      }

      const contact = await prisma.contacts.update({
        where: { id },
        data: {
          ...updateData,
          updated_at: new Date(),
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

      // Revalidate pages
      revalidatePath('/crm/contacts');
      revalidatePath(`/crm/contacts/${id}`);
      revalidatePath('/crm/dashboard');

      return contact;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Contacts Actions] updateContact failed:', dbError);
      throw new Error('Failed to update contact');
    }
  });
}

/**
 * Delete a contact
 *
 * RBAC: Requires delete permission
 *
 * @param id - Contact ID
 * @returns Success status
 */
export async function deleteContact(id: string) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role) || !canDeleteContacts(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to delete contacts');
  }

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      // Verify contact belongs to user's organization
      const existingContact = await prisma.contacts.findFirst({
        where: {
          id,
          organization_id: orgId,
        },
      });

      if (!existingContact) {
        throw new Error('Contact not found or access denied');
      }

      await prisma.contacts.delete({
        where: { id },
      });

      // Revalidate pages
      revalidatePath('/crm/contacts');
      revalidatePath('/crm/dashboard');

      return { success: true };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Contacts Actions] deleteContact failed:', dbError);
      throw new Error('Failed to delete contact');
    }
  });
}

/**
 * Log a communication with a contact
 *
 * Creates an activity and updates last_contact_at
 *
 * @param input - Communication data
 * @returns Created activity
 */
export async function logCommunication(input: LogCommunicationInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to log communications');
  }

  const validated = logCommunicationSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      // Verify contact belongs to user's organization
      const contact = await prisma.contacts.findFirst({
        where: {
          id: validated.contact_id,
          organization_id: orgId,
        },
      });

      if (!contact) {
        throw new Error('Contact not found or access denied');
      }

      // Create activity
      const activity = await prisma.activities.create({
        data: {
          type: validated.type,
          title: validated.title,
          description: validated.description,
          outcome: validated.outcome,
          duration_minutes: validated.duration_minutes,
          contact_id: validated.contact_id,
          organization_id: orgId,
          created_by_id: user.id,
          completed_at: new Date(), // Mark as completed immediately
        },
        include: {
          created_by: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
            },
          },
        },
      });

      // Update last_contact_at on contact
      await prisma.contacts.update({
        where: { id: validated.contact_id },
        data: {
          last_contact_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Revalidate pages
      revalidatePath(`/crm/contacts/${validated.contact_id}`);
      revalidatePath('/crm/contacts');

      return activity;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Contacts Actions] logCommunication failed:', dbError);
      throw new Error('Failed to log communication');
    }
  });
}

/**
 * Update contact status
 *
 * @param input - Status update data
 * @returns Updated contact
 */
export async function updateContactStatus(input: UpdateContactStatusInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role) || !canManageContacts(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to update contact status');
  }

  const validated = updateContactStatusSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      // Verify contact belongs to user's organization
      const existingContact = await prisma.contacts.findFirst({
        where: {
          id: validated.id,
          organization_id: orgId,
        },
      });

      if (!existingContact) {
        throw new Error('Contact not found or access denied');
      }

      const contact = await prisma.contacts.update({
        where: { id: validated.id },
        data: {
          status: validated.status,
          updated_at: new Date(),
        },
      });

      // Log status change as activity if notes provided
      if (validated.notes) {
        await prisma.activities.create({
          data: {
            type: 'NOTE',
            title: `Status changed to ${validated.status}`,
            description: validated.notes,
            contact_id: validated.id,
            organization_id: orgId,
            created_by_id: user.id,
            completed_at: new Date(),
          },
        });
      }

      // Revalidate pages
      revalidatePath('/crm/contacts');
      revalidatePath(`/crm/contacts/${validated.id}`);

      return contact;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Contacts Actions] updateContactStatus failed:', dbError);
      throw new Error('Failed to update contact status');
    }
  });
}

/**
 * Bulk assign contacts to an agent
 *
 * @param input - Contact IDs and assignee ID
 * @returns Success status
 */
export async function bulkAssignContacts(input: BulkAssignContactsInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role) || !canManageContacts(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to assign contacts');
  }

  const validated = bulkAssignContactsSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      // Update all contacts
      await prisma.contacts.updateMany({
        where: {
          id: { in: validated.contact_ids },
          organization_id: orgId, // Security: ensure contacts belong to org
        },
        data: {
          assigned_to_id: validated.assigned_to_id,
          updated_at: new Date(),
        },
      });

      // Revalidate pages
      revalidatePath('/crm/contacts');

      return { success: true, count: validated.contact_ids.length };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Contacts Actions] bulkAssignContacts failed:', dbError);
      throw new Error('Failed to assign contacts');
    }
  });
}
