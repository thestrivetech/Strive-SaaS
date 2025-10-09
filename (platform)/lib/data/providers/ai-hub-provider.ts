/**
 * AI Hub Data Provider
 *
 * Switches between mock data and real Prisma queries
 * Usage: Import from this file instead of directly from Prisma or mocks
 */

import { dataConfig, simulateDelay, maybeThrowError } from '../config';
import {
  generateMockConversation,
  generateMockConversations,
  generateMockMessage,
  generateMockMessages,
  generateMockAutomation,
  generateMockAutomations,
  generateMockInsight,
  generateMockInsights,
  generateMockGeneratedContent,
  generateMockGeneratedContents,
  generateMockAIUsage,
  generateMockAIUsageHistory,
  type MockConversation,
  type MockMessage,
  type MockAutomation,
  type MockInsight,
  type MockGeneratedContent,
  type MockAIUsage,
} from '../mocks/ai-hub';

// ============================================================================
// IN-MEMORY MOCK STORAGE
// ============================================================================

let mockConversationsStore: MockConversation[] = [];
let mockMessagesStore: MockMessage[] = [];
let mockAutomationsStore: MockAutomation[] = [];
let mockInsightsStore: MockInsight[] = [];
let mockGeneratedContentStore: MockGeneratedContent[] = [];
let mockAIUsageStore: MockAIUsage[] = [];

/**
 * Initialize mock data stores
 */
function initializeMockData(orgId: string, userId: string = 'demo-user') {
  if (mockConversationsStore.length === 0) {
    // Generate 30 conversations
    mockConversationsStore = generateMockConversations(orgId, userId, 30);

    // Generate messages for each conversation
    mockConversationsStore.forEach((conversation) => {
      const messageCount = conversation.message_count;
      const messages = generateMockMessages(conversation.id, messageCount);
      mockMessagesStore.push(...messages);
    });

    // Generate 12 automations
    mockAutomationsStore = generateMockAutomations(orgId, userId, 12);

    // Generate 20 insights
    mockInsightsStore = generateMockInsights(orgId, 20);

    // Generate 25 generated content items
    mockGeneratedContentStore = generateMockGeneratedContents(orgId, userId, 25);

    // Generate 30 days of AI usage history
    mockAIUsageStore = generateMockAIUsageHistory(orgId, userId, 30);
  }
}

// ============================================================================
// CONVERSATIONS PROVIDER
// ============================================================================

