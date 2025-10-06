/**
 * Marketplace Module - Zod Validation Schemas
 *
 * TODO: Implement marketplace schemas:
 * - ToolSchema: Tool/dashboard metadata validation
 * - InstallToolSchema: Tool installation input
 * - ToolConfigSchema: Tool configuration settings
 * - ToolRatingSchema: Rating/review validation
 * - SearchFiltersSchema: Marketplace search/filter params
 */

import { z } from 'zod';

// Placeholder schemas - expand during implementation
export const ToolSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  category: z.string(),
  price: z.number().min(0),
});

export const InstallToolSchema = z.object({
  toolId: z.string().uuid(),
  organizationId: z.string().uuid(),
  config: z.record(z.unknown()).optional(),
});

export type Tool = z.infer<typeof ToolSchema>;
export type InstallToolInput = z.infer<typeof InstallToolSchema>;
