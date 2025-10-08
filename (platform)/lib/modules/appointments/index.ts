/**
 * Appointments Module
 *
 * Public API for appointment management
 *
 * @module appointments
 */

// Check if mock mode is enabled
import { dataConfig } from '@/lib/data/config';

// Actions (Server Actions)
export {
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  bulkRescheduleAppointments,
} from './actions';

// Queries - Use mock data if enabled
export const getAppointments = dataConfig.useMocks
  ? async () => []
  : async (filters?: any) => (await import('./queries')).getAppointments(filters);

export const getUpcomingAppointments = dataConfig.useMocks
  ? async (userId: string, limit?: number) => (await import('@/lib/data/providers/appointments-provider')).getUpcomingAppointments(userId, limit)
  : async (userId: string, limit?: number) => (await import('./queries')).getUpcomingAppointments(userId, limit);

export const getAppointmentById = dataConfig.useMocks
  ? async () => null
  : async (id: string) => (await import('./queries')).getAppointmentById(id);

export const getAppointmentsByEntity = dataConfig.useMocks
  ? async () => []
  : async (entityType: string, entityId: string) => (await import('./queries')).getAppointmentsByEntity(entityType, entityId);

export const getAppointmentStats = dataConfig.useMocks
  ? async () => ({ total: 0, upcoming: 0, completed: 0, cancelled: 0 })
  : async () => (await import('./queries')).getAppointmentStats();

// Schemas
export {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
  calendarFiltersSchema,
  bulkRescheduleSchema,
  appointmentTypeSchema,
  appointmentStatusSchema,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
  type UpdateAppointmentStatusInput,
  type CalendarFilters,
  type BulkRescheduleInput,
  type AppointmentTypeEnum,
  type AppointmentStatusEnum,
} from './schemas';

// Calendar helpers
export {
  groupAppointmentsByDate,
  hasTimeConflict,
  getAppointmentDuration,
  formatTimeRange,
  isUpcoming,
  isOverdue,
  getAppointmentTypeColor,
  getAppointmentStatusColor,
  calculateReminderTime,
  sortAppointmentsByTime,
} from './calendar';

// Prisma types
export type { appointments } from '@prisma/client';
