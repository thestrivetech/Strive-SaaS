'use client';

import { EnhancedCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/dashboard/EnhancedCard';
import { Bot, Circle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AgentStatusProps {
  totalAgents: number;
  activeAgents: number;
  idleAgents: number;
  busyAgents: number;
}

export function AgentStatus({
  totalAgents,
  activeAgents,
  idleAgents,
  busyAgents,
}: AgentStatusProps) {
  const statusData = [
    { label: 'Idle', count: idleAgents, color: 'text-green-500' },
    { label: 'Busy', count: busyAgents, color: 'text-yellow-500' },
    { label: 'Offline', count: totalAgents - activeAgents, color: 'text-gray-500' },
  ];

  return (
    <EnhancedCard glassEffect="strong" neonBorder="purple" hoverEffect={true}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <CardTitle>AI Agents</CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/real-estate/ai-hub/agents">Manage</Link>
          </Button>
        </div>
        <CardDescription>Agent status and performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-primary">{totalAgents}</div>
          <div className="text-sm text-muted-foreground">Total Agents</div>
        </div>

        <div className="space-y-3">
          {statusData.map((item) => (
            <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
              <div className="flex items-center gap-2">
                <Circle className={`w-3 h-3 fill-current ${item.color}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <span className="text-sm font-bold">{item.count}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Active</span>
            <span className="font-semibold text-primary">{activeAgents}</span>
          </div>
        </div>
      </CardContent>
    </EnhancedCard>
  );
}
