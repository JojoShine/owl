'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getMenuIcon } from '@/lib/config/menu-icons';
import { Loading } from '@/components/ui/loading';
import { menuApi } from '@/lib/api';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useColorTheme } from '@/lib/utils/theme';
import { systemConfigApi } from '@/lib/api';
import { getApiBaseUrl } from '@/lib/utils/http-client';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// 单个菜单项组件 - 使用React.memo优化
const MenuItemComponent = ({ item, level = 0, expandedMenus, toggleMenu, pathname }) => {
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
        {hasValidPath ? (
          <Link
            href={item.path}
            className="flex items-center gap-2 flex-1"
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{item.name}</span>
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

      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {item.children.map(child => (
            <MenuItemComponent
              key={child.id}
              item={child}
              level={level + 1}
              expandedMenus={expandedMenus}
              toggleMenu={toggleMenu}
              pathname={pathname}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const [businessMenus, setBusinessMenus] = useState([]);
  const [systemMenus, setSystemMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const { socket, isConnected } = useSocket();
  const { applySystemConfigTheme } = useColorTheme();
  const [systemName, setSystemName] = useState('Owl管理平台');
  const [logoUrl, setLogoUrl] = useState(`${basePath}/logo.png`);

  // 获取系统配置并应用主题
  const fetchSystemConfig = useCallback(async () => {
    try {
      const response = await systemConfigApi.getConfig();
      if (response?.success) {
        if (response.data?.primary_color) {
          applySystemConfigTheme(response.data.primary_color);
        }
        if (response.data?.system_name) {
          setSystemName(response.data.system_name);
        }
        if (response.data?.logo_url) {
          const url = response.data.logo_url;
          const fullUrl = url.startsWith('http')
            ? url
            : `${getApiBaseUrl()}${url}`;
          if (fullUrl) setLogoUrl(fullUrl);
        }
      }
    } catch (error) {
      console.error('获取系统配置失败:', error);
    }
  }, [applySystemConfigTheme]);

  // 获取用户菜单的函数
  const fetchUserMenus = useCallback(async () => {
    try {
      const response = await menuApi.getUserMenus();
      const { businessMenus: business, systemMenus: system } = response.data || {};
      setBusinessMenus(business || []);
      setSystemMenus(system || []);
    } catch (error) {
      console.error('获取菜单失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载菜单和系统配置
  useEffect(() => {
    fetchUserMenus();
    fetchSystemConfig();
    setExpandedMenus(new Set());
  }, []);

  // 监听WebSocket菜单更新事件
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMenuUpdated = (data) => {
      console.log('Menu updated event received:', data);
      fetchUserMenus();
    };

    socket.on('menu:updated', handleMenuUpdated);

    return () => {
      socket.off('menu:updated', handleMenuUpdated);
    };
  }, [socket, isConnected, fetchUserMenus]);

  // 切换菜单展开/收起状态
  const toggleMenu = useCallback((menuId) => {
    setExpandedMenus(prev => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  }, []);

  // 合并菜单列表
  const allMenus = useMemo(() => {
    const menus = [...businessMenus];
    if (businessMenus.length > 0 && systemMenus.length > 0) {
      menus.push({ id: '__divider__', isDivider: true });
    }
    menus.push(...systemMenus);
    return menus;
  }, [businessMenus, systemMenus]);

  return (
    <div className="flex flex-col h-full border-r bg-card">
      {/* Logo区域 */}
      <div className="h-16 flex items-center gap-3 px-6 border-b">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo"
            className="w-8 h-8 rounded dark:invert"
          />
        ) : null}
        <h1 className="text-lg font-semibold">{systemName}</h1>
      </div>

      {/* 菜单区域 */}
      <nav className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <Loading size="sm" variant="pulse" />
        ) : allMenus.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            暂无可用菜单
          </div>
        ) : (
          <div className="space-y-1">
            {allMenus.map(item =>
              item.isDivider ? (
                <div key={item.id} className="my-4 px-2">
                  <div className="h-px bg-border" />
                </div>
              ) : (
                <MenuItemComponent
                  key={item.id}
                  item={item}
                  expandedMenus={expandedMenus}
                  toggleMenu={toggleMenu}
                  pathname={pathname}
                />
              )
            )}
          </div>
        )}
      </nav>
    </div>
  );
}