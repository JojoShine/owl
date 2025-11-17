'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bell, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocket } from '@/contexts/SocketContext';
import { notificationApi } from '@/lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 通知类型图标颜色
const notificationTypeColors = {
  info: 'text-blue-500',
  system: 'text-gray-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  success: 'text-green-500',
};

export default function NotificationIcon() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { socket, isConnected, on, off } = useSocket();

  // 获取未读数量
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      if (response.data.success) {
        setUnreadCount(response.data.data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  // 获取最近通知
  const fetchRecentNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await notificationApi.getNotifications({
        page: 1,
        limit: 5,
        isRead: false,
      });
      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('获取通知失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 标记为已读
  const markAsRead = async (id, event) => {
    event.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // 触发自定义事件，通知其他组件更新
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notification:read', { detail: { id } }));
      }

      toast.success('已标记为已读');
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('标记失败');
    }
  };

  // 标记所有为已读
  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications([]);
      setUnreadCount(0);

      // 触发自定义事件，通知其他组件更新
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notification:readAll'));
      }

      toast.success('已全部标记为已读');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('标记失败');
    }
  };

  // 处理通知点击
  const handleNotificationClick = async (notification) => {
    // 如果未读，标记为已读
    if (!notification.is_read) {
      await notificationApi.markAsRead(notification.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // 触发自定义事件，通知其他组件更新
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notification:read', { detail: { id: notification.id } }));
      }
    }

    // 如果有链接，跳转
    if (notification.link) {
      window.location.href = notification.link;
    }

    setIsOpen(false);
  };

  // 监听实时通知
  useEffect(() => {
    if (isConnected && socket) {
      const handleNewNotification = (notification) => {
        console.log('Received new notification:', notification);

        // 更新未读数量
        setUnreadCount((prev) => prev + 1);

        // 添加到通知列表（只保留最近5条）
        setNotifications((prev) => {
          const newNotifications = [notification, ...prev];
          return newNotifications.slice(0, 5);
        });

        // 显示桌面通知
        toast.info(notification.title, {
          description: notification.content,
        });
      };

      on('notification', handleNewNotification);

      return () => {
        off('notification', handleNewNotification);
      };
    }
  }, [isConnected, socket, on, off]);

  // 初始加载
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // 下拉菜单打开时加载最新通知
  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
    }
  }, [isOpen, fetchRecentNotifications]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>通知</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
            >
              全部已读
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            加载中...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            暂无未读通知
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Bell
                        className={`h-4 w-4 flex-shrink-0 ${
                          notificationTypeColors[notification.type] ||
                          notificationTypeColors.info
                        }`}
                      />
                      <span className="font-medium text-sm truncate">
                        {notification.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.content}
                    </p>
                    <span className="text-xs text-muted-foreground mt-1">
                      {notification.created_at
                        ? formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: zhCN,
                          })
                        : '刚刚'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={(e) => markAsRead(notification.id, e)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/notifications"
            className="w-full text-center text-sm cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            查看全部通知
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
