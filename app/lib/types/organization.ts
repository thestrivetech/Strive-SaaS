/**
 * Organization and member types
 */

import type { User } from '@prisma/client';

export interface OrganizationMember {
  id: string;
  role: string;
  user: User;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
}
