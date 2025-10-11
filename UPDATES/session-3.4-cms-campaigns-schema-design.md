# CMS Campaigns Schema Design

**Session:** 3.4 - Design CMS Campaigns Schema
**Date:** 2025-10-10
**Status:** ✅ DESIGN COMPLETE
**Phase:** 3 - Full Feature Set

---

## 🎯 OBJECTIVE

Design 4 models for CMS Campaigns module to enable campaign management, email campaigns, social media posts, and content linking.

**Note:** `content` table already exists - just need relationships

---

## 📊 SCHEMA DESIGN

### 1. campaigns

**Purpose:** Campaign metadata and orchestration

```prisma
model campaigns {
  id                  String         @id @default(uuid())
  organization_id     String
  name                String         @db.VarChar(200)
  description         String?        @db.Text
  slug                String         @db.VarChar(255)

  // Campaign Classification
  type                CampaignType   // EMAIL_MARKETING, SOCIAL_MEDIA, etc.
  status              CampaignStatus @default(DRAFT) // DRAFT, ACTIVE, COMPLETED, etc.

  // Timing
  start_date          DateTime?      @db.Timestamp(6)
  end_date            DateTime?      @db.Timestamp(6)
  created_at          DateTime       @default(now()) @db.Timestamp(6)
  updated_at          DateTime       @updatedAt @db.Timestamp(6)

  // Goals & Budget
  goals               Json?          @db.JsonB // { target_leads: 1000, target_revenue: 50000, ... }
  budget              Decimal?       @db.Decimal(12, 2)
  budget_spent        Decimal        @default(0) @db.Decimal(12, 2)

  // Performance Tracking
  metrics             Json?          @db.JsonB // { opens: 0, clicks: 0, conversions: 0, ... }

  // Ownership & Visibility
  created_by          String
  tags                String[]       @default([])
  is_archived         Boolean        @default(false)

  // Relationships
  organization        organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  creator             users          @relation("CampaignCreator", fields: [created_by], references: [id])

  email_campaigns     email_campaigns[]
  social_media_posts  social_media_posts[]
  campaign_content    campaign_content[]

  @@unique([organization_id, slug])
  @@index([organization_id])
  @@index([status])
  @@index([type])
  @@index([created_by])
}
```

**Key Fields:**
- `id` - UUID primary key
- `organization_id` - Multi-tenancy isolation (REQUIRED)
- `name` - Campaign name (e.g., "Q1 2025 Lead Gen")
- `slug` - URL-friendly identifier
- `type` - CampaignType enum (EMAIL_MARKETING, SOCIAL_MEDIA, etc.)
- `status` - CampaignStatus enum (DRAFT, ACTIVE, COMPLETED, etc.)
- `start_date` / `end_date` - Campaign duration
- `goals` - JSON object with campaign objectives
- `budget` / `budget_spent` - Financial tracking
- `metrics` - JSON object with performance metrics
- `tags` - Array of tags for categorization
- `is_archived` - Soft delete flag

**Indexes:**
- `organization_id` - Fast org filtering
- `status` - Filter by campaign status
- `type` - Filter by campaign type
- `created_by` - Filter by creator

**Unique Constraint:**
- `[organization_id, slug]` - Unique slug per organization

---

### 2. email_campaigns

**Purpose:** Email-specific campaigns with SMTP integration

```prisma
model email_campaigns {
  id                  String         @id @default(uuid())
  campaign_id         String
  organization_id     String

  // Email Content
  name                String         @db.VarChar(200)
  subject             String         @db.VarChar(255)
  preview_text        String?        @db.VarChar(255)
  body_html           String         @db.Text
  body_plaintext      String?        @db.Text

  // Email Configuration
  from_name           String         @db.VarChar(100)
  from_email          String         @db.VarChar(255)
  reply_to            String?        @db.VarChar(255)

  // Recipients & Lists
  recipient_lists     String[]       @default([]) // List IDs or tags
  recipient_count     Int            @default(0)

  // Scheduling
  scheduled_at        DateTime?      @db.Timestamp(6)
  sent_at             DateTime?      @db.Timestamp(6)
  status              EmailStatus    @default(DRAFT) // DRAFT, SCHEDULED, SENDING, SENT, FAILED

  // Performance Metrics
  total_sent          Int            @default(0)
  total_delivered     Int            @default(0)
  total_opened        Int            @default(0)
  total_clicked       Int            @default(0)
  total_bounced       Int            @default(0)
  total_unsubscribed  Int            @default(0)
  open_rate           Decimal?       @db.Decimal(5, 2) // Percentage
  click_rate          Decimal?       @db.Decimal(5, 2) // Percentage

  // A/B Testing (Future)
  is_ab_test          Boolean        @default(false)
  ab_test_config      Json?          @db.JsonB

  // Timestamps
  created_at          DateTime       @default(now()) @db.Timestamp(6)
  updated_at          DateTime       @updatedAt @db.Timestamp(6)
  created_by          String

  // Relationships
  campaign            campaigns      @relation(fields: [campaign_id], references: [id], onDelete: Cascade)
  organization        organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  creator             users          @relation("EmailCampaignCreator", fields: [created_by], references: [id])

  @@index([campaign_id])
  @@index([organization_id])
  @@index([status])
  @@index([scheduled_at])
}
```

