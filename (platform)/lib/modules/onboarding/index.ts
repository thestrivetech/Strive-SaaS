/**
 * Onboarding Module - Public API
 *
 * Multi-step onboarding flow with Stripe payment integration
 */

// ============================================================================
// Server Actions
// ============================================================================

export {
  createOnboardingSession,
  updateOnboardingStep,
  saveOrgDetails,
  savePlanSelection,
  createOnboardingPaymentIntent,
  confirmOnboardingPayment,
  completeOnboarding,
} from './actions';

// ============================================================================
// Queries
// ============================================================================

export {
  getSessionByToken,
  getSessionByUserId,
  getActiveSessions,
  getCompletedSessions,
  getSessionStats,
  getSessionsByPaymentStatus,
} from './queries';

// ============================================================================
// Session Management
// ============================================================================

export {
  createOnboardingSession as createSession,
  getOnboardingSession,
  updateOnboardingStep as updateStep,
  markSessionComplete,
} from './session';

// ============================================================================
// Payment
// ============================================================================

export {
  createPaymentIntent,
  confirmPayment,
  getPaymentIntentStatus,
} from './payment';

// ============================================================================
// Pricing Utilities
// ============================================================================

export {
  calculatePrice,
  calculatePriceCents,
  TIER_PRICES,
} from './utils';

// ============================================================================
// Completion
// ============================================================================

export {
  completeOnboarding as completeFlow,
  getCompletedOnboarding,
  cleanupExpiredSessions,
} from './completion';

// ============================================================================
// Schemas & Types
// ============================================================================

export {
  createOnboardingSessionSchema,
  updateOnboardingStepSchema,
  completeOnboardingSchema,
  orgDetailsSchema,
  planSelectionSchema,
  paymentIntentSchema,
  confirmPaymentSchema,
  type CreateOnboardingSessionInput,
  type UpdateOnboardingStepInput,
  type CompleteOnboardingInput,
  type OrgDetailsInput,
  type PlanSelectionInput,
  type PaymentIntentInput,
  type ConfirmPaymentInput,
} from './schemas';
