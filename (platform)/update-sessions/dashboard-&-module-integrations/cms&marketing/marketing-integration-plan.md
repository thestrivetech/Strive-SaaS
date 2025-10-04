# Marketing CMS & Dashboard Integration Plan

## Overview
This document outlines the step-by-step integration of the Real Estate Marketing CMS & Dashboard into the existing Strive SaaS platform, following platform-specific standards and multi-tenant architecture.

## Prerequisites
- Next.js 15+ App Router setup with Turbopack
- Tailwind CSS + shadcn/ui components
- Supabase + Prisma ORM setup
- Multi-tenant RLS architecture in place
- RBAC system configured

## Integration Steps

### Phase 1: File Structure Setup

#### 1.1 Create Marketing Route Structure
```bash
# From platform root
mkdir -p app/(platform)/marketing/{dashboard,campaigns,pages,analytics,media,settings}
mkdir -p app/(platform)/marketing/campaigns/{email,social}
mkdir -p app/(platform)/marketing/pages/[slug]
mkdir -p app/(platform)/marketing/media/[id]
```

#### 1.2 Move Marketing Components
```bash
# Copy components from update-sessions/real-estate-marketing/components/
cp -r update-sessions/real-estate-marketing/components/marketing components/features/
```

#### 1.3 Create API Routes
```bash
mkdir -p app/api/v1/marketing/{campaigns,pages,media,analytics,templates}
```

### Phase 2: Database Schema Integration

#### 2.1 Add Marketing Models to Prisma Schema
Add to existing `prisma/schema.prisma`:

```prisma
model MarketingCampaign {
  id             String   @id @default(cuid())
  name           String
  type           CampaignType
  status         CampaignStatus @default(DRAFT)
  subject        String?  // For email campaigns
  content        Json     // Rich content structure
  scheduledAt    DateTime?
  sentAt         DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  analytics      CampaignAnalytics[]
  audiences      CampaignAudience[]
  
  @@map("marketing_campaigns")
}

model LandingPage {
  id             String   @id @default(cuid())
  title          String
  slug           String
  content        Json     // Page builder content blocks
  seoTitle       String?
  seoDescription String?
  status         PageStatus @default(DRAFT)
  publishedAt    DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  analytics      PageAnalytics[]
  
  // Unique slug per organization
  @@unique([slug, organizationId])
  @@map("landing_pages")
}

model MediaAsset {
  id             String   @id @default(cuid())
  filename       String
  originalName   String
  mimeType       String
  fileSize       Int
  storageKey     String
  altText        String?
  tags           String[] // Array of tags for categorization
  folder         String?  // Folder organization
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  uploadedBy     String
  uploader       User     @relation(fields: [uploadedBy], references: [id])
  
  @@map("media_assets")
}

model EmailTemplate {
  id             String   @id @default(cuid())
  name           String
  subject        String
  content        Json     // Rich content with merge fields
  category       String?  // listing, follow-up, newsletter
  isPublic       Boolean  @default(false) // Available to all users
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation (nullable for public templates)
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  campaigns      MarketingCampaign[]
  
  @@map("email_templates")
}

model CampaignAnalytics {
  id             String   @id @default(cuid())
  campaignId     String
  campaign       MarketingCampaign @relation(fields: [campaignId], references: [id])
  
  // Email metrics
  sent           Int      @default(0)
  delivered      Int      @default(0)
  opened         Int      @default(0)
  clicked        Int      @default(0)
  bounced        Int      @default(0)
  unsubscribed   Int      @default(0)
  
  // Social metrics
  impressions    Int      @default(0)
  engagements    Int      @default(0)
  shares         Int      @default(0)
  comments       Int      @default(0)
  
  // Calculated at
  calculatedAt   DateTime @default(now())
  
  @@map("campaign_analytics")
}

model PageAnalytics {
  id             String   @id @default(cuid())
  pageId         String
  page           LandingPage @relation(fields: [pageId], references: [id])
  
  // Page metrics
  visits         Int      @default(0)
  uniqueVisits   Int      @default(0)
  bounceRate     Float    @default(0)
  avgTimeOnPage  Int      @default(0) // seconds
  conversions    Int      @default(0)
  
  // Traffic sources
  directTraffic  Int      @default(0)
  socialTraffic  Int      @default(0)
  searchTraffic  Int      @default(0)
  referralTraffic Int     @default(0)
  
  // Date for daily tracking
  date           DateTime @db.Date
  
  @@unique([pageId, date])
  @@map("page_analytics")
}

model CampaignAudience {
  id             String   @id @default(cuid())
  campaignId     String
  campaign       MarketingCampaign @relation(fields: [campaignId], references: [id])
  
  // Audience definition (JSON filters)
  name           String
  filters        Json     // { leadStatus: ['hot', 'warm'], tags: ['buyer'] }
  contactCount   Int      @default(0)
  
  @@map("campaign_audiences")
}

enum CampaignType {
  EMAIL
  SOCIAL_MEDIA
  SMS
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  CANCELLED
}

enum PageStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
  ARCHIVED
}
```

