# ContentPilot Models Reference - Ready for Schema Addition

**Purpose:** Complete Prisma model definitions for ContentPilot CMS & Marketing module
**Usage:** Copy these models into `shared/prisma/schema.prisma` after line 182 (after `legacy_content` model)
**Status:** READY TO ADD (waiting for schema coordination)

---

## 📍 Insertion Point in Schema

```prisma
/// This model contains row level security and requires additional setup for migrations.
model legacy_content {
  // ... existing model ...
  @@map("content")
}

// ============================================================================
// INSERT CONTENTPILOT MODELS HERE (BELOW THIS LINE)
// ============================================================================

/// This model contains row level security and requires additional setup for migrations.
model conversations {
  // ... existing model (DO NOT MODIFY) ...
}
```

---

## 📋 ContentPilot Models (Copy Below)

```prisma
// ============================================================================
// ContentPilot CMS & Marketing Module Tables
// ============================================================================

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model content_items {
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
  meta_title      String?
  meta_description String?
  keywords       String[]
  canonical_url   String?

  // Media & Assets
  featured_image  String?
  gallery        String[]
  video_url       String?
  audio_url       String?

  // Publishing
  published_at    DateTime?
  scheduled_for   DateTime?
  expires_at      DateTime?

  // Engagement Metrics
  view_count      Int      @default(0)
  share_count     Int      @default(0)
  like_count      Int      @default(0)
  comment_count   Int      @default(0)

  // Analytics
  analytics_data  Json?

  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  // Multi-tenant isolation
  organization_id String
  organization   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  author_id       String
  author         users     @relation("ContentAuthor", fields: [author_id], references: [id])
  category_id     String?
  category       content_categories? @relation(fields: [category_id], references: [id])
  tags           content_tags[]
  campaigns      campaign_content[]
  revisions      content_revisions[]
  comments       content_comments[]

  @@unique([slug, organization_id])
  @@index([organization_id, status])
  @@index([organization_id, type])
  @@index([organization_id, published_at])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model content_categories {
  id             String   @id @default(cuid())
  name           String
  slug           String
  description    String?
  color          String?

  // Category Settings
  is_active       Boolean  @default(true)
  sort_order      Int      @default(0)

  // SEO
  meta_title      String?
  meta_description String?

  // Parent-Child Relationships
  parent_id       String?
  parent         content_categories? @relation("CategoryHierarchy", fields: [parent_id], references: [id])
  children       content_categories[] @relation("CategoryHierarchy")

  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  // Multi-tenant isolation
  organization_id String
  organization   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  created_by      String
  creator        users     @relation(fields: [created_by], references: [id])
  content        content_items[]

  @@unique([slug, organization_id])
  @@index([organization_id, is_active])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model content_tags {
  id             String   @id @default(cuid())
  name           String
  slug           String
  color          String?

  // Usage tracking
  usage_count     Int      @default(0)

  created_at      DateTime @default(now())

  // Multi-tenant isolation
  organization_id String
  organization   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  content        content_items[]

  @@unique([slug, organization_id])
  @@index([organization_id])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model media_assets {
  id             String   @id @default(cuid())
  name           String
  original_name   String
  file_name       String
  file_url        String

  // File Details
  mime_type       String
  file_size       Int
  width          Int?
  height         Int?
  duration       Float?

  // Metadata
  alt            String?
  caption        String?

  // Organization & Folder
  folder_id       String?
  folder         media_folders? @relation(fields: [folder_id], references: [id])

  // Usage tracking
  usage_count     Int      @default(0)
  last_used       DateTime?

  uploaded_at     DateTime @default(now())

  // Multi-tenant isolation
  organization_id String
  organization   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  uploaded_by     String
  uploader       users     @relation(fields: [uploaded_by], references: [id])

  @@index([organization_id, folder_id])
  @@index([organization_id, mime_type])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model media_folders {
  id             String   @id @default(cuid())
  name           String
  path           String

  // Folder Hierarchy
  parent_id       String?
  parent         media_folders? @relation("FolderHierarchy", fields: [parent_id], references: [id])
  children       media_folders[] @relation("FolderHierarchy")

  created_at      DateTime @default(now())

  // Multi-tenant isolation
  organization_id String
  organization   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  created_by      String
  creator        users     @relation(fields: [created_by], references: [id])
  assets         media_assets[]

  @@unique([path, organization_id])
  @@index([organization_id])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model campaigns {
  id             String   @id @default(cuid())
  name           String
  description    String?

  // Campaign Configuration
  type           CampaignType
  status         CampaignStatus @default(DRAFT)

  // Scheduling
  start_date      DateTime?
  end_date        DateTime?
  timezone       String   @default("UTC")

  // Budget & Goals
  budget         Decimal?  @db.Decimal(10, 2)
  goal_type       String?
  goal_value      Float?

  // Performance Metrics
  impressions    Int      @default(0)
  clicks         Int      @default(0)
  conversions    Int      @default(0)
  spend          Decimal  @default(0) @db.Decimal(10, 2)
  revenue        Decimal  @default(0) @db.Decimal(10, 2)

  // Analytics
  analytics_data  Json?

  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  // Multi-tenant isolation
  organization_id String
  organization   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  created_by      String
  creator        users     @relation(fields: [created_by], references: [id])
  content        campaign_content[]
  emails         email_campaigns[]
  social_posts    social_media_posts[]

  @@index([organization_id, status])
  @@index([organization_id, type])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model campaign_content {
  id         String      @id @default(cuid())
  campaign_id String
  campaign   campaigns    @relation(fields: [campaign_id], references: [id], onDelete: Cascade)
  content_id  String
  content    content_items @relation(fields: [content_id], references: [id], onDelete: Cascade)

  // Content Role in Campaign
  role       String
  priority   Int         @default(0)

  added_at    DateTime    @default(now())

  @@unique([campaign_id, content_id])
  @@index([campaign_id])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model email_campaigns {
  id             String   @id @default(cuid())
  campaign_id     String?
  campaign       campaigns? @relation(fields: [campaign_id], references: [id])

  // Email Details
  subject        String
  preheader      String?
  content        String   @db.Text
  plain_text      String?  @db.Text

  // Sending Configuration
  from_name       String
  from_email      String
  reply_to        String?

  // Segmentation & Targeting
  audience_segment Json?

  // Scheduling
  scheduled_for   DateTime?
  sent_at         DateTime?

  // Performance Metrics
  sent           Int      @default(0)
  delivered      Int      @default(0)
  opened         Int      @default(0)
  clicked        Int      @default(0)
  bounced        Int      @default(0)
  unsubscribed   Int      @default(0)

  // Status
  status         EmailStatus @default(DRAFT)

  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  // Multi-tenant isolation
  organization_id String
  organization   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  created_by      String
  creator        users     @relation(fields: [created_by], references: [id])

  @@index([organization_id, status])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model social_media_posts {
  id             String   @id @default(cuid())
  campaign_id     String?
  campaign       campaigns? @relation(fields: [campaign_id], references: [id])

  // Post Content
  content        String   @db.Text
  media_urls      String[]

  // Platform Configuration
  platforms      SocialPlatform[]

  // Scheduling
  scheduled_for   DateTime?
  published_at    DateTime?

  // Performance per Platform
  platform_metrics Json?

  // Status
  status         PostStatus @default(DRAFT)

  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  // Multi-tenant isolation
  organization_id String
  organization   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  created_by      String
  creator        users     @relation(fields: [created_by], references: [id])

  @@index([organization_id, status])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model content_revisions {
  id         String      @id @default(cuid())
  content_id  String
  content    content_items @relation(fields: [content_id], references: [id], onDelete: Cascade)

  // Revision Data
  title      String
  content_body String     @db.Text
  excerpt    String?

  // Revision Metadata
  version    Int
  comment    String?

  created_at  DateTime    @default(now())

  // Relations
  created_by  String
  creator    users        @relation(fields: [created_by], references: [id])

  @@index([content_id])
}

/// This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
model content_comments {
  id         String      @id @default(cuid())
  content_id  String
  content    content_items @relation(fields: [content_id], references: [id], onDelete: Cascade)

  // Comment Details
  comment    String      @db.Text
  status     CommentStatus @default(PENDING)

  // Hierarchy
  parent_id   String?
  parent     content_comments? @relation("CommentReplies", fields: [parent_id], references: [id])
  replies    content_comments[] @relation("CommentReplies")

  created_at  DateTime    @default(now())
  updated_at  DateTime    @updatedAt

  // Multi-tenant isolation
  organization_id String
  organization   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  author_id   String
  author     users        @relation(fields: [author_id], references: [id])

  @@index([content_id, status])
  @@index([organization_id])
}

// ============================================================================
// End of ContentPilot CMS & Marketing Module Tables
// ============================================================================
```

