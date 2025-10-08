import { Suspense } from 'react';
import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { ExpenseHeader } from '@/components/real-estate/expense-tax/dashboard/ExpenseHeader';
import { ExpenseKPIs } from '@/components/real-estate/expense-tax/dashboard/ExpenseKPIs';
import { DashboardSkeleton } from '@/components/real-estate/expense-tax/dashboard/DashboardSkeleton';

/**
 * Expense & Tax Dashboard Page
 *
 * Main dashboard for expense tracking and tax management.
 * Displays KPI cards with expense summary data:
 * - Total YTD expenses
 * - Current month expenses
 * - Tax deductible total
 * - Receipt count
 *
 * @protected - Requires authentication and organization membership
 * @route /real-estate/expense-tax/dashboard
 */
export const metadata: Metadata = {
  title: 'Expense Dashboard | Strive Platform',
  description: 'Track and manage business expenses and tax deductions',
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <ExpenseHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* KPI Cards with Suspense Boundary */}
          <Suspense fallback={<DashboardSkeleton />}>
            <ExpenseKPIs />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
