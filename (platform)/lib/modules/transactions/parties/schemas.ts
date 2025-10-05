import { z } from 'zod';
import { PartyRole, PartyStatus } from '@prisma/client';

/**
 * Schema for creating/inviting a new party to a transaction loop
 */
export const CreatePartySchema = z.object({
  loopId: z.string().uuid('Invalid loop ID'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.nativeEnum(PartyRole, {
    errorMap: () => ({ message: 'Invalid party role' }),
  }),
  permissions: z
    .array(z.enum(['view', 'edit', 'sign', 'upload']))
    .default(['view'])
    .refine((perms) => perms.length > 0, 'At least one permission is required'),
});

export type CreatePartyInput = z.infer<typeof CreatePartySchema>;

/**
 * Schema for updating an existing party
 */
export const UpdatePartySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional().nullable(),
  role: z.nativeEnum(PartyRole).optional(),
  permissions: z.array(z.enum(['view', 'edit', 'sign', 'upload'])).optional(),
  status: z.nativeEnum(PartyStatus).optional(),
});

export type UpdatePartyInput = z.infer<typeof UpdatePartySchema>;

/**
 * Schema for querying parties by loop
 */
export const QueryPartiesSchema = z.object({
  loopId: z.string().uuid('Invalid loop ID'),
  status: z.nativeEnum(PartyStatus).optional(),
  role: z.nativeEnum(PartyRole).optional(),
});

export type QueryPartiesInput = z.infer<typeof QueryPartiesSchema>;
