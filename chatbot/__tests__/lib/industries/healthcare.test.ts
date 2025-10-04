/**
 * Healthcare Industry Tests
 *
 * Tests for the healthcare industry implementation
 */

import { HealthcareIndustry, healthcareConfig } from '@/lib/industries/healthcare';

describe('Healthcare Industry', () => {
  let industry: HealthcareIndustry;

  beforeEach(() => {
    industry = new HealthcareIndustry();
  });

  describe('Configuration', () => {
    it('should have valid healthcare config', () => {
      expect(healthcareConfig).toBeDefined();
      expect(healthcareConfig.id).toBe('healthcare');
      expect(healthcareConfig.name).toBe('Healthcare');
      expect(healthcareConfig.icon).toBe('Heart');
    });

    it('should extend correct core modules', () => {
      expect(healthcareConfig.extends).toContain('crm');
      expect(healthcareConfig.extends).toContain('projects');
      expect(healthcareConfig.extends).toContain('ai');
      expect(healthcareConfig.extends).toContain('tasks');
    });

    it('should have features defined', () => {
      expect(Array.isArray(healthcareConfig.features)).toBe(true);
      expect(healthcareConfig.features.length).toBeGreaterThan(0);
    });

    it('should have tools defined', () => {
      expect(Array.isArray(healthcareConfig.tools)).toBe(true);
      expect(healthcareConfig.tools.length).toBeGreaterThan(0);
    });

    it('should have CRM field extensions', () => {
      expect(healthcareConfig.crmFields).toBeDefined();
      expect(healthcareConfig.crmFields?.customer).toBeDefined();

      const customerFields = healthcareConfig.crmFields?.customer || [];
      const patientIdField = customerFields.find((f) => f.fieldName === 'patientId');
      const dobField = customerFields.find((f) => f.fieldName === 'dateOfBirth');

      expect(patientIdField).toBeDefined();
      expect(dobField).toBeDefined();
    });

    it('should have routes defined', () => {
      expect(Array.isArray(healthcareConfig.routes)).toBe(true);
      expect(healthcareConfig.routes.length).toBeGreaterThan(0);

      // Check for expected routes
      const dashboardRoute = healthcareConfig.routes.find(
        (r) => r.path === '/industries/healthcare/dashboard'
      );
      expect(dashboardRoute).toBeDefined();
    });
  });

  describe('Instance Methods', () => {
    it('should return config from instance', () => {
      const config = industry.config;
      expect(config).toBe(healthcareConfig);
    });

    it('should return metadata', () => {
      const metadata = industry.getMetadata();
      expect(metadata.id).toBe('healthcare');
      expect(metadata.name).toBe('Healthcare');
      expect(metadata.status).toBe('beta');
    });

    it('should return features', () => {
      const features = industry.getFeatures();
      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThan(0);
    });

    it('should return tools', () => {
      const tools = industry.getTools();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should return default settings', () => {
      const settings = industry.getDefaultSettings();
      expect(settings).toBeDefined();
      expect(settings.enableHIPAALogs).toBe(true);
      expect(settings.defaultAppointmentDuration).toBe(30);
      expect(settings.requirePatientConsent).toBe(true);
    });

    it('should pass health check', async () => {
      const health = await industry.healthCheck();
      expect(health.healthy).toBe(true);
      expect(health.checks).toBeDefined();
      expect(health.checks?.length).toBeGreaterThan(0);

      // Check for healthcare-specific health checks
      const hipaaCheck = health.checks?.find((c) => c.name === 'hipaa-compliance');
      expect(hipaaCheck).toBeDefined();
      expect(hipaaCheck?.status).toBe('pass');
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

    it('should call onConfigure without errors', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      await industry.onConfigure('test-org-id', {
        enableHIPAALogs: false,
      });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Settings Validation', () => {
    it('should validate settings', () => {
      const validSettings = {
        enableHIPAALogs: true,
        defaultAppointmentDuration: 45,
      };

      const isValid = industry.validateSettings(validSettings);
      expect(isValid).toBe(true);
    });
  });
});
