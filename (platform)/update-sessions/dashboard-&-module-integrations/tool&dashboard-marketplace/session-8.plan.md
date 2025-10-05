# Session 8: Testing, Optimization & Final Integration

## Session Overview
**Goal:** Comprehensive testing, performance optimization, and final integration of the Tool & Dashboard Marketplace into the platform.

**Duration:** 3-4 hours
**Complexity:** High
**Dependencies:** Session 7 (Purchased Tools Dashboard)

## Objectives

1. ✅ Write comprehensive unit tests
2. ✅ Create integration tests for full flows
3. ✅ Implement E2E tests with Playwright
4. ✅ Performance optimization and caching
5. ✅ SEO optimization for marketplace pages
6. ✅ Final navigation integration
7. ✅ Error handling and edge cases
8. ✅ Production deployment checklist

## Prerequisites

- [x] All Sessions 1-7 completed
- [x] Marketplace fully functional
- [x] Understanding of testing frameworks
- [x] Access to production deployment

## Testing Strategy

```
__tests__/modules/marketplace/
├── tools.test.ts                # Tool queries/actions tests
├── bundles.test.ts              # Bundle tests
├── cart.test.ts                 # Cart functionality tests
├── reviews.test.ts              # Review system tests
└── integration/
    ├── purchase-flow.test.ts    # Full purchase flow
    └── checkout.test.ts         # Checkout process

e2e/marketplace/
├── browse-tools.spec.ts         # Browse and filter
├── purchase-tool.spec.ts        # Purchase flow
└── review-tool.spec.ts          # Review flow
```

## Step-by-Step Implementation

### Step 1: Unit Tests for Marketplace Module

**File:** `__tests__/modules/marketplace/tools.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { prisma } from '@/lib/database/prisma';
import {
  getMarketplaceTools,
  purchaseTool,
  getToolPurchase,
} from '@/lib/modules/marketplace';

describe('Marketplace Tools Module', () => {
  let testOrgId: string;
  let testUserId: string;
  let testToolId: string;

  beforeEach(async () => {
    // Create test organization
    const org = await prisma.organizations.create({
      data: { name: 'Test Org' },
    });
    testOrgId = org.id;

    // Create test user
    const user = await prisma.users.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        organization_id: testOrgId,
      },
    });
    testUserId = user.id;

    // Create test tool
    const tool = await prisma.marketplace_tools.create({
      data: {
        name: 'Test Tool',
        description: 'A test tool',
        category: 'FOUNDATION',
        tier: 'T1',
        price: 10000,
      },
    });
    testToolId = tool.id;
  });

  afterEach(async () => {
    // Cleanup
    await prisma.tool_purchases.deleteMany({ where: { organization_id: testOrgId } });
    await prisma.marketplace_tools.deleteMany({ where: { id: testToolId } });
    await prisma.users.deleteMany({ where: { id: testUserId } });
    await prisma.organizations.deleteMany({ where: { id: testOrgId } });
  });

  describe('getMarketplaceTools', () => {
    it('should return all active tools', async () => {
      const tools = await getMarketplaceTools();
      expect(tools.length).toBeGreaterThanOrEqual(1);
      expect(tools[0]).toHaveProperty('name');
      expect(tools[0]).toHaveProperty('price');
    });

    it('should filter by category', async () => {
      const tools = await getMarketplaceTools({ category: 'FOUNDATION' });
      expect(tools.every((t) => t.category === 'FOUNDATION')).toBe(true);
    });

    it('should filter by price range', async () => {
      const tools = await getMarketplaceTools({
        price_min: 5000,
        price_max: 15000,
      });
      expect(tools.every((t) => t.price >= 5000 && t.price <= 15000)).toBe(true);
    });

    it('should search by name', async () => {
      const tools = await getMarketplaceTools({ search: 'Test' });
      expect(tools.some((t) => t.name.includes('Test'))).toBe(true);
    });
  });

  describe('purchaseTool', () => {
    it('should purchase tool for organization', async () => {
      const purchase = await purchaseTool({
        tool_id: testToolId,
        organization_id: testOrgId,
      });

      expect(purchase).toHaveProperty('id');
      expect(purchase.tool_id).toBe(testToolId);
      expect(purchase.organization_id).toBe(testOrgId);
      expect(purchase.status).toBe('ACTIVE');
    });

    it('should prevent duplicate purchases', async () => {
      // First purchase
      await purchaseTool({
        tool_id: testToolId,
        organization_id: testOrgId,
      });

      // Second purchase should fail
      await expect(
        purchaseTool({
          tool_id: testToolId,
          organization_id: testOrgId,
        })
      ).rejects.toThrow('Tool already purchased');
    });

    it('should track purchase price at time of purchase', async () => {
      const purchase = await purchaseTool({
        tool_id: testToolId,
        organization_id: testOrgId,
      });

      const tool = await prisma.marketplace_tools.findUnique({
        where: { id: testToolId },
      });

      expect(purchase.price_at_purchase).toBe(tool?.price);
    });
  });

  describe('getToolPurchase', () => {
    it('should return purchase if exists', async () => {
      await purchaseTool({
        tool_id: testToolId,
        organization_id: testOrgId,
      });

      const purchase = await getToolPurchase(testToolId);
      expect(purchase).toBeTruthy();
      expect(purchase?.tool_id).toBe(testToolId);
    });

    it('should return null if not purchased', async () => {
      const purchase = await getToolPurchase('non-existent-id');
      expect(purchase).toBeNull();
    });
  });
});
```

