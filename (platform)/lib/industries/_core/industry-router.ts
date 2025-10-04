/**
 * Industry Dynamic Router
 *
 * Handles dynamic routing and loading of industry-specific content
 */

import type { Industry, IndustryConfig } from './industry-config';
import type { BaseIndustry } from './base-industry';

/**
 * Get industry configuration by ID
 *
 * Dynamically imports the industry module and returns its config
 */
export async function getIndustryConfig(
  industryId: Industry
): Promise<IndustryConfig> {
  try {
    // Dynamic import based on industry ID
    const industryModule = await import(
      `@/lib/industries/${industryId}/config`
    );
    return industryModule.default || industryModule.config;
  } catch (error) {
    console.error(`Failed to load industry config for ${industryId}:`, error);
    throw new Error(`Industry ${industryId} not found or failed to load`);
  }
}

/**
 * Get industry instance by ID
 *
 * Dynamically imports and instantiates the industry class
 */
export async function getIndustryInstance(
  industryId: Industry
): Promise<BaseIndustry> {
  try {
    const industryModule = await import(`@/lib/industries/${industryId}`);
    const IndustryClass = industryModule.default || industryModule.Industry;

    if (!IndustryClass) {
      throw new Error(`No default export found for industry ${industryId}`);
    }

    return new IndustryClass();
  } catch (error) {
    console.error(`Failed to load industry instance for ${industryId}:`, error);
    throw new Error(`Industry ${industryId} not found or failed to load`);
  }
}

/**
 * Get all available industries
 *
 * Returns list of all registered industries
 */
export async function getAvailableIndustries(): Promise<Industry[]> {
  // TODO: This should be dynamic based on what industries are registered
  // For now, return a hardcoded list
  return [
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
}

/**
 * Get industries enabled for an organization
 *
 * Queries the database for enabled industries
 */
export async function getOrganizationIndustries(
  organizationId: string
): Promise<Array<{ industryId: Industry; config: IndustryConfig; settings: Record<string, any> }>> {
  const { prisma } = await import('@/lib/prisma');

  const enabledModules = await prisma.organization_tool_configs.findMany({
    where: {
      organizationId,
      enabled: true,
    },
    select: {
      industry: true,
      settings: true,
      enabledAt: true,
    },
  });

  // Load configs for enabled industries
  const industriesWithConfigs = await Promise.all(
    enabledModules.map(async (module) => {
      try {
        const config = await getIndustryConfig(module.industry as Industry);
        return {
          industryId: module.industry as Industry,
          config,
          settings: (module.settings as Record<string, any>) || {},
        };
      } catch (error) {
        console.error(`Failed to load config for ${module.industry}:`, error);
        return null;
      }
    })
  );

  return industriesWithConfigs.filter((i) => i !== null) as Array<{
    industryId: Industry;
    config: IndustryConfig;
    settings: Record<string, any>;
  }>;
}

/**
 * Check if an organization has an industry enabled
 */
export async function hasIndustryEnabled(
  organizationId: string,
  industryId: Industry
): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma');

  const config = await prisma.organization_tool_configs.findFirst({
    where: {
      organizationId,
      industry: industryId,
      enabled: true,
    },
  });

  return !!config;
}

/**
 * Validate industry access for a user
 *
 * Checks if user's organization has the industry enabled
 */
export async function validateIndustryAccess(
  userId: string,
  industryId: Industry
): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma');

  // Get user's organization
  const member = await prisma.organization_members.findFirst({
    where: { userId },
    select: { organizationId: true },
  });

  if (!member) {
    return false;
  }

  return hasIndustryEnabled(member.organizationId, industryId);
}
