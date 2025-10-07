'use client'

import React from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuickActionButton } from './quick-action-button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

/**
 * QuickActionsGrid Component
 *
 * Grid of quick action buttons for common tasks.
 * Actions can navigate to pages or execute API calls.
 *
 * Features:
 * - TanStack Query for data fetching
 * - Action execution (NAVIGATION or API_CALL)
 * - Usage tracking (backend increments usage_count)
 * - Loading skeleton
 * - Error handling with toast
 * - Responsive grid (2 cols mobile, 4 cols tablet, 6 cols desktop)
 *
 * Security:
 * - Backend filters actions by user role & tier
 * - Backend validates action access on execution
 * - organizationId enforced in queries
 */
interface QuickAction {
  id: string
  name: string
  description?: string | null
  icon: string
  action_type: string
  target_url?: string | null
  color: string
}

export function QuickActionsGrid() {
  const router = useRouter()
  const { toast } = useToast()

  const { data, isLoading, error } = useQuery({
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
    onSuccess: (data) => {
      toast({
        title: 'Action executed',
        description: 'Quick action completed successfully',
      })

      // If action returns a redirect URL, navigate to it
      if (data.result?.targetUrl) {
        router.push(data.result.targetUrl)
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to execute action',
        variant: 'destructive',
      })
    },
  })

  const handleActionClick = (action: QuickAction) => {
    if (action.action_type === 'NAVIGATION' && action.target_url) {
      // Direct navigation
      router.push(action.target_url)
    } else if (action.action_type === 'API_CALL') {
      // Execute API action
      executeActionMutation.mutate(action.id)
    } else {
      toast({
        title: 'Invalid action',
        description: 'This action type is not supported',
        variant: 'destructive',
      })
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

  if (error) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Failed to load quick actions</p>
            <p className="text-sm text-red-600 mt-1">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const actions: QuickAction[] = data?.actions || []

  if (actions.length === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-gray-600">No quick actions available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {actions.map((action) => (
            <QuickActionButton
              key={action.id}
              action={{
                id: action.id,
                name: action.name,
                icon: action.icon,
                color: action.color,
              }}
              onClick={() => handleActionClick(action)}
              isLoading={executeActionMutation.isPending}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
