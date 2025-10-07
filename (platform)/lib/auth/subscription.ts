/**
 * Subscription Tier-Based Feature Access Control
 *
 * This module enforces subscription tier limits for feature access.
 * Works in conjunction with RBAC (Global + Organization roles).
 *
 * Tier Hierarchy:
 * - FREE: Platform dev assignment only (dashboard, profile)
 * - CUSTOM: Pay-per-use marketplace only
 * - STARTER: CRM, CMS, Transactions ($299/seat)
 * - GROWTH: STARTER + AI, Tools, Analytics ($699/seat)
 * - ELITE: All features + all tools ($999/seat)
 * - ENTERPRISE: Unlimited (custom pricing)
 */

import type { SubscriptionTier } from './constants';

/**
 * Feature-tier mapping
 * Defines which subscription tiers grant access to specific features
 */
const FEATURE_TIERS: Record<string, SubscriptionTier[]> = {
  // Universal features (all tiers)
  dashboard: ['FREE', 'CUSTOM', 'STARTER', 'GROWTH', 'ELITE', 'ENTERPRISE'],
  profile: ['FREE', 'CUSTOM', 'STARTER', 'GROWTH', 'ELITE', 'ENTERPRISE'],
  settings: ['FREE', 'CUSTOM', 'STARTER', 'GROWTH', 'ELITE', 'ENTERPRISE'],

  // STARTER tier minimum (CRM, CMS, Transactions)
  crm: ['STARTER', 'GROWTH', 'ELITE', 'ENTERPRISE'],
  cms: ['STARTER', 'GROWTH', 'ELITE', 'ENTERPRISE'],
  transactions: ['STARTER', 'GROWTH', 'ELITE', 'ENTERPRISE'],
  'real-estate-workspace': ['STARTER', 'GROWTH', 'ELITE', 'ENTERPRISE'],

  // GROWTH tier minimum (AI, Tools, Advanced Analytics)
  ai: ['GROWTH', 'ELITE', 'ENTERPRISE'],
  'ai-hub': ['GROWTH', 'ELITE', 'ENTERPRISE'],
  tools: ['GROWTH', 'ELITE', 'ENTERPRISE'],
  analytics: ['GROWTH', 'ELITE', 'ENTERPRISE'],
  'rei-analytics': ['GROWTH', 'ELITE', 'ENTERPRISE'],
  'expense-tax': ['GROWTH', 'ELITE', 'ENTERPRISE'],
  'cms-marketing': ['GROWTH', 'ELITE', 'ENTERPRISE'],

  // CUSTOM tier (marketplace pay-per-use)
  marketplace: ['CUSTOM', 'GROWTH', 'ELITE', 'ENTERPRISE'],
};

/**
 * Check if user's subscription tier allows access to a feature
 *
 * @param tier - User's subscription tier
 * @param feature - Feature identifier (e.g., 'crm', 'ai', 'marketplace')
 * @returns boolean - true if tier grants access
 *
 * @example
 * ```typescript
 * // Check CRM access
 * const canUseCRM = canAccessFeature('STARTER', 'crm');
 * // Returns: true
 *
 * const canUseCRMFree = canAccessFeature('FREE', 'crm');
 * // Returns: false
 *
 * // Check AI access
 * const canUseAI = canAccessFeature('GROWTH', 'ai');
 * // Returns: true
 * ```
 */
export function canAccessFeature(
  tier: SubscriptionTier,
  feature: string
): boolean {
  const allowedTiers = FEATURE_TIERS[feature];

  if (!allowedTiers) {
    // Unknown feature - deny by default
    return false;
  }

  return allowedTiers.includes(tier);
}

/**
 * Require feature access or throw error
 *
 * @param tier - User's subscription tier
 * @param feature - Required feature
 * @throws Error if tier doesn't grant access
 *
 * @example
 * ```typescript
 * requireFeatureAccess('FREE', 'crm');
 * // Throws: "Upgrade to STARTER tier to access crm features"
 * ```
 */
export function requireFeatureAccess(
  tier: SubscriptionTier,
  feature: string
): void {
  if (!canAccessFeature(tier, feature)) {
    const minimumTier = getMinimumTierForFeature(feature);
    throw new Error(
      `Upgrade to ${minimumTier} tier to access ${feature} features`
    );
  }
}

/**
 * Get minimum subscription tier required for a feature
 *
 * @param feature - Feature identifier
 * @returns SubscriptionTier - Minimum tier, or 'ENTERPRISE' if unknown
 */
