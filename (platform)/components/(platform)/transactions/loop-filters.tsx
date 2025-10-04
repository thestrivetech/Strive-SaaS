'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useState } from 'react';

export function LoopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1 when filtering
    router.push(`?${params.toString()}`);
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    router.push('/transactions');
  };

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[200px] max-w-md">
        <div className="flex gap-2">
          <Input
            placeholder="Search by address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button size="icon" variant="outline" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Select
        value={searchParams.get('status') || ''}
        onValueChange={(value) => handleFilterChange('status', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="UNDER_CONTRACT">Under Contract</SelectItem>
          <SelectItem value="CLOSING">Closing</SelectItem>
          <SelectItem value="CLOSED">Closed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('type') || ''}
        onValueChange={(value) => handleFilterChange('type', value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Types</SelectItem>
          <SelectItem value="PURCHASE_AGREEMENT">Purchase Agreement</SelectItem>
          <SelectItem value="LISTING_AGREEMENT">Listing Agreement</SelectItem>
          <SelectItem value="LEASE_AGREEMENT">Lease Agreement</SelectItem>
          <SelectItem value="COMMERCIAL_PURCHASE">Commercial Purchase</SelectItem>
          <SelectItem value="COMMERCIAL_LEASE">Commercial Lease</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  );
}
