'use client';

import { useState } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { appointments } from '@prisma/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarMonthView } from './calendar-month-view';
import { CalendarWeekView } from './calendar-week-view';
import { CalendarDayView } from './calendar-day-view';
import { AppointmentFormDialog } from './appointment-form-dialog';

interface CalendarViewProps {
  appointments: appointments[];
  organizationId: string;
}

export function CalendarView({ appointments, organizationId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {view === 'month' && format(currentDate, 'MMMM yyyy')}
              {view === 'week' && format(currentDate, 'MMMM yyyy')}
              {view === 'day' && format(currentDate, 'MMMM d, yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={(v) => setView(v as any)}>
              <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
              </TabsList>
            </Tabs>

            <AppointmentFormDialog organizationId={organizationId} />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {view === 'month' && (
          <CalendarMonthView currentDate={currentDate} appointments={appointments} />
        )}
        {view === 'week' && (
          <CalendarWeekView currentDate={currentDate} appointments={appointments} />
        )}
        {view === 'day' && (
          <CalendarDayView currentDate={currentDate} appointments={appointments} />
        )}
      </CardContent>
    </Card>
  );
}
