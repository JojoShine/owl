'use client';

import { useState, useEffect } from 'react';
import { userApi } from '@/lib/api';
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
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import UserFormDialog from '@/components/users/user-form-dialog';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
        search: searchTerm,
        page: pagination.page,
        limit: pagination.pageSize
      });
      // 实际API返回格式：{ success: true, data: { items: [...], pagination: {...} } }
      // axios拦截器返回response.data，所以我们得到的是整个响应对象
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
  }, [pagination.page]);

  // 搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 })); // 重置到第一页
    setTimeout(() => fetchUsers(), 0);
  };

  // 重置
  const handleReset = () => {
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(() => fetchUsers(), 0);
  };

  // 分页变化
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>用户列表</CardTitle>
            <CardDescription>查看和搜索系统用户列表</CardDescription>
          </div>
          <Button onClick={handleAdd} className="sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            新增用户
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索栏 */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[180px]">
                <Input
                  placeholder="搜索用户名、邮箱..."
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
                <TableHead>用户名</TableHead>
                <TableHead>真实姓名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最后登录</TableHead>
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
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.real_name || '-'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleString('zh-CN')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user)}
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
