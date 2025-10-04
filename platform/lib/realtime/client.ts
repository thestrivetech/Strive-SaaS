import { createClient, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload<T = Record<string, unknown>> {
  eventType: RealtimeEvent;
  new: T;
  old: T;
}

export class RealtimeClient {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Subscribe to task updates for a specific project
   */
  subscribeToTaskUpdates<T = Record<string, unknown>>(projectId: string, callback: (payload: RealtimePayload<T>) => void) {
    const channel = this.supabase
      .channel(`project:${projectId}:tasks`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          callback({
            eventType: payload.eventType as RealtimeEvent,
            new: payload.new as T,
            old: payload.old as T,
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  /**
   * Subscribe to customer updates for an organization
   */
  subscribeToCustomerUpdates<T = Record<string, unknown>>(organizationId: string, callback: (payload: RealtimePayload<T>) => void) {
    const channel = this.supabase
      .channel(`org:${organizationId}:customers`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          callback({
            eventType: payload.eventType as RealtimeEvent,
            new: payload.new as T,
            old: payload.old as T,
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  /**
   * Subscribe to project updates for an organization
   */
  subscribeToProjectUpdates<T = Record<string, unknown>>(organizationId: string, callback: (payload: RealtimePayload<T>) => void) {
    const channel = this.supabase
      .channel(`org:${organizationId}:projects`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          callback({
            eventType: payload.eventType as RealtimeEvent,
            new: payload.new as T,
            old: payload.old as T,
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  /**
   * Subscribe to notification updates for a user
   */
  subscribeToNotificationUpdates<T = Record<string, unknown>>(userId: string, callback: (payload: RealtimePayload<T>) => void) {
    const channel = this.supabase
      .channel(`user:${userId}:notifications`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          callback({
            eventType: payload.eventType as RealtimeEvent,
            new: payload.new as T,
            old: payload.old as T,
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }
}