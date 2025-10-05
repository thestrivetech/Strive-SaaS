// lib/services/appointment-service.ts
import 'server-only';

import { PrismaClient } from '@prisma/client';
import { requestShowing } from './crm-integration';

const prisma = new PrismaClient();

export interface ShowingRequest {
  propertyId: string;
  propertyAddress: string;
  requestedDate?: Date;
  requestedTime?: string;
  preferredContactMethod?: 'email' | 'phone' | 'text';
  notes?: string;
}

export interface ShowingResponse {
  success: boolean;
  appointmentId?: string;
  agentInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  confirmationMessage: string;
}

/**
 * Schedule a property showing from chatbot
 */
export async function scheduleShowing(params: {
  sessionId: string;
  organizationId: string;
  showingRequest: ShowingRequest;
}): Promise<ShowingResponse> {
  const { sessionId, organizationId, showingRequest } = params;

  try {
    // Use CRM integration to create showing appointment
    const { appointmentId } = await requestShowing({
      sessionId,
      organizationId,
      propertyId: showingRequest.propertyId,
      propertyAddress: showingRequest.propertyAddress,
      requestedDate: showingRequest.requestedDate,
      requestedTime: showingRequest.requestedTime,
    });

    // Get appointment details
    const appointment = await prisma.appointments.findUnique({
      where: { id: appointmentId },
      include: {
        users: {
          select: {
            full_name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found after creation');
    }

    const confirmationMessage = buildConfirmationMessage(appointment, showingRequest);

    return {
      success: true,
      appointmentId,
      agentInfo: appointment.users ? {
        name: appointment.users.full_name || 'Your Agent',
        email: appointment.users.email,
        phone: appointment.users.phone || '',
      } : undefined,
      confirmationMessage,
    };
  } catch (error) {
    console.error('❌ Showing scheduling error:', error);

    return {
      success: false,
      confirmationMessage: "I'm having trouble scheduling the showing right now. Let me connect you with an agent who can help you schedule this personally.",
    };
  }
}

/**
 * Build confirmation message for showing
 */
function buildConfirmationMessage(
  appointment: any,
  request: ShowingRequest
): string {
  const agentName = appointment.users?.full_name || 'your agent';
  const date = new Date(appointment.start_time);

  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `🎉 **Showing Scheduled!**

**Property:** ${request.propertyAddress}
**Date:** ${dateStr}
**Time:** ${timeStr}
**Agent:** ${agentName}

${agentName} will reach out to you shortly to confirm the details. You'll receive a confirmation ${appointment.users?.email ? `at ${appointment.users.email}` : 'soon'}.

Is there anything else you'd like to know about this property or would you like to schedule more showings?`;
}

/**
 * Cancel a showing appointment
 */
export async function cancelShowing(params: {
  appointmentId: string;
  sessionId: string;
  organizationId: string;
  reason?: string;
}): Promise<{ success: boolean; message: string }> {
  const { appointmentId, reason } = params;

  try {
    await prisma.appointments.update({
      where: { id: appointmentId },
      data: {
        status: 'CANCELLED',
        description: reason
          ? `${reason}\n\nCancelled via chatbot`
          : 'Cancelled via chatbot',
      },
    });

    return {
      success: true,
      message: 'Showing cancelled successfully. Would you like to schedule a different time?',
    };
  } catch (error) {
    console.error('❌ Showing cancellation error:', error);

    return {
      success: false,
      message: 'Unable to cancel showing. Please contact your agent directly.',
    };
  }
}

/**
 * Reschedule a showing
 */
export async function rescheduleShowing(params: {
  appointmentId: string;
  newDate: Date;
  newTime?: string;
}): Promise<{ success: boolean; message: string }> {
  const { appointmentId, newDate, newTime } = params;

  try {
    const endTime = new Date(newDate.getTime() + 60 * 60 * 1000); // 1 hour later

    await prisma.appointments.update({
      where: { id: appointmentId },
      data: {
        start_time: newDate,
        end_time: endTime,
        status: 'RESCHEDULED',
      },
    });

    const dateStr = newDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const timeStr = newDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return {
      success: true,
      message: `✅ Showing rescheduled to ${dateStr} at ${timeStr}. Your agent will confirm the new time with you shortly.`,
    };
  } catch (error) {
    console.error('❌ Showing rescheduling error:', error);

    return {
      success: false,
      message: 'Unable to reschedule showing. Please contact your agent directly.',
    };
  }
}

/**
 * Get upcoming showings for a session
 */
export async function getUpcomingShowings(params: {
  sessionId: string;
  organizationId: string;
}): Promise<
  Array<{
    id: string;
    propertyAddress: string;
    date: Date;
    agentName: string;
    status: string;
  }>
> {
  const { sessionId, organizationId } = params;

  try {
    // Find lead by session
    const lead = await prisma.leads.findFirst({
      where: {
        organization_id: organizationId,
        custom_fields: {
          path: ['chatbot_session_id'],
          equals: sessionId,
        },
      },
    });

    if (!lead) {
      return [];
    }

    // Get appointments from activities
    const activities = await prisma.activities.findMany({
      where: {
        organization_id: organizationId,
        lead_id: lead.id,
        type: 'CALL', // Showing requests are logged as CALL type
        title: {
          contains: 'Showing',
        },
      },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    // Extract appointment IDs from metadata
    const appointmentIds = activities
      .filter(a => a.metadata && (a.metadata as any).appointment_id)
      .map(a => (a.metadata as any).appointment_id);

    if (appointmentIds.length === 0) {
      return [];
    }

    // Get actual appointments
    const appointments = await prisma.appointments.findMany({
      where: {
        id: { in: appointmentIds },
        start_time: { gte: new Date() }, // Only future appointments
      },
      include: {
        users: {
          select: {
            full_name: true,
          },
        },
      },
      orderBy: { start_time: 'asc' },
    });

    return appointments.map(apt => ({
      id: apt.id,
      propertyAddress: apt.location || 'Property Address',
      date: apt.start_time,
      agentName: apt.users?.full_name || 'Your Agent',
      status: apt.status,
    }));
  } catch (error) {
    console.error('❌ Error fetching showings:', error);
    return [];
  }
}

/**
 * Suggest showing times based on availability
 */
export function suggestShowingTimes(
  requestedDate?: Date
): Array<{ date: Date; label: string }> {
  const suggestions: Array<{ date: Date; label: string }> = [];
  const now = new Date();

  // If no date requested, suggest next 3 business days
  if (!requestedDate) {
    for (let i = 1; i <= 3; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Morning slot (10 AM)
      const morning = new Date(date);
      morning.setHours(10, 0, 0, 0);
      suggestions.push({
        date: morning,
        label: `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at 10:00 AM`,
      });

      // Afternoon slot (2 PM)
      const afternoon = new Date(date);
      afternoon.setHours(14, 0, 0, 0);
      suggestions.push({
        date: afternoon,
        label: `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at 2:00 PM`,
      });

      if (suggestions.length >= 5) break;
    }
  } else {
    // Suggest times on the requested date
    const times = [10, 11, 14, 15, 16]; // 10 AM, 11 AM, 2 PM, 3 PM, 4 PM

    for (const hour of times) {
      const timeSlot = new Date(requestedDate);
      timeSlot.setHours(hour, 0, 0, 0);

      // Only suggest future times
      if (timeSlot > now) {
        suggestions.push({
          date: timeSlot,
          label: timeSlot.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
        });
      }
    }
  }

  return suggestions.slice(0, 5);
}

/**
 * Parse natural language date/time from user message
 */
export function parseNaturalDateTime(message: string): Date | null {
  const now = new Date();
  const lowerMessage = message.toLowerCase();

  // Tomorrow
  if (lowerMessage.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // Default to 10 AM
    return tomorrow;
  }

  // Next week
  if (lowerMessage.includes('next week')) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(10, 0, 0, 0);
    return nextWeek;
  }

  // This weekend
  if (lowerMessage.includes('weekend') || lowerMessage.includes('saturday')) {
    const saturday = new Date(now);
    const daysUntilSaturday = (6 - saturday.getDay() + 7) % 7 || 7;
    saturday.setDate(saturday.getDate() + daysUntilSaturday);
    saturday.setHours(10, 0, 0, 0);
    return saturday;
  }

  // Today
  if (lowerMessage.includes('today')) {
    const today = new Date(now);
    today.setHours(now.getHours() + 2, 0, 0, 0); // 2 hours from now
    return today;
  }

  // Specific day of week (e.g., "Monday", "Tuesday")
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < daysOfWeek.length; i++) {
    if (lowerMessage.includes(daysOfWeek[i])) {
      const targetDay = new Date(now);
      const currentDay = targetDay.getDay();
      const daysUntilTarget = (i - currentDay + 7) % 7 || 7;
      targetDay.setDate(targetDay.getDate() + daysUntilTarget);
      targetDay.setHours(10, 0, 0, 0);
      return targetDay;
    }
  }

  // Try to parse explicit date (e.g., "12/25" or "December 25")
  // This is simplified - in production use a library like chrono-node
  const dateMatch = lowerMessage.match(/(\d{1,2})\/(\d{1,2})/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1]) - 1; // 0-indexed
    const day = parseInt(dateMatch[2]);
    const date = new Date(now.getFullYear(), month, day, 10, 0, 0, 0);

    // If date is in the past, assume next year
    if (date < now) {
      date.setFullYear(date.getFullYear() + 1);
    }

    return date;
  }

  return null;
}
