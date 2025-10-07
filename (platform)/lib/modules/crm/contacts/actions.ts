'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessCRM, canManageContacts, canDeleteContacts } from '@/lib/auth/rbac';
import { hasOrgPermission } from '@/lib/auth/org-rbac';
import { canAccessFeature } from '@/lib/auth/subscription';
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
 * @param input - Contact data including name, email, phone, company details
 * @returns The created contact record with generated ID and timestamps
 * @throws {Error} If user lacks permissions, validation fails, or database error occurs
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with CRM access
 * - Requires OrganizationRole: MEMBER or higher (contacts:write permission)
 *
 * @example
 * ```typescript
 * const contact = await createContact({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   phone: '+1234567890',
 *   type: 'CLIENT',
 * });
 * ```
 */
export async function createContact(input: CreateContactInput) {
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
  if (!canAccessCRM(user.role) || !canManageContacts(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to create contacts');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'contacts:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions to create contacts');
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
      console.error('[CRM:Contacts] createContact failed:', dbError);
      throw new Error(
        `[CRM:Contacts] Failed to create contact: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Update an existing contact
 *
 * @param input - Updated contact data with ID and fields to modify
 * @returns Updated contact record with latest data
 * @throws {Error} If contact not found, access denied, or update fails
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with CRM access
 * - Requires OrganizationRole: MEMBER or higher (contacts:write permission)
 * - Verifies contact belongs to user's organization
 */
export async function updateContact(input: UpdateContactInput) {
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
  if (!canAccessCRM(user.role) || !canManageContacts(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to update contacts');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'contacts:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions to update contacts');
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
      console.error('[CRM:Contacts] updateContact failed:', dbError);
      throw new Error(
        `[CRM:Contacts] Failed to update contact: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Delete a contact
 *
 * @param id - Contact ID to delete
 * @returns Success status object
 * @throws {Error} If contact not found, access denied, or deletion fails
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with delete permissions
 * - Requires OrganizationRole: ADMIN or OWNER (contacts:manage permission)
 * - Verifies contact belongs to user's organization
 */
export async function deleteContact(id: string) {
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
  if (!canAccessCRM(user.role) || !canDeleteContacts(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to delete contacts');
  }

  // 3. Check OrganizationRole (manage permission for delete)
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'contacts:manage')) {
    throw new Error('Unauthorized: Insufficient organization permissions to delete contacts');
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
      console.error('[CRM:Contacts] deleteContact failed:', dbError);
      throw new Error(
        `[CRM:Contacts] Failed to delete contact: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Log a communication with a contact
 *
 * Creates an activity record and updates the contact's last_contact_at timestamp.
 *
 * @param input - Communication data (type, title, description, contact_id)
 * @returns Created activity record
 * @throws {Error} If contact not found, access denied, or logging fails
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with CRM access
 * - Requires OrganizationRole: MEMBER or higher (activities:write permission)
 * - Verifies contact belongs to user's organization
 */
export async function logCommunication(input: LogCommunicationInput) {
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
    throw new Error('Unauthorized: Insufficient global permissions to log communications');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'activities:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions to log communications');
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
      console.error('[CRM:Contacts] logCommunication failed:', dbError);
      throw new Error(
        `[CRM:Contacts] Failed to log communication: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Update contact status
 *
 * @param input - Status update data (id, new status, optional notes)
 * @returns Updated contact record
 * @throws {Error} If contact not found, access denied, or update fails
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with CRM access
 * - Requires OrganizationRole: MEMBER or higher (contacts:write permission)
 * - Verifies contact belongs to user's organization
 */
export async function updateContactStatus(input: UpdateContactStatusInput) {
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
  if (!canAccessCRM(user.role) || !canManageContacts(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to update contact status');
  }

  // 3. Check OrganizationRole
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'contacts:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions to update contact status');
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
      console.error('[CRM:Contacts] updateContactStatus failed:', dbError);
      throw new Error(
        `[CRM:Contacts] Failed to update contact status: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Bulk assign contacts to an agent
 *
 * @param input - Contact IDs array and target assignee user ID
 * @returns Success status with count of assigned contacts
 * @throws {Error} If access denied or assignment fails
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with CRM access
 * - Requires OrganizationRole: ADMIN or OWNER (contacts:manage permission)
 * - Automatically filters contacts to user's organization
 */
export async function bulkAssignContacts(input: BulkAssignContactsInput) {
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
  if (!canAccessCRM(user.role) || !canManageContacts(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions to assign contacts');
  }

  // 3. Check OrganizationRole (manage permission for bulk operations)
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'contacts:manage')) {
    throw new Error('Unauthorized: Insufficient organization permissions to bulk assign contacts');
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
      console.error('[CRM:Contacts] bulkAssignContacts failed:', dbError);
      throw new Error(
        `[CRM:Contacts] Failed to bulk assign contacts: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}
