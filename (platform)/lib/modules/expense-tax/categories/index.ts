/**
 * Expense Categories Module - Public API
 *
 * Category management for expense tracking with system vs custom support
 *
 * Features:
 * - System categories (predefined, shared across orgs)
 * - Custom categories (organization-specific)
 * - CRUD operations
 * - Multi-tenancy support
 *
 * SECURITY:
 * - All operations require authentication
 * - Multi-tenancy enforced via organizationId
 * - System categories protected from modification
 */

// Actions
export { createCategory, updateCategory, deleteCategory } from './actions';

// Queries
export {
  getCategories,
  getCategoryById,
  getCustomCategories,
  getSystemCategories,
} from './queries';

// Schemas
export { CategorySchema, UpdateCategorySchema } from './schemas';

// Types
export type { CategoryInput, UpdateCategoryInput } from './schemas';

// Prisma types
export type { expense_categories } from '@prisma/client';
