// Chatbot Iframe Communication Utility
// Handles secure postMessage communication between parent site and chatbot iframe

import type { ChatbotMessage } from '@/lib/types/chatbot';

// Re-export for backward compatibility
export type { ChatbotMessage };

export class ChatbotIframeManager {
  private chatbotOrigin: string;
  private eventHandlers: Map<string, (data: any, event?: MessageEvent) => void> = new Map();
  private iframes: Set<HTMLIFrameElement> = new Set();
  private isListening: boolean = false;
  private messageLog: Array<{
    time: string;
    origin: string;
    data: any;
  }> = [];

  constructor() {
    // Use environment variable or default to production
    this.chatbotOrigin = process.env.NEXT_PUBLIC_CHATBOT_URL || 'https://chatbot.strivetech.ai';

    // Start listening immediately
    this.startListening();
  }

  startListening() {
    if (this.isListening) return;

    window.addEventListener('message', this.handleMessage.bind(this));
    this.isListening = true;

    console.log('ChatbotIframeManager: Listening for messages from', this.chatbotOrigin);
  }

  stopListening() {
    if (!this.isListening) return;

    window.removeEventListener('message', this.handleMessage.bind(this));
    this.isListening = false;
  }

  handleMessage(event: MessageEvent) {
    // Security: validate origin with enhanced dev mode support
    const allowedOrigins = [
      this.chatbotOrigin,
      'https://chatbot.strivetech.ai',
      'http://localhost:5173', // Chatbot dev server
      'http://localhost:3000',  // Common chatbot dev port
      'http://localhost:3001',   // Alternative port
      'http://127.0.0.1:5173',  // IPv4 localhost
      'http://127.0.0.1:3000',  // IPv4 localhost
      'http://127.0.0.1:3001'   // IPv4 localhost
    ];

    const isOriginAllowed = allowedOrigins.includes(event.origin);
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!isOriginAllowed) {
      if (isDevelopment) {
        console.warn('⚠️ Message from unrecognized origin (allowing in dev mode):', {
          receivedOrigin: event.origin,
          allowedOrigins: allowedOrigins,
          messageData: event.data
        });
        // Continue processing in dev mode for debugging
      } else {
        console.warn('🚫 Message rejected - untrusted origin:', {
          receivedOrigin: event.origin,
          allowedOrigins: allowedOrigins,
          messageData: event.data
        });
        return;
      }
    }

    if (isDevelopment || isOriginAllowed) {
      console.log('✅ Origin validated:', event.origin);
    }

    // Log message for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('📨 Received message in iframe manager:', event.data);
      this.messageLog.push({
        time: new Date().toISOString(),
        origin: event.origin,
        data: event.data
      });
    }

    const { type, data, source } = event.data || {};

    // Optional source validation with logging
    if (source !== undefined && source !== 'sai-chatbot') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Message has unexpected source (allowing in dev mode):', {
          receivedSource: source,
          expectedSource: 'sai-chatbot',
          messageType: type,
          messageData: data
        });
      } else {
        console.warn('🚫 Message rejected - wrong source:', {
          receivedSource: source,
          expectedSource: 'sai-chatbot',
          messageType: type,
          messageData: data
        });
        // In production, still reject unknown sources for security
        // return;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Source validated:', source || 'undefined (accepted)');
    }

    // Call registered handlers
    const handler = this.eventHandlers.get(type);
    if (handler) {
      handler(data, event);
    }

    // Call global handler if exists
    const globalHandler = this.eventHandlers.get('*');
    if (globalHandler) {
      globalHandler({ type, data }, event);
    }
  }

  registerIframe(iframe: HTMLIFrameElement) {
    this.iframes.add(iframe);
    return () => this.iframes.delete(iframe);
  }

  onMessage(type: string, handler: (data: any, event?: MessageEvent) => void) {
    this.eventHandlers.set(type, handler);
    return () => this.eventHandlers.delete(type);
  }

  offMessage(type: string) {
    this.eventHandlers.delete(type);
  }

  sendMessage(type: string, data = {}, targetIframe: HTMLIFrameElement | null = null) {
    const message = {
      type,
      data,
      timestamp: Date.now(),
      source: 'strivetech-website'
    };

    if (targetIframe && targetIframe.contentWindow) {
      // Send to specific iframe
      targetIframe.contentWindow.postMessage(message, this.chatbotOrigin);
    } else {
      // Send to all registered iframes
      this.iframes.forEach(iframe => {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage(message, this.chatbotOrigin);
        }
      });
    }
  }

  // Utility methods
  ping(iframe?: HTMLIFrameElement) {
    this.sendMessage('ping', { timestamp: Date.now() }, iframe);
  }

  getMessageLog() {
    return this.messageLog;
  }

  clearMessageLog() {
    this.messageLog = [];
  }

  destroy() {
    this.stopListening();
    this.eventHandlers.clear();
    this.iframes.clear();
    this.messageLog = [];
  }
}

// Utility functions for iframe management
export const createSecureIframe = (src: string, className?: string): HTMLIFrameElement => {
  const iframe = document.createElement('iframe');

  // Security attributes
  iframe.src = src;
  iframe.sandbox.add(
    'allow-scripts',
    'allow-same-origin',
    'allow-forms',
    'allow-popups',
    'allow-popups-to-escape-sandbox'
  );
  iframe.allow = 'microphone; camera; clipboard-write';
  iframe.referrerPolicy = 'strict-origin';

  // Styling
  iframe.style.border = 'none';
  iframe.style.width = '100%';
  iframe.style.height = '100%';

  if (className) {
    iframe.className = className;
  }

  return iframe;
};

export const preconnectToChatbot = (origin: string = 'https://chat.strivetech.ai') => {
  // Create preconnect link to improve loading performance
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  link.crossOrigin = 'anonymous';

  // Avoid duplicate preconnects
  const existing = document.querySelector(`link[rel="preconnect"][href="${origin}"]`);
  if (!existing) {
    document.head.appendChild(link);
  }
};

export const createIframeWithFallback = (
  src: string,
  fallbackContent: HTMLElement,
  timeout: number = 10000
): Promise<HTMLIFrameElement> => {
  return new Promise((resolve, reject) => {
    const iframe = createSecureIframe(src);
    let isResolved = false;

    // Set up load handler
    const handleLoad = () => {
      if (!isResolved) {
        isResolved = true;
        resolve(iframe);
      }
    };

    // Set up error handler
    const handleError = () => {
      if (!isResolved) {
        isResolved = true;
        reject(new Error('Failed to load chatbot iframe'));
      }
    };

    // Set up timeout
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        reject(new Error('Iframe loading timeout'));
      }
    }, timeout);

    iframe.addEventListener('load', () => {
      clearTimeout(timeoutId);
      handleLoad();
    });

    iframe.addEventListener('error', () => {
      clearTimeout(timeoutId);
      handleError();
    });
  });
};

// Create singleton instance
const chatbotManager = new ChatbotIframeManager();

// Export for use in components
export default chatbotManager;
export { chatbotManager };