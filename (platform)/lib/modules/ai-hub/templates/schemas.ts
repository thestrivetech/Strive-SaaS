import { z } from 'zod';
import { TemplateCategory, DifficultyLevel } from '@prisma/client';

/**
 * Template Creation Schema
 */
export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().min(1, 'Description is required').max(1000),
  category: z.nativeEnum(TemplateCategory, { required_error: 'Category is required' }),
  difficulty: z.nativeEnum(DifficultyLevel, { required_error: 'Difficulty is required' }),
  nodes: z.array(z.any()).min(1, 'At least one node is required'),
  edges: z.array(z.any()),
  variables: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  organizationId: z.string().uuid('Invalid organization ID'),
});

/**
 * Template Update Schema
 */
export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  category: z.nativeEnum(TemplateCategory).optional(),
  difficulty: z.nativeEnum(DifficultyLevel).optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  variables: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().optional(),
  is_featured: z.boolean().optional(),
});

/**
 * Template Filters Schema
 */
export const templateFiltersSchema = z.object({
  category: z.nativeEnum(TemplateCategory).optional(),
  difficulty: z.nativeEnum(DifficultyLevel).optional(),
  is_featured: z.boolean().optional(),
  is_public: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
});

/**
 * Use Template Schema
 */
export const useTemplateSchema = z.object({
  templateId: z.string().uuid('Invalid template ID'),
  name: z.string().min(1, 'Workflow name is required').max(100),
  description: z.string().max(500).optional(),
  variables: z.record(z.string(), z.any()).optional(),
  organizationId: z.string().uuid('Invalid organization ID'),
  creatorId: z.string().uuid('Invalid creator ID'),
});

/**
 * Review Template Schema
 */
export const reviewTemplateSchema = z.object({
  templateId: z.string().uuid('Invalid template ID'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(1000, 'Comment must be 1000 characters or less').optional(),
  organizationId: z.string().uuid('Invalid organization ID'),
  userId: z.string().uuid('Invalid user ID'),
});

/**
 * TypeScript Types
 */
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type TemplateFilters = z.infer<typeof templateFiltersSchema>;
export type UseTemplateInput = z.infer<typeof useTemplateSchema>;
export type ReviewTemplateInput = z.infer<typeof reviewTemplateSchema>;

/**
 * Template Response Types
 */
export interface TemplateResponse {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  difficulty: DifficultyLevel;
  nodes: any[];
  edges: any[];
  variables?: Record<string, any>;
  tags?: string[];
  is_public: boolean;
  is_featured: boolean;
  usage_count: number;
  average_rating?: number;
  review_count: number;
  created_at: Date;
  updated_at: Date;
  creator?: {
    id: string;
    email: string;
    name?: string;
  };
  organization?: {
    id: string;
    name: string;
  };
}

export interface TemplateReview {
  id: string;
  rating: number;
  comment?: string;
  created_at: Date;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}
