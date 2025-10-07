'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityItem } from './activity-item'
import { ActivityFilters } from './activity-filters'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '../shared/empty-state'

/**
 * ActivityFeed Component
 *
 * Main dashboard activity feed with real-time updates.
 * Displays recent activities from the user's organization.
 *
 * Features:
 * - TanStack Query for data fetching
 * - Real-time updates (60s refetch interval)
 * - Type filtering
 * - Load more pagination
 * - Loading skeleton
 * - Error state
 * - Empty state
 *
 * Security:
 * - Backend filters by organizationId automatically
 * - RBAC enforced in API route
 * - No sensitive data exposed
 */
interface Activity {
  id: string
  title: string
  description?: string | null
  type: string
  severity: string
  created_at: string
  is_read: boolean
  user?: {
    id: string
    name: string | null
    email: string
    avatar_url: string | null
  } | null
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
    refetchInterval: 60000, // Refetch every minute for real-time updates
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
            <p className="text-sm text-red-600 mt-1">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activities: Activity[] = data?.activities || []

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
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {activities.length >= limit && (
          <button
            onClick={() => setLimit(limit + 20)}
            className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Load more
          </button>
        )}
      </CardContent>
    </Card>
  )
}
