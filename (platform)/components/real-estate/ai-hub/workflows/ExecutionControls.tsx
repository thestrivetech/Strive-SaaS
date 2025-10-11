'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, StopCircle, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { executeWorkflow } from '@/lib/modules/ai-hub/workflows';
import type { Node, Edge } from 'reactflow';

interface ExecutionControlsProps {
  workflowId?: string;
  organizationId: string;
  nodes: Node[];
  edges: Edge[];
}

export function ExecutionControls({
  workflowId,
  organizationId,
  nodes,
  edges,
}: ExecutionControlsProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>(
    'idle'
  );
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const handleExecute = async () => {
    if (!workflowId) {
      toast.error('Please save the workflow before executing');
      return;
    }

    if (nodes.length === 0) {
      toast.error('Add at least one node to the workflow');
      return;
    }

    setIsExecuting(true);
    setExecutionStatus('running');
    setExecutionLogs([]);
    setShowLogs(true);

    try {
      const log = (message: string) => {
        setExecutionLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
      };

      log('Starting workflow execution...');
      log(`Workflow ID: ${workflowId}`);
      log(`Organization: ${organizationId}`);
      log(`Nodes: ${nodes.length}, Edges: ${edges.length}`);

      const execution = await executeWorkflow({
        workflowId,
        input: {},
      });

      log(`Execution ID: ${execution.id}`);
      log(`Status: ${execution.status}`);

      setExecutionStatus('success');
      toast.success('Workflow executed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Execution failed';
      setExecutionLogs((prev) => [...prev, `[ERROR] ${errorMessage}`]);
      setExecutionStatus('error');
      toast.error(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStop = () => {
    setIsExecuting(false);
    setExecutionStatus('idle');
    toast.info('Execution stopped');
  };

  const statusColors = {
    idle: 'bg-gray-500',
    running: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  return (
    <div className="space-y-2">
      {/* Control Buttons */}
      <div className="glass-strong rounded-lg p-3 border border-white/20">
        <div className="flex items-center gap-2">
          {isExecuting ? (
            <Button
              onClick={handleStop}
              size="sm"
              variant="destructive"
              className="bg-red-500 hover:bg-red-600"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              Stop
            </Button>
          ) : (
            <Button
              onClick={handleExecute}
              size="sm"
              disabled={!workflowId}
              className="bg-green-500 hover:bg-green-600"
            >
              <Play className="w-4 h-4 mr-2" />
              Execute
            </Button>
          )}

          <Badge className={`${statusColors[executionStatus]} text-white border-none`}>
            {executionStatus === 'running' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            {executionStatus.toUpperCase()}
          </Badge>

          {executionLogs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogs(!showLogs)}
              className="text-white hover:bg-white/10 ml-auto"
            >
              {showLogs ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Execution Logs */}
      <AnimatePresence>
        {showLogs && executionLogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="glass-strong rounded-lg p-3 border border-white/20 max-w-md"
          >
            <div className="text-xs font-semibold text-white/80 mb-2 flex items-center justify-between">
              <span>Execution Logs</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExecutionLogs([])}
                className="h-5 px-2 text-white/60 hover:text-white"
              >
                Clear
              </Button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto dashboard-scrollbar">
              {executionLogs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`text-xs font-mono ${
                    log.includes('[ERROR]')
                      ? 'text-red-400'
                      : log.includes('[SUCCESS]')
                        ? 'text-green-400'
                        : 'text-white/70'
                  }`}
                >
                  {log}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
