/**
 * Topological sort of workflow nodes based on edges
 * Returns nodes in execution order using Kahn's algorithm
 */
export function topologicalSort(nodes: any[], edges: any[]): any[] {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Build adjacency list
  nodes.forEach(node => {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  edges.forEach(edge => {
    graph.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Kahn's algorithm
  const queue: string[] = [];
  const result: any[] = [];

  // Add nodes with no incoming edges
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes.find(n => n.id === nodeId);
    if (node) result.push(node);

    graph.get(nodeId)?.forEach(targetId => {
      const newDegree = (inDegree.get(targetId) || 0) - 1;
      inDegree.set(targetId, newDegree);
      if (newDegree === 0) {
        queue.push(targetId);
      }
    });
  }

  return result;
}

/**
 * Validate workflow definition
 * Checks for required nodes and cycles
 */
export function validateWorkflowDefinition(
  nodes: any[],
  edges: any[]
): { valid: boolean; error?: string } {
  if (!nodes || nodes.length === 0) {
    return { valid: false, error: 'Workflow must have at least one node' };
  }

  // Check for trigger node
  const hasTrigger = nodes.some(node => node.type === 'trigger');
  if (!hasTrigger) {
    return { valid: false, error: 'Workflow must have a trigger node' };
  }

  // Check for cycles using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        if (hasCycle(edge.target)) return true;
      } else if (recursionStack.has(edge.target)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycle(node.id)) {
        return { valid: false, error: 'Workflow contains cycles' };
      }
    }
  }

  return { valid: true };
}
