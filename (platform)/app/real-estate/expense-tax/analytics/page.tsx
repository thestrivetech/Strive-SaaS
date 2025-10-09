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
import { expensesProvider, categoriesProvider } from '@/lib/data';

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
  user: { id: string; name?: string | null; organization_members: Array<{ organization_id: string }> };
}) {
  const organizationId = user.organization_members[0]?.organization_id || '';

  // Fetch real data from providers
  const summary = await expensesProvider.getSummary(organizationId);
  const expenses = await expensesProvider.findMany(organizationId);
  const categories = await categoriesProvider.findAll(organizationId);

  // Calculate YTD growth (comparing to same period last year)
  const currentYear = new Date().getFullYear();
  const thisYearExpenses = expenses.filter(e =>
    new Date(e.date).getFullYear() === currentYear
  );
  const lastYearExpenses = expenses.filter(e =>
    new Date(e.date).getFullYear() === currentYear - 1
  );

  const thisYearTotal = thisYearExpenses.reduce((sum, e) => sum + e.amount, 0);
  const lastYearTotal = lastYearExpenses.reduce((sum, e) => sum + e.amount, 0);
  const ytdGrowth = lastYearTotal > 0
    ? ((thisYearTotal - lastYearTotal) / lastYearTotal) * 100
    : 0;

  // Find highest spending category
  const highestCategory = summary.byCategory[0]?.category || 'N/A';

  // Calculate average monthly spend
  const avgMonthly = Math.floor(thisYearTotal / (new Date().getMonth() + 1));

  const stats = [
    {
      label: 'Total Analyzed',
      value: `$${summary.totalExpenses.toLocaleString()}`,
      icon: 'revenue' as const,
    },
    {
      label: 'YTD Growth',
      value: `${ytdGrowth.toFixed(1)}%`,
      icon: 'projects' as const,
    },
    {
      label: 'Highest Category',
      value: highestCategory,
      icon: 'customers' as const,
    },
    {
      label: 'Avg Monthly',
      value: `$${avgMonthly.toLocaleString()}`,
      icon: 'tasks' as const,
    },
  ];

  return (
    <ModuleHeroSection
      user={user}
      moduleName="Expense Analytics"
      moduleDescription="Comprehensive analytics and spending insights"
      stats={stats}
    />
  );
}
