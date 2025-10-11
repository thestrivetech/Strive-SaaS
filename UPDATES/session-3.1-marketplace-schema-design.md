# Marketplace Module Schema Design

**Session:** 3.1
**Created:** 2025-10-10
**Status:** Design Complete (Ready for Session 3.5 Implementation)

---

## 📋 Overview

**Purpose:** AI Tools Marketplace for purchasing and managing additional platform functionality

**Models:** 6 (5 main + 1 junction table)
**Enums:** 8
**Multi-Tenancy:** Hybrid (Tools global, Purchases org-isolated)
**RLS Required:** Yes (purchases, cart, reviews)

---

## 🗄️ Complete Prisma Schema

### Model 1: marketplace_tools

**Purpose:** Global catalog of available AI tools and integrations

```prisma
model marketplace_tools {
  id                 String   @id @default(uuid())

  // Tool Information
  name               String   @db.VarChar(100)
  description        String   @db.Text
  long_description   String?  @db.Text

  // Categorization
  category           ToolCategory
  tags               String[] @default([])

  // Pricing
  price_model        PriceModel
  price_amount       Decimal  @default(0) @db.Decimal(10, 2)
  currency           String   @default("USD") @db.VarChar(3)

  // Access Control
  required_tier      SubscriptionTier  // Minimum tier to purchase

  // Technical Details
  features           Json     @db.JsonB  // Array of feature strings
  tech_stack         Json?    @db.JsonB  // Technologies used
  integration_type   IntegrationType

  // Status & Visibility
  status             ToolStatus @default(ACTIVE)
  is_featured        Boolean  @default(false)
  is_popular         Boolean  @default(false)

  // Provider Information
  provider           String   @db.VarChar(100)  // "Internal" or third-party
  documentation_url  String?  @db.VarChar(500)
  demo_url           String?  @db.VarChar(500)
  support_url        String?  @db.VarChar(500)

  // Media
  icon_url           String?  @db.VarChar(500)
  images             String[] @default([])  // Screenshot URLs
  video_url          String?  @db.VarChar(500)

  // Metadata
  version            String   @default("1.0.0") @db.VarChar(20)
  last_updated       DateTime @updatedAt

  // Analytics
  purchase_count     Int      @default(0)
  view_count         Int      @default(0)
  avg_rating         Float?   @db.Real
  review_count       Int      @default(0)

  // Timestamps
  created_at         DateTime @default(now()) @db.Timestamp(6)
  updated_at         DateTime @updatedAt @db.Timestamp(6)

  // Relationships
  reviews            marketplace_reviews[]
  purchases          marketplace_purchases[]
  bundle_items       marketplace_bundle_items[]
  cart_items         marketplace_cart[]

  // Indexes for performance
  @@index([category])
  @@index([status])
  @@index([required_tier])
  @@index([price_model])
  @@index([is_featured])
  @@index([purchase_count])
  @@index([avg_rating])
}
```

**Key Design Decisions:**
- Tools are global (no organization_id) - everyone sees same catalog
- Purchase tracking via marketplace_purchases (org-isolated)
- Denormalized analytics for performance (purchase_count, avg_rating)
- Support multiple price models (FREE, ONE_TIME, MONTHLY, USAGE_BASED)
- Media fields for rich tool pages (icons, images, videos)

---

### Model 2: marketplace_bundles

**Purpose:** Curated collections of tools sold as packages

```prisma
model marketplace_bundles {
  id                 String   @id @default(uuid())

  // Bundle Information
  name               String   @db.VarChar(100)
  description        String   @db.Text
  long_description   String?  @db.Text

  // Pricing
  price_amount       Decimal  @db.Decimal(10, 2)
  currency           String   @default("USD") @db.VarChar(3)
  discount_percent   Int      // Discount vs buying individually (0-100)

  // Access Control
  required_tier      SubscriptionTier

  // Status & Visibility
  status             BundleStatus @default(ACTIVE)
  is_featured        Boolean  @default(false)
  is_popular         Boolean  @default(false)

  // Media
  icon_url           String?  @db.VarChar(500)
  images             String[] @default([])

  // Analytics
  purchase_count     Int      @default(0)
  view_count         Int      @default(0)

  // Timestamps
  created_at         DateTime @default(now()) @db.Timestamp(6)
  updated_at         DateTime @updatedAt @db.Timestamp(6)

  // Relationships
  items              marketplace_bundle_items[]
  purchases          marketplace_purchases[]

  // Indexes
  @@index([status])
  @@index([is_featured])
  @@index([purchase_count])
}
```