#### 2.2 Update User and Organization Relations
Add to existing models:
```prisma
model User {
  // ... existing fields
  
  // Marketing relations
  campaigns          MarketingCampaign[]
  landingPages       LandingPage[]
  mediaAssets        MediaAsset[]
  emailTemplates     EmailTemplate[]
}

model Organization {
  // ... existing fields
  
  // Marketing relations
  campaigns          MarketingCampaign[]
  landingPages       LandingPage[]
  mediaAssets        MediaAsset[]
  emailTemplates     EmailTemplate[]
}
```

#### 2.3 Run Database Migrations
```bash
npx prisma migrate dev --name add-marketing-system
npx prisma generate
```

### Phase 3: Module Architecture Integration

#### 3.1 Create Marketing Module Structure
Following platform module conventions:
```bash
mkdir -p lib/modules/marketing/{campaigns,pages,media,analytics,templates}
```

#### 3.2 Create Campaign Module
Create `lib/modules/marketing/campaigns/index.ts`:
```typescript
// Campaign schemas
export const EmailCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  content: z.any(), // Rich content JSON
  scheduledAt: z.string().datetime().optional(),
  audienceFilters: z.any().optional(),
  organizationId: z.string().uuid(),
});

// Campaign actions
export async function createEmailCampaign(input: EmailCampaignInput) {
  const session = await requireAuth();
  
  // Check RBAC - Marketing access required
  if (!canAccessMarketing(session.user)) {
    throw new Error('Unauthorized: Marketing access required');
  }
  
  // Check subscription tier
  if (!canAccessFeature(session.user, 'marketing')) {
    throw new Error('Upgrade required: Marketing feature not available in your plan');
  }

  const validated = EmailCampaignSchema.parse(input);

  return await prisma.marketingCampaign.create({
    data: {
      ...validated,
      type: 'EMAIL',
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    },
    include: {
      analytics: true,
      audiences: true,
    }
  });
}

// Campaign queries
export async function getCampaigns(filters?: CampaignFilters) {
  const session = await requireAuth();

  return await prisma.marketingCampaign.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(filters?.type && { type: filters.type }),
      ...(filters?.status && { status: filters.status }),
    },
    include: {
      analytics: true,
      creator: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}
```

#### 3.3 Create Pages Module
Create `lib/modules/marketing/pages/index.ts`:
```typescript
export const LandingPageSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  content: z.any(), // Page builder JSON
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  organizationId: z.string().uuid(),
});

export async function createLandingPage(input: LandingPageInput) {
  const session = await requireAuth();
  
  if (!canAccessMarketing(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = LandingPageSchema.parse(input);

  // Check for slug uniqueness within org
  const existing = await prisma.landingPage.findFirst({
    where: {
      slug: validated.slug,
      organizationId: session.user.organizationId,
    }
  });

  if (existing) {
    throw new Error('Slug already exists');
  }

  return await prisma.landingPage.create({
    data: {
      ...validated,
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    }
  });
}
```

