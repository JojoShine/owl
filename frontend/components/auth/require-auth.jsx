'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

/**
 * 路由保护组件
 * 用于保护需要认证的页面
 */
export default function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 等待加载完成后再检查
    if (!isLoading) {
      // 如果未登录，跳转到登录页
      if (!isAuthenticated()) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // 加载中显示loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录不渲染内容（会在useEffect中跳转）
  if (!isAuthenticated()) {
    return null;
  }

  // 已登录，渲染子组件
  return <>{children}</>;
}