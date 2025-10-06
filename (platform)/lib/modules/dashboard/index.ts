// Metrics
export {
  createDashboardMetric,
  updateDashboardMetric,
  deleteDashboardMetric,
} from './metrics/actions';
export {
  getDashboardMetrics,
  getMetricById,
  getMetricsByCategory,
} from './metrics/queries';
export { calculateMetrics } from './metrics/calculator';
export { DashboardMetricSchema } from './metrics/schemas';

// Widgets
export {
  createDashboardWidget,
  updateDashboardWidget,
  deleteDashboardWidget,
} from './widgets/actions';
export {
  getDashboardWidgets,
  getWidgetById,
  getWidgetsByType,
} from './widgets/queries';
export { DashboardWidgetSchema } from './widgets/schemas';

// Activities
export {
  recordActivity,
  markActivityAsRead,
  archiveActivity,
} from './activities/actions';
export {
  getRecentActivities,
  getActivitiesByType,
  getActivitiesByEntity,
} from './activities/queries';
export { ActivityFeedSchema } from './activities/schemas';

// Quick Actions
export {
  createQuickAction,
  updateQuickAction,
  deleteQuickAction,
  executeQuickAction,
} from './quick-actions/actions';
export {
  getQuickActions,
  getQuickActionById,
} from './quick-actions/queries';
export { QuickActionSchema } from './quick-actions/schemas';

// Types
export type { DashboardMetricInput } from './metrics/schemas';
export type { DashboardWidgetInput } from './widgets/schemas';
export type { ActivityFeedInput } from './activities/schemas';
export type { QuickActionInput } from './quick-actions/schemas';
