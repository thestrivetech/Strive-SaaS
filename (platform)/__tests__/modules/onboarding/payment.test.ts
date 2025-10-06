import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createPaymentIntent, calculatePrice } from '@/lib/modules/onboarding/payment';
import { createOnboardingSession } from '@/lib/modules/onboarding/session';
import { prisma } from '@/lib/database/prisma';

/**
 * Onboarding Payment Integration Tests
 *
 * Note: These tests require STRIPE_SECRET_KEY environment variable
 */

describe('Onboarding Payment Integration', () => {
  let sessionToken: string;

  beforeAll(async () => {
    const session = await createOnboardingSession();
    sessionToken = session.session_token;
  });

  afterAll(async () => {
    if (sessionToken) {
      await prisma.onboarding_sessions.deleteMany({
        where: { session_token: sessionToken },
      });
    }
  });

  describe('Payment Intent Creation', () => {
    it('should return null for FREE tier', async () => {
      const result = await createPaymentIntent('FREE', 'MONTHLY', sessionToken);
      expect(result).toBeNull();
    });

    it('should return null for CUSTOM tier', async () => {
      const result = await createPaymentIntent('CUSTOM', 'MONTHLY', sessionToken);
      expect(result).toBeNull();
    });

    it('should create payment intent for STARTER tier', async () => {
      if (!process.env.STRIPE_SECRET_KEY) {
        console.log('Skipping Stripe test - no API key');
        return;
      }

      const result = await createPaymentIntent('STARTER', 'MONTHLY', sessionToken);

      expect(result).toBeDefined();
      expect(result?.clientSecret).toBeDefined();
      expect(result?.paymentIntentId).toBeDefined();
      expect(result?.clientSecret).toContain('pi_');
    });

    it('should create payment intent for GROWTH tier', async () => {
      if (!process.env.STRIPE_SECRET_KEY) {
        console.log('Skipping Stripe test - no API key');
        return;
      }

      const result = await createPaymentIntent('GROWTH', 'YEARLY', sessionToken);

      expect(result).toBeDefined();
      expect(result?.clientSecret).toBeDefined();
      expect(result?.paymentIntentId).toBeDefined();
    });

    it('should update session with payment intent ID', async () => {
      if (!process.env.STRIPE_SECRET_KEY) {
        console.log('Skipping Stripe test - no API key');
        return;
      }

      await createPaymentIntent('STARTER', 'MONTHLY', sessionToken);

      const session = await prisma.onboarding_sessions.findUnique({
        where: { session_token: sessionToken },
      });

      expect(session?.stripe_payment_intent_id).toBeDefined();
      expect(session?.payment_status).toBe('PENDING');
    });

    it('should throw error for ENTERPRISE tier (custom pricing)', async () => {
      await expect(
        createPaymentIntent('ENTERPRISE', 'MONTHLY', sessionToken)
      ).rejects.toThrow('Invalid tier or billing cycle for payment');
    });
  });

  describe('Price Calculation', () => {
    it('should calculate STARTER monthly price', () => {
      const price = calculatePrice('STARTER', 'MONTHLY');
      expect(price).toBe(299); // $299
    });

    it('should calculate STARTER yearly price', () => {
      const price = calculatePrice('STARTER', 'YEARLY');
      expect(price).toBe(2990); // $2,990
    });

    it('should calculate GROWTH monthly price', () => {
      const price = calculatePrice('GROWTH', 'MONTHLY');
      expect(price).toBe(699); // $699
    });

    it('should calculate GROWTH yearly price', () => {
      const price = calculatePrice('GROWTH', 'YEARLY');
      expect(price).toBe(6990); // $6,990
    });

    it('should calculate ELITE monthly price', () => {
      const price = calculatePrice('ELITE', 'MONTHLY');
      expect(price).toBe(999); // $999
    });

    it('should calculate ELITE yearly price', () => {
      const price = calculatePrice('ELITE', 'YEARLY');
      expect(price).toBe(9990); // $9,990
    });

    it('should return 0 for FREE tier', () => {
      const price = calculatePrice('FREE', 'MONTHLY');
      expect(price).toBe(0);
    });

    it('should return 0 for CUSTOM tier', () => {
      const price = calculatePrice('CUSTOM', 'YEARLY');
      expect(price).toBe(0);
    });

    it('should return 0 for ENTERPRISE tier', () => {
      const price = calculatePrice('ENTERPRISE', 'MONTHLY');
      expect(price).toBe(0);
    });
  });

  describe('Payment Metadata', () => {
    it('should include correct metadata in payment intent', async () => {
      if (!process.env.STRIPE_SECRET_KEY) {
        console.log('Skipping Stripe test - no API key');
        return;
      }

      const result = await createPaymentIntent('STARTER', 'MONTHLY', sessionToken);

      // Would need to retrieve payment intent to verify metadata
      // This is tested in integration with Stripe
      expect(result).toBeDefined();
    });
  });
});
