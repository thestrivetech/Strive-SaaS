import { z } from 'zod';

/**
 * Expense Categories Schemas
 *
 * Zod validation schemas for expense category management
 *
 * Features:
 * - System vs custom categories
 * - Category validation
 * - Multi-tenancy support
 */

/**
 * Category creation schema
 */
export const CategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  isDeductible: z.boolean().default(true),
  taxCode: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  organizationId: z.string().uuid(),
});

/**
 * Category update schema
 */
export const UpdateCategorySchema = CategorySchema.partial().extend({
  id: z.string().uuid(),
});

// Type exports
export type CategoryInput = z.infer<typeof CategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
