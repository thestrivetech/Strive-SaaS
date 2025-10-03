/**
 * ROI Calculator Types
 * Type definitions for the ROI calculator utility
 */

export type IndustryName =
  | 'All Industries'
  | 'Healthcare'
  | 'Financial Services'
  | 'Retail'
  | 'Manufacturing'
  | 'Technology'
  | 'Education'
  | 'Real Estate'
  | 'Legal'
  | 'Government'
  | 'Logistics & Supply Chain'
  | 'Hospitality & Tourism'
  | 'Energy & Utilities'
  | 'Agriculture'
  | 'Media & Entertainment'
  | 'Gaming'
  | 'eSports'
  | 'Transportation'
  | 'Insurance'
  | 'Energy'
  | 'Telecommunications';

export interface SolutionDetails {
  name: string;
  description: string;
  roiMultiplier: number;
  timeSavingsPercent: number;
  annualBenefitPer1K: number;
}

export interface ROICalculationResult {
  fiveYearROI: string;
  timeSavings: string;
  annualReturn: string;
  roiMultiplier: number;
}
