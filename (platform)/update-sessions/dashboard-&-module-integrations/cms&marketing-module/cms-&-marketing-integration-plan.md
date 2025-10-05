# CMS & Marketing (ContentPilot) Integration Guide

## Overview
This guide provides step-by-step instructions to integrate the ContentPilot CMS & Marketing platform into the Strive SaaS Platform, providing comprehensive content management and marketing automation capabilities while adapting to the platform's multi-tenant architecture.

## Prerequisites
- Existing Strive SaaS Platform setup (Next.js 15, Prisma, Supabase)
- ContentPilot code imported into repository
- Understanding of multi-tenant RLS and RBAC patterns

## UI Design Analysis (Inferred from CMS Platform Standards)
**Design Theme:**
- **Modern Content-Focused**: Clean, editorial-style design with content-first approach
- **Color Palette**: 
  - Primary: Blue (#3B82F6) for primary actions
  - Success: Green (#10B981) for published content
  - Warning: Orange (#F59E0B) for draft/review status
  - Background: Clean white with subtle gray accents
- **Layout**: Dashboard with content editor, media library, and campaign management
- **Typography**: Editorial-focused with clear content hierarchy

**Key Visual Elements:**
- Rich text editor with WYSIWYG capabilities
- Media library with drag-and-drop uploads
- Content calendar and scheduling interface
- Campaign performance analytics
- SEO optimization tools
- Social media integration panels
- Email campaign builders

## Integration Steps

### Phase 1: Database Schema Integration

#### 1.1 Add ContentPilot Tables to Prisma Schema
Add to existing `prisma/schema.prisma`:

```prisma
// ContentPilot CMS & Marketing Module Tables
model ContentItem {
  id             String   @id @default(cuid())
  title          String
  slug           String
  excerpt        String?
  content        String   // Main content body
  
  // Content Metadata
  type           ContentType
  status         ContentStatus @default(DRAFT)
  language       String   @default("en")
  
  // SEO & Marketing
  metaTitle      String?
  metaDescription String?
  keywords       String[] // SEO keywords
  canonicalUrl   String?
  
  // Media & Assets
  featuredImage  String?  // Featured image URL
  gallery        String[] // Additional image URLs
  videoUrl       String?  // Video content URL
  audioUrl       String?  // Podcast/audio URL
  
  // Publishing
  publishedAt    DateTime?
  scheduledFor   DateTime? // Scheduled publish time
  expiresAt      DateTime? // Content expiry
  
  // Engagement Metrics
  viewCount      Int      @default(0)
  shareCount     Int      @default(0)
  likeCount      Int      @default(0)
  commentCount   Int      @default(0)
  
  // Analytics
  analyticsData  Json?    // Detailed analytics
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
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
  @@map("content_items")
}

model ContentCategory {
  id             String   @id @default(cuid())
  name           String
  slug           String
  description    String?
  color          String?  // Hex color for UI
  
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
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  content        ContentItem[]
  
  @@unique([slug, organizationId])
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
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  content        ContentItem[]
  
  @@unique([slug, organizationId])
  @@map("content_tags")
}

model MediaAsset {
  id             String   @id @default(cuid())
  name           String
  originalName   String
  fileName       String   // Stored filename
  fileUrl        String   // Supabase Storage URL
  
  // File Details
  mimeType       String
  fileSize       Int      // Size in bytes
  width          Int?     // Image/video width
  height         Int?     // Image/video height
  duration       Float?   // Video/audio duration in seconds
  
  // Metadata
  alt            String?  // Alt text for images
  caption        String?  // Caption/description
  
  // Organization & Folder
  folderId       String?
  folder         MediaFolder? @relation(fields: [folderId], references: [id])
  
  // Usage tracking
  usageCount     Int      @default(0)
  lastUsed       DateTime?
  
  uploadedAt     DateTime @default(now())
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  uploadedBy     String
  uploader       User     @relation(fields: [uploadedBy], references: [id])
  
  @@map("media_assets")
}

model MediaFolder {
  id             String   @id @default(cuid())
  name           String
  path           String   // Full folder path
  
  // Folder Hierarchy
  parentId       String?
  parent         MediaFolder? @relation("FolderHierarchy", fields: [parentId], references: [id])
  children       MediaFolder[] @relation("FolderHierarchy")
  
  createdAt      DateTime @default(now())
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  assets         MediaAsset[]
  
  @@unique([path, organizationId])
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
  budget         Decimal?
  goalType       String?  // clicks, impressions, conversions
  goalValue      Float?
  
  // Performance Metrics
  impressions    Int      @default(0)
  clicks         Int      @default(0)
  conversions    Int      @default(0)
  spend          Decimal  @default(0)
  revenue        Decimal  @default(0)
  
  // Analytics
  analyticsData  Json?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  content        CampaignContent[]
  emails         EmailCampaign[]
  socialPosts    SocialMediaPost[]
  
  @@map("campaigns")
}

model CampaignContent {
  id         String      @id @default(cuid())
  campaignId String
  campaign   Campaign    @relation(fields: [campaignId], references: [id])
  contentId  String
  content    ContentItem @relation(fields: [contentId], references: [id])
  
  // Content Role in Campaign
  role       String      // featured, supporting, landing-page
  priority   Int         @default(0)
  
  addedAt    DateTime    @default(now())
  
  @@unique([campaignId, contentId])
  @@map("campaign_content")
}

model EmailCampaign {
  id             String   @id @default(cuid())
  campaignId     String?
  campaign       Campaign? @relation(fields: [campaignId], references: [id])
  
  // Email Details
  subject        String
  preheader      String?
  content        String   // Email HTML content
  plainText      String?  // Plain text version
  
  // Sending Configuration
  fromName       String
  fromEmail      String
  replyTo        String?
  
  // Segmentation & Targeting
  audienceSegment Json?   // Audience criteria
  
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
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  
  @@map("email_campaigns")
}

model SocialMediaPost {
  id             String   @id @default(cuid())
  campaignId     String?
  campaign       Campaign? @relation(fields: [campaignId], references: [id])
  
  // Post Content
  content        String
  mediaUrls      String[] // Attached media
  
  // Platform Configuration
  platforms      SocialPlatform[]
  
  // Scheduling
  scheduledFor   DateTime?
  publishedAt    DateTime?
  
  // Performance per Platform
  platformMetrics Json?   // Platform-specific metrics
  
  // Status
  status         PostStatus @default(DRAFT)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  
  @@map("social_media_posts")
}

model ContentRevision {
  id         String      @id @default(cuid())
  contentId  String
  content    ContentItem @relation(fields: [contentId], references: [id])
  
  // Revision Data
  title      String
  content    String
  excerpt    String?
  
  // Revision Metadata
  version    Int         // Version number
  comment    String?     // Revision comment/changelog
  
  createdAt  DateTime    @default(now())
  
  // Relations
  createdBy  String
  creator    User        @relation(fields: [createdBy], references: [id])
  
  @@map("content_revisions")
}

model ContentComment {
  id         String      @id @default(cuid())
  contentId  String
  content    ContentItem @relation(fields: [contentId], references: [id])
  
  // Comment Details
  comment    String
  status     CommentStatus @default(PENDING)
  
  // Hierarchy
  parentId   String?
  parent     ContentComment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies    ContentComment[] @relation("CommentReplies")
  
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  authorId   String
  author     User        @relation(fields: [authorId], references: [id])
  
  @@map("content_comments")
}

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

#### 1.2 Update User and Organization Relations
Add to existing models:
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

#### 1.3 Run Database Migration
```bash
npx prisma migrate dev --name add-contentpilot-cms
npx prisma generate
```

### Phase 2: File Structure Setup

#### 2.1 Create ContentPilot Route Structure
```bash
# From platform root
mkdir -p app/\(platform\)/content/{dashboard,editor,library,campaigns,analytics,settings}
```

#### 2.2 Copy and Adapt Components
Create `components/features/content/` directory:

```bash
mkdir -p components/features/content/{
  editor,
  library,
  campaigns,
  social,
  email,
  analytics,
  shared
}
```

#### 2.3 Create API Route Structure
```bash
mkdir -p app/api/v1/content/{content,media,campaigns,email,social}
```

### Phase 3: Module Architecture Integration

#### 3.1 Create ContentPilot Module
Following platform module patterns:

```typescript
// lib/modules/content/content/index.ts
export const ContentItemSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  type: z.nativeEnum(ContentType),
  status: z.nativeEnum(ContentStatus).default('DRAFT'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()),
  categoryId: z.string().uuid().optional(),
  organizationId: z.string().uuid(),
});

export async function createContentItem(input: ContentItemInput) {
  const session = await requireAuth();
  
  if (!canAccessContent(session.user)) {
    throw new Error('Unauthorized: Content access required');
  }
  
  if (!canAccessFeature(session.user, 'content')) {
    throw new Error('Upgrade required: Content management features not available');
  }

  const validated = ContentItemSchema.parse(input);

  // Generate unique slug
  let slug = validated.slug;
  let counter = 1;
  
  while (await isSlugTaken(slug, session.user.organizationId)) {
    slug = `${validated.slug}-${counter}`;
    counter++;
  }

  return await prisma.contentItem.create({
    data: {
      ...validated,
      slug,
      organizationId: session.user.organizationId,
      authorId: session.user.id,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true }
      },
      category: true,
      tags: true
    }
  });
}

