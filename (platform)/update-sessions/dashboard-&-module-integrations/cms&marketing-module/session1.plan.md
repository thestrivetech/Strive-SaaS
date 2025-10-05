# Session 1: Database Schema & Foundation

## Session Overview
**Goal:** Set up the complete database schema for ContentPilot CMS & Marketing module with multi-tenant isolation and RLS policies.

**Duration:** 3-4 hours
**Complexity:** Medium
**Dependencies:** Platform core (auth, organization setup)

## Objectives

1. ✅ Add ContentPilot tables to Prisma schema
2. ✅ Update User and Organization relations
3. ✅ Create and apply database migrations
4. ✅ Implement Row Level Security (RLS) policies
5. ✅ Verify multi-tenancy isolation
6. ✅ Create database indexes for performance

## Prerequisites

- [x] Platform core setup complete
- [x] Supabase connection configured
- [x] Understanding of RLS and multi-tenancy
- [x] Supabase MCP tools available

## Database Schema Implementation

### 1. Content Management Tables

**Add to `shared/prisma/schema.prisma`:**

```prisma
// ContentPilot CMS & Marketing Module Tables

model ContentItem {
  id             String   @id @default(cuid())
  title          String
  slug           String
  excerpt        String?
  content        String   @db.Text

  // Content Metadata
  type           ContentType
  status         ContentStatus @default(DRAFT)
  language       String   @default("en")

  // SEO & Marketing
  metaTitle      String?
  metaDescription String?
  keywords       String[]
  canonicalUrl   String?

  // Media & Assets
  featuredImage  String?
  gallery        String[]
  videoUrl       String?
  audioUrl       String?

  // Publishing
  publishedAt    DateTime?
  scheduledFor   DateTime?
  expiresAt      DateTime?

  // Engagement Metrics
  viewCount      Int      @default(0)
  shareCount     Int      @default(0)
  likeCount      Int      @default(0)
  commentCount   Int      @default(0)

  // Analytics
  analyticsData  Json?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Relations
  authorId       String
  author         User     @relation("ContentAuthor", fields: [authorId], references: [id])
  categoryId     String?
  category       ContentCategory? @relation(fields: [categoryId], references: [id])
  tags           ContentTag[]
  campaigns      CampaignContent[]
  revisions      ContentRevision[]
  comments       ContentComment[]

  @@unique([slug, organizationId])
  @@index([organizationId, status])
  @@index([organizationId, type])
  @@index([organizationId, publishedAt])
  @@map("content_items")
}

model ContentCategory {
  id             String   @id @default(cuid())
  name           String
  slug           String
  description    String?
  color          String?

  // Category Settings
  isActive       Boolean  @default(true)
  sortOrder      Int      @default(0)

  // SEO
  metaTitle      String?
  metaDescription String?

  // Parent-Child Relationships
  parentId       String?
  parent         ContentCategory? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children       ContentCategory[] @relation("CategoryHierarchy")

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  content        ContentItem[]

  @@unique([slug, organizationId])
  @@index([organizationId, isActive])
  @@map("content_categories")
}

model ContentTag {
  id             String   @id @default(cuid())
  name           String
  slug           String
  color          String?

  // Usage tracking
  usageCount     Int      @default(0)

  createdAt      DateTime @default(now())

  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Relations
  content        ContentItem[]

  @@unique([slug, organizationId])
  @@index([organizationId])
  @@map("content_tags")
}

model MediaAsset {
  id             String   @id @default(cuid())
  name           String
  originalName   String
  fileName       String
  fileUrl        String

  // File Details
  mimeType       String
  fileSize       Int
  width          Int?
  height         Int?
  duration       Float?

  // Metadata
  alt            String?
  caption        String?

  // Organization & Folder
  folderId       String?
  folder         MediaFolder? @relation(fields: [folderId], references: [id])

  // Usage tracking
  usageCount     Int      @default(0)
  lastUsed       DateTime?

  uploadedAt     DateTime @default(now())

  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Relations
  uploadedBy     String
  uploader       User     @relation(fields: [uploadedBy], references: [id])

  @@index([organizationId, folderId])
  @@index([organizationId, mimeType])
  @@map("media_assets")
}

model MediaFolder {
  id             String   @id @default(cuid())
  name           String
  path           String

  // Folder Hierarchy
  parentId       String?
  parent         MediaFolder? @relation("FolderHierarchy", fields: [parentId], references: [id])
  children       MediaFolder[] @relation("FolderHierarchy")

  createdAt      DateTime @default(now())

  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  assets         MediaAsset[]

  @@unique([path, organizationId])
  @@index([organizationId])
  @@map("media_folders")
}

model Campaign {
  id             String   @id @default(cuid())
  name           String
  description    String?

  // Campaign Configuration
  type           CampaignType
  status         CampaignStatus @default(DRAFT)

  // Scheduling
  startDate      DateTime?
  endDate        DateTime?
  timezone       String   @default("UTC")

  // Budget & Goals
  budget         Decimal?  @db.Decimal(10, 2)
  goalType       String?
  goalValue      Float?

  // Performance Metrics
  impressions    Int      @default(0)
  clicks         Int      @default(0)
  conversions    Int      @default(0)
  spend          Decimal  @default(0) @db.Decimal(10, 2)
  revenue        Decimal  @default(0) @db.Decimal(10, 2)

  // Analytics
  analyticsData  Json?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  content        CampaignContent[]
  emails         EmailCampaign[]
  socialPosts    SocialMediaPost[]

  @@index([organizationId, status])
  @@index([organizationId, type])
  @@map("campaigns")
}

model CampaignContent {
  id         String      @id @default(cuid())
  campaignId String
  campaign   Campaign    @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  contentId  String
  content    ContentItem @relation(fields: [contentId], references: [id], onDelete: Cascade)

  // Content Role in Campaign
  role       String
  priority   Int         @default(0)

  addedAt    DateTime    @default(now())

  @@unique([campaignId, contentId])
  @@index([campaignId])
  @@map("campaign_content")
}

model EmailCampaign {
  id             String   @id @default(cuid())
  campaignId     String?
  campaign       Campaign? @relation(fields: [campaignId], references: [id])

  // Email Details
  subject        String
  preheader      String?
  content        String   @db.Text
  plainText      String?  @db.Text

  // Sending Configuration
  fromName       String
  fromEmail      String
  replyTo        String?

  // Segmentation & Targeting
  audienceSegment Json?

  // Scheduling
  scheduledFor   DateTime?
  sentAt         DateTime?

  // Performance Metrics
  sent           Int      @default(0)
  delivered      Int      @default(0)
  opened         Int      @default(0)
  clicked        Int      @default(0)
  bounced        Int      @default(0)
  unsubscribed   Int      @default(0)

  // Status
  status         EmailStatus @default(DRAFT)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])

  @@index([organizationId, status])
  @@map("email_campaigns")
}

model SocialMediaPost {
  id             String   @id @default(cuid())
  campaignId     String?
  campaign       Campaign? @relation(fields: [campaignId], references: [id])

  // Post Content
  content        String   @db.Text
  mediaUrls      String[]

  // Platform Configuration
  platforms      SocialPlatform[]

  // Scheduling
  scheduledFor   DateTime?
  publishedAt    DateTime?

  // Performance per Platform
  platformMetrics Json?

  // Status
  status         PostStatus @default(DRAFT)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])

  @@index([organizationId, status])
  @@map("social_media_posts")
}

model ContentRevision {
  id         String      @id @default(cuid())
  contentId  String
  content    ContentItem @relation(fields: [contentId], references: [id], onDelete: Cascade)

  // Revision Data
  title      String
  contentBody String     @db.Text
  excerpt    String?

  // Revision Metadata
  version    Int
  comment    String?

  createdAt  DateTime    @default(now())

  // Relations
  createdBy  String
  creator    User        @relation(fields: [createdBy], references: [id])

  @@index([contentId])
  @@map("content_revisions")
}

model ContentComment {
  id         String      @id @default(cuid())
  contentId  String
  content    ContentItem @relation(fields: [contentId], references: [id], onDelete: Cascade)

  // Comment Details
  comment    String      @db.Text
  status     CommentStatus @default(PENDING)

  // Hierarchy
  parentId   String?
  parent     ContentComment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies    ContentComment[] @relation("CommentReplies")

  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt

  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Relations
  authorId   String
  author     User        @relation(fields: [authorId], references: [id])

  @@index([contentId, status])
  @@index([organizationId])
  @@map("content_comments")
}

// Enums
enum ContentType {
  ARTICLE
  PAGE
  BLOG_POST
  LANDING_PAGE
  EMAIL_TEMPLATE
  SOCIAL_POST
  PRESS_RELEASE
  NEWSLETTER
  CASE_STUDY
  WHITEPAPER
}

enum ContentStatus {
  DRAFT
  REVIEW
  APPROVED
  PUBLISHED
  ARCHIVED
  SCHEDULED
}

enum CampaignType {
  CONTENT_MARKETING
  EMAIL_MARKETING
  SOCIAL_MEDIA
  PAID_ADVERTISING
  SEO_CAMPAIGN
  LEAD_GENERATION
  BRAND_AWARENESS
  PRODUCT_LAUNCH
}

enum CampaignStatus {
  DRAFT
  PLANNING
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}

enum EmailStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  FAILED
}

enum PostStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
  FAILED
}

enum CommentStatus {
  PENDING
  APPROVED
  REJECTED
  SPAM
}

enum SocialPlatform {
  FACEBOOK
  TWITTER
  INSTAGRAM
  LINKEDIN
  YOUTUBE
  TIKTOK
  PINTEREST
}
```

