'use client';

import { useState, useEffect } from 'react';
import { permissionApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });

  // 获取权限列表
  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await permissionApi.getPermissions({
        search: searchTerm,
        page: pagination.page,
        limit: pagination.pageSize
      });
      const permissionsData = response.data?.items || response.data || [];
      setPermissions(Array.isArray(permissionsData) ? permissionsData : []);

      // 更新分页信息
      if (response.data?.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total || 0
        }));
      }
    } catch (error) {
      console.error('获取权限列表失败:', error);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  // 搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 })); // 重置到第一页
    setTimeout(() => fetchPermissions(), 0);
  };

  // 重置
  const handleReset = () => {
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(() => fetchPermissions(), 0);
  };

  // 分页变化
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // 操作类型徽章颜色
  const getActionBadge = (action) => {
    const actionMap = {
      create: { label: '创建', variant: 'default' },
      read: { label: '查看', variant: 'secondary' },
      update: { label: '更新', variant: 'outline' },
      delete: { label: '删除', variant: 'destructive' },
    };
    const config = actionMap[action] || { label: action, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle>权限列表</CardTitle>
            <CardDescription>支持按名称、代码或资源快速筛选</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索栏 */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[180px]">
                <Input
                  placeholder="搜索权限名称、代码、资源..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex-shrink-0 flex gap-2">
                <Button onClick={handleSearch} size="lg">
                  <Search className="h-4 w-4 mr-2" />
                  查询
                </Button>
                <Button onClick={handleReset} variant="outline" size="lg">
                  <X className="h-4 w-4 mr-2" />
                  重置
                </Button>
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>权限名称</TableHead>
                  <TableHead>权限代码</TableHead>
                  <TableHead>资源</TableHead>
                  <TableHead>操作类型</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : permissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">{permission.name}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{permission.code}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{permission.resource}</Badge>
                      </TableCell>
                      <TableCell>{getActionBadge(permission.action)}</TableCell>
                      <TableCell>{permission.category || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {permission.description || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="h-8"></div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination
            page={pagination.page}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