**Key Fields:**
- `campaign_id` - Parent campaign reference
- `subject` / `preview_text` - Email subject and preview
- `body_html` / `body_plaintext` - Email content (both formats)
- `from_name` / `from_email` / `reply_to` - Sender configuration
- `recipient_lists` - Array of list IDs or tags
- `scheduled_at` / `sent_at` - Scheduling timestamps
- `status` - EmailStatus enum (DRAFT, SCHEDULED, SENDING, SENT, FAILED)
- **Performance metrics:** opens, clicks, bounces, unsubscribes
- `open_rate` / `click_rate` - Calculated percentages
- `is_ab_test` / `ab_test_config` - A/B testing support (future)

**Indexes:**
- `campaign_id` - Filter by parent campaign
- `organization_id` - Multi-tenancy isolation
- `status` - Filter by email status
- `scheduled_at` - Find upcoming scheduled emails

---

### 3. social_media_posts

**Purpose:** Social media posts with platform-specific configs

```prisma
model social_media_posts {
  id                  String         @id @default(uuid())
  campaign_id         String
  organization_id     String

  // Post Content
  title               String?        @db.VarChar(200)
  post_text           String         @db.Text
  hashtags            String[]       @default([])
  mentions            String[]       @default([])

  // Platform Configuration
  platform            SocialPlatform // FACEBOOK, TWITTER, INSTAGRAM, LINKEDIN, etc.
  platform_config     Json?          @db.JsonB // Platform-specific settings

  // Media
  media_urls          String[]       @default([]) // Images, videos, etc.
  media_metadata      Json?          @db.JsonB // Alt text, dimensions, etc.
  link_url            String?        @db.VarChar(500)
  link_preview        Json?          @db.JsonB // Title, description, image

  // Publishing
  scheduled_at        DateTime?      @db.Timestamp(6)
  published_at        DateTime?      @db.Timestamp(6)
  status              PostStatus     @default(DRAFT) // DRAFT, SCHEDULED, PUBLISHED, FAILED

  // External References
  external_post_id    String?        @db.VarChar(255) // Platform-specific post ID
  external_url        String?        @db.VarChar(500) // Direct link to published post

  // Performance Metrics
  impressions         Int            @default(0)
  reach               Int            @default(0)
  likes               Int            @default(0)
  comments            Int            @default(0)
  shares              Int            @default(0)
  clicks              Int            @default(0)
  engagement_rate     Decimal?       @db.Decimal(5, 2) // Percentage

  // Publishing Info
  is_carousel         Boolean        @default(false)
  is_video            Boolean        @default(false)
  is_story            Boolean        @default(false)
  is_reel             Boolean        @default(false)

  // Timestamps
  created_at          DateTime       @default(now()) @db.Timestamp(6)
  updated_at          DateTime       @updatedAt @db.Timestamp(6)
  created_by          String

  // Relationships
  campaign            campaigns      @relation(fields: [campaign_id], references: [id], onDelete: Cascade)
  organization        organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  creator             users          @relation("SocialPostCreator", fields: [created_by], references: [id])

  @@index([campaign_id])
  @@index([organization_id])
  @@index([platform])
  @@index([status])
  @@index([scheduled_at])
}
```

**Key Fields:**
- `campaign_id` - Parent campaign reference
- `post_text` - Main post content
- `hashtags` / `mentions` - Social media tags and mentions
- `platform` - SocialPlatform enum (FACEBOOK, TWITTER, INSTAGRAM, etc.)
- `platform_config` - JSON for platform-specific settings
- `media_urls` - Array of media URLs (images, videos)
- `media_metadata` - JSON for alt text, dimensions, etc.
- `link_url` / `link_preview` - External link with preview metadata
- `scheduled_at` / `published_at` - Scheduling timestamps
- `status` - PostStatus enum (DRAFT, SCHEDULED, PUBLISHED, FAILED)
- `external_post_id` / `external_url` - Platform-specific identifiers
- **Engagement metrics:** impressions, reach, likes, comments, shares, clicks
- `engagement_rate` - Calculated percentage
- **Content type flags:** is_carousel, is_video, is_story, is_reel