**Key Design Decisions:**
- Bundles are also global (no organization_id)
- discount_percent shows savings vs individual tool purchases
- Tools in bundle linked via junction table (many-to-many)

---

### Model 3: marketplace_bundle_items

**Purpose:** Junction table linking bundles to tools (many-to-many)

```prisma
model marketplace_bundle_items {
  id                 String   @id @default(uuid())

  // References
  bundle_id          String
  tool_id            String

  // Metadata
  position           Int      @default(0)  // Display order in bundle

  // Timestamps
  created_at         DateTime @default(now()) @db.Timestamp(6)

  // Relationships
  bundle             marketplace_bundles @relation(fields: [bundle_id], references: [id], onDelete: Cascade)
  tool               marketplace_tools @relation(fields: [tool_id], references: [id], onDelete: Cascade)

  // Constraints
  @@unique([bundle_id, tool_id])  // Prevent duplicate tools in same bundle
  @@index([bundle_id])
  @@index([tool_id])
}
```

**Key Design Decisions:**
- Cascade delete: Remove bundle items when bundle or tool is deleted
- Position field for controlling display order
- Unique constraint prevents accidental duplicates

---

### Model 4: marketplace_purchases

**Purpose:** Track tool and bundle purchases per organization

```prisma
model marketplace_purchases {
  id                 String   @id @default(uuid())

  // Multi-Tenancy (RLS)
  organization_id    String
  user_id            String   // Who made the purchase

  // Purchase Type (tool OR bundle, not both)
  tool_id            String?
  bundle_id          String?

  // Purchase Details
  purchase_type      PurchaseType  // TOOL or BUNDLE
  amount             Decimal  @db.Decimal(10, 2)
  currency           String   @default("USD") @db.VarChar(3)

  // Payment Information
  payment_method     PaymentMethod
  payment_status     PaymentStatus @default(PENDING)
  stripe_payment_id  String?  @unique @db.VarChar(255)
  stripe_invoice_id  String?  @db.VarChar(255)

  // Subscription Info (for recurring payments)
  is_subscription    Boolean  @default(false)
  subscription_start DateTime? @db.Timestamp(6)
  subscription_end   DateTime? @db.Timestamp(6)
  auto_renew         Boolean  @default(false)

  // Status
  status             PurchaseStatus @default(ACTIVE)
  activated_at       DateTime? @db.Timestamp(6)
  cancelled_at       DateTime? @db.Timestamp(6)
  refunded_at        DateTime? @db.Timestamp(6)

  // Usage Tracking
  usage_count        Int      @default(0)
  last_used_at       DateTime? @db.Timestamp(6)

  // Timestamps
  purchase_date      DateTime @default(now()) @db.Timestamp(6)
  created_at         DateTime @default(now()) @db.Timestamp(6)
  updated_at         DateTime @updatedAt @db.Timestamp(6)

  // Relationships
  organization       organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user               users @relation(fields: [user_id], references: [id])
  tool               marketplace_tools? @relation(fields: [tool_id], references: [id])
  bundle             marketplace_bundles? @relation(fields: [bundle_id], references: [id])

  // Indexes for queries
  @@index([organization_id])
  @@index([user_id])
  @@index([payment_status])
  @@index([status])
  @@index([tool_id])
  @@index([bundle_id])
  @@index([purchase_date])
}
```

**Key Design Decisions:**
- **Multi-Tenant:** organization_id required (RLS filtering)
- Tool OR Bundle purchase (nullable foreign keys, check via purchase_type)
- Stripe integration fields for payment processing
- Subscription support (start/end dates, auto-renewal)
- Status tracking (active, cancelled, refunded)
- Usage analytics (count, last_used_at)

**Check Constraint (to add via migration SQL):**
```sql
ALTER TABLE marketplace_purchases
ADD CONSTRAINT check_purchase_type
CHECK (
  (purchase_type = 'TOOL' AND tool_id IS NOT NULL AND bundle_id IS NULL) OR
  (purchase_type = 'BUNDLE' AND bundle_id IS NOT NULL AND tool_id IS NULL)
);
```

