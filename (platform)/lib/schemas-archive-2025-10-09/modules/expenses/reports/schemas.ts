import { z } from 'zod';
import { ReportType } from '@prisma/client';

export const ExpenseReportSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  reportType: z.nativeEnum(ReportType),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  categories: z.array(z.string().uuid()).default([]),
  listings: z.array(z.string().uuid()).default([]),
  merchants: z.array(z.string()).default([]),
  organizationId: z.string().uuid(),
}).refine(
  (data) => data.startDate <= data.endDate,
  {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  }
);

export type ExpenseReportInput = z.infer<typeof ExpenseReportSchema>;
