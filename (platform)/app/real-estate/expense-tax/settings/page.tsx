import { Suspense } from 'react';
import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { motion } from 'framer-motion';
import { CategoryManager } from '@/components/real-estate/expense-tax/settings/CategoryManager';
import { ExpensePreferences } from '@/components/real-estate/expense-tax/settings/ExpensePreferences';
import { TaxConfiguration } from '@/components/real-estate/expense-tax/settings/TaxConfiguration';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardHeader, CardTitle, CardContent } from '@/components/shared/dashboard/EnhancedCard';
import { HeroSkeleton } from '@/components/shared/dashboard/skeletons';

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
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
      </motion.div>
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
  // Mock settings summary data (replace with actual API call in future)
  // API endpoint: /api/v1/expenses/settings/summary
  const mockSettingsSummary = {
    totalCategories: 18,
    customCategories: 6,
    taxConfigurations: 3,
    lastUpdated: '2 days ago',
  };

  const stats = [
    {
      label: 'Total Categories',
      value: mockSettingsSummary.totalCategories,
      icon: 'tasks' as const,
    },
    {
      label: 'Custom Categories',
      value: mockSettingsSummary.customCategories,
      icon: 'customers' as const,
    },
    {
      label: 'Tax Configurations',
      value: mockSettingsSummary.taxConfigurations,
      icon: 'projects' as const,
    },
    {
      label: 'Last Updated',
      value: mockSettingsSummary.lastUpdated,
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
