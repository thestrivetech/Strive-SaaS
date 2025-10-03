/**
 * Tool System Constants
 *
 * Global configuration, limits, and display data for the MARKETPLACE TOOLS.
 *
 * CRITICAL DISTINCTION:
 * - MODULES = Core platform dashboards (lib/modules/) - CRM, Projects, AI, Tasks
 * - TOOLS = Marketplace add-ons (lib/tools/) - ROI Calc, Invoice Gen, Property Alerts
 *
 * This file covers TOOLS (marketplace add-ons) only.
 * Modules are always included based on subscription tier.
 *
 * IMPORTANT: All pricing/limits are PLACEHOLDERS pending final business decisions.
 */

import type { Industry, ToolCategory, ToolLimits, ToolTier } from './types';

// ============================================================================
// Industry Configuration
// ============================================================================

/**
 * Industry metadata for display
 */
export const INDUSTRY_META: Record<Industry, {
  name: string;
  description: string;
  icon: string;
  color: string;
  slug: Industry;
}> = {
  'shared': {
    name: 'Universal Tools',
    description: 'Cross-industry tools available to all businesses',
    icon: 'Wrench',
    color: 'blue',
    slug: 'shared',
  },
  'real-estate': {
    name: 'Real Estate',
    description: 'Property management, MLS integration, and client tools',
    icon: 'Home',
    color: 'green',
    slug: 'real-estate',
  },
  'healthcare': {
    name: 'Healthcare',
    description: 'HIPAA-compliant patient management and medical tools',
    icon: 'Heart',
    color: 'red',
    slug: 'healthcare',
  },
  'fintech': {
    name: 'Financial Services',
    description: 'Banking, investment, and financial compliance tools',
    icon: 'DollarSign',
    color: 'emerald',
    slug: 'fintech',
  },
  'manufacturing': {
    name: 'Manufacturing',
    description: 'Production, inventory, and supply chain management',
    icon: 'Factory',
    color: 'orange',
    slug: 'manufacturing',
  },
  'retail': {
    name: 'Retail & E-commerce',
    description: 'Point of sale, inventory, and customer loyalty tools',
    icon: 'ShoppingCart',
    color: 'purple',
    slug: 'retail',
  },
  'education': {
    name: 'Education',
    description: 'Student management, learning, and enrollment tools',
    icon: 'GraduationCap',
    color: 'indigo',
    slug: 'education',
  },
  'legal': {
    name: 'Legal Services',
    description: 'Case management, billing, and document tools',
    icon: 'Scale',
    color: 'slate',
    slug: 'legal',
  },
  'hospitality': {
    name: 'Hospitality',
    description: 'Hotel, restaurant, and guest management tools',
    icon: 'Hotel',
    color: 'pink',
    slug: 'hospitality',
  },
  'logistics': {
    name: 'Logistics',
    description: 'Fleet, shipping, and warehouse management',
    icon: 'Truck',
    color: 'amber',
    slug: 'logistics',
  },
  'construction': {
    name: 'Construction',
    description: 'Project management, bidding, and safety tools',
    icon: 'HardHat',
    color: 'yellow',
    slug: 'construction',
  },
};

/**
 * List of all industry slugs
 */
export const INDUSTRIES: Industry[] = [
  'shared',
  'real-estate',
  'healthcare',
  'fintech',
  'manufacturing',
  'retail',
  'education',
  'legal',
  'hospitality',
  'logistics',
  'construction',
];

// ============================================================================
// Category Configuration
// ============================================================================

/**
 * Category metadata for display and filtering
 */