**Indexes:**
- `campaign_id` - Filter by parent campaign
- `organization_id` - Multi-tenancy isolation
- `platform` - Filter by social platform
- `status` - Filter by post status
- `scheduled_at` - Find upcoming scheduled posts

---

### 4. campaign_content

**Purpose:** Junction table linking campaigns to existing content

```prisma
model campaign_content {
  id                  String         @id @default(uuid())
  campaign_id         String
  content_id          String
  organization_id     String

  // Link Metadata
  position            Int            @default(0) // Order in campaign
  is_primary          Boolean        @default(false) // Primary content piece
  notes               String?        @db.Text

  // Timestamps
  linked_at           DateTime       @default(now()) @db.Timestamp(6)
  linked_by           String

  // Relationships
  campaign            campaigns      @relation(fields: [campaign_id], references: [id], onDelete: Cascade)
  content             content        @relation(fields: [content_id], references: [id], onDelete: Cascade)
  organization        organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  linker              users          @relation("CampaignContentLinker", fields: [linked_by], references: [id])

  @@unique([campaign_id, content_id])
  @@index([campaign_id])
  @@index([content_id])
  @@index([organization_id])
}
```

**Key Fields:**
- `campaign_id` - Parent campaign reference
- `content_id` - Referenced content (blog post, landing page, etc.)
- `organization_id` - Multi-tenancy isolation
- `position` - Order in campaign (for sorting)
- `is_primary` - Mark primary content piece
- `notes` - Additional context about the link
- `linked_at` / `linked_by` - Audit trail

**Indexes:**
- `campaign_id` - Fast campaign content lookup
- `content_id` - Fast content campaign lookup
- `organization_id` - Multi-tenancy isolation

**Unique Constraint:**
- `[campaign_id, content_id]` - Prevent duplicate links

---

## 🔗 RELATIONSHIPS SUMMARY

### campaigns (1:many relationships)
- `campaigns` → `email_campaigns` (1:many)
- `campaigns` → `social_media_posts` (1:many)
- `campaigns` → `campaign_content` (1:many via junction)

### email_campaigns
- `email_campaigns` → `campaigns` (many:1)
- `email_campaigns` → `organizations` (many:1)
- `email_campaigns` → `users` (many:1, creator)

### social_media_posts
- `social_media_posts` → `campaigns` (many:1)
- `social_media_posts` → `organizations` (many:1)
- `social_media_posts` → `users` (many:1, creator)

### campaign_content (junction table)
- `campaign_content` → `campaigns` (many:1)
- `campaign_content` → `content` (many:1)
- `campaign_content` → `organizations` (many:1)
- `campaign_content` → `users` (many:1, linker)

### Existing content table (updated)
- `content` ↔ `campaigns` (many:many via `campaign_content`)

---

## 🛡️ MULTI-TENANCY & RLS

### RLS Policies (Row Level Security)

**All tables MUST filter by `organization_id`:**

```sql
-- campaigns
CREATE POLICY "campaigns_org_isolation" ON campaigns
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- email_campaigns
CREATE POLICY "email_campaigns_org_isolation" ON email_campaigns
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- social_media_posts
CREATE POLICY "social_media_posts_org_isolation" ON social_media_posts
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- campaign_content
CREATE POLICY "campaign_content_org_isolation" ON campaign_content
  USING (organization_id = current_setting('app.current_organization_id')::uuid);
```

### Prisma Middleware

**ALWAYS set tenant context before queries:**

```typescript
import { setTenantContext } from '@/lib/database/prisma-middleware';

// Before ANY campaign query
await setTenantContext({
  organizationId: session.user.organizationId,
  userId: session.user.id
});

// Now queries automatically filter by organization
const campaigns = await prisma.campaigns.findMany();
```

---

## 🔒 RBAC (Role-Based Access Control)

### Permission Requirements

**Campaign Management:**
- **View:** USER, MODERATOR, ADMIN, SUPER_ADMIN
- **Create:** MODERATOR, ADMIN, SUPER_ADMIN
- **Edit:** Campaign creator OR ADMIN OR SUPER_ADMIN
- **Delete:** Campaign creator (within 24h) OR ADMIN OR SUPER_ADMIN
- **Publish:** MODERATOR, ADMIN, SUPER_ADMIN

**Subscription Tier Requirements:**
- **STARTER ($299):** Campaign management included
- **GROWTH ($699):** + Advanced analytics
- **ELITE ($999):** + A/B testing, automation
- **ENTERPRISE:** Unlimited campaigns

---

## 📊 PERFORMANCE METRICS

### Metrics Storage (JSON Fields)

**campaigns.metrics:**
```json
{
  "total_emails_sent": 5000,
  "total_social_posts": 12,
  "total_content_pieces": 8,
  "total_impressions": 50000,
  "total_clicks": 2500,
  "total_conversions": 150,
  "conversion_rate": 6.0,
  "roi": 250.0,
  "cost_per_lead": 50.0
}
```

