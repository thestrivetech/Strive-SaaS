import 'server-only';

import type { workflow_templates } from '@prisma/client';

/**
 * Instantiate template as workflow
 * Creates a new workflow from template definition
 */
export async function instantiateTemplate(
  template: workflow_templates,
  workflowName: string,
  workflowDescription: string | undefined,
  variables: Record<string, any> = {},
  organizationId: string,
  creatorId: string
) {
  const { prisma } = await import('@/lib/database/prisma');

  // Replace template variables in nodes
  const processedNodes = replaceTemplateVariables(
    template.nodes as any[],
    variables
  );

  // Create workflow from template
  const workflow = await prisma.automation_workflows.create({
    data: {
      name: workflowName,
      description: workflowDescription || template.description,
      nodes: processedNodes,
      edges: template.edges,
      organization_id: organizationId,
      created_by: creatorId,
      is_active: false, // User must activate manually
      execution_count: 0,
    },
  });

  // Increment template usage count
  await prisma.workflow_templates.update({
    where: { id: template.id },
    data: { usage_count: { increment: 1 } },
  });

  return workflow;
}

/**
 * Replace template variables in nodes
 */
function replaceTemplateVariables(
  nodes: any[],
  variables: Record<string, any>
): any[] {
  return nodes.map(node => {
    const nodeData = { ...node.data };

    // Replace variables in node configuration
    for (const [key, value] of Object.entries(nodeData)) {
      if (typeof value === 'string') {
        // Replace {{variableName}} with actual value
        nodeData[key] = value.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
          return variables[varName] !== undefined ? variables[varName] : match;
        });
      }
    }

    return {
      ...node,
      data: nodeData,
    };
  });
}

/**
 * Validate template definition
 */
export function validateTemplateDefinition(
  nodes: any[],
  edges: any[]
): { valid: boolean; error?: string } {
  // Must have at least one node
  if (!nodes || nodes.length === 0) {
    return { valid: false, error: 'Template must have at least one node' };
  }

  // Must have a trigger node
  const hasTrigger = nodes.some(node => node.type === 'trigger');
  if (!hasTrigger) {
    return { valid: false, error: 'Template must have a trigger node' };
  }

  // Validate node IDs are unique
  const nodeIds = nodes.map(n => n.id);
  const uniqueIds = new Set(nodeIds);
  if (nodeIds.length !== uniqueIds.size) {
    return { valid: false, error: 'Node IDs must be unique' };
  }

  // Validate edges reference existing nodes
  for (const edge of edges) {
    if (!nodeIds.includes(edge.source)) {
      return { valid: false, error: `Edge references non-existent source node: ${edge.source}` };
    }
    if (!nodeIds.includes(edge.target)) {
      return { valid: false, error: `Edge references non-existent target node: ${edge.target}` };
    }
  }

  // Check for cycles (templates should be acyclic)
  const hasCycle = detectCycle(nodes, edges);
  if (hasCycle) {
    return { valid: false, error: 'Template contains circular dependencies' };
  }

  return { valid: true };
}

/**
 * Detect cycles in graph
 */
function detectCycle(nodes: any[], edges: any[]): boolean {
  const adjacency = new Map<string, string[]>();

  // Build adjacency list
  for (const node of nodes) {
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    const neighbors = adjacency.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacency.set(edge.source, neighbors);
  }

  // DFS cycle detection
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true; // Cycle detected
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculate template rating from reviews
 */
export function calculateTemplateRating(reviews: Array<{ rating: number }>): number {
  if (reviews.length === 0) {
    return 0;
  }

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Format template for marketplace display
 */
export function formatTemplateForMarketplace(template: any): any {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    difficulty: template.difficulty,
    tags: template.tags || [],
    is_featured: template.is_featured,
    usage_count: template.usage_count,
    average_rating: template.average_rating || 0,
    review_count: template.review_count || 0,
    created_at: template.created_at,
    creator: template.users
      ? {
          name: template.users.name || 'Anonymous',
          email: template.users.email,
        }
      : null,
    organization: template.organizations
      ? {
          name: template.organizations.name,
        }
      : null,
  };
}

/**
 * Extract template variables from nodes
 */
export function extractTemplateVariables(nodes: any[]): string[] {
  const variables = new Set<string>();

  for (const node of nodes) {
    const nodeData = node.data || {};

    for (const value of Object.values(nodeData)) {
      if (typeof value === 'string') {
        // Find all {{variableName}} patterns
        const matches = value.matchAll(/\{\{(\w+)\}\}/g);
        for (const match of matches) {
          variables.add(match[1]);
        }
      }
    }
  }

  return Array.from(variables);
}
