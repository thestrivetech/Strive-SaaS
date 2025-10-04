import type { AIAgent } from '@shared/schema';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface ToolResult {
  name: string;
  result: any;
  error?: string;
}

export const AVAILABLE_TOOLS: ToolDefinition[] = [
  {
    name: 'get_current_time',
    description: 'Get the current date and time',
    parameters: {
      type: 'object',
      properties: {
        timezone: {
          type: 'string',
          description: 'The timezone (optional, defaults to UTC)',
        },
      },
    },
  },
  {
    name: 'search_knowledge_base',
    description: 'Search through a knowledge base or documentation',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (optional, default 5)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'calculate',
    description: 'Perform basic mathematical calculations (addition, subtraction, multiplication, division)',
    parameters: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['add', 'subtract', 'multiply', 'divide', 'power'],
          description: 'The mathematical operation to perform',
        },
        a: {
          type: 'number',
          description: 'First operand',
        },
        b: {
          type: 'number',
          description: 'Second operand',
        },
      },
      required: ['operation', 'a', 'b'],
    },
  },
  {
    name: 'send_notification',
    description: 'Send a notification to the user',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The notification message',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'The notification priority',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'fetch_data',
    description: 'Fetch data from an external API or database',
    parameters: {
      type: 'object',
      properties: {
        source: {
          type: 'string',
          description: 'The data source (e.g., "users", "products", "orders")',
        },
        filters: {
          type: 'object',
          description: 'Optional filters to apply',
        },
      },
      required: ['source'],
    },
  },
];

export class ToolExecutor {
  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    try {
      switch (toolCall.name) {
        case 'get_current_time':
          return await this.getCurrentTime(toolCall.arguments);
        case 'search_knowledge_base':
          return await this.searchKnowledgeBase(toolCall.arguments);
        case 'calculate':
          return await this.calculate(toolCall.arguments);
        case 'send_notification':
          return await this.sendNotification(toolCall.arguments);
        case 'fetch_data':
          return await this.fetchData(toolCall.arguments);
        default:
          return {
            name: toolCall.name,
            result: null,
            error: `Unknown tool: ${toolCall.name}`,
          };
      }
    } catch (error: any) {
      return {
        name: toolCall.name,
        result: null,
        error: error.message,
      };
    }
  }

  private async getCurrentTime(args: any): Promise<ToolResult> {
    const timezone = args.timezone || 'UTC';
    const now = new Date();
    
    return {
      name: 'get_current_time',
      result: {
        timestamp: now.toISOString(),
        timezone,
        formatted: now.toLocaleString('en-US', { timeZone: timezone }),
        note: 'Production-ready - uses Node.js Date API',
      },
    };
  }

  private async searchKnowledgeBase(args: any): Promise<ToolResult> {
    const query = args.query;
    const limit = args.limit || 5;
    
    const simulatedResults = [
      {
        id: '1',
        title: 'Getting Started with NeuroFlow Hub',
        content: 'Learn how to create your first AI workflow...',
        relevance: 0.95,
      },
      {
        id: '2',
        title: 'AI Agent Configuration',
        content: 'Configure your AI agents with custom personalities...',
        relevance: 0.89,
      },
      {
        id: '3',
        title: 'Integration Guide',
        content: 'Connect external services to your workflows...',
        relevance: 0.76,
      },
    ].slice(0, limit);
    
    return {
      name: 'search_knowledge_base',
      result: {
        query,
        results: simulatedResults,
        total: simulatedResults.length,
        note: 'Demo data - production requires vector database integration',
      },
    };
  }

  private async calculate(args: any): Promise<ToolResult> {
    const { operation, a, b } = args;
    
    let result: number;
    
    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          return {
            name: 'calculate',
            result: null,
            error: 'Division by zero is not allowed',
          };
        }
        result = a / b;
        break;
      case 'power':
        result = Math.pow(a, b);
        break;
      default:
        return {
          name: 'calculate',
          result: null,
          error: `Unknown operation: ${operation}`,
        };
    }
    
    return {
      name: 'calculate',
      result: {
        operation,
        a,
        b,
        result,
      },
    };
  }

  private async sendNotification(args: any): Promise<ToolResult> {
    const message = args.message;
    const priority = args.priority || 'medium';
    
    console.log(`[NOTIFICATION] ${priority.toUpperCase()}: ${message}`);
    
    return {
      name: 'send_notification',
      result: {
        status: 'logged',
        message,
        priority,
        timestamp: new Date().toISOString(),
        note: 'Demo mode - production requires real notification service integration',
      },
    };
  }

  private async fetchData(args: any): Promise<ToolResult> {
    const source = args.source;
    const filters = args.filters || {};
    
    const simulatedData: Record<string, any[]> = {
      users: [
        { id: '1', name: 'Alice Johnson', role: 'admin' },
        { id: '2', name: 'Bob Smith', role: 'user' },
        { id: '3', name: 'Charlie Brown', role: 'user' },
      ],
      products: [
        { id: '1', name: 'AI Workflow Pro', price: 99.99, category: 'software' },
        { id: '2', name: 'Data Connector', price: 49.99, category: 'tools' },
      ],
      orders: [
        { id: '1', userId: '1', productId: '1', status: 'completed', total: 99.99 },
        { id: '2', userId: '2', productId: '2', status: 'pending', total: 49.99 },
      ],
    };
    
    const data = simulatedData[source] || [];
    
    return {
      name: 'fetch_data',
      result: {
        source,
        filters,
        data,
        count: data.length,
        note: 'Demo data - production requires real database/API integration',
      },
    };
  }
}

export function getAgentTools(agent: AIAgent): ToolDefinition[] {
  const tools = [...AVAILABLE_TOOLS];
  
  if (agent.capabilities && agent.capabilities.length > 0) {
    const enabledToolNames = agent.capabilities;
    return tools.filter(tool => enabledToolNames.includes(tool.name));
  }
  
  return tools;
}
