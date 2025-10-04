import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { startOfMonth, endOfMonth } from 'date-fns';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getAppointments, getUpcomingAppointments } from '@/lib/modules/appointments';
import { CalendarView } from '@/components/(platform)/crm/calendar/calendar-view';
import { TaskList } from '@/components/(platform)/crm/calendar/task-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

async function CalendarData() {
  const user = await getCurrentUser();

  if (!user || !user.organization_members || user.organization_members.length === 0) {
    redirect('/login');
  }

  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);

  const [appointments, upcoming] = await Promise.all([
    getAppointments({
      start_date: startDate,
      end_date: endDate,
    }),
    getUpcomingAppointments(user.id, 5),
  ]);

  const organizationId = user.organization_members[0].organization_id;

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="lg:col-span-3">
        <CalendarView appointments={appointments} organizationId={organizationId} />
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming appointments
              </p>
            ) : (
              upcoming.map((apt) => (
                <div key={apt.id} className="text-sm space-y-1 pb-2 border-b last:border-0">
                  <p className="font-medium">{apt.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(apt.start_time), 'MMM d, h:mm a')}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <TaskList userId={user.id} />
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="lg:col-span-3">
        <Skeleton className="h-[600px]" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[200px]" />
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar & Appointments</h1>
        <p className="text-muted-foreground">
          Manage your schedule and appointments
        </p>
      </div>

      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarData />
      </Suspense>
    </div>
  );
}
