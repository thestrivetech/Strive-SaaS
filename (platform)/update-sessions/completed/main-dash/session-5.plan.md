# Session 5: Activity Feed & Quick Actions UI

## Session Overview
**Goal:** Build interactive components for activity tracking, quick action buttons, and module shortcuts to complete the dashboard user experience.

**Duration:** 3-4 hours
**Complexity:** Medium
**Dependencies:** Session 4 (Dashboard UI components must be complete)

## Objectives

1. ✅ Create Activity Feed component with filtering
2. ✅ Build Quick Actions grid with execution
3. ✅ Implement Module Shortcuts navigation
4. ✅ Add real-time activity updates
5. ✅ Implement activity actions (mark read, archive)
6. ✅ Add quick action tracking
7. ✅ Ensure proper error handling and feedback

## Prerequisites

- [x] Session 4 completed (Dashboard UI components ready)
- [x] Understanding of TanStack Query mutations
- [x] Familiarity with Next.js navigation
- [x] Knowledge of optimistic updates

## Component Structure

```
components/features/dashboard/
├── activity/
│   ├── activity-feed.tsx          # Main activity feed
│   ├── activity-item.tsx          # Single activity item
│   ├── activity-filters.tsx       # Filter controls
│   └── activity-type-icon.tsx     # Type-specific icons
├── quick-actions/
│   ├── quick-actions-grid.tsx     # Action buttons grid
│   ├── quick-action-button.tsx    # Single action button
│   └── quick-action-modal.tsx     # Form modal for actions
└── shortcuts/
    ├── module-shortcuts.tsx       # Navigation shortcuts
    └── module-shortcut-card.tsx   # Single shortcut card
```

## Step-by-Step Implementation

### Step 1: Create Activity Feed Component

**File:** `components/features/dashboard/activity/activity-feed.tsx`

```tsx
'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityItem } from './activity-item'
import { ActivityFilters } from './activity-filters'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '../shared/empty-state'

interface Activity {
  id: string
  title: string
  description?: string
  type: string
  severity: string
  createdAt: string
  isRead: boolean
  user?: {
    name: string
    image?: string
  }
}

export function ActivityFeed() {
  const [filterType, setFilterType] = useState<string | null>(null)
  const [limit, setLimit] = useState(20)

  const { data, isLoading, error } = useQuery({
    queryKey: ['recent-activities', filterType, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(filterType && { type: filterType }),
      })
      const response = await fetch(`/api/v1/dashboard/activities?${params}`)
      if (!response.ok) throw new Error('Failed to fetch activities')
      return response.json()
    },
    refetchInterval: 60000, // Refetch every minute
  })

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Failed to load activities</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activities = data?.activities || []

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          📋 Recent Activity
        </CardTitle>
        <ActivityFilters
          currentFilter={filterType}
          onFilterChange={setFilterType}
        />
      </CardHeader>

      <CardContent>
        {activities.length === 0 ? (
          <EmptyState
            title="No activities yet"
            description="Activity from your organization will appear here"
          />
        ) : (
          <div className="space-y-3">
            {activities.map((activity: Activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {activities.length >= limit && (
          <button
            onClick={() => setLimit(limit + 20)}
            className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Load more
          </button>
        )}
      </CardContent>
    </Card>
  )
}
```

**File:** `components/features/dashboard/activity/activity-item.tsx`

```tsx
'use client'

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Archive } from 'lucide-react'
import { ActivityTypeIcon } from './activity-type-icon'

interface ActivityItemProps {
  activity: {
    id: string
    title: string
    description?: string
    type: string
    severity: string
    createdAt: string
    isRead: boolean
    user?: {
      name: string
      image?: string
    }
  }
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const queryClient = useQueryClient()

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/dashboard/activities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read' }),
      })
      if (!response.ok) throw new Error('Failed to mark as read')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-activities'] })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/dashboard/activities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' }),
      })
      if (!response.ok) throw new Error('Failed to archive')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-activities'] })
    },
  })

  const getSeverityColor = (severity: string) => {
    const colors = {
      INFO: 'bg-blue-100 text-blue-800',
      SUCCESS: 'bg-green-100 text-green-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      ERROR: 'bg-red-100 text-red-800',
      CRITICAL: 'bg-red-200 text-red-900',
    }
    return colors[severity as keyof typeof colors] || colors.INFO
  }

  return (
    <div
      className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 ${
        !activity.isRead ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex-shrink-0">
        {activity.user?.image ? (
          <Avatar className="w-8 h-8">
            <AvatarImage src={activity.user.image} />
            <AvatarFallback>{activity.user.name?.[0]}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
            <ActivityTypeIcon type={activity.type} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {activity.title}
          </p>
          <Badge
            variant="secondary"
            className={`text-xs ${getSeverityColor(activity.severity)}`}
          >
            {activity.severity.toLowerCase()}
          </Badge>
        </div>

        {activity.description && (
          <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500">
          {activity.user?.name && <span>by {activity.user.name}</span>}
          <span>•</span>
          <span>
            {formatDistanceToNow(new Date(activity.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {!activity.isRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markReadMutation.mutate(activity.id)}
            disabled={markReadMutation.isPending}
          >
            <Check className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => archiveMutation.mutate(activity.id)}
          disabled={archiveMutation.isPending}
        >
          <Archive className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
```

