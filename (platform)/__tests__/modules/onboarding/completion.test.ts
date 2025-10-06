import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { completeOnboarding, cleanupExpiredSessions } from '@/lib/modules/onboarding/completion';
import { createOnboardingSession, updateOnboardingStep } from '@/lib/modules/onboarding/session';
import { prisma } from '@/lib/database/prisma';

/**
 * Onboarding Completion Tests
 */

describe('Onboarding Completion', () => {
  let sessionToken: string;
  let testUserId: string;
  let createdOrgId: string | null = null;

  beforeAll(async () => {
    // Create test user
    const testUser = await prisma.users.create({
      data: {
        email: `test-${Date.now()}@onboarding.test`,
        name: 'Test User',
        role: 'USER',
      },
    });
    testUserId = testUser.id;

    // Create and prepare session
    const session = await createOnboardingSession(testUserId);
    sessionToken = session.session_token;

    // Complete all steps
    await updateOnboardingStep(sessionToken, 1, {
      orgName: 'Test Completion Org',
      orgWebsite: 'https://testcompletion.com',
      orgDescription: 'Test organization for completion',
    });

    await updateOnboardingStep(sessionToken, 2, {
      selectedTier: 'FREE', // Use FREE to skip payment
      billingCycle: 'MONTHLY',
    });
  });

  afterAll(async () => {
    // Cleanup created organization
    if (createdOrgId) {
      await prisma.organization_members.deleteMany({
        where: { organization_id: createdOrgId },
      });
      await prisma.subscriptions.deleteMany({
        where: { organization_id: createdOrgId },
      });
      await prisma.organizations.delete({
        where: { id: createdOrgId },
      });
    }

    // Cleanup session
    await prisma.onboarding_sessions.deleteMany({
      where: { session_token: sessionToken },
    });

    // Cleanup test user
    if (testUserId) {
      await prisma.users.delete({
        where: { id: testUserId },
      }).catch(() => {}); // Ignore if already deleted
    }
  });

  describe('Organization Creation', () => {
    it('should create organization and subscription', async () => {
      const result = await completeOnboarding(sessionToken);

      expect(result.organization).toBeDefined();
      expect(result.organization.name).toBe('Test Completion Org');
      expect(result.organization.slug).toBeDefined();
      expect(result.organization.slug).toMatch(/^test-completion-org(-\d+)?$/);

      expect(result.subscription).toBeDefined();
      expect(result.subscription.tier).toBe('FREE');
      expect(result.subscription.status).toBe('ACTIVE');

      createdOrgId = result.organization.id;
    });

    it('should create organization member with OWNER role', async () => {
      const member = await prisma.organization_members.findFirst({
        where: {
          user_id: testUserId,
          organization_id: createdOrgId!,
        },
      });

      expect(member).toBeDefined();
      expect(member?.role).toBe('OWNER');
    });

    it('should update user subscription tier', async () => {
      const user = await prisma.users.findUnique({
        where: { id: testUserId },
      });

      expect(user?.subscription_tier).toBe('FREE');
    });

    it('should mark session as completed', async () => {
      const session = await prisma.onboarding_sessions.findUnique({
        where: { session_token: sessionToken },
      });

      expect(session?.is_completed).toBe(true);
      expect(session?.completed_at).toBeInstanceOf(Date);
      expect(session?.organization_id).toBe(createdOrgId);
    });

    it('should throw error if session not found', async () => {
      await expect(completeOnboarding('invalid-token')).rejects.toThrow('Session not found');
    });

    it('should throw error if org name missing', async () => {
      const incompleteSession = await createOnboardingSession();
      await updateOnboardingStep(incompleteSession.session_token, 2, {
        selectedTier: 'FREE',
        billingCycle: 'MONTHLY',
      });

      await expect(completeOnboarding(incompleteSession.session_token)).rejects.toThrow(
        'Organization name is required'
      );

      // Cleanup
      await prisma.onboarding_sessions.delete({
        where: { id: incompleteSession.id },
      });
    });

    it('should throw error if tier not selected', async () => {
      const incompleteSession = await createOnboardingSession();
      await updateOnboardingStep(incompleteSession.session_token, 1, {
        orgName: 'Incomplete Org',
      });

      await expect(completeOnboarding(incompleteSession.session_token)).rejects.toThrow(
        'Subscription tier is required'
      );

      // Cleanup
      await prisma.onboarding_sessions.delete({
        where: { id: incompleteSession.id },
      });
    });

    it('should require payment for paid tiers', async () => {
      const paidSession = await createOnboardingSession();
      sessionToken = paidSession.session_token;

      await updateOnboardingStep(paidSession.session_token, 1, {
        orgName: 'Paid Org',
      });

      await updateOnboardingStep(paidSession.session_token, 2, {
        selectedTier: 'STARTER',
        billingCycle: 'MONTHLY',
      });

      await expect(completeOnboarding(paidSession.session_token)).rejects.toThrow(
        'Payment required to complete onboarding'
      );

      // Cleanup
      await prisma.onboarding_sessions.delete({
        where: { id: paidSession.id },
      });
    });
  });

  describe('Slug Generation', () => {
    it('should generate unique slug when duplicate exists', async () => {
      // Create first org with name
      const firstSession = await createOnboardingSession();
      await updateOnboardingStep(firstSession.session_token, 1, {
        orgName: 'Duplicate Slug Test',
      });
      await updateOnboardingStep(firstSession.session_token, 2, {
        selectedTier: 'FREE',
        billingCycle: 'MONTHLY',
      });

      const first = await completeOnboarding(firstSession.session_token);

      // Create second org with same name
      const secondSession = await createOnboardingSession();
      await updateOnboardingStep(secondSession.session_token, 1, {
        orgName: 'Duplicate Slug Test',
      });
      await updateOnboardingStep(secondSession.session_token, 2, {
        selectedTier: 'FREE',
        billingCycle: 'MONTHLY',
      });

      const second = await completeOnboarding(secondSession.session_token);

      expect(first.organization.slug).toBe('duplicate-slug-test');
      expect(second.organization.slug).toBe('duplicate-slug-test-1');

      // Cleanup
      await prisma.organization_members.deleteMany({
        where: { organization_id: { in: [first.organization.id, second.organization.id] } },
      });
      await prisma.subscriptions.deleteMany({
        where: { organization_id: { in: [first.organization.id, second.organization.id] } },
      });
      await prisma.organizations.deleteMany({
        where: { id: { in: [first.organization.id, second.organization.id] } },
      });
      await prisma.onboarding_sessions.deleteMany({
        where: { session_token: { in: [firstSession.session_token, secondSession.session_token] } },
      });
    });
  });

  describe('Session Cleanup', () => {
    it('should cleanup expired sessions', async () => {
      // Create expired session
      const expired = await prisma.onboarding_sessions.create({
        data: {
          session_token: 'expired-cleanup-test',
          expires_at: new Date(Date.now() - 1000),
          current_step: 1,
          total_steps: 4,
          is_completed: false,
        },
      });

      const result = await cleanupExpiredSessions();

      expect(result.deletedCount).toBeGreaterThanOrEqual(1);
      expect(result.message).toContain('expired onboarding sessions');

      // Verify deletion
      const deletedSession = await prisma.onboarding_sessions.findUnique({
        where: { id: expired.id },
      });

      expect(deletedSession).toBeNull();
    });

    it('should not cleanup completed sessions', async () => {
      const completed = await prisma.onboarding_sessions.create({
        data: {
          session_token: 'completed-cleanup-test',
          expires_at: new Date(Date.now() - 1000),
          current_step: 4,
          total_steps: 4,
          is_completed: true,
          completed_at: new Date(),
        },
      });

      await cleanupExpiredSessions();

      // Verify NOT deleted
      const session = await prisma.onboarding_sessions.findUnique({
        where: { id: completed.id },
      });

      expect(session).toBeDefined();

      // Cleanup
      await prisma.onboarding_sessions.delete({
        where: { id: completed.id },
      });
    });
  });
});
