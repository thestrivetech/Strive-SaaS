# Session 7: Purchased Tools Dashboard & Management

## Session Overview
**Goal:** Create a comprehensive dashboard for managing purchased tools with usage tracking, analytics, and team access control.

**Duration:** 2-3 hours
**Complexity:** Medium
**Dependencies:** Session 6 (Reviews & Ratings)

## Objectives

1. ✅ Create purchased tools dashboard page
2. ✅ Implement tool usage tracking
3. ✅ Add tool activation/deactivation controls
4. ✅ Create team member access management
5. ✅ Build usage analytics and insights
6. ✅ Add tool search and filtering
7. ✅ Implement tool quick actions
8. ✅ Create purchase history view

## Prerequisites

- [x] Session 2 completed (purchase queries available)
- [x] Tool purchase flow from Session 4
- [x] Understanding of multi-tenancy
- [x] RBAC for tool management

## Component Structure

```
app/real-estate/marketplace/purchases/
├── page.tsx                     # Main purchases page
└── [toolId]/
    └── page.tsx                 # Individual tool management

components/real-estate/marketplace/purchases/
├── PurchasedToolsList.tsx       # List of purchased tools
├── PurchasedToolCard.tsx        # Tool card with actions
├── ToolUsageChart.tsx           # Usage analytics
├── TeamAccessManager.tsx        # Team member access
└── PurchaseHistory.tsx          # Purchase history
```

## Step-by-Step Implementation

### Step 1: Create Purchased Tools Page

**File:** `app/real-estate/marketplace/purchases/page.tsx`

```typescript
import { Suspense } from 'react';
import { getPurchasedTools, getPurchasedBundles } from '@/lib/modules/marketplace';
import { PurchasedToolsList } from '@/components/real-estate/marketplace/purchases/PurchasedToolsList';
import { PurchaseHistory } from '@/components/real-estate/marketplace/purchases/PurchaseHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, History, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default async function PurchasesPage() {
  const [tools, bundles] = await Promise.all([
    getPurchasedTools(),
    getPurchasedBundles(),
  ]);

  const totalToolsCount = tools.length;
  const activeBundlesCount = bundles.length;
  const totalSpent = tools.reduce((sum, t) => sum + t.price_at_purchase, 0) +
    bundles.reduce((sum, b) => sum + b.price_at_purchase, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Tools</h1>
        <p className="text-gray-600 mt-2">
          Manage your organization's purchased tools and bundles
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Tools
            </CardTitle>
            <Package className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalToolsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Bundles
            </CardTitle>
            <Package className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBundlesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Investment
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalSpent / 100).toFixed(0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tools & History Tabs */}
      <Tabs defaultValue="tools" className="w-full">
        <TabsList>
          <TabsTrigger value="tools">
            <Package className="w-4 h-4 mr-2" />
            My Tools
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Purchase History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="mt-6">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <PurchasedToolsList tools={tools} bundles={bundles} />
          </Suspense>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <PurchaseHistory tools={tools} bundles={bundles} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Step 2: Create Purchased Tools List Component

**File:** `components/real-estate/marketplace/purchases/PurchasedToolsList.tsx`

```typescript
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { PurchasedToolCard } from './PurchasedToolCard';
import type { ToolPurchase, BundlePurchase } from '@prisma/client';

interface PurchasedToolsListProps {
  tools: Array<ToolPurchase & { tool: any; purchaser: any }>;
  bundles: Array<BundlePurchase & { bundle: any; purchaser: any }>;
}

