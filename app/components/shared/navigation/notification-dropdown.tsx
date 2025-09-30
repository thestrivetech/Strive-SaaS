'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/lib/modules/notifications/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { RealtimeClient, type RealtimePayload } from '@/lib/realtime/client';
import type { Notification } from '@prisma/client';

interface NotificationDropdownProps {
  userId: string;
  organizationId: string;
  initialNotifications?: Notification[];
  initialUnreadCount?: number;
}

export function NotificationDropdown({
  userId,
  organizationId,
  initialNotifications = [],
  initialUnreadCount = 0,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Realtime subscription
  useEffect(() => {
    const client = new RealtimeClient();

    const unsubscribe = client.subscribeToNotificationUpdates(userId, (payload: RealtimePayload<Notification>) => {
      if (payload.eventType === 'INSERT') {
        setNotifications((prev) => [payload.new, ...prev].slice(0, 20)); // Keep last 20
        if (!payload.new.read) {
          setUnreadCount((prev) => prev + 1);
        }
      } else if (payload.eventType === 'UPDATE') {
        setNotifications((prev) =>
          prev.map((n) => (n.id === payload.new.id ? payload.new : n))
        );
        // Recalculate unread count
        setUnreadCount((prev) => {
          if (payload.old.read === false && payload.new.read === true) {
            return Math.max(0, prev - 1);
          }
          return prev;
        });
      } else if (payload.eventType === 'DELETE') {
        setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
        if (!payload.old.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  const handleMarkRead = async (notificationId: string) => {
    const result = await markNotificationRead({ notificationId });
    if (result.success) {
      // Optimistic update already handled by realtime
    } else {
      toast.error(result.error || 'Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    const result = await markAllNotificationsRead();
    if (result.success) {
      toast.success(`Marked ${result.data?.count} notification${result.data?.count !== 1 ? 's' : ''} as read`);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    const result = await deleteNotification({ notificationId });
    if (result.success) {
      toast.success('Notification deleted');
    } else {
      toast.error(result.error || 'Failed to delete notification');
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await handleMarkRead(notification.id);
    }

    // Navigate if action URL provided
    if (notification.actionUrl) {
      setIsOpen(false);
      router.push(notification.actionUrl);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return '✅';
      case 'WARNING':
        return '⚠️';
      case 'ERROR':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'text-green-600';
      case 'WARNING':
        return 'text-yellow-600';
      case 'ERROR':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications.length > 0 && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative p-3 hover:bg-accent cursor-pointer ${
                    !notification.read ? 'bg-accent/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getTypeIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${getTypeColor(notification.type)}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {notification.actionUrl && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (visible on hover) */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(notification.id);
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setIsOpen(false);
                  router.push('/settings');
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}