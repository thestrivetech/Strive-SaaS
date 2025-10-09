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

export async function getUserPreferences(_userId: string) {
  // For now, return mock preferences
  // In future, these could be stored in user metadata or separate preferences table
  return {
    theme: 'system' as const,
    compactView: false,
    sidebarCollapsed: false,
    notificationSound: true,
    emailNotifications: true,
  };
}

export async function getNotificationPreferences(_userId: string) {
  // For now, return mock preferences
  // In future, store in user_preferences table
  return {
    emailNotifications: true,
    projectUpdates: true,
    taskAssignments: true,
    marketingEmails: false,
  };
}
