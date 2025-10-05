# CRM Dashboard Integration Plan

## Overview
This document outlines the step-by-step integration of the Real Estate CRM dashboard into the existing Strive SaaS platform.

## Prerequisites
- Existing Next.js 15+ App Router setup
- Tailwind CSS + shadcn/ui components
- Authentication system in place
- Database connection established

## Integration Steps

### Phase 1: File Structure Setup

#### 1.1 Create CRM Route Structure
```bash
# From platform root
mkdir -p app/(protected)/crm/{dashboard,leads,contacts,deals,listings,calendar,analytics}
mkdir -p app/(protected)/crm/leads/[id]
mkdir -p app/(protected)/crm/contacts/[id]
mkdir -p app/(protected)/crm/deals/[id]
mkdir -p app/(protected)/crm/listings/[id]
```

#### 1.2 Move CRM Components
```bash
# Copy components from update-sessions/real-estate-crm/components/
cp -r update-sessions/real-estate-crm/components/crm components/
```

#### 1.3 Create API Routes
```bash
mkdir -p app/api/v1/{leads,contacts,deals,listings,analytics}
```

### Phase 2: Component Integration

#### 2.1 Update Import Paths
- [ ] Update all component imports to use `@/components/crm/*`
- [ ] Ensure all shadcn/ui imports align with existing platform structure
- [ ] Update any hardcoded API endpoints to match platform conventions

#### 2.2 Integrate with Platform Layout
```typescript
// app/(protected)/crm/layout.tsx
import { PlatformSidebar } from '@/components/platform/sidebar'
import { CRMNavigation } from '@/components/crm/navigation'

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <PlatformSidebar />
      <div className="flex-1 flex flex-col">
        <CRMNavigation />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Phase 3: Database Integration

#### 3.1 Update Prisma Schema
Add CRM models to existing `prisma/schema.prisma`:

```prisma
model Lead {
  id          String   @id @default(cuid())
  name        String
  email       String?
  phone       String?
  source      String?
  status      LeadStatus @default(NEW_LEAD)
  score       Int      @default(0)
  assignedTo  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  assignedAgent User? @relation(fields: [assignedTo], references: [id])
  activities    LeadActivity[]
  deals         Deal[]
  
  @@map("leads")
}

model Contact {
  id          String   @id @default(cuid())
  name        String
  email       String?
  phone       String?
  type        ContactType @default(PROSPECT)
  status      String   @default("Active")
  assignedTo  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  assignedAgent User? @relation(fields: [assignedTo], references: [id])
  communications Communication[]
  deals         Deal[]
  
  @@map("contacts")
}

model Deal {
  id          String   @id @default(cuid())
  title       String
  value       Decimal
  stage       String   @default("Lead")
  status      DealStatus @default(ACTIVE)
  probability Int      @default(50)
  expectedCloseDate DateTime?
  actualCloseDate   DateTime?
  
  // Relations
  leadId      String?
  contactId   String?
  lead        Lead?    @relation(fields: [leadId], references: [id])
  contact     Contact? @relation(fields: [contactId], references: [id])
  
  @@map("deals")
}

model Listing {
  id          String   @id @default(cuid())
  address     String
  city        String
  state       String
  zipCode     String
  price       Decimal
  bedrooms    Int?
  bathrooms   Int?
  sqft        Int?
  status      ListingStatus @default(ACTIVE)
  mlsNumber   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("listings")
}

enum LeadStatus {
  NEW_LEAD
  IN_CONTACT
  ACTIVE
  NEGOTIATION
  CLOSED
}

enum ContactType {
  PROSPECT
  CLIENT
  PAST_CLIENT
}

enum DealStatus {
  ACTIVE
  WON
  LOST
}

enum ListingStatus {
  ACTIVE
  PENDING
  SOLD
  EXPIRED
}
```

#### 3.2 Run Migrations
```bash
npx prisma migrate dev --name add-crm-models
npx prisma generate
```

### Phase 4: API Integration

#### 4.1 Create API Route Handlers
Create these files in `app/api/v1/`:

**leads/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  try {
    const leads = await prisma.lead.findMany({
      where: {
        ...(status && { status: status as any }),
      },
      include: {
        assignedAgent: {
          select: { id: true, name: true, email: true }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ leads })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // Handle lead creation
}
```

