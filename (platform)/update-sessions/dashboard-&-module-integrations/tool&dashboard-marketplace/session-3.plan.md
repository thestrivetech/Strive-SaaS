# Session 3: Marketplace UI - Tool Grid & Filters

## Session Overview
**Goal:** Build the marketplace UI components including tool grid, category filters, and search functionality following the exact design from the integration guide.

**Duration:** 3-4 hours
**Complexity:** Medium
**Dependencies:** Session 2 (Backend & Schemas)

## Objectives

1. ✅ Create main marketplace page layout
2. ✅ Build tool grid component with exact UI match
3. ✅ Implement category filter sidebar
4. ✅ Add search and filtering functionality
5. ✅ Create tool card components with pricing
6. ✅ Add responsive design patterns
7. ✅ Implement loading states and skeletons
8. ✅ Add "Add to Cart" button functionality

## Prerequisites

- [x] Session 2 completed (backend module ready)
- [x] Marketplace queries and actions available
- [x] shadcn/ui components installed
- [x] Understanding of Next.js 15 App Router

## Component Structure

```
app/real-estate/marketplace/
├── page.tsx                    # Main marketplace page
├── layout.tsx                  # Marketplace layout
└── loading.tsx                 # Loading state

components/real-estate/marketplace/
├── grid/
│   ├── MarketplaceGrid.tsx    # Tool grid component
│   └── ToolCard.tsx            # Individual tool card
├── filters/
│   ├── MarketplaceFilters.tsx # Filter sidebar
│   ├── CategoryFilter.tsx     # Category filter
│   └── SearchFilter.tsx        # Search input
└── shared/
    ├── PriceTag.tsx            # Price display
    └── CategoryBadge.tsx       # Category badge
```

## Step-by-Step Implementation

### Step 1: Create Marketplace Page Layout

**File:** `app/real-estate/marketplace/layout.tsx`

```typescript
export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-4xl font-bold text-gray-900">Tool Marketplace</h1>
            <p className="mt-2 text-lg text-gray-600">Build your perfect toolkit</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
```

### Step 2: Create Main Marketplace Page

**File:** `app/real-estate/marketplace/page.tsx`

```typescript
import { Suspense } from 'react';
import { MarketplaceGrid } from '@/components/real-estate/marketplace/grid/MarketplaceGrid';
import { MarketplaceFilters } from '@/components/real-estate/marketplace/filters/MarketplaceFilters';
import { ShoppingCartPanel } from '@/components/real-estate/marketplace/cart/ShoppingCartPanel';
import { Skeleton } from '@/components/ui/skeleton';

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="flex gap-8">
      {/* Filters Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <MarketplaceFilters />
        </Suspense>
      </div>

      {/* Tools Grid */}
      <div className="flex-1">
        <Suspense fallback={<GridSkeleton />}>
          <MarketplaceGrid searchParams={searchParams} />
        </Suspense>
      </div>

      {/* Shopping Cart Panel */}
      <div className="w-80 flex-shrink-0">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <ShoppingCartPanel />
        </Suspense>
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="h-80 w-full" />
      ))}
    </div>
  );
}
```

### Step 3: Create Tool Card Component

**File:** `components/real-estate/marketplace/grid/ToolCard.tsx`

```typescript
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addToCart } from '@/lib/modules/marketplace';
import type { MarketplaceTool } from '@prisma/client';

interface ToolCardProps {
  tool: MarketplaceTool & {
    _count?: {
      purchases: number;
      reviews: number;
    };
  };
  isPurchased?: boolean;
  isInCart?: boolean;
}

export function ToolCard({ tool, isPurchased, isInCart }: ToolCardProps) {
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return addToCart({
        item_type: 'tool',
        item_id: tool.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
      toast.success('Added to cart!');
    },
    onError: (error) => {
      toast.error('Failed to add to cart');
    },
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      FOUNDATION: 'bg-blue-500 text-white',
      GROWTH: 'bg-green-500 text-white',
      ELITE: 'bg-purple-500 text-white',
      CUSTOM: 'bg-orange-500 text-white',
      ADVANCED: 'bg-red-500 text-white',
      INTEGRATION: 'bg-indigo-500 text-white',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow relative">
      {isPurchased && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Owned
          </Badge>
        </div>
      )}

      <div className="space-y-4">
        {/* Price */}
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">
            ${(tool.price / 100).toFixed(0)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 leading-tight">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {tool.description}
        </p>

        {/* Category & Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getCategoryColor(tool.category)}>
            {tool.category}
          </Badge>
          {tool.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        {tool._count && (
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{tool._count.purchases} purchases</span>
            {tool.rating && (
              <span className="flex items-center gap-1">
                ⭐ {tool.rating.toFixed(1)}
              </span>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <Button
          onClick={() => addToCartMutation.mutate()}
          disabled={addToCartMutation.isPending || isPurchased || isInCart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isPurchased ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Already Owned
            </>
          ) : isInCart ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              In Cart
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
```

### Step 4: Create Marketplace Grid Component

**File:** `components/real-estate/marketplace/grid/MarketplaceGrid.tsx`

