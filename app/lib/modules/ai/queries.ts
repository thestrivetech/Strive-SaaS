import { prisma } from '@/lib/prisma';

/**
 * Get all conversations for a user
 */
export async function getConversations(userId: string, organizationId: string) {
  return await prisma.aIConversation.findMany({
    where: {
      userId,
      organizationId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 50,
  });
}

/**
 * Get a specific conversation with messages
 */
export async function getConversation(conversationId: string, userId: string, organizationId: string) {
  return await prisma.aIConversation.findFirst({
    where: {
      id: conversationId,
      userId,
      organizationId,
    },
  });
}

/**
 * Get conversation history (last N conversations)
 */
export async function getRecentConversations(userId: string, organizationId: string, limit: number = 10) {
  return await prisma.aIConversation.findMany({
    where: {
      userId,
      organizationId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: limit,
    select: {
      id: true,
      aiModel: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}