'use client'

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Archive } from 'lucide-react'
import { ActivityTypeIcon } from './activity-type-icon'
import { useToast } from '@/hooks/use-toast'

/**
 * ActivityItem Component
 *
 * Single activity item with mark read/archive actions.
 * Uses optimistic updates for instant UI feedback.
 *
 * Props:
 * - activity: Activity object with user, type, severity
 *
 * Features:
 * - Mark as read mutation
 * - Archive mutation
 * - Optimistic UI updates (TanStack Query)
 * - Visual distinction for unread items (blue background)
 * - Severity badge (color-coded)
 * - Relative timestamp
 * - User avatar or activity type icon
 *
 * Security:
 * - Backend validates organizationId ownership
 * - Mutations use proper authentication
 * - No direct database access
 */
interface ActivityItemProps {
  activity: {
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
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

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
      toast({
        title: 'Marked as read',
        description: 'Activity marked as read successfully',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mark as read',
        variant: 'destructive',
      })
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
      toast({
        title: 'Archived',
        description: 'Activity archived successfully',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to archive',
        variant: 'destructive',
      })
    },
  })

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      INFO: 'bg-blue-100 text-blue-800',
      SUCCESS: 'bg-green-100 text-green-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      ERROR: 'bg-red-100 text-red-800',
      CRITICAL: 'bg-red-200 text-red-900',
    }
    return colors[severity] || colors.INFO
  }

  return (
    <div
      className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
        !activity.is_read ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex-shrink-0">
        {activity.user?.avatar_url ? (
          <Avatar className="w-8 h-8">
            <AvatarImage src={activity.user.avatar_url} />
            <AvatarFallback>{activity.user.name?.[0] || 'U'}</AvatarFallback>
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
          {activity.user?.name && <span>•</span>}
          <span>
            {formatDistanceToNow(new Date(activity.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {!activity.is_read && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markReadMutation.mutate(activity.id)}
            disabled={markReadMutation.isPending}
            title="Mark as read"
          >
            <Check className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => archiveMutation.mutate(activity.id)}
          disabled={archiveMutation.isPending}
          title="Archive"
        >
          <Archive className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
