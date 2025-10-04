/**
 * Industry Registry
 *
 * Central registry for all available industries.
 * Auto-discovers and registers industry modules.
 */

import type { Industry, IndustryConfig } from './_core/industry-config';
import type { BaseIndustry } from './_core/base-industry';

/**
 * Industry Registry Map
 *
 * Maps industry IDs to their configurations and instances
 */
type IndustryRegistry = Record<
  Industry,
  {
    config: IndustryConfig;
    getInstance: () => Promise<BaseIndustry>;
  }
>;

/**
 * Registered Industries
 *
 * This will be populated as industries are created.
 * For now, it's an empty registry that will be extended.
 */
const REGISTERED_INDUSTRIES: Partial<IndustryRegistry> = {
  // Industries will be registered here as they're created
  // Example:
  // 'healthcare': {
  //   config: healthcareConfig,
  //   getInstance: () => import('./healthcare').then(m => new m.HealthcareIndustry())
  // }
};

/**
 * Get all registered industries
 */
export function getRegisteredIndustries(): Industry[] {
  return Object.keys(REGISTERED_INDUSTRIES) as Industry[];
}

/**
 * Get industry configuration by ID
 */
export async function getIndustryConfig(
  industryId: Industry
): Promise<IndustryConfig> {
  const industry = REGISTERED_INDUSTRIES[industryId];

  if (!industry) {
    throw new Error(`Industry ${industryId} is not registered`);
  }

  return industry.config;
}

/**
 * Get industry instance by ID
 */
export async function getIndustryInstance(
  industryId: Industry
): Promise<BaseIndustry> {
  const industry = REGISTERED_INDUSTRIES[industryId];

  if (!industry) {
    throw new Error(`Industry ${industryId} is not registered`);
  }

  return industry.getInstance();
}

/**
 * Check if an industry is registered
 */
export function isIndustryRegistered(industryId: Industry): boolean {
  return industryId in REGISTERED_INDUSTRIES;
}

/**
 * Get all industry metadata (lightweight)
 */
export function getAllIndustryMetadata() {
  return Object.entries(REGISTERED_INDUSTRIES).map(([id, industry]) => ({
    id,
    name: industry.config.name,
    description: industry.config.description,
    icon: industry.config.icon,
    color: industry.config.color,
    status: industry.config.status,
    version: industry.config.version,
  }));
}

/**
 * Get industries by status
 */
export function getIndustriesByStatus(
  status: 'active' | 'beta' | 'coming-soon'
): Industry[] {
  return Object.entries(REGISTERED_INDUSTRIES)
    .filter(([_, industry]) => industry.config.status === status)
    .map(([id]) => id as Industry);
}

/**
 * Register a new industry (for internal use only)
 *
 * This is called when an industry module is created
 */
export function registerIndustry(
  industryId: Industry,
  config: IndustryConfig,
  getInstance: () => Promise<BaseIndustry>
): void {
  if (isIndustryRegistered(industryId)) {
    console.warn(`Industry ${industryId} is already registered. Skipping.`);
    return;
  }

  REGISTERED_INDUSTRIES[industryId] = {
    config,
    getInstance,
  };

  console.log(`Industry ${industryId} registered successfully`);
}

/**
 * Export the registry for direct access (if needed)
 */
export { REGISTERED_INDUSTRIES };
