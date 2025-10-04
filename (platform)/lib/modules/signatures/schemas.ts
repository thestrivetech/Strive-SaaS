import { z } from 'zod';
import { SigningOrder } from '@prisma/client';

/**
 * Schema for creating a signature request
 *
 * A signature request orchestrates the signing process for one or more documents
 * by one or more signers (loop parties).
 */
export const CreateSignatureRequestSchema = z.object({
  loopId: z
    .string()
    .cuid('Invalid loop ID format'),

  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),

  message: z
    .string()
    .max(2000, 'Message cannot exceed 2000 characters')
    .optional(),

  documentIds: z
    .array(z.string().cuid('Invalid document ID format'))
    .min(1, 'At least one document is required')
    .max(50, 'Cannot request signatures for more than 50 documents at once'),

  signerIds: z
    .array(z.string().cuid('Invalid signer ID format'))
    .min(1, 'At least one signer is required')
    .max(20, 'Cannot request signatures from more than 20 signers at once'),

  signingOrder: z
    .nativeEnum(SigningOrder)
    .default('PARALLEL'),

  expiresAt: z
    .date()
    .optional()
    .refine(
      (date) => !date || date > new Date(),
      'Expiration date must be in the future'
    ),
});

/**
 * Schema for signing a document
 */
export const SignDocumentSchema = z.object({
  signatureId: z
    .string()
    .cuid('Invalid signature ID format'),

  signatureData: z
    .string()
    .min(1, 'Signature data is required')
    .max(100000, 'Signature data too large'),

  authMethod: z
    .enum(['EMAIL', 'SMS', 'ID_VERIFICATION'])
    .default('EMAIL'),

  ipAddress: z
    .string()
    .ip({ version: 'v4' })
    .optional(),

  userAgent: z
    .string()
    .max(500)
    .optional(),
});

/**
 * Schema for declining a signature request
 */
export const DeclineSignatureSchema = z.object({
  signatureId: z
    .string()
    .cuid('Invalid signature ID format'),

  reason: z
    .string()
    .min(10, 'Please provide a reason (at least 10 characters)')
    .max(1000, 'Reason cannot exceed 1000 characters'),
});

/**
 * Schema for querying signature requests
 */
export const QuerySignatureRequestsSchema = z.object({
  loopId: z
    .string()
    .cuid('Invalid loop ID format')
    .optional(),

  status: z
    .enum(['PENDING', 'SENT', 'VIEWED', 'SIGNED', 'DECLINED', 'EXPIRED'])
    .optional(),

  page: z
    .number()
    .int()
    .positive()
    .default(1),

  limit: z
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),

  sortBy: z
    .enum(['createdAt', 'expiresAt', 'completedAt'])
    .default('createdAt'),

  sortOrder: z
    .enum(['asc', 'desc'])
    .default('desc'),
});

/**
 * TypeScript types inferred from schemas
 */
export type CreateSignatureRequestInput = z.infer<typeof CreateSignatureRequestSchema>;
export type SignDocumentInput = z.infer<typeof SignDocumentSchema>;
export type DeclineSignatureInput = z.infer<typeof DeclineSignatureSchema>;
export type QuerySignatureRequestsInput = z.infer<typeof QuerySignatureRequestsSchema>;