---

### Model 5: marketplace_cart

**Purpose:** Shopping cart for pending purchases

```prisma
model marketplace_cart {
  id                 String   @id @default(uuid())

  // Multi-Tenancy (RLS)
  organization_id    String
  user_id            String   // Cart owner

  // Cart Item (tool OR bundle, not both)
  tool_id            String?
  bundle_id          String?
  item_type          CartItemType  // TOOL or BUNDLE

  // Metadata
  quantity           Int      @default(1)  // Usually 1 for tools
  added_at           DateTime @default(now()) @db.Timestamp(6)

  // Timestamps
  created_at         DateTime @default(now()) @db.Timestamp(6)
  updated_at         DateTime @updatedAt @db.Timestamp(6)

  // Relationships
  organization       organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user               users @relation(fields: [user_id], references: [id], onDelete: Cascade)
  tool               marketplace_tools? @relation(fields: [tool_id], references: [id], onDelete: Cascade)
  bundle             marketplace_bundles? @relation(fields: [bundle_id], references: [id], onDelete: Cascade)

  // Constraints (prevent duplicate items in same user's cart)
  @@unique([user_id, tool_id, bundle_id])
  @@index([organization_id])
  @@index([user_id])
  @@index([tool_id])
  @@index([bundle_id])
}
```

**Key Design Decisions:**
- **User-scoped:** Each user has their own cart
- Tool OR Bundle per cart item (not both)
- Cascade delete when user/tool/bundle removed
- Unique constraint prevents duplicate items

**Check Constraint (to add via migration SQL):**
```sql
ALTER TABLE marketplace_cart
ADD CONSTRAINT check_cart_item_type
CHECK (
  (item_type = 'TOOL' AND tool_id IS NOT NULL AND bundle_id IS NULL) OR
  (item_type = 'BUNDLE' AND bundle_id IS NOT NULL AND tool_id IS NULL)
);
```

---

### Model 6: marketplace_reviews

**Purpose:** User reviews and ratings for tools

```prisma
model marketplace_reviews {
  id                 String   @id @default(uuid())

  // Review Target
  tool_id            String

  // Multi-Tenancy (RLS)
  organization_id    String
  user_id            String   // Reviewer

  // Review Content
  rating             Int      // 1-5 stars
  title              String?  @db.VarChar(200)
  review             String?  @db.Text

  // Verification
  verified_purchase  Boolean  @default(false)  // Did they actually buy it?

  // Social Features
  helpful_count      Int      @default(0)  // Upvotes
  flagged_count      Int      @default(0)  // Reports

  // Moderation
  status             ReviewStatus @default(PENDING)
  moderated_at       DateTime? @db.Timestamp(6)
  moderated_by       String?   // Admin user ID
  moderation_notes   String?   @db.Text

  // Timestamps
  created_at         DateTime @default(now()) @db.Timestamp(6)
  updated_at         DateTime @updatedAt @db.Timestamp(6)

  // Relationships
  tool               marketplace_tools @relation(fields: [tool_id], references: [id], onDelete: Cascade)
  organization       organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user               users @relation(fields: [user_id], references: [id], onDelete: Cascade)
  moderator          users? @relation("ReviewModerator", fields: [moderated_by], references: [id])

  // Constraints (one review per user per tool)
  @@unique([tool_id, user_id])
  @@index([tool_id])
  @@index([organization_id])
  @@index([user_id])
  @@index([status])
  @@index([rating])
}
```

**Key Design Decisions:**
- **Multi-Tenant:** organization_id for isolation
- One review per user per tool (unique constraint)
- Rating validation: 1-5 (enforce in Zod schema)
- Moderation workflow (PENDING → APPROVED/REJECTED)
- verified_purchase flag (check against marketplace_purchases)
- Social features (helpful_count for "Was this helpful?")

**Rating Validation (Zod Schema):**
```typescript
rating: z.number().int().min(1).max(5)
```

---

## 🏷️ Enums (8)

### Enum 1: ToolCategory

