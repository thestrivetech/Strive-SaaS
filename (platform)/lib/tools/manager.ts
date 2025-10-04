/**
 * Tool Manager
 *
 * Handles tool lifecycle management including enabling, disabling,
 * configuration, and health checks.
 *
 * Note: This module provides the business logic.
 * Database operations should be handled by lib/modules/tools/actions.ts
 */

import { getToolById, validateToolDependencies } from './registry';
import type { Tool, Industry, ToolAccessResult, ToolTier } from './types';
import { hasRequiredTier, TOOL_LIMITS } from './constants';

// ============================================================================
// Access Control
// ============================================================================

/**
 * Check if an organization can access a specific tool
 */
export async function checkToolAccess(params: {
  toolId: string;
  industry: Industry;
  userTier: ToolTier;
  enabledToolsCount: number;
}): Promise<ToolAccessResult> {
  const { toolId, industry, userTier, enabledToolsCount } = params;

  // Get the tool metadata
  const tool = await getToolById(toolId, industry);
  if (!tool) {
    return {
      hasAccess: false,
      reason: 'tier-required',
    };
  }

  // Check tier requirement
  const requiredTier = tool.metadata.requiredTier || tool.metadata.tier;
  if (!hasRequiredTier(userTier, requiredTier)) {
    return {
      hasAccess: false,
      reason: 'tier-required',
      requiredTier,
    };
  }

  // Check tool limit
  const limits = TOOL_LIMITS[userTier];
  if (limits.maxTools !== Infinity && enabledToolsCount >= limits.maxTools) {
    return {
      hasAccess: false,
      reason: 'limit-reached',
    };
  }

  // Check if tool is an addon that requires purchase
  if (tool.metadata.isAddon && tool.metadata.basePrice > 0) {
    // This would need to check if the organization has purchased the addon
    // Implementation depends on your billing system
    return {
      hasAccess: false,
      reason: 'addon-required',
    };
  }

  // Check dependencies
  const depCheck = await validateToolDependencies(toolId, industry);
  if (!depCheck.valid) {
    return {
      hasAccess: false,
      reason: 'dependency-missing',
      missingDependencies: depCheck.missing,
    };
  }

  return { hasAccess: true };
}

// ============================================================================
// Tool Lifecycle
// ============================================================================

/**
 * Enable a tool for an organization
 * Runs the tool's onEnable hook if defined
 */
export async function enableTool(params: {
  tool: Tool;
  organizationId: string;
  settings?: Record<string, unknown>;
}): Promise<{ success: boolean; error?: string }> {
  const { tool, organizationId, settings = {} } = params;

  try {
    // Validate settings against tool's schema
    if (tool.metadata.configurableSettings) {
      const validation = validateToolSettings(tool, settings);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid settings: ${validation.errors.join(', ')}`,
        };
      }
    }

    // Run onEnable hook if defined
    if (tool.onEnable) {
      await tool.onEnable(organizationId);
    }

    return { success: true };
  } catch (error) {
    console.error(`Failed to enable tool ${tool.metadata.id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Disable a tool for an organization
 * Runs the tool's onDisable hook if defined
 */
export async function disableTool(params: {
  tool: Tool;
  organizationId: string;
}): Promise<{ success: boolean; error?: string }> {
  const { tool, organizationId } = params;

  try {
    // Run onDisable hook if defined
    if (tool.onDisable) {
      await tool.onDisable(organizationId);
    }

    return { success: true };
  } catch (error) {
    console.error(`Failed to disable tool ${tool.metadata.id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update tool configuration for an organization
 * Runs the tool's onConfigure hook if defined
 */
export async function configureTool(params: {
  tool: Tool;
  organizationId: string;
  settings: Record<string, unknown>;
}): Promise<{ success: boolean; error?: string }> {
  const { tool, organizationId, settings } = params;

  try {
    // Validate settings
    if (tool.metadata.configurableSettings) {
      const validation = validateToolSettings(tool, settings);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid settings: ${validation.errors.join(', ')}`,
        };
      }
    }

    // Run onConfigure hook if defined
    if (tool.onConfigure) {
      await tool.onConfigure(organizationId, settings);
    }

    return { success: true };
  } catch (error) {
    console.error(`Failed to configure tool ${tool.metadata.id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Health Checks
// ============================================================================

/**
 * Run health check for a tool
 */
export async function checkToolHealth(
  tool: Tool
): Promise<{ healthy: boolean; message?: string }> {
  try {
    if (tool.healthCheck) {
      return await tool.healthCheck();
    }

    // Default: tool is healthy if no health check defined
    return { healthy: true };
  } catch (error) {
    console.error(`Health check failed for tool ${tool.metadata.id}:`, error);
    return {
      healthy: false,
      message: error instanceof Error ? error.message : 'Health check failed',
    };
  }
}

/**
 * Run health checks for multiple tools
 */
export async function checkMultipleToolsHealth(
  tools: Tool[]
): Promise<Array<{ toolId: string; healthy: boolean; message?: string }>> {
  const results = await Promise.all(
    tools.map(async (tool) => {
      const health = await checkToolHealth(tool);
      return {
        toolId: tool.metadata.id,
        ...health,
      };
    })
  );

  return results;
}

// ============================================================================
// Settings Validation
// ============================================================================

/**
 * Validate tool settings against the tool's schema
 */
export function validateToolSettings(
  tool: Tool,
  settings: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!tool.metadata.configurableSettings) {
    return { valid: true, errors: [] };
  }

  for (const setting of tool.metadata.configurableSettings) {
    const value = settings[setting.key];

    // Check required settings
    if (setting.required && (value === undefined || value === null)) {
      errors.push(`${setting.label} is required`);
      continue;
    }

    // Skip validation if value is not provided and not required
    if (value === undefined || value === null) {
      continue;
    }

    // Type validation
    const actualType = typeof value;
    const expectedType = setting.type === 'select' || setting.type === 'multiselect'
      ? 'string'
      : setting.type;

    if (actualType !== expectedType) {
      errors.push(`${setting.label} must be of type ${expectedType}`);
      continue;
    }

    // Validation rules
    if (setting.validation) {
      const { min, max, pattern } = setting.validation;

      if (typeof value === 'number') {
        if (min !== undefined && value < min) {
          errors.push(`${setting.label} must be at least ${min}`);
        }
        if (max !== undefined && value > max) {
          errors.push(`${setting.label} must be at most ${max}`);
        }
      }

      if (typeof value === 'string' && pattern) {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          errors.push(`${setting.label} format is invalid`);
        }
      }
    }

    // Select validation
    if (setting.type === 'select' && setting.options) {
      const validValues = setting.options.map((opt) => opt.value);
      if (!validValues.includes(value)) {
        errors.push(`${setting.label} must be one of: ${validValues.join(', ')}`);
      }
    }

    // Multiselect validation
    if (setting.type === 'multiselect' && setting.options) {
      if (!Array.isArray(value)) {
        errors.push(`${setting.label} must be an array`);
      } else {
        const validValues = setting.options.map((opt) => opt.value);
        const invalidValues = value.filter((v) => !validValues.includes(v));
        if (invalidValues.length > 0) {
          errors.push(
            `${setting.label} contains invalid values: ${invalidValues.join(', ')}`
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get default settings for a tool
 */
export function getDefaultToolSettings(tool: Tool): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  if (tool.metadata.configurableSettings) {
    for (const setting of tool.metadata.configurableSettings) {
      defaults[setting.key] = setting.defaultValue;
    }
  }

  return defaults;
}
