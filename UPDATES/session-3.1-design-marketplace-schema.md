# Session 3.1: Design Marketplace Schema

**Phase:** 3 - Full Feature Set
**Priority:** 🟡 MEDIUM (after MVP validation)
**Estimated Time:** 2 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Design complete Prisma schema for Marketplace module (5 models) with relationships, indexes, and RLS requirements.

**Models to Design:**
1. `marketplace_tools` - AI tools catalog
2. `marketplace_bundles` - Tool bundles/packages
3. `marketplace_purchases` - Purchase transactions
4. `marketplace_cart` - Shopping cart items
5. `marketplace_reviews` - Tool reviews and ratings

---

## 📋 TASK FOR AGENT

```markdown
DESIGN MARKETPLACE MODULE SCHEMA for (platform) project

**Context:**
Design database schema for AI tools marketplace.
Reference complete tools inventory for initial data seeding.

**Reference Files:**
READ FIRST:
- n8n-tools-outlines/complete-ai-tools-inventory.md - Complete tools list
- prisma/SCHEMA-MODELS.md - Existing schema patterns
- lib/modules/marketplace/ - Current mock provider structure

**Requirements:**

1. **marketplace_tools Model:**
   ```prisma
   model marketplace_tools {
     id                 String   @id @default(uuid())
     name               String
     description        String   @db.Text
     category           ToolCategory // Lead Gen, Property, Market Analysis, etc.
     price_model        PriceModel // FREE, ONE_TIME, MONTHLY, USAGE_BASED
     price_amount       Decimal?
     required_tier      SubscriptionTier // FREE, STARTER, GROWTH, ELITE
     features           Json // List of features
     tech_stack         Json // Technologies used
     integration_type   IntegrationType // API, WEBHOOK, EMBED, STANDALONE
     status             ToolStatus // ACTIVE, COMING_SOON, DEPRECATED
     provider           String // "Internal" or third-party name
     documentation_url  String?
     demo_url           String?

     // Multi-tenancy (tools are global, not org-specific)
     // But track organization purchases

     // Timestamps
     created_at         DateTime @default(now())
     updated_at         DateTime @updatedAt

     // Relationships
     reviews            marketplace_reviews[]
     purchases          marketplace_purchases[]
     bundle_items       marketplace_bundle_items[]
     cart_items         marketplace_cart[]

     @@index([category])
     @@index([status])
     @@index([required_tier])
   }
   ```

2. **marketplace_bundles Model:**
   ```prisma
   model marketplace_bundles {
     id                 String   @id @default(uuid())
     name               String
     description        String   @db.Text
     price_amount       Decimal
     discount_percent   Int // Discount vs buying individually
     required_tier      SubscriptionTier
     status             BundleStatus // ACTIVE, ARCHIVED

     created_at         DateTime @default(now())
     updated_at         DateTime @updatedAt

     // Relationships
     items              marketplace_bundle_items[]
     purchases          marketplace_purchases[]

     @@index([status])
   }

   // Junction table for bundles
   model marketplace_bundle_items {
     id                 String   @id @default(uuid())
     bundle_id          String
     tool_id            String

     bundle             marketplace_bundles @relation(fields: [bundle_id], references: [id], onDelete: Cascade)
     tool               marketplace_tools @relation(fields: [tool_id], references: [id], onDelete: Cascade)

     @@unique([bundle_id, tool_id])
     @@index([bundle_id])
     @@index([tool_id])
   }
   ```

3. **marketplace_purchases Model:**
   ```prisma
   model marketplace_purchases {
     id                 String   @id @default(uuid())
     organization_id    String // Multi-tenancy
     user_id            String // Who made purchase

     // What was purchased
     tool_id            String?
     bundle_id          String?

     // Payment details
     amount             Decimal
     currency           String @default("USD")
     payment_method     PaymentMethod // CREDIT_CARD, INVOICE, CREDITS
     payment_status     PaymentStatus // PENDING, COMPLETED, FAILED, REFUNDED
     stripe_payment_id  String? // For Stripe integration

     // Subscription (if applicable)
     subscription_start DateTime?
     subscription_end   DateTime?
     auto_renew         Boolean @default(false)

     created_at         DateTime @default(now())
     updated_at         DateTime @updatedAt

     // Relationships
     organization       organizations @relation(fields: [organization_id], references: [id])
     user               users @relation(fields: [user_id], references: [id])
     tool               marketplace_tools? @relation(fields: [tool_id], references: [id])
     bundle             marketplace_bundles? @relation(fields: [bundle_id], references: [id])

     @@index([organization_id])
     @@index([user_id])
     @@index([payment_status])
     @@index([tool_id])
     @@index([bundle_id])
   }
   ```

4. **marketplace_cart Model:**
   ```prisma
   model marketplace_cart {
     id                 String   @id @default(uuid())
     organization_id    String // Multi-tenancy
     user_id            String // Cart owner

     // Cart item
     tool_id            String?
     bundle_id          String?
     quantity           Int @default(1)

     created_at         DateTime @default(now())
     updated_at         DateTime @updatedAt

     // Relationships
     organization       organizations @relation(fields: [organization_id], references: [id])
     user               users @relation(fields: [user_id], references: [id])
     tool               marketplace_tools? @relation(fields: [tool_id], references: [id])
     bundle             marketplace_bundles? @relation(fields: [bundle_id], references: [id])

     @@unique([user_id, tool_id]) // One tool per user cart
     @@unique([user_id, bundle_id]) // One bundle per user cart
     @@index([organization_id])
     @@index([user_id])
   }
   ```

5. **marketplace_reviews Model:**
   ```prisma
   model marketplace_reviews {
     id                 String   @id @default(uuid())
     tool_id            String
     organization_id    String // Multi-tenancy
     user_id            String // Reviewer

     rating             Int // 1-5
     title              String?
     review             String? @db.Text
     verified_purchase  Boolean @default(false)
     helpful_count      Int @default(0)
     status             ReviewStatus // PENDING, APPROVED, REJECTED

     created_at         DateTime @default(now())
     updated_at         DateTime @updatedAt

     // Relationships
     tool               marketplace_tools @relation(fields: [tool_id], references: [id], onDelete: Cascade)
     organization       organizations @relation(fields: [organization_id], references: [id])
     user               users @relation(fields: [user_id], references: [id])

     @@unique([tool_id, user_id]) // One review per user per tool
     @@index([tool_id])
     @@index([status])
   }
   ```

6. **Required Enums:**
   ```prisma
   enum ToolCategory {
     LEAD_GENERATION
     LEAD_NURTURING
     LISTING_OPTIMIZATION
     PROPERTY_SHOPPING
     MARKET_INTELLIGENCE
     INVESTMENT_ANALYSIS
     DOCUMENT_PROCESSING
     COMMISSION_FINANCIAL
     BOOKING_SCHEDULING
     COMMUNICATION
   }

   enum PriceModel {
     FREE
     ONE_TIME
     MONTHLY
     ANNUAL
     USAGE_BASED
     CUSTOM
   }

   enum IntegrationType {
     API
     WEBHOOK
     EMBED
     STANDALONE
     N8N_WORKFLOW
   }

   enum ToolStatus {
     ACTIVE
     COMING_SOON
     BETA
     DEPRECATED
   }

   enum BundleStatus {
     ACTIVE
     ARCHIVED
   }

   enum PaymentMethod {
     CREDIT_CARD
     INVOICE
     PLATFORM_CREDITS
   }

   enum PaymentStatus {
     PENDING
     COMPLETED
     FAILED
     REFUNDED
     CANCELLED
   }

   enum ReviewStatus {
     PENDING
     APPROVED
     REJECTED
   }
   ```

7. **RLS Policies Required:**
   - marketplace_purchases: Filter by organization_id
   - marketplace_cart: Filter by user_id OR organization_id
   - marketplace_reviews: Filter by organization_id
   - marketplace_tools: Global (no filtering)
   - marketplace_bundles: Global (no filtering)

8. **Output Format:**
   Create detailed schema design document:
   ```markdown
   # Marketplace Module Schema Design

   ## Models (5)
   [Complete Prisma schema for all models]

   ## Enums (8)
   [Complete enum definitions]

   ## Relationships
   - Tool → Reviews (one-to-many)
   - Tool → Purchases (one-to-many)
   - Bundle → Bundle Items → Tools (many-to-many)
   - Organization → Purchases (one-to-many)
   - User → Purchases, Cart, Reviews

   ## Indexes
   [List all indexes and rationale]

   ## RLS Requirements
   [Which models need organization filtering]

   ## Seed Data Requirements
   [Initial tools from inventory to seed]
   ```

**DO NOT implement yet - design only**

**Return Format:**
## ✅ EXECUTION REPORT

**Schema Design Complete:**
- Models: 5 (tools, bundles, bundle_items, purchases, cart, reviews)
- Enums: 8
- Relationships: [count]
- Indexes: [count]
- RLS Policies: [count]

**Design Document Created:**
[Complete Prisma schema ready for Session 3.5]

**Validation:**
- ✅ All relationships defined
- ✅ Multi-tenancy considered
- ✅ Indexes for query performance
- ✅ Enums match business requirements
- ✅ Compatible with existing schema

**Next Steps:**
- Review design with team
- Validate against tools inventory
- Proceed to Session 3.2 (REID schema)
```

---

## 📊 SUCCESS CRITERIA

✅ **SESSION COMPLETE when:**
- Complete Prisma schema designed for 5 models
- All enums defined
- Relationships documented
- Indexes identified
- RLS requirements specified
- Seed data requirements listed
- Design validated against existing schema

---

**Created:** 2025-10-10
**Dependencies:** Phase 2 complete
**Next Session:** 3.2 - Design REID Schema
