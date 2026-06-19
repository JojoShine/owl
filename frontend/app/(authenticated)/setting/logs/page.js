'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LogFilters from '@/components/logs/LogFilters';
import LogTable from '@/components/logs/LogTable';
import { logApi } from '@/lib/api/system/log.api';
import { toast } from 'sonner';

const LOG_TYPES = [
  { value: 'operation', label: '操作日志' },
  { value: 'login', label: '登录日志' },
  { value: 'system', label: '系统日志' },
  { value: 'access', label: '访问日志' },
  { value: 'error', label: '错误日志' },
  { value: 'database', label: '数据库日志' },
];

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState('operation');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    username: '',
    method: '',
    url: '',
    status: '',
    action: '',
    type: '',
  });

  // 加载日志
  const loadLogs = async (page = 1) => {
    setLoading(true);
    try {
      let response;
      const params = {
        page,
        limit: pagination.limit,
        ...filters,
      };

      switch (activeTab) {
        case 'operation':
          response = await logApi.getOperationLogs(params);
          break;
        case 'login':
          response = await logApi.getLoginLogs(params);
          break;
        case 'system':
          response = await logApi.getSystemLogs(params);
          break;
        case 'access':
          response = await logApi.getAccessLogs(params);
          break;
        case 'error':
          response = await logApi.getErrorLogs(params);
          break;
        case 'database':
          response = await logApi.getDatabaseAccessLogs(params);
          break;
        default:
          response = await logApi.getOperationLogs(params);
      }

      if (response.data?.success) {
        setLogs(response.data.data.logs || []);
        setPagination({
          page: response.data.data.page,
          limit: response.data.data.limit,
          total: response.data.data.total,
          totalPages: response.data.data.totalPages,
        });
      } else {
        toast.error(response.data?.message || '获取日志失败');
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
      toast.error(error.response?.data?.message || '获取日志失败');
    } finally {
      setLoading(false);
    }
  };

  // 当tab或filters变化时重新加载
  useEffect(() => {
    loadLogs(1);
  }, [activeTab]);

  // 处理筛选
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    loadLogs(1);
  };

  // 处理分页
  const handlePageChange = (page) => {
    loadLogs(page);
  };

  const handlePageSizeChange = (pageSize) => {
    setPagination({ ...pagination, limit: pageSize });
    loadLogs(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">日志管理</h1>
        <p className="text-muted-foreground mt-2">
          查看和管理系统各类日志记录
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>日志查询</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-7">
              {LOG_TYPES.map((type) => (
                <TabsTrigger key={type.value} value={type.value}>
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {LOG_TYPES.map((type) => (
              <TabsContent key={type.value} value={type.value} className="mt-4">
                <LogFilters
                  type={type.value}
                  filters={filters}
                  onChange={handleFilterChange}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{LOG_TYPES.find(t => t.value === activeTab)?.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <LogTable
            type={activeTab}
            logs={logs}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
