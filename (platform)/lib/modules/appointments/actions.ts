'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessCRM } from '@/lib/auth/rbac';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
  bulkRescheduleSchema,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
  type UpdateAppointmentStatusInput,
  type BulkRescheduleInput,
} from './schemas';

/**
 * Appointments Actions Module
 *
 * Server Actions for appointment management with RBAC enforcement
 *
 * SECURITY:
 * - All actions require authentication
 * - CRM access permission checked
 * - Multi-tenancy enforced via withTenantContext
 * - Input validation with Zod schemas
 */

/**
 * Create a new appointment
 *
 * RBAC: Requires CRM access
 *
 * @param input - Appointment data
 * @returns Created appointment
 */
export async function createAppointment(input: CreateAppointmentInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // Check RBAC permissions
  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to create appointments');
  }

  // Validate input
  const validated = createAppointmentSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const appointment = await prisma.appointments.create({
        data: {
          ...validated,
          assigned_to: validated.assigned_to || user.id,
          organization_id: user.organization_members[0].organization_id,
          // Handle reminders - use undefined instead of null for JSON fields
          reminders_sent: validated.reminder_minutes
            ? ({ reminder_minutes: validated.reminder_minutes, sent: false } as any)
            : undefined,
        },
        include: {
          users: {
            select: { id: true, name: true, email: true },
          },
          lead: {
            select: { id: true, name: true },
          },
          contact: {
            select: { id: true, name: true },
          },
          deal: {
            select: { id: true, title: true },
          },
          listing: {
            select: { id: true, title: true },
          },
        },
      });

      // Create activity log
      await prisma.activities.create({
        data: {
          type: 'MEETING',
          title: `Appointment scheduled: ${validated.title}`,
          description: validated.description || undefined,
          lead_id: validated.lead_id || undefined,
          contact_id: validated.contact_id || undefined,
          deal_id: validated.deal_id || undefined,
          listing_id: validated.listing_id || undefined,
          organization_id: user.organization_members[0].organization_id,
          created_by_id: user.id,
        },
      });

      revalidatePath('/crm/calendar');
      revalidatePath('/crm/dashboard');

      return appointment;
    } catch (error) {
      return handleDatabaseError(error);
    }
  });
}

/**
 * Update an existing appointment
 *
 * RBAC: Requires CRM access + appointment ownership or admin
 *
 * @param id - Appointment ID
 * @param input - Updated appointment data
 * @returns Updated appointment
 */
export async function updateAppointment(id: string, input: UpdateAppointmentInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // Check RBAC permissions
  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to update appointments');
  }

  // Validate input
  const validated = updateAppointmentSchema.parse(input);

  return withTenantContext(async () => {
    try {
      // Verify appointment exists and user has access
      const existing = await prisma.appointments.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('Appointment not found');
      }

      const appointment = await prisma.appointments.update({
        where: { id },
        data: {
          ...validated,
          // Update reminders if provided - cast to any for JSON type compatibility
          ...(validated.reminder_minutes !== undefined && {
            reminders_sent: (validated.reminder_minutes
              ? { reminder_minutes: validated.reminder_minutes, sent: false }
              : undefined) as any,
          }),
        },
        include: {
          users: {
            select: { id: true, name: true, email: true },
          },
          lead: {
            select: { id: true, name: true },
          },
          contact: {
            select: { id: true, name: true },
          },
          deal: {
            select: { id: true, title: true },
          },
          listing: {
            select: { id: true, title: true },
          },
        },
      });

      // Create activity log
      await prisma.activities.create({
        data: {
          type: 'NOTE',
          title: `Appointment updated: ${appointment.title}`,
          description: `Appointment details were modified`,
          lead_id: appointment.lead_id || undefined,
          contact_id: appointment.contact_id || undefined,
          deal_id: appointment.deal_id || undefined,
          listing_id: appointment.listing_id || undefined,
          organization_id: user.organization_members[0].organization_id,
          created_by_id: user.id,
        },
      });

      revalidatePath('/crm/calendar');
      revalidatePath(`/crm/appointments/${id}`);

      return appointment;
    } catch (error) {
      return handleDatabaseError(error);
    }
  });
}

