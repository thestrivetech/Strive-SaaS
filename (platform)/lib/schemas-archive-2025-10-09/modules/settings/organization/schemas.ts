import { z } from 'zod';

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional().nullable(),
});

export const InviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER'], {
    errorMap: () => ({ message: 'Role must be ADMIN, MEMBER, or VIEWER' }),
  }),
});

export const UpdateMemberRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  newRole: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

export const RemoveMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
export type InviteTeamMemberInput = z.infer<typeof InviteTeamMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;
export type RemoveMemberInput = z.infer<typeof RemoveMemberSchema>;