```prisma
enum ToolCategory {
  // Lead Management
  LEAD_GENERATION
  LEAD_NURTURING

  // Property & Listings
  LISTING_OPTIMIZATION
  PROPERTY_SHOPPING

  // Market & Investment
  MARKET_INTELLIGENCE
  INVESTMENT_ANALYSIS

  // Transactions & Documents
  DOCUMENT_PROCESSING
  COMMISSION_FINANCIAL

  // Customer Service
  BOOKING_SCHEDULING
  COMMUNICATION

  // Multi-Module
  CRM_TOOLS
  ANALYTICS_TOOLS
  AUTOMATION_TOOLS
  INTEGRATION_TOOLS
}
```

**Mapping to Tools Inventory:**
- LEAD_GENERATION: Lead Capture System, Lead Scoring Engine
- LEAD_NURTURING: Campaign Engine, Pre-Qualification System
- LISTING_OPTIMIZATION: Description Generator, Photo Enhancement, Virtual Staging
- PROPERTY_SHOPPING: Comparison Engine, Tour Coordination, Matching Algorithm
- MARKET_INTELLIGENCE: CMA Generator, Predictive Analytics, Risk Assessment
- INVESTMENT_ANALYSIS: Property Analyzer, Portfolio Tracker
- DOCUMENT_PROCESSING: Contract Generation, Document Automation
- COMMISSION_FINANCIAL: Commission Calculator, Financial Reporting
- BOOKING_SCHEDULING: Booking Agent, Calendar Integration
- COMMUNICATION: Script Generator, Email Templates, Review Management

---

### Enum 2: PriceModel

```prisma
enum PriceModel {
  FREE          // No cost (included in subscription)
  ONE_TIME      // Single purchase
  MONTHLY       // Recurring monthly fee
  ANNUAL        // Recurring annual fee
  USAGE_BASED   // Pay per use/API call
  CUSTOM        // Contact for pricing
}
```

**Alignment with Subscription Tiers:**
- FREE: Pre-installed with certain tiers
- CUSTOM: Pay-per-use marketplace (CUSTOM tier users)
- ONE_TIME: Permanent license purchase
- MONTHLY/ANNUAL: Add-on subscriptions
- USAGE_BASED: Metered billing (e.g., API calls, AI tokens)

---

### Enum 3: IntegrationType

```prisma
enum IntegrationType {
  API           // REST/GraphQL API
  WEBHOOK       // Event-driven webhooks
  EMBED         // Embedded widget/iframe
  STANDALONE    // Separate application
  N8N_WORKFLOW  // n8n workflow automation
  NATIVE        // Built into platform
}
```

---

### Enum 4: ToolStatus

```prisma
enum ToolStatus {
  ACTIVE        // Live and purchasable
  COMING_SOON   // Announced but not yet available
  BETA          // Early access/testing
  DEPRECATED    // Being phased out
  DISABLED      // Temporarily unavailable
}
```

---

### Enum 5: BundleStatus

```prisma
enum BundleStatus {
  ACTIVE        // Available for purchase
  ARCHIVED      // No longer offered
  DRAFT         // Not yet published
}
```

---

### Enum 6: PaymentMethod

```prisma
enum PaymentMethod {
  CREDIT_CARD       // Stripe credit card
  ACH               // Bank transfer (Stripe ACH)
  INVOICE           // Manual invoicing
  PLATFORM_CREDITS  // Pre-purchased credits
}
```

---

### Enum 7: PaymentStatus

```prisma
enum PaymentStatus {
  PENDING      // Payment initiated
  PROCESSING   // Payment in progress
  COMPLETED    // Payment successful
  FAILED       // Payment failed
  REFUNDED     // Payment refunded
  CANCELLED    // Payment cancelled
}
```

---

### Enum 8: ReviewStatus

```prisma
enum ReviewStatus {
  PENDING       // Awaiting moderation
  APPROVED      // Approved and visible
  REJECTED      // Rejected by moderator
  FLAGGED       // Flagged for review
}
```

---

### Supporting Enums (Reference Existing)

These enums already exist in the schema and will be reused:

