/**
 * Expense & Tax Module - Public API
 *
 * Consolidated expense tracking and tax management module
 *
 * Features:
 * - Expense tracking and categorization
 * - Tax deduction management
 * - Receipt upload and storage
 * - Tax reports and summaries
 * - Quarterly tax estimates
 * - Transaction integration
 *
 * SECURITY:
 * - All operations require authentication
 * - Multi-tenancy enforced via organizationId
 * - RBAC permission checks
 * - Input validation with Zod schemas
 */

// Actions
export {
  createExpense,
  updateExpense,
  deleteExpense,
  reviewExpense,
  upsertTaxEstimate,
  generateExpenseReport,
  calculateTaxDeductions,
} from './actions';

// Queries
export {
  getExpenses,
  getExpenseById,
  getExpenseSummary,
  getCategoryBreakdown,
  getExpenseCategories,
  getTaxEstimate,
  getExpenseReports,
  getMonthlyExpenseTrend,
} from './queries';

// Schemas
export {
  ExpenseSchema,
  UpdateExpenseSchema,
  ExpenseFiltersSchema,
  ExpenseCategorySchema,
  TaxEstimateSchema,
  ExpenseReportSchema,
} from './schemas';

// Types
export type {
  ExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
  ExpenseCategoryInput,
  TaxEstimateInput,
  ExpenseReportInput,
} from './schemas';

// Prisma types
export type { expenses, tax_estimates, expense_reports, receipts } from '@prisma/client';

// Sub-modules
export * from './categories';
export * from './receipts';
