/**
 * Tool System Type Definitions
 *
 * Core types for the industry-organized tool marketplace system.
 * Aligns with existing subscription tiers: FREE/BASIC/PRO/ENTERPRISE
 */

// ============================================================================
// Industry & Category Types
// ============================================================================

/**
 * Available industry categories for tools
 * 'shared' = Cross-industry tools available to all
 */
export type Industry =
  | 'shared'           // Cross-industry tools
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

/**
 * Tool functional categories
 */
export type ToolCategory =
  | 'lead-management'
  | 'communication'
  | 'automation'
  | 'analytics'
  | 'financial'
  | 'marketing'
  | 'document-management'
  | 'compliance'
  | 'operations'
  | 'customer-service'
  | 'productivity'
  | 'media'
  | 'data';

// ============================================================================
// Subscription & Access Types
// ============================================================================

/**
 * Subscription tiers (aligns with SubscriptionTier in Prisma)
 *
 * IMPORTANT: Pricing and feature limits are placeholders (TBD)
 * - Starter: Entry level
 * - Growth: Growing businesses
 * - Elite: Advanced features
 * - Custom: Tailored solutions
 * - Enterprise: Full enterprise suite
 */
export type ToolTier = 'STARTER' | 'GROWTH' | 'ELITE' | 'CUSTOM' | 'ENTERPRISE';

/**
 * Tool scope - CRITICAL DISTINCTION
 *
 * MODULES vs TOOLS:
 * - MODULES = Core platform dashboards/pages (CRM, Projects, AI, Tasks)
 *   - Located in lib/modules/
 *   - Part of base platform functionality
 *   - NOT sold separately, included with subscription tier
 *   - Examples: CRM Dashboard, Projects Dashboard, AI Dashboard
 *
 * - TOOLS = Add-on utilities that integrate into modules or work standalone
 *   - Located in lib/tools/
 *   - Can be purchased/enabled separately
 *   - May integrate into existing modules
 *   - Examples: ROI Calculator, Invoice Generator, Property Alerts
 */
export type ToolScope =
  | 'module'        // Core platform module (dashboard/page) - lib/modules/
  | 'tool'          // Marketplace tool (add-on utility) - lib/tools/
  | 'integration';  // Tool that integrates into a module

/**
 * How the tool is implemented/deployed
 */
export type ToolImplementation =
  | 'platform-module' // Core platform module in lib/modules/ (always available per tier)
  | 'nextjs'          // Built into Next.js app (marketplace tool)
  | 'n8n'             // n8n workflow automation (marketplace tool)
  | 'hybrid'          // Combination of Next.js + n8n (marketplace tool)
  | 'external';       // Third-party integration (marketplace tool)

/**
 * Tool lifecycle status
 */
export type ToolStatus = 'active' | 'beta' | 'deprecated' | 'coming-soon';

// ============================================================================
// Tool Configuration Types
// ============================================================================

/**
 * Individual tool setting definition
 */
export interface ToolSetting {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  defaultValue: unknown;
  options?: Array<{ label: string; value: unknown }>;
  required?: boolean;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

/**
 * Tool metadata - Core identification and configuration
 *
 * CRITICAL: This represents MARKETPLACE TOOLS, not platform modules
 * Platform modules (CRM, Projects, AI) live in lib/modules/
 */
export interface ToolMetadata {
  // Identification
  id: string;                           // e.g., 'roi-calculator', 'property-alerts'
  name: string;                         // e.g., 'ROI Calculator', 'Property Alert System'
  description: string;
  longDescription?: string;             // Extended description for detail page
  icon: string;                         // Lucide icon name
  industry: Industry;                   // Which industry this tool belongs to

  // CRITICAL: Scope designation
  scope: ToolScope;                     // 'tool' (marketplace) | 'module' (platform) | 'integration'

  // Classification
  category: ToolCategory;
  tier: ToolTier;                       // Minimum tier to access (placeholder - TBD)
  implementation: ToolImplementation;