**campaigns.goals:**
```json
{
  "target_leads": 200,
  "target_revenue": 100000,
  "target_impressions": 100000,
  "target_engagement_rate": 5.0,
  "deadline": "2025-03-31"
}
```

**email_campaigns metrics:**
- `total_sent`, `total_delivered`, `total_opened`, `total_clicked`
- `total_bounced`, `total_unsubscribed`
- `open_rate`, `click_rate` (calculated)

**social_media_posts metrics:**
- `impressions`, `reach`, `likes`, `comments`, `shares`, `clicks`
- `engagement_rate` (calculated)

---

## 🚀 INTEGRATION POINTS

### Email Integration (Future)
- SMTP configuration in organization settings
- Integration with SendGrid, Mailchimp, or custom SMTP
- Email list management
- Unsubscribe handling
- Bounce tracking
- SPF/DKIM verification

### Social Media Integration (Future)
- OAuth connections to platforms (Facebook, Twitter, LinkedIn, etc.)
- Platform-specific API integrations
- Media upload to platforms
- Cross-posting automation
- Analytics sync from platforms

### Content Integration (Existing)
- Link existing `content` items to campaigns via `campaign_content`
- Track content performance within campaign context
- Reuse content across multiple campaigns

---

## 📋 ENUMS USED

### Existing Enums (No Changes Required)

**CampaignType:**
```typescript
CONTENT_MARKETING
EMAIL_MARKETING
SOCIAL_MEDIA
PAID_ADVERTISING
SEO_CAMPAIGN
LEAD_GENERATION
BRAND_AWARENESS
PRODUCT_LAUNCH
```

**CampaignStatus:**
```typescript
DRAFT
PLANNING
ACTIVE
PAUSED
COMPLETED
CANCELLED
```

**EmailStatus:**
```typescript
DRAFT
SCHEDULED
SENDING
SENT
FAILED
```

**PostStatus:**
```typescript
DRAFT
SCHEDULED
PUBLISHED
FAILED
```

**SocialPlatform:**
```typescript
FACEBOOK
TWITTER
INSTAGRAM
LINKEDIN
YOUTUBE
TIKTOK
PINTEREST
```

---

## ✅ SUCCESS CRITERIA VERIFICATION

### Design Requirements (ALL MET)

✅ **4 models fully designed:**
- `campaigns` - Campaign metadata, goals, budget, metrics
- `email_campaigns` - Email-specific campaigns with SMTP support
- `social_media_posts` - Social posts with platform configs
- `campaign_content` - Junction table for content linking

✅ **Relationships to existing `content` table defined:**
- Many-to-many via `campaign_content` junction table
- Maintains existing `content` model structure
- Supports content reuse across campaigns

✅ **Email and social platform fields included:**
- Email: subject, body, recipients, SMTP config, tracking
- Social: platform, text, media, hashtags, mentions, engagement

✅ **Scheduling and metrics tracking planned:**
- Email: scheduled_at, sent_at, open_rate, click_rate
- Social: scheduled_at, published_at, engagement_rate
- Campaign: budget tracking, goal tracking, ROI metrics

✅ **Multi-tenancy RLS specified:**
- All models have `organization_id` field
- RLS policies defined for all tables
- Prisma middleware integration documented

---

## 🔄 NEXT STEPS

**Session 3.5:** Implement All Schemas + Migrations
1. Add 4 models to `prisma/schema.prisma`
2. Update `content` model with `campaign_content` relation
3. Create Prisma migration
4. Apply migration to Supabase
5. Create RLS policies in Supabase
6. Update schema documentation
7. Verify with `npm run db:docs`

---

## 📝 NOTES

**Design Decisions:**

1. **Separation of email_campaigns and social_media_posts:**
   - Different platforms have different requirements
   - Separate metrics tracking for each channel
   - Easier to extend with platform-specific features

2. **JSON fields for metrics:**
   - Flexible structure for different metric types
   - Easy to add new metrics without schema changes
   - Platform-specific metrics can be stored

3. **Junction table for content:**
   - Many-to-many relationship (campaigns ↔ content)
   - Supports content reuse across campaigns
   - Maintains position/ordering within campaign

4. **Status enums:**
   - Reusing existing enums (EmailStatus, PostStatus)
   - CampaignStatus provides campaign-level lifecycle
   - Clear state transitions

5. **Multi-tenancy:**
   - Every table has `organization_id`
   - RLS policies enforce isolation
   - Prisma middleware provides additional safety

**Future Enhancements:**
- A/B testing for email campaigns
- Campaign templates
- Automated campaign workflows
- Advanced analytics dashboard
- Integration with marketing automation platforms
- Multi-channel attribution tracking

---

**End of Design Document**
