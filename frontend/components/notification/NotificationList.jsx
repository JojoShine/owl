'use client';

import React from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">类型</TableHead>
          <TableHead className="w-[200px]">标题</TableHead>
          <TableHead>内容</TableHead>
          <TableHead className="w-[150px]">时间</TableHead>
          <TableHead className="w-[200px] text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notifications.map((notification) => {
          const typeConfig = notificationTypeConfig[notification.type] || notificationTypeConfig.info;
          const isUnread = !notification.is_read;

          return (
            <TableRow key={notification.id}>
              {/* 类型列 */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {typeConfig.label}
                  </Badge>
                  {isUnread && (
                    <span className="h-2 w-2 bg-blue-500 rounded-full" title="未读" />
                  )}
                </div>
              </TableCell>

              {/* 标题列 */}
              <TableCell className={isUnread ? 'font-medium' : 'text-muted-foreground'}>
                {notification.title}
              </TableCell>

              {/* 内容列 */}
              <TableCell>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {notification.content}
                </p>
              </TableCell>

              {/* 时间列 */}
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </TableCell>

              {/* 操作列 */}
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {notification.link && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNotificationClick(notification)}
                      title="查看详情"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}

                  {isUnread && onMarkAsRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                      title="标记为已读"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}

                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(notification.id)}
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
