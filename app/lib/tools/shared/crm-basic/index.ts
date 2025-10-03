/**
 * CRM Basic Tool - Main Export
 *
 * A foundational CRM tool providing essential customer relationship management features.
 * Included in all tiers as a basic business tool.
 */

import type { Tool } from '../../types';
import * as actions from './actions';
import * as queries from './queries';
import { CRM_BASIC_SETTINGS, DEFAULT_CRM_SETTINGS } from './config';

/**
 * CRM Basic Tool Definition
 */
export const tool: Tool = {
  metadata: {
    // Identification
    id: 'crm-basic',
    name: 'Basic CRM',
    description: 'Essential customer relationship management features for your business',
    longDescription:
      'Manage customer contacts, track leads, and organize your sales pipeline with our basic CRM tools. Perfect for small businesses getting started with customer management.',
    icon: 'Users',
    industry: 'shared',

    // CRITICAL: This is a MARKETPLACE TOOL, not a platform module
    // Platform modules (CRM Dashboard, etc.) live in lib/modules/
    scope: 'tool',

    // Classification
    category: 'lead-management',
    tier: 'STARTER',           // PLACEHOLDER - TBD
    implementation: 'nextjs',

    // Pricing & Access (PLACEHOLDER - TBD)
    basePrice: 0,              // PLACEHOLDER - TBD
    isAddon: false,            // PLACEHOLDER - TBD
    requiredTier: 'STARTER',   // PLACEHOLDER - TBD

    // Technical
    version: '1.0.0',
    dependencies: [],
    apiEndpoints: [],

    // Configuration
    configurableSettings: CRM_BASIC_SETTINGS,
    requiresSetup: false,
    setupInstructions: `
# Basic CRM Setup

1. Review your CRM settings in the tool configuration
2. Enable auto-assignment if you have a sales team
3. Configure notification preferences
4. Start adding your leads and customers

No additional setup required - you're ready to go!
    `.trim(),

    // Status & Metadata
    status: 'active',
    releasedAt: new Date('2025-01-01'),
    tags: ['crm', 'leads', 'contacts', 'sales', 'essential'],

    // Documentation
    docsUrl: '/docs/tools/crm-basic',
    videoUrl: undefined,
    supportUrl: '/support/tools/crm-basic',
  },

  // Server Actions
  actions: {
    createLead: actions.createLead as (...args: unknown[]) => Promise<unknown>,
    updateLead: actions.updateLead as (...args: unknown[]) => Promise<unknown>,
    deleteLead: actions.deleteLead as (...args: unknown[]) => Promise<unknown>,
    assignLead: actions.assignLead as (...args: unknown[]) => Promise<unknown>,
  },

  // Data Queries
  queries: {
    getLeads: queries.getLeads as (...args: unknown[]) => Promise<unknown>,
    getLead: queries.getLead as (...args: unknown[]) => Promise<unknown>,
    getLeadsByStatus: queries.getLeadsByStatus as (...args: unknown[]) => Promise<unknown>,
    getLeadsByAssignee: queries.getLeadsByAssignee as (...args: unknown[]) => Promise<unknown>,
    searchLeads: queries.searchLeads as (...args: unknown[]) => Promise<unknown>,
  },

  // Lifecycle Hooks
  async onEnable(organizationId: string) {
    console.log(`Enabling CRM Basic for organization: ${organizationId}`);
    // Initialize default CRM settings
    // Create default lead statuses
    // Set up notification templates
  },

  async onDisable(organizationId: string) {
    console.log(`Disabling CRM Basic for organization: ${organizationId}`);
    // Archive active workflows
    // Notify team members
  },

  async onConfigure(organizationId: string, settings: Record<string, unknown>) {
    console.log(`Configuring CRM Basic for organization: ${organizationId}`, settings);
    // Update CRM settings
    // Reconfigure assignment rules if changed
    // Update notification preferences
  },

  // Health Check
  async healthCheck() {
    // Check if CRM module is responsive
    // Verify database connectivity
    // Check notification system
    return {
      healthy: true,
      message: 'CRM Basic is operating normally',
    };
  },
};

// Re-export types, schemas, and functions
export type { CRMBasicSettings, LeadData } from './types';
export { CRMBasicSettingsSchema, LeadDataSchema, CreateLeadSchema, UpdateLeadSchema } from './schemas';
export * from './actions';
export * from './queries';
export { CRM_BASIC_SETTINGS, DEFAULT_CRM_SETTINGS } from './config';
