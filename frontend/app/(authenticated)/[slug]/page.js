'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/utils/http-client';
import { DynamicCrudPage } from '@/components/dynamic-module/DynamicCrudPage';

export default function DynamicModulePage() {
  const { slug } = useParams();
  const [pageConfig, setPageConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPageConfig() {
      try {
        setLoading(true);
        setError(null);

        // 从后端加载页面配置
        const response = await axios.get(`/generator/page-config/${slug}`);
        setPageConfig(response.data);
      } catch (err) {
        console.error('Failed to load page config:', err);
        setError(err.response?.data?.message || '模块不存在或加载失败');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadPageConfig();
    }
  }, [slug]);

  // 加载中状态
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">页面加载失败</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link
            href="/dashboard"
            className="text-primary hover:underline"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  // 模块不存在
  if (!pageConfig) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">模块不存在</h2>
          <p className="text-muted-foreground mb-4">
            找不到模块 &quot;{slug}&quot;
          </p>
          <Link
            href="/dashboard"
            className="text-primary hover:underline"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  // 渲染动态CRUD页面
  return <DynamicCrudPage config={pageConfig} />;
}