export const CATEGORY_META: Record<ToolCategory, {
  name: string;
  description: string;
  icon: string;
}> = {
  'lead-management': {
    name: 'Lead Management',
    description: 'Track and nurture customer leads',
    icon: 'Users',
  },
  'communication': {
    name: 'Communication',
    description: 'Email, messaging, and notifications',
    icon: 'MessageSquare',
  },
  'automation': {
    name: 'Automation',
    description: 'Workflow and process automation',
    icon: 'Zap',
  },
  'analytics': {
    name: 'Analytics',
    description: 'Data analysis and reporting',
    icon: 'TrendingUp',
  },
  'financial': {
    name: 'Financial',
    description: 'Billing, payments, and accounting',
    icon: 'DollarSign',
  },
  'marketing': {
    name: 'Marketing',
    description: 'Campaigns, SEO, and promotion',
    icon: 'Megaphone',
  },
  'document-management': {
    name: 'Documents',
    description: 'File storage and collaboration',
    icon: 'FileText',
  },
  'compliance': {
    name: 'Compliance',
    description: 'Regulatory and legal compliance',
    icon: 'Shield',
  },
  'operations': {
    name: 'Operations',
    description: 'Business operations management',
    icon: 'Settings',
  },
  'customer-service': {
    name: 'Customer Service',
    description: 'Support and satisfaction tools',
    icon: 'Headphones',
  },
  'productivity': {
    name: 'Productivity',
    description: 'Time tracking and task management',
    icon: 'Clock',
  },
  'media': {
    name: 'Media',
    description: 'Image, video, and asset management',
    icon: 'Image',
  },
  'data': {
    name: 'Data',
    description: 'Data import, export, and transformation',
    icon: 'Database',
  },
};

// ============================================================================
// Tier Configuration & Limits
// ============================================================================

/**
 * Subscription tier metadata
 *
 * IMPORTANT: All pricing and limits are PLACEHOLDERS (TBD)
 * Final pricing structure and feature allocation pending business decisions
 */
export const TIER_META: Record<ToolTier, {
  name: string;
  description: string;
  price: number;         // Monthly price in dollars (PLACEHOLDER - TBD)
  toolLimit: number;     // Max marketplace tools (PLACEHOLDER - TBD)
  badge: string;
  color: string;
}> = {
  'STARTER': {
    name: 'Starter',
    description: 'Entry level tier (features TBD)',
    price: 0,              // PLACEHOLDER - TBD
    toolLimit: 0,          // PLACEHOLDER - TBD
    badge: 'Starter',
    color: 'gray',
  },
  'GROWTH': {
    name: 'Growth',
    description: 'Growing businesses (features TBD)',
    price: 0,              // PLACEHOLDER - TBD
    toolLimit: 3,          // PLACEHOLDER - TBD
    badge: 'Growth',
    color: 'blue',
  },
  'ELITE': {
    name: 'Elite',
    description: 'Advanced features (features TBD)',
    price: 0,              // PLACEHOLDER - TBD
    toolLimit: 10,         // PLACEHOLDER - TBD
    badge: 'Elite',
    color: 'purple',
  },
  'CUSTOM': {
    name: 'Custom',
    description: 'Tailored solutions (features TBD)',
    price: 0,              // PLACEHOLDER - TBD
    toolLimit: 20,         // PLACEHOLDER - TBD
    badge: 'Custom',
    color: 'indigo',
  },
  'ENTERPRISE': {
    name: 'Enterprise',
    description: 'Full enterprise suite (features TBD)',
    price: 0,              // PLACEHOLDER - TBD
    toolLimit: Infinity,   // PLACEHOLDER - TBD
    badge: 'Enterprise',
    color: 'orange',
  },
};

/**
 * Complete tier limits configuration
 *
 * IMPORTANT: All limits are PLACEHOLDERS (TBD)
 * - maxTools = Marketplace tools only (NOT platform modules)
 * - Platform modules (CRM, Projects, AI) are always included per tier
 */
