'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
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
import { CustomerStatus, CustomerSource } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { MultiSelect } from '@/components/ui/multi-select';
import { DateRangePicker } from '@/components/ui/date-range-picker';

export function CustomerFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current filters from URL
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    searchParams.get('status')?.split(',').filter(Boolean) || []
  );
  const [selectedSources, setSelectedSources] = useState<string[]>(
    searchParams.get('source')?.split(',').filter(Boolean) || []
  );
  const [createdFrom, setCreatedFrom] = useState<Date | undefined>(
    searchParams.get('createdFrom') ? new Date(searchParams.get('createdFrom')!) : undefined
  );
  const [createdTo, setCreatedTo] = useState<Date | undefined>(
    searchParams.get('createdTo') ? new Date(searchParams.get('createdTo')!) : undefined
  );

  const statusOptions = [
    { value: 'LEAD', label: 'Lead' },
    { value: 'PROSPECT', label: 'Prospect' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'CHURNED', label: 'Churned' },
  ];

  const sourceOptions = [
    { value: 'WEBSITE', label: 'Website' },
    { value: 'REFERRAL', label: 'Referral' },
    { value: 'SOCIAL', label: 'Social Media' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Update URL params
    if (selectedStatuses.length > 0) {
      params.set('status', selectedStatuses.join(','));
    } else {
      params.delete('status');
    }

    if (selectedSources.length > 0) {
      params.set('source', selectedSources.join(','));
    } else {
      params.delete('source');
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

    params.set('page', '1'); // Reset to page 1 on filter change
    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedSources([]);
    setCreatedFrom(undefined);
    setCreatedTo(undefined);
    router.push(window.location.pathname); // Clear all params
  };

  const filterCount =
    selectedStatuses.length + selectedSources.length + (createdFrom || createdTo ? 1 : 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
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
          <SheetTitle>Filter Customers</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down your customer list
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

          {/* Source filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Source</label>
            <MultiSelect
              options={sourceOptions}
              selected={selectedSources}
              onChange={setSelectedSources}
              placeholder="Select sources"
            />
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
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={clearAllFilters}>
            Clear Filters
          </Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}