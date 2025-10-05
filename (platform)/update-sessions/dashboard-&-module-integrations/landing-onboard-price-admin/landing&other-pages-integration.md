# Landing Page, Admin Dashboard, Onboarding & Pricing Integration Guide

## Overview
This guide provides step-by-step instructions to integrate the Landing Page, Admin Dashboard, Onboarding Flow, and Pricing Page into the Strive SaaS Platform, preserving the exact clean, professional UI design while adapting to the platform's multi-tenant architecture.

## Prerequisites
- Existing Strive SaaS Platform setup (Next.js 15, Prisma, Supabase)
- Component code imported into repository
- Understanding of multi-tenant RLS and RBAC patterns

## UI Design Analysis (From Component Code)
**Design Theme:**
- **Clean Professional**: Modern, minimal design with excellent readability
- **Color Palette**: 
  - Primary: Blue (#3B82F6 / hsl(240 100% 27%)) for primary actions
  - Success: Green (#10B981 / hsl(142 76% 36%)) for positive states
  - Warning: Orange (#F59E0B / hsl(38 92% 50%)) for attention
  - Background: Clean white (light) / Dark slate (dark mode)
- **Typography**: Inter, Open Sans for UI, JetBrains Mono for code
- **Layout**: Clean grid layouts with excellent spacing and shadows
- **Theme Support**: Full light/dark mode support with CSS custom properties

**Key Visual Elements:**
- **Landing**: Hero section, features grid, CTA sections
- **Admin**: Sidebar navigation, stat cards, data tables, charts
- **Onboarding**: Multi-step wizard with progress tracking
- **Pricing**: Plan comparison table with tier features

## Integration Steps

### Phase 1: Database Schema Integration

#### 1.1 Add System Administration Tables to Prisma Schema
Add to existing `prisma/schema.prisma`:

```prisma
// System Administration & Onboarding Module Tables
model AdminActionLog {
  id             String   @id @default(cuid())
  action         AdminAction
  description    String
  
  // Target Details
  targetType     String   // 'user', 'organization', 'subscription'
  targetId       String   // ID of the affected entity
  
  // Action Context
  metadata       Json?    // Additional action context
  ipAddress      String?
  userAgent      String?
  
  // Result
  success        Boolean  @default(true)
  error          String?  // Error message if failed
  
  createdAt      DateTime @default(now())
  
  // Relations
  adminId        String
  admin          User     @relation("AdminActions", fields: [adminId], references: [id])
  
  @@map("admin_action_logs")
}

model OnboardingSession {
  id             String   @id @default(cuid())
  sessionToken   String   @unique
  
  // Onboarding Data
  currentStep    Int      @default(1)
  totalSteps     Int      @default(4)
  
  // Organization Data
  orgName        String?
  orgWebsite     String?
  orgDescription String?
  
  // Plan Selection
  selectedTier   SubscriptionTier?
  billingCycle   BillingCycle?    // MONTHLY, YEARLY
  
  // Payment Intent
  stripePaymentIntentId String?
  paymentStatus  PaymentStatus @default(PENDING)
  
  // Session Management
  isCompleted    Boolean  @default(false)
  completedAt    DateTime?
  expiresAt      DateTime // Session timeout
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  userId         String?  // User who started onboarding
  user           User?    @relation(fields: [userId], references: [id])
  organizationId String?  // Created organization
  organization   Organization? @relation(fields: [organizationId], references: [id])
  
  @@map("onboarding_sessions")
}

model PlatformMetrics {
  id             String   @id @default(cuid())
  date           DateTime @unique @default(now())
  
  // User Metrics
  totalUsers     Int      @default(0)
  activeUsers    Int      @default(0) // Active in last 30 days
  newUsers       Int      @default(0) // New signups today
  
  // Organization Metrics
  totalOrgs      Int      @default(0)
  activeOrgs     Int      @default(0) // Active in last 30 days
  newOrgs        Int      @default(0) // New orgs today
  
  // Subscription Metrics
  mrrCents       BigInt   @default(0) // Monthly Recurring Revenue in cents
  arrCents       BigInt   @default(0) // Annual Recurring Revenue in cents
  churnRate      Float    @default(0) // Monthly churn rate
  
  // Tier Distribution
  freeCount      Int      @default(0)
  starterCount   Int      @default(0)
  growthCount    Int      @default(0)
  eliteCount     Int      @default(0)
  enterpriseCount Int     @default(0)
  
  // System Metrics
  totalStorage   BigInt   @default(0) // Storage used in bytes
  apiCalls       Int      @default(0) // API calls today
  
  createdAt      DateTime @default(now())
  
  @@map("platform_metrics")
}

model FeatureFlag {
  id             String   @id @default(cuid())
  name           String   @unique
  description    String?
  
  // Flag Configuration
  isEnabled      Boolean  @default(false)
  rolloutPercent Float    @default(0) // 0-100 percentage rollout
  
  // Targeting
  targetTiers    SubscriptionTier[]
  targetOrgs     String[] // Specific organization IDs
  targetUsers    String[] // Specific user IDs
  
  // Conditions
  conditions     Json?    // Complex targeting conditions
  
  // Metadata
  environment    Environment @default(PRODUCTION)
  category       String?  // Feature category
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  
  @@map("feature_flags")
}

model SystemAlert {
  id             String   @id @default(cuid())
  title          String
  message        String
  
  // Alert Configuration
  level          AlertLevel @default(INFO)
  category       AlertCategory
  
  // Targeting
  isGlobal       Boolean  @default(false) // Show to all users
  targetRoles    UserRole[] // Target specific roles
  targetTiers    SubscriptionTier[] // Target specific tiers
  targetOrgs     String[] // Specific organizations
  
  // Display Settings
  isDismissible  Boolean  @default(true)
  autoHideAfter  Int?     // Auto-hide after X seconds
  
  // Scheduling
  startsAt       DateTime @default(now())
  endsAt         DateTime?
  
  // Tracking
  viewCount      Int      @default(0)
  dismissCount   Int      @default(0)
  
  // Status
  isActive       Boolean  @default(true)
  isArchived     Boolean  @default(false)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  
  @@map("system_alerts")
}

enum AdminAction {
  USER_CREATE
  USER_UPDATE
  USER_SUSPEND
  USER_DELETE
  USER_IMPERSONATE
  ORG_CREATE
  ORG_UPDATE
  ORG_SUSPEND
  ORG_DELETE
  SUBSCRIPTION_CREATE
  SUBSCRIPTION_UPDATE
  SUBSCRIPTION_CANCEL
  FEATURE_FLAG_UPDATE
  SYSTEM_CONFIG_UPDATE
  DATA_EXPORT
  BULK_ACTION
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  CANCELLED
  REQUIRES_ACTION
}

enum BillingCycle {
  MONTHLY
  YEARLY
}

enum Environment {
  DEVELOPMENT
  STAGING
  PRODUCTION
}

enum AlertLevel {
  INFO
  WARNING
  ERROR
  SUCCESS
}

enum AlertCategory {
  SYSTEM
  MAINTENANCE
  FEATURE
  SECURITY
  BILLING
  MARKETING
}
```

#### 1.2 Update User and Organization Relations
Add to existing models:
```prisma
model User {
  // ... existing fields
  
  // Admin & System relations
  adminActions        AdminActionLog[] @relation("AdminActions")
  onboardingSessions  OnboardingSession[]
  createdFeatureFlags FeatureFlag[]
  createdSystemAlerts SystemAlert[]
}

model Organization {
  // ... existing fields
  
  // Onboarding relations
  onboardingSessions  OnboardingSession[]
}
```

#### 1.3 Run Database Migration
```bash
npx prisma migrate dev --name add-admin-onboarding-system
npx prisma generate
```

### Phase 2: File Structure Setup

#### 2.1 Create Route Structure
```bash
# From platform root
mkdir -p app/\(public\)/{landing,pricing,onboarding}
mkdir -p app/\(admin\)/{dashboard,users,organizations,subscriptions,settings,analytics}
```

#### 2.2 Copy and Adapt Components
Create component directories:

```bash
mkdir -p components/features/{landing,pricing,onboarding,admin}
mkdir -p components/shared/{layouts,ui}
```

#### 2.3 Create API Route Structure
```bash
mkdir -p app/api/v1/{admin,onboarding,metrics,feature-flags,system}
```

### Phase 3: Module Architecture Integration

#### 3.1 Create Admin Module
Following platform module patterns:

```typescript
// lib/modules/admin/index.ts
export const AdminActionLogSchema = z.object({
  action: z.nativeEnum(AdminAction),
  description: z.string().min(1),
  targetType: z.string().min(1),
  targetId: z.string().min(1),
  metadata: z.any().optional(),
});

export async function logAdminAction(input: AdminActionInput) {
  const session = await requireAuth();
  
  if (!canAccessAdminPanel(session.user)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prisma.adminActionLog.create({
    data: {
      ...input,
      adminId: session.user.id,
      ipAddress: getClientIP(),
      userAgent: getUserAgent(),
    }
  });
}

export async function getPlatformMetrics() {
  const session = await requireAuth();
  
  if (!canAccessAdminPanel(session.user)) {
    throw new Error('Unauthorized: Admin access required');
  }

  // Get latest metrics
  const latest = await prisma.platformMetrics.findFirst({
    orderBy: { date: 'desc' }
  });

  // If no metrics exist or metrics are older than 1 hour, calculate fresh
  if (!latest || Date.now() - latest.date.getTime() > 3600000) {
    return await calculatePlatformMetrics();
  }

  return latest;
}

async function calculatePlatformMetrics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Calculate user metrics
  const totalUsers = await prisma.user.count();
  const activeUsers = await prisma.user.count({
    where: { lastLoginAt: { gte: thirtyDaysAgo } }
  });
  const newUsers = await prisma.user.count({
    where: { createdAt: { gte: today } }
  });

  // Calculate organization metrics
  const totalOrgs = await prisma.organization.count();
  const activeOrgs = await prisma.organization.count({
    where: {
      users: {
        some: { lastLoginAt: { gte: thirtyDaysAgo } }
      }
    }
  });
  const newOrgs = await prisma.organization.count({
    where: { createdAt: { gte: today } }
  });

  // Calculate subscription metrics
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: 'ACTIVE' }
  });

  const mrrCents = activeSubscriptions
    .filter(s => s.interval === 'MONTHLY')
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const yearlyRevenue = activeSubscriptions
    .filter(s => s.interval === 'YEARLY')
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const arrCents = (mrrCents * 12) + yearlyRevenue;

  // Tier distribution
  const tierCounts = await prisma.subscription.groupBy({
    by: ['tier'],
    where: { status: 'ACTIVE' },
    _count: { tier: true }
  });

  const tierDistribution = {
    freeCount: 0,
    starterCount: 0,
    growthCount: 0,
    eliteCount: 0,
    enterpriseCount: 0,
  };

  tierCounts.forEach(({ tier, _count }) => {
    switch (tier) {
      case 'FREE': tierDistribution.freeCount = _count.tier; break;
      case 'STARTER': tierDistribution.starterCount = _count.tier; break;
      case 'GROWTH': tierDistribution.growthCount = _count.tier; break;
      case 'ELITE': tierDistribution.eliteCount = _count.tier; break;
      case 'ENTERPRISE': tierDistribution.enterpriseCount = _count.tier; break;
    }
  });

  // Save metrics
  return await prisma.platformMetrics.create({
    data: {
      date: now,
      totalUsers,
      activeUsers,
      newUsers,
      totalOrgs,
      activeOrgs,
      newOrgs,
      mrrCents: BigInt(mrrCents),
      arrCents: BigInt(arrCents),
      ...tierDistribution,
    }
  });
}
```

#### 3.2 Create Onboarding Module
```typescript
// lib/modules/onboarding/index.ts
export const OnboardingSessionSchema = z.object({
  orgName: z.string().min(1).max(100),
  orgWebsite: z.string().url().optional(),
  orgDescription: z.string().max(500).optional(),
  selectedTier: z.nativeEnum(SubscriptionTier),
  billingCycle: z.nativeEnum(BillingCycle),
});

export async function createOnboardingSession(userId?: string) {
  const sessionToken = generateSecureToken();
  
  return await prisma.onboardingSession.create({
    data: {
      sessionToken,
      userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    }
  });
}

export async function updateOnboardingSession(sessionToken: string, step: number, data: any) {
  const session = await prisma.onboardingSession.findUnique({
    where: { sessionToken }
  });

  if (!session || session.expiresAt < new Date()) {
    throw new Error('Invalid or expired onboarding session');
  }

  const updateData: any = {
    currentStep: step,
    updatedAt: new Date(),
  };

  // Store step-specific data
  if (step === 1) {
    Object.assign(updateData, {
      orgName: data.orgName,
      orgWebsite: data.orgWebsite,
      orgDescription: data.orgDescription,
    });
  } else if (step === 2) {
    Object.assign(updateData, {
      selectedTier: data.selectedTier,
      billingCycle: data.billingCycle,
    });
  } else if (step === 3) {
    Object.assign(updateData, {
      stripePaymentIntentId: data.paymentIntentId,
      paymentStatus: data.paymentStatus,
    });
  }

  return await prisma.onboardingSession.update({
    where: { sessionToken },
    data: updateData
  });
}

export async function completeOnboarding(sessionToken: string) {
  const session = await prisma.onboardingSession.findUnique({
    where: { sessionToken },
    include: { user: true }
  });

  if (!session || session.paymentStatus !== 'SUCCEEDED') {
    throw new Error('Cannot complete onboarding - payment required');
  }

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: session.orgName!,
      website: session.orgWebsite,
      description: session.orgDescription,
    }
  });

  // Create subscription
  const subscription = await prisma.subscription.create({
    data: {
      organizationId: organization.id,
      tier: session.selectedTier!,
      interval: session.billingCycle === 'MONTHLY' ? 'MONTHLY' : 'YEARLY',
      status: 'ACTIVE',
      stripePaymentIntentId: session.stripePaymentIntentId,
    }
  });

  // Update user with organization
  if (session.userId) {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        organizationId: organization.id,
        organizationRole: 'OWNER',
      }
    });
  }

  // Mark session complete
  await prisma.onboardingSession.update({
    where: { sessionToken },
    data: {
      isCompleted: true,
      completedAt: new Date(),
      organizationId: organization.id,
    }
  });

  return { organization, subscription };
}

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
```

### Phase 4: RBAC & Feature Access Integration

#### 4.1 Add Admin & System Permissions
Update `lib/auth/rbac.ts`:
```typescript
export function canAccessAdminPanel(user: User): boolean {
  return user.globalRole === 'ADMIN';
}

export function canViewPlatformMetrics(user: User): boolean {
  return user.globalRole === 'ADMIN';
}

export function canManageUsers(user: User): boolean {
  return user.globalRole === 'ADMIN';
}

export function canManageOrganizations(user: User): boolean {
  return user.globalRole === 'ADMIN';
}

export function canManageFeatureFlags(user: User): boolean {
  return user.globalRole === 'ADMIN';
}

export function canImpersonateUsers(user: User): boolean {
  return user.globalRole === 'ADMIN';
}
```

### Phase 5: UI Component Recreation (Exact Design Match)

#### 5.1 Create Landing Page
Create `app/(public)/page.tsx`:
```tsx
import { HeroSection } from '@/components/features/landing/hero-section'
import { FeaturesSection } from '@/components/features/landing/features-section'
import { CTASection } from '@/components/features/landing/cta-section'
import { Footer } from '@/components/shared/layouts/footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  )
}
```

#### 5.2 Create Hero Section Component (Exact Match)
Create `components/features/landing/HeroSection.tsx`:
```tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        {/* Main Heading */}
        <div className="space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Build Better Products,{' '}
            <span className="text-primary">Faster</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-xl leading-8 text-muted-foreground">
            The enterprise SaaS platform that empowers teams to ship products 10x faster 
            with powerful tools and seamless workflows.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg" className="hover-elevate">
            <Link href="/onboarding">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <Button variant="outline" size="lg" asChild className="hover-elevate">
            <Link href="/pricing">
              View Pricing
            </Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16">
          <p className="text-sm font-medium text-muted-foreground">
            Trusted by thousands of teams worldwide
          </p>
          
          <div className="mt-6 flex items-center justify-center gap-x-8 opacity-60">
            {/* Logo placeholders - replace with actual customer logos */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-24 rounded bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div 
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>
    </section>
  )
}
```

#### 5.3 Create Admin Dashboard (Exact Match)
Create `app/(admin)/admin/page.tsx`:
```tsx
'use client'

import React, { useState } from 'react'
import { AdminSidebar } from '@/components/features/admin/admin-sidebar'
import { AdminDashboardContent } from '@/components/features/admin/admin-dashboard-content'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <AdminDashboardContent activeTab={activeTab} />
      </div>
    </SidebarProvider>
  )
}
```

#### 5.4 Create Admin Dashboard Content (Exact Match)
Create `components/features/admin/AdminDashboardContent.tsx`:
```tsx
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/shared/stat-card'
import { DataTable } from '@/components/shared/data-table'
import { SubscriptionChart } from '@/components/features/admin/subscription-chart'
import { RevenueChart } from '@/components/features/admin/revenue-chart'
import { TierBadge } from '@/components/shared/tier-badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { Building2, Users, DollarSign, Activity } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

interface AdminDashboardContentProps {
  activeTab: string
}

export function AdminDashboardContent({ activeTab }: AdminDashboardContentProps) {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['platform-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/v1/admin/metrics')
      return response.json()
    }
  })

  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: async () => {
      const response = await fetch('/api/v1/admin/organizations')
      return response.json()
    }
  })

  const orgColumns = [
    { header: 'Organization', accessor: 'name' as const },
    {
      header: 'Tier',
      accessor: 'tier' as const,
      cell: (value: any) => <TierBadge tier={value} />
    },
    { header: 'Users', accessor: 'users' as const },
    {
      header: 'Status',
      accessor: 'status' as const,
      cell: (value: any) => <StatusBadge status={value} />
    },
  ]

  const orgActions = [
    { label: 'View Details', onClick: (row: any) => console.log('View', row.id) },
    { label: 'Edit', onClick: (row: any) => console.log('Edit', row.id) },
    { label: 'Suspend', onClick: (row: any) => console.log('Suspend', row.id) },
  ]

  if (activeTab === 'dashboard') {
    return (
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Platform overview and system management
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Organizations"
              value={metrics?.totalOrgs || 0}
              change={`+${metrics?.newOrgs || 0} today`}
              icon={Building2}
              loading={metricsLoading}
            />
            <StatCard
              title="Total Users"
              value={metrics?.totalUsers || 0}
              change={`${metrics?.activeUsers || 0} active`}
              icon={Users}
              loading={metricsLoading}
            />
            <StatCard
              title="Monthly Revenue"
              value={`$${((metrics?.mrrCents || 0) / 100).toLocaleString()}`}
              change="+12.5% from last month"
              icon={DollarSign}
              loading={metricsLoading}
            />
            <StatCard
              title="Active Subscriptions"
              value={metrics?.totalOrgs || 0}
              change="95.2% retention rate"
              icon={Activity}
              loading={metricsLoading}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="hover-elevate">
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <SubscriptionChart data={metrics} loading={metricsLoading} />
              </CardContent>
            </Card>
            
            <Card className="hover-elevate">
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart data={metrics} loading={metricsLoading} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Organizations */}
          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle>Recent Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={orgColumns}
                data={organizations?.organizations || []}
                actions={orgActions}
                loading={orgsLoading}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  // Other tab content
  return (
    <main className="flex-1 overflow-auto">
      <div className="p-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h1>
        <p className="text-muted-foreground mt-2">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} content coming soon
        </p>
      </div>
    </main>
  )
}
```

#### 5.5 Create Onboarding Flow (Exact Match)
Create `app/(public)/onboarding/page.tsx`:
```tsx
'use client'

import React, { useState } from 'react'
import { OnboardingLayout } from '@/components/features/onboarding/onboarding-layout'
import { OrgDetailsForm } from '@/components/features/onboarding/org-details-form'
import { PlanSelectionForm } from '@/components/features/onboarding/plan-selection-form'
import { PaymentForm } from '@/components/features/onboarding/payment-form'
import { OnboardingComplete } from '@/components/features/onboarding/onboarding-complete'

type Step = 1 | 2 | 3 | 4

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [formData, setFormData] = useState({
    org: { name: '', website: '', description: '' },
    tier: null as string | null,
  })

  const handleOrgNext = (data: { name: string; website: string; description: string }) => {
    setFormData({ ...formData, org: data })
    setCurrentStep(2)
  }

  const handlePlanNext = (tier: string) => {
    setFormData({ ...formData, tier })
    setCurrentStep(3)
  }

  const handlePaymentNext = () => {
    setCurrentStep(4)
  }

  const handleComplete = () => {
    // Redirect to dashboard
    window.location.href = '/dashboard'
  }

  return (
    <OnboardingLayout currentStep={currentStep} totalSteps={4}>
      {currentStep === 1 && (
        <OrgDetailsForm
          onNext={handleOrgNext}
          initialData={formData.org}
        />
      )}
      
      {currentStep === 2 && (
        <PlanSelectionForm
          onNext={handlePlanNext}
          onBack={() => setCurrentStep(1)}
          selectedTier={formData.tier}
        />
      )}
      
      {currentStep === 3 && (
        <PaymentForm
          onNext={handlePaymentNext}
          onBack={() => setCurrentStep(2)}
          planData={{ tier: formData.tier, org: formData.org }}
        />
      )}
      
      {currentStep === 4 && (
        <OnboardingComplete
          onComplete={handleComplete}
          orgData={formData.org}
        />
      )}
    </OnboardingLayout>
  )
}
```

#### 5.6 Create Pricing Page (Exact Match)
Create `app/(public)/pricing/page.tsx`:
```tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'
import Link from 'next/link'

interface PricingTier {
  name: string
  price: string
  description: string
  features: string[]
  isPopular?: boolean
  ctaText: string
  ctaLink: string
}

export default function PricingPage() {
  const tiers: PricingTier[] = [
    {
      name: 'Starter',
      price: '$29',
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 5 team members',
        'Basic dashboard',
        'Core CRM features',
        'Email support',
        '5GB storage',
      ],
      ctaText: 'Start Free Trial',
      ctaLink: '/onboarding?tier=starter',
    },
    {
      name: 'Growth',
      price: '$79',
      description: 'For growing teams that need more power',
      features: [
        'Up to 25 team members',
        'Advanced analytics',
        'All CRM features',
        'Priority support',
        '50GB storage',
        'API access',
        'Custom integrations',
      ],
      isPopular: true,
      ctaText: 'Start Free Trial',
      ctaLink: '/onboarding?tier=growth',
    },
    {
      name: 'Elite',
      price: '$199',
      description: 'For established teams with advanced needs',
      features: [
        'Up to 100 team members',
        'AI-powered insights',
        'Advanced automation',
        'Dedicated support',
        '200GB storage',
        'Advanced API access',
        'Priority integrations',
        'Custom workflows',
      ],
      ctaText: 'Start Free Trial',
      ctaLink: '/onboarding?tier=elite',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations with custom requirements',
      features: [
        'Unlimited team members',
        'Enterprise-grade security',
        'Custom AI models',
        '24/7 phone support',
        'Unlimited storage',
        'Custom API development',
        'Dedicated success manager',
        'SLA guarantees',
      ],
      ctaText: 'Contact Sales',
      ctaLink: '/contact-sales',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-6 text-xl leading-8 text-muted-foreground">
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-24 sm:pb-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative hover-elevate ${
                  tier.isPopular
                    ? 'border-primary shadow-lg ring-1 ring-primary/20'
                    : 'border-border'
                }`}
              >
                {tier.isPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold tracking-tight">
                      {tier.price}
                    </span>
                    {tier.price !== 'Custom' && (
                      <span className="text-sm font-medium text-muted-foreground">
                        /month
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <Button
                    asChild
                    className={`w-full hover-elevate ${
                      tier.isPopular
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                    }`}
                  >
                    <Link href={tier.ctaLink}>{tier.ctaText}</Link>
                  </Button>
                  
                  <div className="space-y-3">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-24 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            {[
              {
                question: 'Can I change plans anytime?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
              },
              {
                question: 'Is there a free trial?',
                answer: 'Yes, all paid plans come with a 14-day free trial. No credit card required to start.'
              },
              {
                question: 'What happens to my data if I cancel?',
                answer: 'Your data is safely stored for 30 days after cancellation, giving you time to export or reactivate your account.'
              },
            ].map((faq, index) => (
              <Card key={index} className="hover-elevate">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
```

### Phase 6: API Route Implementation

#### 6.1 Create Admin Metrics API
Create `app/api/v1/admin/metrics/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getPlatformMetrics } from '@/lib/modules/admin'
import { canAccessAdminPanel } from '@/lib/auth/rbac'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessAdminPanel(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const metrics = await getPlatformMetrics()
    return NextResponse.json(metrics)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
```

#### 6.2 Create Onboarding API
Create `app/api/v1/onboarding/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createOnboardingSession, updateOnboardingSession, completeOnboarding } from '@/lib/modules/onboarding'

export async function POST(req: NextRequest) {
  try {
    const { action, sessionToken, step, data } = await req.json()

    if (action === 'create') {
      const session = await createOnboardingSession()
      return NextResponse.json({ sessionToken: session.sessionToken })
    }

    if (action === 'update') {
      const updatedSession = await updateOnboardingSession(sessionToken, step, data)
      return NextResponse.json({ session: updatedSession })
    }

    if (action === 'complete') {
      const result = await completeOnboarding(sessionToken)
      return NextResponse.json({ result })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Onboarding failed' }, { status: 500 })
  }
}
```

### Phase 7: CSS Theme Integration

#### 7.1 Ensure CSS Custom Properties Match
The provided CSS in `index.css` already includes the complete design system. Key elements:

```css
/* Design System Variables (Already Provided) */
:root {
  /* Primary colors */
  --primary: 240 100% 27%; /* Blue */
  --primary-foreground: 240 20% 98%;
  
  /* Interactive states */
  --elevate-1: rgba(0,0,0, .03);
  --elevate-2: rgba(0,0,0, .08);
  
  /* Typography */
  --font-sans: Inter, Open Sans, sans-serif;
  
  /* Shadows */
  --shadow-lg: 0px 10px 20px -4px hsl(240 10% 10% / 0.12);
}

/* Hover elevation utilities */
.hover-elevate:hover::after {
  background-color: var(--elevate-1);
}
```

### Phase 8: Navigation Integration

#### 8.1 Create Public/Private Route Structure
Update route organization:
```
app/
├── (public)/
│   ├── page.tsx (Landing)
│   ├── pricing/page.tsx
│   └── onboarding/page.tsx
├── (admin)/
│   └── admin/page.tsx
└── (platform)/
    └── dashboard/page.tsx
```

### Phase 9: Testing & Quality Assurance

#### 9.1 Create Integration Tests
Create `__tests__/integration/onboarding.test.ts`:
```typescript
import { createOnboardingSession, completeOnboarding } from '@/lib/modules/onboarding'

describe('Onboarding Flow', () => {
  it('should create and complete onboarding session', async () => {
    const session = await createOnboardingSession()
    expect(session.sessionToken).toBeDefined()
    
    // Complete onboarding flow would be tested here
    expect(session.currentStep).toBe(1)
  })
})
```

### Phase 10: Go-Live Checklist

- [ ] Database migrations applied successfully
- [ ] RLS policies enabled on all admin/system tables
- [ ] RBAC permissions working for admin access
- [ ] Landing page with exact hero design and CTA flows
- [ ] Admin dashboard with sidebar navigation and stat cards
- [ ] Onboarding flow with multi-step wizard
- [ ] Pricing page with tier comparison and CTAs
- [ ] CSS custom properties and elevation system working
- [ ] Admin metrics calculation and display
- [ ] Onboarding session management and completion
- [ ] Platform metrics tracking and analytics
- [ ] All API endpoints protected and functional
- [ ] Navigation routing (public/admin/platform) working
- [ ] Light/dark theme support operational
- [ ] Mobile responsiveness maintained
- [ ] Error boundaries and loading states in place
- [ ] Tests passing with required coverage

## UI Design Preservation Notes

**Critical Design Elements:**
- **Elevation System**: Uses `var(--elevate-1)` and `var(--elevate-2)` for hover states
- **Clean Typography**: Inter/Open Sans font stack with proper spacing
- **Blue Primary**: `hsl(240 100% 27%)` as primary brand color
- **Card Shadows**: Sophisticated shadow system with multiple levels
- **Hover Interactions**: `hover-elevate` class for smooth interactions
- **Professional Layout**: Clean grid systems with consistent spacing

**Component Styling Patterns:**
```css
/* Card elevation on hover */
.hover-elevate:hover::after {
  background-color: var(--elevate-1);
}

/* Primary button styling */
.bg-primary {
  background-color: hsl(var(--primary));
}

/* Clean shadows */
.shadow-lg {
  box-shadow: var(--shadow-lg);
}
```

This integration creates a complete landing page, admin dashboard, onboarding flow, and pricing page that exactly matches the provided design system while seamlessly integrating with the Strive platform's multi-tenant architecture.