```prisma
// From existing schema
enum SubscriptionTier {
  FREE
  CUSTOM
  STARTER
  GROWTH
  ELITE
  ENTERPRISE
}

// New enum for marketplace
enum PurchaseType {
  TOOL
  BUNDLE
}

// New enum for cart
enum CartItemType {
  TOOL
  BUNDLE
}

// New enum for purchase status
enum PurchaseStatus {
  ACTIVE       // Purchase is active
  CANCELLED    // User cancelled
  EXPIRED      // Subscription expired
  REFUNDED     // Refunded
}
```

---

## 🔗 Relationships Summary

### One-to-Many Relationships

1. **marketplace_tools → marketplace_reviews** (one tool, many reviews)
2. **marketplace_tools → marketplace_purchases** (one tool, many purchases)
3. **marketplace_tools → marketplace_bundle_items** (one tool in many bundles)
4. **marketplace_tools → marketplace_cart** (one tool in many carts)
5. **marketplace_bundles → marketplace_bundle_items** (one bundle, many tools)
6. **marketplace_bundles → marketplace_purchases** (one bundle, many purchases)
7. **organizations → marketplace_purchases** (one org, many purchases)
8. **organizations → marketplace_cart** (one org, many cart items)
9. **organizations → marketplace_reviews** (one org, many reviews)
10. **users → marketplace_purchases** (one user, many purchases)
11. **users → marketplace_cart** (one user, many cart items)
12. **users → marketplace_reviews** (one user, many reviews)

### Many-to-Many Relationships

1. **marketplace_bundles ↔ marketplace_tools** via `marketplace_bundle_items`

### Total Relationships: 13 (12 one-to-many, 1 many-to-many)

---

## 📊 Indexes (26 Total)

### Performance Indexes

**marketplace_tools (8):**
- `category` - Filter by tool category
- `status` - Filter active/inactive tools
- `required_tier` - Tier-based access control
- `price_model` - Filter by pricing type
- `is_featured` - Featured tools query
- `purchase_count` - Sort by popularity
- `avg_rating` - Sort by rating

**marketplace_bundles (3):**
- `status` - Filter active bundles
- `is_featured` - Featured bundles
- `purchase_count` - Sort by popularity

**marketplace_bundle_items (2):**
- `bundle_id` - Bundle lookup
- `tool_id` - Tool lookup

**marketplace_purchases (7):**
- `organization_id` - Multi-tenancy (RLS)
- `user_id` - User purchase history
- `payment_status` - Payment filtering
- `status` - Active purchases
- `tool_id` - Tool purchase lookup
- `bundle_id` - Bundle purchase lookup
- `purchase_date` - Sort by date

**marketplace_cart (4):**
- `organization_id` - Multi-tenancy (RLS)
- `user_id` - User cart lookup
- `tool_id` - Tool in cart
- `bundle_id` - Bundle in cart

**marketplace_reviews (5):**
- `tool_id` - Tool reviews
- `organization_id` - Multi-tenancy (RLS)
- `user_id` - User reviews
- `status` - Moderation filtering
- `rating` - Sort by rating

---

## 🔒 Row Level Security (RLS) Requirements

### Tables Requiring RLS Policies

#### 1. marketplace_purchases

**Policy:** Organization isolation

```sql
-- SELECT: Users can only see their organization's purchases
CREATE POLICY "marketplace_purchases_select_policy" ON marketplace_purchases
  FOR SELECT
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- INSERT: Users can only create purchases for their organization
CREATE POLICY "marketplace_purchases_insert_policy" ON marketplace_purchases
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- UPDATE: Users can only update their organization's purchases
CREATE POLICY "marketplace_purchases_update_policy" ON marketplace_purchases
  FOR UPDATE
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- DELETE: Prevent deletion (use status updates instead)
CREATE POLICY "marketplace_purchases_delete_policy" ON marketplace_purchases
  FOR DELETE
  USING (false);  -- No deletes allowed
```

#### 2. marketplace_cart

**Policy:** User isolation (user_id) + Organization visibility

```sql
-- SELECT: Users can see their own cart items
CREATE POLICY "marketplace_cart_select_policy" ON marketplace_cart
  FOR SELECT
  USING (
    user_id = current_setting('app.current_user_id', true)::uuid
    OR organization_id = current_setting('app.current_organization_id', true)::uuid
  );

-- INSERT: Users can only add to their own cart
CREATE POLICY "marketplace_cart_insert_policy" ON marketplace_cart
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- UPDATE: Users can update their own cart
CREATE POLICY "marketplace_cart_update_policy" ON marketplace_cart
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- DELETE: Users can delete their own cart items
CREATE POLICY "marketplace_cart_delete_policy" ON marketplace_cart
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::uuid);
```

