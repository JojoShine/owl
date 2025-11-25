'use client';

import { useState, useEffect } from 'react';
import { roleApi } from '@/lib/api';
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
import { TableLoading } from '@/components/ui/table-loading';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import RoleFormDialog from '@/components/roles/role-form-dialog';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await roleApi.getRoles({
        search: searchTerm,
        page: pagination.page,
        limit: pagination.pageSize
      });
      // 实际API返回格式：{ success: true, data: { items: [...], pagination: {...} } }
      const rolesData = response.data?.items || response.data || [];
      setRoles(Array.isArray(rolesData) ? rolesData : []);

      // 更新分页信息
      if (response.data?.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total || 0
        }));
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.pageSize]);

  // 搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 })); // 重置到第一页
    setTimeout(() => fetchRoles(), 0);
  };

  // 重置
  const handleReset = () => {
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(() => fetchRoles(), 0);
  };

  // 分页变化
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // 每页数量变化
  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
  };

  // 新增角色
  const handleAdd = () => {
    setEditingRole(null);
    setIsDialogOpen(true);
  };

  // 编辑角色
  const handleEdit = (role) => {
    setEditingRole(role);
    setIsDialogOpen(true);
  };

  // 删除角色
  const handleDelete = (role) => {
    setRoleToDelete(role);
    setConfirmDialogOpen(true);
  };

  // 确认删除角色
  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      await roleApi.deleteRole(roleToDelete.id);
      toast.success('删除角色成功');
      fetchRoles();
    } catch (error) {
      console.error('删除角色失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '删除失败';
      toast.error(errorMessage);
    } finally {
      setRoleToDelete(null);
    }
  };

  // 状态徽章颜色
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: '启用', variant: 'default' },
      inactive: { label: '禁用', variant: 'secondary' },
    };
    const config = statusMap[status] || statusMap.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>角色列表</CardTitle>
            <CardDescription>查看和维护系统角色配置</CardDescription>
          </div>
          <Button onClick={handleAdd} className="sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            新增角色
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索栏 */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[180px]">
                <Input
                  placeholder="搜索角色名称、代码..."
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
                <TableHead>角色名称</TableHead>
                <TableHead>角色代码</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoading colSpan={7} />
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{role.code}</code>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{role.description || '-'}</TableCell>
                    <TableCell>{getStatusBadge(role.status)}</TableCell>
                    <TableCell>{role.sort}</TableCell>
                    <TableCell>
                      {role.created_at
                        ? new Date(role.created_at).toLocaleDateString('zh-CN')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(role)}
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
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      {/* 角色表单弹窗 */}
      <RoleFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        role={editingRole}
        onSuccess={fetchRoles}
      />

      {/* 确认删除对话框 */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        title="确认删除角色"
        description={
          roleToDelete
            ? `确定要删除角色 "${roleToDelete.name}" 吗？此操作无法撤销。`
            : ''
        }
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
      />
    </div>
  );
}
