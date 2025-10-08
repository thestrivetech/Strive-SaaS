'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Megaphone, Image, BarChart3, Calendar, Upload } from 'lucide-react';

/**
 * Quick Actions Component
 *
 * Displays a grid of common action cards for quick navigation
 * Client component for hover interactions
 */
export function QuickActions() {
  const actions = [
    {
      icon: FileText,
      title: 'New Article',
      description: 'Create blog post or page',
      href: '/real-estate/cms-marketing/content/editor',
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      icon: Upload,
      title: 'Upload Media',
      description: 'Images, videos, files',
      href: '/real-estate/cms-marketing/media',
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      icon: Megaphone,
      title: 'Email Campaign',
      description: 'Create email campaign',
      href: '/real-estate/cms-marketing/content/campaigns/email/new',
      color: 'bg-green-500/10 text-green-600',
    },
    {
      icon: Calendar,
      title: 'Schedule Post',
      description: 'Schedule social media',
      href: '/real-estate/cms-marketing/content/campaigns/social/new',
      color: 'bg-orange-500/10 text-orange-600',
    },
    {
      icon: BarChart3,
      title: 'View Analytics',
      description: 'Content performance',
      href: '/real-estate/cms-marketing/analytics',
      color: 'bg-pink-500/10 text-pink-600',
    },
    {
      icon: FileText,
      title: 'Content Library',
      description: 'Manage all content',
      href: '/real-estate/cms-marketing/content',
      color: 'bg-cyan-500/10 text-cyan-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks to get you started</CardDescription>
      </CardHeader>
      <CardContent>
        <nav aria-label="Quick action shortcuts">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent transition-colors group min-h-[88px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus:outline-none"
                  aria-label={`${action.title}: ${action.description}`}
                >
                  <div className={`p-3 rounded-lg ${action.color} shrink-0`} aria-hidden="true">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {action.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </CardContent>
    </Card>
  );
}
