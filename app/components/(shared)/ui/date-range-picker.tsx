'use client';

import { useState } from 'react';
import { Calendar } from '@/components/(shared)/ui/calendar';
import { Button } from '@/components/(shared)/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/(shared)/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

interface DateRangePickerProps {
  from?: Date;
  to?: Date;
  onSelect: (range: { from?: Date; to?: Date }) => void;
  placeholder?: string;
}

export function DateRangePicker({
  from,
  to,
  onSelect,
  placeholder = 'Select date range',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const handlePreset = (preset: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case 'today':
        onSelect({ from: today, to: today });
        break;
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        onSelect({ from: yesterday, to: yesterday });
        break;
      }
      case 'last7days': {
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        onSelect({ from: last7, to: today });
        break;
      }
      case 'last30days': {
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        onSelect({ from: last30, to: today });
        break;
      }
      case 'thisMonth': {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        onSelect({ from: firstDay, to: today });
        break;
      }
      case 'lastMonth': {
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        onSelect({ from: firstDayLastMonth, to: lastDayLastMonth });
        break;
      }
    }
    setOpen(false);
  };

  const handleClear = () => {
    onSelect({ from: undefined, to: undefined });
    setOpen(false);
  };

  const formatDateRange = () => {
    if (!from && !to) return placeholder;
    if (from && !to) return format(from, 'MMM d, yyyy');
    if (!from && to) return format(to, 'MMM d, yyyy');
    if (from && to) {
      // If same year, only show year once
      if (from.getFullYear() === to.getFullYear()) {
        return `${format(from, 'MMM d')} - ${format(to, 'MMM d, yyyy')}`;
      }
      return `${format(from, 'MMM d, yyyy')} - ${format(to, 'MMM d, yyyy')}`;
    }
    return placeholder;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Preset buttons */}
          <div className="flex flex-col gap-2 p-3 border-r">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => handlePreset('today')}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => handlePreset('yesterday')}
            >
              Yesterday
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => handlePreset('last7days')}
            >
              Last 7 Days
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => handlePreset('last30days')}
            >
              Last 30 Days
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => handlePreset('thisMonth')}
            >
              This Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => handlePreset('lastMonth')}
            >
              Last Month
            </Button>
            <div className="border-t my-2" />
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={handleClear}
            >
              Clear
            </Button>
          </div>

          {/* Calendar */}
          <Calendar
            mode="range"
            selected={{ from, to }}
            onSelect={(range: DateRange | undefined) => {
              onSelect({
                from: range?.from,
                to: range?.to,
              });
            }}
            numberOfMonths={2}
            className="p-3"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}