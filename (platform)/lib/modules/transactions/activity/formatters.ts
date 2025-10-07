/**
 * Transaction Activity Formatters
 *
 * Formats audit log data into human-readable activity descriptions
 *
 * @module transaction-activity/formatters
 */

import type { Activity } from './types';

/**
 * Format activity into human-readable description
 *
 * @param activity - Activity object from audit log
 * @returns Formatted description string
 */
export function formatActivityDescription(activity: Activity): string {
  const userName = activity.user.name || activity.user.email;
  const { action, entityType } = activity;

  // Format based on entity type and action
  const handlers: Record<string, (activity: Activity, userName: string) => string> = {
    loop: formatLoopActivity,
    document: formatDocumentActivity,
    party: formatPartyActivity,
    task: formatTaskActivity,
    signature: formatSignatureActivity,
    workflow: formatWorkflowActivity,
  };

  const handler = handlers[entityType];
  if (handler) {
    return handler(activity, userName);
  }

  // Fallback for unknown types
  return `${userName} ${action} ${entityType}`;
}

/**
 * Format loop activity
 */
function formatLoopActivity(activity: Activity, userName: string): string {
  const { action, newValues } = activity;

  switch (action) {
    case 'created':
      return `${userName} created a new transaction loop`;
    case 'updated':
      return formatLoopUpdate(activity, userName);
    case 'deleted':
      return `${userName} deleted the transaction loop`;
    case 'status_changed':
      return `${userName} changed loop status to ${formatStatus(newValues?.status)}`;
    case 'progress_updated':
      return `${userName} updated loop progress to ${newValues?.progress}%`;
    default:
      return `${userName} ${action} the transaction loop`;
  }
}

/**
 * Format document activity
 */
function formatDocumentActivity(activity: Activity, userName: string): string {
  const { action, newValues } = activity;

  switch (action) {
    case 'created':
    case 'uploaded':
      return `${userName} uploaded document "${newValues?.filename || 'document'}"`;
    case 'updated':
      return `${userName} updated document "${newValues?.filename || 'document'}"`;
    case 'deleted':
      return `${userName} deleted a document`;
    case 'status_changed':
      return `${userName} changed document status to ${formatStatus(newValues?.status)}`;
    case 'version_created':
      return `${userName} created version ${newValues?.version} of document`;
    default:
      return `${userName} ${action} a document`;
  }
}

/**
 * Format party activity
 */
function formatPartyActivity(activity: Activity, userName: string): string {
  const { action, newValues } = activity;

  switch (action) {
    case 'created':
    case 'invited':
      return `${userName} invited ${newValues?.name || 'a party'} as ${formatRole(newValues?.role)}`;
    case 'updated':
      return `${userName} updated party ${newValues?.name || 'information'}`;
    case 'removed':
      return `${userName} removed a party from the transaction`;
    case 'status_changed':
      return `${userName} changed party status to ${formatStatus(newValues?.status)}`;
    default:
      return `${userName} ${action} a party`;
  }
}

/**
 * Format task activity
 */
function formatTaskActivity(activity: Activity, userName: string): string {
  const { action, newValues } = activity;

  switch (action) {
    case 'created':
      return `${userName} created task "${newValues?.title || 'task'}"`;
    case 'updated':
      return `${userName} updated task "${newValues?.title || 'task'}"`;
    case 'completed':
      return `${userName} completed task "${newValues?.title || 'task'}"`;
    case 'deleted':
      return `${userName} deleted a task`;
    case 'assigned':
      return `${userName} assigned a task to ${newValues?.assignee || 'someone'}`;
    case 'status_changed':
      return `${userName} changed task status to ${formatStatus(newValues?.status)}`;
    default:
      return `${userName} ${action} a task`;
  }
}

/**
 * Format signature activity
 */
function formatSignatureActivity(activity: Activity, userName: string): string {
  const { action, newValues } = activity;

  switch (action) {
    case 'created':
    case 'requested':
      return `${userName} requested signature for "${newValues?.title || 'document'}"`;
    case 'signed':
      return `${userName} signed "${newValues?.title || 'document'}"`;
    case 'declined':
      return `${userName} declined to sign "${newValues?.title || 'document'}"`;
    case 'completed':
      return `${userName} completed signature request "${newValues?.title || 'document'}"`;
    case 'expired':
      return `Signature request "${newValues?.title || 'document'}" expired`;
    case 'reminded':
      return `${userName} sent a reminder for signature request`;
    default:
      return `${userName} ${action} a signature request`;
  }
}

