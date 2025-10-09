import { z } from 'zod';

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const Enable2FASchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});

export const Disable2FASchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const RevokeSessionSchema = z.object({
  sessionId: z.string().min(1),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type Enable2FAInput = z.infer<typeof Enable2FASchema>;
export type Disable2FAInput = z.infer<typeof Disable2FASchema>;
export type RevokeSessionInput = z.infer<typeof RevokeSessionSchema>;