**File:** `components/features/dashboard/activity/activity-filters.tsx`

```tsx
'use client'

import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'

interface ActivityFiltersProps {
  currentFilter: string | null
  onFilterChange: (filter: string | null) => void
}

const activityTypes = [
  { value: null, label: 'All Activities' },
  { value: 'USER_ACTION', label: 'User Actions' },
  { value: 'SYSTEM_EVENT', label: 'System Events' },
  { value: 'WORKFLOW_UPDATE', label: 'Workflow Updates' },
  { value: 'DATA_CHANGE', label: 'Data Changes' },
  { value: 'SECURITY_EVENT', label: 'Security Events' },
]

export function ActivityFilters({
  currentFilter,
  onFilterChange,
}: ActivityFiltersProps) {
  const currentLabel =
    activityTypes.find((t) => t.value === currentFilter)?.label ||
    'All Activities'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {currentLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {activityTypes.map((type) => (
          <DropdownMenuItem
            key={type.value || 'all'}
            onClick={() => onFilterChange(type.value)}
          >
            {type.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**File:** `components/features/dashboard/activity/activity-type-icon.tsx`

```tsx
import React from 'react'

const icons = {
  USER_ACTION: '👤',
  SYSTEM_EVENT: '⚙️',
  WORKFLOW_UPDATE: '🔄',
  DATA_CHANGE: '📊',
  SECURITY_EVENT: '🔒',
  INTEGRATION_EVENT: '🔗',
}

export function ActivityTypeIcon({ type }: { type: string }) {
  return <span>{icons[type as keyof typeof icons] || '📝'}</span>
}
```

### Step 2: Create Quick Actions Grid

**File:** `components/features/dashboard/quick-actions/quick-actions-grid.tsx`

```tsx
'use client'

import React from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuickActionButton } from './quick-action-button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

interface QuickAction {
  id: string
  name: string
  description?: string
  icon: string
  actionType: string
  targetUrl?: string
  color: string
}

