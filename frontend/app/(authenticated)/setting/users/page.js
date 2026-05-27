'use client';

import { useState, useEffect } from 'react';
import { userApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import UserFormDialog from '@/components/users/user-form-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchFilter } from '@/components/common/SearchFilter';
import { DataTable } from '@/components/common/DataTable';
import { usePermission } from '@/lib/hooks/usePermission';

export default function UsersPage() {
  const { canCreate, canUpdate, canDelete } = usePermission();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValues, setSearchValues] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getUsers({
        search: searchValues.keyword || '',
        page: pagination.page,
        limit: pagination.pageSize
      });
      const usersData = response.data?.items || response.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);

      // 更新分页信息
      if (response.data?.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total || 0
        }));
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.pageSize]);

  // 搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 })); // 重置到第一页
    setTimeout(() => fetchUsers(), 0);
  };

  // 重置
  const handleReset = () => {
    setSearchValues({});
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(() => fetchUsers(), 0);
  };

  // 分页变化
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // 每页数量变化
  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
  };

  // 新增用户
  const handleAdd = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  // 编辑用户
  const handleEdit = (user) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  // 删除用户
  const handleDelete = (user) => {
    setUserToDelete(user);
    setConfirmDialogOpen(true);
  };

  // 确认删除用户
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await userApi.deleteUser(userToDelete.id);
      toast.success('删除用户成功');
      fetchUsers();
    } catch (error) {
      console.error('删除用户失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '删除失败';
      toast.error(errorMessage);
    } finally {
      setUserToDelete(null);
    }
  };

  // 状态徽章颜色
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: '正常', variant: 'default' },
      inactive: { label: '禁用', variant: 'secondary' },
      banned: { label: '封禁', variant: 'destructive' },
    };
    const config = statusMap[status] || statusMap.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 搜索字段配置
  const searchFields = [
    {
      type: 'text',
      name: 'keyword',
      placeholder: '搜索用户名、邮箱...'
    }
  ];

  // 表格列配置
  const columns = [
    {
      key: 'username',
      label: '用户名',
      cellClassName: 'font-medium'
    },
    {
      key: 'real_name',
      label: '真实姓名',
      render: (value) => value || '-'
    },
    {
      key: 'email',
      label: '邮箱'
    },
    {
      key: 'phone',
      label: '手机号',
      render: (value) => value || '-'
    },
    {
      key: 'status',
      label: '状态',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'last_login_at',
      label: '最后登录',
      render: (value) => value ? new Date(value).toLocaleString('zh-CN') : '-'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>用户列表</CardTitle>
            <CardDescription>查看和搜索系统用户列表</CardDescription>
          </div>
          {canCreate('user') && (
            <Button onClick={handleAdd} className="sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              新增用户
            </Button>
          )}
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
            data={users}
            loading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            actions={(user) => (
              <>
                {canUpdate('user') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {canDelete('user') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(user)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </>
            )}
          />
        </CardContent>
      </Card>

      {/* 用户表单弹窗 */}
      <UserFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={editingUser}
        onSuccess={fetchUsers}
      />

      {/* 确认删除对话框 */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        title="确认删除用户"
        description={
          userToDelete
            ? `确定要删除用户 "${userToDelete.username}" 吗？此操作无法撤销。`
            : ''
        }
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
      />
    </div>
  );
}