#### 3.4 Create Media Module
Create `lib/modules/marketing/media/index.ts`:
```typescript
import { storageService } from '@/lib/storage';

export async function uploadMediaAsset(file: File, metadata: MediaMetadata) {
  const session = await requireAuth();
  
  if (!canAccessMarketing(session.user)) {
    throw new Error('Unauthorized');
  }

  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    throw new Error('File too large');
  }

  // Generate storage key
  const extension = file.name.split('.').pop();
  const storageKey = `marketing/${session.user.organizationId}/media/${uuidv4()}.${extension}`;

  // Upload to Supabase Storage
  const buffer = Buffer.from(await file.arrayBuffer());
  await storageService.upload(storageKey, buffer, file.type);

  // Save to database
  return await prisma.mediaAsset.create({
    data: {
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      storageKey,
      altText: metadata.altText,
      tags: metadata.tags || [],
      folder: metadata.folder,
      organizationId: session.user.organizationId,
      uploadedBy: session.user.id,
    }
  });
}
```

### Phase 4: RBAC & Feature Access Integration

#### 4.1 Add Marketing Permissions
Update `lib/auth/rbac.ts`:
```typescript
export function canAccessMarketing(user: User): boolean {
  // Must be Employee with Member+ org role
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
  
  return isEmployee && hasOrgAccess;
}

export function canManageMarketingSettings(user: User): boolean {
  // Owner or Admin only
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}

export function canPublishPages(user: User): boolean {
  // Member+ can publish
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
  return canAccessMarketing(user) && hasOrgAccess;
}
```

#### 4.2 Add Subscription Tier Checks
Update tier features:
```typescript
// lib/auth/rbac.ts
const TIER_FEATURES = {
  FREE: ['dashboard', 'profile'],
  STARTER: ['dashboard', 'profile', 'crm', 'projects', 'marketing-basic'], // Limited marketing
  GROWTH: ['dashboard', 'profile', 'crm', 'projects', 'marketing-full', 'ai'], // Full marketing
  ELITE: ['*'], // All features
};

export function getMarketingLimits(tier: SubscriptionTier) {
  const limits = {
    FREE: { campaigns: 0, pages: 0, storage: 0 },
    STARTER: { campaigns: 10, pages: 5, storage: 1024 * 1024 * 100 }, // 100MB
    GROWTH: { campaigns: 100, pages: 25, storage: 1024 * 1024 * 1024 }, // 1GB
    ELITE: { campaigns: -1, pages: -1, storage: -1 }, // Unlimited
  };

  return limits[tier];
}
```

### Phase 5: API Route Implementation

#### 5.1 Create Campaign API
Create `app/api/v1/marketing/campaigns/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createEmailCampaign, getCampaigns } from '@/lib/modules/marketing/campaigns'
import { canAccessMarketing, canAccessFeature } from '@/lib/auth/rbac'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessMarketing(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const filters = {
      type: searchParams.get('type'),
      status: searchParams.get('status'),
    }

    const campaigns = await getCampaigns(filters)
    return NextResponse.json({ campaigns })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessMarketing(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check subscription tier
  if (!canAccessFeature(session.user, 'marketing-full')) {
    return NextResponse.json({ 
      error: 'Upgrade required',
      upgradeUrl: '/settings/billing'
    }, { status: 402 })
  }

  try {
    const data = await req.json()
    const campaign = await createEmailCampaign({
      ...data,
      organizationId: session.user.organizationId
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}
```

#### 5.2 Create Media Upload API
Create `app/api/v1/marketing/media/upload/route.ts`:
```typescript
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessMarketing(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const altText = formData.get('altText') as string
    const tags = formData.get('tags')?.toString().split(',') || []
    const folder = formData.get('folder') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check storage limits
    const limits = getMarketingLimits(session.user.subscriptionTier)
    const currentUsage = await getStorageUsage(session.user.organizationId)
    
    if (limits.storage !== -1 && (currentUsage + file.size) > limits.storage) {
      return NextResponse.json({
        error: 'Storage limit exceeded',
        upgradeUrl: '/settings/billing'
      }, { status: 402 })
    }

    const asset = await uploadMediaAsset(file, {
      altText,
      tags,
      folder
    })

    return NextResponse.json({ asset }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
```

