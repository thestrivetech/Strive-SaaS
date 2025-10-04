'use client';

import { format } from 'date-fns';
import type { appointments } from '@prisma/client';
import { AppointmentCard } from './appointment-card';

interface CalendarDayViewProps {
  currentDate: Date;
  appointments: appointments[];
}

export function CalendarDayView({ currentDate, appointments }: CalendarDayViewProps) {
  const dayAppointments = appointments.filter((apt) =>
    format(new Date(apt.start_time), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
  );

  // Sort by start time
  const sortedAppointments = dayAppointments.sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="text-center p-4 border rounded-lg bg-accent/50">
        <div className="text-2xl font-bold">{format(currentDate, 'EEEE')}</div>
        <div className="text-muted-foreground">{format(currentDate, 'MMMM d, yyyy')}</div>
      </div>

      {sortedAppointments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No appointments scheduled for this day
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAppointments.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} />
          ))}
        </div>
      )}
    </div>
  );
}
