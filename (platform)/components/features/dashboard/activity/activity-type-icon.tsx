import React from 'react'

/**
 * ActivityTypeIcon Component
 *
 * Maps activity type to appropriate icon.
 * Used within activity feed items to provide visual context.
 *
 * Props:
 * - type: Activity type from DashboardActivityType enum
 *
 * Features:
 * - Type-specific icon mapping
 * - Fallback for unknown types
 * - Lightweight, no dependencies
 *
 * Security:
 * - Pure presentation component
 * - No data access
 */
const icons: Record<string, string> = {
  USER_ACTION: '👤',
  SYSTEM_EVENT: '⚙️',
  WORKFLOW_UPDATE: '🔄',
  DATA_CHANGE: '📊',
  SECURITY_EVENT: '🔒',
  INTEGRATION_EVENT: '🔗',
}

export function ActivityTypeIcon({ type }: { type: string }) {
  return <span>{icons[type] || '📝'}</span>
}
