import { z } from 'zod';

/**
 * Onboarding Module - Zod Validation Schemas
 *
 * Validates all inputs for the multi-step onboarding process
 */

// ============================================================================
// Session Schemas
// ============================================================================

export const createOnboardingSessionSchema = z.object({
  userId: z.string().uuid().optional(),
});

export const updateOnboardingStepSchema = z.object({
  sessionToken: z.string().min(1),
  step: z.number().int().min(1).max(4),
  data: z.record(z.any()),
});

export const completeOnboardingSchema = z.object({
  sessionToken: z.string().min(1),
});

// ============================================================================
// Step-Specific Schemas
// ============================================================================

/**
 * Step 1: Organization Details
 */
export const orgDetailsSchema = z.object({
  orgName: z.string().min(2, 'Organization name must be at least 2 characters').max(100),
  orgWebsite: z.string().url('Invalid URL format').optional().or(z.literal('')),
  orgDescription: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

/**
 * Step 2: Plan Selection
 */
export const planSelectionSchema = z.object({
  selectedTier: z.enum(['FREE', 'CUSTOM', 'STARTER', 'GROWTH', 'ELITE', 'ENTERPRISE']),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
});

/**
 * Step 3: Payment (handled by Stripe Elements)
 */
export const paymentIntentSchema = z.object({
  sessionToken: z.string().min(1),
  tier: z.enum(['STARTER', 'GROWTH', 'ELITE', 'ENTERPRISE']),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
});

/**
 * Payment Confirmation
 */
export const confirmPaymentSchema = z.object({
  sessionToken: z.string().min(1),
});

// ============================================================================
// Type Exports
// ============================================================================

export type CreateOnboardingSessionInput = z.infer<typeof createOnboardingSessionSchema>;
export type UpdateOnboardingStepInput = z.infer<typeof updateOnboardingStepSchema>;
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
export type OrgDetailsInput = z.infer<typeof orgDetailsSchema>;
export type PlanSelectionInput = z.infer<typeof planSelectionSchema>;
export type PaymentIntentInput = z.infer<typeof paymentIntentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