```typescript
import { getMarketplaceTools, getPurchasedTools } from '@/lib/modules/marketplace';
import { ToolCard } from './ToolCard';
import type { ToolFilters } from '@/lib/modules/marketplace';

interface MarketplaceGridProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function MarketplaceGrid({ searchParams }: MarketplaceGridProps) {
  // Parse filters from search params
  const filters: ToolFilters = {
    category: searchParams.category as any,
    tier: searchParams.tier as any,
    search: searchParams.search as string,
    sort_by: (searchParams.sort_by as any) || 'purchase_count',
    sort_order: (searchParams.sort_order as 'asc' | 'desc') || 'desc',
  };

  // Fetch tools and purchases
  const [tools, purchases] = await Promise.all([
    getMarketplaceTools(filters),
    getPurchasedTools().catch(() => []), // Ignore errors if not authenticated
  ]);

  const purchasedToolIds = new Set(purchases.map((p) => p.tool_id));

  if (tools.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No tools found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          isPurchased={purchasedToolIds.has(tool.id)}
        />
      ))}
    </div>
  );
}
```

### Step 5: Create Filter Sidebar Component

**File:** `components/real-estate/marketplace/filters/MarketplaceFilters.tsx`

```typescript
'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { ToolCategory, ToolTier } from '@prisma/client';

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
            {Object.values(ToolCategory).map((category) => (
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
            {Object.values(ToolTier).map((tier) => {
              const prices = { T1: '$100', T2: '$200', T3: '$300' };
              return (
                <div key={tier} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tier-${tier}`}
                    checked={selectedTiers.includes(tier)}
                    onCheckedChange={() => toggleTier(tier)}
                  />
                  <label
                    htmlFor={`tier-${tier}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {tier} ({prices[tier as keyof typeof prices]})
                  </label>
                </div>
              );
            })}
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
```

### Step 6: Create Loading States

**File:** `app/real-estate/marketplace/loading.tsx`

```typescript
import { Skeleton } from '@/components/ui/skeleton';

export default function MarketplaceLoading() {
  return (
    <div className="flex gap-8">
      {/* Filters Sidebar Skeleton */}
      <div className="w-64 flex-shrink-0">
        <Skeleton className="h-96 w-full" />
      </div>

      {/* Tools Grid Skeleton */}
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>

      {/* Cart Panel Skeleton */}
      <div className="w-80 flex-shrink-0">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
```

### Step 7: Add Responsive Design

**File:** `app/real-estate/marketplace/page.tsx` (update)

```typescript
// Add mobile-responsive layout
export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <MobileFilterToggle />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar - Hidden on mobile, drawer on tablet */}
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <MarketplaceFilters />
          </Suspense>
        </div>

        {/* Tools Grid - Full width on mobile */}
        <div className="flex-1">
          <Suspense fallback={<GridSkeleton />}>
            <MarketplaceGrid searchParams={searchParams} />
          </Suspense>
        </div>

        {/* Shopping Cart Panel - Fixed bottom on mobile, sidebar on desktop */}
        <div className="lg:w-80 lg:flex-shrink-0">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <ShoppingCartPanel />
          </Suspense>
        </div>
      </div>
    </>
  );
}
```

## Testing & Validation

### Test 1: Page Renders
```bash
# Start dev server and navigate to /real-estate/marketplace
npm run dev
```
**Expected:** Marketplace page loads with header, filters, grid, and cart

### Test 2: Filtering Works
- Select category filter
- Click "Apply"
**Expected:** URL updates with query params, grid re-renders with filtered tools

### Test 3: Search Works
- Enter search term
- Press Enter or click "Apply"
**Expected:** Tools filtered by search query

### Test 4: Tool Cards Display
**Expected:**
- Tool name, description, price visible
- Category badges with correct colors
- Add to Cart button functional

### Test 5: Responsive Layout
- Resize browser to mobile width
**Expected:** Layout adapts, filters collapse, cart moves to bottom

## Success Criteria

- [x] Main marketplace page renders correctly
- [x] Tool grid displays tools in card format
- [x] Filter sidebar with categories and tiers
- [x] Search functionality working
- [x] Tool cards match design (colors, layout, pricing)
- [x] Add to Cart button functional
- [x] Loading states with skeletons
- [x] Responsive design for mobile/tablet/desktop
- [x] URL-based filtering (shareable links)

## Files Created

- ✅ `app/real-estate/marketplace/page.tsx`
- ✅ `app/real-estate/marketplace/layout.tsx`
- ✅ `app/real-estate/marketplace/loading.tsx`
- ✅ `components/real-estate/marketplace/grid/MarketplaceGrid.tsx`
- ✅ `components/real-estate/marketplace/grid/ToolCard.tsx`
- ✅ `components/real-estate/marketplace/filters/MarketplaceFilters.tsx`

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Client/Server Component Confusion
**Problem:** Using hooks in Server Components
**Solution:** Mark interactive components with 'use client'

### ❌ Pitfall 2: Search Params Type Errors
**Problem:** searchParams type incompatibility
**Solution:** Properly type searchParams as `{ [key: string]: string | string[] | undefined }`

### ❌ Pitfall 3: Filter State Not Synced
**Problem:** Filters don't update URL
**Solution:** Use router.push() with URLSearchParams

### ❌ Pitfall 4: Missing Suspense Boundaries
**Problem:** Loading states don't show
**Solution:** Wrap async components in <Suspense>

### ❌ Pitfall 5: Category Colors Hardcoded
**Problem:** Inconsistent category badge colors
**Solution:** Use centralized color mapping function

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 4: Shopping Cart & Checkout**
2. ✅ Tool browsing and filtering complete
3. ✅ Can start building cart functionality
4. ✅ UI foundation ready for cart integration

---

**Session 3 Complete:** ✅ Marketplace UI with tool grid and filters fully implemented
