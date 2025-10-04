/**
 * Tool Registry Helper Functions
 *
 * Utilities for searching, filtering, and accessing tools from the registry.
 */

import type {
  Tool,
  ToolWithIndustry,
  Industry,
  ToolFilter,
  ToolDisplayOptions,
  ToolSortBy,
} from '../types';
import { loadIndustryTools, INDUSTRY_LOADERS } from './loaders';
import { INDUSTRIES } from '../constants';

// ============================================================================
// Tool Lookup Functions
// ============================================================================

/**
 * Get all tools for a specific industry
 */
export async function getToolsByIndustry(industry: Industry): Promise<Tool[]> {
  const toolsMap = await loadIndustryTools(industry);
  return Object.values(toolsMap);
}

/**
 * Get a specific tool by ID and industry
 */
export async function getToolById(
  toolId: string,
  industry: Industry
): Promise<Tool | undefined> {
  const toolsMap = await loadIndustryTools(industry);
  return toolsMap[toolId];
}

/**
 * Search for a tool across all industries by ID only
 */
export async function findToolById(toolId: string): Promise<ToolWithIndustry | undefined> {
  for (const industry of INDUSTRIES) {
    const toolsMap = await loadIndustryTools(industry);
    const tool = toolsMap[toolId];
    if (tool) {
      return { ...tool, industry };
    }
  }
  return undefined;
}

/**
 * Get all tools across all industries
 */
export async function getAllTools(): Promise<ToolWithIndustry[]> {
  const allTools: ToolWithIndustry[] = [];

  for (const industry of INDUSTRIES) {
    const toolsMap = await loadIndustryTools(industry);
    const tools = Object.values(toolsMap).map((tool) => ({
      ...tool,
      industry,
    }));
    allTools.push(...tools);
  }

  return allTools;
}

/**
 * Get list of all industries that have tools registered
 */
export function getAvailableIndustries(): Industry[] {
  return Object.keys(INDUSTRY_LOADERS) as Industry[];
}

// ============================================================================
// Filtering & Search Functions
// ============================================================================

/**
 * Filter tools based on criteria
 */
