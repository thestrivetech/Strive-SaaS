/**
 * Filter types for CRM and Projects
 */

import type { CustomerStatus, CustomerSource, ProjectStatus, Priority, TaskStatus } from '@prisma/client';

export interface CRMFilters {
  search?: string;
  status?: CustomerStatus;
  source?: CustomerSource;
  assignedToId?: string;
  tags?: string[];
  createdFrom?: Date;
  createdTo?: Date;
  limit: number;
  offset: number;
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  priority?: Priority;
  customerId?: string;
  projectManagerId?: string;
  createdFrom?: Date;
  createdTo?: Date;
  dueFrom?: Date;
  dueTo?: Date;
  limit?: number;
  offset?: number;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus | string[];
  priority?: Priority | string[];
  assignedToId?: string;
  dueFrom?: Date;
  dueTo?: Date;
  projectId?: string;
  limit?: number;
  offset?: number;
}
