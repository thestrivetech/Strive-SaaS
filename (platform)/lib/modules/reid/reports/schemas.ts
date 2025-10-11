import { z } from 'zod';

/**
 * Market Report Input Schema
 * Based on market_reports Prisma model
 */
export const MarketReportSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  reportType: z.enum([
    'NEIGHBORHOOD_ANALYSIS',
    'MARKET_OVERVIEW',
    'COMPARATIVE_STUDY',
    'INVESTMENT_ANALYSIS',
    'DEMOGRAPHIC_REPORT',
    'CUSTOM',
  ]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'REVIEW', 'APPROVED', 'SCHEDULED']).default('DRAFT'),

  // Geographic Scope
  areaType: z.enum(['ZIP', 'SCHOOL_DISTRICT', 'NEIGHBORHOOD', 'COUNTY', 'MSA']).optional(),
  zipCodes: z.array(z.string()).default([]),
  cities: z.array(z.string()).default([]),
  states: z.array(z.string()).default([]),

  // Report Config
  dateRangeStart: z.date().optional(),
  dateRangeEnd: z.date().optional(),
  configuration: z.record(z.any()).optional(),

  // Report Data
  data: z.record(z.any()).optional(),
  insights: z.record(z.any()).optional(),

  // File Storage
  filePath: z.string().max(500).optional(),
  fileSize: z.number().int().nonnegative().optional(),
  fileFormat: z.string().max(20).optional(),

  // Sharing
  isPublic: z.boolean().default(false),
  sharedWithUsers: z.array(z.string().uuid()).default([]),
  expiresAt: z.date().optional(),

  // Template & Scheduling
  isTemplate: z.boolean().default(false),
  templateId: z.string().uuid().optional(),
  schedule: z.record(z.any()).optional(),

  // Metadata
  tags: z.array(z.string()).default([]),
  generatedAt: z.date().optional(),
});

export type MarketReportInput = z.infer<typeof MarketReportSchema>;

/**
 * Report Filters Schema (for query filtering)
 */
export const ReportFiltersSchema = z.object({
  reportType: z.enum([
    'NEIGHBORHOOD_ANALYSIS',
    'MARKET_OVERVIEW',
    'COMPARATIVE_STUDY',
    'INVESTMENT_ANALYSIS',
    'DEMOGRAPHIC_REPORT',
    'CUSTOM',
  ]).optional(),
  isPublic: z.boolean().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isTemplate: z.boolean().optional(),
});

export type ReportFilters = z.infer<typeof ReportFiltersSchema>;
