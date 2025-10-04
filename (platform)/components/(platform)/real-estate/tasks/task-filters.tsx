'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskStatus, Priority } from '@prisma/client';

interface TaskFiltersProps {
  teamMembers: Array<{ id: string; name: string }>;
}

export function TaskFilters({ teamMembers }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current filters from URL
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    searchParams.get('status')?.split(',').filter(Boolean) || []
  );
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(
    searchParams.get('priority')?.split(',').filter(Boolean) || []
  );
  const [selectedAssignee, setSelectedAssignee] = useState<string>(
    searchParams.get('assignee') || ''
  );
  const [dueFrom, setDueFrom] = useState<Date | undefined>(
    searchParams.get('dueFrom') ? new Date(searchParams.get('dueFrom')!) : undefined
  );
  const [dueTo, setDueTo] = useState<Date | undefined>(
    searchParams.get('dueTo') ? new Date(searchParams.get('dueTo')!) : undefined
  );
  const [showOverdueOnly, setShowOverdueOnly] = useState<boolean>(
    searchParams.get('overdue') === 'true'
  );

  const statusOptions = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'REVIEW', label: 'Review' },
    { value: 'DONE', label: 'Done' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Update URL params
    if (selectedStatuses.length > 0) {
      params.set('status', selectedStatuses.join(','));
    } else {
      params.delete('status');
    }

    if (selectedPriorities.length > 0) {
      params.set('priority', selectedPriorities.join(','));
    } else {
      params.delete('priority');
    }

    if (selectedAssignee && selectedAssignee !== '__none__') {
      params.set('assignee', selectedAssignee);
    } else {
      params.delete('assignee');
    }

    if (dueFrom) {
      params.set('dueFrom', dueFrom.toISOString());
    } else {
      params.delete('dueFrom');
    }

    if (dueTo) {
      params.set('dueTo', dueTo.toISOString());
    } else {
      params.delete('dueTo');
    }

    if (showOverdueOnly) {
      params.set('overdue', 'true');
    } else {
      params.delete('overdue');
    }

    params.set('page', '1'); // Reset to page 1 on filter change
    router.push(`?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedAssignee('');
    setDueFrom(undefined);
    setDueTo(undefined);
    setShowOverdueOnly(false);
    const pathname = window.location.pathname;
    router.push(pathname); // Clear all params
  };

  const filterCount =
    selectedStatuses.length +
    selectedPriorities.length +
    (selectedAssignee && selectedAssignee !== '__none__' ? 1 : 0) +
    (dueFrom || dueTo ? 1 : 0) +
    (showOverdueOnly ? 1 : 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {filterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {filterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Tasks</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down your task list
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Status filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <MultiSelect
              options={statusOptions}
              selected={selectedStatuses}
              onChange={setSelectedStatuses}
              placeholder="Select statuses"
            />
          </div>

          {/* Priority filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <MultiSelect
              options={priorityOptions}
              selected={selectedPriorities}
              onChange={setSelectedPriorities}
              placeholder="Select priorities"
            />
          </div>

          {/* Assignee filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assignee</label>
            <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">All assignees</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due date range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <DateRangePicker
              from={dueFrom}
              to={dueTo}
              onSelect={(range) => {
                setDueFrom(range.from);
                setDueTo(range.to);
              }}
              placeholder="Select date range"
            />
          </div>

          {/* Overdue toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="overdue"
              checked={showOverdueOnly}
              onCheckedChange={(checked) => setShowOverdueOnly(checked as boolean)}
            />
            <label
              htmlFor="overdue"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show overdue tasks only
            </label>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}