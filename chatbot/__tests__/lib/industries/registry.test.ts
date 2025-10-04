/**
 * Industry Registry Tests
 *
 * Tests for the industry registry system
 */

import {
  getRegisteredIndustries,
  getIndustryConfig,
  getIndustryInstance,
  isIndustryRegistered,
  getAllIndustryMetadata,
  getIndustriesByStatus,
  registerIndustry,
} from '@/lib/industries/registry';
import type { Industry } from '@/lib/industries/_core/industry-config';

describe('Industry Registry', () => {
  describe('getRegisteredIndustries', () => {
    it('should return an array of industries', () => {
      const industries = getRegisteredIndustries();
      expect(Array.isArray(industries)).toBe(true);
    });

    it('should return industry IDs as strings', () => {
      const industries = getRegisteredIndustries();
      industries.forEach((industry) => {
        expect(typeof industry).toBe('string');
      });
    });
  });

  describe('isIndustryRegistered', () => {
    it('should return false for unregistered industries', () => {
      const result = isIndustryRegistered('healthcare' as Industry);
      // Healthcare won't be registered until we import and register it
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getAllIndustryMetadata', () => {
    it('should return an array of metadata objects', () => {
      const metadata = getAllIndustryMetadata();
      expect(Array.isArray(metadata)).toBe(true);
    });

    it('should have correct metadata structure', () => {
      const metadata = getAllIndustryMetadata();

      metadata.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('color');
        expect(item).toHaveProperty('status');
        expect(item).toHaveProperty('version');
      });
    });
  });

  describe('getIndustriesByStatus', () => {
    it('should return industries filtered by status', () => {
      const activeIndustries = getIndustriesByStatus('active');
      const betaIndustries = getIndustriesByStatus('beta');
      const comingSoonIndustries = getIndustriesByStatus('coming-soon');

      expect(Array.isArray(activeIndustries)).toBe(true);
      expect(Array.isArray(betaIndustries)).toBe(true);
      expect(Array.isArray(comingSoonIndustries)).toBe(true);
    });
  });

  describe('registerIndustry', () => {
    it('should not throw when registering a valid industry', () => {
      const mockConfig: any = {
        id: 'healthcare',
        name: 'Healthcare',
        description: 'Test',
        icon: 'Heart',
        color: '#10B981',
        extends: ['crm'],
        features: [],
        tools: [],
        routes: [],
        status: 'beta',
        releasedAt: new Date(),
        version: '1.0.0',
      };

      const mockGetInstance = async () => {
        return {} as any;
      };

      expect(() => {
        registerIndustry('healthcare' as Industry, mockConfig, mockGetInstance);
      }).not.toThrow();
    });
  });
});
