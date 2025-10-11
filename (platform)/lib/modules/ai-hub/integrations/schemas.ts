import { z } from 'zod';
import { IntegrationStatus } from '@prisma/client';

/**
 * Integration Creation Schema
 */
export const createIntegrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  provider: z.enum(['SLACK', 'GMAIL', 'WEBHOOK', 'HTTP'], {
    required_error: 'Provider is required',
  }),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  credentials: z.record(z.string(), z.any()).refine(
    (creds) => Object.keys(creds).length > 0,
    { message: 'Credentials are required' }
  ),
  config: z.record(z.string(), z.any()).optional(),
  organizationId: z.string().uuid('Invalid organization ID'),
});

/**
 * Integration Update Schema
 */
export const updateIntegrationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  credentials: z.record(z.string(), z.any()).optional(),
  config: z.record(z.string(), z.any()).optional(),
  is_active: z.boolean().optional(),
});

/**
 * Integration Filters Schema
 */
export const integrationFiltersSchema = z.object({
  provider: z.enum(['SLACK', 'GMAIL', 'WEBHOOK', 'HTTP']).optional(),
  status: z.nativeEnum(IntegrationStatus).optional(),
  is_active: z.boolean().optional(),
  search: z.string().optional(),
});

/**
 * Test Connection Schema
 */
export const testConnectionSchema = z.object({
  provider: z.enum(['SLACK', 'GMAIL', 'WEBHOOK', 'HTTP']),
  credentials: z.record(z.string(), z.any()),
  config: z.record(z.string(), z.any()).optional(),
});

/**
 * Execute Integration Schema
 */
export const executeIntegrationSchema = z.object({
  integrationId: z.string().uuid('Invalid integration ID'),
  action: z.string().min(1, 'Action is required'),
  params: z.record(z.string(), z.any()).optional(),
  organizationId: z.string().uuid('Invalid organization ID'),
});

/**
 * TypeScript Types
 */
export type CreateIntegrationInput = z.infer<typeof createIntegrationSchema>;
export type UpdateIntegrationInput = z.infer<typeof updateIntegrationSchema>;
export type IntegrationFilters = z.infer<typeof integrationFiltersSchema>;
export type TestConnectionInput = z.infer<typeof testConnectionSchema>;
export type ExecuteIntegrationInput = z.infer<typeof executeIntegrationSchema>;

/**
 * Integration Response Types
 */
export interface IntegrationResponse {
  id: string;
  name: string;
  provider: string;
  description?: string;
  status: IntegrationStatus;
  is_active: boolean;
  last_used?: Date;
  created_at: Date;
  updated_at: Date;
  creator?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  error?: string;
  details?: Record<string, any>;
}

export interface ExecuteIntegrationResult {
  success: boolean;
  output?: any;
  error?: string;
  timestamp: Date;
  executionTime?: number;
}
