import { prisma } from '@/lib/database/prisma';

export async function getUserProfile(userId: string) {
  return await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar_url: true,
      role: true,
      subscription_tier: true,
      created_at: true,
      updated_at: true,
      organization_members: {
        select: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Get user preferences
 * TODO: Add user_preferences table or metadata field to users table
 */
export async function getUserPreferences(_userId: string) {
  // Return defaults until preferences table is created
  return {
    theme: 'system' as const,
    compactView: false,
    sidebarCollapsed: false,
    notificationSound: true,
    emailNotifications: true,
  };
}

/**
 * Get notification preferences
 * TODO: Add notification_preferences table or use notifications table
 */
export async function getNotificationPreferences(_userId: string) {
  // Return defaults until preferences are stored in database
  return {
    emailNotifications: true,
    projectUpdates: true,
    taskAssignments: true,
    marketingEmails: false,
  };
}