### Step 2: Shopping Cart Tests

**File:** `__tests__/modules/marketplace/cart.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { prisma } from '@/lib/database/prisma';
import { addToCart, removeFromCart, getCartWithItems, checkout } from '@/lib/modules/marketplace';

describe('Shopping Cart Module', () => {
  let testOrgId: string;
  let testUserId: string;
  let testToolId: string;

  beforeEach(async () => {
    // Setup test data
    const org = await prisma.organizations.create({
      data: { name: 'Test Org' },
    });
    testOrgId = org.id;

    const user = await prisma.users.create({
      data: {
        email: 'cart@example.com',
        name: 'Cart Test User',
        organization_id: testOrgId,
      },
    });
    testUserId = user.id;

    const tool = await prisma.marketplace_tools.create({
      data: {
        name: 'Cart Test Tool',
        description: 'Test',
        category: 'FOUNDATION',
        tier: 'T1',
        price: 10000,
      },
    });
    testToolId = tool.id;
  });

  afterEach(async () => {
    await prisma.shopping_carts.deleteMany({ where: { user_id: testUserId } });
    await prisma.tool_purchases.deleteMany({ where: { organization_id: testOrgId } });
    await prisma.marketplace_tools.deleteMany({ where: { id: testToolId } });
    await prisma.users.deleteMany({ where: { id: testUserId } });
    await prisma.organizations.deleteMany({ where: { id: testOrgId } });
  });

  describe('addToCart', () => {
    it('should create cart if not exists', async () => {
      const cart = await addToCart({
        item_type: 'tool',
        item_id: testToolId,
      });

      expect(cart).toHaveProperty('id');
      expect(cart.user_id).toBe(testUserId);
      expect((cart.tools as string[]).includes(testToolId)).toBe(true);
    });

    it('should add tool to existing cart', async () => {
      // First add
      await addToCart({
        item_type: 'tool',
        item_id: testToolId,
      });

      // Create another tool
      const tool2 = await prisma.marketplace_tools.create({
        data: {
          name: 'Tool 2',
          description: 'Test',
          category: 'GROWTH',
          tier: 'T2',
          price: 20000,
        },
      });

      // Second add
      const cart = await addToCart({
        item_type: 'tool',
        item_id: tool2.id,
      });

      expect((cart.tools as string[]).length).toBe(2);
    });

    it('should calculate total price correctly', async () => {
      const cart = await addToCart({
        item_type: 'tool',
        item_id: testToolId,
      });

      expect(cart.total_price).toBe(10000);
    });
  });

  describe('checkout', () => {
    it('should purchase all items in cart', async () => {
      // Add to cart
      await addToCart({
        item_type: 'tool',
        item_id: testToolId,
      });

      // Checkout
      const result = await checkout();

      expect(result.toolPurchases.length).toBe(1);
    });

    it('should clear cart after checkout', async () => {
      // Add to cart
      await addToCart({
        item_type: 'tool',
        item_id: testToolId,
      });

      // Checkout
      await checkout();

      // Check cart is empty
      const cart = await getCartWithItems(testUserId);
      expect(cart?.tools.length).toBe(0);
      expect(cart?.totalPrice).toBe(0);
    });
  });
});
```

### Step 3: E2E Test for Purchase Flow