export const conversationsProvider = {
  /**
   * Find all conversations for an organization
   */
  async findMany(orgId: string, userId?: string): Promise<MockConversation[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId, userId);
      await simulateDelay();
      maybeThrowError('Failed to fetch conversations');

      let conversations = mockConversationsStore.filter((c) => c.organization_id === orgId);

      // Filter by user if provided
      if (userId) {
        conversations = conversations.filter((c) => c.user_id === userId);
      }

      // Sort by last_message_at descending
      return conversations.sort(
        (a, b) => b.last_message_at.getTime() - a.last_message_at.getTime()
      );
    }

    // TODO: Replace with real Prisma query when schema is ready
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find conversation by ID
   */
  async findById(id: string, orgId: string): Promise<MockConversation | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch conversation');

      return (
        mockConversationsStore.find((c) => c.id === id && c.organization_id === orgId) || null
      );
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new conversation
   */
  async create(
    data: Partial<MockConversation>,
    orgId: string,
    userId: string
  ): Promise<MockConversation> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId, userId);
      await simulateDelay();
      maybeThrowError('Failed to create conversation');

      const newConversation = generateMockConversation(orgId, userId, data);
      mockConversationsStore.push(newConversation);

      return newConversation;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update conversation
   */
  async update(
    id: string,
    data: Partial<MockConversation>,
    orgId: string
  ): Promise<MockConversation> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to update conversation');

      const index = mockConversationsStore.findIndex(
        (c) => c.id === id && c.organization_id === orgId
      );
      if (index === -1) throw new Error('Conversation not found');

      mockConversationsStore[index] = {
        ...mockConversationsStore[index],
        ...data,
      };

      return mockConversationsStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Archive conversation
   */
  async archive(id: string, orgId: string): Promise<MockConversation> {
    if (dataConfig.useMocks) {
      return this.update(id, { status: 'ARCHIVED' }, orgId);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete conversation
   */
  async delete(id: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to delete conversation');

      const index = mockConversationsStore.findIndex(
        (c) => c.id === id && c.organization_id === orgId
      );
      if (index === -1) throw new Error('Conversation not found');

      mockConversationsStore.splice(index, 1);

      // Also delete related messages
      mockMessagesStore = mockMessagesStore.filter((m) => m.conversation_id !== id);

      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// MESSAGES PROVIDER
// ============================================================================

export const messagesProvider = {
  /**
   * Find all messages for a conversation
   */
  async findMany(conversationId: string, orgId: string): Promise<MockMessage[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch messages');

      // Verify conversation belongs to organization
      const conversation = mockConversationsStore.find(
        (c) => c.id === conversationId && c.organization_id === orgId
      );
      if (!conversation) throw new Error('Conversation not found');

      // Sort by timestamp ascending (oldest first)
      return mockMessagesStore
        .filter((m) => m.conversation_id === conversationId)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new message
   */
  async create(data: Partial<MockMessage>, orgId: string): Promise<MockMessage> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to create message');

      if (!data.conversation_id) throw new Error('conversation_id is required');

      // Verify conversation belongs to organization
      const conversation = mockConversationsStore.find(
        (c) => c.id === data.conversation_id && c.organization_id === orgId
      );
      if (!conversation) throw new Error('Conversation not found');

      const newMessage = generateMockMessage(
        data.conversation_id,
        data.role || 'USER',
        data.content || '',
        data
      );
      mockMessagesStore.push(newMessage);

      // Update conversation message count and last_message_at
      conversation.message_count += 1;
      conversation.last_message_at = newMessage.timestamp;

      return newMessage;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// AUTOMATIONS PROVIDER
// ============================================================================

export const automationsProvider = {
  /**
   * Find all automations with optional filters
   */
  async findMany(
    orgId: string,
    filters?: {
      status?: string;
      trigger_type?: string;
    }
  ): Promise<MockAutomation[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch automations');

      let automations = mockAutomationsStore.filter((a) => a.organization_id === orgId);

      // Apply filters
      if (filters?.status) {
        automations = automations.filter((a) => a.status === filters.status);
      }

      if (filters?.trigger_type) {
        automations = automations.filter((a) => a.trigger_type === filters.trigger_type);
      }

      // Sort by created_at descending
      return automations.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find automation by ID
   */
  async findById(id: string, orgId: string): Promise<MockAutomation | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch automation');

      return (
        mockAutomationsStore.find((a) => a.id === id && a.organization_id === orgId) || null
      );
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new automation
   */
  async create(
    data: Partial<MockAutomation>,
    orgId: string,
    userId: string
  ): Promise<MockAutomation> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId, userId);
      await simulateDelay();
      maybeThrowError('Failed to create automation');

      const newAutomation = generateMockAutomation(orgId, userId, data);
      mockAutomationsStore.push(newAutomation);

      return newAutomation;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update automation
   */
  async update(
    id: string,
    data: Partial<MockAutomation>,
    orgId: string
  ): Promise<MockAutomation> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to update automation');

      const index = mockAutomationsStore.findIndex(
        (a) => a.id === id && a.organization_id === orgId
      );
      if (index === -1) throw new Error('Automation not found');

      mockAutomationsStore[index] = {
        ...mockAutomationsStore[index],
        ...data,
        updated_at: new Date(),
      };

      return mockAutomationsStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete automation
   */
  async delete(id: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to delete automation');

      const index = mockAutomationsStore.findIndex(
        (a) => a.id === id && a.organization_id === orgId
      );
      if (index === -1) throw new Error('Automation not found');

      mockAutomationsStore.splice(index, 1);
      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Run automation manually
   */
  async run(
    id: string,
    orgId: string
  ): Promise<{ success: boolean; message: string }> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to run automation');

      const automation = mockAutomationsStore.find(
        (a) => a.id === id && a.organization_id === orgId
      );
      if (!automation) throw new Error('Automation not found');

      // Update run counts
      automation.run_count += 1;
      automation.success_count += 1;
      automation.last_run_at = new Date();

      return {
        success: true,
        message: 'Automation executed successfully',
      };
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Pause automation
   */
  async pause(id: string, orgId: string): Promise<MockAutomation> {
    if (dataConfig.useMocks) {
      return this.update(id, { status: 'PAUSED' }, orgId);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Resume automation
   */
  async resume(id: string, orgId: string): Promise<MockAutomation> {
    if (dataConfig.useMocks) {
      return this.update(id, { status: 'ACTIVE' }, orgId);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// INSIGHTS PROVIDER
// ============================================================================

export const insightsProvider = {
  /**
   * Find all insights with optional filters
   */
  async findMany(
    orgId: string,
    filters?: {
      category?: string;
      is_read?: boolean;
      impact_level?: string;
    }
  ): Promise<MockInsight[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch insights');

      let insights = mockInsightsStore.filter((i) => i.organization_id === orgId);

      // Apply filters
      if (filters?.category) {
        insights = insights.filter((i) => i.category === filters.category);
      }

      if (filters?.is_read !== undefined) {
        insights = insights.filter((i) => i.is_read === filters.is_read);
      }

      if (filters?.impact_level) {
        insights = insights.filter((i) => i.impact_level === filters.impact_level);
      }

      // Filter out dismissed and expired
      insights = insights.filter((i) => {
        if (i.is_dismissed) return false;
        if (i.expires_at && i.expires_at < new Date()) return false;
        return true;
      });

      // Sort by generated_at descending
      return insights.sort((a, b) => b.generated_at.getTime() - a.generated_at.getTime());
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find insight by ID
   */
  async findById(id: string, orgId: string): Promise<MockInsight | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch insight');

      return (
        mockInsightsStore.find((i) => i.id === id && i.organization_id === orgId) || null
      );
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Mark insight as read
   */
  async markAsRead(id: string, orgId: string): Promise<MockInsight> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to mark insight as read');

      const insight = mockInsightsStore.find(
        (i) => i.id === id && i.organization_id === orgId
      );
      if (!insight) throw new Error('Insight not found');

      insight.is_read = true;
      return insight;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Dismiss insight
   */
  async dismiss(id: string, orgId: string): Promise<MockInsight> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to dismiss insight');

      const insight = mockInsightsStore.find(
        (i) => i.id === id && i.organization_id === orgId
      );
      if (!insight) throw new Error('Insight not found');

      insight.is_dismissed = true;
      return insight;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get unread count
   */
  async getUnreadCount(orgId: string): Promise<number> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();

      return mockInsightsStore.filter(
        (i) =>
          i.organization_id === orgId &&
          !i.is_read &&
          !i.is_dismissed &&
          (!i.expires_at || i.expires_at > new Date())
      ).length;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// CONTENT GENERATION PROVIDER
// ============================================================================

export const contentGenerationProvider = {
  /**
   * Find all generated content with optional filters
   */
  async findMany(
    orgId: string,
    filters?: {
      content_type?: string;
      status?: string;
    }
  ): Promise<MockGeneratedContent[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch generated content');

      let content = mockGeneratedContentStore.filter((c) => c.organization_id === orgId);

      // Apply filters
      if (filters?.content_type) {
        content = content.filter((c) => c.content_type === filters.content_type);
      }

      if (filters?.status) {
        content = content.filter((c) => c.status === filters.status);
      }

      // Sort by generated_at descending
      return content.sort((a, b) => b.generated_at.getTime() - a.generated_at.getTime());
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find generated content by ID
   */
  async findById(id: string, orgId: string): Promise<MockGeneratedContent | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch generated content');

      return (
        mockGeneratedContentStore.find((c) => c.id === id && c.organization_id === orgId) ||
        null
      );
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Generate new content
   */
  async generate(params: {
    content_type: string;
    prompt: string;
    orgId: string;
    userId: string;
  }): Promise<MockGeneratedContent> {
    if (dataConfig.useMocks) {
      initializeMockData(params.orgId, params.userId);
      await simulateDelay(2000); // Longer delay to simulate AI generation
      maybeThrowError('Failed to generate content');

      const newContent = generateMockGeneratedContent(params.orgId, params.userId, {
        content_type: params.content_type as any,
        prompt: params.prompt,
        status: 'DRAFT',
      });
      mockGeneratedContentStore.push(newContent);

      return newContent;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update generated content
   */
  async update(
    id: string,
    data: Partial<MockGeneratedContent>,
    orgId: string
  ): Promise<MockGeneratedContent> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to update generated content');

      const index = mockGeneratedContentStore.findIndex(
        (c) => c.id === id && c.organization_id === orgId
      );
      if (index === -1) throw new Error('Generated content not found');

      mockGeneratedContentStore[index] = {
        ...mockGeneratedContentStore[index],
        ...data,
      };

      return mockGeneratedContentStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete generated content
   */
  async delete(id: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to delete generated content');

      const index = mockGeneratedContentStore.findIndex(
        (c) => c.id === id && c.organization_id === orgId
      );
      if (index === -1) throw new Error('Generated content not found');

      mockGeneratedContentStore.splice(index, 1);
      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// AI USAGE PROVIDER
// ============================================================================

export const aiUsageProvider = {
  /**
   * Find all AI usage with optional filters
   */
  async findMany(
    orgId: string,
    userId?: string,
    filters?: {
      feature?: string;
      start_date?: Date;
      end_date?: Date;
    }
  ): Promise<MockAIUsage[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId, userId);
      await simulateDelay();
      maybeThrowError('Failed to fetch AI usage');

      let usage = mockAIUsageStore.filter((u) => u.organization_id === orgId);

      // Filter by user if provided
      if (userId) {
        usage = usage.filter((u) => u.user_id === userId);
      }

      // Apply filters
      if (filters?.feature) {
        usage = usage.filter((u) => u.feature === filters.feature);
      }

      if (filters?.start_date) {
        usage = usage.filter((u) => u.timestamp >= filters.start_date!);
      }

      if (filters?.end_date) {
        usage = usage.filter((u) => u.timestamp <= filters.end_date!);
      }

      // Sort by timestamp descending
      return usage.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get usage statistics
   */
  async getStats(
    orgId: string,
    userId?: string
  ): Promise<{
    total_tokens: number;
    total_cost_cents: number;
    by_feature: Array<{ feature: string; tokens: number; cost_cents: number }>;
    daily_usage: Array<{ date: string; tokens: number; cost_cents: number }>;
  }> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId, userId);
      await simulateDelay();

      let usage = mockAIUsageStore.filter((u) => u.organization_id === orgId);

      if (userId) {
        usage = usage.filter((u) => u.user_id === userId);
      }

      // Calculate totals
      const totalTokens = usage.reduce((sum, u) => sum + u.tokens_used, 0);
      const totalCostCents = usage.reduce((sum, u) => sum + u.cost_cents, 0);

      // Group by feature
      const byFeatureMap = new Map<string, { tokens: number; cost_cents: number }>();
      usage.forEach((u) => {
        const current = byFeatureMap.get(u.feature) || { tokens: 0, cost_cents: 0 };
        byFeatureMap.set(u.feature, {
          tokens: current.tokens + u.tokens_used,
          cost_cents: current.cost_cents + u.cost_cents,
        });
      });
      const byFeature = Array.from(byFeatureMap.entries()).map(([feature, data]) => ({
        feature,
        tokens: data.tokens,
        cost_cents: data.cost_cents,
      }));

      // Group by day (last 30 days)
      const dailyUsageMap = new Map<string, { tokens: number; cost_cents: number }>();
      usage.forEach((u) => {
        const dateKey = u.timestamp.toISOString().split('T')[0];
        const current = dailyUsageMap.get(dateKey) || { tokens: 0, cost_cents: 0 };
        dailyUsageMap.set(dateKey, {
          tokens: current.tokens + u.tokens_used,
          cost_cents: current.cost_cents + u.cost_cents,
        });
      });
      const dailyUsage = Array.from(dailyUsageMap.entries())
        .map(([date, data]) => ({
          date,
          tokens: data.tokens,
          cost_cents: data.cost_cents,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        total_tokens: totalTokens,
        total_cost_cents: totalCostCents,
        by_feature: byFeature,
        daily_usage: dailyUsage,
      };
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};
