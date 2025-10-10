import {
  getOrgCacheKey,
  getUserCacheKey,
  getGlobalCacheKey,
  CACHE_TTL,
  CACHE_CONFIG,
  QUERY_CONFIG,
} from '@/lib/performance/cache';
import { queryDefaults } from '@/lib/performance/cache';

describe('Performance - Caching', () => {
  describe('Cache Key Generators', () => {
    describe('getOrgCacheKey', () => {
      it('should generate cache key for organization resource', () => {
        const key = getOrgCacheKey('org_123', 'customers');
        expect(key).toEqual(['org', 'org_123', 'customers']);
      });

      it('should include resource ID when provided', () => {
        const key = getOrgCacheKey('org_123', 'customers', 'cust_456');
        expect(key).toEqual(['org', 'org_123', 'customers', 'cust_456']);
      });

      it('should handle different organization IDs', () => {
        const key1 = getOrgCacheKey('org_1', 'projects');
        const key2 = getOrgCacheKey('org_2', 'projects');

        expect(key1).not.toEqual(key2);
        expect(key1[1]).toBe('org_1');
        expect(key2[1]).toBe('org_2');
      });

      it('should work with different resource types', () => {
        const customersKey = getOrgCacheKey('org_123', 'customers');
        const projectsKey = getOrgCacheKey('org_123', 'projects');

        expect(customersKey[2]).toBe('customers');
        expect(projectsKey[2]).toBe('projects');
      });
    });

    describe('getUserCacheKey', () => {
      it('should generate cache key for user resource', () => {
        const key = getUserCacheKey('user_123', 'profile');
        expect(key).toEqual(['user', 'user_123', 'profile']);
      });

      it('should include resource ID when provided', () => {
        const key = getUserCacheKey('user_123', 'notifications', 'notif_456');
        expect(key).toEqual(['user', 'user_123', 'notifications', 'notif_456']);
      });

      it('should differentiate between users', () => {
        const key1 = getUserCacheKey('user_1', 'settings');
        const key2 = getUserCacheKey('user_2', 'settings');

        expect(key1).not.toEqual(key2);
      });
    });

    describe('getGlobalCacheKey', () => {
      it('should generate cache key for global resource', () => {
        const key = getGlobalCacheKey('content');
        expect(key).toEqual(['global', 'content']);
      });

      it('should include resource ID when provided', () => {
        const key = getGlobalCacheKey('content', 'post_123');
        expect(key).toEqual(['global', 'content', 'post_123']);
      });

      it('should work without resource ID', () => {
        const key = getGlobalCacheKey('analytics');
        expect(key).toHaveLength(2);
        expect(key).toEqual(['global', 'analytics']);
      });
    });
  });

  describe('Cache TTL Configuration', () => {
    it('should define SHORT cache TTL', () => {
      expect(CACHE_TTL.SHORT).toBe(60); // 1 minute
    });

    it('should define MEDIUM cache TTL', () => {
      expect(CACHE_TTL.MEDIUM).toBe(300); // 5 minutes
    });

    it('should define LONG cache TTL', () => {
      expect(CACHE_TTL.LONG).toBe(3600); // 1 hour
    });

    it('should define VERY_LONG cache TTL', () => {
      expect(CACHE_TTL.VERY_LONG).toBe(86400); // 1 day
    });

    it('should have TTLs in ascending order', () => {
      expect(CACHE_TTL.SHORT).toBeLessThan(CACHE_TTL.MEDIUM);
      expect(CACHE_TTL.MEDIUM).toBeLessThan(CACHE_TTL.LONG);
      expect(CACHE_TTL.LONG).toBeLessThan(CACHE_TTL.VERY_LONG);
    });
  });

  describe('Cache Configuration', () => {
    it('should configure user cache', () => {
      expect(CACHE_CONFIG.user.revalidate).toBe(CACHE_TTL.MEDIUM);
      expect(CACHE_CONFIG.user.tags).toContain('user');
    });

    it('should configure organization cache', () => {
      expect(CACHE_CONFIG.organization.revalidate).toBe(CACHE_TTL.LONG);
      expect(CACHE_CONFIG.organization.tags).toContain('organization');
    });

    it('should configure customers cache', () => {
      expect(CACHE_CONFIG.customers.revalidate).toBe(CACHE_TTL.SHORT);
      expect(CACHE_CONFIG.customers.tags).toContain('customers');
    });

    it('should configure projects cache', () => {
      expect(CACHE_CONFIG.projects.revalidate).toBe(CACHE_TTL.SHORT);
      expect(CACHE_CONFIG.projects.tags).toContain('projects');
    });

    it('should configure analytics cache for longer duration', () => {
      expect(CACHE_CONFIG.analytics.revalidate).toBe(CACHE_TTL.LONG);
    });

    it('should configure static content cache for very long duration', () => {
      expect(CACHE_CONFIG.content.revalidate).toBe(CACHE_TTL.VERY_LONG);
    });
  });

  describe('Query Configuration', () => {
    it('should configure realtime queries', () => {
      expect(QUERY_CONFIG.realtime.staleTime).toBe(0);
      expect(QUERY_CONFIG.realtime.refetchInterval).toBe(5000);
      expect(QUERY_CONFIG.realtime.refetchOnWindowFocus).toBe(true);
    });

    it('should configure user queries', () => {
      expect(QUERY_CONFIG.user.staleTime).toBe(60 * 1000); // 1 minute
      expect(QUERY_CONFIG.user.gcTime).toBe(30 * 60 * 1000); // 30 minutes
    });

    it('should configure static queries', () => {
      expect(QUERY_CONFIG.static.staleTime).toBe(60 * 60 * 1000); // 1 hour
      expect(QUERY_CONFIG.static.refetchOnMount).toBe(false);
      expect(QUERY_CONFIG.static.refetchOnWindowFocus).toBe(false);
    });

    it('should configure list queries', () => {
      expect(QUERY_CONFIG.list.staleTime).toBe(30 * 1000); // 30 seconds
      expect(QUERY_CONFIG.list.gcTime).toBe(10 * 60 * 1000); // 10 minutes
    });
  });

  describe('Query Defaults', () => {
    it('should have reasonable default staleTime', () => {
      expect(queryDefaults.queries.staleTime).toBe(60 * 1000); // 1 minute
    });

    it('should have reasonable default gcTime', () => {
      expect(queryDefaults.queries.gcTime).toBe(5 * 60 * 1000); // 5 minutes
    });

    it('should disable refetchOnWindowFocus by default', () => {
      expect(queryDefaults.queries.refetchOnWindowFocus).toBe(false);
    });

    it('should enable refetchOnReconnect', () => {
      expect(queryDefaults.queries.refetchOnReconnect).toBe(true);
    });

    it('should retry failed queries once', () => {
      expect(queryDefaults.queries.retry).toBe(1);
    });

    it('should not retry failed mutations by default', () => {
      expect(queryDefaults.mutations.retry).toBe(0);
    });
  });

  describe('Cache Key Uniqueness', () => {
    it('should generate unique keys for different organizations', () => {
      const key1 = getOrgCacheKey('org_1', 'customers');
      const key2 = getOrgCacheKey('org_2', 'customers');

      expect(key1.join('-')).not.toBe(key2.join('-'));
    });

    it('should generate unique keys for different users', () => {
      const key1 = getUserCacheKey('user_1', 'profile');
      const key2 = getUserCacheKey('user_2', 'profile');

      expect(key1.join('-')).not.toBe(key2.join('-'));
    });

    it('should generate unique keys for different resources', () => {
      const key1 = getOrgCacheKey('org_1', 'customers');
      const key2 = getOrgCacheKey('org_1', 'projects');

      expect(key1.join('-')).not.toBe(key2.join('-'));
    });

    it('should generate unique keys with and without resource IDs', () => {
      const key1 = getOrgCacheKey('org_1', 'customers');
      const key2 = getOrgCacheKey('org_1', 'customers', 'cust_123');

      expect(key1.join('-')).not.toBe(key2.join('-'));
      expect(key2).toHaveLength(key1.length + 1);
    });
  });

  describe('Cache Strategy Validation', () => {
    it('should use shorter cache for frequently changing data', () => {
      expect(CACHE_CONFIG.customers.revalidate).toBeLessThan(
        CACHE_CONFIG.organization.revalidate
      );
      expect(CACHE_CONFIG.projects.revalidate).toBeLessThan(
        CACHE_CONFIG.content.revalidate
      );
    });

    it('should use longer cache for stable data', () => {
      expect(CACHE_CONFIG.content.revalidate).toBeGreaterThan(
        CACHE_CONFIG.customers.revalidate
      );
      expect(CACHE_CONFIG.organization.revalidate).toBeGreaterThan(
        CACHE_CONFIG.customers.revalidate
      );
    });
  });
});