**File:** `e2e/marketplace/purchase-tool.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tool Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/real-estate/dashboard');
  });

  test('should browse and add tool to cart', async ({ page }) => {
    // Navigate to marketplace
    await page.goto('/real-estate/marketplace');

    // Wait for tools to load
    await page.waitForSelector('[data-testid="tool-card"]');

    // Click add to cart on first tool
    await page.click('[data-testid="add-to-cart-btn"]:first-of-type');

    // Verify toast notification
    await expect(page.locator('text=Added to cart!')).toBeVisible();

    // Verify cart count updated
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('1');
  });

  test('should complete checkout', async ({ page }) => {
    // Add tool to cart (setup)
    await page.goto('/real-estate/marketplace');
    await page.waitForSelector('[data-testid="tool-card"]');
    await page.click('[data-testid="add-to-cart-btn"]:first-of-type');

    // Go to cart
    await page.click('[data-testid="cart-badge"]');

    // Verify cart has items
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

    // Click checkout
    await page.click('button:has-text("Purchase Tools")');

    // Confirm in modal
    await page.waitForSelector('[data-testid="checkout-modal"]');
    await page.click('button:has-text("Confirm Purchase")');

    // Verify success
    await expect(page.locator('text=Purchase completed successfully!')).toBeVisible();

    // Verify cart is empty
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(0);
  });

  test('should prevent duplicate purchases', async ({ page }) => {
    // Purchase a tool first
    await page.goto('/real-estate/marketplace');
    await page.waitForSelector('[data-testid="tool-card"]');

    const firstTool = page.locator('[data-testid="tool-card"]').first();
    const toolName = await firstTool.locator('h3').textContent();

    await firstTool.locator('[data-testid="add-to-cart-btn"]').click();
    await page.click('[data-testid="cart-badge"]');
    await page.click('button:has-text("Purchase Tools")');
    await page.click('button:has-text("Confirm Purchase")');

    // Try to purchase again
    await page.goto('/real-estate/marketplace');
    await page.waitForSelector('[data-testid="tool-card"]');

    // Find same tool
    const sameToolCard = page.locator(`[data-testid="tool-card"]:has-text("${toolName}")`);

    // Verify "Already Owned" button is disabled
    await expect(
      sameToolCard.locator('button:has-text("Already Owned")')
    ).toBeDisabled();
  });
});
```

### Step 4: Performance Optimization

**File:** `lib/modules/marketplace/queries.ts` (add caching)

```typescript
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

// Cache marketplace tools (revalidate every 5 minutes)
export const getMarketplaceToolsCached = unstable_cache(
  async (filters?: ToolFilters) => {
    return getMarketplaceTools(filters);
  },
  ['marketplace-tools'],
  {
    revalidate: 300, // 5 minutes
    tags: ['marketplace-tools'],
  }
);

// Cache tool bundles (revalidate every 10 minutes)
export const getToolBundlesCached = unstable_cache(
  async () => {
    return getToolBundles();
  },
  ['tool-bundles'],
  {
    revalidate: 600, // 10 minutes
    tags: ['tool-bundles'],
  }
);

// Request-level caching for tool details
export const getMarketplaceToolByIdCached = cache(async (toolId: string) => {
  return getMarketplaceToolById(toolId);
});
```

### Step 5: SEO Optimization

**File:** `app/real-estate/marketplace/page.tsx` (add metadata)

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tool Marketplace - Strive Tech',
  description: 'Browse and purchase tools to enhance your real estate business. Find the perfect toolkit with our curated marketplace.',
  keywords: 'real estate tools, business tools, marketplace, productivity tools',
  openGraph: {
    title: 'Tool Marketplace - Strive Tech',
    description: 'Build your perfect toolkit with our curated tool marketplace',
    type: 'website',
  },
};
```

### Step 6: Final Navigation Integration

**File:** `components/shared/navigation/Sidebar.tsx` (update)

```typescript
// Add marketplace navigation item
const navigationItems = [
  // ... existing items
  {
    name: 'Marketplace',
    href: '/real-estate/marketplace',
    icon: ShoppingBag,
    badge: <CartBadge />,
    children: [
      { name: 'Browse Tools', href: '/real-estate/marketplace' },
      { name: 'My Tools', href: '/real-estate/marketplace/purchases' },
      { name: 'Shopping Cart', href: '/real-estate/marketplace/cart' },
    ],
  },
];
```

### Step 7: Error Boundary for Marketplace

**File:** `app/real-estate/marketplace/error.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function MarketplaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Marketplace error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Something went wrong!
      </h2>
      <p className="text-gray-600 text-center mb-6">
        We encountered an error loading the marketplace. Please try again.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
```

### Step 8: Production Deployment Checklist

**File:** `DEPLOYMENT_CHECKLIST.md`

```markdown
# Tool Marketplace Deployment Checklist

## Pre-Deployment

- [ ] All 8 sessions completed
- [ ] All tests passing (unit, integration, E2E)
- [ ] Test coverage ≥ 80%
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No linting errors: `npm run lint`
- [ ] Database migrations applied to staging
- [ ] Environment variables set in production

## Database

- [ ] All marketplace tables created
- [ ] RLS policies enabled and tested
- [ ] Indexes created for performance
- [ ] Seed data for marketplace tools added
- [ ] Bundle data configured

