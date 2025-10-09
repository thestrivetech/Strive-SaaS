/**
 * Mock Expense & Tax Reports Data
 *
 * Generate mock data for tax report templates and generated reports
 */

import { generateId, randomFromArray, randomPastDate, randomInt } from './generators';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ReportTemplateCategory = 'tax-form' | 'summary' | 'categorization';

export type MockReportTemplate = {
  id: string;
  name: string;
  description: string;
  category: ReportTemplateCategory;
  whatsIncluded: string[];
  icon: string; // Lucide icon name
  estimatedTime: string;
};

export type ReportStatus = 'completed' | 'generating' | 'failed';
export type ReportFormat = 'pdf' | 'excel';

export type MockGeneratedReport = {
  id: string;
  templateName: string;
  templateId: string;
  year: number;
  dateGenerated: Date;
  status: ReportStatus;
  fileSize: string;
  formats: ReportFormat[];
  sharedWith: string[];
  organizationId: string;
};

// ============================================================================
// REPORT TEMPLATES DATA
// ============================================================================

export const REPORT_TEMPLATES: MockReportTemplate[] = [
  {
    id: 'template-schedule-e',
    name: 'Schedule E',
    description: 'IRS Schedule E for rental property income and expenses',
    category: 'tax-form',
    whatsIncluded: [
      'Rental property income',
      'Operating expenses by category',
      'Depreciation calculations',
      'Net rental income/loss',
      'Property details and addresses',
    ],
    icon: 'FileText',
    estimatedTime: '2-3 minutes',
  },
  {
    id: 'template-1040',
    name: 'Form 1040',
    description: 'IRS Form 1040 Schedule C for business income and expenses',
    category: 'tax-form',
    whatsIncluded: [
      'Business income summary',
      'Deductible expenses by category',
      'Home office deduction',
      'Vehicle expenses',
      'Profit or loss calculation',
    ],
    icon: 'Calculator',
    estimatedTime: '3-4 minutes',
  },
  {
    id: 'template-categorization',
    name: 'Expense Categorization',
    description: 'Detailed breakdown of expenses by tax category',
    category: 'categorization',
    whatsIncluded: [
      'Expenses grouped by IRS categories',
      'Category totals and percentages',
      'Deductible vs non-deductible',
      'Monthly breakdown',
      'Receipt attachment status',
    ],
    icon: 'FolderTree',
    estimatedTime: '1-2 minutes',
  },
  {
    id: 'template-year-end',
    name: 'Year-End Tax Summary',
    description: 'Comprehensive annual tax summary for accountant review',
    category: 'summary',
    whatsIncluded: [
      'Annual income summary',
      'Total expenses by quarter',
      'Tax deduction summary',
      'Estimated tax liability',
      'Missing receipts report',
      'Year-over-year comparison',
    ],
    icon: 'CalendarCheck',
    estimatedTime: '3-5 minutes',
  },
];

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate a mock generated report
 */
export function generateMockGeneratedReport(
  orgId: string,
  templateId?: string,
  year?: number
): MockGeneratedReport {
  const template = templateId
    ? REPORT_TEMPLATES.find((t) => t.id === templateId) || randomFromArray(REPORT_TEMPLATES)
    : randomFromArray(REPORT_TEMPLATES);

  const currentYear = new Date().getFullYear();
  const reportYear = year || randomFromArray([currentYear, currentYear - 1]);

  const dateGenerated = randomPastDate(90); // Within last 90 days

  // Random status (mostly completed)
  const statusOptions: ReportStatus[] = ['completed', 'completed', 'completed', 'generating', 'failed'];
  const status = randomFromArray(statusOptions);

  // Random formats (pdf always included, sometimes excel too)
  const formats: ReportFormat[] = ['pdf'];
  if (Math.random() > 0.5) {
    formats.push('excel');
  }

  // Random file size
  const sizeInMB = (randomInt(10, 50) / 10).toFixed(1); // 1.0 - 5.0 MB
  const fileSize = `${sizeInMB} MB`;

  // Random shared emails (0-2 emails)
  const sharedWith: string[] = [];
  const shareCount = randomInt(0, 3);
  const possibleEmails = [
    'accountant@example.com',
    'tax-advisor@example.com',
    'bookkeeper@example.com',
  ];

  for (let i = 0; i < shareCount; i++) {
    const email = possibleEmails[i];
    if (email && !sharedWith.includes(email)) {
      sharedWith.push(email);
    }
  }

  return {
    id: generateId(),
    templateName: template.name,
    templateId: template.id,
    year: reportYear,
    dateGenerated,
    status,
    fileSize,
    formats,
    sharedWith,
    organizationId: orgId,
  };
}

/**
 * Generate multiple generated reports
 */
export function generateMockGeneratedReports(orgId: string, count: number = 6): MockGeneratedReport[] {
  const reports: MockGeneratedReport[] = [];
  const currentYear = new Date().getFullYear();

  // Generate mix of current year and last year reports
  for (let i = 0; i < count; i++) {
    const year = i % 3 === 0 ? currentYear - 1 : currentYear;
    reports.push(generateMockGeneratedReport(orgId, undefined, year));
  }

  // Sort by date descending
  reports.sort((a, b) => b.dateGenerated.getTime() - a.dateGenerated.getTime());

  return reports;
}
