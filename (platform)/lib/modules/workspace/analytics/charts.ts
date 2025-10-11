/**
 * Transaction Analytics Chart Data Formatters
 *
 * Formats raw analytics data for chart libraries
 *
 * @module transaction-analytics/charts
 */

import type {
  TransactionAnalytics,
  LoopVelocityData,
  DocumentStats,
  TaskStats,
  SignatureStats,
} from './queries';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

/**
 * Status color mapping for consistent UI
 */
const STATUS_COLORS = {
  // Loop statuses
  DRAFT: '#94a3b8', // slate
  ACTIVE: '#3b82f6', // blue
  UNDER_CONTRACT: '#f59e0b', // amber
  CLOSING: '#8b5cf6', // violet
  CLOSED: '#22c55e', // green
  CANCELLED: '#ef4444', // red
  ARCHIVED: '#64748b', // slate-dark

  // Document statuses
  PENDING: '#f59e0b', // amber
  APPROVED: '#22c55e', // green
  REJECTED: '#ef4444', // red

  // Task statuses
  TODO: '#94a3b8', // slate
  IN_PROGRESS: '#3b82f6', // blue
  DONE: '#22c55e', // green

  // Signature statuses
  COMPLETED: '#22c55e', // green
  DECLINED: '#ef4444', // red
  EXPIRED: '#9ca3af', // gray
} as const;

/**
 * Format document stats for pie/bar chart
 *
 * @param stats - Document statistics by status
 * @returns Formatted chart data points
 */
export function formatDocumentStats(stats: DocumentStats[]): ChartDataPoint[] {
  return stats.map(stat => ({
    label: formatStatusLabel(stat.status),
    value: stat._count,
    color: STATUS_COLORS[stat.status as keyof typeof STATUS_COLORS] || '#94a3b8',
  }));
}

/**
 * Format task stats for pie/bar chart
 *
 * @param stats - Task statistics by status
 * @returns Formatted chart data points
 */
export function formatTaskStats(stats: TaskStats[]): ChartDataPoint[] {
  return stats.map(stat => ({
    label: formatStatusLabel(stat.status),
    value: stat._count,
    color: STATUS_COLORS[stat.status as keyof typeof STATUS_COLORS] || '#94a3b8',
  }));
}

/**
 * Format signature stats for pie/bar chart
 *
 * @param stats - Signature statistics by status
 * @returns Formatted chart data points
 */
export function formatSignatureStats(stats: SignatureStats[]): ChartDataPoint[] {
  return stats.map(stat => ({
    label: formatStatusLabel(stat.status),
    value: stat._count,
    color: STATUS_COLORS[stat.status as keyof typeof STATUS_COLORS] || '#94a3b8',
  }));
}

/**
 * Format loop velocity data for time series chart
 *
 * @param velocity - Monthly loop creation data
 * @returns Formatted time series data
 */
export function formatLoopVelocity(velocity: LoopVelocityData[]): TimeSeriesDataPoint[] {
  return velocity.map(point => ({
    date: formatMonthLabel(point.month),
    value: point.count,
  }));
}

/**
 * Format status by type data for bar chart
 *
 * @param data - Loop counts by status
 * @returns Formatted chart data points
 */
export function formatStatusData(
  data: { status: string; count: number }[]
): ChartDataPoint[] {
  return data.map(item => ({
    label: formatStatusLabel(item.status),
    value: item.count,
    color: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || '#94a3b8',
  }));
}

/**
 * Format type distribution data for pie chart
 *
 * @param data - Loop counts by type
 * @returns Formatted chart data points
 */
export function formatTypeData(
  data: { type: string; count: number }[]
): ChartDataPoint[] {
  const typeColors: Record<string, string> = {
    PURCHASE_AGREEMENT: '#3b82f6', // blue
    LISTING_AGREEMENT: '#22c55e', // green
    LEASE_AGREEMENT: '#f59e0b', // amber
    COMMERCIAL_PURCHASE: '#8b5cf6', // violet
    COMMERCIAL_LEASE: '#ec4899', // pink
  };

  return data.map(item => ({
    label: formatTypeLabel(item.type),
    value: item.count,
    color: typeColors[item.type] || '#94a3b8',
  }));
}

/**
 * Calculate completion rate from analytics
 *
 * @param analytics - Transaction analytics data
 * @returns Completion percentage
 */
export function calculateCompletionRate(analytics: TransactionAnalytics): number {
  const { totalLoops, closedLoops } = analytics.overview;

  if (totalLoops === 0) return 0;

  return Math.round((closedLoops / totalLoops) * 100);
}

/**
 * Calculate task completion rate
 *
 * @param tasks - Task statistics
 * @returns Task completion percentage
 */
export function calculateTaskCompletionRate(tasks: TaskStats[]): number {
  const totalTasks = tasks.reduce((sum, stat) => sum + stat._count, 0);
  const completedTasks = tasks.find(stat => stat.status === 'DONE')?._count || 0;

  if (totalTasks === 0) return 0;

  return Math.round((completedTasks / totalTasks) * 100);
}

/**
 * Calculate signature completion rate
 *
 * @param signatures - Signature statistics
 * @returns Signature completion percentage
 */
export function calculateSignatureCompletionRate(signatures: SignatureStats[]): number {
  const totalSignatures = signatures.reduce((sum, stat) => sum + stat._count, 0);
  const completedSignatures = signatures.find(stat => stat.status === 'COMPLETED')?._count || 0;

  if (totalSignatures === 0) return 0;

  return Math.round((completedSignatures / totalSignatures) * 100);
}

/**
 * Format currency values
 *
 * @param value - Numeric value
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format status labels for display
 *
 * @param status - Raw status string
 * @returns Human-readable status label
 */
function formatStatusLabel(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format type labels for display
 *
 * @param type - Raw type string
 * @returns Human-readable type label
 */
function formatTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PURCHASE_AGREEMENT: 'Purchase Agreement',
    LISTING_AGREEMENT: 'Listing Agreement',
    LEASE_AGREEMENT: 'Lease Agreement',
    COMMERCIAL_PURCHASE: 'Commercial Purchase',
    COMMERCIAL_LEASE: 'Commercial Lease',
  };

  return labels[type] || formatStatusLabel(type);
}

/**
 * Format month labels for charts
 *
 * @param month - YYYY-MM format
 * @returns Formatted month label (e.g., "Jan 2024")
 */
function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-');
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const monthName = monthNames[parseInt(monthNum, 10) - 1];
  return `${monthName} ${year}`;
}