export const TOOL_LIMITS: Record<ToolTier, ToolLimits> = {
  'STARTER': {
    tier: 'STARTER',
    maxTools: 0,           // PLACEHOLDER - TBD
    maxApiCalls: 0,        // PLACEHOLDER - TBD
    maxWorkflowRuns: 0,    // PLACEHOLDER - TBD
    prioritySupport: false,
  },
  'GROWTH': {
    tier: 'GROWTH',
    maxTools: 3,           // PLACEHOLDER - TBD
    maxApiCalls: 10000,    // PLACEHOLDER - TBD
    maxWorkflowRuns: 1000, // PLACEHOLDER - TBD
    prioritySupport: false,
  },
  'ELITE': {
    tier: 'ELITE',
    maxTools: 10,          // PLACEHOLDER - TBD
    maxApiCalls: 50000,    // PLACEHOLDER - TBD
    maxWorkflowRuns: 5000, // PLACEHOLDER - TBD
    prioritySupport: false,
  },
  'CUSTOM': {
    tier: 'CUSTOM',
    maxTools: 20,          // PLACEHOLDER - TBD
    maxApiCalls: 100000,   // PLACEHOLDER - TBD
    maxWorkflowRuns: 10000, // PLACEHOLDER - TBD
    prioritySupport: true,
  },
  'ENTERPRISE': {
    tier: 'ENTERPRISE',
    maxTools: Infinity,    // PLACEHOLDER - TBD
    maxApiCalls: Infinity, // PLACEHOLDER - TBD
    maxWorkflowRuns: Infinity, // PLACEHOLDER - TBD
    prioritySupport: true,
  },
};

/**
 * Tier hierarchy for comparisons
 */
export const TIER_HIERARCHY: Record<ToolTier, number> = {
  'STARTER': 0,
  'GROWTH': 1,
  'ELITE': 2,
  'CUSTOM': 3,
  'ENTERPRISE': 4,
};

// ============================================================================
// Tool Status Configuration
// ============================================================================

/**
 * Tool status display metadata
 */
export const STATUS_META = {
  'active': {
    label: 'Active',
    color: 'green',
    description: 'Fully available',
  },
  'beta': {
    label: 'Beta',
    color: 'blue',
    description: 'Testing phase',
  },
  'deprecated': {
    label: 'Deprecated',
    color: 'red',
    description: 'Being phased out',
  },
  'coming-soon': {
    label: 'Coming Soon',
    color: 'gray',
    description: 'In development',
  },
} as const;

// ============================================================================
// Feature Flags & Defaults
// ============================================================================

/**
 * Default tool configuration values
 */
export const DEFAULT_TOOL_CONFIG = {
  enabled: false,
  settings: {},
  requiresSetup: false,
} as const;

/**
 * Tool marketplace display defaults
 */
export const MARKETPLACE_DEFAULTS = {
  defaultSortBy: 'category' as const,
  defaultSortOrder: 'asc' as const,
  itemsPerPage: 12,
  showComingSoon: true,
  showBeta: true,
  showDeprecated: false,
} as const;

/**
 * Tool search configuration
 */
export const SEARCH_CONFIG = {
  minQueryLength: 2,
  maxResults: 50,
  searchFields: ['name', 'description', 'tags'] as const,
} as const;

// ============================================================================
// Pricing Constants
// ============================================================================

/**
 * Price display formatting
 */
export const PRICE_FORMAT = {
  currency: 'USD',
  locale: 'en-US',
  showCents: false,
} as const;

/**
 * Common addon prices (in cents)
 */
export const ADDON_PRICES = {
  BASIC_ADDON: 5000,      // $50/mo
  ADVANCED_ADDON: 10000,  // $100/mo
  PREMIUM_ADDON: 20000,   // $200/mo
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a tier has access to a required tier
 */
export function hasRequiredTier(userTier: ToolTier, requiredTier: ToolTier): boolean {
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}

/**
 * Get tool limit for a tier
 */
export function getToolLimit(tier: ToolTier): number {
  return TIER_META[tier].toolLimit;
}

/**
 * Format price from cents to display string
 */
export function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  const dollars = cents / 100;
  return new Intl.NumberFormat(PRICE_FORMAT.locale, {
    style: 'currency',
    currency: PRICE_FORMAT.currency,
    minimumFractionDigits: PRICE_FORMAT.showCents ? 2 : 0,
    maximumFractionDigits: PRICE_FORMAT.showCents ? 2 : 0,
  }).format(dollars);
}

/**
 * Get industry display name
 */
export function getIndustryName(industry: Industry): string {
  return INDUSTRY_META[industry]?.name || industry;
}

/**
 * Get category display name
 */
export function getCategoryName(category: ToolCategory): string {
  return CATEGORY_META[category]?.name || category;
}
