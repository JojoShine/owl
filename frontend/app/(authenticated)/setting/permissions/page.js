'use client';

import { useState, useEffect } from 'react';
import { permissionApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchFilter } from '@/components/common/SearchFilter';
import { DataTable } from '@/components/common/DataTable';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValues, setSearchValues] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });

  // 获取权限列表
  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await permissionApi.getPermissions({
        search: searchValues.keyword || '',
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
  }, [pagination.page, pagination.pageSize]);

  // 搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(() => fetchPermissions(), 0);
  };

  // 重置
  const handleReset = () => {
    setSearchValues({});
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(() => fetchPermissions(), 0);
  };

  // 分页变化
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // 每页数量变化
  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
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

  // 搜索字段配置
  const searchFields = [
    {
      type: 'text',
      name: 'keyword',
      placeholder: '搜索权限名称、代码、资源...'
    }
  ];

  // 表格列配置
  const columns = [
    {
      key: 'name',
      label: '权限名称',
      cellClassName: 'font-medium'
    },
    {
      key: 'code',
      label: '权限代码',
      render: (value) => (
        <code className="text-sm bg-muted px-2 py-1 rounded">{value}</code>
      )
    },
    {
      key: 'resource',
      label: '资源',
      render: (value) => <Badge variant="outline">{value}</Badge>
    },
    {
      key: 'action',
      label: '操作类型',
      render: (value) => getActionBadge(value)
    },
    {
      key: 'category',
      label: '分类',
      render: (value) => value || '-'
    },
    {
      key: 'description',
      label: '描述',
      cellClassName: 'max-w-xs truncate',
      render: (value) => value || '-'
    }
  ];

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
          <SearchFilter
            fields={searchFields}
            values={searchValues}
            onChange={setSearchValues}
            onSearch={handleSearch}
            onReset={handleReset}
          />

          {/* 数据表格 */}
          <DataTable
            columns={columns}
            data={permissions}
            loading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            actions={() => <div className="h-8"></div>}
          />
        </CardContent>
      </Card>
    </div>
  );
}
