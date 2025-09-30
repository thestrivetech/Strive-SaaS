'use server';

import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getAIService, type AIMessage } from '@/lib/ai/service';
import { isModelAvailable, getRateLimitForTier, type SubscriptionTier } from '@/lib/ai/config';
import { SendMessageSchema, CreateConversationSchema } from './schemas';
import type { Prisma } from '@prisma/client';

/**
 * Check rate limit for user
 */
async function checkRateLimit(userId: string, tier: SubscriptionTier): Promise<boolean> {
  const limit = getRateLimitForTier(tier);

  // Unlimited for enterprise
  if (limit.requests === -1) return true;

  // Count requests in the current window
  const windowStart = new Date(Date.now() - limit.window * 1000);

  const count = await prisma.aIConversation.count({
    where: {
      userId,
      createdAt: {
        gte: windowStart,
      },
    },
  });

  return count < limit.requests;
}

/**
 * Send a message to AI and get a response
 */
export async function sendMessage(input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const validated = SendMessageSchema.parse(input);

    // Check if model is available for user's tier
    const tier = (user.subscriptionTier || 'FREE') as SubscriptionTier;
    if (!isModelAvailable(tier, validated.model)) {
      return {
        success: false,
        error: 'This model is not available in your subscription tier',
      };
    }

    // Check rate limit
    const withinLimit = await checkRateLimit(user.id, tier);
    if (!withinLimit) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please upgrade your plan or try again later.',
      };
    }

    // Prepare messages for AI
    const messages: AIMessage[] = [
      {
        role: 'system',
        content:
          'You are Sai, an AI assistant for Strive Tech. You help users with business tasks, data analysis, and productivity. Be concise, helpful, and professional.',
      },
    ];

    // If conversation exists, load previous messages
    if (validated.conversationId) {
      const conversation = await prisma.aIConversation.findFirst({
        where: {
          id: validated.conversationId,
          userId: user.id,
          organizationId: user.organizationId,
        },
      });

      if (conversation && conversation.messages) {
        const previousMessages = conversation.messages as Prisma.JsonArray;
        previousMessages.forEach((msg: any) => {
          if (msg.role && msg.content) {
            messages.push({
              role: msg.role as 'user' | 'assistant' | 'system',
              content: msg.content,
            });
          }
        });
      }
    }

    // Add user message
    messages.push({
      role: 'user',
      content: validated.message,
    });

    // Get AI response
    const aiService = getAIService();
    const response = await aiService.chat(messages, {
      model: validated.model,
      provider: validated.provider,
    });

    // Save or update conversation
    let conversationId = validated.conversationId;

    if (conversationId) {
      // Update existing conversation
      const conversation = await prisma.aIConversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id,
          organizationId: user.organizationId,
        },
      });

      if (conversation) {
        const currentMessages = (conversation.messages as Prisma.JsonArray) || [];
        await prisma.aIConversation.update({
          where: { id: conversationId },
          data: {
            messages: [
              ...currentMessages,
              { role: 'user', content: validated.message, timestamp: new Date().toISOString() },
              { role: 'assistant', content: response.content, timestamp: new Date().toISOString() },
            ] as Prisma.JsonArray,
            updatedAt: new Date(),
          },
        });
      }
    } else {
      // Create new conversation
      const newConversation = await prisma.aIConversation.create({
        data: {
          userId: user.id,
          organizationId: user.organizationId,
          messages: [
            { role: 'user', content: validated.message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: response.content, timestamp: new Date().toISOString() },
          ] as Prisma.JsonArray,
          model: validated.model,
          provider: validated.provider,
        },
      });
      conversationId = newConversation.id;
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId,
        action: 'AI_MESSAGE',
        entityType: 'AIConversation',
        entityId: conversationId,
        details: {
          model: validated.model,
          provider: validated.provider,
          tokens: response.usage.totalTokens,
        } as Prisma.JsonObject,
      },
    });

    return {
      success: true,
      data: {
        conversationId,
        message: response.content,
        model: response.model,
        usage: response.usage,
      },
    };
  } catch (error) {
    console.error('Send message error:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to send message' };
  }
}

/**
 * Create a new conversation
 */
export async function createConversation(input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = CreateConversationSchema.parse(input);

    const conversation = await prisma.aIConversation.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId,
        messages: [] as Prisma.JsonArray,
        model: validated.model,
        provider: validated.provider,
      },
    });

    return {
      success: true,
      data: conversation,
    };
  } catch (error) {
    console.error('Create conversation error:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to create conversation' };
  }
}