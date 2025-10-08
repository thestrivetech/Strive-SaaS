import { Suspense } from 'react';
import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { motion } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
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
      </motion.div>
    </div>
  );
}

/**
 * Hero Section Wrapper
 * Fetches expense summary data and passes to ModuleHeroSection
 */
async function HeroSectionWrapper({
  user,
}: {
  user: { id: string; name?: string | null; organization_members: Array<{ organization_id: string }> };
  organizationId: string;
}) {
  // Mock expense summary data (replace with actual API call in future sessions)
  // In real implementation, this would call: /api/v1/expenses/summary
  const mockSummary = {
    totalExpenses: 45230,
    currentMonth: 8450,
    deductibleTotal: 38640,
    receiptCount: 127,
  };

  const stats = [
    {
      label: 'YTD Expenses',
      value: `$${mockSummary.totalExpenses.toLocaleString()}`,
      icon: 'revenue' as const,
    },
    {
      label: 'Current Month',
      value: `$${mockSummary.currentMonth.toLocaleString()}`,
      icon: 'customers' as const,
    },
    {
      label: 'Tax Deductible',
      value: `$${mockSummary.deductibleTotal.toLocaleString()}`,
      icon: 'projects' as const,
    },
    {
      label: 'Receipts',
      value: mockSummary.receiptCount,
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
