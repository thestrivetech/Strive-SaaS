// Tax Estimate Module - Public API

// Actions
export {
  createTaxEstimate,
  updateTaxEstimate,
  generateTaxEstimateForYear,
} from './actions';

// Queries
export {
  getTaxEstimates,
  getTaxEstimateById,
} from './queries';

// Schemas & Types
export {
  TaxEstimateSchema,
  UpdateTaxEstimateSchema,
  type TaxEstimateInput,
  type UpdateTaxEstimateInput,
} from './schemas';

// Calculations
export {
  calculateTax,
  calculateYearlyTaxEstimate,
  calculateQuarterlyTaxEstimate,
  type TaxCalculationResult,
} from './calculations';