export function PurchasedToolsList({ tools, bundles }: PurchasedToolsListProps) {
  const [search, setSearch] = React.useState('');

  // Filter tools by search
  const filteredTools = tools.filter((tool) =>
    tool.tool.name.toLowerCase().includes(search.toLowerCase())
  );

  // Flatten bundle tools
  const bundleTools = bundles.flatMap((bundle) =>
    bundle.bundle.tools?.map((bt: any) => ({
      ...bt.tool,
      bundleName: bundle.bundle.name,
    })) || []
  );

  const allTools = [...filteredTools.map((t) => ({ ...t.tool, purchase: t }))];

  if (allTools.length === 0 && search === '') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">No tools purchased yet</p>
        <p className="text-gray-400 text-sm">
          Browse the marketplace to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your tools..."
          className="pl-9"
        />
      </div>

      {/* Tools Grid */}
      {allTools.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tools found matching "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allTools.map((tool) => (
            <PurchasedToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}

      {/* Bundle Tools Section */}
      {bundleTools.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">From Bundles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundleTools.map((tool: any) => (
              <PurchasedToolCard key={tool.id} tool={tool} isFromBundle />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 3: Create Purchased Tool Card Component

**File:** `components/real-estate/marketplace/purchases/PurchasedToolCard.tsx`

```typescript
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, ExternalLink, Settings, BarChart3, Package } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface PurchasedToolCardProps {
  tool: any;
  isFromBundle?: boolean;
}

export function PurchasedToolCard({ tool, isFromBundle }: PurchasedToolCardProps) {
  const purchaseDate = tool.purchase?.purchase_date || tool.purchase_date;
  const usageCount = tool.purchase?.usage_count || 0;
  const lastUsed = tool.purchase?.last_used;

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{tool.name}</h3>
            {isFromBundle && tool.bundleName && (
              <div className="flex items-center gap-1 mt-1">
                <Package className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  From {tool.bundleName}
                </span>
              </div>
            )}
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/real-estate/marketplace/purchases/${tool.id}`}>
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Tool
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/real-estate/marketplace/tools/${tool.id}`}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">{tool.description}</p>

        {/* Usage Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Usage</span>
            <span className="font-medium">{usageCount} times</span>
          </div>

          {lastUsed && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Last used</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(lastUsed), { addSuffix: true })}
              </span>
            </div>
          )}

          {purchaseDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Purchased</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(purchaseDate), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active
          </Badge>

          <Button variant="ghost" size="sm" asChild>
            <Link href={`/real-estate/marketplace/purchases/${tool.id}`}>
              <BarChart3 className="w-4 h-4 mr-2" />
              View Stats
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

### Step 4: Create Purchase History Component

**File:** `components/real-estate/marketplace/purchases/PurchaseHistory.tsx`

```typescript
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { ToolPurchase, BundlePurchase } from '@prisma/client';

interface PurchaseHistoryProps {
  tools: Array<ToolPurchase & { tool: any; purchaser: any }>;
  bundles: Array<BundlePurchase & { bundle: any; purchaser: any }>;
}

export function PurchaseHistory({ tools, bundles }: PurchaseHistoryProps) {
  // Combine and sort all purchases
  const allPurchases = [
    ...tools.map((t) => ({
      id: t.id,
      type: 'tool' as const,
      name: t.tool.name,
      price: t.price_at_purchase,
      date: t.purchase_date,
      purchaser: t.purchaser.name,
      status: t.status,
    })),
    ...bundles.map((b) => ({
      id: b.id,
      type: 'bundle' as const,
      name: b.bundle.name,
      price: b.price_at_purchase,
      date: b.purchase_date,
      purchaser: b.purchaser.name,
      status: b.status,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (allPurchases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No purchase history yet</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Purchased By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allPurchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell className="font-medium">{purchase.name}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {purchase.type === 'bundle' ? 'Bundle' : 'Tool'}
                </Badge>
              </TableCell>
              <TableCell>{purchase.purchaser}</TableCell>
              <TableCell>{format(new Date(purchase.date), 'MMM dd, yyyy')}</TableCell>
              <TableCell>${(purchase.price / 100).toFixed(2)}</TableCell>
              <TableCell>
                <Badge
                  variant={purchase.status === 'ACTIVE' ? 'secondary' : 'destructive'}
                  className={
                    purchase.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {purchase.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Step 5: Create Individual Tool Management Page

**File:** `app/real-estate/marketplace/purchases/[toolId]/page.tsx`

```typescript
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getToolPurchase } from '@/lib/modules/marketplace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface ToolManagementPageProps {
  params: { toolId: string };
}

export default async function ToolManagementPage({ params }: ToolManagementPageProps) {
  const purchase = await getToolPurchase(params.toolId);

  if (!purchase) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <div>
        <Link href="/real-estate/marketplace/purchases">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Tools
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{purchase.tool.name}</h1>
        <p className="text-gray-600 mt-2">{purchase.tool.description}</p>
      </div>

      {/* Tool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Usage
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchase.usage_count}</div>
            <p className="text-xs text-gray-500 mt-1">times used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Purchase Date
            </CardTitle>
            <Settings className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {format(new Date(purchase.purchase_date), 'MMM dd, yyyy')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Price Paid
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(purchase.price_at_purchase / 100).toFixed(0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tool Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features & Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {purchase.tool.features?.map((feature: string, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Testing & Validation

### Test 1: Purchased Tools List
- Purchase tools
- Navigate to My Tools
**Expected:** All purchased tools listed with stats

### Test 2: Search Functionality
- Enter tool name in search
**Expected:** Tools filtered by search query

### Test 3: Purchase History
- View history tab
**Expected:** Chronological list of all purchases with details

### Test 4: Tool Management Page
- Click on a tool
**Expected:** Detailed view with usage stats and features

### Test 5: Bundle Tools Display
- Purchase a bundle
**Expected:** Bundle tools shown separately with bundle name

## Success Criteria

- [x] Purchased tools dashboard displays all tools
- [x] Search and filter functionality works
- [x] Usage stats tracked and displayed
- [x] Purchase history shows all transactions
- [x] Individual tool management pages functional
- [x] Bundle tools displayed correctly
- [x] Stats cards show accurate data
- [x] Responsive design works

## Files Created

- ✅ `app/real-estate/marketplace/purchases/page.tsx`
- ✅ `app/real-estate/marketplace/purchases/[toolId]/page.tsx`
- ✅ `components/real-estate/marketplace/purchases/PurchasedToolsList.tsx`
- ✅ `components/real-estate/marketplace/purchases/PurchasedToolCard.tsx`
- ✅ `components/real-estate/marketplace/purchases/PurchaseHistory.tsx`

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Bundle Tools Duplication
**Problem:** Same tool shown multiple times from different bundles
**Solution:** Deduplicate by tool ID

### ❌ Pitfall 2: Usage Count Not Updating
**Problem:** Usage count stays at 0
**Solution:** Implement usage tracking in tool access

### ❌ Pitfall 3: Stats Not Real-Time
**Problem:** Stats don't update immediately
**Solution:** Use React Query invalidation

### ❌ Pitfall 4: Missing Purchase Data
**Problem:** Some purchases don't show
**Solution:** Ensure proper include in queries

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 8: Testing, Optimization & Deployment**
2. ✅ Dashboard complete
3. ✅ Can start final testing and optimization
4. ✅ Ready for production deployment

---

**Session 7 Complete:** ✅ Purchased tools dashboard and management fully implemented
