'use client';

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import type { appointments } from '@prisma/client';
import { AppointmentCard } from './appointment-card';
import { cn } from '@/lib/utils';

interface CalendarMonthViewProps {
  currentDate: Date;
  appointments: appointments[];
}

export function CalendarMonthView({ currentDate, appointments }: CalendarMonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Get all days in month
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group appointments by day
  const appointmentsByDay = appointments.reduce((acc, apt) => {
    const dayKey = format(new Date(apt.start_time), 'yyyy-MM-dd');
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(apt);
    return acc;
  }, {} as Record<string, appointments[]>);

  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground">
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {daysInMonth.map((day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayAppointments = appointmentsByDay[dayKey] || [];
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isCurrentDay = isToday(day);

        return (
          <div
            key={day.toString()}
            className={cn(
              'min-h-[120px] border rounded-md p-2',
              !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
              isCurrentDay && 'border-primary bg-primary/5'
            )}
          >
            <div className={cn(
              'text-sm font-medium mb-1',
              isCurrentDay && 'text-primary'
            )}>
              {format(day, 'd')}
            </div>

            <div className="space-y-1">
              {dayAppointments.slice(0, 3).map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} variant="compact" />
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-xs text-muted-foreground pl-2">
                  +{dayAppointments.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
