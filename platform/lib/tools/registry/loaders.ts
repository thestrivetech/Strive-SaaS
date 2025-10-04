/**
 * Tool Registry Loaders
 *
 * Lazy loading functions for each industry to optimize bundle size.
 * Tools are only loaded when the industry is accessed.
 */

import type { Tool, Industry, IndustryLoaders } from '../types';

// ============================================================================
// Industry Loader Functions
// ============================================================================

/**
 * Load shared/universal tools (lazy loaded)
 */
export async function loadSharedTools(): Promise<Record<string, Tool>> {
  // Dynamic imports for shared tools
  // @TODO: Uncomment when crm-basic tool is implemented
  // const { tool as crmBasic } = await import('../shared/crm-basic');

  return {
    // 'crm-basic': crmBasic,
    // Additional shared tools will be added here as they're implemented
    // Example:
    // 'appointment-scheduler': appointmentScheduler,
  };
}

/**
 * Load real estate industry tools (lazy loaded)
 */
export async function loadRealEstateTools(): Promise<Record<string, Tool>> {
  // Dynamic imports for real estate tools
  // const { tool as propertyAlerts } = await import('../real-estate/property-alerts');
  // const { tool as mlsIntegration } = await import('../real-estate/mls-integration');

  return {
    // Tools will be registered here
  };
}

/**
 * Load healthcare industry tools (lazy loaded)
 */
export async function loadHealthcareTools(): Promise<Record<string, Tool>> {
  return {
    // Healthcare tools will be registered here
  };
}

/**
 * Load fintech industry tools (lazy loaded)
 */
export async function loadFintechTools(): Promise<Record<string, Tool>> {
  return {
    // Fintech tools will be registered here
  };
}

/**
 * Load manufacturing industry tools (lazy loaded)
 */
export async function loadManufacturingTools(): Promise<Record<string, Tool>> {
  return {
    // Manufacturing tools will be registered here
  };
}

/**
 * Load retail industry tools (lazy loaded)
 */
export async function loadRetailTools(): Promise<Record<string, Tool>> {
  return {
    // Retail tools will be registered here
  };
}

/**
 * Load education industry tools (lazy loaded)
 */
export async function loadEducationTools(): Promise<Record<string, Tool>> {
  return {
    // Education tools will be registered here
  };
}

/**
 * Load legal industry tools (lazy loaded)
 */
export async function loadLegalTools(): Promise<Record<string, Tool>> {
  return {
    // Legal tools will be registered here
  };
}

/**
 * Load hospitality industry tools (lazy loaded)
 */
export async function loadHospitalityTools(): Promise<Record<string, Tool>> {
  return {
    // Hospitality tools will be registered here
  };
}

/**
 * Load logistics industry tools (lazy loaded)
 */
export async function loadLogisticsTools(): Promise<Record<string, Tool>> {
  return {
    // Logistics tools will be registered here
  };
}

/**
 * Load construction industry tools (lazy loaded)
 */
export async function loadConstructionTools(): Promise<Record<string, Tool>> {
  return {
    // Construction tools will be registered here
  };
}

// ============================================================================
// Industry Loader Registry
// ============================================================================

/**
 * Map of industry slugs to their loader functions
 * Enables dynamic loading of tools only when needed
 */
export const INDUSTRY_LOADERS: IndustryLoaders = {
  'shared': loadSharedTools,
  'real-estate': loadRealEstateTools,
  'healthcare': loadHealthcareTools,
  'fintech': loadFintechTools,
  'manufacturing': loadManufacturingTools,
  'retail': loadRetailTools,
  'education': loadEducationTools,
  'legal': loadLegalTools,
  'hospitality': loadHospitalityTools,
  'logistics': loadLogisticsTools,
  'construction': loadConstructionTools,
};

// ============================================================================
// Loader Cache
// ============================================================================

/**
 * Cache for loaded industry tools to avoid re-loading
 * Reset on server restart (in-memory only)
 */
const loadedIndustries = new Map<Industry, Record<string, Tool>>();

/**
 * Load tools for a specific industry with caching
 */
export async function loadIndustryTools(industry: Industry): Promise<Record<string, Tool>> {
  // Check cache first
  const cached = loadedIndustries.get(industry);
  if (cached) {
    return cached;
  }

  // Load from loader function
  const loader = INDUSTRY_LOADERS[industry];
  if (!loader) {
    console.warn(`No loader found for industry: ${industry}`);
    return {};
  }

  const tools = await loader();
  loadedIndustries.set(industry, tools);
  return tools;
}

/**
 * Preload multiple industries (useful for server-side rendering)
 */
export async function preloadIndustries(industries: Industry[]): Promise<void> {
  await Promise.all(industries.map(loadIndustryTools));
}

/**
 * Clear the loaded industry cache (for testing or cache invalidation)
 */
export function clearIndustryCache(industry?: Industry): void {
  if (industry) {
    loadedIndustries.delete(industry);
  } else {
    loadedIndustries.clear();
  }
}