/**
 * Format workflow activity
 */
function formatWorkflowActivity(activity: Activity, userName: string): string {
  const { action, newValues } = activity;

  switch (action) {
    case 'created':
      return `${userName} created workflow "${newValues?.name || 'workflow'}"`;
    case 'applied':
      return `${userName} applied workflow template to the loop`;
    case 'updated':
      return `${userName} updated workflow`;
    case 'completed':
      return `${userName} completed workflow`;
    default:
      return `${userName} ${action} a workflow`;
  }
}

/**
 * Format loop update details
 */
function formatLoopUpdate(activity: Activity, userName: string): string {
  const { oldValues, newValues } = activity;

  if (!oldValues || !newValues) {
    return `${userName} updated the transaction loop`;
  }

  const changes: string[] = [];

  if (oldValues.status !== newValues.status) {
    changes.push(`status to ${formatStatus(newValues.status)}`);
  }

  if (oldValues.listing_price !== newValues.listing_price) {
    changes.push(`listing price to ${formatCurrency(newValues.listing_price)}`);
  }

  if (oldValues.expected_closing !== newValues.expected_closing) {
    changes.push(`expected closing date`);
  }

  if (changes.length > 0) {
    return `${userName} updated ${changes.join(', ')}`;
  }

  return `${userName} updated the transaction loop`;
}

/**
 * Format status for display
 */
function formatStatus(status: string): string {
  if (!status) return 'unknown';

  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format role for display
 */
function formatRole(role: string): string {
  if (!role) return 'participant';

  const roleLabels: Record<string, string> = {
    BUYER: 'Buyer',
    SELLER: 'Seller',
    LISTING_AGENT: 'Listing Agent',
    BUYER_AGENT: 'Buyer Agent',
    TRANSACTION_COORDINATOR: 'Transaction Coordinator',
    ESCROW_OFFICER: 'Escrow Officer',
    LENDER: 'Lender',
    TITLE_COMPANY: 'Title Company',
    INSPECTOR: 'Inspector',
    APPRAISER: 'Appraiser',
    ATTORNEY: 'Attorney',
  };

  return roleLabels[role] || formatStatus(role);
}

/**
 * Format currency for display
 */
function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}

/**
 * Get activity icon based on entity type and action
 *
 * @param activity - Activity object
 * @returns Icon name (Lucide icon name)
 */
export function getActivityIcon(activity: Activity): string {
  const { entityType, action } = activity;

  // Entity-specific icons
  const entityIcons: Record<string, Record<string, string>> = {
    loop: {
      created: 'plus-circle',
      updated: 'edit',
      deleted: 'trash-2',
      status_changed: 'refresh-cw',
      default: 'folder',
    },
    document: {
      created: 'file-plus',
      uploaded: 'upload',
      updated: 'file-edit',
      deleted: 'file-x',
      version_created: 'git-branch',
      default: 'file-text',
    },
    party: {
      created: 'user-plus',
      invited: 'user-plus',
      updated: 'user-check',
      removed: 'user-minus',
      default: 'users',
    },
    task: {
      created: 'check-square',
      completed: 'check-circle-2',
      updated: 'edit',
      deleted: 'x-square',
      assigned: 'user-check',
      default: 'list-todo',
    },
    signature: {
      created: 'pen-tool',
      requested: 'send',
      signed: 'check-circle',
      declined: 'x-circle',
      expired: 'clock',
      default: 'pen-tool',
    },
    workflow: {
      created: 'git-branch',
      applied: 'play',
      completed: 'check-circle',
      default: 'workflow',
    },
  };

  const icons = entityIcons[entityType];
  if (icons) {
    return icons[action] || icons.default;
  }

  return 'activity';
}

/**
 * Get activity color based on action
 *
 * @param activity - Activity object
 * @returns Color class (Tailwind color)
 */
export function getActivityColor(activity: Activity): string {
  const { action } = activity;

  const colorMap: Record<string, string> = {
    created: 'text-green-600',
    updated: 'text-blue-600',
    deleted: 'text-red-600',
    completed: 'text-green-600',
    signed: 'text-green-600',
    declined: 'text-red-600',
    expired: 'text-gray-600',
    reminded: 'text-amber-600',
    assigned: 'text-blue-600',
    invited: 'text-green-600',
    removed: 'text-red-600',
  };

  return colorMap[action] || 'text-gray-700';
}
