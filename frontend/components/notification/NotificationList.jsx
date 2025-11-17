'use client';

import React from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 通知类型配置
const notificationTypeConfig = {
  info: {
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    label: '信息',
  },
  system: {
    color: 'bg-gray-500',
    textColor: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    label: '系统',
  },
  warning: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    label: '警告',
  },
  error: {
    color: 'bg-red-500',
    textColor: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    label: '错误',
  },
  success: {
    color: 'bg-green-500',
    textColor: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    label: '成功',
  },
};

export default function NotificationList({
  notifications = [],
  onMarkAsRead,
  onDelete,
  onNotificationClick,
  isLoading = false,
}) {
  const handleNotificationClick = (notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">暂无通知</h3>
        <p className="text-sm text-muted-foreground">
          当有新通知时，会在这里显示
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const typeConfig = notificationTypeConfig[notification.type] || notificationTypeConfig.info;
        const isUnread = !notification.is_read;

        return (
          <Card
            key={notification.id}
            className="p-4 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              {/* 图标 */}
              <div className="flex-shrink-0">
                <Bell className={`h-5 w-5 ${typeConfig.textColor}`} />
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={`font-medium text-sm ${
                      isUnread ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {notification.title}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {typeConfig.label}
                  </Badge>
                  {isUnread && (
                    <span className="h-2 w-2 bg-blue-500 rounded-full" />
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {notification.content}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </span>

                  <div className="flex items-center gap-1">
                    {notification.link && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        查看详情
                      </Button>
                    )}

                    {isUnread && onMarkAsRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onMarkAsRead(notification.id)}
                        title="标记为已读"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}

                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(notification.id)}
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