#### 4.2 Create Data Hooks
Create `lib/hooks/use-leads.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useLeads(filters?: {
  status?: string
  assignedTo?: string
  page?: number
}) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.assignedTo) params.set('assignedTo', filters.assignedTo)
      if (filters?.page) params.set('page', filters.page.toString())

      const response = await fetch(`/api/v1/leads?${params}`)
      if (!response.ok) throw new Error('Failed to fetch leads')
      return response.json()
    }
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (leadData: any) => {
      const response = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      })
      if (!response.ok) throw new Error('Failed to create lead')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    }
  })
}
```

### Phase 5: Authentication & Authorization

#### 5.1 Update Auth Configuration
Add CRM permissions to existing auth system:

```typescript
// lib/auth/permissions.ts
export const CRM_PERMISSIONS = {
  LEADS_VIEW: 'crm:leads:view',
  LEADS_CREATE: 'crm:leads:create',
  LEADS_EDIT: 'crm:leads:edit',
  LEADS_DELETE: 'crm:leads:delete',
  DEALS_MANAGE: 'crm:deals:manage',
  ANALYTICS_VIEW: 'crm:analytics:view'
} as const
```

#### 5.2 Protect CRM Routes
```typescript
// app/(protected)/crm/middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // CRM-specific middleware logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        return token?.permissions?.includes('crm:access') ?? false
      }
    }
  }
)
```

### Phase 6: UI Integration

#### 6.1 Update Platform Navigation
Add CRM menu items to existing platform navigation:

```typescript
// components/platform/sidebar.tsx
const navigationItems = [
  // ... existing items
  {
    name: 'CRM',
    href: '/crm/dashboard',
    icon: Users,
    children: [
      { name: 'Dashboard', href: '/crm/dashboard' },
      { name: 'Leads', href: '/crm/leads' },
      { name: 'Contacts', href: '/crm/contacts' },
      { name: 'Deals', href: '/crm/deals' },
      { name: 'Listings', href: '/crm/listings' },
      { name: 'Analytics', href: '/crm/analytics' }
    ]
  }
]
```

#### 6.2 Create CRM Pages
Create page files in `app/(protected)/crm/`:

```typescript
// app/(protected)/crm/dashboard/page.tsx
import { DashboardStats } from '@/components/crm/dashboard/dashboard-stats'
import { RecentLeads } from '@/components/crm/dashboard/recent-leads'
import { PipelineOverview } from '@/components/crm/dashboard/pipeline-overview'

export default function CRMDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">CRM Dashboard</h1>
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentLeads />
        <PipelineOverview />
      </div>
    </div>
  )
}
```

### Phase 7: State Management

#### 7.1 Update React Query Setup
Ensure React Query is properly configured in the platform:

```typescript
// app/providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### Phase 8: Testing & Validation

#### 8.1 Create Tests
```bash
# Create test files
mkdir -p __tests__/crm/{components,pages,api}
```

#### 8.2 Test Integration Points
- [ ] Navigation between CRM pages
- [ ] Data fetching and mutations
- [ ] Authentication protection
- [ ] Responsive design
- [ ] Error handling

### Phase 9: Deployment Preparation

#### 9.1 Environment Variables
Add required environment variables:
```bash
# .env
DATABASE_URL="your-database-url"
NEXTAUTH_SECRET="your-secret"
# Add any CRM-specific API keys
```

#### 9.2 Build Validation
```bash
npm run build
npm run test
npm run lint
```

### Phase 10: Go-Live Checklist

- [ ] All CRM routes accessible and protected
- [ ] Database migrations applied
- [ ] API endpoints functional
- [ ] Components render correctly
- [ ] Navigation integrated
- [ ] Error boundaries in place
- [ ] Loading states implemented
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Security validated

## Rollback Plan

If issues arise:
1. Revert database migrations: `npx prisma migrate reset`
2. Remove CRM routes from navigation
3. Comment out CRM API routes
4. Deploy previous working version

## Post-Integration Tasks

1. Monitor error logs and performance
2. Gather user feedback
3. Plan feature enhancements
4. Update documentation
5. Train users on new CRM functionality

## Support

For issues during integration:
- Check logs in `/logs/crm-integration.log`
- Review API response formats
- Validate database queries
- Test authentication flows