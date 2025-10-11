import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/dashboard/EnhancedCard';
import { getIntegrations, getIntegrationStats } from '@/lib/modules/ai-hub/integrations/queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plug, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Integrations | AI Hub',
  description: 'Manage external service connections',
};

export default async function IntegrationsPage() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const organizationId = user.organization_members[0]?.organization_id;
  if (!organizationId) {
    redirect('/onboarding/organization');
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<div>Loading...</div>}>
        <HeroSectionWrapper user={user} />
      </Suspense>

      <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
        <IntegrationsListSection />
      </Suspense>
    </div>
  );
}

async function HeroSectionWrapper({ user }: { user: any }) {
  const integrationStats = await getIntegrationStats();

  const stats = [
    {
      label: 'Total Integrations',
      value: integrationStats.total.toString(),
      icon: 'projects' as const,
    },
    {
      label: 'Connected',
      value: integrationStats.connected.toString(),
      icon: 'check' as const,
    },
    {
      label: 'Disconnected',
      value: integrationStats.disconnected.toString(),
      icon: 'tasks' as const,
    },
    {
      label: 'Errors',
      value: integrationStats.error.toString(),
      icon: 'customers' as const,
    },
  ];

  return (
    <ModuleHeroSection
      user={user}
      moduleName="Integrations"
      moduleDescription="Connect external services to your AI Hub workflows"
      stats={stats}
    />
  );
}

async function IntegrationsListSection() {
  const integrations = await getIntegrations();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'DISCONNECTED':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Plug className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      CONNECTED: 'bg-green-500/10 text-green-500',
      DISCONNECTED: 'bg-gray-500/10 text-gray-500',
      ERROR: 'bg-red-500/10 text-red-500',
      TESTING: 'bg-yellow-500/10 text-yellow-500',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-500';
  };

  return (
    <EnhancedCard glassEffect="strong" neonBorder="purple" hoverEffect={false}>
      <CardHeader>
        <CardTitle>Your Integrations</CardTitle>
        <CardDescription>Manage connected services and add new integrations</CardDescription>
      </CardHeader>
      <CardContent>
        {integrations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Plug className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No integrations configured yet.</p>
            <Button className="mt-4" variant="default">
              Add Integration
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {integrations.map((integration) => (
              <EnhancedCard key={integration.id} glassEffect="medium" neonBorder="cyan" hoverEffect={true}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(integration.status)}
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{integration.provider}</p>
                      </div>
                    </div>
                    <Badge className={getStatusBadge(integration.status)}>
                      {integration.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Last tested: {integration.last_tested ? new Date(integration.last_tested).toLocaleDateString() : 'Never'}
                    </p>
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </EnhancedCard>
            ))}
          </div>
        )}
      </CardContent>
    </EnhancedCard>
  );
}
