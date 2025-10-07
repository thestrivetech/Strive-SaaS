'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Flag, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FeatureFlagForm } from '@/components/features/admin/feature-flag-form';

export default function FeatureFlagsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<any>(null);

  // Fetch feature flags
  const { data: flags, isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const response = await fetch('/api/v1/admin/feature-flags');
      if (!response.ok) throw new Error('Failed to fetch flags');
      return response.json();
    },
  });

  // Toggle flag mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const response = await fetch('/api/v1/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isEnabled }),
      });
      if (!response.ok) throw new Error('Failed to update flag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast({
        title: 'Feature flag updated',
        description: 'The flag has been successfully updated.',
      });
    },
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-muted-foreground">
            Control feature rollouts and A/B testing
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Flag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
            </DialogHeader>
            <FeatureFlagForm
              onSuccess={() => {
                setIsCreateOpen(false);
                queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Flags Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          flags?.map((flag: any) => (
            <Card key={flag.id} className="hover-elevate">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Flag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{flag.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {flag.description || 'No description'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant={flag.environment === 'PRODUCTION' ? 'default' : 'secondary'}>
                      {flag.environment}
                    </Badge>
                    <Switch
                      checked={flag.isEnabled}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({ id: flag.id, isEnabled: checked })
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Rollout</p>
                    <p className="font-medium">{flag.rolloutPercent}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Target Tiers</p>
                    <p className="font-medium">
                      {flag.targetTiers.length > 0
                        ? flag.targetTiers.join(', ')
                        : 'All'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {new Date(flag.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Updated</p>
                    <p className="font-medium">
                      {new Date(flag.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingFlag(flag)}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      {editingFlag && (
        <Dialog open={!!editingFlag} onOpenChange={() => setEditingFlag(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Feature Flag</DialogTitle>
            </DialogHeader>
            <FeatureFlagForm
              initialData={editingFlag}
              onSuccess={() => {
                setEditingFlag(null);
                queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
