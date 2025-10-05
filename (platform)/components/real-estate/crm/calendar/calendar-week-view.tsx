'use client';

import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import type { appointments } from '@prisma/client';
import { AppointmentCard } from './appointment-card';
import { cn } from '@/lib/utils';

interface CalendarWeekViewProps {
  currentDate: Date;
  appointments: appointments[];
}

export function CalendarWeekView({ currentDate, appointments }: CalendarWeekViewProps) {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const appointmentsByDay = appointments.reduce((acc, apt) => {
    const dayKey = format(new Date(apt.start_time), 'yyyy-MM-dd');
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(apt);
    return acc;
  }, {} as Record<string, appointments[]>);

  return (
    <div className="grid grid-cols-7 gap-2">
      {daysInWeek.map((day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayAppointments = appointmentsByDay[dayKey] || [];
        const isCurrentDay = isToday(day);

        return (
          <div key={day.toString()} className="space-y-2">
            <div className={cn(
              'text-center p-2 rounded-md',
              isCurrentDay && 'bg-primary text-primary-foreground'
            )}>
              <div className="text-xs uppercase">{format(day, 'EEE')}</div>
              <div className="text-lg font-semibold">{format(day, 'd')}</div>
            </div>

            <div className="space-y-1">
              {dayAppointments.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} variant="compact" />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
