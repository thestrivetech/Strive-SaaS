/**
 * Real Estate Industry Tests
 *
 * Tests for the real estate industry implementation
 */

import { RealEstateIndustry, realEstateConfig } from '@/lib/industries/real-estate';

describe('Real Estate Industry', () => {
  let industry: RealEstateIndustry;

  beforeEach(() => {
    industry = new RealEstateIndustry();
  });

  describe('Configuration', () => {
    it('should have valid real estate config', () => {
      expect(realEstateConfig).toBeDefined();
      expect(realEstateConfig.id).toBe('real-estate');
      expect(realEstateConfig.name).toBe('Real Estate');
      expect(realEstateConfig.icon).toBe('Home');
    });

    it('should extend correct core modules', () => {
      expect(realEstateConfig.extends).toContain('crm');
      expect(realEstateConfig.extends).toContain('projects');
      expect(realEstateConfig.extends).toContain('ai');
      expect(realEstateConfig.extends).toContain('tasks');
    });

    it('should have features defined', () => {
      expect(Array.isArray(realEstateConfig.features)).toBe(true);
      expect(realEstateConfig.features.length).toBeGreaterThan(0);
    });

    it('should have tools defined', () => {
      expect(Array.isArray(realEstateConfig.tools)).toBe(true);
      expect(realEstateConfig.tools.length).toBeGreaterThan(0);
    });

    it('should have CRM field extensions', () => {
      expect(realEstateConfig.crmFields).toBeDefined();
      expect(realEstateConfig.crmFields?.customer).toBeDefined();

      const customerFields = realEstateConfig.crmFields?.customer || [];
      const buyerTypeField = customerFields.find((f) => f.fieldName === 'buyerType');
      const priceRangeField = customerFields.find((f) => f.fieldName === 'priceRange');

      expect(buyerTypeField).toBeDefined();
      expect(priceRangeField).toBeDefined();
    });

    it('should have project field extensions', () => {
      expect(realEstateConfig.projectFields).toBeDefined();
      expect(realEstateConfig.projectFields?.length).toBeGreaterThan(0);

      const mlsField = realEstateConfig.projectFields?.find(
        (f) => f.fieldName === 'mlsNumber'
      );
      expect(mlsField).toBeDefined();
    });

    it('should have routes defined', () => {
      expect(Array.isArray(realEstateConfig.routes)).toBe(true);
      expect(realEstateConfig.routes.length).toBeGreaterThan(0);

      // Check for expected routes
      const dashboardRoute = realEstateConfig.routes.find(
        (r) => r.path === '/industries/real-estate/dashboard'
      );
      expect(dashboardRoute).toBeDefined();
    });
  });

  describe('Instance Methods', () => {
    it('should return config from instance', () => {
      const config = industry.config;
      expect(config).toBe(realEstateConfig);
    });

    it('should return metadata', () => {
      const metadata = industry.getMetadata();
      expect(metadata.id).toBe('real-estate');
      expect(metadata.name).toBe('Real Estate');
      expect(metadata.status).toBe('beta');
    });

    it('should return default settings', () => {
      const settings = industry.getDefaultSettings();
      expect(settings).toBeDefined();
      expect(settings.mlsIntegration).toBeDefined();
      expect(settings.defaultCommissionSplit).toBeDefined();
      expect(settings.enablePropertyAlerts).toBe(true);
      expect(settings.defaultShowingDuration).toBe(30);
    });

    it('should pass health check', async () => {
      const health = await industry.healthCheck();
      expect(health.healthy).toBe(true);
      expect(health.checks).toBeDefined();
      expect(health.checks?.length).toBeGreaterThan(0);

      // Check for real estate-specific health checks
      const propertyAlertsCheck = health.checks?.find((c) => c.name === 'property-alerts');
      expect(propertyAlertsCheck).toBeDefined();
      expect(propertyAlertsCheck?.status).toBe('pass');
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should call onEnable without errors', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      await industry.onEnable('test-org-id');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should call onDisable without errors', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      await industry.onDisable('test-org-id');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Settings Validation', () => {
    it('should validate settings', () => {
      const validSettings = {
        mlsIntegration: {
          enabled: true,
          mlsId: 'TEST-123',
          apiKey: 'test-key',
        },
        defaultCommissionSplit: {
          buyerAgent: 2.5,
          listingAgent: 2.5,
        },
      };

      const isValid = industry.validateSettings(validSettings);
      expect(isValid).toBe(true);
    });
  });
});
