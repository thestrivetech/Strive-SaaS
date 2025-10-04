'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { CreateLoopSchema, UpdateLoopSchema } from './schemas';
import { hasTransactionPermission, canModifyLoop, TRANSACTION_PERMISSIONS } from './permissions';
import type { CreateLoopInput, UpdateLoopInput } from './schemas';

/**
 * Create a new transaction loop
 *
 * @param input - Loop creation data
 * @returns Created loop with success flag
 * @throws Error if user not authenticated or lacks permission
 */
export async function createLoop(input: CreateLoopInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Check permission
  if (!hasTransactionPermission(user, TRANSACTION_PERMISSIONS.CREATE_LOOPS)) {
    throw new Error('Unauthorized: No permission to create loops');
  }

  // Validate input
  const validated = CreateLoopSchema.parse(input);

  const organizationId = getUserOrganizationId(user);

  // Create loop
  const loop = await prisma.transaction_loops.create({
    data: {
      property_address: validated.propertyAddress,
      transaction_type: validated.transactionType,
      listing_price: validated.listingPrice,
      expected_closing: validated.expectedClosing,
      organization_id: organizationId,
      created_by: user.id,
      status: 'DRAFT',
      progress: 0,
    },
    include: {
      creator: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  // Create audit log
  await prisma.transaction_audit_logs.create({
    data: {
      action: 'created',
      entity_type: 'loop',
      entity_id: loop.id,
      new_values: loop,
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  // Revalidate cache
  revalidatePath('/transactions');

  return { success: true, loop };
}

/**
 * Update an existing transaction loop
 *
 * @param loopId - Loop ID to update
 * @param input - Update data
 * @returns Updated loop with success flag
 * @throws Error if loop not found, user not authenticated, or lacks permission
 */
export async function updateLoop(loopId: string, input: UpdateLoopInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Validate input
  const validated = UpdateLoopSchema.parse(input);

  const organizationId = getUserOrganizationId(user);

  // Fetch existing loop
  const existingLoop = await prisma.transaction_loops.findFirst({
    where: {
      id: loopId,
      organization_id: organizationId,
    },
  });

  if (!existingLoop) {
    throw new Error('Loop not found');
  }

  // Check permission (creator or org admin can modify)
  if (!canModifyLoop(user, existingLoop)) {
    throw new Error('Unauthorized: Cannot modify this loop');
  }

  // Build update data
  const updateData: Record<string, unknown> = {};
  if (validated.propertyAddress !== undefined) updateData.property_address = validated.propertyAddress;
  if (validated.transactionType !== undefined) updateData.transaction_type = validated.transactionType;
  if (validated.listingPrice !== undefined) updateData.listing_price = validated.listingPrice;
  if (validated.status !== undefined) updateData.status = validated.status;
  if (validated.expectedClosing !== undefined) updateData.expected_closing = validated.expectedClosing;
  if (validated.actualClosing !== undefined) updateData.actual_closing = validated.actualClosing;
  if (validated.progress !== undefined) updateData.progress = validated.progress;

  // Update loop
  const updatedLoop = await prisma.transaction_loops.update({
    where: { id: loopId },
    data: updateData,
    include: {
      creator: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  // Create audit log
  await prisma.transaction_audit_logs.create({
    data: {
      action: 'updated',
      entity_type: 'loop',
      entity_id: loopId,
      old_values: existingLoop,
      new_values: updatedLoop,
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  // Revalidate cache
  revalidatePath('/transactions');
  revalidatePath(`/transactions/${loopId}`);

  return { success: true, loop: updatedLoop };
}

/**
 * Delete a transaction loop (cascade deletes all related data)
 *
 * @param loopId - Loop ID to delete
 * @returns Success flag
 * @throws Error if loop not found, user not authenticated, or lacks permission
 */
export async function deleteLoop(loopId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  // Fetch loop
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: loopId,
      organization_id: organizationId,
    },
  });

  if (!loop) {
    throw new Error('Loop not found');
  }

  // Check permission (only org admin/owner can delete)
  if (!hasTransactionPermission(user, TRANSACTION_PERMISSIONS.DELETE_LOOPS)) {
    throw new Error('Unauthorized: No permission to delete loops');
  }

  // Delete loop (cascade will delete related records)
  await prisma.transaction_loops.delete({
    where: { id: loopId },
  });

  // Create audit log
  await prisma.transaction_audit_logs.create({
    data: {
      action: 'deleted',
      entity_type: 'loop',
      entity_id: loopId,
      old_values: loop,
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  // Revalidate cache
  revalidatePath('/transactions');

  return { success: true };
}

/**
 * Update loop progress percentage (0-100)
 *
 * @param loopId - Loop ID
 * @param progress - Progress percentage (0-100)
 * @returns Success flag with updated progress
 * @throws Error if loop not found, invalid progress, or user lacks permission
 */
export async function updateLoopProgress(loopId: string, progress: number) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  if (progress < 0 || progress > 100) {
    throw new Error('Progress must be between 0 and 100');
  }

  const organizationId = getUserOrganizationId(user);

  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: loopId,
      organization_id: organizationId,
    },
  });

  if (!loop) {
    throw new Error('Loop not found');
  }

  if (!canModifyLoop(user, loop)) {
    throw new Error('Unauthorized: Cannot modify this loop');
  }

  const updated = await prisma.transaction_loops.update({
    where: { id: loopId },
    data: { progress },
  });

  revalidatePath(`/transactions/${loopId}`);

  return { success: true, progress: updated.progress };
}
