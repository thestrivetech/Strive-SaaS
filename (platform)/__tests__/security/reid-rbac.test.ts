/**
 * REID RBAC Security Test Suite
 * Tests for role-based access control and subscription tier enforcement
 */

import { describe, it, expect } from '@jest/globals';
import { canAccessREID, canAccessAIFeatures, canAccessFeature } from '@/lib/auth/rbac';

describe('REID RBAC Security', () => {
  describe('canAccessREID - Dual Role Check', () => {
    it('allows USER with MEMBER+ org role and GROWTH+ tier', () => {
      const user = {
        globalRole: 'USER' as const,
        organizationRole: 'MEMBER',
        subscriptionTier: 'GROWTH',
      };

      expect(canAccessREID(user)).toBe(true);
    });

    it('allows ADMIN with ADMIN org role and GROWTH+ tier', () => {
      const user = {
        globalRole: 'ADMIN' as const,
        organizationRole: 'ADMIN',
        subscriptionTier: 'ELITE',
      };

      expect(canAccessREID(user)).toBe(true);
    });

    it('allows MODERATOR with MEMBER org role and GROWTH+ tier', () => {
      const user = {
        globalRole: 'MODERATOR' as const,
        organizationRole: 'MEMBER',
        subscriptionTier: 'GROWTH',
      };

      expect(canAccessREID(user)).toBe(true);
    });

    it('blocks CLIENT users regardless of tier', () => {
      const user = {
        globalRole: 'CLIENT' as const,
        organizationRole: 'VIEWER',
        subscriptionTier: 'ELITE',
      };

      expect(canAccessREID(user)).toBe(false);
    });

    it('blocks VIEWER org role', () => {
      const user = {
        globalRole: 'USER' as const,
        organizationRole: 'VIEWER',
        subscriptionTier: 'GROWTH',
      };

      expect(canAccessREID(user)).toBe(false);
    });

    it('allows OWNER org role', () => {
      const user = {
        globalRole: 'USER' as const,
        organizationRole: 'OWNER',
        subscriptionTier: 'GROWTH',
      };

      expect(canAccessREID(user)).toBe(true);
    });

    it('blocks SUPER_ADMIN with VIEWER org role (requires MEMBER+)', () => {
      const user = {
        globalRole: 'SUPER_ADMIN' as const,
        organizationRole: 'VIEWER', // VIEWER blocks access
        subscriptionTier: 'FREE',
      };

      // Even SUPER_ADMIN needs Member+ org role for REID
      expect(canAccessREID(user)).toBe(false);
    });

    it('allows ADMIN with proper org role', () => {
      const user = {
        globalRole: 'ADMIN' as const,
        organizationRole: 'ADMIN',
        subscriptionTier: 'GROWTH',
      };

      expect(canAccessREID(user)).toBe(true);
    });
  });

  describe('canAccessAIFeatures - AI Org Role Gating', () => {
    it('allows OWNER org role', () => {
      const user = {
        organizationRole: 'OWNER',
      };

      expect(canAccessAIFeatures(user)).toBe(true);
    });

    it('allows ADMIN org role', () => {
      const user = {
        organizationRole: 'ADMIN',
      };

      expect(canAccessAIFeatures(user)).toBe(true);
    });

    it('blocks MEMBER org role', () => {
      const user = {
        organizationRole: 'MEMBER',
      };

      expect(canAccessAIFeatures(user)).toBe(false);
    });

    it('blocks VIEWER org role', () => {
      const user = {
        organizationRole: 'VIEWER',
      };

      expect(canAccessAIFeatures(user)).toBe(false);
    });

    it('blocks missing org role', () => {
      const user = {};

      expect(canAccessAIFeatures(user)).toBe(false);
    });
  });

  describe('canAccessFeature - Feature-Based Tier Gating', () => {
    it('GROWTH tier has basic REID access', () => {
      const user = {
        subscriptionTier: 'GROWTH',
      };

      expect(canAccessFeature(user, 'reid-basic')).toBe(true);
      expect(canAccessFeature(user, 'reid')).toBe(false); // Full REID only in ELITE
    });

    it('allows full REID for ELITE tier', () => {
      const user = {
        subscriptionTier: 'ELITE',
      };

      expect(canAccessFeature(user, 'reid')).toBe(true);
      expect(canAccessFeature(user, 'reid-full')).toBe(true);
      expect(canAccessFeature(user, 'reid-ai')).toBe(true);
    });

    it('allows all features for ENTERPRISE tier', () => {
      const user = {
        subscriptionTier: 'ENTERPRISE',
      };

      expect(canAccessFeature(user, 'reid')).toBe(true);
      expect(canAccessFeature(user, 'any-feature')).toBe(true);
    });

    it('blocks REID for STARTER tier', () => {
      const user = {
        subscriptionTier: 'STARTER',
      };

      expect(canAccessFeature(user, 'reid')).toBe(false);
      expect(canAccessFeature(user, 'reid-basic')).toBe(false);
    });

    it('blocks REID for FREE tier', () => {
      const user = {
        subscriptionTier: 'FREE',
      };

      expect(canAccessFeature(user, 'reid')).toBe(false);
    });
  });

  describe('Subscription Tier Hierarchy', () => {
    it('FREE tier has minimal access', () => {
      const user = { subscriptionTier: 'FREE' };

      expect(canAccessFeature(user, 'dashboard')).toBe(true);
      expect(canAccessFeature(user, 'profile')).toBe(true);
      expect(canAccessFeature(user, 'crm')).toBe(false);
      expect(canAccessFeature(user, 'reid')).toBe(false);
    });

    it('STARTER tier has basic features', () => {
      const user = { subscriptionTier: 'STARTER' };

      expect(canAccessFeature(user, 'dashboard')).toBe(true);
      expect(canAccessFeature(user, 'crm')).toBe(true);
      expect(canAccessFeature(user, 'projects')).toBe(true);
      expect(canAccessFeature(user, 'reid')).toBe(false);
      expect(canAccessFeature(user, 'reid-ai')).toBe(false);
    });

    it('GROWTH tier has REID basic access', () => {
      const user = { subscriptionTier: 'GROWTH' };

      expect(canAccessFeature(user, 'dashboard')).toBe(true);
      expect(canAccessFeature(user, 'crm')).toBe(true);
      expect(canAccessFeature(user, 'projects')).toBe(true);
      expect(canAccessFeature(user, 'reid-basic')).toBe(true);
      expect(canAccessFeature(user, 'reid')).toBe(false); // Full REID requires ELITE
      expect(canAccessFeature(user, 'reid-ai')).toBe(false);
    });

    it('ELITE tier has full REID access with AI', () => {
      const user = { subscriptionTier: 'ELITE' };

      expect(canAccessFeature(user, 'dashboard')).toBe(true);
      expect(canAccessFeature(user, 'crm')).toBe(true);
      expect(canAccessFeature(user, 'reid')).toBe(true);
      expect(canAccessFeature(user, 'reid-full')).toBe(true);
      expect(canAccessFeature(user, 'reid-ai')).toBe(true);
    });

    it('ENTERPRISE tier has unlimited access', () => {
      const user = { subscriptionTier: 'ENTERPRISE' };

      // ENTERPRISE tier should have access to everything (wildcard)
      expect(canAccessFeature(user, 'dashboard')).toBe(true);
      expect(canAccessFeature(user, 'crm')).toBe(true);
      expect(canAccessFeature(user, 'reid')).toBe(true);
      expect(canAccessFeature(user, 'reid-ai')).toBe(true);
      expect(canAccessFeature(user, 'any-feature')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing globalRole gracefully', () => {
      const user = {
        organizationRole: 'MEMBER',
        subscriptionTier: 'GROWTH',
      };

      expect(() => canAccessREID(user)).not.toThrow();
    });

    it('handles missing organizationRole gracefully', () => {
      const user = {
        globalRole: 'USER' as const,
        subscriptionTier: 'GROWTH',
      };

      expect(() => canAccessREID(user)).not.toThrow();
    });

    it('handles missing subscriptionTier gracefully', () => {
      const user = {
        globalRole: 'USER' as const,
        organizationRole: 'MEMBER',
      };

      expect(() => canAccessFeature(user, 'reid')).not.toThrow();
      expect(canAccessFeature(user, 'reid')).toBe(false);
    });

    it('handles undefined user object', () => {
      expect(() => canAccessREID({} as any)).not.toThrow();
      expect(canAccessREID({} as any)).toBe(false);
    });

    it('handles invalid tier names', () => {
      const user = {
        subscriptionTier: 'INVALID_TIER' as any,
      };

      expect(canAccessFeature(user, 'reid')).toBe(false);
    });

    it('handles invalid role names', () => {
      const user = {
        globalRole: 'INVALID_ROLE' as any,
        organizationRole: 'INVALID_ORG_ROLE',
        subscriptionTier: 'GROWTH',
      };

      expect(() => canAccessREID(user)).not.toThrow();
      expect(canAccessREID(user)).toBe(false);
    });
  });

  describe('Multi-tenant Security', () => {
    it('role permissions are user-specific, not org-specific', () => {
      const user1 = {
        globalRole: 'USER' as const,
        organizationRole: 'MEMBER',
        subscriptionTier: 'GROWTH',
      };

      const user2 = {
        globalRole: 'ADMIN' as const,
        organizationRole: 'ADMIN',
        subscriptionTier: 'ELITE',
      };

      // Different users should have different permissions
      const user1Access = canAccessREID(user1);
      const user2Access = canAccessREID(user2);

      expect(user1Access).toBe(true);
      expect(user2Access).toBe(true);

      // But tier limits are different
      expect(canAccessAIFeatures(user1)).toBe(false);
      expect(canAccessAIFeatures(user2)).toBe(true);
    });

    it('VIEWER role blocks access even with high tier', () => {
      const user = {
        globalRole: 'USER' as const,
        organizationRole: 'VIEWER',
        subscriptionTier: 'ENTERPRISE', // Highest tier
      };

      // VIEWER role should block access despite tier
      expect(canAccessREID(user)).toBe(false);
    });
  });
});