export async function getContentItems(filters?: ContentFilters) {
  const session = await requireAuth();

  return await prisma.contentItem.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.authorId && { authorId: filters.authorId }),
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { content: { contains: filters.search, mode: 'insensitive' } },
          { excerpt: { contains: filters.search, mode: 'insensitive' } }
        ]
      }),
    },
    include: {
      author: {
        select: { id: true, name: true, email: true }
      },
      category: true,
      tags: true
    },
    orderBy: [
      { updatedAt: 'desc' }
    ]
  });
}

export async function publishContent(contentId: string, scheduledFor?: Date) {
  const session = await requireAuth();
  
  if (!canPublishContent(session.user)) {
    throw new Error('Unauthorized: Content publishing permission required');
  }

  const content = await prisma.contentItem.findFirst({
    where: {
      id: contentId,
      organizationId: session.user.organizationId
    }
  });

  if (!content) {
    throw new Error('Content not found');
  }

  const updateData: any = {
    status: scheduledFor ? 'SCHEDULED' : 'PUBLISHED',
    updatedAt: new Date()
  };

  if (scheduledFor) {
    updateData.scheduledFor = scheduledFor;
  } else {
    updateData.publishedAt = new Date();
  }

  return await prisma.contentItem.update({
    where: { id: contentId },
    data: updateData
  });
}

