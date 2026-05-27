'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DashboardConfigTab() {
  return (
    <div className="space-y-6">
      {/* 指标配置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>指标配置</CardTitle>
              <CardDescription>配置概览页面顶部的指标卡片</CardDescription>
            </div>
            <Button size="sm" disabled>
              <Plus className="w-4 h-4 mr-1" />
              添加指标
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            概览配置功能正在开发中...
          </p>
        </CardContent>
      </Card>

      {/* 图表配置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>图表配置</CardTitle>
              <CardDescription>配置概览页面的图表布局和数据源</CardDescription>
            </div>
            <Button size="sm" disabled>
              <Plus className="w-4 h-4 mr-1" />
              添加图表
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            概览配置功能正在开发中...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
