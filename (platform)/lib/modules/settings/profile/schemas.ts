import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().nullable(),
});

export const UpdatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  compactView: z.boolean().optional(),
  sidebarCollapsed: z.boolean().optional(),
  notificationSound: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
});

export const UploadAvatarSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, 'File must be less than 2MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
      'File must be an image (JPEG, PNG, WebP, or GIF)'
    ),
});

export const UpdateNotificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  projectUpdates: z.boolean(),
  taskAssignments: z.boolean(),
  marketingEmails: z.boolean(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpdatePreferencesInput = z.infer<typeof UpdatePreferencesSchema>;
export type UploadAvatarInput = z.infer<typeof UploadAvatarSchema>;
export type UpdateNotificationPreferencesInput = z.infer<typeof UpdateNotificationPreferencesSchema>;
