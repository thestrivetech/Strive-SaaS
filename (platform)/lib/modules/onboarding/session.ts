'use server';

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * Onboarding Module - Session Management
 *
 * Handles session creation, validation, and step progression
 * for the multi-step onboarding flow
 */

// ============================================================================
// Session Creation
// ============================================================================

/**
 * Create a new onboarding session
 * @param userId - Optional user ID if authenticated
 * @returns Created onboarding session
 */
export async function createOnboardingSession(userId?: string) {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return await prisma.onboarding_sessions.create({
    data: {
      session_token: sessionToken,
      user_id: userId,
      expires_at: expiresAt,
      current_step: 1,
      total_steps: 4,
    },
  });
}

// ============================================================================
// Session Retrieval & Validation
// ============================================================================

/**
 * Get and validate onboarding session
 * @param sessionToken - Unique session token
 * @throws Error if session is invalid, expired, or completed
 */
export async function getOnboardingSession(sessionToken: string) {
  const session = await prisma.onboarding_sessions.findUnique({
    where: { session_token: sessionToken },
  });

  if (!session) {
    throw new Error('Invalid session token');
  }

  if (session.expires_at < new Date()) {
    throw new Error('Session expired');
  }

  if (session.is_completed) {
    throw new Error('Session already completed');
  }

  return session;
}

// ============================================================================
// Step Updates
// ============================================================================

/**
 * Update onboarding step and store step-specific data
 * @param sessionToken - Session token
 * @param step - Step number (1-4)
 * @param data - Step-specific data
 */
export async function updateOnboardingStep(
  sessionToken: string,
  step: number,
  data: Record<string, any>
) {
  // Validate session first
  const session = await getOnboardingSession(sessionToken);

  const updateData: any = {
    current_step: step,
    updated_at: new Date(),
  };

  // Store step-specific data
  if (step === 1) {
    // Organization Details
    Object.assign(updateData, {
      org_name: data.orgName,
      org_website: data.orgWebsite || null,
      org_description: data.orgDescription || null,
    });
  } else if (step === 2) {
    // Plan Selection
    Object.assign(updateData, {
      selected_tier: data.selectedTier,
      billing_cycle: data.billingCycle,
    });
  } else if (step === 3) {
    // Payment
    Object.assign(updateData, {
      stripe_payment_intent_id: data.paymentIntentId,
      payment_status: data.paymentStatus || 'PENDING',
    });
  }

  return await prisma.onboarding_sessions.update({
    where: { session_token: sessionToken },
    data: updateData,
  });
}

/**
 * Mark session as complete
 * @param sessionToken - Session token
 * @param organizationId - Created organization ID
 */
export async function markSessionComplete(
  sessionToken: string,
  organizationId: string
) {
  return await prisma.onboarding_sessions.update({
    where: { session_token: sessionToken },
    data: {
      is_completed: true,
      completed_at: new Date(),
      organization_id: organizationId,
    },
  });
}
