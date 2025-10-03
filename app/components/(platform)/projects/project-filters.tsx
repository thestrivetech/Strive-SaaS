'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/(shared)/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/(shared)/ui/sheet';
import { Badge } from '@/components/(shared)/ui/badge';
import { Filter } from 'lucide-react';
import { MultiSelect } from '@/components/(shared)/ui/multi-select';
import { DateRangePicker } from '@/components/(shared)/ui/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/(shared)/ui/select';
import { ProjectStatus, Priority } from '@prisma/client';

interface ProjectFiltersProps {
  customers: Array<{ id: string; name: string }>;
  teamMembers: Array<{ id: string; name: string }>;
}

export function ProjectFilters({ customers, teamMembers }: ProjectFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current filters from URL
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    searchParams.get('status')?.split(',').filter(Boolean) || []
  );
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(
    searchParams.get('priority')?.split(',').filter(Boolean) || []
  );
  const [selectedManager, setSelectedManager] = useState<string>(
    searchParams.get('manager') || ''
  );
  const [selectedCustomer, setSelectedCustomer] = useState<string>(
    searchParams.get('customer') || ''
  );
  const [createdFrom, setCreatedFrom] = useState<Date | undefined>(
    searchParams.get('createdFrom') ? new Date(searchParams.get('createdFrom')!) : undefined
  );
  const [createdTo, setCreatedTo] = useState<Date | undefined>(
    searchParams.get('createdTo') ? new Date(searchParams.get('createdTo')!) : undefined
  );
  const [dueFrom, setDueFrom] = useState<Date | undefined>(
    searchParams.get('dueFrom') ? new Date(searchParams.get('dueFrom')!) : undefined
  );
  const [dueTo, setDueTo] = useState<Date | undefined>(
    searchParams.get('dueTo') ? new Date(searchParams.get('dueTo')!) : undefined
  );

  const statusOptions = [
    { value: 'PLANNING', label: 'Planning' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' },
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

    if (selectedManager) {
      params.set('manager', selectedManager);
    } else {
      params.delete('manager');
    }

    if (selectedCustomer) {
      params.set('customer', selectedCustomer);
    } else {
      params.delete('customer');
    }

    if (createdFrom) {
      params.set('createdFrom', createdFrom.toISOString());
    } else {
      params.delete('createdFrom');
    }

    if (createdTo) {
      params.set('createdTo', createdTo.toISOString());
    } else {
      params.delete('createdTo');
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

    params.set('page', '1'); // Reset to page 1 on filter change
    router.push(`?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedManager('');
    setSelectedCustomer('');
    setCreatedFrom(undefined);
    setCreatedTo(undefined);
    setDueFrom(undefined);
    setDueTo(undefined);
    router.push(window.location.pathname); // Clear all params
  };

  const filterCount =
    selectedStatuses.length +
    selectedPriorities.length +
    (selectedManager ? 1 : 0) +
    (selectedCustomer ? 1 : 0) +
    (createdFrom || createdTo ? 1 : 0) +
    (dueFrom || dueTo ? 1 : 0);

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
          <SheetTitle>Filter Projects</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down your project list
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

          {/* Project Manager filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Manager</label>
            <Select value={selectedManager} onValueChange={setSelectedManager}>
              <SelectTrigger>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">All managers</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer</label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">All customers</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Created date range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Created Date</label>
            <DateRangePicker
              from={createdFrom}
              to={createdTo}
              onSelect={(range) => {
                setCreatedFrom(range.from);
                setCreatedTo(range.to);
              }}
              placeholder="Select date range"
            />
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