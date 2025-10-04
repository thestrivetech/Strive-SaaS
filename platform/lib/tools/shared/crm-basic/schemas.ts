/**
 * CRM Basic Tool - Zod Validation Schemas
 */

import { z } from 'zod';

export const CRMBasicSettingsSchema = z.object({
  autoAssignLeads: z.boolean(),
  leadScoring: z.boolean(),
  notifyOnNewLead: z.boolean(),
  roundRobinAssignment: z.boolean(),
});

export const LeadDataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  source: z.string().min(1, 'Source is required'),
  status: z.enum(['new', 'contacted', 'qualified', 'lost']),
  score: z.number().min(0).max(100).optional(),
  assignedTo: z.string().uuid().optional(),
  createdAt: z.date(),
});

export const CreateLeadSchema = LeadDataSchema.omit({ id: true, createdAt: true });
export const UpdateLeadSchema = LeadDataSchema.partial().required({ id: true });
