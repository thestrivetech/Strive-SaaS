/**
 * Analytics and tracking types
 */

export interface GTagEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

export {};
