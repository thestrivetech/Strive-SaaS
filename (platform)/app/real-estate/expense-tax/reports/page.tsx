import { Suspense } from 'react';
import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { ReportGenerator } from '@/components/real-estate/expense-tax/reports/ReportGenerator';
import { ReportList } from '@/components/real-estate/expense-tax/reports/ReportList';
import type { Report } from '@/components/real-estate/expense-tax/reports/ReportCard';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardHeader, CardTitle, CardContent } from '@/components/shared/dashboard/EnhancedCard';
import { HeroSkeleton } from '@/components/shared/dashboard/skeletons';

/**
 * Expense Reports Page
 *
 * Report generation and management dashboard with:
 * - ModuleHeroSection with report KPI stats
 * - Report generator form (date range, categories, format)
 * - List of generated reports with download/delete
 * - Single column layout
 * - Glass effects and neon borders
 * - Framer Motion animations
 *
 * @protected - Requires authentication and organization membership
 * @route /real-estate/expense-tax/reports
 */
export const metadata: Metadata = {
  title: 'Expense Reports | Strive Platform',
  description: 'Generate and manage expense reports',
};

export default async function ExpenseReportsPage() {
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
      {/* Hero Section with Report KPIs */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSectionWrapper user={user} />
      </Suspense>

      {/* Report Generator Section */}
      <div>
        <EnhancedCard glassEffect="strong" neonBorder="cyan" hoverEffect={false}>
          <CardHeader>
            <CardTitle>Generate New Report</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              }
            >
              <ReportGenerator />
            </Suspense>
          </CardContent>
        </EnhancedCard>
      </div>

      {/* Reports List Section */}
      <div>
        <EnhancedCard glassEffect="strong" neonBorder="purple" hoverEffect={false}>
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              }
            >
              <ReportListWrapper />
            </Suspense>
          </CardContent>
        </EnhancedCard>
      </div>
    </div>
  );
}

/**
 * Hero Section Wrapper
 * Fetches report summary data and passes to ModuleHeroSection
 */
async function HeroSectionWrapper({
  user,
}: {
  user: { id: string; name?: string | null; organization_members: Array<{ organization_id: string }> };
}) {
  // Mock report summary data (replace with actual API call in future)
  // API endpoint: /api/v1/expenses/reports/summary
  const mockReportSummary = {
    totalReports: 24,
    thisMonth: 5,
    reportsYTD: 18,
    lastGenerated: '2 hours ago',
  };

  const stats = [
    {
      label: 'Total Reports',
      value: mockReportSummary.totalReports,
      icon: 'tasks' as const,
    },
    {
      label: 'This Month',
      value: mockReportSummary.thisMonth,
      icon: 'customers' as const,
    },
    {
      label: 'Reports YTD',
      value: mockReportSummary.reportsYTD,
      icon: 'projects' as const,
    },
    {
      label: 'Last Generated',
      value: mockReportSummary.lastGenerated,
      icon: 'revenue' as const,
    },
  ];

  return (
    <ModuleHeroSection
      user={user}
      moduleName="Expense Reports"
      moduleDescription="Generate and manage comprehensive expense reports"
      stats={stats}
    />
  );
}

/**
 * Report List Wrapper
 * Fetches generated reports for the organization
 */
async function ReportListWrapper() {
  // Mock report data (replace with actual API call in future)
  // API endpoint: /api/v1/expenses/reports?organizationId={organizationId}
  const mockReports: Report[] = [
    {
      id: 'report-1',
      name: 'Q4 2024 Expense Report',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-12-31'),
      categories: ['Marketing', 'Travel', 'Office'],
      format: 'CSV',
      generatedAt: new Date('2024-12-15'),
      fileSize: '245 KB',
    },
    {
      id: 'report-2',
      name: 'November 2024 Tax Summary',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-11-30'),
      categories: ['All Categories'],
      format: 'PDF',
      generatedAt: new Date('2024-12-01'),
      fileSize: '1.2 MB',
    },
    {
      id: 'report-3',
      name: 'Marketing Expenses YTD',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      categories: ['Marketing'],
      format: 'CSV',
      generatedAt: new Date('2024-12-10'),
      fileSize: '128 KB',
    },
    {
      id: 'report-4',
      name: 'Travel Expenses H2 2024',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-12-31'),
      categories: ['Travel', 'Meals'],
      format: 'PDF',
      generatedAt: new Date('2024-12-05'),
      fileSize: '890 KB',
    },
  ];

  const handleDownload = (reportId: string) => {
    // Placeholder - will be implemented with API
    console.log('Download report:', reportId);
  };

  const handleDelete = (reportId: string) => {
    // Placeholder - will be implemented with API
    console.log('Delete report:', reportId);
  };

  return (
    <ReportList
      reports={mockReports}
      onDownload={handleDownload}
      onDelete={handleDelete}
    />
  );
}
