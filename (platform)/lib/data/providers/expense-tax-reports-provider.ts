/**
 * Expense & Tax Reports Provider
 *
 * Switches between mock data and real Prisma queries for tax report operations
 */

import { dataConfig, simulateDelay, maybeThrowError } from '../config';
import {
  REPORT_TEMPLATES,
  generateMockGeneratedReport,
  generateMockGeneratedReports,
  type MockReportTemplate,
  type MockGeneratedReport,
  type ReportFormat,
} from '../mocks/expense-tax-reports';

// ============================================================================
// IN-MEMORY MOCK STORAGE
// ============================================================================

const mockGeneratedReportsStore: MockGeneratedReport[] = [];

/**
 * Initialize mock data stores
 */
function initializeMockData(orgId: string) {
  if (mockGeneratedReportsStore.length === 0) {
    mockGeneratedReportsStore = generateMockGeneratedReports(orgId, 6);
  }
}

// ============================================================================
// EXPENSE TAX REPORTS PROVIDER
// ============================================================================

export const expenseTaxReportsProvider = {
  /**
   * Get all report templates
   */
  async getTemplates(): Promise<MockReportTemplate[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch report templates');
      return REPORT_TEMPLATES;
    }

    // TODO: Replace with real Prisma query when schema is ready
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get recent reports for an organization
   */
  async getRecentReports(orgId: string, limit?: number): Promise<MockGeneratedReport[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch reports');

      let reports = mockGeneratedReportsStore.filter((r) => r.organizationId === orgId);

      // Sort by date descending
      reports.sort((a, b) => b.dateGenerated.getTime() - a.dateGenerated.getTime());

      // Apply limit if provided
      if (limit !== undefined) {
        reports = reports.slice(0, limit);
      }

      return reports;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Generate a new report
   */
  async generateReport(
    data: {
      templateId: string;
      year: number;
      options?: {
        includeReceipts?: boolean;
        categoryFilter?: string[];
      };
    },
    orgId: string
  ): Promise<MockGeneratedReport> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay(2000); // Simulate longer processing time
      maybeThrowError('Failed to generate report');

      const newReport = generateMockGeneratedReport(orgId, data.templateId, data.year);

      // Set status to completed (in real implementation would be 'generating' initially)
      newReport.status = 'completed';

      mockGeneratedReportsStore.push(newReport);

      return newReport;
    }

    // TODO: Replace with real implementation
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Download report (mock - returns blob URL)
   */
  async downloadReport(
    reportId: string,
    format: ReportFormat,
    orgId: string
  ): Promise<{ url: string; filename: string }> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to download report');

      const report = mockGeneratedReportsStore.find(
        (r) => r.id === reportId && r.organizationId === orgId
      );

      if (!report) {
        throw new Error('Report not found');
      }

      if (!report.formats.includes(format)) {
        throw new Error(`Report not available in ${format} format`);
      }

      // In real implementation, would generate download URL from storage
      const filename = `${report.templateName.replace(/\s+/g, '-')}-${report.year}.${format}`;
      const url = `/mock-downloads/${reportId}.${format}`;

      return { url, filename };
    }

    // TODO: Replace with real implementation
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Share report with accountant
   */
  async shareReport(
    reportId: string,
    data: {
      email: string;
      permissions: 'view' | 'download';
    },
    orgId: string
  ): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to share report');

      const report = mockGeneratedReportsStore.find(
        (r) => r.id === reportId && r.organizationId === orgId
      );

      if (!report) {
        throw new Error('Report not found');
      }

      // Add email to sharedWith array if not already present
      if (!report.sharedWith.includes(data.email)) {
        report.sharedWith.push(data.email);
      }

      return;
    }

    // TODO: Replace with real implementation
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Revoke report access
   */
  async revokeAccess(reportId: string, email: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to revoke access');

      const report = mockGeneratedReportsStore.find(
        (r) => r.id === reportId && r.organizationId === orgId
      );

      if (!report) {
        throw new Error('Report not found');
      }

      // Remove email from sharedWith array
      report.sharedWith = report.sharedWith.filter((e) => e !== email);

      return;
    }

    // TODO: Replace with real implementation
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete report
   */
  async deleteReport(reportId: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to delete report');

      const index = mockGeneratedReportsStore.findIndex(
        (r) => r.id === reportId && r.organizationId === orgId
      );

      if (index === -1) {
        throw new Error('Report not found');
      }

      mockGeneratedReportsStore.splice(index, 1);
      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};