### 2. Update Existing Models

**Add ContentPilot relations to User model:**
```prisma
model User {
  // ... existing fields

  // ContentPilot relations
  authoredContent   ContentItem[]     @relation("ContentAuthor")
  contentCategories ContentCategory[]
  mediaAssets       MediaAsset[]
  mediaFolders      MediaFolder[]
  campaigns         Campaign[]
  emailCampaigns    EmailCampaign[]
  socialPosts       SocialMediaPost[]
  contentRevisions  ContentRevision[]
  contentComments   ContentComment[]
}
```

**Add ContentPilot relations to Organization model:**
```prisma
model Organization {
  // ... existing fields

  // ContentPilot relations
  content           ContentItem[]
  contentCategories ContentCategory[]
  contentTags       ContentTag[]
  mediaAssets       MediaAsset[]
  mediaFolders      MediaFolder[]
  campaigns         Campaign[]
  emailCampaigns    EmailCampaign[]
  socialPosts       SocialMediaPost[]
  contentComments   ContentComment[]
}
```

### 3. Create Migration

**Using Supabase MCP:**

```typescript
// Tool: mcp__supabase__apply_migration
{
  "name": "add_contentpilot_cms_tables",
  "sql": `
    -- ContentPilot CMS & Marketing tables will be created by Prisma migration
    -- This migration adds RLS policies and performance indexes

    -- Enable RLS on all ContentPilot tables
    ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
    ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
    ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
    ALTER TABLE campaign_content ENABLE ROW LEVEL SECURITY;
    ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
    ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE content_revisions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE content_comments ENABLE ROW LEVEL SECURITY;

    -- RLS Policies for content_items
    CREATE POLICY "content_items_tenant_isolation" ON content_items
      USING ("organizationId" = current_setting('app.current_org_id')::text);

    CREATE POLICY "content_items_insert" ON content_items
      FOR INSERT WITH CHECK ("organizationId" = current_setting('app.current_org_id')::text);

    CREATE POLICY "content_items_update" ON content_items
      FOR UPDATE USING ("organizationId" = current_setting('app.current_org_id')::text);

    CREATE POLICY "content_items_delete" ON content_items
      FOR DELETE USING ("organizationId" = current_setting('app.current_org_id')::text);

    -- RLS Policies for content_categories
    CREATE POLICY "content_categories_tenant_isolation" ON content_categories
      USING ("organizationId" = current_setting('app.current_org_id')::text);

    CREATE POLICY "content_categories_insert" ON content_categories
      FOR INSERT WITH CHECK ("organizationId" = current_setting('app.current_org_id')::text);

    -- RLS Policies for content_tags
    CREATE POLICY "content_tags_tenant_isolation" ON content_tags
      USING ("organizationId" = current_setting('app.current_org_id')::text);

    -- RLS Policies for media_assets
    CREATE POLICY "media_assets_tenant_isolation" ON media_assets
      USING ("organizationId" = current_setting('app.current_org_id')::text);

    CREATE POLICY "media_assets_insert" ON media_assets
      FOR INSERT WITH CHECK ("organizationId" = current_setting('app.current_org_id')::text);

    -- RLS Policies for campaigns
    CREATE POLICY "campaigns_tenant_isolation" ON campaigns
      USING ("organizationId" = current_setting('app.current_org_id')::text);

    CREATE POLICY "campaigns_insert" ON campaigns
      FOR INSERT WITH CHECK ("organizationId" = current_setting('app.current_org_id')::text);

    -- RLS Policies for email_campaigns
    CREATE POLICY "email_campaigns_tenant_isolation" ON email_campaigns
      USING ("organizationId" = current_setting('app.current_org_id')::text);

    -- RLS Policies for social_media_posts
    CREATE POLICY "social_posts_tenant_isolation" ON social_media_posts
      USING ("organizationId" = current_setting('app.current_org_id')::text);

    -- Performance indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_org_status_published
      ON content_items("organizationId", status, "publishedAt" DESC);

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_search
      ON content_items USING gin(to_tsvector('english', title || ' ' || content));

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_org_folder
      ON media_assets("organizationId", "folderId", "uploadedAt" DESC);

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_org_dates
      ON campaigns("organizationId", status, "startDate", "endDate");
  `
}
```