### Phase 6: Component Integration

#### 6.1 Create Marketing Layout
Create `app/(platform)/marketing/layout.tsx`:
```typescript
import { MarketingSidebar } from '@/components/features/marketing/sidebar'
import { MarketingHeader } from '@/components/features/marketing/header'
import { FeatureGuard } from '@/components/shared/feature-guard'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FeatureGuard feature="marketing-basic">
      <div className="flex h-screen bg-gray-50">
        <MarketingSidebar />
        <div className="flex-1 flex flex-col">
          <MarketingHeader />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </FeatureGuard>
  )
}
```

#### 6.2 Create Dashboard Page
Create `app/(platform)/marketing/dashboard/page.tsx`:
```typescript
import { Suspense } from 'react'
import { MarketingStats } from '@/components/features/marketing/dashboard/stats'
import { RecentCampaigns } from '@/components/features/marketing/dashboard/recent-campaigns'
import { QuickActions } from '@/components/features/marketing/dashboard/quick-actions'
import { Skeleton } from '@/components/ui/skeleton'

export default function MarketingDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Marketing Hub</h1>
        <QuickActions />
      </div>
      
      <Suspense fallback={<Skeleton className="h-32" />}>
        <MarketingStats />
      </Suspense>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<Skeleton className="h-64" />}>
          <RecentCampaigns />
        </Suspense>
      </div>
    </div>
  )
}
```

#### 6.3 Integrate with Platform Navigation
Update `components/shared/layouts/sidebar.tsx`:
```typescript
const navigationItems = [
  // ... existing items
  {
    name: 'Marketing',
    href: '/marketing/dashboard',
    icon: Megaphone,
    children: [
      { name: 'Dashboard', href: '/marketing/dashboard' },
      { name: 'Campaigns', href: '/marketing/campaigns' },
      { name: 'Email', href: '/marketing/campaigns/email' },
      { name: 'Social Media', href: '/marketing/campaigns/social' },
      { name: 'Pages & CMS', href: '/marketing/pages' },
      { name: 'Media Library', href: '/marketing/media' },
      { name: 'Analytics', href: '/marketing/analytics' },
    ]
  }
]
```

### Phase 7: Data Hooks Integration

#### 7.1 Create Marketing Hooks
Create `lib/hooks/use-marketing.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useCampaigns(filters?: CampaignFilters) {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.type) params.set('type', filters.type)
      if (filters?.status) params.set('status', filters.status)

      const response = await fetch(`/api/v1/marketing/campaigns?${params}`)
      if (!response.ok) {
        if (response.status === 402) {
          const data = await response.json()
          throw new Error(`Upgrade required: ${data.error}`)
        }
        throw new Error('Failed to fetch campaigns')
      }
      return response.json()
    }
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/v1/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
    onError: (error) => {
      if (error.message.includes('Upgrade required')) {
        // Redirect to billing
        window.location.href = '/settings/billing'
      }
    }
  })
}

export function useUploadMedia() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ file, metadata }: UploadMediaParams) => {
      const formData = new FormData()
      formData.append('file', file)
      if (metadata.altText) formData.append('altText', metadata.altText)
      if (metadata.tags?.length) formData.append('tags', metadata.tags.join(','))
      if (metadata.folder) formData.append('folder', metadata.folder)

      const response = await fetch('/api/v1/marketing/media/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-assets'] })
    }
  })
}
```

### Phase 8: Email & Social Integration Stubs

