'use client';

import { useRouter } from 'next/navigation';
import { UpgradePrompt } from './upgrade-prompt';

interface TierGateProps {
  requiredTier: 'FREE' | 'CUSTOM' | 'STARTER' | 'GROWTH' | 'ELITE' | 'ENTERPRISE';
  children: React.ReactNode;
  feature?: string;
  userTier?: string;
}

/**
 * Tier hierarchy for subscription tiers
 * Database enum: FREE < CUSTOM < STARTER < GROWTH < ELITE < ENTERPRISE
 */
const TIER_HIERARCHY: Record<string, number> = {
  FREE: 0,
  CUSTOM: 1,
  STARTER: 2,
  GROWTH: 3,
  ELITE: 4,
  ENTERPRISE: 5,
};

/**
 * Subscription Tier Gate Component
 *
 * Restricts access to features based on user's subscription tier
 * Shows upgrade prompt if user's tier is insufficient
 *
 * @param requiredTier - Minimum tier required to access the feature
 * @param children - Content to show if user has access
 * @param feature - Feature name for the upgrade prompt
 * @param userTier - Current user's subscription tier (optional, will be fetched from context if not provided)
 *
 * @example
 * ```tsx
 * <TierGate requiredTier="GROWTH" feature="Transaction Management">
 *   <TransactionDashboard />
 * </TierGate>
 * ```
 */
export function TierGate({ requiredTier, children, feature, userTier = 'FREE' }: TierGateProps) {
  const router = useRouter();

  // Compare user's tier with required tier using hierarchy
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;
  const requiredTierLevel = TIER_HIERARCHY[requiredTier] || 0;
  const hasAccess = userTierLevel >= requiredTierLevel;

  if (!hasAccess) {
    return (
      <UpgradePrompt
        currentTier={userTier as 'FREE' | 'CUSTOM' | 'STARTER' | 'GROWTH' | 'ELITE' | 'ENTERPRISE'}
        requiredTier={requiredTier}
        feature={feature || 'This Feature'}
      />
    );
  }

  return <>{children}</>;
}
