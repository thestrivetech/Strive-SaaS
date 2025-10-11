'use client';

import { EnhancedCard, CardContent, CardHeader, CardTitle } from '@/components/shared/dashboard/EnhancedCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, GitBranch, Bot, Users, Store, Plug } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      label: 'New Workflow',
      href: '/real-estate/ai-hub/workflows/new',
      icon: GitBranch,
      color: 'text-cyan-500',
    },
    {
      label: 'New Agent',
      href: '/real-estate/ai-hub/agents/new',
      icon: Bot,
      color: 'text-purple-500',
    },
    {
      label: 'New Team',
      href: '/real-estate/ai-hub/teams/new',
      icon: Users,
      color: 'text-green-500',
    },
    {
      label: 'Browse Templates',
      href: '/real-estate/ai-hub/marketplace',
      icon: Store,
      color: 'text-orange-500',
    },
    {
      label: 'Add Integration',
      href: '/real-estate/ai-hub/integrations',
      icon: Plug,
      color: 'text-blue-500',
    },
  ];

  return (
    <EnhancedCard glassEffect="strong" neonBorder="orange" hoverEffect={false}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          <CardTitle>Quick Actions</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link href={action.href}>
                  <Icon className={`w-4 h-4 mr-2 ${action.color}`} />
                  {action.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </EnhancedCard>
  );
}
