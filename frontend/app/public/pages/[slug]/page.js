'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { quickPageApi } from '@/lib/api';

export default function PublicPageRenderer() {
  const params = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await quickPageApi.getPublishedPage(params.slug);
        setPage(response.data);
      } catch (err) {
        console.error('加载页面失败:', err);
        setError(err.response?.data?.message || '页面加载失败');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchPage();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">页面不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto p-4" style={{ maxWidth: 375 }}>
        {/* 模拟手机框架 */}
        <div className="relative bg-card shadow-2xl rounded-[40px] overflow-hidden mx-auto" style={{ width: 375 }}>
          {/* 顶部状态栏 */}
          <div className="h-8 bg-gray-900 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">9:41</span>
          </div>

          {/* 内容区域 */}
          <div className="overflow-y-auto" style={{ maxHeight: 659 }}>
            {page.components && page.components.length > 0 ? (
              <div className="divide-y divide-border">
                {page.components.map((component, index) => (
                  <div
                    key={index}
                    className="p-3"
                  >
                    {renderComponent(component)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                <p className="text-sm">页面为空</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderComponent(component) {
  const { type, props } = component;

  switch (type) {
    case 'heading':
      const level = Math.min(Math.max(parseInt(props?.level) || 1, 1), 6);
      const HeadingTag = `h${level}`;
      const headingSizes = {
        1: 'text-2xl',
        2: 'text-xl',
        3: 'text-lg',
        4: 'text-base',
        5: 'text-sm',
        6: 'text-xs',
      };
      return (
        <HeadingTag
          className={`font-bold ${headingSizes[level]} text-foreground`}
          style={{ color: props?.color, textAlign: props?.align }}
        >
          {props?.text}
        </HeadingTag>
      );

    case 'text':
      return (
        <div
          style={{
            fontSize: `${props?.fontSize || 14}px`,
            color: props?.color,
            textAlign: props?.align,
          }}
          className="text-foreground whitespace-pre-wrap leading-relaxed"
        >
          {props?.content}
        </div>
      );

    case 'image':
      return (
        <img
          src={props?.url}
          alt={props?.alt || '图片'}
          style={{
            width: props?.width || '100%',
            height: props?.height || 'auto',
          }}
          className="rounded-lg"
        />
      );

    case 'button':
      return (
        <a
          href={props?.link || '#'}
          className="inline-block px-4 py-2 rounded text-sm font-medium transition-colors"
          style={{
            backgroundColor: props?.bgColor || '#1677ff',
            color: props?.textColor || '#ffffff',
          }}
        >
          {props?.text || '按钮'}
        </a>
      );

    case 'divider':
      return (
        <div
          className="my-0"
          style={{
            height: 1,
            backgroundColor: props?.color || '#e5e7eb',
            margin: `${props?.margin || 16}px 0`,
          }}
        ></div>
      );

    default:
      return null;
  }
}