---

## ✅ Relations to Uncomment

### User Model Relations (Lines 747-756)

**Current (Commented):**
```prisma
  // ContentPilot CMS & Marketing relations (TODO: Enable when CMS tables are migrated)
  // authored_content               content_items[]        @relation("ContentAuthor")
  // content_categories             content_categories[]
  // media_assets                   media_assets[]
  // media_folders                  media_folders[]
  // campaigns                      campaigns[]
  // email_campaigns                email_campaigns[]
  // social_posts                   social_media_posts[]
  // content_revisions              content_revisions[]
  // content_comments               content_comments[]
```

**Change to (Uncommented):**
```prisma
  // ContentPilot CMS & Marketing relations
  authored_content               content_items[]        @relation("ContentAuthor")
  content_categories             content_categories[]
  media_assets                   media_assets[]
  media_folders                  media_folders[]
  campaigns                      campaigns[]
  email_campaigns                email_campaigns[]
  social_posts                   social_media_posts[]
  content_revisions              content_revisions[]
  content_comments               content_comments[]
```

### Organization Model Relations (Lines 554-563)

**Current (Commented):**
```prisma
  // ContentPilot CMS & Marketing relations (TODO: Enable when CMS tables are migrated)
  // content                   content_items[]
  // content_categories        content_categories[]
  // content_tags              content_tags[]
  // media_assets              media_assets[]
  // media_folders             media_folders[]
  // campaigns                 campaigns[]
  // email_campaigns           email_campaigns[]
  // social_posts              social_media_posts[]
  // content_comments          content_comments[]
```

