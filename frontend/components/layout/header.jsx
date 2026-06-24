'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/utils/auth';
import { ThemeToggle } from '@/components/layout/theme/theme-toggle';
import NotificationIcon from '@/components/notification/NotificationIcon';
import { getFileUrl } from '@/lib/utils/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut } from 'lucide-react';
import { systemConfigApi } from '@/lib/api';

export default function Header() {
  const { user, logout } = useAuth();
  const [enableThemeSwitch, setEnableThemeSwitch] = useState(true);
  const [systemName, setSystemName] = useState('Owl 管理平台');
  const [logoUrl, setLogoUrl] = useState(null);

  const fetchConfig = useCallback(async () => {
    try {
      const response = await systemConfigApi.getConfig();
      if (response.success) {
        setEnableThemeSwitch(response.data?.enable_theme_switch ?? true);
        setSystemName(response.data?.system_name || 'Owl 管理平台');
        // 处理 logo - 支持 Minio 路径和本地路径
        if (response.data?.logo_url) {
          setLogoUrl(getFileUrl(response.data.logo_url));
        }
      }
    } catch (error) {
      console.error('Failed to fetch system config:', error);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleLogout = () => {
    logout();
  };

  // 获取用户名首字母作为头像
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium">
          欢迎回来，{user?.real_name || user?.username || '用户'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* 深浅色切换 */}
        {enableThemeSwitch && <ThemeToggle />}

        {/* 通知图标 */}
        <NotificationIcon />

        {/* 用户菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user?.username)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.real_name || user?.username}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>个人信息</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}