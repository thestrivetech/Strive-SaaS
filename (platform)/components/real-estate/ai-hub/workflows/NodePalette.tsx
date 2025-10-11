'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Bot,
  Link2,
  GitBranch,
  Wand2,
  Send,
  Search,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NodeType {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: React.ReactNode;
}

const nodeCategories = {
  trigger: {
    label: 'Triggers',
    icon: <Zap className="w-4 h-4" />,
    color: '#06b6d4',
    nodes: [
      {
        id: 'webhook',
        label: 'Webhook',
        description: 'Trigger on HTTP request',
        category: 'trigger',
        icon: <Link2 className="w-4 h-4" />,
      },
      {
        id: 'schedule',
        label: 'Schedule',
        description: 'Run on schedule (cron)',
        category: 'trigger',
        icon: <Zap className="w-4 h-4" />,
      },
      {
        id: 'manual',
        label: 'Manual',
        description: 'Trigger manually',
        category: 'trigger',
        icon: <Zap className="w-4 h-4" />,
      },
    ],
  },
  agent: {
    label: 'AI Agents',
    icon: <Bot className="w-4 h-4" />,
    color: '#8b5cf6',
    nodes: [
      {
        id: 'single-agent',
        label: 'Single Agent',
        description: 'Execute single AI agent task',
        category: 'agent',
        icon: <Bot className="w-4 h-4" />,
      },
      {
        id: 'agent-team',
        label: 'Agent Team',
        description: 'Execute multi-agent team task',
        category: 'agent',
        icon: <Bot className="w-4 h-4" />,
      },
    ],
  },
  integration: {
    label: 'Integrations',
    icon: <Link2 className="w-4 h-4" />,
    color: '#10b981',
    nodes: [
      {
        id: 'api-call',
        label: 'API Call',
        description: 'Make HTTP API request',
        category: 'integration',
        icon: <Link2 className="w-4 h-4" />,
      },
      {
        id: 'database',
        label: 'Database',
        description: 'Query database',
        category: 'integration',
        icon: <Link2 className="w-4 h-4" />,
      },
    ],
  },
  condition: {
    label: 'Logic',
    icon: <GitBranch className="w-4 h-4" />,
    color: '#f59e0b',
    nodes: [
      {
        id: 'if-else',
        label: 'If/Else',
        description: 'Conditional branching',
        category: 'condition',
        icon: <GitBranch className="w-4 h-4" />,
      },
      {
        id: 'switch',
        label: 'Switch',
        description: 'Multiple conditions',
        category: 'condition',
        icon: <GitBranch className="w-4 h-4" />,
      },
    ],
  },
  transform: {
    label: 'Transform',
    icon: <Wand2 className="w-4 h-4" />,
    color: '#3b82f6',
    nodes: [
      {
        id: 'map',
        label: 'Map',
        description: 'Transform data',
        category: 'transform',
        icon: <Wand2 className="w-4 h-4" />,
      },
      {
        id: 'filter',
        label: 'Filter',
        description: 'Filter data',
        category: 'transform',
        icon: <Wand2 className="w-4 h-4" />,
      },
    ],
  },
  output: {
    label: 'Output',
    icon: <Send className="w-4 h-4" />,
    color: '#ec4899',
    nodes: [
      {
        id: 'response',
        label: 'Response',
        description: 'Return response',
        category: 'output',
        icon: <Send className="w-4 h-4" />,
      },
      {
        id: 'notification',
        label: 'Notification',
        description: 'Send notification',
        category: 'output',
        icon: <Send className="w-4 h-4" />,
      },
    ],
  },
};

export function NodePalette() {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(nodeCategories))
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const onDragStart = (event: React.DragEvent, node: NodeType) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(node));
  };

  const filteredCategories = Object.entries(nodeCategories).map(([key, category]) => ({
    key,
    ...category,
    nodes: category.nodes.filter(
      (node) =>
        node.label.toLowerCase().includes(search.toLowerCase()) ||
        node.description.toLowerCase().includes(search.toLowerCase())
    ),
  }));

  return (
    <div className="w-80 glass-strong border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">Node Palette</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/50"
          />
        </div>
      </div>

      {/* Node List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredCategories.map(({ key, label, icon, color, nodes }) => (
            <div key={key}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(key)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-white"
              >
                <div className="flex items-center gap-2">
                  <span style={{ color }}>{icon}</span>
                  <span className="font-medium">{label}</span>
                  <span className="text-xs text-white/50">({nodes.length})</span>
                </div>
                {expandedCategories.has(key) ? (
                  <ChevronDown className="w-4 h-4 text-white/50" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white/50" />
                )}
              </button>

              {/* Nodes */}
              {expandedCategories.has(key) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-2"
                >
                  {nodes.map((node) => (
                    <motion.div
                      key={node.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, node)}
                      whileHover={{ x: 4 }}
                      className="p-3 rounded-lg glass cursor-move border border-white/10 hover:border-white/30 transition-all"
                      style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: color,
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span style={{ color }}>{node.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm">{node.label}</div>
                          <div className="text-xs text-white/60 mt-1">{node.description}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {nodes.length === 0 && (
                    <div className="text-xs text-white/50 text-center py-2">No nodes found</div>
                  )}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
