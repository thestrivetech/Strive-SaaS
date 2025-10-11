/**
 * Transaction Activity Types
 *
 * Shared types for transaction activity module
 * Safe for client-side import (no server dependencies)
 *
 * @module transaction-activity/types
 */

export interface ActivityFeedParams {
  loopId?: string;
  limit?: number;
  offset?: number;
}

export interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  };
  timestamp: Date;
  description: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}