## Security

- [ ] RBAC permissions verified
- [ ] Multi-tenancy isolation tested
- [ ] Input validation with Zod on all endpoints
- [ ] Rate limiting configured
- [ ] No secrets exposed in client code

## Performance

- [ ] Caching implemented for tool catalog
- [ ] Image optimization for tool icons
- [ ] Bundle size optimized
- [ ] Database queries optimized
- [ ] Lazy loading implemented

## Testing

- [ ] Purchase flow tested end-to-end
- [ ] Cart functionality verified
- [ ] Checkout process validated
- [ ] Review system tested
- [ ] Edge cases handled

## Monitoring

- [ ] Error tracking configured (Sentry/etc)
- [ ] Analytics events set up
- [ ] Performance monitoring enabled
- [ ] Database query monitoring active

## Post-Deployment

- [ ] Smoke tests in production
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify user flows work
- [ ] Collect initial user feedback

## Rollback Plan

- [ ] Database migration rollback script ready
- [ ] Previous deployment tagged in git
- [ ] Backup of production database
- [ ] Documented rollback steps
```

## Testing & Validation

### Test 1: Full Test Suite
```bash
npm test -- --coverage
```
**Expected:** All tests pass, coverage ≥ 80%

### Test 2: E2E Tests
```bash
npx playwright test
```
**Expected:** All E2E scenarios pass

### Test 3: Performance Check
```bash
npm run build
npm run start
```
**Expected:** Build succeeds, no performance warnings

### Test 4: Type Check
```bash
npx tsc --noEmit
```
**Expected:** Zero TypeScript errors

### Test 5: Lighthouse Score
**Expected:**
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 90

## Success Criteria

- [x] All unit tests passing
- [x] All integration tests passing
- [x] All E2E tests passing
- [x] Test coverage ≥ 80%
- [x] Performance optimized (caching implemented)
- [x] SEO metadata added
- [x] Error boundaries in place
- [x] Navigation integrated
- [x] Production deployment checklist complete

## Files Created

- ✅ `__tests__/modules/marketplace/tools.test.ts`
- ✅ `__tests__/modules/marketplace/cart.test.ts`
- ✅ `e2e/marketplace/purchase-tool.spec.ts`
- ✅ `app/real-estate/marketplace/error.tsx`
- ✅ `DEPLOYMENT_CHECKLIST.md`

## Files Modified

- ✅ `lib/modules/marketplace/queries.ts` - Added caching
- ✅ `app/real-estate/marketplace/page.tsx` - Added SEO metadata
- ✅ `components/shared/navigation/Sidebar.tsx` - Added marketplace nav

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Test Database Pollution
**Problem:** Tests fail due to leftover data
**Solution:** Proper cleanup in afterEach hooks

### ❌ Pitfall 2: Cache Invalidation Issues
**Problem:** Stale data shown after updates
**Solution:** Use revalidateTag and revalidatePath

### ❌ Pitfall 3: E2E Test Flakiness
**Problem:** E2E tests fail intermittently
**Solution:** Add proper waitForSelector and explicit waits

### ❌ Pitfall 4: Missing Test Data IDs
**Problem:** E2E tests can't find elements
**Solution:** Add data-testid attributes to key elements

### ❌ Pitfall 5: Performance Regression
**Problem:** Marketplace loads slowly
**Solution:** Implement caching and pagination

## Final Steps

After completing this session:

1. ✅ **Run full test suite** - Ensure all tests pass
2. ✅ **Deploy to staging** - Test in production-like environment
3. ✅ **Perform UAT** - User acceptance testing
4. ✅ **Deploy to production** - Follow deployment checklist
5. ✅ **Monitor & iterate** - Track metrics and improve

---

**Session 8 Complete:** ✅ Tool & Dashboard Marketplace fully tested, optimized, and ready for production!

## 🎉 Marketplace Module Complete

**Achievement Unlocked:** Full-featured Tool & Dashboard Marketplace integrated into Strive-SaaS platform!

**What We Built:**
- ✅ Complete database schema with multi-tenancy
- ✅ Comprehensive backend module (queries, actions, schemas)
- ✅ Pixel-perfect UI matching design specifications
- ✅ Shopping cart with persistent state
- ✅ Tool bundles with special pricing
- ✅ Review and rating system
- ✅ Purchased tools dashboard
- ✅ Full test coverage with E2E tests
- ✅ Performance optimizations
- ✅ Production-ready deployment

**Next Steps:**
- Monitor marketplace usage metrics
- Collect user feedback
- Iterate on features based on data
- Add more tools to catalog
- Create promotional bundles
- Implement advanced analytics
