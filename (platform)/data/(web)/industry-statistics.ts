/**
 * STUB: Industry statistics data
 * This is a stub file - actual data lives in (website) project
 * These exports allow (platform) code to compile without cross-project imports
 */

export type IndustryStatistic = {
  industry: string;
  metric: string;
  value: number | string;
};

export const industryStatistics: IndustryStatistic[] = [];

export const roiMethodology = {
  methodology: 'Industry-specific ROI calculations based on standard business metrics',
  validation: 'Industry benchmarks and historical data',
  disclaimer: 'Results are estimates and may vary based on specific business conditions',
};
