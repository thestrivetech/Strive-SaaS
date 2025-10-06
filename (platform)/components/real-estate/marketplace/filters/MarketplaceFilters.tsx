'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

const CATEGORIES = [
  'FOUNDATION',
  'GROWTH',
  'ELITE',
  'CUSTOM',
  'ADVANCED',
  'INTEGRATION',
] as const;

const TIERS = [
  { value: 'T1', label: 'Tier 1 ($100)' },
  { value: 'T2', label: 'Tier 2 ($200)' },
  { value: 'T3', label: 'Tier 3 ($300)' },
] as const;

export function MarketplaceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  );
  const [selectedTiers, setSelectedTiers] = React.useState<string[]>(
    searchParams.get('tier')?.split(',').filter(Boolean) || []
  );

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (selectedCategories.length > 0) {
      params.set('category', selectedCategories.join(','));
    }
    if (selectedTiers.length > 0) {
      params.set('tier', selectedTiers.join(','));
    }

    router.push(`/real-estate/marketplace?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedTiers([]);
    router.push('/real-estate/marketplace');
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleTier = (tier: string) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <Label htmlFor="search">Search Tools</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="pl-9"
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters();
              }}
            />
          </div>
        </div>

        {/* Categories */}
        <div>
          <Label>Categories</Label>
          <div className="space-y-2 mt-2">
            {CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Tiers */}
        <div>
          <Label>Price Tier</Label>
          <div className="space-y-2 mt-2">
            {TIERS.map((tier) => (
              <div key={tier.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`tier-${tier.value}`}
                  checked={selectedTiers.includes(tier.value)}
                  onCheckedChange={() => toggleTier(tier.value)}
                />
                <label
                  htmlFor={`tier-${tier.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {tier.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Apply/Clear Buttons */}
        <div className="flex gap-2">
          <Button onClick={applyFilters} className="flex-1">
            Apply
          </Button>
          <Button
            onClick={clearFilters}
            variant="outline"
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
