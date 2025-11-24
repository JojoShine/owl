'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getMenuIcon } from '@/lib/menu-icons';
import api from '@/lib/api';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';

const basePath = process.env.NODE_ENV === 'production' ? '/owl' : '';

export default function Sidebar() {
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const { socket, isConnected } = useSocket();

  // 获取用户菜单的函数
  const fetchUserMenus = useCallback(async () => {
    try {
      const response = await api.menu.getUserMenus();
      const items = response.data?.items || [];
      setMenuItems(items);
    } catch (error) {
      console.error('获取菜单失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载菜单
  useEffect(() => {
    fetchUserMenus();
    // 默认折叠所有菜单（不展开子菜单）
    setExpandedMenus(new Set());
  }, [fetchUserMenus]);

  // 监听WebSocket菜单更新事件
  useEffect(() => {
    if (!socket || !isConnected) return;

    // 监听菜单更新事件
    const handleMenuUpdated = (data) => {
      console.log('Menu updated event received:', data);
      // 重新获取菜单
      fetchUserMenus();
    };

    socket.on('menu:updated', handleMenuUpdated);

    // 清理监听器
    return () => {
      socket.off('menu:updated', handleMenuUpdated);
    };
  }, [socket, isConnected, fetchUserMenus]);

  // 切换菜单展开/收起状态
  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  // 递归渲染菜单项（支持子菜单）
  const renderMenuItem = (item, level = 0) => {
    const Icon = getMenuIcon(item.icon);
    const isActive = pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.id);
    const hasValidPath = item.path && item.path !== '#';

    return (
      <div key={item.id}>
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
            level > 0 && 'ml-4',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            hasChildren && !hasValidPath && 'cursor-pointer'
          )}
          onClick={hasChildren && !hasValidPath ? () => toggleMenu(item.id) : undefined}
        >
          {/* 菜单内容 - 有路径则用Link，无路径则用div */}
          {hasValidPath ? (
            <Link
              href={item.path}
              className="flex items-center gap-2 flex-1"
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.name}</span>
              {/* 展开/收起按钮移到右侧（仅父菜单显示） */}
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMenu(item.id);
                  }}
                  className="p-0 hover:opacity-70 shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )}
            </Link>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.name}</span>
              {/* 展开/收起按钮移到右侧（仅父菜单显示） */}
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(item.id);
                  }}
                  className="p-0 hover:opacity-70 shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* 子菜单（仅在展开时显示） */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full border-r bg-card">
      {/* Logo区域 */}
      <div className="h-16 flex items-center gap-3 px-6 border-b">
        <Image
          src={`${basePath}/logo.png`}
          alt="Logo"
          width={32}
          height={32}
          className="rounded dark:invert"
        />
        <h1 className="text-lg font-semibold">owl管理平台</h1>
      </div>

      {/* 菜单区域 */}
      <nav className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            加载中...
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            暂无可用菜单
          </div>
        ) : (
          <div className="space-y-1">
            {menuItems.map(item => renderMenuItem(item))}
          </div>
        )}
      </nav>
    </div>
  );
}