'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Event {
  date: string;
  title: string;
  type: 'meeting' | 'showing' | 'deadline' | 'appointment' | 'reminder';
  time: string;
  href?: string;
}

/**
 * MiniCalendar Component
 *
 * Compact calendar popover showing current month and upcoming events
 *
 * Features:
 * - Month navigation
 * - Current day highlighting
 * - Event indicators on dates
 * - Upcoming events list
 * - Quick navigation to full calendar
 */
export function MiniCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Mock events data (TODO: Replace with real data from database)
  const mockEvents: Event[] = [
    {
      date: '2025-10-10',
      title: 'Client Meeting - Johnson Property',
      type: 'meeting',
      time: '2:00 PM',
      href: '/real-estate/crm/calendar',
    },
    {
      date: '2025-10-12',
      title: 'Property Showing - 123 Main St',
      type: 'showing',
      time: '10:00 AM',
      href: '/real-estate/workspace/listings',
    },
    {
      date: '2025-10-15',
      title: 'Contract Deadline - Smith Deal',
      type: 'deadline',
      time: '5:00 PM',
      href: '/real-estate/crm/deals',
    },
    {
      date: '2025-10-18',
      title: 'Inspection Appointment',
      type: 'appointment',
      time: '9:00 AM',
      href: '/real-estate/workspace/workspace-dashboard',
    },
    {
      date: '2025-10-20',
      title: 'Follow-up Call Reminder',
      type: 'reminder',
      time: '3:00 PM',
      href: '/real-estate/crm/contacts',
    },
  ];

  // Get upcoming events (next 5)
  const getUpcomingEvents = (): Event[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return mockEvents
      .filter((event) => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const upcomingEvents = getUpcomingEvents();

  // Check if date has events
  const hasEvents = (date: Date): boolean => {
    const dateString = date.toISOString().split('T')[0];
    return mockEvents.some((event) => event.date === dateString);
  };

  // Navigate months
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  // Get event type color
  const getEventTypeColor = (type: string): string => {
    const colors = {
      meeting: 'bg-blue-500',
      showing: 'bg-green-500',
      deadline: 'bg-red-500',
      appointment: 'bg-purple-500',
      reminder: 'bg-yellow-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  // Get event type badge variant
  const getEventTypeBadgeVariant = (
    type: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const variants = {
      meeting: 'default',
      showing: 'secondary',
      deadline: 'destructive',
      appointment: 'secondary',
      reminder: 'outline',
    };
    return (variants[type as keyof typeof variants] || 'default') as
      | 'default'
      | 'secondary'
      | 'destructive'
      | 'outline';
  };

  // Format date for display
  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-medium">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="border rounded-lg p-3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="w-full"
          modifiers={{
            hasEvents: (date) => hasEvents(date),
          }}
          modifiersClassNames={{
            hasEvents: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary',
          }}
        />
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-3 px-2">
          <h3 className="text-sm font-medium text-muted-foreground">Upcoming Events</h3>
          <Link href="/real-estate/crm/calendar">
            <Button variant="ghost" size="sm" className="h-7 text-xs hover:text-primary">
              View All
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarIcon className="h-10 w-10 text-muted-foreground opacity-50 mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event, index) => (
              <Link
                key={index}
                href={event.href || '/real-estate/crm/calendar'}
                className="block p-3 rounded-lg border border-border hover:bg-accent hover:border-primary transition-all group"
              >
                <div className="flex items-start gap-3">
                  {/* Event Type Indicator */}
                  <div className={cn('w-1 h-full rounded-full', getEventTypeColor(event.type))} />

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {event.title}
                      </h4>
                      <Badge variant={getEventTypeBadgeVariant(event.type)} className="text-xs">
                        {event.type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatEventDate(event.date)}</span>
                      <span>•</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="pt-2 border-t border-border">
        <Link href="/real-estate/crm/calendar">
          <Button variant="outline" size="sm" className="w-full">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Open Full Calendar
          </Button>
        </Link>
      </div>
    </div>
  );
}
