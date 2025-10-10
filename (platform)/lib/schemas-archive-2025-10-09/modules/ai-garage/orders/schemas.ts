import { z } from 'zod';
import { ComplexityLevel, OrderStatus, OrderPriority } from '@prisma/client';

/**
 * Agent Order Creation Schema
 *
 * Validates all input when creating a new custom agent order
 * Multi-tenant: organizationId required
 */
export const createOrderSchema = z.object({
  // Required fields
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  use_case: z.string().min(1, 'Use case is required').max(200),

  // Order classification
  complexity: z.nativeEnum(ComplexityLevel),
  priority: z.nativeEnum(OrderPriority).default('NORMAL'),

  // Requirements and configuration
  requirements: z.record(z.string(), z.any()),
  agent_config: z.record(z.string(), z.any()),
  tools_config: z.record(z.string(), z.any()),

  // Assignment
  assigned_to_id: z.string().uuid().optional(),

  // Multi-tenancy (required)
  organization_id: z.string().uuid(),
});

/**
 * Order Update Schema
 * All fields optional except ID
 */
export const updateOrderSchema = createOrderSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Order Filters Schema
 * For querying/filtering orders
 */
export const orderFiltersSchema = z.object({
  // Status filters
  status: z.union([
    z.nativeEnum(OrderStatus),
    z.array(z.nativeEnum(OrderStatus))
  ]).optional(),

  // Complexity filters
  complexity: z.union([
    z.nativeEnum(ComplexityLevel),
    z.array(z.nativeEnum(ComplexityLevel))
  ]).optional(),

  // Priority filters
  priority: z.union([
    z.nativeEnum(OrderPriority),
    z.array(z.nativeEnum(OrderPriority))
  ]).optional(),

  // Assignment filter
  assigned_to_id: z.string().uuid().optional(),
  created_by_id: z.string().uuid().optional(),

  // Search
  search: z.string().optional(),

  // Date range filters
  created_from: z.coerce.date().optional(),
  created_to: z.coerce.date().optional(),
  submitted_from: z.coerce.date().optional(),
  submitted_to: z.coerce.date().optional(),

  // Pagination
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),

  // Sorting
  sort_by: z.enum(['created_at', 'updated_at', 'title', 'progress', 'submitted_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Order Status Update Schema
 */
export const updateOrderStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(OrderStatus),
  notes: z.string().max(1000).optional(),
});

/**
 * Order Progress Update Schema
 */
export const updateOrderProgressSchema = z.object({
  id: z.string().uuid(),
  progress: z.number().int().min(0).max(100),
  current_stage: z.string().max(50).optional(),
});

/**
 * Milestone Creation Schema
 */
export const createMilestoneSchema = z.object({
  order_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  stage: z.string().min(1).max(50),
  due_date: z.coerce.date().optional(),
  sort_order: z.number().int().default(0),
});

/**
 * Build Log Creation Schema
 */
export const createBuildLogSchema = z.object({
  order_id: z.string().uuid(),
  stage: z.string().min(1).max(50),
  message: z.string().min(1),
  details: z.record(z.string(), z.any()).optional(),
  log_level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).default('INFO'),
});

// Export types
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrderFilters = z.infer<typeof orderFiltersSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateOrderProgressInput = z.infer<typeof updateOrderProgressSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type CreateBuildLogInput = z.infer<typeof createBuildLogSchema>;