#### 3. marketplace_reviews

**Policy:** Organization isolation (but can view all approved reviews)

```sql
-- SELECT: Everyone can see APPROVED reviews, users can see their own pending reviews
CREATE POLICY "marketplace_reviews_select_policy" ON marketplace_reviews
  FOR SELECT
  USING (
    status = 'APPROVED'
    OR user_id = current_setting('app.current_user_id', true)::uuid
  );

-- INSERT: Users can create reviews for their organization
CREATE POLICY "marketplace_reviews_insert_policy" ON marketplace_reviews
  FOR INSERT
  WITH CHECK (
    organization_id = current_setting('app.current_organization_id', true)::uuid
    AND user_id = current_setting('app.current_user_id', true)::uuid
  );

-- UPDATE: Users can update their own reviews
CREATE POLICY "marketplace_reviews_update_policy" ON marketplace_reviews
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- DELETE: Users can delete their own reviews
CREATE POLICY "marketplace_reviews_delete_policy" ON marketplace_reviews
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::uuid);
```

### Tables WITHOUT RLS (Public Catalog)

**No RLS needed:**
- `marketplace_tools` - Global catalog, everyone can view
- `marketplace_bundles` - Global catalog, everyone can view
- `marketplace_bundle_items` - Global catalog data

**Security Note:** While these tables don't have RLS, they're read-only for regular users. Only SUPER_ADMIN can modify via admin panel.

---

## 📝 Seed Data Requirements

### Initial Tools to Seed

Based on complete AI tools inventory, seed ~50 tools across categories:

#### Lead Management (8 tools)
1. Lead Generation Agent - 24/7 Lead Capture System
2. Lead Scoring Engine - AI prospect enrichment
3. Lead Source Analysis - Origin tracking
4. Lead Capture Summary Generator
5. Multi-Touch Campaign Engine - Nurturing sequences
6. Client Communication Preferences Tracker
7. Budget Range Prediction Tool - DTI analysis
8. Client Pre-Qualification System

#### Property & Listings (7 tools)
9. Listing Description Generator - SEO copywriting
10. Property Photo Enhancement - AI image optimization
11. Virtual Staging AI - Furniture placement
12. Property Alert System - New listing notifications
13. Property Comparison Engine
14. Virtual Tour Coordination
15. Property Matching Algorithm

#### Market Analysis (8 tools)
16. Automated CMA Generator
17. Predictive Analytics Engine - Price forecasting
18. Risk Assessment AI - Depreciation scoring
19. Market Data Integration - Real-time trends
20. Investment Property Analyzer - ROI/cap rate
21. Portfolio Performance Tracker
22. Competitive Analysis Tool
23. Territory Management System

#### Transaction & Documents (4 tools)
24. Contract Generation System - Auto-populated templates
25. Document Processing Automation - Data extraction
26. Transaction Milestone Tracker
27. Compliance Monitor - Fair Housing alerts

#### Financial (2 tools)
28. Commission Calculator - Auto splits/fees
29. Automated Financial Reporting

#### Customer Service (6 tools)
30. Booking Agent - Appointment scheduling
31. Calendar Integration - Reminders
32. No-Show Prevention System
33. Script Generator - Call scripts
34. Email Template Engine
35. Review Management System

#### CRM Module (4 tools)
36. Contact Activity Feed AI
37. Referral Network Manager
38. Client Lifecycle Tracker
39. Appointment Reminder System

#### Other Modules (15 tools)
40. Transaction Analytics Dashboard
41. Agent Performance Tracker
42. Mortgage Lender Integration
43. AI Property Valuation (AVM)
44. Neighborhood Intelligence
45. Expense Tracker AI
46. Tax Optimization Planner
47. QuickBooks Integration
48. Social Media Auto-Posting
49. Marketing Automation Engine
50. Campaign ROI Tracker
51. Listing Engagement Monitor
52. Sai Universal Assistant (included in all tiers)
53. RAG System (included in GROWTH+)
54. AI Hub Management (included in GROWTH+)

