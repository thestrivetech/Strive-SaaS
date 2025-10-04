import { z } from 'zod';
import { TransactionType } from '@prisma/client';

/**
 * Schema for a single milestone
 */
export const MilestoneSchema = z.object({
  name: z.string().min(1, 'Milestone name is required'),
  completedPercentage: z.number().min(0).max(100),
  requiredTasks: z.array(z.string()).default([]),
  requiredDocuments: z.array(z.string()).default([]),
});

export type Milestone = z.infer<typeof MilestoneSchema>;

/**
 * Pre-defined milestone configurations by transaction type
 *
 * Each transaction type has standard milestones that represent
 * key stages in the transaction lifecycle.
 */
export const TRANSACTION_MILESTONES: Record<TransactionType, Milestone[]> = {
  PURCHASE_AGREEMENT: [
    {
      name: 'Offer Accepted',
      completedPercentage: 15,
      requiredTasks: [],
      requiredDocuments: ['Purchase Agreement'],
    },
    {
      name: 'Inspection Complete',
      completedPercentage: 35,
      requiredTasks: [],
      requiredDocuments: ['Inspection Report'],
    },
    {
      name: 'Appraisal Complete',
      completedPercentage: 50,
      requiredTasks: [],
      requiredDocuments: ['Appraisal Report'],
    },
    {
      name: 'Financing Approved',
      completedPercentage: 70,
      requiredTasks: [],
      requiredDocuments: ['Loan Approval Letter'],
    },
    {
      name: 'Final Walkthrough',
      completedPercentage: 90,
      requiredTasks: [],
      requiredDocuments: [],
    },
    {
      name: 'Closing Complete',
      completedPercentage: 100,
      requiredTasks: [],
      requiredDocuments: ['Closing Disclosure', 'Deed'],
    },
  ],
  LISTING_AGREEMENT: [
    {
      name: 'Listing Active',
      completedPercentage: 25,
      requiredTasks: [],
      requiredDocuments: ['Listing Agreement'],
    },
    {
      name: 'Offer Received',
      completedPercentage: 50,
      requiredTasks: [],
      requiredDocuments: ['Purchase Offer'],
    },
    {
      name: 'Offer Accepted',
      completedPercentage: 75,
      requiredTasks: [],
      requiredDocuments: ['Accepted Offer'],
    },
    {
      name: 'Closing Complete',
      completedPercentage: 100,
      requiredTasks: [],
      requiredDocuments: ['Closing Disclosure'],
    },
  ],
  LEASE_AGREEMENT: [
    {
      name: 'Application Submitted',
      completedPercentage: 25,
      requiredTasks: [],
      requiredDocuments: ['Rental Application'],
    },
    {
      name: 'Background Check Complete',
      completedPercentage: 50,
      requiredTasks: [],
      requiredDocuments: ['Background Report'],
    },
    {
      name: 'Lease Signed',
      completedPercentage: 75,
      requiredTasks: [],
      requiredDocuments: ['Signed Lease'],
    },
    {
      name: 'Move-In Complete',
      completedPercentage: 100,
      requiredTasks: [],
      requiredDocuments: ['Move-In Checklist'],
    },
  ],
  COMMERCIAL_PURCHASE: [
    {
      name: 'Letter of Intent',
      completedPercentage: 10,
      requiredTasks: [],
      requiredDocuments: ['LOI'],
    },
    {
      name: 'Due Diligence',
      completedPercentage: 30,
      requiredTasks: [],
      requiredDocuments: ['Due Diligence Report'],
    },
    {
      name: 'Financing Arranged',
      completedPercentage: 50,
      requiredTasks: [],
      requiredDocuments: ['Financing Commitment'],
    },
    {
      name: 'Environmental Review',
      completedPercentage: 70,
      requiredTasks: [],
      requiredDocuments: ['Environmental Report'],
    },
    {
      name: 'Final Approval',
      completedPercentage: 90,
      requiredTasks: [],
      requiredDocuments: [],
    },
    {
      name: 'Closing Complete',
      completedPercentage: 100,
      requiredTasks: [],
      requiredDocuments: ['Closing Documents'],
    },
  ],
  COMMERCIAL_LEASE: [
    {
      name: 'Space Tour & Requirements',
      completedPercentage: 20,
      requiredTasks: [],
      requiredDocuments: [],
    },
    {
      name: 'Letter of Intent',
      completedPercentage: 40,
      requiredTasks: [],
      requiredDocuments: ['LOI'],
    },
    {
      name: 'Lease Negotiation',
      completedPercentage: 60,
      requiredTasks: [],
      requiredDocuments: ['Draft Lease'],
    },
    {
      name: 'Lease Execution',
      completedPercentage: 80,
      requiredTasks: [],
      requiredDocuments: ['Signed Lease'],
    },
    {
      name: 'Tenant Improvements',
      completedPercentage: 100,
      requiredTasks: [],
      requiredDocuments: ['TI Completion Certificate'],
    },
  ],
};

/**
 * Get milestones for a specific transaction type
 *
 * @param transactionType - Type of transaction
 * @returns Array of milestones
 */
export function getMilestonesForType(transactionType: TransactionType): Milestone[] {
  return TRANSACTION_MILESTONES[transactionType] || [];
}

/**
 * Calculate which milestone a loop is currently at based on progress percentage
 *
 * @param transactionType - Type of transaction
 * @param progress - Current progress percentage (0-100)
 * @returns Current milestone
 */
export function getCurrentMilestone(
  transactionType: TransactionType,
  progress: number
): Milestone | null {
  const milestones = getMilestonesForType(transactionType);

  if (milestones.length === 0) {
    return null;
  }

  // Find the last milestone that has been reached
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (progress >= milestones[i].completedPercentage) {
      return milestones[i];
    }
  }

  // If progress is 0, return first milestone as target
  return milestones[0];
}

/**
 * Get the next milestone to complete
 *
 * @param transactionType - Type of transaction
 * @param progress - Current progress percentage (0-100)
 * @returns Next milestone or null if all completed
 */
export function getNextMilestone(
  transactionType: TransactionType,
  progress: number
): Milestone | null {
  const milestones = getMilestonesForType(transactionType);

  if (milestones.length === 0) {
    return null;
  }

  // Find the first milestone that hasn't been reached
  for (const milestone of milestones) {
    if (progress < milestone.completedPercentage) {
      return milestone;
    }
  }

  // All milestones completed
  return null;
}
