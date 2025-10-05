# Tool Marketplace Integration Guide

## Overview
This guide provides step-by-step instructions to integrate the Tool Marketplace module into the Strive SaaS Platform, preserving the exact UI design and functionality while adapting it to the platform's multi-tenant architecture.

## Prerequisites
- Existing Strive SaaS Platform setup (Next.js 15, Prisma, Supabase)
- Tool Marketplace code imported into repository
- Understanding of multi-tenant RLS and RBAC patterns

## UI Design Analysis (From Live Preview)
**Color Scheme:**
- Primary background: Clean white/light theme
- Category tags: Blue (#3B82F6), Green (#10B981), Purple (#8B5CF6), Orange (#F59E0B)
- Pricing: Bold black text
- Tool cards: White background with subtle shadows

**Layout Pattern:**
- Grid-based layout with responsive cards
- Header: "Tool Marketplace" + "Build your perfect toolkit"
- Category filter sidebar
- Tool cards with: Title, Description, Category tags, Price, Add button
- Shopping cart panel: "Your Plan" with selected items

## Integration Steps

### Phase 1: Database Schema Integration

#### 1.1 Add Tool Marketplace Tables to Prisma Schema
Add to existing `prisma/schema.prisma`:

```prisma
// Tool Marketplace Module Tables
model MarketplaceTool {
  id             String   @id @default(cuid())
  name           String
  description    String
  category       ToolCategory
  tier           ToolTier
  price          Int      // Price in cents
  isActive       Boolean  @default(true)
  
  // Features and capabilities
  features       String[]
  capabilities   String[]
  integrations   String[]
  
  // Usage tracking
  purchaseCount  Int      @default(0)
  rating         Float?
  
  // Metadata
  icon           String?  // Icon name or image URL
  tags           String[]
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  purchases      ToolPurchase[]
  reviews        ToolReview[]
  bundles        BundleTool[]
  
  @@map("marketplace_tools")
}

model ToolPurchase {
  id             String   @id @default(cuid())
  toolId         String
  tool           MarketplaceTool @relation(fields: [toolId], references: [id])
  
  // Purchase details
  priceAtPurchase Int     // Price when purchased (in cents)
  purchaseDate   DateTime @default(now())
  status         PurchaseStatus @default(ACTIVE)
  
  // Usage tracking
  lastUsed       DateTime?
  usageCount     Int      @default(0)
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  purchasedBy    String
  purchaser      User     @relation(fields: [purchasedBy], references: [id])
  
  @@unique([toolId, organizationId])
  @@map("tool_purchases")
}

model ToolBundle {
  id             String   @id @default(cuid())
  name           String
  description    String
  bundleType     BundleType
  originalPrice  Int      // Sum of individual tool prices
  bundlePrice    Int      // Discounted bundle price
  discount       Float    // Discount percentage
  
  // Bundle metadata
  isActive       Boolean  @default(true)
  isPopular      Boolean  @default(false)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  tools          BundleTool[]
  purchases      BundlePurchase[]
  
  @@map("tool_bundles")
}

model BundleTool {
  id       String @id @default(cuid())
  bundleId String
  bundle   ToolBundle @relation(fields: [bundleId], references: [id])
  toolId   String
  tool     MarketplaceTool @relation(fields: [toolId], references: [id])
  
  @@unique([bundleId, toolId])
  @@map("bundle_tools")
}

model BundlePurchase {
  id             String   @id @default(cuid())
  bundleId       String
  bundle         ToolBundle @relation(fields: [bundleId], references: [id])
  
  priceAtPurchase Int     // Bundle price when purchased
  purchaseDate   DateTime @default(now())
  status         PurchaseStatus @default(ACTIVE)
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  purchasedBy    String
  purchaser      User     @relation(fields: [purchasedBy], references: [id])
  
  @@map("bundle_purchases")
}

model ToolReview {
  id       String @id @default(cuid())
  toolId   String
  tool     MarketplaceTool @relation(fields: [toolId], references: [id])
  
  rating   Int    // 1-5 stars
  review   String?
  
  createdAt DateTime @default(now())
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  reviewerId String
  reviewer   User   @relation(fields: [reviewerId], references: [id])
  
  @@unique([toolId, reviewerId])
  @@map("tool_reviews")
}

model ShoppingCart {
  id             String   @id @default(cuid())
  
  // Cart contents
  tools          Json     // Array of tool IDs and quantities
  bundles        Json     // Array of bundle IDs
  totalPrice     Int      // Total price in cents
  
  // Cart metadata
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])
  
  @@map("shopping_carts")
}

enum ToolCategory {
  FOUNDATION
  GROWTH
  ELITE
  CUSTOM
  ADVANCED
  INTEGRATION
}

enum ToolTier {
  T1   // $100 tools
  T2   // $200 tools  
  T3   // $300 tools
}

enum BundleType {
  STARTER_PACK
  GROWTH_PACK
  ELITE_PACK
  CUSTOM_PACK
}

enum PurchaseStatus {
  ACTIVE
  CANCELLED
  REFUNDED
  EXPIRED
}
```

#### 1.2 Update User and Organization Relations
Add to existing models:
```prisma
model User {
  // ... existing fields
  
  // Tool Marketplace relations
  toolPurchases     ToolPurchase[]
  bundlePurchases   BundlePurchase[]
  toolReviews       ToolReview[]
  shoppingCart      ShoppingCart?
}

model Organization {
  // ... existing fields
  
  // Tool Marketplace relations
  toolPurchases     ToolPurchase[]
  bundlePurchases   BundlePurchase[]
  toolReviews       ToolReview[]
  shoppingCarts     ShoppingCart[]
}
```

#### 1.3 Run Database Migration
```bash
npx prisma migrate dev --name add-tool-marketplace
npx prisma generate
```

### Phase 2: File Structure Setup

#### 2.1 Create Tool Marketplace Route Structure
```bash
# From platform root
mkdir -p app/\(platform\)/marketplace/{browse,cart,purchases,reviews}
```

#### 2.2 Copy and Adapt Components
Create `components/features/marketplace/` directory:

```bash
mkdir -p components/features/marketplace/{
  grid,
  filters,
  cart,
  tools,
  bundles,
  shared
}
```

#### 2.3 Create API Route Structure
```bash
mkdir -p app/api/v1/marketplace/{tools,bundles,cart,purchases,reviews}
```

### Phase 3: Module Architecture Integration

#### 3.1 Create Marketplace Module
Following platform module patterns:

```typescript
// lib/modules/marketplace/tools/index.ts
export const ToolPurchaseSchema = z.object({
  toolId: z.string().uuid(),
  organizationId: z.string().uuid(),
});

export async function purchaseTool(input: ToolPurchaseInput) {
  const session = await requireAuth();
  
  if (!canAccessMarketplace(session.user)) {
    throw new Error('Unauthorized: Marketplace access required');
  }
  
  if (!canAccessFeature(session.user, 'marketplace')) {
    throw new Error('Upgrade required: Marketplace features not available');
  }

  const validated = ToolPurchaseSchema.parse(input);
  
  // Check if already purchased
  const existing = await prisma.toolPurchase.findUnique({
    where: {
      toolId_organizationId: {
        toolId: validated.toolId,
        organizationId: session.user.organizationId
      }
    }
  });

  if (existing) {
    throw new Error('Tool already purchased');
  }

  // Get tool details for pricing
  const tool = await prisma.marketplaceTool.findUnique({
    where: { id: validated.toolId }
  });

  if (!tool) {
    throw new Error('Tool not found');
  }

  return await prisma.toolPurchase.create({
    data: {
      toolId: validated.toolId,
      priceAtPurchase: tool.price,
      organizationId: session.user.organizationId,
      purchasedBy: session.user.id,
    }
  });
}

export async function getAvailableTools(filters?: ToolFilters) {
  const session = await requireAuth();

  return await prisma.marketplaceTool.findMany({
    where: {
      isActive: true,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.tier && { tier: filters.tier }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ]
      }),
    },
    include: {
      _count: {
        select: { purchases: true, reviews: true }
      }
    },
    orderBy: [
      { purchaseCount: 'desc' },
      { name: 'asc' }
    ]
  });
}

export async function getPurchasedTools() {
  const session = await requireAuth();

  return await prisma.toolPurchase.findMany({
    where: {
      organizationId: session.user.organizationId,
      status: 'ACTIVE'
    },
    include: {
      tool: true
    },
    orderBy: { purchaseDate: 'desc' }
  });
}
```

### Phase 4: RBAC & Feature Access Integration

#### 4.1 Add Marketplace Permissions
Update `lib/auth/rbac.ts`:
```typescript
export function canAccessMarketplace(user: User): boolean {
  // Must be Employee with Member+ org role
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
  
  return isEmployee && hasOrgAccess;
}

export function canPurchaseTools(user: User): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}

export function canReviewTools(user: User): boolean {
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
  return canAccessMarketplace(user) && hasOrgAccess;
}
```

#### 4.2 Update Subscription Tier Features
```typescript
// lib/auth/rbac.ts
const TIER_FEATURES = {
  FREE: ['dashboard', 'profile'],
  STARTER: ['dashboard', 'profile', 'crm', 'projects'],
  GROWTH: ['dashboard', 'profile', 'crm', 'projects', 'marketplace-basic'], // Limited tools
  ELITE: ['dashboard', 'profile', 'crm', 'projects', 'marketplace-full'], // All tools
};

export function getMarketplaceLimits(tier: SubscriptionTier) {
  const limits = {
    FREE: { tools: 0, bundles: 0 },
    STARTER: { tools: 0, bundles: 0 },
    GROWTH: { tools: 10, bundles: 1 }, // Per organization
    ELITE: { tools: -1, bundles: -1 }, // Unlimited
  };

  return limits[tier];
}
```

### Phase 5: UI Component Recreation (Pixel-Perfect)

#### 5.1 Create Main Marketplace Page
Create `app/(platform)/marketplace/page.tsx`:
```tsx
import { Suspense } from 'react'
import { MarketplaceGrid } from '@/components/features/marketplace/grid'
import { MarketplaceFilters } from '@/components/features/marketplace/filters'
import { ShoppingCartPanel } from '@/components/features/marketplace/cart'
import { Skeleton } from '@/components/ui/skeleton'

export default function MarketplacePage() {
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <MarketplaceFilters />
            </Suspense>
          </div>
          
          {/* Tools Grid */}
          <div className="flex-1">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <MarketplaceGrid />
            </Suspense>
          </div>
          
          {/* Shopping Cart Panel */}
          <div className="w-80 flex-shrink-0">
            <Suspense fallback={<Skeleton className="h-64" />}>
              <ShoppingCartPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 5.2 Create Tool Grid Component (Exact UI Match)
Create `components/features/marketplace/grid/MarketplaceGrid.tsx`:
```tsx
'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Tool {
  id: string
  name: string
  description: string
  category: string
  price: number
  tags: string[]
}

