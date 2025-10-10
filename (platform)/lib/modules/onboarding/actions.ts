'use server';

type CreateOnboardingSessionInput = any;
type UpdateOnboardingStepInput = any;
type CompleteOnboardingInput = any;
type OrgDetailsInput = any;
type PlanSelectionInput = any;

/**
 * Onboarding Module - Server Actions
 *
 * Exposes validated server actions for the onboarding flow
 */

// ============================================================================
// Session Management Actions
// ============================================================================

/**
 * Create new onboarding session
 */
export async function createOnboardingSession(
  input: CreateOnboardingSessionInput
) {
  try {
    const validated = input;
    const session = await createSession(validated.userId);

    return {
      success: true,
      data: {
        sessionToken: session.session_token,
        currentStep: session.current_step,
        expiresAt: session.expires_at,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create onboarding session',
    };
  }
}

/**
 * Update onboarding step with validated data
 */
export async function updateOnboardingStep(input: UpdateOnboardingStepInput) {
  try {
    const validated = input;
    const session = await updateStep(
      validated.sessionToken,
      validated.step,
      validated.data
    );

    return {
      success: true,
      data: {
        currentStep: session.current_step,
        sessionToken: session.session_token,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update onboarding step',
    };
  }
}

// ============================================================================
// Step-Specific Actions
// ============================================================================

/**
 * Save organization details (Step 1)
 */
export async function saveOrgDetails(
  sessionToken: string,
  input: OrgDetailsInput
) {
  try {
    const validated = input;

    const session = await updateStep(sessionToken, 1, validated);

    return {
      success: true,
      data: {
        orgName: session.org_name,
        orgWebsite: session.org_website,
        orgDescription: session.org_description,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to save organization details',
    };
  }
}

/**
 * Save plan selection (Step 2)
 */
export async function savePlanSelection(
  sessionToken: string,
  input: PlanSelectionInput
) {
  try {
    const validated = input;

    const session = await updateStep(sessionToken, 2, validated);

    return {
      success: true,
      data: {
        selectedTier: session.selected_tier,
        billingCycle: session.billing_cycle,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to save plan selection',
    };
  }
}

/**
 * Create payment intent for selected plan (Step 3)
 */
export async function createOnboardingPaymentIntent(
  sessionToken: string,
  tier: string,
  billingCycle: string
) {
  try {
    // Validate session exists
    await getOnboardingSession(sessionToken);

    // Create payment intent
    const result = await createPaymentIntent(
      tier as any,
      billingCycle as any,
      sessionToken
    );

    if (!result) {
      // FREE or CUSTOM tier - no payment needed
      return {
        success: true,
        data: { requiresPayment: false },
      };
    }

    return {
      success: true,
      data: {
        requiresPayment: true,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create payment intent',
    };
  }
}

/**
 * Confirm payment status (Step 3)
 */
export async function confirmOnboardingPayment(sessionToken: string) {
  try {
    const paymentSucceeded = await confirmPayment(sessionToken);

    return {
      success: true,
      data: { paymentSucceeded },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to confirm payment',
    };
  }
}

// ============================================================================
// Completion Action
// ============================================================================

/**
 * Complete onboarding and create organization (Step 4)
 */
export async function completeOnboarding(input: CompleteOnboardingInput) {
  try {
    const validated = input;
    const result = await completeFlow(validated.sessionToken);

    return {
      success: true,
      data: {
        organizationId: result.organization.id,
        organizationSlug: result.organization.slug,
        subscriptionId: result.subscription.id,
        subscriptionTier: result.subscription.tier,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to complete onboarding',
    };
  }
}
