import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError, DatabaseError } from '@/lib/database/errors';
import type { appointments, Prisma } from '@prisma/client';

/**
 * Appointments Queries Module
 *
 * SECURITY: All queries automatically filtered by organizationId via tenant middleware
 * No need to manually pass organizationId - it's injected automatically
 *
 * @see lib/database/prisma-middleware.ts
 */

type AppointmentWithRelations = Prisma.appointmentsGetPayload<{
  include: {
    users: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
    lead: {
      select: { id: true; name: true; status: true };
    };
    contact: {
      select: { id: true; name: true; email: true; phone: true };
    };
    deal: {
      select: { id: true; title: true; value: true; stage: true };
    };
    listing: {
      select: { id: true; title: true; address: true; price: true };
    };
    customers: {
      select: { id: true; name: true; email: true };
    };
  };
}>;

/**
 * Get appointments with calendar filters
 *
 * @param filters - Calendar date range and optional filters
 * @returns Array of appointments with relations
 */
export async function getAppointments(
  filters: CalendarFilters
): Promise<AppointmentWithRelations[] | DatabaseError> {
  return withTenantContext(async () => {
    try {
      const where: Prisma.appointmentsWhereInput = {
        start_time: {
          gte: filters.start_date,
          lte: filters.end_date,
        },
      };

      // Filter by user (assigned or attending)
      if (filters.user_id) {
        where.assigned_to = filters.user_id;
      }

      // Filter by type
      if (filters.type) {
        where.type = filters.type;
      }

      // Filter by status
      if (filters.status) {
        where.status = filters.status;
      }

      // Filter by CRM entities
      if (filters.lead_id) {
        where.lead_id = filters.lead_id;
      }

      if (filters.contact_id) {
        where.contact_id = filters.contact_id;
      }

      if (filters.deal_id) {
        where.deal_id = filters.deal_id;
      }

      if (filters.listing_id) {
        where.listing_id = filters.listing_id;
      }

      return await prisma.appointments.findMany({
        where,
        include: {
          users: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
          lead: {
            select: { id: true, name: true, status: true },
          },
          contact: {
            select: { id: true, name: true, email: true, phone: true },
          },
          deal: {
            select: { id: true, title: true, value: true, stage: true },
          },
          listing: {
            select: { id: true, title: true, address: true, price: true },
          },
          customers: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { start_time: 'asc' },
      });
    } catch (error) {
      return handleDatabaseError(error);
    }
  });
}

/**
 * Get upcoming appointments for a user
 *
 * @param userId - User ID to fetch appointments for
 * @param limit - Number of appointments to return (default: 10)
 * @returns Array of upcoming appointments
 */
export async function getUpcomingAppointments(
  userId: string,
  limit = 10
): Promise<AppointmentWithRelations[] | DatabaseError> {
  return withTenantContext(async () => {
    try {
      return await prisma.appointments.findMany({
        where: {
          start_time: { gte: new Date() },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          assigned_to: userId,
        },
        include: {
          users: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
          lead: {
            select: { id: true, name: true, status: true },
          },
          contact: {
            select: { id: true, name: true, email: true, phone: true },
          },
          deal: {
            select: { id: true, title: true, value: true, stage: true },
          },
          listing: {
            select: { id: true, title: true, address: true, price: true },
          },
          customers: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { start_time: 'asc' },
        take: limit,
      });
    } catch (error) {
      return handleDatabaseError(error);
    }
  });
}

/**
 * Get appointment by ID
 *
 * @param id - Appointment ID
 * @returns Appointment with full relations or null
 */
export async function getAppointmentById(
  id: string
): Promise<AppointmentWithRelations | null | DatabaseError> {
  return withTenantContext(async () => {
    try {
      return await prisma.appointments.findUnique({
        where: { id },
        include: {
          users: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
          lead: {
            select: { id: true, name: true, status: true, email: true },
          },
          contact: {
            select: { id: true, name: true, email: true, phone: true },
          },
          deal: {
            select: { id: true, title: true, value: true, stage: true },
          },
          listing: {
            select: { id: true, title: true, address: true, price: true },
          },
          customers: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    } catch (error) {
      return handleDatabaseError(error);
    }
  });
}

/**
 * Get appointments for a specific CRM entity
 *
 * @param entityType - Type of entity (lead, contact, deal, listing)
 * @param entityId - ID of the entity
 * @returns Array of appointments
 */
export async function getAppointmentsByEntity(
  entityType: 'lead' | 'contact' | 'deal' | 'listing',
  entityId: string
): Promise<AppointmentWithRelations[] | DatabaseError> {
  return withTenantContext(async () => {
    try {
      const where: Prisma.appointmentsWhereInput = {};

      switch (entityType) {
        case 'lead':
          where.lead_id = entityId;
          break;
        case 'contact':
          where.contact_id = entityId;
          break;
        case 'deal':
          where.deal_id = entityId;
          break;
        case 'listing':
          where.listing_id = entityId;
          break;
      }

      return await prisma.appointments.findMany({
        where,
        include: {
          users: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
          lead: {
            select: { id: true, name: true, status: true },
          },
          contact: {
            select: { id: true, name: true, email: true, phone: true },
          },
          deal: {
            select: { id: true, title: true, value: true, stage: true },
          },
          listing: {
            select: { id: true, title: true, address: true, price: true },
          },
          customers: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { start_time: 'desc' },
      });
    } catch (error) {
      return handleDatabaseError(error);
    }
  });
}

/**
 * Get appointment statistics for a user
 *
 * @param userId - User ID
 * @param startDate - Start date for statistics
 * @param endDate - End date for statistics
 * @returns Appointment statistics
 */
export async function getAppointmentStats(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  no_show: number;
  byType: {
    meeting: number;
    call: number;
    showing: number;
    open_house: number;
    follow_up: number;
    other: number;
  };
} | DatabaseError> {
  return withTenantContext(async () => {
    try {
      const appointments = await prisma.appointments.findMany({
        where: {
          assigned_to: userId,
          start_time: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          status: true,
          type: true,
        },
      });

      const stats = {
        total: appointments.length,
        scheduled: appointments.filter((a: any) => a.status === 'SCHEDULED').length,
        confirmed: appointments.filter((a: any) => a.status === 'CONFIRMED').length,
        completed: appointments.filter((a: any) => a.status === 'COMPLETED').length,
        cancelled: appointments.filter((a: any) => a.status === 'CANCELLED').length,
        no_show: appointments.filter((a: any) => a.status === 'NO_SHOW').length,
        byType: {
          meeting: appointments.filter((a: any) => a.type === 'MEETING').length,
          call: appointments.filter((a: any) => a.type === 'CALL').length,
          showing: appointments.filter((a: any) => a.type === 'SHOWING').length,
          open_house: appointments.filter((a: any) => a.type === 'OPEN_HOUSE').length,
          follow_up: appointments.filter((a: any) => a.type === 'FOLLOW_UP').length,
          other: appointments.filter((a: any) => a.type === 'OTHER').length,
        },
      };

      return stats;
    } catch (error) {
      return handleDatabaseError(error);
    }
  });
}
