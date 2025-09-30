import { createClient } from '@supabase/supabase-js';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload<T = any> {
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
  subscribeToTaskUpdates(projectId: string, callback: (payload: RealtimePayload) => void) {
    const channel = this.supabase
      .channel(`project:${projectId}:tasks`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Task',
          filter: `projectId=eq.${projectId}`,
        },
        (payload: any) => {
          callback({
            eventType: payload.eventType as RealtimeEvent,
            new: payload.new,
            old: payload.old,
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
  subscribeToCustomerUpdates(organizationId: string, callback: (payload: RealtimePayload) => void) {
    const channel = this.supabase
      .channel(`org:${organizationId}:customers`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Customer',
          filter: `organizationId=eq.${organizationId}`,
        },
        (payload: any) => {
          callback({
            eventType: payload.eventType as RealtimeEvent,
            new: payload.new,
            old: payload.old,
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
  subscribeToProjectUpdates(organizationId: string, callback: (payload: RealtimePayload) => void) {
    const channel = this.supabase
      .channel(`org:${organizationId}:projects`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Project',
          filter: `organizationId=eq.${organizationId}`,
        },
        (payload: any) => {
          callback({
            eventType: payload.eventType as RealtimeEvent,
            new: payload.new,
            old: payload.old,
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
  subscribeToNotificationUpdates(userId: string, callback: (payload: RealtimePayload) => void) {
    const channel = this.supabase
      .channel(`user:${userId}:notifications`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Notification',
          filter: `userId=eq.${userId}`,
        },
        (payload: any) => {
          callback({
            eventType: payload.eventType as RealtimeEvent,
            new: payload.new,
            old: payload.old,
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }
}