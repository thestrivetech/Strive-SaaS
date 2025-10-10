import { z } from 'zod';

// Note: ReportType enum will come from Prisma after Session 1 schema migration
// For now, we define the expected types
export enum ReportType {
  NEIGHBORHOOD_ANALYSIS = 'NEIGHBORHOOD_ANALYSIS',
  MARKET_OVERVIEW = 'MARKET_OVERVIEW',
  COMPARATIVE_STUDY = 'COMPARATIVE_STUDY',
  INVESTMENT_ANALYSIS = 'INVESTMENT_ANALYSIS',
  DEMOGRAPHIC_REPORT = 'DEMOGRAPHIC_REPORT',
  CUSTOM = 'CUSTOM',
}

export const MarketReportSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  reportType: z.nativeEnum(ReportType),
  areaCodes: z.array(z.string()).min(1),
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }),
  filters: z.any().optional(),
  summary: z.string().optional(),
  insights: z.any().optional(),
  charts: z.any().optional(),
  tables: z.any().optional(),
  isPublic: z.boolean().default(false),
  organizationId: z.string().uuid(),
});

export const ReportFiltersSchema = z.object({
  reportType: z.nativeEnum(ReportType).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isPublic: z.boolean().optional(),
});

export type MarketReportInput = z.infer<typeof MarketReportSchema>;
export type ReportFilters = z.infer<typeof ReportFiltersSchema>;
