'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { REIDCard, REIDCardHeader, REIDCardContent } from '../shared/REIDCard';
import { AlertBadge } from '../shared/AlertBadge';
import { Button } from '@/components/ui/button';
import { acknowledgeAlertTrigger } from '@/lib/modules/reid/alerts/actions';
import { AlertSeverity } from '@prisma/client';

export function AlertTriggersList() {
  const queryClient = useQueryClient();

  const { data: triggers } = useQuery({
    queryKey: ['alert-triggers'],
    queryFn: async () => {
      const response = await fetch('/api/v1/reid/alerts/triggers');
      return response.json();
    }
  });

  const acknowledgeMutation = useMutation({
    mutationFn: ({ triggerId, userId }: { triggerId: string; userId: string }) =>
      acknowledgeAlertTrigger(triggerId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-triggers'] });
    }
  });

  const unacknowledgedTriggers = triggers?.triggers?.filter((t: any) => !t.acknowledged) || [];

  return (
    <REIDCard>
      <REIDCardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Recent Triggers</h3>
        </div>
      </REIDCardHeader>

      <REIDCardContent>
        {unacknowledgedTriggers.length === 0 ? (
          <div className="text-slate-400 text-center py-8">
            No unacknowledged alert triggers
          </div>
        ) : (
          <div className="space-y-3">
            {unacknowledgedTriggers.map((trigger: any) => (
              <AlertBadge key={trigger.id} severity={trigger.severity as AlertSeverity}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-white">{trigger.alert?.name}</div>
                    <div className="text-sm text-slate-300 mt-1">{trigger.message}</div>
                    <div className="text-xs text-slate-400 mt-2">
                      {new Date(trigger.triggered_at).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => acknowledgeMutation.mutate({
                      triggerId: trigger.id,
                      userId: '' // Will be set by server
                    })}
                    className="text-green-400 hover:text-green-300"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </AlertBadge>
            ))}
          </div>
        )}
      </REIDCardContent>
    </REIDCard>
  );
}