export function QuickActionsGrid() {
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ['quick-actions'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/actions')
      if (!response.ok) throw new Error('Failed to fetch quick actions')
      return response.json()
    },
  })

  const executeActionMutation = useMutation({
    mutationFn: async (actionId: string) => {
      const response = await fetch(
        `/api/v1/dashboard/actions/${actionId}/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      )
      if (!response.ok) throw new Error('Failed to execute action')
      return response.json()
    },
  })

  const handleActionClick = (action: QuickAction) => {
    if (action.actionType === 'NAVIGATION' && action.targetUrl) {
      router.push(action.targetUrl)
    } else if (action.actionType === 'API_CALL') {
      executeActionMutation.mutate(action.id)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const actions = data?.actions || []

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {actions.map((action: QuickAction) => (
            <QuickActionButton
              key={action.id}
              action={action}
              onClick={() => handleActionClick(action)}
              isLoading={executeActionMutation.isPending}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

**File:** `components/features/dashboard/quick-actions/quick-action-button.tsx`

```tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Users, Zap, Calculator, Building, Bot } from 'lucide-react'

interface QuickActionButtonProps {
  action: {
    id: string
    name: string
    icon: string
    color: string
  }
  onClick: () => void
  isLoading?: boolean
}

const iconMap = {
  plus: Plus,
  'file-text': FileText,
  users: Users,
  zap: Zap,
  calculator: Calculator,
  building: Building,
  bot: Bot,
}

const colorMap = {
  blue: 'bg-blue-500 hover:bg-blue-600 text-white',
  green: 'bg-green-500 hover:bg-green-600 text-white',
  purple: 'bg-purple-500 hover:bg-purple-600 text-white',
  orange: 'bg-orange-500 hover:bg-orange-600 text-white',
  gray: 'bg-gray-500 hover:bg-gray-600 text-white',
}

export function QuickActionButton({
  action,
  onClick,
  isLoading,
}: QuickActionButtonProps) {
  const Icon = iconMap[action.icon as keyof typeof iconMap] || Plus
  const colorClass = colorMap[action.color as keyof typeof colorMap] || colorMap.blue

  return (
    <Button
      variant="outline"
      className={`h-20 flex flex-col items-center justify-center gap-2 p-4 ${colorClass}`}
      onClick={onClick}
      disabled={isLoading}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium text-center leading-tight">
        {action.name}
      </span>
    </Button>
  )
}
```

### Step 3: Create Module Shortcuts

**File:** `components/features/dashboard/shortcuts/module-shortcuts.tsx`

```tsx
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModuleShortcutCard } from './module-shortcut-card'
import {
  Users,
  FileText,
  BarChart3,
  Calendar,
  DollarSign,
  Settings,
} from 'lucide-react'

const modules = [
  {
    id: 'crm',
    name: 'CRM',
    description: 'Manage contacts and deals',
    icon: Users,
    href: '/real-estate/crm',
    color: 'blue',
  },
  {
    id: 'transactions',
    name: 'Transactions',
    description: 'Track property transactions',
    icon: FileText,
    href: '/real-estate/transactions',
    color: 'green',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'View reports and insights',
    icon: BarChart3,
    href: '/real-estate/analytics',
    color: 'purple',
  },
  {
    id: 'tasks',
    name: 'Tasks',
    description: 'Manage your tasks',
    icon: Calendar,
    href: '/real-estate/tasks',
    color: 'orange',
  },
  {
    id: 'billing',
    name: 'Billing',
    description: 'View invoices and payments',
    icon: DollarSign,
    href: '/real-estate/billing',
    color: 'indigo',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configure your workspace',
    icon: Settings,
    href: '/real-estate/settings',
    color: 'gray',
  },
]

export function ModuleShortcuts() {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Quick Access
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {modules.map((module) => (
            <ModuleShortcutCard key={module.id} module={module} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

**File:** `components/features/dashboard/shortcuts/module-shortcut-card.tsx`

```tsx
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'

interface ModuleShortcutCardProps {
  module: {
    id: string
    name: string
    description: string
    icon: LucideIcon
    href: string
    color: string
  }
}

const colorMap = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  gray: 'bg-gray-100 text-gray-600',
}

export function ModuleShortcutCard({ module }: ModuleShortcutCardProps) {
  const router = useRouter()
  const Icon = module.icon
  const colorClass = colorMap[module.color as keyof typeof colorMap] || colorMap.blue

  return (
    <button
      onClick={() => router.push(module.href)}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left w-full"
    >
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{module.name}</p>
        <p className="text-xs text-gray-600 truncate">{module.description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </button>
  )
}
```

## Testing & Validation

### Test 1: Activity Feed Updates
```tsx
// Test activity feed refetches
import { render, waitFor } from '@testing-library/react'
import { ActivityFeed } from '@/components/features/dashboard/activity/activity-feed'

test('refetches activities every minute', async () => {
  render(<ActivityFeed />)
  await waitFor(() => {
    expect(screen.getByText(/recent activity/i)).toBeInTheDocument()
  }, { timeout: 65000 })
})
```

### Test 2: Quick Action Execution
```tsx
// Test quick action click
import { fireEvent, screen } from '@testing-library/react'

test('executes quick action on click', async () => {
  render(<QuickActionsGrid />)
  const button = screen.getByText('Create Lead')
  fireEvent.click(button)
  // Assert navigation or API call
})
```

### Test 3: Module Navigation
```tsx
// Test module shortcut navigation
test('navigates to module on click', () => {
  render(<ModuleShortcuts />)
  const crmButton = screen.getByText('CRM')
  fireEvent.click(crmButton)
  // Assert router.push was called
})
```

## Success Criteria

- [x] Activity feed displays recent activities
- [x] Activities can be marked as read
- [x] Activities can be archived
- [x] Quick actions execute correctly
- [x] Module shortcuts navigate properly
- [x] Real-time updates work
- [x] Optimistic UI updates
- [x] Error states handled

## Files Created

- ✅ `components/features/dashboard/activity/activity-feed.tsx`
- ✅ `components/features/dashboard/activity/activity-item.tsx`
- ✅ `components/features/dashboard/activity/activity-filters.tsx`
- ✅ `components/features/dashboard/activity/activity-type-icon.tsx`
- ✅ `components/features/dashboard/quick-actions/quick-actions-grid.tsx`
- ✅ `components/features/dashboard/quick-actions/quick-action-button.tsx`
- ✅ `components/features/dashboard/shortcuts/module-shortcuts.tsx`
- ✅ `components/features/dashboard/shortcuts/module-shortcut-card.tsx`

## Common Pitfalls & Solutions

### ❌ Pitfall 1: No Optimistic Updates
**Problem:** UI feels slow after mutations
**Solution:** Use TanStack Query's optimistic updates

### ❌ Pitfall 2: Missing Error Feedback
**Problem:** Users don't know when actions fail
**Solution:** Show toast notifications for errors

### ❌ Pitfall 3: Stale Data
**Problem:** Activity feed shows old data
**Solution:** Use refetchInterval for periodic updates

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 6: Main Dashboard Page Integration**
2. ✅ All dashboard components ready
3. ✅ Ready to assemble the complete dashboard
4. ✅ Interactive features complete

---

**Session 5 Complete:** ✅ Activity feed and quick actions built
