import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getToolLimit } from '@/lib/auth/rbac';
import {
  Wrench,
  Calculator,
  FileText,
  Mail,
  Calendar,
  Link,
  QrCode,
  Image as ImageIcon,
  Database,
  Clock,
  TrendingUp,
  Lock,
} from 'lucide-react';

export default async function ToolsPage() {
  const user = await getCurrentUser();
  const toolLimit = getToolLimit(user?.subscriptionTier || 'FREE');

  const tools = [
    {
      title: 'ROI Calculator',
      description: 'Calculate return on investment',
      icon: Calculator,
      tier: 'BASIC',
      status: 'Coming Soon',
      category: 'Finance',
    },
    {
      title: 'Invoice Generator',
      description: 'Create professional invoices',
      icon: FileText,
      tier: 'BASIC',
      status: 'Coming Soon',
      category: 'Finance',
    },
    {
      title: 'Email Templates',
      description: 'Pre-built email templates',
      icon: Mail,
      tier: 'BASIC',
      status: 'Coming Soon',
      category: 'Communication',
    },
    {
      title: 'Meeting Scheduler',
      description: 'Schedule and manage meetings',
      icon: Calendar,
      tier: 'PRO',
      status: 'Coming Soon',
      category: 'Productivity',
    },
    {
      title: 'Link Shortener',
      description: 'Create short, trackable links',
      icon: Link,
      tier: 'PRO',
      status: 'Coming Soon',
      category: 'Marketing',
    },
    {
      title: 'QR Generator',
      description: 'Generate custom QR codes',
      icon: QrCode,
      tier: 'PRO',
      status: 'Coming Soon',
      category: 'Marketing',
    },
    {
      title: 'Image Optimizer',
      description: 'Compress and optimize images',
      icon: ImageIcon,
      tier: 'PRO',
      status: 'Coming Soon',
      category: 'Media',
    },
    {
      title: 'Data Export',
      description: 'Export data in multiple formats',
      icon: Database,
      tier: 'PRO',
      status: 'Coming Soon',
      category: 'Data',
    },
    {
      title: 'Time Tracker',
      description: 'Track time spent on projects',
      icon: Clock,
      tier: 'ENTERPRISE',
      status: 'Coming Soon',
      category: 'Productivity',
    },
    {
      title: 'Analytics Dashboard',
      description: 'Advanced analytics and reporting',
      icon: TrendingUp,
      tier: 'ENTERPRISE',
      status: 'Coming Soon',
      category: 'Analytics',
    },
  ];

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'BASIC':
        return 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20';
      case 'PRO':
        return 'bg-purple-500/10 text-purple-700 hover:bg-purple-500/20';
      case 'ENTERPRISE':
        return 'bg-orange-500/10 text-orange-700 hover:bg-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 hover:bg-gray-500/20';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'BASIC':
        return 'Basic';
      case 'PRO':
        return 'Pro';
      case 'ENTERPRISE':
        return 'Enterprise';
      default:
        return 'Free';
    }
  };

  const canAccessTool = (toolTier: string) => {
    if (toolLimit === Infinity) return true;
    if (toolLimit === 0) return false;

    const tierLevels: Record<string, number> = {
      'BASIC': 1,
      'PRO': 2,
      'ENTERPRISE': 3,
    };

    const userTierLevel = user?.subscriptionTier === 'BASIC' ? 1 :
                          user?.subscriptionTier === 'PRO' ? 2 :
                          user?.subscriptionTier === 'ENTERPRISE' ? 3 : 0;

    return tierLevels[toolTier] <= userTierLevel;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wrench className="h-8 w-8 text-primary" />
            Business Tools
          </h1>
          <p className="text-muted-foreground">
            Powerful tools to streamline your workflow
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">Your Plan</p>
          <p className="text-2xl font-bold text-primary">
            {user?.subscriptionTier || 'FREE'}
          </p>
          <p className="text-xs text-muted-foreground">
            {toolLimit === Infinity ? 'Unlimited' : toolLimit === 0 ? 'No' : toolLimit} tools available
          </p>
        </div>
      </div>

      {toolLimit === 0 && (
        <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Upgrade to Access Tools
            </CardTitle>
            <CardDescription>
              Tools are available starting from Tier 1 subscription. Upgrade now to unlock powerful business tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              View Pricing Plans
            </Button>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const hasAccess = canAccessTool(tool.tier);

            return (
              <Card
                key={tool.title}
                className={`relative overflow-hidden ${!hasAccess ? 'opacity-60' : ''}`}
              >
                {!hasAccess && (
                  <div className="absolute top-4 right-4 z-10">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {tool.status}
                      </Badge>
                      <Badge variant="outline" className={getTierBadgeColor(tool.tier)}>
                        {getTierName(tool.tier)}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {tool.category}
                    </Badge>
                    {hasAccess ? (
                      <Button variant="outline" size="sm" disabled>
                        Launch
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Need More Tools?</CardTitle>
          <CardDescription>
            Upgrade your subscription to unlock additional tools and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="font-semibold">Tier 1 - $299/mo</div>
                <div className="text-sm text-muted-foreground">3 essential tools</div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">Tier 2 - $699/mo</div>
                <div className="text-sm text-muted-foreground">10 advanced tools</div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">Tier 3 - Custom</div>
                <div className="text-sm text-muted-foreground">Unlimited tools + priority support</div>
              </div>
            </div>
            <Button className="w-full md:w-auto">
              Compare Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}