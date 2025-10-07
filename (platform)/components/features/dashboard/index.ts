/**
 * Dashboard Components - Public API
 *
 * Centralized exports for all dashboard components.
 * Import from this file for cleaner imports.
 *
 * Usage:
 * import { KPICards, ChartWidget, DashboardHeader } from '@/components/features/dashboard'
 */

// Metrics
export { KPICards } from './metrics/kpi-cards'
export { KPICard } from './metrics/kpi-card'
export { MetricStatusBadge } from './metrics/metric-status-badge'

// Widgets
export { ChartWidget } from './widgets/chart-widget'
export { ProgressWidget } from './widgets/progress-widget'

// Shared
export { DashboardLoadingSkeleton } from './shared/loading-skeleton'
export { EmptyState } from './shared/empty-state'

// Header
export { DashboardHeader } from './header/dashboard-header'

// Activity Feed
export { ActivityFeed } from './activity/activity-feed'
export { ActivityItem } from './activity/activity-item'
export { ActivityFilters } from './activity/activity-filters'
export { ActivityTypeIcon } from './activity/activity-type-icon'

// Quick Actions
export { QuickActionsGrid } from './quick-actions/quick-actions-grid'
export { QuickActionButton } from './quick-actions/quick-action-button'

// Module Shortcuts
export { ModuleShortcuts } from './shortcuts/module-shortcuts'
export { ModuleShortcutCard } from './shortcuts/module-shortcut-card'
