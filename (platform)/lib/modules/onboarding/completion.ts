'use server';

import { prisma } from '@/lib/database/prisma';
import { revalidatePath } from 'next/cache';
import { markSessionComplete } from './session';

/**
 * Onboarding Module - Completion Logic
 *
 * Handles organization creation, subscription setup, and user association
 * when onboarding flow is complete
 */

// ============================================================================
// Organization Creation
// ============================================================================

/**
 * Create organization from onboarding session data
 * @param sessionToken - Onboarding session token
 * @returns Created organization and subscription
 */
export async function completeOnboarding(sessionToken: string) {
  const session = await prisma.onboarding_sessions.findUnique({
    where: { session_token: sessionToken },
    include: { user: true },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.is_completed) {
    throw new Error('Onboarding already completed');
  }

  if (!session.org_name) {
    throw new Error('Organization name is required');
  }

  if (!session.selected_tier) {
    throw new Error('Subscription tier is required');
  }

  // Verify payment for paid tiers
  if (
    session.selected_tier !== 'FREE' &&
    session.selected_tier !== 'CUSTOM' &&
    session.payment_status !== 'SUCCEEDED'
  ) {
    throw new Error('Payment required to complete onboarding');
  }

  // Generate unique slug from organization name
  const baseSlug = session.org_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  let slug = baseSlug;
  let counter = 1;

  // Ensure slug is unique
  while (await prisma.organizations.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create organization
  const organization = await prisma.organizations.create({
    data: {
      name: session.org_name,
      slug,
      description: session.org_description || null,
      subscription_status: 'ACTIVE',
      billing_email: session.user?.email || null,
    },
  });

  // Create subscription
  const now = new Date();
  const periodEnd = new Date(now);

  // Set period based on billing cycle
  if (session.billing_cycle === 'YEARLY') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  const subscription = await prisma.subscriptions.create({
    data: {
      organization_id: organization.id,
      tier: session.selected_tier,
      status: 'ACTIVE',
      current_period_start: now,
      current_period_end: periodEnd,
      metadata: {
        onboarding_session_token: sessionToken,
        billing_cycle: session.billing_cycle,
        stripe_payment_intent_id: session.stripe_payment_intent_id,
      },
    },
  });

  // Associate user with organization (if user exists)
  if (session.user_id) {
    await prisma.organization_members.create({
      data: {
        user_id: session.user_id,
        organization_id: organization.id,
        role: 'OWNER', // First user is always owner
      },
    });

    // Update user's subscription tier
    await prisma.users.update({
      where: { id: session.user_id },
      data: {
        subscription_tier: session.selected_tier,
      },
    });
  }

  // Mark session as complete
  await markSessionComplete(sessionToken, organization.id);

  // Revalidate dashboard
  revalidatePath('/real-estate/dashboard');
  revalidatePath('/dashboard');

  return { organization, subscription };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get completed onboarding details
 * @param sessionToken - Session token
 */
export async function getCompletedOnboarding(sessionToken: string) {
  const session = await prisma.onboarding_sessions.findUnique({
    where: { session_token: sessionToken },
    include: {
      organization: {
        include: {
          subscriptions: true,
          organization_members: {
            include: {
              users: true,
            },
          },
        },
      },
    },
  });

  if (!session?.is_completed) {
    throw new Error('Onboarding not completed');
  }

  return session;
}

/**
 * Cleanup expired onboarding sessions
 * Should be run via cron job
 */
export async function cleanupExpiredSessions() {
  const deleted = await prisma.onboarding_sessions.deleteMany({
    where: {
      expires_at: {
        lt: new Date(),
      },
      is_completed: false,
    },
  });

  return {
    deletedCount: deleted.count,
    message: `Cleaned up ${deleted.count} expired onboarding sessions`,
  };
}
