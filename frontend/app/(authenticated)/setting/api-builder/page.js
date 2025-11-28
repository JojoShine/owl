'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiBuilderApi } from '@/lib/api';
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
import { Plus, Search, Edit, Trash2, X, Key, FileText, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import ApiKeysDialog from '@/components/api-builder/api-keys-dialog';
import TestInterfaceDialog from '@/components/api-builder/test-interface-dialog';
import { getFullApiUrl } from '@/lib/api-url';

// 格式化日期的辅助函数 - 转换为本地时间
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    let date;

    // 如果是ISO格式或ISO-like格式
    if (typeof dateString === 'string' && (dateString.includes('T') || dateString.includes('Z'))) {
      date = new Date(dateString);
    } else if (typeof dateString === 'string') {
      // 处理"YYYY-MM-DD HH:mm:ss"格式 - 假设为UTC时间，需要转换为本地时间
      const match = dateString.match(/(\d{4})-(\d{2})-(\d{2})\s?(\d{2})?:?(\d{2})?:?(\d{2})?/);
      if (match) {
        const [, year, month, day, hour = 0, minute = 0, second = 0] = match;
        // 创建UTC时间
        date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
      return '-';
    }

    // 转换为本地时间字符串（中文格式）
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (error) {
    return '-';
  }
};

export default function ApiBuilderPage() {
  const router = useRouter();
  const [interfaces, setInterfaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [interfaceToDelete, setInterfaceToDelete] = useState(null);
  const [keysDialogOpen, setKeysDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedInterface, setSelectedInterface] = useState(null);

  // 获取接口列表
  const fetchInterfaces = async () => {
    try {
      setIsLoading(true);
      const response = await apiBuilderApi.getInterfaces({
        page: pagination.page,
        limit: pagination.pageSize,
        search: searchTerm,
        status: status || undefined,
      });

      setInterfaces(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
      }));
    } catch (error) {
      console.error('获取接口列表失败:', error);
      toast.error('获取接口列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterfaces();
  }, [pagination.page, pagination.pageSize]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchInterfaces();
  };

  const handleReset = () => {
    setSearchTerm('');
    setStatus('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCreate = () => {
    router.push('/setting/api-builder/edit/new');
  };

  const handleEdit = (id) => {
    router.push(`/setting/api-builder/edit/${id}`);
  };

  const handleDelete = (interface_) => {
    setInterfaceToDelete(interface_);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!interfaceToDelete) return;

    try {
      await apiBuilderApi.deleteInterface(interfaceToDelete.id);
      toast.success('接口已删除');
      setConfirmDialogOpen(false);
      fetchInterfaces();
    } catch (error) {
      console.error('删除接口失败:', error);
      toast.error('删除接口失败');
    }
  };

  const handleManageKeys = (interface_) => {
    setSelectedInterface(interface_);
    setKeysDialogOpen(true);
  };

  const handleTest = (interface_) => {
    setSelectedInterface(interface_);
    setTestDialogOpen(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiBuilderApi.updateInterface(id, { status: newStatus });
      toast.success('状态已更新');
      fetchInterfaces();
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败');
    }
  };

  const getStatusBadge = (status) => {
    return (
      <Badge variant={status === 'active' ? 'default' : 'secondary'}>
        {status === 'active' ? '启用' : '禁用'}
      </Badge>
    );
  };

  const getMethodBadge = (method) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[method] || colors.GET}`}>
        {method}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>接口开发</CardTitle>
            <CardDescription>管理通过SQL生成的动态API接口</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/setting/api-builder/keys')} size="lg" className="sm:w-auto" variant="outline">
              <Key className="h-4 w-4 mr-1" />
              密钥管理
            </Button>
            <Button onClick={handleCreate} size="lg" className="sm:w-auto">
              <Plus className="h-4 w-4 mr-1" />
              新增
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索栏 */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[180px]">
                <Input
                  placeholder="搜索接口名称、端点..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="min-w-[150px]">
                <Select value={status || 'all'} onValueChange={(value) => setStatus(value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="active">启用</SelectItem>
                    <SelectItem value="inactive">禁用</SelectItem>
                  </SelectContent>
                </Select>
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

          {/* 接口列表 */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>接口名称</TableHead>
                  <TableHead>端点</TableHead>
                  <TableHead>版本</TableHead>
                  <TableHead>请求方式</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : interfaces.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      暂无接口
                    </TableCell>
                  </TableRow>
                ) : (
                  interfaces.map((interface_) => (
                    <TableRow key={interface_.id}>
                      <TableCell className="font-medium">{interface_.name}</TableCell>
                      <TableCell className="font-mono text-sm">{getFullApiUrl(interface_.endpoint)}</TableCell>
                      <TableCell>V{interface_.version}</TableCell>
                      <TableCell>{getMethodBadge(interface_.method)}</TableCell>
                      <TableCell>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              interface_.id,
                              interface_.status === 'active' ? 'inactive' : 'active'
                            )
                          }
                          className="cursor-pointer"
                        >
                          {getStatusBadge(interface_.status)}
                        </button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(interface_.createdAt || interface_.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => handleTest(interface_)}
                            title="测试接口"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => handleManageKeys(interface_)}
                            title="管理密钥"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => handleEdit(interface_.id)}
                            title="编辑接口"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => handleDelete(interface_)}
                            title="删除接口"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            onPageSizeChange={(pageSize) =>
              setPagination((prev) => ({ ...prev, pageSize, page: 1 }))
            }
          />
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        title="确认删除接口"
        description={
          interfaceToDelete
            ? `确定要删除接口 "${interfaceToDelete.name}" 吗？此操作无法撤销。`
            : ''
        }
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
      />

      {/* API密钥管理对话框 */}
      {selectedInterface && (
        <ApiKeysDialog
          open={keysDialogOpen}
          onOpenChange={setKeysDialogOpen}
          interface_={selectedInterface}
        />
      )}

      {/* 测试接口对话框 */}
      {selectedInterface && (
        <TestInterfaceDialog
          open={testDialogOpen}
          onOpenChange={setTestDialogOpen}
          interface_={selectedInterface}
        />
      )}
    </div>
  );
}
