import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

/**
 * Expense & Tax Dashboard Page
 *
 * Main dashboard for expense tracking and tax management
 *
 * @protected - Requires authentication
 *
 * TODO (Session 3 - Phase 2):
 * - Implement expense tracking
 * - Add tax calculation
 * - Integrate with transactions
 * - Add expense categories
 * - Generate tax reports
 */
export default async function ExpenseTaxDashboardPage() {
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Expense & Tax Management</h1>
        <p className="text-muted-foreground">
          Track expenses, manage deductions, and prepare for tax season
        </p>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                Expense & Tax Management features are under development
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This module will provide comprehensive expense tracking and tax management tools for
            real estate professionals.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Planned Features */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Expense Tracking</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Categorize business expenses</li>
                <li>• Receipt upload and storage</li>
                <li>• Expense reports and analytics</li>
                <li>• Mileage tracking</li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold">Tax Management</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Tax deduction tracking</li>
                <li>• Quarterly estimates</li>
                <li>• 1099 form preparation</li>
                <li>• Tax calendar reminders</li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Transaction Integration</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Link expenses to properties</li>
                <li>• Commission tracking</li>
                <li>• Deal-related expenses</li>
                <li>• Client reimbursements</li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Reporting</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Monthly expense summaries</li>
                <li>• Year-end tax reports</li>
                <li>• Profit & loss statements</li>
                <li>• Export for accountants</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium">Expected Release</p>
            <p className="text-sm text-muted-foreground">
              This module is planned for implementation in Session 3 - Phase 2. Check back soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