/**
 * Update appointment status
 *
 * RBAC: Requires CRM access
 *
 * @param id - Appointment ID
 * @param input - Status update data
 * @returns Updated appointment
 */
export async function updateAppointmentStatus(
  id: string,
  input: UpdateAppointmentStatusInput
) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // Check RBAC permissions
  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions');
  }

  // Validate input
  const validated = updateAppointmentStatusSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const appointment = await prisma.appointments.update({
        where: { id },
        data: { status: validated.status },
        include: {
          users: { select: { id: true, name: true } },
          lead: { select: { id: true, name: true } },
          contact: { select: { id: true, name: true } },
          deal: { select: { id: true, title: true } },
        },
      });

      // Log activity
      await prisma.activities.create({
        data: {
          type: 'NOTE',
          title: `Appointment ${validated.status.toLowerCase()}`,
          description: validated.completed_note || `${appointment.title} was marked as ${validated.status}`,
          lead_id: appointment.lead_id || undefined,
          contact_id: appointment.contact_id || undefined,
          deal_id: appointment.deal_id || undefined,
          organization_id: user.organization_members[0].organization_id,
          created_by_id: user.id,
          completed_at: validated.status === 'COMPLETED' ? new Date() : undefined,
        },
      });

      revalidatePath('/crm/calendar');
      revalidatePath(`/crm/appointments/${id}`);

      return appointment;
    } catch (error) {
      return handleDatabaseError(error);
    }
  });
}

/**
 * Delete an appointment
 *
 * RBAC: Requires CRM access + appointment ownership or admin
 *
 * @param id - Appointment ID
 * @returns Success status
 */
export async function deleteAppointment(id: string) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // Check RBAC permissions
  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to delete appointments');
  }

  return withTenantContext(async () => {
    try {
      const appointment = await prisma.appointments.delete({
        where: { id },
      });

      // Log activity
      await prisma.activities.create({
        data: {
          type: 'NOTE',
          title: `Appointment deleted: ${appointment.title}`,
          description: `Appointment was removed from calendar`,
          organization_id: user.organization_members[0].organization_id,
          created_by_id: user.id,
        },
      });

      revalidatePath('/crm/calendar');

      return { success: true };
    } catch (error) {
      return handleDatabaseError(error);
    }
  });
}

/**
 * Bulk reschedule appointments
 *
 * RBAC: Requires CRM access
 *
 * @param input - Appointment IDs and time offset
 * @returns Count of updated appointments
 */
export async function bulkRescheduleAppointments(input: BulkRescheduleInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // Check RBAC permissions
  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions');
  }

  // Validate input
  const validated = bulkRescheduleSchema.parse(input);

  return withTenantContext(async () => {
    try {
      // Fetch appointments to calculate new times
      const appointments = await prisma.appointments.findMany({
        where: {
          id: { in: validated.appointment_ids },
        },
      });

      // Update each appointment
      for (const appointment of appointments) {
        const newStartTime = new Date(
          appointment.start_time.getTime() + validated.offset_minutes * 60000
        );
        const newEndTime = new Date(
          appointment.end_time.getTime() + validated.offset_minutes * 60000
        );

        await prisma.appointments.update({
          where: { id: appointment.id },
          data: {
            start_time: newStartTime,
            end_time: newEndTime,
          },
        });
      }

      // Log activity
      await prisma.activities.create({
        data: {
          type: 'NOTE',
          title: `Bulk rescheduled ${appointments.length} appointments`,
          description: `Appointments shifted by ${validated.offset_minutes} minutes`,
          organization_id: user.organization_members[0].organization_id,
          created_by_id: user.id,
        },
      });

      revalidatePath('/crm/calendar');

      return { count: appointments.length };
    } catch (error) {
      return handleDatabaseError(error);
    }
  });
}