#### 8.1 Create Email Service Abstraction
Create `lib/services/email/index.ts`:
```typescript
interface EmailProvider {
  sendCampaign(campaign: EmailCampaign, audience: Contact[]): Promise<SendResult>
  getDeliveryStats(campaignId: string): Promise<DeliveryStats>
}

class MockEmailProvider implements EmailProvider {
  async sendCampaign(campaign: EmailCampaign, audience: Contact[]) {
    // Mock implementation for development
    console.log(`Mock: Sending email "${campaign.subject}" to ${audience.length} contacts`)
    
    return {
      campaignId: campaign.id,
      sent: audience.length,
      messageId: `mock-${Date.now()}`
    }
  }

  async getDeliveryStats(campaignId: string) {
    // Mock stats
    return {
      sent: 100,
      delivered: 95,
      opened: 35,
      clicked: 12,
      bounced: 2,
      unsubscribed: 1
    }
  }
}

// Production providers can be added later
export const emailService: EmailProvider = new MockEmailProvider()
```

#### 8.2 Create Social Media Service Abstraction
Create `lib/services/social/index.ts`:
```typescript
interface SocialProvider {
  schedulePost(post: SocialPost): Promise<ScheduleResult>
  getEngagementStats(postId: string): Promise<EngagementStats>
}

class MockSocialProvider implements SocialProvider {
  async schedulePost(post: SocialPost) {
    console.log(`Mock: Scheduling social post for ${post.scheduledAt}`)
    
    return {
      postId: `mock-${Date.now()}`,
      scheduledAt: post.scheduledAt,
      platforms: post.platforms
    }
  }

  async getEngagementStats(postId: string) {
    return {
      impressions: 1250,
      engagements: 89,
      likes: 45,
      shares: 12,
      comments: 8,
      clicks: 24
    }
  }
}

export const socialService: SocialProvider = new MockSocialProvider()
```

### Phase 9: Analytics Integration

#### 9.1 Create Analytics Aggregation Service
Create `lib/modules/marketing/analytics/index.ts`:
```typescript
export async function getMarketingOverviewStats(orgId: string, dateRange: DateRange) {
  const [campaigns, pages, totalSpend, totalLeads] = await Promise.all([
    // Campaign stats
    prisma.marketingCampaign.count({
      where: {
        organizationId: orgId,
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        }
      }
    }),
    
    // Page stats
    prisma.landingPage.count({
      where: {
        organizationId: orgId,
        status: 'PUBLISHED',
      }
    }),
    
    // Mock spend data (integrate with actual ad platforms later)
    Promise.resolve(5240),
    
    // Lead attribution (integrate with CRM data)
    prisma.customer.count({
      where: {
        organizationId: orgId,
        source: { in: ['Email Campaign', 'Social Media', 'Landing Page'] },
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        }
      }
    })
  ])

  return {
    totalCampaigns: campaigns,
    totalPages: pages,
    totalSpend,
    totalLeads,
    costPerLead: totalLeads > 0 ? totalSpend / totalLeads : 0,
  }
}

export async function getCampaignPerformanceData(orgId: string) {
  const analytics = await prisma.campaignAnalytics.findMany({
    where: {
      campaign: {
        organizationId: orgId
      }
    },
    include: {
      campaign: {
        select: { name: true, type: true }
      }
    },
    orderBy: { calculatedAt: 'desc' }
  })

  return analytics.map(stat => ({
    campaignName: stat.campaign.name,
    type: stat.campaign.type,
    sent: stat.sent,
    opened: stat.opened,
    clicked: stat.clicked,
    openRate: stat.sent > 0 ? (stat.opened / stat.sent) * 100 : 0,
    clickRate: stat.opened > 0 ? (stat.clicked / stat.opened) * 100 : 0,
    impressions: stat.impressions,
    engagements: stat.engagements,
    engagementRate: stat.impressions > 0 ? (stat.engagements / stat.impressions) * 100 : 0,
  }))
}
```

### Phase 10: Testing Implementation

#### 10.1 Create Marketing Tests
Create test structure:
```bash
mkdir -p __tests__/modules/marketing/{campaigns,pages,media}
```

