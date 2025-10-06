import 'server-only';

import { prisma } from '@/lib/prisma';
import { withTenantContext } from '@/lib/database/utils';

/**
 * AI Module - Query Functions
 *
 * SECURITY: All queries automatically filtered by organizationId and userId via tenant middleware.
 * AI conversations are user-scoped within organizations.
 */

/**
 * Get all AI conversations for the current user
 *
 * @param userId - User ID
 * @returns Array of AI conversations
 */
export async function getConversations(userId: string) {
  return withTenantContext(async () => {
    return await prisma.ai_conversations.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        updated_at: 'desc',
      },
      take: 50,
    });
  });
}

/**
 * Get a specific AI conversation with messages
 *
 * @param conversationId - Conversation ID
 * @param userId - User ID
 * @returns AI conversation or null
 */
export async function getConversation(
  conversationId: string,
  userId: string
) {
  return withTenantContext(async () => {
    return await prisma.ai_conversations.findFirst({
      where: {
        id: conversationId,
        user_id: userId,
      },
    });
  });
}

/**
 * Get recent AI conversation history
 *
 * @param userId - User ID
 * @param limit - Number of conversations to fetch (default: 10)
 * @returns Array of recent AI conversations
 */
export async function getRecentConversations(
  userId: string,
  limit: number = 10
) {
  return withTenantContext(async () => {
    return await prisma.ai_conversations.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        updated_at: 'desc',
      },
      take: limit,
      select: {
        id: true,
        ai_model: true,
        created_at: true,
        updated_at: true,
      },
    });
  });
}
