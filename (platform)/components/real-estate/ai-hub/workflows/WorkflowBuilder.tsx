'use client';

import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  Panel,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Save, Play, Settings, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { NodePalette } from './NodePalette';
import { CustomNode } from './CustomNode';
import { ExecutionControls } from './ExecutionControls';
import { createWorkflow, updateWorkflow } from '@/lib/modules/ai-hub/workflows';
import type { automation_workflows } from '@prisma/client';

const nodeTypes = {
  custom: CustomNode,
};

interface WorkflowBuilderProps {
  workflow?: automation_workflows;
  organizationId: string;
  onSave?: (workflow: automation_workflows) => void;
}

export function WorkflowBuilder({ workflow, organizationId, onSave }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    workflow?.nodes as Node[] || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    workflow?.edges as Edge[] || []
  );
  const [name, setName] = useState(workflow?.name || '');
  const [description, setDescription] = useState(workflow?.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { fitView } = useReactFlow();

  useEffect(() => {
    setTimeout(() => fitView(), 100);
  }, [fitView]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeData = event.dataTransfer.getData('application/reactflow');
      if (!nodeData) return;

      const { type, label, category } = JSON.parse(nodeData);
      const position = {
        x: event.clientX - 150,
        y: event.clientY - 50,
      };

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label,
          nodeType: type,
          category,
          status: 'idle',
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    setIsSaving(true);
    try {
      const workflowData = {
        name,
        description: description || '',
        nodes: nodes as any,
        edges: edges as any,
        variables: {},
        isActive: true,
        version: '1.0.0',
        tags: [],
        organizationId,
      };

      let savedWorkflow;
      if (workflow) {
        savedWorkflow = await updateWorkflow({
          id: workflow.id,
          ...workflowData,
        });
        toast.success('Workflow updated successfully');
      } else {
        savedWorkflow = await createWorkflow(workflowData);
        toast.success('Workflow created successfully');
      }

      onSave?.(savedWorkflow);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const exportData = {
      name,
      description,
      nodes,
      edges,
      version: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name || 'workflow'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Workflow exported');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setName(data.name);
        setDescription(data.description);
        setNodes(data.nodes);
        setEdges(data.edges);
        toast.success('Workflow imported');
      } catch (error) {
        toast.error('Invalid workflow file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950">
      {/* Header */}
      <div className="glass-strong border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Workflow Name"
              className="text-xl font-bold bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-white/50"
            />
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2"
              >
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Workflow Description"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                  rows={2}
                />
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4" />
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Workflow'}
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex">
        <NodePalette />

        <div className="flex-1" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-transparent"
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} color="#ffffff" gap={20} size={1} />
            <Controls className="glass rounded-lg border border-white/20" />
            <MiniMap
              className="glass rounded-lg border border-white/20"
              nodeColor={(node) => {
                const category = (node.data as any).category;
                const colors: Record<string, string> = {
                  trigger: '#06b6d4',
                  agent: '#8b5cf6',
                  integration: '#10b981',
                  condition: '#f59e0b',
                  transform: '#3b82f6',
                  output: '#ec4899',
                };
                return colors[category] || '#6b7280';
              }}
            />

            <Panel position="bottom-right" className="mb-4 mr-4">
              <ExecutionControls
                workflowId={workflow?.id}
                organizationId={organizationId}
                nodes={nodes}
                edges={edges}
              />
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
