import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createOnboardingSession, getOnboardingSession, updateOnboardingStep } from '@/lib/modules/onboarding/session';
import { prisma } from '@/lib/database/prisma';

/**
 * Onboarding Session Management Tests
 */

describe('Onboarding Session Management', () => {
  let sessionToken: string;

  // Cleanup after tests
  afterAll(async () => {
    if (sessionToken) {
      await prisma.onboarding_sessions.deleteMany({
        where: { session_token: sessionToken },
      });
    }
  });

  describe('Session Creation', () => {
    it('should create session with valid token', async () => {
      const session = await createOnboardingSession();

      expect(session).toBeDefined();
      expect(session.session_token).toBeDefined();
      expect(session.session_token).toHaveLength(64); // 32 bytes hex = 64 chars
      expect(session.expires_at).toBeInstanceOf(Date);
      expect(session.current_step).toBe(1);
      expect(session.total_steps).toBe(4);
      expect(session.is_completed).toBe(false);

      sessionToken = session.session_token;
    });

    it('should create session with user ID', async () => {
      const userId = 'test-user-id';
      const session = await createOnboardingSession(userId);

      expect(session.user_id).toBe(userId);

      // Cleanup
      await prisma.onboarding_sessions.delete({
        where: { id: session.id },
      });
    });

    it('should set expiration to 24 hours from now', async () => {
      const session = await createOnboardingSession();
      const now = new Date();
      const expectedExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const timeDiff = Math.abs(session.expires_at.getTime() - expectedExpiry.getTime());
      expect(timeDiff).toBeLessThan(1000); // Within 1 second

      // Cleanup
      await prisma.onboarding_sessions.delete({
        where: { id: session.id },
      });
    });
  });

  describe('Session Retrieval', () => {
    beforeAll(async () => {
      const session = await createOnboardingSession();
      sessionToken = session.session_token;
    });

    it('should retrieve session by token', async () => {
      const session = await getOnboardingSession(sessionToken);

      expect(session).toBeDefined();
      expect(session.session_token).toBe(sessionToken);
    });

    it('should throw error for invalid token', async () => {
      await expect(getOnboardingSession('invalid-token')).rejects.toThrow('Invalid session token');
    });

    it('should throw error for expired session', async () => {
      // Create expired session
      const expiredSession = await prisma.onboarding_sessions.create({
        data: {
          session_token: 'expired-test-token',
          expires_at: new Date(Date.now() - 1000), // 1 second ago
          current_step: 1,
          total_steps: 4,
        },
      });

      await expect(getOnboardingSession(expiredSession.session_token)).rejects.toThrow('Session expired');

      // Cleanup
      await prisma.onboarding_sessions.delete({
        where: { id: expiredSession.id },
      });
    });

    it('should throw error for completed session', async () => {
      // Create completed session
      const completedSession = await prisma.onboarding_sessions.create({
        data: {
          session_token: 'completed-test-token',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          current_step: 4,
          total_steps: 4,
          is_completed: true,
          completed_at: new Date(),
        },
      });

      await expect(getOnboardingSession(completedSession.session_token)).rejects.toThrow('Session already completed');

      // Cleanup
      await prisma.onboarding_sessions.delete({
        where: { id: completedSession.id },
      });
    });
  });

  describe('Step Updates', () => {
    beforeAll(async () => {
      const session = await createOnboardingSession();
      sessionToken = session.session_token;
    });

    it('should update step 1 with org details', async () => {
      const data = {
        orgName: 'Test Organization',
        orgWebsite: 'https://test.com',
        orgDescription: 'Test description',
      };

      const updated = await updateOnboardingStep(sessionToken, 1, data);

      expect(updated.current_step).toBe(1);
      expect(updated.org_name).toBe(data.orgName);
      expect(updated.org_website).toBe(data.orgWebsite);
      expect(updated.org_description).toBe(data.orgDescription);
    });

    it('should update step 2 with plan selection', async () => {
      const data = {
        selectedTier: 'STARTER',
        billingCycle: 'MONTHLY',
      };

      const updated = await updateOnboardingStep(sessionToken, 2, data);

      expect(updated.current_step).toBe(2);
      expect(updated.selected_tier).toBe(data.selectedTier);
      expect(updated.billing_cycle).toBe(data.billingCycle);
    });

    it('should update step 3 with payment data', async () => {
      const data = {
        paymentIntentId: 'pi_test_123',
        paymentStatus: 'SUCCEEDED',
      };

      const updated = await updateOnboardingStep(sessionToken, 3, data);

      expect(updated.current_step).toBe(3);
      expect(updated.stripe_payment_intent_id).toBe(data.paymentIntentId);
      expect(updated.payment_status).toBe(data.paymentStatus);
    });
  });
});
