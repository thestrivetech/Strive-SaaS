'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PropertyType, ListingStatus } from '@prisma/client';

export function ListingFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    const view = searchParams.get('view');
    if (search) params.set('search', search);
    if (view) params.set('view', view);
    router.push(`?${params.toString()}`);
  };

  const hasFilters =
    searchParams.has('property_type') ||
    searchParams.has('status') ||
    searchParams.has('min_price') ||
    searchParams.has('max_price') ||
    searchParams.has('min_bedrooms') ||
    searchParams.has('max_bedrooms');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {hasFilters && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {Array.from(searchParams.keys()).filter(key =>
                !['search', 'page', 'view'].includes(key)
              ).length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Filter Listings</span>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="space-y-4 p-4">
          {/* Property Type */}
          <div className="space-y-2">
            <Label>Property Type</Label>
            <Select
              value={searchParams.get('property_type') || 'all'}
              onValueChange={(value) => updateFilter('property_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(PropertyType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={searchParams.get('status') || 'all'}
              onValueChange={(value) => updateFilter('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.values(ListingStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label>Price Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={searchParams.get('min_price') || ''}
                onChange={(e) => updateFilter('min_price', e.target.value)}
                className="w-full"
              />
              <Input
                type="number"
                placeholder="Max"
                value={searchParams.get('max_price') || ''}
                onChange={(e) => updateFilter('max_price', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={searchParams.get('min_bedrooms') || ''}
                onChange={(e) => updateFilter('min_bedrooms', e.target.value)}
                className="w-full"
                min="0"
              />
              <Input
                type="number"
                placeholder="Max"
                value={searchParams.get('max_bedrooms') || ''}
                onChange={(e) => updateFilter('max_bedrooms', e.target.value)}
                className="w-full"
                min="0"
              />
            </div>
          </div>

          {/* Bathrooms */}
          <div className="space-y-2">
            <Label>Bathrooms</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={searchParams.get('min_bathrooms') || ''}
                onChange={(e) => updateFilter('min_bathrooms', e.target.value)}
                className="w-full"
                min="0"
                step="0.5"
              />
              <Input
                type="number"
                placeholder="Max"
                value={searchParams.get('max_bathrooms') || ''}
                onChange={(e) => updateFilter('max_bathrooms', e.target.value)}
                className="w-full"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          {/* Square Feet */}
          <div className="space-y-2">
            <Label>Square Feet</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={searchParams.get('min_sqft') || ''}
                onChange={(e) => updateFilter('min_sqft', e.target.value)}
                className="w-full"
              />
              <Input
                type="number"
                placeholder="Max"
                value={searchParams.get('max_sqft') || ''}
                onChange={(e) => updateFilter('max_sqft', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