export function getMinimumTierForFeature(feature: string): SubscriptionTier {
  const allowedTiers = FEATURE_TIERS[feature];

  if (!allowedTiers || allowedTiers.length === 0) {
    return 'ENTERPRISE';
  }

  // Return first tier in list (they're ordered lowest to highest)
  const tierOrder: SubscriptionTier[] = [
    'FREE',
    'CUSTOM',
    'STARTER',
    'GROWTH',
    'ELITE',
    'ENTERPRISE',
  ];

  for (const tier of tierOrder) {
    if (allowedTiers.includes(tier)) {
      return tier;
    }
  }

  return 'ENTERPRISE';
}

/**
 * Get all features accessible by a subscription tier
 *
 * @param tier - Subscription tier
 * @returns string[] - Array of feature identifiers
 */
export function getFeaturesForTier(tier: SubscriptionTier): string[] {
  const features: string[] = [];

  for (const [feature, allowedTiers] of Object.entries(FEATURE_TIERS)) {
    if (allowedTiers.includes(tier)) {
      features.push(feature);
    }
  }

  return features;
}

/**
 * Check if tier upgrade is needed for a feature
 *
 * @param currentTier - User's current tier
 * @param feature - Feature to check
 * @returns boolean - true if upgrade needed
 */
export function needsUpgrade(
  currentTier: SubscriptionTier,
  feature: string
): boolean {
  return !canAccessFeature(currentTier, feature);
}

/**
 * Get suggested upgrade tier for a feature
 *
 * @param currentTier - User's current tier
 * @param feature - Desired feature
 * @returns SubscriptionTier | null - Suggested tier, or null if already has access
 */
export function getSuggestedUpgrade(
  currentTier: SubscriptionTier,
  feature: string
): SubscriptionTier | null {
  if (canAccessFeature(currentTier, feature)) {
    return null; // Already has access
  }

  return getMinimumTierForFeature(feature);
}

/**
 * Feature usage limits by tier
 * -1 means unlimited
 */
export const TIER_LIMITS = {
  FREE: {
    storage_mb: 0,
    api_calls: 0,
    team_members: 0,
  },
  CUSTOM: {
    storage_mb: 0,
    api_calls: 0,
    team_members: 1, // Solo use only
  },
  STARTER: {
    storage_mb: 10240, // 10 GB
    api_calls: 10000, // per month
    team_members: 5,
  },
  GROWTH: {
    storage_mb: 102400, // 100 GB
    api_calls: 100000, // per month
    team_members: 25,
  },
  ELITE: {
    storage_mb: 1048576, // 1 TB
    api_calls: 1000000, // per month
    team_members: 100,
  },
  ENTERPRISE: {
    storage_mb: -1, // Unlimited
    api_calls: -1, // Unlimited
    team_members: -1, // Unlimited
  },
} as const;

/**
 * Get usage limits for a subscription tier
 *
 * @param tier - Subscription tier
 * @returns Object with storage_mb, api_calls, team_members limits
 */
export function getTierLimits(tier: SubscriptionTier) {
  return TIER_LIMITS[tier] || TIER_LIMITS.FREE;
}

/**
 * Check if tier allows adding team members
 *
 * @param tier - Subscription tier
 * @param currentMembers - Current number of team members
 * @returns boolean - true if can add more members
 */
export function canAddTeamMember(
  tier: SubscriptionTier,
  currentMembers: number
): boolean {
  const limits = getTierLimits(tier);

  if (limits.team_members === -1) {
    return true; // Unlimited
  }

  return currentMembers < limits.team_members;
}

/**
 * Check if tier allows API calls
 *
 * @param tier - Subscription tier
 * @param currentCalls - API calls this month
 * @returns boolean - true if within limits
 */
export function canMakeAPICalls(
  tier: SubscriptionTier,
  currentCalls: number
): boolean {
  const limits = getTierLimits(tier);

  if (limits.api_calls === -1) {
    return true; // Unlimited
  }

  return currentCalls < limits.api_calls;
}

/**
 * Check if tier allows storage usage
 *
 * @param tier - Subscription tier
 * @param currentStorageMB - Current storage usage in MB
 * @returns boolean - true if within limits
 */
export function canUseStorage(
  tier: SubscriptionTier,
  currentStorageMB: number
): boolean {
  const limits = getTierLimits(tier);

  if (limits.storage_mb === -1) {
    return true; // Unlimited
  }

  return currentStorageMB < limits.storage_mb;
}
