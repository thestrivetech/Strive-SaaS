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

/**
 * ActivityFilters Component
 *
 * Dropdown filter for activity feed.
 * Allows users to filter activities by type.
 *
 * Props:
 * - currentFilter: Currently selected filter (null = all)
 * - onFilterChange: Callback when filter changes
 *
 * Features:
 * - Dropdown menu with activity types
 * - Shows current filter label
 * - "All Activities" default option
 * - Clean UI with icon
 *
 * Security:
 * - Client-side filter only (backend validates in queries)
 * - No data access
 */
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
