import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/dashboard/EnhancedCard';
import { getFeaturedTemplates, getTemplateStats } from '@/lib/modules/ai-hub/templates/queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Template Marketplace | AI Hub',
  description: 'Browse and install workflow templates',
};

export default async function MarketplacePage() {
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
        <FeaturedTemplatesSection />
      </Suspense>
    </div>
  );
}

async function HeroSectionWrapper({ user }: { user: any }) {
  const templateStats = await getTemplateStats();

  const stats = [
    {
      label: 'Total Templates',
      value: templateStats.total.toString(),
      icon: 'projects' as const,
    },
    {
      label: 'Featured',
      value: templateStats.featured.toString(),
      icon: 'tasks' as const,
    },
    {
      label: 'Avg Rating',
      value: templateStats.avgRating.toFixed(1),
      icon: 'trend' as const,
    },
    {
      label: 'Categories',
      value: '8',
      icon: 'customers' as const,
    },
  ];

  return (
    <ModuleHeroSection
      user={user}
      moduleName="Template Marketplace"
      moduleDescription="Browse and install pre-built workflow templates"
      stats={stats}
    />
  );
}

async function FeaturedTemplatesSection() {
  const templates = await getFeaturedTemplates(6);

  return (
    <EnhancedCard glassEffect="strong" neonBorder="cyan" hoverEffect={false}>
      <CardHeader>
        <CardTitle>Featured Templates</CardTitle>
        <CardDescription>Popular workflow templates ready to use</CardDescription>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No templates available yet.</p>
            <p className="text-sm mt-2">Check back soon for pre-built workflow templates!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <EnhancedCard key={template.id} glassEffect="medium" neonBorder="purple" hoverEffect={true}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {template.category}
                      </Badge>
                    </div>
                    <div className="text-2xl">{template.icon || '🚀'}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{template.rating || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Zap className="w-4 h-4" />
                      <span>{template.usage_count || 0} uses</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Badge variant="outline" className="text-xs">
                      {template.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.estimated_time}m
                    </Badge>
                  </div>

                  <Button asChild className="w-full" variant="default">
                    <Link href={`/real-estate/ai-hub/workflows/new?template=${template.id}`}>
                      Use Template
                    </Link>
                  </Button>
                </CardContent>
              </EnhancedCard>
            ))}
          </div>
        )}
      </CardContent>
    </EnhancedCard>
  );
}
