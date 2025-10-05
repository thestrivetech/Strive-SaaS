import { useEffect, useRef, useState, useCallback } from 'react';

export interface WorkflowUpdate {
  type: 'workflow_started' | 'workflow_completed' | 'workflow_failed' | 'node_started' | 'node_completed' | 'node_failed' | 'agent_update' | 'connected' | 'subscribed' | 'pong';
  workflowId?: string;
  executionId?: string;
  nodeId?: string;
  agentId?: string;
  data?: any;
  timestamp: string;
  message?: string;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<WorkflowUpdate | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listenersRef = useRef<Map<string, Set<(update: WorkflowUpdate) => void>>>(new Map());

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const update: WorkflowUpdate = JSON.parse(event.data);
          setLastUpdate(update);
          
          const typeListeners = listenersRef.current.get(update.type);
          if (typeListeners) {
            typeListeners.forEach(callback => callback(update));
          }
          
          const allListeners = listenersRef.current.get('*');
          if (allListeners) {
            allListeners.forEach(callback => callback(update));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const subscribe = useCallback((eventType: string, callback: (update: WorkflowUpdate) => void) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    
    listenersRef.current.get(eventType)!.add(callback);
    
    return () => {
      const listeners = listenersRef.current.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          listenersRef.current.delete(eventType);
        }
      }
    };
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastUpdate,
    subscribe,
    send,
    connect,
    disconnect,
  };
}
