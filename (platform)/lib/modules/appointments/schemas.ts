import { z } from 'zod';
import type { AppointmentStatus, AppointmentType } from '@prisma/client';

/**
 * Appointments Module Schemas
 *
 * Zod validation schemas for appointment creation, updates, and calendar filters
 */

// Appointment type enum schema
export const appointmentTypeSchema = z.enum([
  'MEETING',
  'CALL',
  'SHOWING',
  'OPEN_HOUSE',
  'FOLLOW_UP',
  'OTHER',
]);

// Appointment status enum schema
export const appointmentStatusSchema = z.enum([
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

/**
 * Create appointment schema
 */
export const createAppointmentSchema = z
  .object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(200),
    description: z.string().max(2000).optional(),
    start_time: z.coerce.date(),
    end_time: z.coerce.date(),
    location: z.string().max(200).optional(),
    meeting_url: z.string().url().optional().or(z.literal('')),
    type: appointmentTypeSchema.default('OTHER'),
    status: appointmentStatusSchema.default('SCHEDULED'),

    // CRM relations
    lead_id: z.string().cuid().optional(),
    contact_id: z.string().cuid().optional(),
    deal_id: z.string().cuid().optional(),
    listing_id: z.string().cuid().optional(),
    customer_id: z.string().cuid().optional(),

    // User assignment
    assigned_to: z.string().cuid().optional(),

    // Reminders (minutes before appointment)
    reminder_minutes: z.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      // End time must be after start time
      return data.end_time > data.start_time;
    },
    {
      message: 'End time must be after start time',
      path: ['end_time'],
    }
  );

/**
 * Update appointment schema
 */
export const updateAppointmentSchema = z
  .object({
    title: z.string().min(2).max(200).optional(),
    description: z.string().max(2000).optional(),
    start_time: z.coerce.date().optional(),
    end_time: z.coerce.date().optional(),
    location: z.string().max(200).optional(),
    meeting_url: z.string().url().optional().or(z.literal('')),
    type: appointmentTypeSchema.optional(),
    status: appointmentStatusSchema.optional(),

    // CRM relations
    lead_id: z.string().cuid().optional().nullable(),
    contact_id: z.string().cuid().optional().nullable(),
    deal_id: z.string().cuid().optional().nullable(),
    listing_id: z.string().cuid().optional().nullable(),
    customer_id: z.string().cuid().optional().nullable(),

    // User assignment
    assigned_to: z.string().cuid().optional(),

    // Reminders
    reminder_minutes: z.number().int().positive().optional().nullable(),
  })
  .refine(
    (data) => {
      // If both start and end times are provided, validate them
      if (data.start_time && data.end_time) {
        return data.end_time > data.start_time;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['end_time'],
    }
  );

/**
 * Update appointment status schema
 */
export const updateAppointmentStatusSchema = z.object({
  status: appointmentStatusSchema,
  completed_note: z.string().max(500).optional(),
});

/**
 * Calendar filters schema
 */
export const calendarFiltersSchema = z.object({
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  user_id: z.string().cuid().optional(),
  type: appointmentTypeSchema.optional(),
  status: appointmentStatusSchema.optional(),
  lead_id: z.string().cuid().optional(),
  contact_id: z.string().cuid().optional(),
  deal_id: z.string().cuid().optional(),
  listing_id: z.string().cuid().optional(),
});

/**
 * Bulk reschedule schema
 */
export const bulkRescheduleSchema = z.object({
  appointment_ids: z.array(z.string().cuid()).min(1),
  offset_minutes: z.number().int(),
});

// Type exports
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
export type CalendarFilters = z.infer<typeof calendarFiltersSchema>;
export type BulkRescheduleInput = z.infer<typeof bulkRescheduleSchema>;
export type AppointmentTypeEnum = AppointmentType;
export type AppointmentStatusEnum = AppointmentStatus;
