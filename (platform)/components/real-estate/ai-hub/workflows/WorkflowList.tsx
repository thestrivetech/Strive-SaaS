'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WorkflowCard } from './WorkflowCard';
import type { automation_workflows } from '@prisma/client';

interface WorkflowWithDetails extends automation_workflows {
  creator?: {
    id: string;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  executions?: Array<{
    id: string;
    status: string;
    started_at: Date;
  }>;
}

interface WorkflowListProps {
  workflows: WorkflowWithDetails[];
  organizationId: string;
  onCreateNew: () => void;
}

export function WorkflowList({ workflows, organizationId, onCreateNew }: WorkflowListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'name'>('created');

  // Filter and sort workflows
  const filteredWorkflows = workflows
    .filter((workflow) => {
      const matchesSearch =
        workflow.name.toLowerCase().includes(search.toLowerCase()) ||
        workflow.description?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && workflow.is_active) ||
        (statusFilter === 'inactive' && !workflow.is_active);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'updated') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass-strong rounded-xl p-4 border border-white/10">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workflows..."
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/50"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Newest First</SelectItem>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>

          {/* Create Button */}
          <Button
            onClick={onCreateNew}
            className="bg-primary hover:bg-primary/90 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-xl p-12 border border-white/10 text-center"
        >
          <div className="text-white/60 mb-4">
            {search || statusFilter !== 'all' ? (
              <p>No workflows found matching your filters</p>
            ) : (
              <p>No workflows yet. Create your first workflow to get started!</p>
            )}
          </div>
          {!search && statusFilter === 'all' && (
            <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <WorkflowCard workflow={workflow} organizationId={organizationId} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
