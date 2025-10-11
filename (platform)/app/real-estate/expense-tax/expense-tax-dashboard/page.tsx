import { Suspense } from 'react';
import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { ExpenseTable } from '@/components/real-estate/expense-tax/tables/ExpenseTable';
import { TaxEstimateCard } from '@/components/real-estate/expense-tax/tax/TaxEstimateCard';
import { CategoryBreakdown } from '@/components/real-estate/expense-tax/charts/CategoryBreakdown';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardHeader, CardTitle, CardContent } from '@/components/shared/dashboard/EnhancedCard';
import { HeroSkeleton } from '@/components/shared/dashboard/skeletons';

/**
 * Expense & Tax Dashboard Page
 *
 * Complete dashboard for expense tracking and tax management with:
 * - ModuleHeroSection with integrated KPI stats
 * - Tax estimate calculator with adjustable rate
 * - Category breakdown chart (pie chart)
 * - Expense table with filtering and CRUD
 * - Responsive 2-column layout (sidebar on desktop)
 * - Glass effects and neon borders on all cards
 * - Framer Motion animations for page transitions
 *
 * @protected - Requires authentication and organization membership
 * @route /real-estate/expense-tax/dashboard
 */
export const metadata: Metadata = {
  title: 'Expense & Tax Dashboard | Strive Platform',
  description: 'Track expenses and maximize tax deductions',
};

export default async function ExpenseTaxDashboardPage() {
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
      {/* Hero Section with KPIs */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSectionWrapper user={user} organizationId={organizationId} />
      </Suspense>

      {/* Main Content: 2-Column Layout (Desktop) / Stacked (Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Category Breakdown & Expense Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Breakdown Chart */}
          <EnhancedCard glassEffect="strong" neonBorder="cyan" hoverEffect={true}>
            <CardHeader>
              <CardTitle>Expense Breakdown by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                }
              >
                <CategoryBreakdown />
              </Suspense>
            </CardContent>
          </EnhancedCard>

          {/* Expense Table */}
          <EnhancedCard glassEffect="strong" neonBorder="purple" hoverEffect={true}>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                }
              >
                <ExpenseTable />
              </Suspense>
            </CardContent>
          </EnhancedCard>
        </div>

        {/* Right Sidebar: Tax Estimate Card */}
        <div className="lg:col-span-1 space-y-6">
          <EnhancedCard glassEffect="strong" neonBorder="orange" hoverEffect={true}>
            <Suspense
              fallback={
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              }
            >
              <TaxEstimateCard />
            </Suspense>
          </EnhancedCard>
        </div>
      </div>
    </div>
  );
}

/**
 * Hero Section Wrapper
 * Fetches expense summary data and passes to ModuleHeroSection
 */
async function HeroSectionWrapper({
  user,
  organizationId,
}: {
  user: Awaited<ReturnType<typeof getCurrentUser>>;
  organizationId: string;
}) {
  // TypeScript guard: user is guaranteed non-null due to redirect above
  if (!user) {
    return null;
  }

  // Fetch real expense summary data from backend
  const { getExpenseSummary } = await import('@/lib/modules/expenses/expenses/queries');

  let summary;
  try {
    summary = await getExpenseSummary();
  } catch (error) {
    console.error('Failed to fetch expense summary:', error);
    // Fallback to zeros on error
    summary = {
      ytdTotal: 0,
      monthlyTotal: 0,
      deductibleTotal: 0,
      receiptCount: 0,
      totalCount: 0,
    };
  }

  // Format currency helper
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const stats = [
    {
      label: 'YTD Expenses',
      value: formatCurrency(summary.ytdTotal),
      icon: 'revenue' as const,
    },
    {
      label: 'Current Month',
      value: formatCurrency(summary.monthlyTotal),
      icon: 'customers' as const,
    },
    {
      label: 'Tax Deductible',
      value: formatCurrency(summary.deductibleTotal),
      icon: 'projects' as const,
    },
    {
      label: 'Receipts',
      value: summary.receiptCount.toString(),
      icon: 'tasks' as const,
    },
  ];

  return (
    <ModuleHeroSection
      user={user}
      moduleName="Expense & Tax Dashboard"
      moduleDescription="Track expenses and maximize tax deductions"
      stats={stats}
    />
  );
}
