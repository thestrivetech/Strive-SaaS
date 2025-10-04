/**
 * Industry Configuration Interface
 *
 * Defines the structure for industry-specific configurations
 * in the industry-as-plugin architecture.
 */

import type { SubscriptionTier } from '@prisma/client';

export type Industry =
  | 'shared'
  | 'real-estate'
  | 'healthcare'
  | 'fintech'
  | 'manufacturing'
  | 'retail'
  | 'education'
  | 'legal'
  | 'hospitality'
  | 'logistics'
  | 'construction';

export type IndustryFeature = {
  id: string;
  name: string;
  description: string;
  // Component lazy-loaded from industry features directory
  componentPath: string;
  requiredTier?: SubscriptionTier;
};

export type IndustryTool = {
  id: string;
  name: string;
  description: string;
  category: string;
  pricing: 'free' | 'paid' | 'enterprise';
  basePrice?: number; // Monthly price in cents (TBD)
  requiredTier?: SubscriptionTier;
};

export type IndustryRoute = {
  path: string;
  name: string;
  description: string;
  componentPath: string;
};

export type CRMFieldExtension = {
  fieldName: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'json';
  label: string;
  required: boolean;
  defaultValue?: any;
  validation?: Record<string, any>;
};

/**
 * Core Industry Configuration
 *
 * Each industry implements this interface to define:
 * - Metadata (id, name, description, icon)
 * - Features (industry-specific capabilities)
 * - Tools (marketplace add-ons)
 * - Module Extensions (which core modules it extends)
 * - Field Extensions (custom fields for CRM, Projects, etc.)
 * - Routes (industry-specific pages)
 */
export interface IndustryConfig {
  // Identification
  id: Industry;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Hex color for branding

  // Module Extensions - which core platform modules does this industry use?
  extends: ('crm' | 'projects' | 'tasks' | 'ai')[];

  // Features - industry-specific capabilities
  features: IndustryFeature[];

  // Tools - marketplace add-ons
  tools: IndustryTool[];

  // CRM Field Extensions
  crmFields?: {
    customer?: CRMFieldExtension[];
    contact?: CRMFieldExtension[];
  };

  // Project Field Extensions
  projectFields?: CRMFieldExtension[];

  // Routes - industry-specific pages
  routes: IndustryRoute[];

  // Status
  status: 'active' | 'beta' | 'coming-soon';
  releasedAt: Date;
  version: string;

  // Settings Schema - JSON schema for industry-specific settings
  settingsSchema?: Record<string, any>;
}

/**
 * Industry Module Settings
 *
 * Stored in the database for each organization's industry configuration
 */
export interface IndustryModuleSettings {
  industryId: Industry;
  organizationId: string;
  enabled: boolean;
  settings: Record<string, any>;
  enabledTools: string[];
  enabledFeatures: string[];
  createdAt: Date;
  updatedAt: Date;
}
