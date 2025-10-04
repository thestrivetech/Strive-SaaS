'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function ContactFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get('type');
  const currentStatus = searchParams.get('status');

  const hasActiveFilters = currentType || currentStatus;

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filters change
    params.delete('page');

    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('type');
    params.delete('status');
    params.delete('page');

    // Preserve search param if it exists
    const search = searchParams.get('search');
    if (!search) {
      router.push('/crm/contacts');
    } else {
      router.push(`?${params.toString()}`);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Select value={currentType || 'all'} onValueChange={(value) => updateFilter('type', value === 'all' ? null : value)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="PROSPECT">Prospect</SelectItem>
          <SelectItem value="CLIENT">Client</SelectItem>
          <SelectItem value="PAST_CLIENT">Past Client</SelectItem>
          <SelectItem value="PARTNER">Partner</SelectItem>
          <SelectItem value="VENDOR">Vendor</SelectItem>
        </SelectContent>
      </Select>

      <Select value={currentStatus || 'all'} onValueChange={(value) => updateFilter('status', value === 'all' ? null : value)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="INACTIVE">Inactive</SelectItem>
          <SelectItem value="DO_NOT_CONTACT">Do Not Contact</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
