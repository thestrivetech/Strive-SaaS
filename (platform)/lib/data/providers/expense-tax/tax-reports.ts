import { prisma } from '@/lib/database/prisma';
import { setTenantContext } from '@/lib/database/prisma-middleware';

/**
 * Tax Reports Seed Data
 *
 * Creates 12 realistic tax report records for Expense & Tax module
 *
 * Variety includes:
 * - Template types: Schedule E, Form 1040, Expense Summary, Year-End Tax
 * - Tax years: 2022, 2023, 2024
 * - Status values: GENERATING, COMPLETED, FAILED
 * - Realistic financial data with proper ratios
 * - Mix of shared/private, QuickBooks synced/not synced
 *
 * Usage:
 * ```bash
 * cd (platform)
 * npx tsx prisma/seeds/tax-reports-seed.ts
 * ```
 */

async function seedTaxReports() {
  console.log('🌱 Starting tax_reports seeding...');
  console.log('');

  // Test organization and user IDs
  const TEST_ORG_ID = 'system-default';
  const TEST_USER_ID = 'test-user-id';

  const reports = [
    // Schedule E - 2023 Rental Properties (COMPLETED)
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      name: 'Schedule E - 2023 Rental Income and Expenses',
      template_type: 'SCHEDULE_E',
      tax_year: 2023,
      period_start: new Date('2023-01-01'),
      period_end: new Date('2023-12-31'),
      status: 'COMPLETED',
      file_url: '/tax-reports/2023/schedule-e-2023-rental-properties.pdf',
      file_format: 'PDF',
      file_size_bytes: BigInt(245000),
      total_income: 125000.00,
      total_expenses: 48500.00,
      total_deductions: 35200.00,
      categories_count: 8,
      expenses_count: 142,
      is_shared: false,
      quickbooks_synced: new Date('2024-01-15T10:30:00Z'),
      generated_at: new Date('2024-01-10T14:22:00Z'),
      generation_time_ms: 4250,
      template_version: '1.0',
      created_at: new Date('2024-01-05T09:15:00Z')
    },

    // Schedule E - 2024 Q1-Q3 (COMPLETED)
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      name: 'Schedule E - 2024 YTD Rental Properties',
      template_type: 'SCHEDULE_E',
      tax_year: 2024,
      period_start: new Date('2024-01-01'),
      period_end: new Date('2024-09-30'),
      status: 'COMPLETED',
      file_url: '/tax-reports/2024/schedule-e-2024-ytd.pdf',
      file_format: 'PDF',
      file_size_bytes: BigInt(198000),
      total_income: 92000.00,
      total_expenses: 38200.00,
      total_deductions: 28500.00,
      categories_count: 8,
      expenses_count: 105,
      is_shared: false,
      quickbooks_synced: new Date('2024-10-05T08:45:00Z'),
      generated_at: new Date('2024-10-02T16:10:00Z'),
      generation_time_ms: 3850,
      template_version: '1.0',
      created_at: new Date('2024-10-01T11:20:00Z')
    },

    // Form 1040 Summary - 2023 (COMPLETED)
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      name: 'Form 1040 Summary - 2023 Tax Year',
      template_type: 'ANNUAL_SUMMARY',
      tax_year: 2023,
      period_start: new Date('2023-01-01'),
      period_end: new Date('2023-12-31'),
      status: 'COMPLETED',
      file_url: '/tax-reports/2023/form-1040-summary-2023.pdf',
      file_format: 'PDF',
      file_size_bytes: BigInt(312000),
      total_income: 185000.00,
      total_expenses: 62500.00,
      total_deductions: 48200.00,
      categories_count: 12,
      expenses_count: 187,
      is_shared: true,
      shared_with: { accountant: 'john@taxcpa.com', spouse: 'jane@email.com' },
      quickbooks_synced: new Date('2024-02-01T09:00:00Z'),
      generated_at: new Date('2024-01-28T11:45:00Z'),
      generation_time_ms: 5200,
      template_version: '1.0',
      created_at: new Date('2024-01-25T08:30:00Z')
    },

    // Expense Summary - 2024 Q1 (COMPLETED)
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      name: 'Expense Summary - Q1 2024',
      template_type: 'EXPENSE_SUMMARY',
      tax_year: 2024,
      period_start: new Date('2024-01-01'),
      period_end: new Date('2024-03-31'),
      status: 'COMPLETED',
      file_url: '/tax-reports/2024/q1/expense-summary-q1-2024.pdf',
      file_format: 'PDF',
      file_size_bytes: BigInt(156000),
      total_income: 42000.00,
      total_expenses: 18500.00,
      total_deductions: 14200.00,
      categories_count: 6,
      expenses_count: 48,
      is_shared: false,
      quickbooks_synced: new Date('2024-04-08T10:15:00Z'),
      generated_at: new Date('2024-04-05T14:30:00Z'),
      generation_time_ms: 2850,
      template_version: '1.0',
      created_at: new Date('2024-04-02T09:00:00Z')
    },

    // Expense Summary - 2024 Q2 (COMPLETED)
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      name: 'Expense Summary - Q2 2024',
      template_type: 'EXPENSE_SUMMARY',
      tax_year: 2024,
      period_start: new Date('2024-04-01'),
      period_end: new Date('2024-06-30'),
      status: 'COMPLETED',
      file_url: '/tax-reports/2024/q2/expense-summary-q2-2024.pdf',
      file_format: 'PDF',
      file_size_bytes: BigInt(168000),
      total_income: 48000.00,
      total_expenses: 21200.00,
      total_deductions: 16800.00,
      categories_count: 7,
      expenses_count: 52,
      is_shared: false,
      quickbooks_synced: new Date('2024-07-10T09:30:00Z'),
      generated_at: new Date('2024-07-05T15:20:00Z'),
      generation_time_ms: 3150,
      template_version: '1.0',
      created_at: new Date('2024-07-02T10:45:00Z')
    },

    // Expense Summary - 2024 Q3 (COMPLETED)
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      name: 'Expense Summary - Q3 2024',
      template_type: 'EXPENSE_SUMMARY',
      tax_year: 2024,
      period_start: new Date('2024-07-01'),
      period_end: new Date('2024-09-30'),
      status: 'COMPLETED',
      file_url: '/tax-reports/2024/q3/expense-summary-q3-2024.pdf',
      file_format: 'PDF',
      file_size_bytes: BigInt(172000),
      total_income: 52000.00,
      total_expenses: 23500.00,
      total_deductions: 18200.00,
      categories_count: 7,
      expenses_count: 58,
      is_shared: false,
      quickbooks_synced: new Date('2024-10-08T08:00:00Z'),
      generated_at: new Date('2024-10-03T16:45:00Z'),
      generation_time_ms: 3350,
      template_version: '1.0',
      created_at: new Date('2024-10-01T09:30:00Z')
    },

    // Year-End Tax Summary - 2022 (COMPLETED)
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      name: 'Year-End Tax Summary - 2022',
      template_type: 'ANNUAL_SUMMARY',
      tax_year: 2022,
      period_start: new Date('2022-01-01'),
      period_end: new Date('2022-12-31'),
      status: 'COMPLETED',
      file_url: '/tax-reports/2022/year-end-summary-2022.pdf',
      file_format: 'PDF',
      file_size_bytes: BigInt(298000),
      total_income: 165000.00,
      total_expenses: 58200.00,
      total_deductions: 42500.00,
      categories_count: 11,
      expenses_count: 168,
      is_shared: true,
      shared_with: { accountant: 'john@taxcpa.com' },
      quickbooks_synced: new Date('2023-01-20T10:00:00Z'),
      generated_at: new Date('2023-01-15T13:30:00Z'),
      generation_time_ms: 4850,
      template_version: '1.0',
      created_at: new Date('2023-01-10T09:00:00Z')
    },

    // Category Breakdown - 2023 (COMPLETED)
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      name: 'Expense Category Breakdown - 2023',
      template_type: 'CATEGORY_BREAKDOWN',
      tax_year: 2023,
      period_start: new Date('2023-01-01'),
      period_end: new Date('2023-12-31'),
      status: 'COMPLETED',
      file_url: '/tax-reports/2023/category-breakdown-2023.pdf',
      file_format: 'PDF',
      file_size_bytes: BigInt(185000),
      total_income: 175000.00,
      total_expenses: 61200.00,
      total_deductions: 46800.00,
      categories_count: 15,
      expenses_count: 195,
      is_shared: false,
      quickbooks_synced: null,
      generated_at: new Date('2024-02-10T10:15:00Z'),
      generation_time_ms: 3950,
      template_version: '1.0',
      created_at: new Date('2024-02-08T14:20:00Z')
    },

    // Quarterly Estimate - 2024 Q4 (GENERATING)
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      name: 'Quarterly Tax Estimate - Q4 2024',
      template_type: 'QUARTERLY_ESTIMATE',
      tax_year: 2024,
      period_start: new Date('2024-10-01'),
      period_end: new Date('2024-12-31'),
      status: 'GENERATING',
      file_url: null,
      file_format: null,
      file_size_bytes: null,
      total_income: null,
      total_expenses: null,
      total_deductions: null,
      categories_count: null,
      expenses_count: null,
      is_shared: false,
      quickbooks_synced: null,
      generated_at: null,
      generation_time_ms: null,
      template_version: '1.0',
      created_at: new Date('2024-10-10T08:30:00Z')
    },

    // Schedule E - 2022 (COMPLETED)
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      name: 'Schedule E - 2022 Rental Properties',
      template_type: 'SCHEDULE_E',
      tax_year: 2022,
      period_start: new Date('2022-01-01'),
      period_end: new Date('2022-12-31'),
      status: 'COMPLETED',
      file_url: '/tax-reports/2022/schedule-e-2022-rental-properties.pdf',
      file_format: 'PDF',
      file_size_bytes: BigInt(228000),
      total_income: 108000.00,
      total_expenses: 45200.00,
      total_deductions: 32800.00,
      categories_count: 7,
      expenses_count: 128,
      is_shared: false,
      quickbooks_synced: new Date('2023-01-18T11:00:00Z'),
      generated_at: new Date('2023-01-12T15:45:00Z'),
      generation_time_ms: 4050,
      template_version: '1.0',
      created_at: new Date('2023-01-08T10:00:00Z')
    },

    // Year-End Tax Summary - 2024 (GENERATING)
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      name: 'Year-End Tax Summary - 2024 (Preliminary)',
      template_type: 'ANNUAL_SUMMARY',
      tax_year: 2024,
      period_start: new Date('2024-01-01'),
      period_end: new Date('2024-12-31'),
      status: 'GENERATING',
      file_url: null,
      file_format: null,
      file_size_bytes: null,
      total_income: null,
      total_expenses: null,
      total_deductions: null,
      categories_count: null,
      expenses_count: null,
      is_shared: false,
      quickbooks_synced: null,
      generated_at: null,
      generation_time_ms: null,
      template_version: '1.0',
      created_at: new Date('2024-10-09T16:00:00Z')
    },

    // Custom Report - Multi-year Comparison (FAILED)
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      name: 'Multi-Year Tax Comparison 2022-2024',
      template_type: 'CUSTOM',
      tax_year: 2024,
      period_start: new Date('2022-01-01'),
      period_end: new Date('2024-12-31'),
      status: 'FAILED',
      file_url: null,
      file_format: null,
      file_size_bytes: null,
      total_income: null,
      total_expenses: null,
      total_deductions: null,
      categories_count: null,
      expenses_count: null,
      is_shared: false,
      quickbooks_synced: null,
      generated_at: null,
      generation_time_ms: null,
      template_version: '1.0',
      created_at: new Date('2024-10-08T12:30:00Z')
    }
  ];

  // Create all reports
  let successCount = 0;
  let errorCount = 0;

  for (const report of reports) {
    try {
      await prisma.tax_reports.create({
        data: report,
      });
      successCount++;
      console.log(`  ✅ Created: ${report.template_type} - ${report.name} (${report.status})`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Failed: ${report.name}`);
      console.error(`     Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('');
  console.log('✅ Tax reports seeding completed!');
  console.log('');
  console.log('Summary:');
  console.log(`  • Total reports: ${reports.length}`);
  console.log(`  • Successfully created: ${successCount}`);
  console.log(`  • Failed: ${errorCount}`);
  console.log('');
  console.log('Report breakdown:');
  console.log(`  • Schedule E: ${reports.filter(r => r.template_type === 'SCHEDULE_E').length}`);
  console.log(`  • Annual Summary: ${reports.filter(r => r.template_type === 'ANNUAL_SUMMARY').length}`);
  console.log(`  • Expense Summary: ${reports.filter(r => r.template_type === 'EXPENSE_SUMMARY').length}`);
  console.log(`  • Category Breakdown: ${reports.filter(r => r.template_type === 'CATEGORY_BREAKDOWN').length}`);
  console.log(`  • Quarterly Estimate: ${reports.filter(r => r.template_type === 'QUARTERLY_ESTIMATE').length}`);
  console.log(`  • Custom: ${reports.filter(r => r.template_type === 'CUSTOM').length}`);
  console.log('');
  console.log('Status breakdown:');
  console.log(`  • Completed: ${reports.filter(r => r.status === 'COMPLETED').length}`);
  console.log(`  • Generating: ${reports.filter(r => r.status === 'GENERATING').length}`);
  console.log(`  • Failed: ${reports.filter(r => r.status === 'FAILED').length}`);
  console.log('');
  console.log('Tax year breakdown:');
  console.log(`  • 2022: ${reports.filter(r => r.tax_year === 2022).length} reports`);
  console.log(`  • 2023: ${reports.filter(r => r.tax_year === 2023).length} reports`);
  console.log(`  • 2024: ${reports.filter(r => r.tax_year === 2024).length} reports`);
  console.log('');
  console.log('Financial data summary (completed reports only):');
  const completedReports = reports.filter(r => r.status === 'COMPLETED' && r.total_income !== null);
  if (completedReports.length > 0) {
    const totalIncome = completedReports.reduce((sum, r) => sum + (r.total_income || 0), 0);
    const totalExpenses = completedReports.reduce((sum, r) => sum + (r.total_expenses || 0), 0);
    const totalDeductions = completedReports.reduce((sum, r) => sum + (r.total_deductions || 0), 0);
    const avgIncome = totalIncome / completedReports.length;
    const avgExpenses = totalExpenses / completedReports.length;
    const avgDeductions = totalDeductions / completedReports.length;

    console.log(`  • Total Income Range: $${Math.min(...completedReports.map(r => r.total_income || 0)).toLocaleString()} - $${Math.max(...completedReports.map(r => r.total_income || 0)).toLocaleString()}`);
    console.log(`  • Total Expenses Range: $${Math.min(...completedReports.map(r => r.total_expenses || 0)).toLocaleString()} - $${Math.max(...completedReports.map(r => r.total_expenses || 0)).toLocaleString()}`);
    console.log(`  • Total Deductions Range: $${Math.min(...completedReports.map(r => r.total_deductions || 0)).toLocaleString()} - $${Math.max(...completedReports.map(r => r.total_deductions || 0)).toLocaleString()}`);
    console.log(`  • Average Income: $${avgIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
    console.log(`  • Average Expenses: $${avgExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
    console.log(`  • Average Deductions: $${avgDeductions.toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
  }
  console.log('');
  console.log('QuickBooks integration:');
  console.log(`  • Synced reports: ${reports.filter(r => r.quickbooks_synced !== null).length}`);
  console.log(`  • Not synced: ${reports.filter(r => r.quickbooks_synced === null).length}`);
  console.log('');
  console.log('Sharing:');
  console.log(`  • Shared reports: ${reports.filter(r => r.is_shared).length}`);
  console.log(`  • Private reports: ${reports.filter(r => !r.is_shared).length}`);
  console.log('');
}

seedTaxReports()
  .catch((error) => {
    console.error('❌ Seeding failed:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
