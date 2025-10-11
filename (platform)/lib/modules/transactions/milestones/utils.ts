/**
 * Transaction Milestone Utilities
 *
 * Pure utility functions for milestone calculations.
 * These functions don't access the database or require authentication.
 */

/**
 * Transaction milestones by type
 * Defines the milestone progression for each transaction type
 */
export interface Milestone {
  name: string;
  completedPercentage: number;
}

export const TRANSACTION_MILESTONES: Record<string, Milestone[]> = {
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