  // Pricing & Access (PLACEHOLDER - TBD)
  basePrice: number;                    // Monthly price in cents (0 for included) - TBD
  isAddon?: boolean;                    // Can be purchased separately - TBD
  requiredTier?: ToolTier;              // Minimum tier required - TBD
  includedInTiers?: ToolTier[];         // Which tiers include this for free - TBD

  // Technical
  version: string;
  dependencies?: string[];              // Other tool IDs required
  apiEndpoints?: string[];              // API routes this tool uses
  n8nWorkflows?: string[];              // n8n workflow IDs

  // Configuration
  configurableSettings?: ToolSetting[];
  requiresSetup?: boolean;              // Needs initial configuration
  setupInstructions?: string;           // Setup guide

  // Status & Metadata
  status: ToolStatus;
  releasedAt?: Date;
  tags?: string[];                      // Search/filter tags

  // Documentation
  docsUrl?: string;
  videoUrl?: string;
  supportUrl?: string;
}

// ============================================================================
// Tool Implementation Interface
// ============================================================================

/**
 * Complete tool definition with metadata and functionality
 */
export interface Tool {
  metadata: ToolMetadata;

  // Server Actions
  actions?: Record<string, (...args: unknown[]) => Promise<unknown>>;

  // Data Queries
  queries?: Record<string, (...args: unknown[]) => Promise<unknown>>;

  // Lifecycle Hooks
  onEnable?: (organizationId: string) => Promise<void>;
  onDisable?: (organizationId: string) => Promise<void>;
  onConfigure?: (organizationId: string, settings: Record<string, unknown>) => Promise<void>;

  // Health & Monitoring
  healthCheck?: () => Promise<{ healthy: boolean; message?: string }>;
}

/**
 * Tool with industry context (used in registry lookups)
 */
export interface ToolWithIndustry extends Tool {
  industry: Industry;
}

// ============================================================================
// Registry Types
// ============================================================================

/**
 * Tools organized by industry
 */
export type ToolsByIndustry = Record<Industry, Record<string, Tool>>;

/**
 * Industry loader function (for lazy loading)
 */
export type IndustryLoader = () => Promise<Record<string, Tool>>;

/**
 * Industry loader registry
 */
export type IndustryLoaders = Record<Industry, IndustryLoader>;

// ============================================================================
// Organization Tool Configuration (matches Prisma model)
// ============================================================================

/**
 * Organization's tool configuration and state
 * Matches the Prisma OrganizationToolConfig model
 */
export interface OrganizationToolConfig {
  id: string;
  organizationId: string;
  toolId: string;
  industry: Industry;
  enabled: boolean;
  settings: Record<string, unknown>;
  enabledAt?: Date;
  disabledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Tool Access & Permissions
// ============================================================================

/**
 * Tool access check result
 */
export interface ToolAccessResult {
  hasAccess: boolean;
  reason?: 'tier-required' | 'addon-required' | 'dependency-missing' | 'limit-reached';
  requiredTier?: ToolTier;
  missingDependencies?: string[];
}

/**
 * Tool usage limits by tier
 */
export interface ToolLimits {
  tier: ToolTier;
  maxTools: number;              // Max tools that can be enabled
  maxApiCalls: number;           // API calls per month
  maxWorkflowRuns: number;       // n8n workflow executions per month
  prioritySupport: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Tool filter criteria
 */
export interface ToolFilter {
  industry?: Industry;
  category?: ToolCategory;
  tier?: ToolTier;
  status?: ToolStatus;
  searchQuery?: string;
  tags?: string[];
}

/**
 * Tool sort options
 */
export type ToolSortBy = 'name' | 'price' | 'popularity' | 'newest' | 'category';

/**
 * Tool grid/list display options
 */
export interface ToolDisplayOptions {
  filter?: ToolFilter;
  sortBy?: ToolSortBy;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
