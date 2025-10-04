/**
 * Compliance Alert Definitions
 *
 * Types and interfaces for compliance alerts
 *
 * @module compliance/alerts
 */

/**
 * Alert severity levels
 */
export type AlertSeverity = 'info' | 'warning' | 'error';

/**
 * Compliance alert types
 */
export type ComplianceAlertType =
  | 'missing_party'
  | 'missing_document'
  | 'expired_signature'
  | 'overdue_tasks'
  | 'missing_data'
  | 'inactive_party';

/**
 * Compliance alert interface
 */
export interface ComplianceAlert {
  id: string;
  severity: AlertSeverity;
  message: string;
  loopId: string;
  type: ComplianceAlertType;
  details?: Record<string, any>;
}

/**
 * Get alert icon based on type
 *
 * @param type - Alert type
 * @returns Lucide icon name
 */
export function getAlertIcon(type: ComplianceAlertType): string {
  const iconMap: Record<ComplianceAlertType, string> = {
    missing_party: 'user-x',
    missing_document: 'file-x',
    expired_signature: 'clock',
    overdue_tasks: 'alert-triangle',
    missing_data: 'alert-circle',
    inactive_party: 'user-minus',
  };

  return iconMap[type] || 'alert-circle';
}

/**
 * Get alert color based on severity
 *
 * @param severity - Alert severity
 * @returns Tailwind color classes
 */
export function getAlertColor(severity: AlertSeverity): {
  bg: string;
  border: string;
  text: string;
  icon: string;
} {
  const colorMap: Record<
    AlertSeverity,
    { bg: string; border: string; text: string; icon: string }
  > = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      icon: 'text-red-600',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      icon: 'text-amber-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600',
    },
  };

  return colorMap[severity];
}

/**
 * Get alert priority score (for sorting)
 *
 * @param alert - Compliance alert
 * @returns Priority score (higher = more urgent)
 */
export function getAlertPriority(alert: ComplianceAlert): number {
  const severityScore: Record<AlertSeverity, number> = {
    error: 100,
    warning: 50,
    info: 10,
  };

  const typeScore: Record<ComplianceAlertType, number> = {
    expired_signature: 10,
    overdue_tasks: 8,
    missing_document: 7,
    missing_party: 6,
    missing_data: 4,
    inactive_party: 2,
  };

  return severityScore[alert.severity] + typeScore[alert.type];
}

/**
 * Sort alerts by priority
 *
 * @param alerts - Array of compliance alerts
 * @returns Sorted array (highest priority first)
 */
export function sortAlertsByPriority(alerts: ComplianceAlert[]): ComplianceAlert[] {
  return [...alerts].sort((a, b) => getAlertPriority(b) - getAlertPriority(a));
}

/**
 * Group alerts by severity
 *
 * @param alerts - Array of compliance alerts
 * @returns Alerts grouped by severity
 */
export function groupAlertsBySeverity(alerts: ComplianceAlert[]): Record<AlertSeverity, ComplianceAlert[]> {
  return {
    error: alerts.filter(a => a.severity === 'error'),
    warning: alerts.filter(a => a.severity === 'warning'),
    info: alerts.filter(a => a.severity === 'info'),
  };
}

/**
 * Group alerts by type
 *
 * @param alerts - Array of compliance alerts
 * @returns Alerts grouped by type
 */
export function groupAlertsByType(alerts: ComplianceAlert[]): Record<ComplianceAlertType, ComplianceAlert[]> {
  const grouped: Partial<Record<ComplianceAlertType, ComplianceAlert[]>> = {};

  alerts.forEach(alert => {
    if (!grouped[alert.type]) {
      grouped[alert.type] = [];
    }
    grouped[alert.type]!.push(alert);
  });

  return grouped as Record<ComplianceAlertType, ComplianceAlert[]>;
}

/**
 * Filter alerts by severity
 *
 * @param alerts - Array of compliance alerts
 * @param severity - Severity to filter by
 * @returns Filtered alerts
 */
export function filterAlertsBySeverity(
  alerts: ComplianceAlert[],
  severity: AlertSeverity
): ComplianceAlert[] {
  return alerts.filter(a => a.severity === severity);
}

/**
 * Filter alerts by type
 *
 * @param alerts - Array of compliance alerts
 * @param type - Type to filter by
 * @returns Filtered alerts
 */
export function filterAlertsByType(
  alerts: ComplianceAlert[],
  type: ComplianceAlertType
): ComplianceAlert[] {
  return alerts.filter(a => a.type === type);
}

/**
 * Get alert action text
 *
 * @param alert - Compliance alert
 * @returns Recommended action text
 */
export function getAlertAction(alert: ComplianceAlert): string {
  const actionMap: Record<ComplianceAlertType, string> = {
    missing_party: 'Add required party',
    missing_document: 'Upload required document',
    expired_signature: 'Resend signature request',
    overdue_tasks: 'Complete overdue tasks',
    missing_data: 'Add missing information',
    inactive_party: 'Review party status',
  };

  return actionMap[alert.type] || 'Review and fix';
}
