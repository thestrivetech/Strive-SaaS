'use server';

import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';

/**
 * Progress calculation weights
 *
 * These weights determine how much each component contributes
 * to the overall transaction progress percentage.
 */
const PROGRESS_WEIGHTS = {
  tasks: 0.5, // 50% - Task completion
  documents: 0.3, // 30% - Document collection
  signatures: 0.2, // 20% - Signature completion
};

/**
 * Calculate overall progress for a transaction loop
 *
 * Progress is a weighted average of:
 * - Task completion (50%)
 * - Document collection (30%)
 * - Signature completion (20%)
 *
 * @param loopId - Transaction loop ID
 * @returns Progress percentage (0-100) and milestone info
 * @throws Error if loop not found or user not authenticated
 */
export async function calculateLoopProgress(loopId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  // Get loop with all related data
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: loopId,
      organization_id: organizationId,
    },
    include: {
      transaction_tasks: true,
      documents: true,
      signatures: {
        include: {
          signatures: true,
        },
      },
    },
  });

  if (!loop) {
    throw new Error('Transaction loop not found');
  }

  // Calculate task completion percentage
  const totalTasks = loop.transaction_tasks.length;
  const completedTasks = loop.transaction_tasks.filter(
    (t: { status: string }) => t.status === 'DONE'
  ).length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate document collection percentage
  // Using a baseline of 5 required documents as minimum
  const MINIMUM_REQUIRED_DOCS = 5;
  const documentCount = loop.documents.length;
  const docProgress = Math.min((documentCount / MINIMUM_REQUIRED_DOCS) * 100, 100);

  // Calculate signature completion percentage
  const totalSignatureRequests = loop.signatures.length;
  let totalSignatures = 0;
  let completedSignatures = 0;

  for (const request of loop.signatures) {
    totalSignatures += request.signatures.length;
    completedSignatures += request.signatures.filter(
      (s: { status: string }) => s.status === 'SIGNED'
    ).length;
  }

  const signatureProgress =
    totalSignatures > 0 ? (completedSignatures / totalSignatures) * 100 : 0;

  // Calculate weighted overall progress
  const overallProgress = Math.round(
    taskProgress * PROGRESS_WEIGHTS.tasks +
      docProgress * PROGRESS_WEIGHTS.documents +
      signatureProgress * PROGRESS_WEIGHTS.signatures
  );

  // Get milestone information
  const currentMilestone = getCurrentMilestone(
    loop.transaction_type,
    overallProgress
  );
  const nextMilestone = getNextMilestone(loop.transaction_type, overallProgress);

  // Update loop progress in database
  await prisma.transaction_loops.update({
    where: { id: loopId },
    data: { progress: overallProgress },
  });

  // Create audit log
  await prisma.transaction_audit_logs.create({
    data: {
      action: 'updated_progress',
      entity_type: 'transaction_loop',
      entity_id: loopId,
      new_values: {
        progress: overallProgress,
        taskProgress,
        docProgress,
        signatureProgress,
        currentMilestone: currentMilestone?.name,
        nextMilestone: nextMilestone?.name,
      },
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  return {
    success: true,
    progress: overallProgress,
    breakdown: {
      tasks: {
        completed: completedTasks,
        total: totalTasks,
        percentage: Math.round(taskProgress),
      },
      documents: {
        count: documentCount,
        percentage: Math.round(docProgress),
      },
      signatures: {
        completed: completedSignatures,
        total: totalSignatures,
        percentage: Math.round(signatureProgress),
      },
    },
    milestones: {
      current: currentMilestone,
      next: nextMilestone,
    },
  };
}

/**
 * Recalculate progress for all active loops in an organization
 *
 * Useful for batch updates or maintenance tasks.
 *
 * @returns Number of loops updated
 * @throws Error if user not authenticated
 */
export async function recalculateAllLoopProgress() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  // Get all active loops for organization
  const loops = await prisma.transaction_loops.findMany({
    where: {
      organization_id: organizationId,
      status: {
        in: ['ACTIVE', 'UNDER_CONTRACT', 'CLOSING'],
      },
    },
    select: {
      id: true,
    },
  });

  // Update progress for each loop
  let updatedCount = 0;
  for (const loop of loops) {
    try {
      await calculateLoopProgress(loop.id);
      updatedCount++;
    } catch (error) {
      console.error(`Failed to update progress for loop ${loop.id}:`, error);
      // Continue with other loops even if one fails
    }
  }

  return { success: true, updatedCount };
}

/**
 * Get progress summary for all loops in an organization
 *
 * Useful for dashboard statistics and reporting.
 *
 * @returns Aggregated progress statistics
 * @throws Error if user not authenticated
 */
export async function getProgressSummary() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  const loops = await prisma.transaction_loops.findMany({
    where: {
      organization_id: organizationId,
      status: {
        not: 'CLOSED',
      },
    },
    select: {
      id: true,
      progress: true,
      status: true,
      transaction_type: true,
    },
  });

  const summary = {
    totalLoops: loops.length,
    averageProgress: 0,
    byStatus: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    progressDistribution: {
      '0-25': 0,
      '26-50': 0,
      '51-75': 0,
      '76-100': 0,
    },
  };

  if (loops.length === 0) {
    return { success: true, summary };
  }

  // Calculate statistics
  let totalProgress = 0;
  for (const loop of loops) {
    totalProgress += loop.progress;

    // Count by status
    summary.byStatus[loop.status] = (summary.byStatus[loop.status] || 0) + 1;

    // Count by type
    summary.byType[loop.transaction_type] =
      (summary.byType[loop.transaction_type] || 0) + 1;

    // Progress distribution
    if (loop.progress <= 25) {
      summary.progressDistribution['0-25']++;
    } else if (loop.progress <= 50) {
      summary.progressDistribution['26-50']++;
    } else if (loop.progress <= 75) {
      summary.progressDistribution['51-75']++;
    } else {
      summary.progressDistribution['76-100']++;
    }
  }

  summary.averageProgress = Math.round(totalProgress / loops.length);

  return { success: true, summary };
}

