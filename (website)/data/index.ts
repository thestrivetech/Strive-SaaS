// Export industries and solutions data
export * from './industries';
export * from './industry-cards';

// Export solutions data with explicit naming to avoid conflicts
export {
  solutions,
  solutionTypeOptions,
  solutionCorrelations,
  getSolutionById,
  getSolutionsByCategory,
  type Solution,
  type SolutionTypeOption
} from './solutions';

// Export solutions mapping
export * from './solutions-mapping';

// Export projects/portfolio data
export * from './projects';

// Export resources data
export * from './resources';