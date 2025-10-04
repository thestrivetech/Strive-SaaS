/**
 * Compliance Module
 *
 * Public API for compliance checking and alerts
 *
 * Features:
 * - Automated compliance checking for transaction loops
 * - Alert generation for missing requirements
 * - Severity-based alerting (error, warning, info)
 * - Organization-wide compliance tracking
 *
 * All queries automatically filtered by organization via withTenantContext
 *
 * @example
 * ```typescript
 * import { checkLoopCompliance, getOrganizationCompliance } from '@/lib/modules/compliance';
 *
 * const alerts = await checkLoopCompliance(loopId);
 * const orgAlerts = await getOrganizationCompliance();
 * ```
 */

// Checker functions
export {
  checkLoopCompliance,
  getOrganizationCompliance,
  getComplianceStats,
} from './checker';

// Alert types and utilities
export type {
  ComplianceAlert,
  ComplianceAlertType,
  AlertSeverity,
} from './alerts';

export {
  getAlertIcon,
  getAlertColor,
  getAlertPriority,
  sortAlertsByPriority,
  groupAlertsBySeverity,
  groupAlertsByType,
  filterAlertsBySeverity,
  filterAlertsByType,
  getAlertAction,
} from './alerts';
