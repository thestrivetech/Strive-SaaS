'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import {
  Zap,
  Bot,
  Link2,
  GitBranch,
  Wand2,
  Send,
  Trash2,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const categoryConfig: Record<
  string,
  { color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  trigger: {
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.1)',
    border: 'rgba(6, 182, 212, 0.5)',
    icon: <Zap className="w-4 h-4" />,
  },
  agent: {
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(139, 92, 246, 0.5)',
    icon: <Bot className="w-4 h-4" />,
  },
  integration: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.5)',
    icon: <Link2 className="w-4 h-4" />,
  },
  condition: {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.5)',
    icon: <GitBranch className="w-4 h-4" />,
  },
  transform: {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.5)',
    icon: <Wand2 className="w-4 h-4" />,
  },
  output: {
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.1)',
    border: 'rgba(236, 72, 153, 0.5)',
    icon: <Send className="w-4 h-4" />,
  },
};

const statusIcons = {
  idle: null,
  running: <Clock className="w-4 h-4 text-blue-400 animate-spin" />,
  success: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  error: <XCircle className="w-4 h-4 text-red-400" />,
};

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  const category = data.category || 'trigger';
  const config = categoryConfig[category] || categoryConfig.trigger;
  const status = data.status || 'idle';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.05 }}
      className="relative"
    >
      {/* Input Handle */}
      {category !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-white/50 !border-2"
          style={{ borderColor: config.color }}
        />
      )}

      {/* Node Body */}
      <div
        className="px-4 py-3 rounded-lg min-w-[200px] backdrop-blur-md transition-all"
        style={{
          background: config.bg,
          border: `2px solid ${selected ? config.color : config.border}`,
          boxShadow: selected
            ? `0 0 20px ${config.color}40, inset 0 0 20px ${config.color}20`
            : `0 0 10px ${config.color}20`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span style={{ color: config.color }}>{config.icon}</span>
            <span className="font-semibold text-white text-sm">{data.label}</span>
          </div>
          {statusIcons[status as keyof typeof statusIcons]}
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-xs text-white/60 mb-2">{data.description}</p>
        )}

        {/* Actions */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 mt-2 pt-2 border-t border-white/10"
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-white/60 hover:text-white hover:bg-white/10"
            >
              <Settings className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-white/60 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </motion.div>
        )}

        {/* Execution Progress */}
        {status === 'running' && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-0 left-0 h-1 rounded-b-lg"
            style={{ backgroundColor: config.color }}
          />
        )}
      </div>

      {/* Output Handle */}
      {category !== 'output' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-white/50 !border-2"
          style={{ borderColor: config.color }}
        />
      )}
    </motion.div>
  );
});

CustomNode.displayName = 'CustomNode';