**Change to (Uncommented):**
```prisma
  // ContentPilot CMS & Marketing relations
  content                   content_items[]
  content_categories        content_categories[]
  content_tags              content_tags[]
  media_assets              media_assets[]
  media_folders             media_folders[]
  campaigns                 campaigns[]
  email_campaigns           email_campaigns[]
  social_posts              social_media_posts[]
  content_comments          content_comments[]
```

---

## 🔧 Migration Steps (Execute After Adding Models)

### Step 1: Format and Validate Schema

```bash
cd "(platform)"
npx prisma format --schema=../shared/prisma/schema.prisma
npx prisma validate --schema=../shared/prisma/schema.prisma
```

**Expected Output:**
```
✔ Formatted schema.prisma
✔ Schema is valid
```

### Step 2: Generate Prisma Client

```bash
npx prisma generate --schema=../shared/prisma/schema.prisma
```

**Expected Output:**
```
✔ Generated Prisma Client (x.x.x) in node_modules/@prisma/client
```

### Step 3: Create Migration

```bash
npx prisma migrate dev --name add_contentpilot_cms_tables --schema=../shared/prisma/schema.prisma
```

**Expected Output:**
```
✔ Prisma Migrate created the following migration without applying it:
  migrations/
    └─ 20251005XXXXXX_add_contentpilot_cms_tables/
        └─ migration.sql

✔ Migration applied successfully
```

### Step 4: Verify TypeScript

```bash
npx tsc --noEmit
```

**Expected Output:**
```
(No output = success, 0 errors)
```

---

## 🔐 RLS Policies SQL Script

**Execute after migration completes:**

```sql
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
  USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "content_items_insert" ON content_items
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "content_items_update" ON content_items
  FOR UPDATE USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "content_items_delete" ON content_items
  FOR DELETE USING ("organization_id" = current_setting('app.current_org_id')::text);

-- RLS Policies for content_categories
CREATE POLICY "content_categories_tenant_isolation" ON content_categories
  USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "content_categories_insert" ON content_categories
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "content_categories_update" ON content_categories
  FOR UPDATE USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "content_categories_delete" ON content_categories
  FOR DELETE USING ("organization_id" = current_setting('app.current_org_id')::text);

-- RLS Policies for content_tags
CREATE POLICY "content_tags_tenant_isolation" ON content_tags
  USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "content_tags_insert" ON content_tags
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "content_tags_update" ON content_tags
  FOR UPDATE USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "content_tags_delete" ON content_tags
  FOR DELETE USING ("organization_id" = current_setting('app.current_org_id')::text);

-- RLS Policies for media_assets
CREATE POLICY "media_assets_tenant_isolation" ON media_assets
  USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "media_assets_insert" ON media_assets
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "media_assets_update" ON media_assets
  FOR UPDATE USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "media_assets_delete" ON media_assets
  FOR DELETE USING ("organization_id" = current_setting('app.current_org_id')::text);

-- RLS Policies for media_folders
CREATE POLICY "media_folders_tenant_isolation" ON media_folders
  USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "media_folders_insert" ON media_folders
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "media_folders_update" ON media_folders
  FOR UPDATE USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "media_folders_delete" ON media_folders
  FOR DELETE USING ("organization_id" = current_setting('app.current_org_id')::text);

-- RLS Policies for campaigns
CREATE POLICY "campaigns_tenant_isolation" ON campaigns
  USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "campaigns_insert" ON campaigns
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "campaigns_update" ON campaigns
  FOR UPDATE USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "campaigns_delete" ON campaigns
  FOR DELETE USING ("organization_id" = current_setting('app.current_org_id')::text);

-- RLS Policies for email_campaigns
CREATE POLICY "email_campaigns_tenant_isolation" ON email_campaigns
  USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "email_campaigns_insert" ON email_campaigns
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "email_campaigns_update" ON email_campaigns
  FOR UPDATE USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "email_campaigns_delete" ON email_campaigns
  FOR DELETE USING ("organization_id" = current_setting('app.current_org_id')::text);

-- RLS Policies for social_media_posts
CREATE POLICY "social_posts_tenant_isolation" ON social_media_posts
  USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "social_posts_insert" ON social_media_posts
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "social_posts_update" ON social_media_posts
  FOR UPDATE USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "social_posts_delete" ON social_media_posts
  FOR DELETE USING ("organization_id" = current_setting('app.current_org_id')::text);

-- RLS Policies for content_revisions
CREATE POLICY "content_revisions_select" ON content_revisions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM content_items
      WHERE content_items.id = content_revisions.content_id
      AND content_items.organization_id = current_setting('app.current_org_id')::text
    )
  );

CREATE POLICY "content_revisions_insert" ON content_revisions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM content_items
      WHERE content_items.id = content_revisions.content_id
      AND content_items.organization_id = current_setting('app.current_org_id')::text
    )
  );

-- RLS Policies for content_comments
CREATE POLICY "content_comments_tenant_isolation" ON content_comments
  USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "content_comments_insert" ON content_comments
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "content_comments_update" ON content_comments
  FOR UPDATE USING ("organization_id" = current_setting('app.current_org_id')::text);

CREATE POLICY "content_comments_delete" ON content_comments
  FOR DELETE USING ("organization_id" = current_setting('app.current_org_id')::text);
```