export function MarketplaceGrid() {
  const queryClient = useQueryClient()
  
  const { data: tools, isLoading } = useQuery({
    queryKey: ['marketplace-tools'],
    queryFn: async () => {
      const response = await fetch('/api/v1/marketplace/tools')
      return response.json()
    }
  })

  const addToCartMutation = useMutation({
    mutationFn: async (toolId: string) => {
      const response = await fetch('/api/v1/marketplace/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId })
      })
      if (!response.ok) throw new Error('Failed to add to cart')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] })
      toast.success('Added to cart!')
    },
    onError: (error) => {
      toast.error('Failed to add to cart')
    }
  })

  const getCategoryColor = (category: string) => {
    const colors = {
      'FOUNDATION': 'bg-blue-100 text-blue-800',
      'GROWTH': 'bg-green-100 text-green-800',
      'ELITE': 'bg-purple-100 text-purple-800',
      'CUSTOM': 'bg-orange-100 text-orange-800',
      'ADVANCED': 'bg-red-100 text-red-800',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools?.tools?.map((tool: Tool) => (
        <Card key={tool.id} className="p-6 hover:shadow-lg transition-shadow">
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
            <p className="text-gray-600 text-sm leading-relaxed">
              {tool.description}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge className={getCategoryColor(tool.category)}>
                {tool.category}
              </Badge>
              {tool.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Add to Cart Button */}
            <Button
              onClick={() => addToCartMutation.mutate(tool.id)}
              disabled={addToCartMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
```

#### 5.3 Create Shopping Cart Panel (Exact UI Match)
Create `components/features/marketplace/cart/ShoppingCartPanel.tsx`:
```tsx
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Trash2, ShoppingCart } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function ShoppingCartPanel() {
  const queryClient = useQueryClient()
  
  const { data: cart } = useQuery({
    queryKey: ['shopping-cart'],
    queryFn: async () => {
      const response = await fetch('/api/v1/marketplace/cart')
      return response.json()
    }
  })

  const removeFromCartMutation = useMutation({
    mutationFn: async (toolId: string) => {
      const response = await fetch(`/api/v1/marketplace/cart/${toolId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to remove from cart')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] })
      toast.success('Removed from cart')
    }
  })

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/v1/marketplace/checkout', {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Checkout failed')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] })
      queryClient.invalidateQueries({ queryKey: ['purchased-tools'] })
      toast.success('Purchase completed!')
    }
  })

  const cartItems = cart?.items || []
  const totalPrice = cartItems.reduce((sum: number, item: any) => sum + item.price, 0)

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Your Plan
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {cartItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Your cart is empty
          </p>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3">
              {cartItems.map((item: any, index: number) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-900">
                        {item.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      ${(item.price / 100).toFixed(0)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCartMutation.mutate(item.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator />
            
            {/* Total */}
            <div className="flex justify-between items-center font-semibold">
              <span>Total</span>
              <span className="text-lg">
                ${(totalPrice / 100).toFixed(0)}
              </span>
            </div>
            
            {/* Checkout Button */}
            <Button
              onClick={() => checkoutMutation.mutate()}
              disabled={checkoutMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {checkoutMutation.isPending ? 'Processing...' : 'Purchase Tools'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
```

### Phase 6: API Route Implementation

#### 6.1 Create Tools API
Create `app/api/v1/marketplace/tools/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getAvailableTools } from '@/lib/modules/marketplace/tools'
import { canAccessMarketplace, canAccessFeature } from '@/lib/auth/rbac'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessMarketplace(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!canAccessFeature(session.user, 'marketplace-basic')) {
    return NextResponse.json({ 
      error: 'Upgrade required',
      upgradeUrl: '/settings/billing'
    }, { status: 402 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const filters = {
      category: searchParams.get('category'),
      tier: searchParams.get('tier'),
      search: searchParams.get('search'),
    }

    const tools = await getAvailableTools(filters)
    return NextResponse.json({ tools })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 })
  }
}
```

#### 6.2 Create Shopping Cart API
Create `app/api/v1/marketplace/cart/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { addToCart, getCart } from '@/lib/modules/marketplace/cart'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cart = await getCart(session.user.id)
    return NextResponse.json(cart)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { toolId } = await req.json()
    const cart = await addToCart(session.user.id, toolId)
    return NextResponse.json(cart)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}
```

### Phase 7: Navigation Integration

#### 7.1 Update Platform Sidebar
Update `components/shared/layouts/sidebar.tsx`:
```typescript
const navigationItems = [
  // ... existing items
  {
    name: 'Tool Marketplace',
    href: '/marketplace',
    icon: ShoppingBag,
    children: [
      { name: 'Browse Tools', href: '/marketplace' },
      { name: 'My Tools', href: '/marketplace/purchases' },
      { name: 'Shopping Cart', href: '/marketplace/cart' },
      { name: 'Reviews', href: '/marketplace/reviews' },
    ]
  }
]
```

### Phase 8: Testing & Quality Assurance

#### 8.1 Create Marketplace Tests
Create `__tests__/modules/marketplace/tools.test.ts`:
```typescript
import { purchaseTool } from '@/lib/modules/marketplace/tools'
import { canAccessMarketplace } from '@/lib/auth/rbac'

describe('Tool Marketplace Module', () => {
  it('should purchase tool for current org only', async () => {
    const purchase = await purchaseTool({
      toolId: 'tool-123',
      organizationId: 'org-123'
    })

    expect(purchase.organizationId).toBe('org-123')
  })

  it('should prevent duplicate purchases', async () => {
    // Test duplicate purchase prevention
    expect(async () => {
      await purchaseTool({
        toolId: 'tool-123',
        organizationId: 'org-123'
      })
    }).rejects.toThrow('Tool already purchased')
  })
})
```

### Phase 9: Data Seeding

#### 9.1 Create Tool Marketplace Seed Data
Create `prisma/seeds/marketplace.ts`:
```typescript
const marketplaceTools = [
  {
    name: '24/7 Lead Capture & Response',
    description: 'Instantly engages web leads via chat and email.',
    category: 'FOUNDATION',
    tier: 'T1',
    price: 10000, // $100
    tags: ['AI-POWERED'],
    features: ['Auto-response', 'Chat integration', 'Email automation'],
  },
  {
    name: 'Booking Agent',
    description: 'Automated appointment scheduling and calendar sync.',
    category: 'FOUNDATION',
    tier: 'T1',
    price: 10000,
    tags: [],
    features: ['Calendar sync', 'Auto-scheduling', 'Reminders'],
  },
  // ... more tools from the live preview
]

export async function seedMarketplace() {
  for (const tool of marketplaceTools) {
    await prisma.marketplaceTool.create({
      data: tool
    })
  }
}
```

### Phase 10: Go-Live Checklist

- [ ] Database migrations applied successfully
- [ ] RLS policies enabled on all marketplace tables
- [ ] RBAC permissions working for marketplace access
- [ ] Subscription tier limits enforced
- [ ] Tool grid matches exact UI design from live preview
- [ ] Shopping cart panel functions with add/remove items
- [ ] Category filtering working correctly
- [ ] Purchase flow operational
- [ ] Tool search functionality working
- [ ] Price display matches original ($100, $200, $300 format)
- [ ] Category tags styled correctly (colors matching original)
- [ ] All API endpoints protected and functional
- [ ] Navigation integrated with platform sidebar
- [ ] Mobile responsiveness maintained
- [ ] Error boundaries and loading states in place
- [ ] Tests passing with required coverage

## UI Design Preservation Notes

**Critical Design Elements from Live Preview:**
- **Clean White Background**: Pure white (#FFFFFF) layout
- **Tool Cards**: White cards with subtle shadow, proper spacing
- **Category Tags**: Exact color matching:
  - FOUNDATION: Blue (#3B82F6 background, white text)  
  - GROWTH: Green (#10B981 background, white text)
  - ELITE: Purple (#8B5CF6 background, white text)
  - CUSTOM: Orange (#F59E0B background, white text)
- **Typography**: 
  - Tool names: Bold, large font
  - Descriptions: Gray (#6B7280), smaller font
  - Prices: Large, bold black font with $ symbol
- **Grid Layout**: Responsive 3-column grid with consistent spacing
- **Shopping Cart**: Right-aligned panel with item count and total

**Component Styling Patterns:**
```css
/* Tool card styling */
.tool-card {
  @apply bg-white shadow-sm hover:shadow-lg border border-gray-200 rounded-lg p-6 transition-shadow;
}

/* Category tag colors (exact match) */
.category-foundation {
  @apply bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium;
}

.category-growth {
  @apply bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium;
}

/* Price styling */
.tool-price {
  @apply text-2xl font-bold text-gray-900;
}
```

This integration preserves the exact visual design and functionality of the Tool Marketplace while seamlessly integrating it into the Strive platform's multi-tenant, RBAC architecture.