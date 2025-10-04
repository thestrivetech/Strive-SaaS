import type { appointments } from '@prisma/client';

/**
 * Calendar Helper Functions
 *
 * Utilities for calendar date calculations and appointment grouping
 */

/**
 * Group appointments by date
 *
 * @param appointments - Array of appointments
 * @returns Map of date string to appointments
 */
export function groupAppointmentsByDate(
  appointments: appointments[]
): Map<string, appointments[]> {
  const grouped = new Map<string, appointments[]>();

  for (const appointment of appointments) {
    const dateKey = appointment.start_time.toISOString().split('T')[0];

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }

    grouped.get(dateKey)!.push(appointment);
  }

  return grouped;
}

/**
 * Check if appointment conflicts with existing appointments
 *
 * @param newStart - New appointment start time
 * @param newEnd - New appointment end time
 * @param existing - Existing appointments
 * @param excludeId - Optional appointment ID to exclude from conflict check
 * @returns Boolean indicating if there's a conflict
 */
export function hasTimeConflict(
  newStart: Date,
  newEnd: Date,
  existing: appointments[],
  excludeId?: string
): boolean {
  return existing.some((appointment) => {
    if (excludeId && appointment.id === excludeId) {
      return false;
    }

    const existingStart = new Date(appointment.start_time);
    const existingEnd = new Date(appointment.end_time);

    // Check for overlap
    return (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );
  });
}

/**
 * Get appointment duration in minutes
 *
 * @param appointment - Appointment object
 * @returns Duration in minutes
 */
export function getAppointmentDuration(appointment: appointments): number {
  const start = new Date(appointment.start_time);
  const end = new Date(appointment.end_time);
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

/**
 * Format time range for display
 *
 * @param start - Start time
 * @param end - End time
 * @returns Formatted time range string
 */
export function formatTimeRange(start: Date, end: Date): string {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Check if appointment is upcoming (within next 24 hours)
 *
 * @param appointment - Appointment object
 * @returns Boolean indicating if appointment is upcoming
 */
export function isUpcoming(appointment: appointments): boolean {
  const now = new Date();
  const start = new Date(appointment.start_time);
  const hoursDiff = (start.getTime() - now.getTime()) / (1000 * 60 * 60);

  return hoursDiff > 0 && hoursDiff <= 24;
}

/**
 * Check if appointment is overdue (past start time and not completed)
 *
 * @param appointment - Appointment object
 * @returns Boolean indicating if appointment is overdue
 */
export function isOverdue(appointment: appointments): boolean {
  const now = new Date();
  const start = new Date(appointment.start_time);

  return (
    start < now &&
    appointment.status !== 'COMPLETED' &&
    appointment.status !== 'CANCELLED' &&
    appointment.status !== 'NO_SHOW'
  );
}

/**
 * Get appointment type color for UI
 *
 * @param type - Appointment type
 * @returns Tailwind color class
 */
export function getAppointmentTypeColor(type: string): string {
  switch (type) {
    case 'MEETING':
      return 'blue';
    case 'CALL':
      return 'green';
    case 'SHOWING':
      return 'purple';
    case 'OPEN_HOUSE':
      return 'orange';
    case 'FOLLOW_UP':
      return 'yellow';
    default:
      return 'gray';
  }
}

/**
 * Get appointment status color for UI
 *
 * @param status - Appointment status
 * @returns Tailwind color class
 */
export function getAppointmentStatusColor(status: string): string {
  switch (status) {
    case 'SCHEDULED':
      return 'blue';
    case 'CONFIRMED':
      return 'green';
    case 'COMPLETED':
      return 'gray';
    case 'CANCELLED':
      return 'red';
    case 'NO_SHOW':
      return 'orange';
    default:
      return 'gray';
  }
}

/**
 * Calculate reminder time
 *
 * @param appointmentTime - Appointment start time
 * @param minutesBefore - Minutes before appointment
 * @returns Reminder time
 */
export function calculateReminderTime(
  appointmentTime: Date,
  minutesBefore: number
): Date {
  return new Date(appointmentTime.getTime() - minutesBefore * 60000);
}

/**
 * Sort appointments by start time
 *
 * @param appointments - Array of appointments
 * @returns Sorted appointments
 */
export function sortAppointmentsByTime(
  appointments: appointments[]
): appointments[] {
  return [...appointments].sort((a, b) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });
}