async function isSlugTaken(slug: string, organizationId: string): Promise<boolean> {
  const existing = await prisma.contentItem.findUnique({
    where: {
      slug_organizationId: {
        slug,
        organizationId
      }
    }
  });

  return !!existing;
}
```

#### 3.2 Create Media Management Module
```typescript
// lib/modules/content/media/index.ts
export const MediaAssetSchema = z.object({
  name: z.string().min(1).max(255),
  originalName: z.string().min(1),
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  mimeType: z.string().min(1),
  fileSize: z.number().positive(),
  width: z.number().optional(),
  height: z.number().optional(),
  folderId: z.string().uuid().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  organizationId: z.string().uuid(),
});

export async function uploadMediaAsset(input: MediaAssetInput) {
  const session = await requireAuth();
  
  if (!canAccessContent(session.user)) {
    throw new Error('Unauthorized: Content access required');
  }

  const validated = MediaAssetSchema.parse(input);

  return await prisma.mediaAsset.create({
    data: {
      ...validated,
      organizationId: session.user.organizationId,
      uploadedBy: session.user.id,
    },
    include: {
      uploader: {
        select: { id: true, name: true, email: true }
      },
      folder: true
    }
  });
}

export async function getMediaAssets(folderId?: string) {
  const session = await requireAuth();

  return await prisma.mediaAsset.findMany({
    where: {
      organizationId: session.user.organizationId,
      folderId: folderId || null
    },
    include: {
      uploader: {
        select: { id: true, name: true, email: true }
      },
      folder: true
    },
    orderBy: { uploadedAt: 'desc' }
  });
}

