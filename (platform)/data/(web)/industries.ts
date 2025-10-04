/**
 * STUB: Industries data
 * This is a stub file - actual data lives in (website) project
 * These exports allow (platform) code to compile without cross-project imports
 */

export type IndustryOption = {
  value: string;
  label: string;
  description?: string;
};

export type IndustrySolution = {
  id: string;
  name: string;
  description: string;
};

export const industryOptions: IndustryOption[] = [];
export const industrySpecificSolutions: Record<string, IndustrySolution[]> = {};
export const industryCorrelations: Record<string, string[]> = {};