### Initial Bundles to Seed

1. **Lead Generation Pro Bundle** - Tools 1-8 (20% discount)
2. **Listing Domination Bundle** - Tools 9-15 (25% discount)
3. **Market Intelligence Bundle** - Tools 16-23 (25% discount)
4. **Transaction Management Bundle** - Tools 24-29 (15% discount)
5. **Complete Real Estate Suite** - All 54 tools (35% discount)

---

## ✅ Schema Validation Checklist

### Design Quality
- [x] All models have proper primary keys (uuid)
- [x] All foreign keys defined with @relation
- [x] Cascade deletes configured appropriately
- [x] Indexes on all foreign keys
- [x] Indexes on frequently queried fields
- [x] Multi-tenancy fields (organization_id, user_id)
- [x] Timestamps (created_at, updated_at)
- [x] Proper field types (@db annotations)

### Business Logic
- [x] Price model flexibility (FREE, ONE_TIME, MONTHLY, etc.)
- [x] Subscription support (start/end dates, auto-renew)
- [x] Payment tracking (Stripe integration)
- [x] Review moderation workflow
- [x] Shopping cart functionality
- [x] Bundle discount tracking
- [x] Usage analytics (purchase_count, usage_count)

### Security
- [x] RLS policies designed for purchases
- [x] RLS policies designed for cart
- [x] RLS policies designed for reviews
- [x] Check constraints for purchase types
- [x] Unique constraints prevent duplicates
- [x] Cascade deletes protect data integrity

### Compatibility
- [x] Follows existing schema patterns
- [x] Uses existing SubscriptionTier enum
- [x] Compatible with organizations table
- [x] Compatible with users table
- [x] Field naming matches existing conventions

---

## 🚀 Next Steps (Session 3.5)

1. **Create Prisma Migration**
   ```bash
   cd (platform)
   npm run db:migrate --name marketplace-module-schema
   ```

2. **Apply RLS Policies**
   - Add SQL in migration file for RLS policies
   - Add check constraints for purchase/cart types

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Update Schema Docs**
   ```bash
   npm run db:docs
   ```

5. **Seed Initial Data**
   - Create seed script for 50+ tools
   - Create seed script for 5 bundles
   - Populate with data from tools inventory

6. **Update Module Queries/Actions**
   - Session 3.6: Update marketplace providers
   - Align with new schema field names
   - Add new query functions for bundles

---

## 📊 Design Statistics

**Models:** 6
- 5 main tables
- 1 junction table

**Enums:** 11
- 8 new marketplace enums
- 3 supporting enums (PurchaseType, CartItemType, PurchaseStatus)

**Relationships:** 13
- 12 one-to-many
- 1 many-to-many (bundles ↔ tools)

**Indexes:** 26
- Covering all foreign keys
- Performance indexes on frequently queried fields

**RLS Policies:** 12
- 4 per table × 3 tables (SELECT, INSERT, UPDATE, DELETE)

**Check Constraints:** 2
- marketplace_purchases: Enforce tool XOR bundle
- marketplace_cart: Enforce tool XOR bundle

**Seed Requirements:**
- 50+ tools across 10 categories
- 5 curated bundles

---

## ✅ DESIGN VALIDATION

**Completeness:**
- ✅ All 6 models designed
- ✅ All 8 required enums defined
- ✅ All relationships documented
- ✅ All indexes identified
- ✅ All RLS policies specified
- ✅ Seed data requirements listed

**Compatibility:**
- ✅ Follows existing schema patterns
- ✅ Uses platform naming conventions
- ✅ Integrates with organizations/users
- ✅ Aligns with subscription tier system

**Security:**
- ✅ Multi-tenancy enforced
- ✅ RLS policies comprehensive
- ✅ Data integrity constraints
- ✅ Cascade deletes configured

**Business Requirements:**
- ✅ Supports all price models
- ✅ Enables bundle creation
- ✅ Tracks purchases per organization
- ✅ Review and rating system
- ✅ Shopping cart functionality
- ✅ Stripe payment integration

---

**DESIGN STATUS:** ✅ COMPLETE - Ready for Session 3.5 (Implementation)

**Next Session:** 3.2 - Design REID Analytics Schema
