/**
 * Appointments Module
 *
 * Public API for appointment management
 *
 * @module appointments
 */

// Actions (Server Actions)
export {
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  bulkRescheduleAppointments,
} from './actions';

// Queries
export {
  getAppointments,
  getUpcomingAppointments,
  getAppointmentById,
  getAppointmentsByEntity,
  getAppointmentStats,
} from './queries';

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
