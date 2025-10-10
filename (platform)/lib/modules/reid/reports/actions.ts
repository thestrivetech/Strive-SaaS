'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessREID, canCreateReports, getREIDLimits } from '@/lib/auth/rbac';
import { generateReport } from './generator';
import crypto from 'crypto';

// Schema for market report input
const MarketReportSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  reportType: z.string(),
  areaCodes: z.array(z.string()),
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }).optional(),
  filters: z.any().optional(),
  isPublic: z.boolean().optional(),
  includeInsights: z.boolean().optional(),
  includeAlerts: z.boolean().optional(),
  includeForecast: z.boolean().optional(),
});

type MarketReportInput = z.infer<typeof MarketReportSchema>;

/**
 * Create a new market report
 * Enforces tier limits and organization isolation
 */
export async function createMarketReport(input: MarketReportInput) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  if (!canCreateReports(user)) {
    throw new Error('Insufficient permissions to create reports');
  }

  // Check tier limits
  const limits = getREIDLimits(user.subscriptionTier);
  if (limits.reports !== -1) {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyCount = await prisma.market_reports.count({
      where: {
        organization_id: user.organizationId,
        created_at: { gte: currentMonth }
      }
    });

    if (monthlyCount >= limits.reports) {
      throw new Error(`Monthly report limit reached (${limits.reports}). Upgrade to create more reports.`);
    }
  }

  const validated = input;

  // Generate report content
  const generatedContent = await generateReport(validated);

  const report = await prisma.market_reports.create({
    data: {
      title: validated.title,
      description: validated.description,
      report_type: validated.reportType,
      area_codes: validated.areaCodes,
      date_range: validated.dateRange,
      filters: validated.filters,
      summary: generatedContent.summary,
      insights: generatedContent.insights,
      charts: generatedContent.charts,
      tables: generatedContent.tables,
      is_public: validated.isPublic,
      share_token: validated.isPublic ? crypto.randomBytes(16).toString('hex') : null,
      organization_id: user.organizationId,
      created_by_id: user.id,
    }
  });

  revalidatePath('/real-estate/reid/reports');

  return report;
}

/**
 * Update an existing market report
 * Verifies ownership before updating
 */
export async function updateMarketReport(
  id: string,
  input: Partial<MarketReportInput>
) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized');
  }

  const existing = await prisma.market_reports.findFirst({
    where: {
      id,
      organization_id: user.organizationId
    }
  });

  if (!existing) {
    throw new Error('Report not found');
  }

  const validated = MarketReportSchema.partial().parse(input);

  const updated = await prisma.market_reports.update({
    where: { id },
    data: {
      ...(validated.title && { title: validated.title }),
      ...(validated.description !== undefined && { description: validated.description }),
      ...(validated.isPublic !== undefined && {
        is_public: validated.isPublic,
        share_token: validated.isPublic && !existing.share_token
          ? crypto.randomBytes(16).toString('hex')
          : existing.share_token
      }),
      updated_at: new Date(),
    }
  });

  revalidatePath('/real-estate/reid/reports');
  revalidatePath(`/real-estate/reid/reports/${id}`);

  return updated;
}

/**
 * Delete a market report
 * Verifies ownership before deletion
 */
export async function deleteMarketReport(id: string) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized');
  }

  const existing = await prisma.market_reports.findFirst({
    where: {
      id,
      organization_id: user.organizationId
    }
  });

  if (!existing) {
    throw new Error('Report not found');
  }

  await prisma.market_reports.delete({
    where: { id }
  });

  revalidatePath('/real-estate/reid/reports');
}

/**
 * Generate PDF export for a report
 * Placeholder - implementation depends on PDF library
 */
export async function generateReportPDF(reportId: string) {
  const user = await requireAuth();

  const report = await prisma.market_reports.findFirst({
    where: {
      id: reportId,
      organization_id: user.organizationId
    }
  });

  if (!report) {
    throw new Error('Report not found');
  }

  // Generate PDF (implementation depends on PDF library)
  // This would use react-pdf or puppeteer
  const pdfUrl = await generatePDF(report);

  await prisma.market_reports.update({
    where: { id: reportId },
    data: { pdf_url: pdfUrl }
  });

  revalidatePath(`/real-estate/reid/reports/${reportId}`);

  return pdfUrl;
}

/**
 * Generate CSV export for a report
 * Placeholder - implementation depends on CSV library
 */
export async function generateReportCSV(reportId: string) {
  const user = await requireAuth();

  const report = await prisma.market_reports.findFirst({
    where: {
      id: reportId,
      organization_id: user.organizationId
    }
  });

  if (!report) {
    throw new Error('Report not found');
  }

  // Generate CSV
  const csvUrl = await generateCSV(report);

  await prisma.market_reports.update({
    where: { id: reportId },
    data: { csv_url: csvUrl }
  });

  revalidatePath(`/real-estate/reid/reports/${reportId}`);

  return csvUrl;
}

// Placeholder functions (to be implemented with proper libraries)
async function generatePDF(report: any): Promise<string> {
  // TODO: Implement PDF generation with react-pdf or puppeteer
  // For now, return placeholder URL
  return `/reports/${report.id}.pdf`;
}

async function generateCSV(report: any): Promise<string> {
  // TODO: Implement CSV generation
  // For now, return placeholder URL
  return `/reports/${report.id}.csv`;
}
