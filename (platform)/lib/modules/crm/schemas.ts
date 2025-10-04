import { z } from 'zod';
import { CustomerStatus, CustomerSource } from '@prisma/client';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.union([z.string().email('Invalid email address'), z.literal('')]).optional(),
  phone: z.string().optional(),
  company: z.string().max(100).optional(),
  status: z.nativeEnum(CustomerStatus),
  source: z.nativeEnum(CustomerSource),
  tags: z.array(z.string()),
  customFields: z.record(z.string(), z.any()).optional(),
  assignedToId: z.string().uuid().optional(),
  organizationId: z.string().uuid(),
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  id: z.string().uuid(),
});

export const customerFiltersSchema = z.object({
  status: z.nativeEnum(CustomerStatus).optional(),
  source: z.nativeEnum(CustomerSource).optional(),
  assignedToId: z.string().uuid().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerFilters = z.infer<typeof customerFiltersSchema>;