#### 10.2 Campaign Module Tests
Create `__tests__/modules/marketing/campaigns.test.ts`:
```typescript
import { createEmailCampaign, getCampaigns } from '@/lib/modules/marketing/campaigns'
import { canAccessMarketing } from '@/lib/auth/rbac'

jest.mock('@/lib/auth/rbac')
jest.mock('@/lib/database/prisma')

describe('Marketing Campaigns Module', () => {
  beforeEach(() => {
    (canAccessMarketing as jest.Mock).mockReturnValue(true)
  })

  it('should create email campaign for current org only', async () => {
    const campaignData = {
      name: 'New Listing Campaign',
      subject: 'Check out this new listing!',
      content: { blocks: [] },
      organizationId: 'org-123'
    }

    const campaign = await createEmailCampaign(campaignData)

    expect(campaign.organizationId).toBe('org-123')
    expect(campaign.type).toBe('EMAIL')
  })

  it('should reject unauthorized users', async () => {
    (canAccessMarketing as jest.Mock).mockReturnValue(false)

    await expect(createEmailCampaign({})).rejects.toThrow('Unauthorized')
  })

  it('should filter campaigns by organization', async () => {
    const campaigns = await getCampaigns()
    
    // Verify all campaigns belong to current org
    campaigns.forEach(campaign => {
      expect(campaign.organizationId).toBe('current-org-id')
    })
  })
})
```

### Phase 11: Deployment Configuration

#### 11.1 Environment Variables
Add to Vercel/deployment environment:
```bash
# Email Service (for production)
SENDGRID_API_KEY=your-sendgrid-key
MAILCHIMP_API_KEY=your-mailchimp-key

# Social Media APIs (for production)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-secret
LINKEDIN_CLIENT_ID=your-linkedin-id
LINKEDIN_CLIENT_SECRET=your-linkedin-secret

# Media Storage (Supabase already configured)
SUPABASE_URL=already-configured
SUPABASE_ANON_KEY=already-configured

# Analytics
GOOGLE_ANALYTICS_ID=your-ga-id (optional)
```

#### 11.2 Update Middleware
Update `middleware.ts` to protect marketing routes:
```typescript
// Add to existing middleware
if (request.nextUrl.pathname.startsWith('/marketing')) {
  const hasAccess = canAccessMarketing(session.user)
  const hasFeature = canAccessFeature(session.user, 'marketing-basic')
  
  if (!hasAccess || !hasFeature) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
```

### Phase 12: Go-Live Checklist

- [ ] Database migrations applied successfully
- [ ] RLS policies enabled on all marketing tables
- [ ] RBAC permissions working for marketing access
- [ ] Subscription tier limits enforced
- [ ] File upload/storage working with Supabase
- [ ] Email service abstraction ready for production integration
- [ ] Social media service abstraction ready
- [ ] Analytics data aggregation working
- [ ] All API endpoints protected and functional
- [ ] UI components responsive and accessible
- [ ] Navigation integrated with platform sidebar
- [ ] Error boundaries and loading states in place
- [ ] Tests passing with required coverage
- [ ] Performance optimized (lazy loading, code splitting)

## Rollback Plan

If issues arise during deployment:
1. Disable marketing routes in middleware
2. Remove marketing navigation items temporarily
3. Revert database migrations: `npx prisma migrate reset`
4. Deploy previous stable version
5. Debug issues in staging environment

## Post-Integration Support

### Monitoring & Analytics
1. Track marketing feature usage and engagement
2. Monitor storage usage and costs
3. Review campaign performance metrics
4. Gather user feedback for UX improvements

### Future Enhancements
1. **Email Provider Integration**: SendGrid, Mailchimp, ConvertKit
2. **Social Media Automation**: Facebook, Instagram, LinkedIn, Twitter APIs
3. **Landing Page Builder**: Advanced drag-and-drop editor
4. **A/B Testing**: Campaign and page variant testing
5. **Advanced Analytics**: Attribution modeling, ROI tracking
6. **Marketing Automation**: Drip campaigns, lead scoring
7. **Integration APIs**: Zapier, webhook endpoints for third-party tools

### Performance Optimization
1. Image optimization and CDN for media assets
2. Page builder component lazy loading
3. Analytics data caching and pre-aggregation
4. Email sending queue and rate limiting
5. Social media scheduling queue

This integration follows the platform's multi-tenant architecture, RBAC system, and module patterns while providing a comprehensive marketing solution that can grow with the business needs.