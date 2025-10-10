'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';

/**
 * Invite a party to a transaction loop
 *
 * Sends an invitation email with loop details and access link.
 *
 * @param input - Party invitation data
 * @returns Created party with success flag
 * @throws Error if user not authenticated or loop not found
 */
export async function inviteParty(input: CreatePartyInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Validate input
  const validated = input;

  const organizationId = getUserOrganizationId(user);

  // Verify loop exists and belongs to user's organization
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: validated.loopId,
      organization_id: organizationId,
    },
  });

  if (!loop) {
    throw new Error('Transaction loop not found');
  }

  // Create party
  const party = await prisma.loop_parties.create({
    data: {
      name: validated.name,
      email: validated.email,
      phone: validated.phone || null,
      role: validated.role,
      permissions: validated.permissions,
      loop_id: validated.loopId,
      status: 'ACTIVE',
      invited_at: new Date(),
    },
  });

  // Create audit log
  await prisma.transaction_audit_logs.create({
    data: {
      action: 'invited_party',
      entity_type: 'loop_party',
      entity_id: party.id,
      new_values: party,
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  // Send invitation email (will be implemented in Phase 3)
  try {
    const { sendPartyInvitationEmail } = await import('@/lib/email/notifications');
    await sendPartyInvitationEmail({
      to: party.email,
      partyName: party.name,
      role: party.role,
      loopAddress: loop.property_address,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/transactions/${loop.id}`,
    });
  } catch (error) {
    console.error('Failed to send party invitation email:', error);
    // Don't fail the party creation if email fails
  }

  // Revalidate cache
  revalidatePath(`/transactions/${loop.id}`);

  return { success: true, party };
}

/**
 * Update an existing party
 *
 * @param partyId - Party ID to update
 * @param input - Update data
 * @returns Updated party with success flag
 * @throws Error if party not found or user not authenticated
 */
export async function updateParty(partyId: string, input: UpdatePartyInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Validate input
  const validated = input;

  const organizationId = getUserOrganizationId(user);

  // Verify party exists and belongs to user's organization
  const existingParty = await prisma.loop_parties.findFirst({
    where: {
      id: partyId,
      loop: {
        organization_id: organizationId,
      },
    },
  });

  if (!existingParty) {
    throw new Error('Party not found');
  }

  // Update party
  const updatedParty = await prisma.loop_parties.update({
    where: { id: partyId },
    data: validated,
  });

  // Create audit log
  await prisma.transaction_audit_logs.create({
    data: {
      action: 'updated_party',
      entity_type: 'loop_party',
      entity_id: partyId,
      old_values: existingParty,
      new_values: updatedParty,
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  // Revalidate cache
  revalidatePath(`/transactions/${existingParty.loop_id}`);

  return { success: true, party: updatedParty };
}

/**
 * Remove a party from a transaction loop (soft delete)
 *
 * Sets party status to REMOVED instead of deleting the record.
 * Maintains audit trail and signature history.
 *
 * @param partyId - Party ID to remove
 * @returns Success flag
 * @throws Error if party not found or user not authenticated
 */
export async function removeParty(partyId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  // Verify party exists and belongs to user's organization
  const party = await prisma.loop_parties.findFirst({
    where: {
      id: partyId,
      loop: {
        organization_id: organizationId,
      },
    },
  });

  if (!party) {
    throw new Error('Party not found');
  }

  // Soft delete by updating status
  const removedParty = await prisma.loop_parties.update({
    where: { id: partyId },
    data: { status: 'REMOVED' },
  });

  // Create audit log
  await prisma.transaction_audit_logs.create({
    data: {
      action: 'removed_party',
      entity_type: 'loop_party',
      entity_id: partyId,
      old_values: party,
      new_values: removedParty,
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  // Revalidate cache
  revalidatePath(`/transactions/${party.loop_id}`);

  return { success: true };
}
