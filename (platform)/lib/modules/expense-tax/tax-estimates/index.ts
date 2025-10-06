/**
 * Tax Estimates Module - Public API
 *
 * Tax calculation and estimation functionality
 *
 * Features:
 * - Progressive tax bracket calculations
 * - Quarterly and annual estimates
 * - Expense-based deduction calculations
 *
 * SECURITY:
 * - All operations require authentication
 * - Multi-tenancy enforced via organizationId
 */

// Actions
export {
  createTaxEstimate,
  updateTaxEstimate,
  generateTaxEstimateForYear,
  generateTaxEstimateForQuarter,
} from './actions';

// Queries
export {
  getTaxEstimate,
  getAllTaxEstimates,
  getTaxEstimatesForYear,
} from './queries';

// Schemas
export {
  TaxEstimateSchema,
  UpdateTaxEstimateSchema,
} from './schemas';

// Types
export type {
  TaxEstimateInput,
  UpdateTaxEstimateInput,
} from './schemas';

// Calculations
export {
  calculateTax,
  calculateYearlyTaxEstimate,
  calculateQuarterlyTaxEstimate,
  type TaxCalculationResult,
} from './calculations';
