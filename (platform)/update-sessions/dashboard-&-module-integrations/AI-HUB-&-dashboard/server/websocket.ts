import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { IncomingMessage } from 'http';
import { storage } from './storage';

export interface WorkflowUpdate {
  type: 'workflow_started' | 'workflow_completed' | 'workflow_failed' | 'node_started' | 'node_completed' | 'node_failed' | 'agent_update';
  workflowId?: string;
  executionId?: string;
  nodeId?: string;
  agentId?: string;
  data?: any;
  timestamp: string;
}

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<AuthenticatedWebSocket>> = new Map();

  initialize(server: Server): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      verifyClient: async ({ req }: { req: IncomingMessage }, callback: (result: boolean, code?: number, message?: string) => void) => {
        const userId = await this.authenticateRequest(req);
        if (userId) {
          (req as any).userId = userId;
          callback(true);
        } else {
          callback(false, 401, 'Unauthorized');
        }
      }
    });

    this.wss.on('connection', (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
      const userId = (req as any).userId;
      
      if (!userId) {
        ws.close(1008, 'Unauthorized');
        return;
      }

      ws.userId = userId;
      
      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId)!.add(ws);
      
      console.log(`WebSocket client connected: user ${userId}`);

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log(`WebSocket client disconnected: user ${userId}`);
        const userClients = this.clients.get(userId);
        if (userClients) {
          userClients.delete(ws);
          if (userClients.size === 0) {
            this.clients.delete(userId);
          }
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        const userClients = this.clients.get(userId);
        if (userClients) {
          userClients.delete(ws);
          if (userClients.size === 0) {
            this.clients.delete(userId);
          }
        }
      });

      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to NeuroFlow Hub WebSocket',
        userId,
        timestamp: new Date().toISOString(),
      }));
    });

    console.log('WebSocket server initialized on /ws');
  }

  private async authenticateRequest(req: IncomingMessage): Promise<string | null> {
    try {
      return 'demo-user';
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      return null;
    }
  }

  private handleClientMessage(ws: WebSocket, data: any): void {
    switch (data.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;
      case 'subscribe':
        ws.send(JSON.stringify({ 
          type: 'subscribed', 
          channels: data.channels || [],
          timestamp: new Date().toISOString() 
        }));
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  private broadcastToUser(userId: string, update: WorkflowUpdate): void {
    const message = JSON.stringify(update);
    const userClients = this.clients.get(userId);
    
    if (userClients) {
      userClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  async notifyWorkflowStarted(workflowId: string, executionId: string): Promise<void> {
    const workflow = await storage.getWorkflow(workflowId);
    if (!workflow) return;

    this.broadcastToUser(workflow.userId, {
      type: 'workflow_started',
      workflowId,
      executionId,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyWorkflowCompleted(workflowId: string, executionId: string, result: any): Promise<void> {
    const workflow = await storage.getWorkflow(workflowId);
    if (!workflow) return;

    this.broadcastToUser(workflow.userId, {
      type: 'workflow_completed',
      workflowId,
      executionId,
      data: result,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyWorkflowFailed(workflowId: string, executionId: string, error: string): Promise<void> {
    const workflow = await storage.getWorkflow(workflowId);
    if (!workflow) return;

    this.broadcastToUser(workflow.userId, {
      type: 'workflow_failed',
      workflowId,
      executionId,
      data: { error },
      timestamp: new Date().toISOString(),
    });
  }

  async notifyNodeStarted(workflowId: string, executionId: string, nodeId: string): Promise<void> {
    const workflow = await storage.getWorkflow(workflowId);
    if (!workflow) return;

    this.broadcastToUser(workflow.userId, {
      type: 'node_started',
      workflowId,
      executionId,
      nodeId,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyNodeCompleted(workflowId: string, executionId: string, nodeId: string, result: any): Promise<void> {
    const workflow = await storage.getWorkflow(workflowId);
    if (!workflow) return;

    this.broadcastToUser(workflow.userId, {
      type: 'node_completed',
      workflowId,
      executionId,
      nodeId,
      data: result,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyNodeFailed(workflowId: string, executionId: string, nodeId: string, error: string): Promise<void> {
    const workflow = await storage.getWorkflow(workflowId);
    if (!workflow) return;

    this.broadcastToUser(workflow.userId, {
      type: 'node_failed',
      workflowId,
      executionId,
      nodeId,
      data: { error },
      timestamp: new Date().toISOString(),
    });
  }

  async notifyAgentUpdate(agentId: string, status: string, data?: any): Promise<void> {
    const agent = await storage.getAgent(agentId);
    if (!agent) return;

    this.broadcastToUser(agent.userId, {
      type: 'agent_update',
      agentId,
      data: { status, ...data },
      timestamp: new Date().toISOString(),
    });
  }

  getClientCount(): number {
    let total = 0;
    this.clients.forEach(userClients => {
      total += userClients.size;
    });
    return total;
  }

  getUserClientCount(userId: string): number {
    return this.clients.get(userId)?.size || 0;
  }
}

export const wsService = new WebSocketService();