export async function createMediaFolder(name: string, parentId?: string) {
  const session = await requireAuth();
  
  if (!canAccessContent(session.user)) {
    throw new Error('Unauthorized: Content access required');
  }

  // Build path
  let path = name;
  if (parentId) {
    const parent = await prisma.mediaFolder.findFirst({
      where: { id: parentId, organizationId: session.user.organizationId }
    });
    if (parent) {
      path = `${parent.path}/${name}`;
    }
  }

  return await prisma.mediaFolder.create({
    data: {
      name,
      path,
      parentId,
      organizationId: session.user.organizationId,
      createdBy: session.user.id
    }
  });
}
```

### Phase 4: RBAC & Feature Access Integration

#### 4.1 Add Content Permissions
Update `lib/auth/rbac.ts`:
```typescript
export function canAccessContent(user: User): boolean {
  // Must be Employee with Member+ org role
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
  
  return isEmployee && hasOrgAccess;
}

export function canCreateContent(user: User): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
}

export function canPublishContent(user: User): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}

export function canManageCampaigns(user: User): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}

export function canAccessAnalytics(user: User): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}
```

#### 4.2 Update Subscription Tier Features
```typescript
// lib/auth/rbac.ts
const TIER_FEATURES = {
  FREE: ['dashboard', 'profile'],
  STARTER: ['dashboard', 'profile', 'crm', 'projects'],
  GROWTH: ['dashboard', 'profile', 'crm', 'projects', 'content-basic'], // Basic CMS
  ELITE: ['dashboard', 'profile', 'crm', 'projects', 'content-full'], // Full CMS + Marketing
};

export function getContentLimits(tier: SubscriptionTier) {
  const limits = {
    FREE: { content: 0, media: 0, campaigns: 0, emails: 0 },
    STARTER: { content: 0, media: 0, campaigns: 0, emails: 0 },
    GROWTH: { content: 100, media: 500, campaigns: 5, emails: 10 }, // Per month
    ELITE: { content: -1, media: -1, campaigns: -1, emails: -1 }, // Unlimited
  };

  return limits[tier];
}
```

### Phase 5: UI Component Recreation

#### 5.1 Create Content Dashboard
Create `app/(platform)/content/dashboard/page.tsx`:
```tsx
import { Suspense } from 'react'
import { ContentHeader } from '@/components/features/content/dashboard/header'
import { ContentOverview } from '@/components/features/content/dashboard/overview'
import { RecentContent } from '@/components/features/content/dashboard/recent-content'
import { ContentCalendar } from '@/components/features/content/dashboard/calendar'
import { CampaignSummary } from '@/components/features/content/dashboard/campaign-summary'
import { QuickActions } from '@/components/features/content/dashboard/quick-actions'
import { Skeleton } from '@/components/ui/skeleton'

export default function ContentDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ContentHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Overview Cards */}
          <Suspense fallback={<Skeleton className="h-32" />}>
            <ContentOverview />
          </Suspense>
          
          {/* Quick Actions */}
          <Suspense fallback={<Skeleton className="h-24" />}>
            <QuickActions />
          </Suspense>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Recent Content */}
            <div className="lg:col-span-2 space-y-8">
              <Suspense fallback={<Skeleton className="h-96" />}>
                <RecentContent />
              </Suspense>
            </div>
            
            {/* Right Column - Calendar & Campaigns */}
            <div className="lg:col-span-1 space-y-8">
              <Suspense fallback={<Skeleton className="h-64" />}>
                <ContentCalendar />
              </Suspense>
              
              <Suspense fallback={<Skeleton className="h-64" />}>
                <CampaignSummary />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 5.2 Create Rich Content Editor
