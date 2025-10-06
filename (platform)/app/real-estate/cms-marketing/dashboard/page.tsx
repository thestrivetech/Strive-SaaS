import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, FileText, BarChart3, Mail, Globe, Calendar } from 'lucide-react';

/**
 * CMS & Marketing Module Dashboard
 *
 * Main dashboard for Content Management & Marketing features
 * - Content creation and management
 * - Marketing campaigns
 * - Analytics and tracking
 * - Email marketing
 * - Social media integration
 *
 * @protected - Requires authentication
 */
export default async function CMSMarketingDashboardPage() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const organizationId = user.organization_members[0]?.organization_id;

  if (!organizationId) {
    redirect('/onboarding/organization');
  }

  // Placeholder features for CMS & Marketing module
  const upcomingFeatures = [
    {
      icon: FileText,
      title: 'Content Management',
      description: 'Create and manage website content, blog posts, and landing pages',
      status: 'Planned',
    },
    {
      icon: Megaphone,
      title: 'Marketing Campaigns',
      description: 'Design and launch multi-channel marketing campaigns',
      status: 'Planned',
    },
    {
      icon: Mail,
      title: 'Email Marketing',
      description: 'Build email templates, manage lists, and track campaign performance',
      status: 'Planned',
    },
    {
      icon: Globe,
      title: 'Social Media',
      description: 'Schedule posts, manage multiple platforms, and track engagement',
      status: 'Planned',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Tracking',
      description: 'Track website analytics, conversion rates, and marketing ROI',
      status: 'Planned',
    },
    {
      icon: Calendar,
      title: 'Content Calendar',
      description: 'Plan and schedule content across all marketing channels',
      status: 'Planned',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CMS & Marketing</h1>
          <p className="text-muted-foreground">
            Manage your content and marketing campaigns
          </p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-dashed border-2 bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            The CMS & Marketing module is currently under development.
            Check back soon for powerful content management and marketing automation tools.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Upcoming Features Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {upcomingFeatures.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <feature.icon className="h-8 w-8 text-primary" />
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {feature.status}
                </span>
              </div>
              <CardTitle className="mt-4">{feature.title}</CardTitle>
              <CardDescription className="mt-2">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