/**
 * Transaction milestones by type
 * Defines the milestone progression for each transaction type
 */
interface Milestone {
  name: string;
  completedPercentage: number;
}

const TRANSACTION_MILESTONES: Record<string, Milestone[]> = {
  PURCHASE_AGREEMENT: [
    { name: 'Offer Submitted', completedPercentage: 10 },
    { name: 'Offer Accepted', completedPercentage: 20 },
    { name: 'Inspection Complete', completedPercentage: 40 },
    { name: 'Financing Approved', completedPercentage: 60 },
    { name: 'Appraisal Complete', completedPercentage: 75 },
    { name: 'Final Walkthrough', completedPercentage: 90 },
    { name: 'Closing Complete', completedPercentage: 100 },
  ],
  LISTING_AGREEMENT: [
    { name: 'Listing Created', completedPercentage: 10 },
    { name: 'Photos & Marketing Complete', completedPercentage: 30 },
    { name: 'Active on MLS', completedPercentage: 50 },
    { name: 'Offer Received', completedPercentage: 70 },
    { name: 'Under Contract', completedPercentage: 85 },
    { name: 'Sale Complete', completedPercentage: 100 },
  ],
  BUYER_AGREEMENT: [
    { name: 'Agreement Signed', completedPercentage: 10 },
    { name: 'Buyer Pre-approved', completedPercentage: 30 },
    { name: 'Property Search Started', completedPercentage: 50 },
    { name: 'Property Identified', completedPercentage: 70 },
    { name: 'Offer Submitted', completedPercentage: 85 },
    { name: 'Offer Accepted', completedPercentage: 100 },
  ],
  LEASE_AGREEMENT: [
    { name: 'Lease Created', completedPercentage: 20 },
    { name: 'Tenant Screening Complete', completedPercentage: 40 },
    { name: 'Security Deposit Received', completedPercentage: 60 },
    { name: 'Lease Signed', completedPercentage: 80 },
    { name: 'Move-in Complete', completedPercentage: 100 },
  ],
};

/**
 * Get all milestones for a transaction type
 *
 * @param transactionType - Type of transaction
 * @returns Array of milestones for the transaction type
 */
export function getMilestonesForType(transactionType: string): Milestone[] {
  return TRANSACTION_MILESTONES[transactionType] || [];
}

/**
 * Get current milestone based on progress percentage
 *
 * @param transactionType - Type of transaction
 * @param progress - Current progress percentage (0-100)
 * @returns Current milestone or null if none found
 */
export function getCurrentMilestone(
  transactionType: string,
  progress: number
): Milestone | null {
  const milestones = getMilestonesForType(transactionType);

  if (milestones.length === 0) {
    return null;
  }

  // Find the last milestone that has been completed (progress >= completedPercentage)
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (progress >= milestones[i].completedPercentage) {
      return milestones[i];
    }
  }

  // If progress is less than first milestone, return null (not started yet)
  return null;
}

/**
 * Get next milestone based on progress percentage
 *
 * @param transactionType - Type of transaction
 * @param progress - Current progress percentage (0-100)
 * @returns Next milestone or null if at 100%
 */
export function getNextMilestone(
  transactionType: string,
  progress: number
): Milestone | null {
  const milestones = getMilestonesForType(transactionType);

  if (milestones.length === 0) {
    return null;
  }

  // Find the first milestone that hasn't been completed yet (progress < completedPercentage)
  for (const milestone of milestones) {
    if (progress < milestone.completedPercentage) {
      return milestone;
    }
  }

  // If all milestones are complete, return null
  return null;
}
