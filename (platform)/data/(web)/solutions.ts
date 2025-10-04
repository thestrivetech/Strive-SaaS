/**
 * STUB: Solutions data
 * This is a stub file - actual data lives in (website) project
 * These exports allow (platform) code to compile without cross-project imports
 */

export type Solution = {
  id: string;
  name: string;
  category: string;
  applicableIndustries: string[];
  technologies: string[];
  features: string[];
};

export type SolutionTypeOption = {
  value: string;
  label: string;
};

export const solutions: Solution[] = [];
export const solutionTypeOptions: SolutionTypeOption[] = [];
export const solutionCorrelations: Record<string, string[]> = {};
