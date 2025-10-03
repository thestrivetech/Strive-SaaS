/**
 * Chatbot iframe communication types
 * Extracted from lib/chatbot-iframe-communication.ts for centralized access
 */

/**
 * Message structure for postMessage communication between parent site and chatbot iframe
 */
export interface ChatbotMessage {
  type: 'resize' | 'navigate' | 'analytics' | 'ready' | 'close' | 'minimize' | 'error' | 'ping' | 'visibility' | 'mode';
  data?: {
    // Ready event data
    version?: string;
    mode?: 'widget' | 'full';
    capabilities?: string[];

    // Resize event data
    height?: number;
    width?: number;

    // Navigate event data
    url?: string;
    target?: '_blank' | '_self';

    // Analytics event data
    event?: 'chat_opened' | 'message_sent' | 'chat_closed' | string;
    properties?: Record<string, any>;

    // Error event data
    error?: string;
    code?: string;
    recoverable?: boolean;
    stack?: string;

    // Visibility/Mode control data
    visible?: boolean;

    // General timestamp
    timestamp?: number;
  };
  timestamp: number;
  source?: string;
}

/**
 * Message event types for type narrowing
 */
export type ChatbotMessageType = ChatbotMessage['type'];

/**
 * Chatbot display modes
 */
export type ChatbotMode = 'widget' | 'full' | 'minimized';

/**
 * Chatbot event listener callback
 */
export type ChatbotEventListener = (data: any, event?: MessageEvent) => void;
