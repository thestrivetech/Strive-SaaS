import { Suspense } from 'react';
import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { SpendingTrends } from '@/components/real-estate/expense-tax/analytics/SpendingTrends';
import { MonthlyComparison } from '@/components/real-estate/expense-tax/analytics/MonthlyComparison';
import { CategoryTrends } from '@/components/real-estate/expense-tax/analytics/CategoryTrends';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardHeader, CardTitle, CardContent } from '@/components/shared/dashboard/EnhancedCard';
import { HeroSkeleton } from '@/components/shared/dashboard/skeletons';

/**
 * Expense Analytics Page
 *
 * Comprehensive analytics dashboard for expense tracking with:
 * - ModuleHeroSection with analytics KPI stats
 * - Spending trends over time (area chart)
 * - Month-over-month comparison (bar chart)
 * - Category trends analysis (multi-line chart)
 * - Responsive 2-column layout
 * - Glass effects and neon borders
 * - Framer Motion animations
 *
 * @protected - Requires authentication and organization membership
 * @route /real-estate/expense-tax/analytics
 */
export const metadata: Metadata = {
  title: 'Expense Analytics | Strive Platform',
  description: 'Comprehensive expense analytics and spending trends',
};

export default async function ExpenseAnalyticsPage() {
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
      {/* Hero Section with Analytics KPIs */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSectionWrapper user={user} />
      </Suspense>

      {/* Main Content: 2-Column Layout (Desktop) / Stacked (Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Spending Trends & Monthly Comparison */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spending Trends Chart */}
          <EnhancedCard glassEffect="strong" neonBorder="cyan" hoverEffect={true}>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                }
              >
                <SpendingTrends />
              </Suspense>
            </CardContent>
          </EnhancedCard>

          {/* Monthly Comparison Chart */}
          <EnhancedCard glassEffect="strong" neonBorder="purple" hoverEffect={true}>
            <CardHeader>
              <CardTitle>Month-over-Month Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                }
              >
                <MonthlyComparison />
              </Suspense>
            </CardContent>
          </EnhancedCard>
        </div>

        {/* Right Column: Category Trends */}
        <div className="lg:col-span-1 space-y-6">
          <EnhancedCard glassEffect="strong" neonBorder="orange" hoverEffect={true}>
            <CardHeader>
              <CardTitle>Category Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                }
              >
                <CategoryTrends />
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
 * Fetches analytics summary data and passes to ModuleHeroSection
 */
async function HeroSectionWrapper({
  user,
}: {
  user: Awaited<ReturnType<typeof getCurrentUser>>;
}) {
  // Placeholder data - Expense & Tax is a skeleton module (no database tables yet)
  const stats = [
    {
      label: 'Total Analyzed',
      value: '$0',
      icon: 'revenue' as const,
    },
    {
      label: 'YTD Growth',
      value: '0%',
      icon: 'projects' as const,
    },
    {
      label: 'Highest Category',
      value: 'N/A',
      icon: 'customers' as const,
    },
    {
      label: 'Avg Monthly',
      value: '$0',
      icon: 'tasks' as const,
    },
  ];

  // TypeScript guard: user is guaranteed non-null due to redirect above
  if (!user) {
    return null;
  }

  return (
    <ModuleHeroSection
      user={user}
      moduleName="Expense Analytics"
      moduleDescription="Comprehensive analytics and spending insights"
      stats={stats}
    />
  );
}
