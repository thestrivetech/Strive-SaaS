import { Suspense } from 'react';
import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { CategoryManager } from '@/components/real-estate/expense-tax/settings/CategoryManager';
import { ExpensePreferences } from '@/components/real-estate/expense-tax/settings/ExpensePreferences';
import { TaxConfiguration } from '@/components/real-estate/expense-tax/settings/TaxConfiguration';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardHeader, CardTitle, CardContent } from '@/components/shared/dashboard/EnhancedCard';
import { HeroSkeleton } from '@/components/shared/dashboard/skeletons';
import { categoriesProvider, taxProvider } from '@/lib/data';

/**
 * Expense & Tax Settings Page
 *
 * Settings dashboard for expense module configuration with:
 * - ModuleHeroSection with settings KPI stats
 * - Category management (add, edit, delete, reorder)
 * - Tax configuration (rates, codes)
 * - Expense preferences (defaults, receipt rules)
 * - Responsive 2-column layout
 * - Glass effects and neon borders
 * - Framer Motion animations
 *
 * @protected - Requires authentication and organization membership
 * @route /real-estate/expense-tax/settings
 */
export const metadata: Metadata = {
  title: 'Expense Settings | Strive Platform',
  description: 'Configure expense categories and tax settings',
};

export default async function ExpenseSettingsPage() {
  // Require authentication
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Require organization membership
  const organizationId = user.organization_members[0]?.organization_id;

  if (!organizationId) {
    redirect('/onboarding/organization');
  }

  return (
    <div className="space-y-6">
      {/* Hero Section with Settings KPIs */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSectionWrapper user={user} />
      </Suspense>

      {/* Main Content: 2-Column Layout (Desktop) / Stacked (Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Category Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Manager */}
          <EnhancedCard glassEffect="strong" neonBorder="cyan" hoverEffect={false}>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                }
              >
                <CategoryManager organizationId={organizationId} />
              </Suspense>
            </CardContent>
          </EnhancedCard>

          {/* Tax Configuration */}
          <EnhancedCard glassEffect="strong" neonBorder="green" hoverEffect={false}>
            <CardHeader>
              <CardTitle>Tax Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                }
              >
                <TaxConfiguration organizationId={organizationId} />
              </Suspense>
            </CardContent>
          </EnhancedCard>
        </div>

        {/* Right Sidebar: Expense Preferences */}
        <div className="lg:col-span-1 space-y-6">
          <EnhancedCard glassEffect="strong" neonBorder="purple" hoverEffect={false}>
            <CardHeader>
              <CardTitle>Expense Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                }
              >
                <ExpensePreferences organizationId={organizationId} />
              </Suspense>
            </CardContent>
          </EnhancedCard>
        </div>
      </div>
    </div>
  );
}

/**
 * Hero Section Wrapper
 * Fetches settings summary data and passes to ModuleHeroSection
 */
async function HeroSectionWrapper({
  user,
}: {
  user: any; // TODO: Use proper UserWithOrganization type
}) {
  const organizationId = user.organization_members[0]?.organization_id || '';

  // Fetch real data from providers
  const categories = await categoriesProvider.findAll(organizationId);
  // Tax provider doesn't have findMany - get current year's estimates
  const currentYear = new Date().getFullYear();
  const yearSummary = await taxProvider.getYearSummary(organizationId, currentYear);
  const taxEstimates = yearSummary.quarters;

  // Calculate stats
  const totalCategories = categories.length;
  const customCategories = categories.filter(cat => cat.is_custom).length;
  const taxConfigurations = taxEstimates.length;

  // Find most recently updated item
  const allUpdates = [
    ...categories.map(c => new Date(c.updated_at)),
    ...taxEstimates.map(t => new Date(t.updated_at)),
  ].sort((a, b) => b.getTime() - a.getTime());

  const lastUpdate = allUpdates[0];
  const daysSinceUpdate = lastUpdate
    ? Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const lastUpdatedText = daysSinceUpdate === 0
    ? 'Today'
    : daysSinceUpdate === 1
    ? 'Yesterday'
    : `${daysSinceUpdate} days ago`;

  const stats = [
    {
      label: 'Total Categories',
      value: totalCategories.toString(),
      icon: 'tasks' as const,
    },
    {
      label: 'Custom Categories',
      value: customCategories.toString(),
      icon: 'customers' as const,
    },
    {
      label: 'Tax Configurations',
      value: taxConfigurations.toString(),
      icon: 'projects' as const,
    },
    {
      label: 'Last Updated',
      value: lastUpdatedText,
      icon: 'revenue' as const,
    },
  ];

  return (
    <ModuleHeroSection
      user={user}
      moduleName="Expense Settings"
      moduleDescription="Configure expense categories, tax settings, and preferences"
      stats={stats}
    />
  );
}