---

## ⚡ Performance Indexes SQL Script

**Execute after RLS policies applied:**

```sql
-- Content search optimization (composite index)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_org_status_published
  ON content_items("organization_id", status, "published_at" DESC);

-- Full-text search on content
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_search
  ON content_items USING gin(to_tsvector('english', title || ' ' || content));

-- Content type filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_org_type
  ON content_items("organization_id", type);

-- Media queries optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_org_folder
  ON media_assets("organization_id", "folder_id", "uploaded_at" DESC);

-- Media type filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_mime_type
  ON media_assets(mime_type);

-- Campaign performance queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_org_dates
  ON campaigns("organization_id", status, "start_date", "end_date");

-- Email campaign scheduling
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_scheduled
  ON email_campaigns("organization_id", status, "scheduled_for");

-- Social media post scheduling
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_social_scheduled
  ON social_media_posts("organization_id", status, "scheduled_for");

-- Content revisions lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_revisions_content_version
  ON content_revisions("content_id", version DESC);

-- Comment moderation queue
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_moderation
  ON content_comments("organization_id", status, "created_at" DESC);
```

---

## ✅ Verification Checklist

After completing all steps:

- [ ] **Schema Valid** - `npx prisma validate` returns ✓
- [ ] **Client Generated** - `npx prisma generate` successful
- [ ] **Migration Applied** - Migration exists in `shared/prisma/migrations/`
- [ ] **TypeScript Clean** - `npx tsc --noEmit` returns 0 errors
- [ ] **RLS Enabled** - All 11 tables have RLS active
- [ ] **Policies Created** - Query `pg_policies` shows policies for all tables
- [ ] **Indexes Created** - Query `pg_indexes` shows performance indexes
- [ ] **Relations Work** - User and Organization models have ContentPilot relations

---

## 📊 Expected Database State After Migration

### Tables Created: 11

1. content_items
2. content_categories
3. content_tags
4. media_assets
5. media_folders
6. campaigns
7. campaign_content
8. email_campaigns
9. social_media_posts
10. content_revisions
11. content_comments

### RLS Policies: 34 Total

- content_items: 4 policies (SELECT, INSERT, UPDATE, DELETE)
- content_categories: 4 policies
- content_tags: 4 policies
- media_assets: 4 policies
- media_folders: 4 policies
- campaigns: 4 policies
- email_campaigns: 4 policies
- social_media_posts: 4 policies
- content_revisions: 2 policies (SELECT, INSERT)
- content_comments: 4 policies

### Performance Indexes: 10

- Content search and filtering: 3 indexes
- Media queries: 2 indexes
- Campaign queries: 1 index
- Email scheduling: 1 index
- Social scheduling: 1 index
- Revisions: 1 index
- Comments: 1 index

---

## 📁 File Locations

**Schema File:**
`C:\Users\zochr\Desktop\GitHub\Strive-SaaS\shared\prisma\schema.prisma`

**Migration Directory:**
`C:\Users\zochr\Desktop\GitHub\Strive-SaaS\shared\prisma\migrations\`

**This Reference:**
`C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\cms&marketing-module\CONTENTPILOT-MODELS-REFERENCE.md`

---

**Document Version:** 1.0
**Status:** READY TO USE
**Last Updated:** 2025-10-05