### 4. Verify Migration

**Check tables created:**
```typescript
// Tool: mcp__supabase__list_tables
{
  "schemas": ["public"]
}
// Expected: All ContentPilot tables listed
```

**Verify RLS policies:**
```typescript
// Tool: mcp__supabase__execute_sql
{
  "query": `
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE tablename LIKE 'content_%' OR tablename LIKE '%campaign%' OR tablename = 'media_assets'
    ORDER BY tablename, policyname;
  `
}
// Expected: Multiple RLS policies per table
```

## Success Criteria

- [x] All 11 ContentPilot tables created in database
- [x] User and Organization relations updated
- [x] RLS policies enabled on all tables
- [x] Performance indexes created
- [x] Migration applied successfully
- [x] Multi-tenancy verified with test queries
- [x] No orphaned tables or columns
- [x] Prisma client generated successfully

## Testing

**Test multi-tenancy isolation:**
```typescript
// Tool: mcp__supabase__execute_sql
{
  "query": `
    -- Set org context
    SET app.current_org_id = 'test-org-1';

    -- Insert test content
    INSERT INTO content_items (id, title, slug, content, type, status, "organizationId", "authorId")
    VALUES ('test-1', 'Test Article', 'test-article', 'Test content', 'ARTICLE', 'DRAFT', 'test-org-1', 'test-user-1');

    -- Verify isolation
    SELECT * FROM content_items WHERE id = 'test-1';

    -- Switch org context
    SET app.current_org_id = 'test-org-2';

    -- Should return empty
    SELECT * FROM content_items WHERE id = 'test-1';
  `
}
```

## Files Modified

- ✅ `shared/prisma/schema.prisma` (ContentPilot models added)
- ✅ Migration files created via Supabase MCP

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 2: Content Module - Backend & Validation**
2. ✅ Database foundation complete
3. ✅ Ready to build content management logic
4. ✅ Multi-tenancy and RLS verified

---

**Session 1 Complete:** ✅ ContentPilot database schema implemented with RLS