Create `components/features/content/editor/RichEditor.tsx`:
```tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Save, Eye, Send, Calendar, Image, Link2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import dynamic from 'next/dynamic'

// Dynamically import rich text editor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import('./RichTextEditor'),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 rounded animate-pulse" />
  }
)

interface ContentForm {
  title: string
  slug: string
  excerpt: string
  content: string
  type: string
  status: string
  categoryId?: string
  metaTitle?: string
  metaDescription?: string
  keywords: string[]
  featuredImage?: string
  scheduledFor?: Date
}

export function RichEditor({ contentId }: { contentId?: string }) {
  const [form, setForm] = useState<ContentForm>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    type: 'ARTICLE',
    status: 'DRAFT',
    keywords: [],
    metaTitle: '',
    metaDescription: ''
  })

  const [newKeyword, setNewKeyword] = useState('')
  const queryClient = useQueryClient()

  const saveContentMutation = useMutation({
    mutationFn: async (data: ContentForm) => {
      const url = contentId 
        ? `/api/v1/content/content/${contentId}`
        : '/api/v1/content/content'
      
      const response = await fetch(url, {
        method: contentId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) throw new Error('Failed to save content')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items'] })
    }
  })

  const publishContentMutation = useMutation({
    mutationFn: async () => {
      if (!contentId) throw new Error('Content must be saved first')
      
      const response = await fetch(`/api/v1/content/content/${contentId}/publish`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to publish content')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items'] })
    }
  })

  const updateField = (field: keyof ContentForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
      // Auto-generate slug from title
      ...(field === 'title' && {
        slug: value.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      })
    }))
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !form.keywords.includes(newKeyword.trim())) {
      setForm(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }))
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setForm(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {contentId ? 'Edit Content' : 'Create Content'}
        </h1>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => {}}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button
            onClick={() => saveContentMutation.mutate(form)}
            disabled={saveContentMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          
          <Button
            onClick={() => publishContentMutation.mutate()}
            disabled={publishContentMutation.isPending || !contentId}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* Title & Slug */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Enter content title..."
                />
              </div>
              
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="url-slug"
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={form.content}
                onChange={(content) => updateField('content', content)}
              />
            </CardContent>
          </Card>

          {/* Excerpt */}
          <Card>
            <CardHeader>
              <CardTitle>Excerpt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.excerpt}
                onChange={(e) => updateField('excerpt', e.target.value)}
                placeholder="Brief description or excerpt..."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(value) => updateField('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="REVIEW">Review</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Content Type</Label>
                <Select value={form.type} onValueChange={(value) => updateField('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARTICLE">Article</SelectItem>
                    <SelectItem value="BLOG_POST">Blog Post</SelectItem>
                    <SelectItem value="PAGE">Page</SelectItem>
                    <SelectItem value="LANDING_PAGE">Landing Page</SelectItem>
                    <SelectItem value="CASE_STUDY">Case Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.status === 'SCHEDULED' && (
                <div>
                  <Label htmlFor="scheduledFor">Publish Date</Label>
                  <Input
                    type="datetime-local"
                    value={form.scheduledFor?.toISOString().slice(0, 16)}
                    onChange={(e) => updateField('scheduledFor', new Date(e.target.value))}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Image className="w-4 h-4 mr-2" />
                Select Image
              </Button>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={form.metaTitle}
                  onChange={(e) => updateField('metaTitle', e.target.value)}
                  placeholder="SEO title..."
                />
              </div>
              
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={form.metaDescription}
                  onChange={(e) => updateField('metaDescription', e.target.value)}
                  placeholder="SEO description..."
                  rows={2}
                />
              </div>

              {/* Keywords */}
              <div>
                <Label>Keywords</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword..."
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button size="sm" onClick={addKeyword}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {form.keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeKeyword(keyword)}
                    >
                      {keyword} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

### Phase 6: API Route Implementation

#### 6.1 Create Content API
Create `app/api/v1/content/content/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createContentItem, getContentItems } from '@/lib/modules/content/content'
import { canAccessContent, canAccessFeature } from '@/lib/auth/rbac'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessContent(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const filters = {
      status: searchParams.get('status'),
      type: searchParams.get('type'),
      categoryId: searchParams.get('categoryId'),
      search: searchParams.get('search'),
    }

    const content = await getContentItems(filters)
    return NextResponse.json({ content })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessContent(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!canAccessFeature(session.user, 'content')) {
    return NextResponse.json({ 
      error: 'Upgrade required',
      upgradeUrl: '/settings/billing'
    }, { status: 402 })
  }

  try {
    const data = await req.json()
    const content = await createContentItem({
      ...data,
      organizationId: session.user.organizationId
    })

    return NextResponse.json({ content }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 })
  }
}
```

#### 6.2 Create Media Upload API
Create `app/api/v1/content/media/upload/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { uploadMediaAsset } from '@/lib/modules/content/media'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessContent(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, file)

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName)

    // Save to database
    const mediaAsset = await uploadMediaAsset({
      name: file.name,
      originalName: file.name,
      fileName: fileName,
      fileUrl: publicUrl,
      mimeType: file.type,
      fileSize: file.size,
      organizationId: session.user.organizationId
    })

    return NextResponse.json({ asset: mediaAsset }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 })
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
    name: 'ContentPilot CMS',
    href: '/content/dashboard',
    icon: FileText,
    children: [
      { name: 'Dashboard', href: '/content/dashboard' },
      { name: 'Content Editor', href: '/content/editor' },
      { name: 'Media Library', href: '/content/library' },
      { name: 'Campaigns', href: '/content/campaigns' },
      { name: 'Analytics', href: '/content/analytics' },
      { name: 'Settings', href: '/content/settings' },
    ]
  }
]
```

### Phase 8: Testing & Quality Assurance

#### 8.1 Create Content Tests
Create `__tests__/modules/content/content.test.ts`:
```typescript
import { createContentItem, publishContent } from '@/lib/modules/content/content'
import { canAccessContent } from '@/lib/auth/rbac'

