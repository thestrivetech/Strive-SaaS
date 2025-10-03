/**
 * Base Industry Class
 *
 * Abstract class that all industry implementations extend.
 * Provides common functionality and enforces the industry interface.
 */

import type { IndustryConfig } from './industry-config';

export abstract class BaseIndustry {
  abstract config: IndustryConfig;

  /**
   * Lifecycle hook: Called when industry is enabled for an organization
   */
  async onEnable(organizationId: string): Promise<void> {
    console.log(`Enabling ${this.config.name} for organization ${organizationId}`);
    // Override in subclass to implement custom logic
    // e.g., create default configurations, send welcome email, etc.
  }

  /**
   * Lifecycle hook: Called when industry is disabled for an organization
   */
  async onDisable(organizationId: string): Promise<void> {
    console.log(`Disabling ${this.config.name} for organization ${organizationId}`);
    // Override in subclass to implement custom logic
    // e.g., archive data, send notification, etc.
  }

  /**
   * Lifecycle hook: Called when industry settings are updated
   */
  async onConfigure(
    organizationId: string,
    settings: Record<string, any>
  ): Promise<void> {
    console.log(
      `Configuring ${this.config.name} for organization ${organizationId}`,
      settings
    );
    // Override in subclass to implement custom logic
  }

  /**
   * Lifecycle hook: Called when industry is updated to a new version
   */
  async onUpdate(
    organizationId: string,
    oldVersion: string,
    newVersion: string
  ): Promise<void> {
    console.log(
      `Updating ${this.config.name} from ${oldVersion} to ${newVersion} for organization ${organizationId}`
    );
    // Override in subclass to implement custom migration logic
  }

  /**
   * Health check for industry functionality
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    message?: string;
    checks?: Array<{ name: string; status: 'pass' | 'fail' | 'warn'; message?: string }>;
  }> {
    // Override in subclass to implement custom health checks
    return {
      healthy: true,
      message: `${this.config.name} is operational`,
      checks: [
        {
          name: 'config',
          status: 'pass',
          message: 'Industry configuration is valid',
        },
      ],
    };
  }

  /**
   * Get industry metadata
   */
  getMetadata() {
    return {
      id: this.config.id,
      name: this.config.name,
      description: this.config.description,
      icon: this.config.icon,
      color: this.config.color,
      status: this.config.status,
      version: this.config.version,
      releasedAt: this.config.releasedAt,
    };
  }

  /**
   * Get industry features
   */
  getFeatures() {
    return this.config.features;
  }

  /**
   * Get industry tools
   */
  getTools() {
    return this.config.tools;
  }

  /**
   * Get industry routes
   */
  getRoutes() {
    return this.config.routes;
  }

  /**
   * Get industry module extensions
   */
  getModuleExtensions() {
    return this.config.extends;
  }

  /**
   * Get CRM field extensions
   */
  getCRMFieldExtensions() {
    return this.config.crmFields;
  }

  /**
   * Get Project field extensions
   */
  getProjectFieldExtensions() {
    return this.config.projectFields;
  }

  /**
   * Validate industry settings against schema
   */
  validateSettings(settings: Record<string, any>): boolean {
    if (!this.config.settingsSchema) {
      return true; // No schema = all settings valid
    }

    // TODO: Implement JSON schema validation
    // For now, just return true
    return true;
  }

  /**
   * Get default settings for this industry
   */
  getDefaultSettings(): Record<string, any> {
    // Override in subclass to provide industry-specific defaults
    return {};
  }
}
