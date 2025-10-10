import { Suspense } from 'react';
import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { HeroSkeleton } from '@/components/shared/dashboard/skeletons';
import { ReportTemplatesSection } from './report-templates-section';
import { RecentReportsSection } from './recent-reports-section';
import { expenseTaxReportsProvider } from '@/lib/data';

/**
 * Tax Reports Page
 *
 * Complete page for generating and managing tax reports with:
 * - ModuleHeroSection with report statistics
 * - Report template cards (Schedule E, Form 1040, etc.)
 * - Recent reports list with download/share/delete actions
 * - Share report dialog
 * - Responsive layout
 *
 * @protected - Requires authentication and organization membership
 * @route /real-estate/expense-tax/reports
 */
export const metadata: Metadata = {
  title: 'Tax Reports | Strive Platform',
  description: 'Generate and manage your tax reports',
};

export default async function TaxReportsPage() {
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
      {/* Hero Section with Stats */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSectionWrapper user={user} organizationId={organizationId} />
      </Suspense>

      {/* Report Templates Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Generate Reports</h2>
          <p className="text-muted-foreground">
            Select a report template to generate tax documentation
          </p>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          }
        >
          <ReportTemplatesSection organizationId={organizationId} />
        </Suspense>
      </section>

      {/* Recent Reports Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Recent Reports</h2>
          <p className="text-muted-foreground">
            View, download, and share your generated reports
          </p>
        </div>
        <Suspense
          fallback={
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          }
        >
          <RecentReportsSection organizationId={organizationId} />
        </Suspense>
      </section>
    </div>
  );
}

/**
 * Hero Section Wrapper
 * Fetches report statistics and passes to ModuleHeroSection
 */
async function HeroSectionWrapper({
  user,
  organizationId,
}: {
  user: Awaited<ReturnType<typeof getCurrentUser>>;
  organizationId: string;
}) {
  // Fetch recent reports to calculate stats
  const reports = await expenseTaxReportsProvider.getRecentReports(organizationId);
  const currentYear = new Date().getFullYear();

  const totalReports = reports.length;
  const thisYearReports = reports.filter((r) => r.year === currentYear).length;
  const completedReports = reports.filter((r) => r.status === 'completed').length;
  const sharedReports = reports.filter((r) => r.sharedWith.length > 0).length;

  const stats = [
    {
      label: 'Total Reports',
      value: totalReports.toString(),
      icon: 'revenue' as const,
    },
    {
      label: `${currentYear} Reports`,
      value: thisYearReports.toString(),
      icon: 'customers' as const,
    },
    {
      label: 'Completed',
      value: completedReports.toString(),
      icon: 'projects' as const,
    },
    {
      label: 'Shared',
      value: sharedReports.toString(),
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
      moduleName="Tax Reports"
      moduleDescription="Generate and manage your tax reports"
      stats={stats}
    />
  );
}