describe('ContentPilot Module', () => {
  it('should create content for current org only', async () => {
    const content = await createContentItem({
      title: 'Test Article',
      slug: 'test-article',
      content: 'Content body',
      type: 'ARTICLE',
      keywords: ['test'],
      organizationId: 'org-123'
    })

    expect(content.organizationId).toBe('org-123')
  })

  it('should generate unique slugs', async () => {
    // Test duplicate slug handling
    const content1 = await createContentItem({
      title: 'Test',
      slug: 'test',
      content: 'Content 1',
      type: 'ARTICLE',
      keywords: [],
      organizationId: 'org-123'
    })

    const content2 = await createContentItem({
      title: 'Test',
      slug: 'test',
      content: 'Content 2',
      type: 'ARTICLE',
      keywords: [],
      organizationId: 'org-123'
    })

    expect(content2.slug).toBe('test-1')
  })
})
```

### Phase 9: Go-Live Checklist

- [ ] Database migrations applied successfully
- [ ] RLS policies enabled on all content tables
- [ ] RBAC permissions working for content access
- [ ] Subscription tier limits enforced
- [ ] Rich text editor functional with formatting options
- [ ] Media library with upload/organize capabilities
- [ ] Content scheduling and publishing workflow operational
- [ ] SEO optimization tools working
- [ ] Campaign management interface functional
- [ ] Email campaign builder operational
- [ ] Social media integration working
- [ ] Content analytics dashboard displaying metrics
- [ ] Comment system working (if enabled)
- [ ] Content revision history tracking
- [ ] All API endpoints protected and functional
- [ ] Navigation integrated with platform sidebar
- [ ] Mobile responsiveness maintained
- [ ] Error boundaries and loading states in place
- [ ] Tests passing with required coverage

## UI Design Preservation Notes

**Critical Design Elements:**
- **Editorial Focus**: Clean, content-first design emphasizing readability
- **Rich Text Editor**: WYSIWYG editor with formatting toolbar
- **Media Management**: Grid-based media library with folder organization
- **Content Calendar**: Calendar view for scheduled content
- **Campaign Dashboard**: Analytics and performance tracking
- **SEO Tools**: Integrated meta tags and keyword management

**Component Styling Patterns:**
```css
/* Content editor styling */
.content-editor {
  @apply bg-white rounded-lg border border-gray-200;
}

/* Media library grid */
.media-grid {
  @apply grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4;
}

/* Campaign card styling */
.campaign-card {
  @apply bg-white shadow-sm hover:shadow-md transition-shadow;
}

/* Status badge styling */
.status-draft {
  @apply bg-gray-100 text-gray-800;
}

.status-published {
  @apply bg-green-100 text-green-800;
}
```

This integration creates a comprehensive CMS and marketing automation platform that seamlessly integrates with the Strive platform's multi-tenant architecture while preserving content-focused design principles and editorial workflows.