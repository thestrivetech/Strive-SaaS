import { create } from 'zustand';
import { WorkflowNode, WorkflowEdge } from '@/lib/types/real-estate/workflow';

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  isExecuting: boolean;
  executionLogs: any[];
}

interface WorkflowActions {
  // Node management
  addNode: (node: WorkflowNode) => void;
  updateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  
  // Edge management
  addEdge: (edge: WorkflowEdge) => void;
  deleteEdge: (edgeId: string) => void;
  
  // Workflow management
  setWorkflow: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  clearWorkflow: () => void;
  
  // Execution management
  startExecution: () => void;
  stopExecution: () => void;
  addExecutionLog: (log: any) => void;
  clearExecutionLogs: () => void;
  
  // Validation
  validateWorkflow: () => { isValid: boolean; errors: string[] };
  
  // Utilities
  duplicateNode: (nodeId: string) => void;
  getNodeById: (nodeId: string) => WorkflowNode | undefined;
  getConnectedNodes: (nodeId: string) => { incoming: WorkflowNode[]; outgoing: WorkflowNode[] };
}

const initialState: WorkflowState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isExecuting: false,
  executionLogs: [],
};

export const useWorkflowStore = create<WorkflowState & WorkflowActions>((set, get) => ({
  ...initialState,

  // Node management
  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node]
    }));
  },

  updateNode: (nodeId, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }));
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter((edge) => 
        edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId
    }));
  },

  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  // Edge management
  addEdge: (edge) => {
    set((state) => {
      // Prevent duplicate edges
      const existingEdge = state.edges.find(
        (e) => e.source === edge.source && e.target === edge.target
      );
      if (existingEdge) return state;

      return {
        edges: [...state.edges, edge]
      };
    });
  },

  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId)
    }));
  },

  // Workflow management
  setWorkflow: (nodes, edges) => {
    set({ nodes, edges });
  },

  clearWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      executionLogs: []
    });
  },

  // Execution management
  startExecution: () => {
    set({ isExecuting: true, executionLogs: [] });
  },

  stopExecution: () => {
    set({ isExecuting: false });
  },

  addExecutionLog: (log) => {
    set((state) => ({
      executionLogs: [...state.executionLogs, {
        ...log,
        timestamp: new Date().toISOString(),
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }]
    }));
  },

  clearExecutionLogs: () => {
    set({ executionLogs: [] });
  },

  // Validation
  validateWorkflow: () => {
    const { nodes, edges } = get();
    const errors: string[] = [];

    if (nodes.length === 0) {
      errors.push('Workflow must contain at least one node');
    }

    // Check for trigger nodes
    const triggerNodes = nodes.filter(node => node.type === 'trigger');
    if (triggerNodes.length === 0) {
      errors.push('Workflow must contain at least one trigger node');
    }

    // Check for disconnected nodes
    const connectedNodeIds = new Set<string>();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    const disconnectedNodes = nodes.filter(node => 
      !connectedNodeIds.has(node.id) && nodes.length > 1
    );
    if (disconnectedNodes.length > 0) {
      errors.push(`${disconnectedNodes.length} node(s) are not connected to the workflow`);
    }

    // Check for circular dependencies
    const hasCircularDependency = (nodeId: string, visited = new Set<string>()): boolean => {
      if (visited.has(nodeId)) return true;
      visited.add(nodeId);

      const outgoingEdges = edges.filter(edge => edge.source === nodeId);
      return outgoingEdges.some(edge => hasCircularDependency(edge.target, new Set(visited)));
    };

    const circularNodes = nodes.filter(node => hasCircularDependency(node.id));
    if (circularNodes.length > 0) {
      errors.push('Workflow contains circular dependencies');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Utilities
  duplicateNode: (nodeId) => {
    const { nodes } = get();
    const nodeToDuplicate = nodes.find(node => node.id === nodeId);
    if (!nodeToDuplicate) return;

    const duplicatedNode: WorkflowNode = {
      ...nodeToDuplicate,
      id: `${nodeToDuplicate.type}-${Date.now()}`,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50
      },
      data: {
        ...nodeToDuplicate.data,
        label: `${nodeToDuplicate.data.label} (Copy)`
      }
    };

    set((state) => ({
      nodes: [...state.nodes, duplicatedNode]
    }));
  },

  getNodeById: (nodeId) => {
    const { nodes } = get();
    return nodes.find(node => node.id === nodeId);
  },

  getConnectedNodes: (nodeId) => {
    const { nodes, edges } = get();
    
    const incomingEdges = edges.filter(edge => edge.target === nodeId);
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    
    const incoming = incomingEdges.map(edge => 
      nodes.find(node => node.id === edge.source)!
    ).filter(Boolean);
    
    const outgoing = outgoingEdges.map(edge => 
      nodes.find(node => node.id === edge.target)!
    ).filter(Boolean);

    return { incoming, outgoing };
  }
}));

// Selectors for computed values
export const useWorkflowNodes = () => useWorkflowStore(state => state.nodes);
export const useWorkflowEdges = () => useWorkflowStore(state => state.edges);
export const useSelectedNode = () => {
  const selectedNodeId = useWorkflowStore(state => state.selectedNodeId);
  const nodes = useWorkflowStore(state => state.nodes);
  return selectedNodeId ? nodes.find(node => node.id === selectedNodeId) : null;
};
export const useIsExecuting = () => useWorkflowStore(state => state.isExecuting);
export const useExecutionLogs = () => useWorkflowStore(state => state.executionLogs);

// Workflow statistics
export const useWorkflowStats = () => {
  const { nodes, edges } = useWorkflowStore();
  
  return {
    totalNodes: nodes.length,
    totalConnections: edges.length,
    nodesByType: nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    triggerNodes: nodes.filter(node => node.type === 'trigger').length,
    actionNodes: nodes.filter(node => node.type === 'action').length,
    conditionNodes: nodes.filter(node => node.type === 'condition').length,
    aiNodes: nodes.filter(node => node.type === 'ai').length,
    apiNodes: nodes.filter(node => node.type === 'api').length
  };
};