export function filterTools(tools: ToolWithIndustry[], filter: ToolFilter): ToolWithIndustry[] {
  let filtered = [...tools];

  // Filter by industry
  if (filter.industry) {
    filtered = filtered.filter((tool) => tool.industry === filter.industry);
  }

  // Filter by category
  if (filter.category) {
    filtered = filtered.filter((tool) => tool.metadata.category === filter.category);
  }

  // Filter by tier
  if (filter.tier) {
    filtered = filtered.filter((tool) => tool.metadata.tier === filter.tier);
  }

  // Filter by status
  if (filter.status) {
    filtered = filtered.filter((tool) => tool.metadata.status === filter.status);
  }

  // Filter by tags
  if (filter.tags && filter.tags.length > 0) {
    filtered = filtered.filter((tool) => {
      const toolTags = tool.metadata.tags || [];
      return filter.tags!.some((tag) => toolTags.includes(tag));
    });
  }

  // Filter by search query
  if (filter.searchQuery && filter.searchQuery.trim().length > 0) {
    const query = filter.searchQuery.toLowerCase().trim();
    filtered = filtered.filter((tool) => {
      const searchableText = [
        tool.metadata.name,
        tool.metadata.description,
        tool.metadata.longDescription || '',
        ...(tool.metadata.tags || []),
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }

  return filtered;
}

/**
 * Sort tools by criteria
 */
export function sortTools(
  tools: ToolWithIndustry[],
  sortBy: ToolSortBy,
  sortOrder: 'asc' | 'desc' = 'asc'
): ToolWithIndustry[] {
  const sorted = [...tools];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.metadata.name.localeCompare(b.metadata.name);
        break;

      case 'price':
        comparison = a.metadata.basePrice - b.metadata.basePrice;
        break;

      case 'category':
        comparison = a.metadata.category.localeCompare(b.metadata.category);
        break;

      case 'newest':
        const dateA = a.metadata.releasedAt?.getTime() || 0;
        const dateB = b.metadata.releasedAt?.getTime() || 0;
        comparison = dateB - dateA; // Newer first by default
        break;

      case 'popularity':
        // TODO: Implement popularity metric (could be based on active installations)
        comparison = 0;
        break;

      default:
        comparison = 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Paginate tools
 */
export function paginateTools(
  tools: ToolWithIndustry[],
  limit: number,
  offset: number = 0
): ToolWithIndustry[] {
  return tools.slice(offset, offset + limit);
}

/**
 * Get tools with display options applied (filter, sort, paginate)
 */
export async function getToolsWithOptions(
  options: ToolDisplayOptions = {}
): Promise<{
  tools: ToolWithIndustry[];
  total: number;
}> {
  let allTools = await getAllTools();

  // Apply filter
  if (options.filter) {
    allTools = filterTools(allTools, options.filter);
  }

  const total = allTools.length;

  // Apply sort
  if (options.sortBy) {
    allTools = sortTools(allTools, options.sortBy, options.sortOrder);
  }

  // Apply pagination
  if (options.limit !== undefined) {
    allTools = paginateTools(allTools, options.limit, options.offset);
  }

  return { tools: allTools, total };
}

// ============================================================================
// Tool Category & Tag Functions
// ============================================================================

/**
 * Get all unique categories from registered tools
 */
export async function getUsedCategories(): Promise<string[]> {
  const allTools = await getAllTools();
  const categories = new Set(allTools.map((tool) => tool.metadata.category));
  return Array.from(categories).sort();
}

/**
 * Get all unique tags from registered tools
 */
export async function getUsedTags(): Promise<string[]> {
  const allTools = await getAllTools();
  const tags = new Set<string>();

  allTools.forEach((tool) => {
    if (tool.metadata.tags) {
      tool.metadata.tags.forEach((tag) => tags.add(tag));
    }
  });

  return Array.from(tags).sort();
}

/**
 * Get tools by category across all industries
 */
export async function getToolsByCategory(category: string): Promise<ToolWithIndustry[]> {
  const allTools = await getAllTools();
  return allTools.filter((tool) => tool.metadata.category === category);
}

/**
 * Get tools by tier across all industries
 */
export async function getToolsByTier(tier: string): Promise<ToolWithIndustry[]> {
  const allTools = await getAllTools();
  return allTools.filter((tool) => tool.metadata.tier === tier);
}

/**
 * Get tools by status across all industries
 */
export async function getToolsByStatus(status: string): Promise<ToolWithIndustry[]> {
  const allTools = await getAllTools();
  return allTools.filter((tool) => tool.metadata.status === status);
}

/**
 * Search tools by query string
 */
export async function searchTools(query: string): Promise<ToolWithIndustry[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const allTools = await getAllTools();
  return filterTools(allTools, { searchQuery: query });
}

// ============================================================================
// Tool Dependency Functions
// ============================================================================

/**
 * Get all dependencies for a tool (recursive)
 */
export async function getToolDependencies(
  toolId: string,
  industry: Industry
): Promise<ToolWithIndustry[]> {
  const tool = await getToolById(toolId, industry);
  if (!tool || !tool.metadata.dependencies || tool.metadata.dependencies.length === 0) {
    return [];
  }

  const dependencies: ToolWithIndustry[] = [];
  const visited = new Set<string>();

  async function collectDependencies(depToolId: string, depIndustry: Industry): Promise<void> {
    if (visited.has(depToolId)) return;
    visited.add(depToolId);

    const depTool = await findToolById(depToolId);
    if (!depTool) return;

    dependencies.push(depTool);

    if (depTool.metadata.dependencies) {
      await Promise.all(
        depTool.metadata.dependencies.map((id) => collectDependencies(id, depTool.industry))
      );
    }
  }

  await Promise.all(
    tool.metadata.dependencies.map((id) => collectDependencies(id, industry))
  );

  return dependencies;
}

/**
 * Check if a tool has all required dependencies available
 */
export async function validateToolDependencies(
  toolId: string,
  industry: Industry
): Promise<{ valid: boolean; missing: string[] }> {
  const tool = await getToolById(toolId, industry);
  if (!tool || !tool.metadata.dependencies) {
    return { valid: true, missing: [] };
  }

  const missing: string[] = [];

  for (const depId of tool.metadata.dependencies) {
    const depTool = await findToolById(depId);
    if (!depTool) {
      missing.push(depId);
    }
  }

  return { valid: missing.length === 0, missing };
}
