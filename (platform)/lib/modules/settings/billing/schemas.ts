import { z } from 'zod';

export const SubscriptionTierEnum = z.enum([
  'FREE',
  'CUSTOM',
  'STARTER',
  'GROWTH',
  'ELITE',
  'ENTERPRISE',
]);

export const UpdatePlanSchema = z.object({
  newTier: SubscriptionTierEnum,
});

export const AddPaymentMethodSchema = z.object({
  paymentMethodId: z.string().min(1),
});

export const UpdatePaymentMethodSchema = z.object({
  paymentMethodId: z.string().min(1),
});

export const RemovePaymentMethodSchema = z.object({
  paymentMethodId: z.string().min(1),
});

export const DownloadInvoiceSchema = z.object({
  invoiceId: z.string().min(1),
});

export type SubscriptionTier = z.infer<typeof SubscriptionTierEnum>;
export type UpdatePlanInput = z.infer<typeof UpdatePlanSchema>;
export type AddPaymentMethodInput = z.infer<typeof AddPaymentMethodSchema>;
export type UpdatePaymentMethodInput = z.infer<typeof UpdatePaymentMethodSchema>;
export type RemovePaymentMethodInput = z.infer<typeof RemovePaymentMethodSchema>;
export type DownloadInvoiceInput = z.infer<typeof DownloadInvoiceSchema>;
