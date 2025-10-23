'use client';

import { useState, useEffect } from 'react';
import { departmentApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, Users } from 'lucide-react';
import DepartmentFormDialog from '@/components/departments/department-form-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [expandedDepartments, setExpandedDepartments] = useState(new Set());
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  // 获取部门树
  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await departmentApi.getDepartmentTree();
      // 实际API返回格式：{ success: true, data: { items: [...] } } 或直接数组
      const departmentsData = response.data?.items || response.data || [];
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
      // 默认展开所有一级部门
      const topLevelIds = (Array.isArray(departmentsData) ? departmentsData : []).map(d => d.id);
      setExpandedDepartments(new Set(topLevelIds));
    } catch (error) {
      console.error('获取部门列表失败:', error);
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // 新增部门
  const handleAdd = (parentDepartment = null) => {
    setEditingDepartment(parentDepartment ? { parent_id: parentDepartment.id } : null);
    setIsDialogOpen(true);
  };

  // 编辑部门
  const handleEdit = (department) => {
    setEditingDepartment(department);
    setIsDialogOpen(true);
  };

  // 删除部门
  const handleDelete = (department) => {
    setDepartmentToDelete(department);
    setConfirmDialogOpen(true);
  };

  // 确认删除部门
  const handleConfirmDelete = async () => {
    if (!departmentToDelete) return;

    try {
      await departmentApi.deleteDepartment(departmentToDelete.id);
      toast.success('删除部门成功');
      fetchDepartments();
    } catch (error) {
      console.error('删除部门失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '删除失败';
      toast.error(errorMessage);
    } finally {
      setDepartmentToDelete(null);
    }
  };

  // 切换展开/收起
  const toggleExpanded = (departmentId) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(departmentId)) {
      newExpanded.delete(departmentId);
    } else {
      newExpanded.add(departmentId);
    }
    setExpandedDepartments(newExpanded);
  };

  // 状态徽章
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: '启用', variant: 'default' },
      inactive: { label: '禁用', variant: 'secondary' },
    };
    const config = statusMap[status] || statusMap.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 渲染部门树
  const renderDepartmentTree = (departmentList, level = 0) => {
    return departmentList.map((department) => {
      const hasChildren = department.children && department.children.length > 0;
      const isExpanded = expandedDepartments.has(department.id);

      return (
        <div key={department.id}>
          <Card
            className="mb-2 hover:shadow-sm transition-shadow"
            style={{ marginLeft: `${level * 24}px` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* 展开/收起按钮 */}
                  {hasChildren ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleExpanded(department.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    <div className="w-6" />
                  )}

                  {/* 部门信息 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{department.name}</span>
                      {getStatusBadge(department.status)}
                      {department.code && (
                        <code className="bg-muted px-2 py-0.5 rounded text-xs">{department.code}</code>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {department.leader && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>负责人: {department.leader.real_name || department.leader.username}</span>
                        </div>
                      )}
                      {department.description && (
                        <span className="max-w-md truncate">{department.description}</span>
                      )}
                      <span>排序: {department.sort}</span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAdd(department)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      添加子部门
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(department)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(department)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 递归渲染子部门 */}
          {hasChildren && isExpanded && renderDepartmentTree(department.children, level + 1)}
        </div>
      );
    });
  };

  // 统计部门数量
  const countDepartments = (deptList) => {
    let count = 0;
    deptList.forEach(dept => {
      count += 1;
      if (dept.children && dept.children.length > 0) {
        count += countDepartments(dept.children);
      }
    });
    return count;
  };

  // 统计启用的部门数量
  const countActiveDepartments = (deptList) => {
    let count = 0;
    deptList.forEach(dept => {
      if (dept.status === 'active') count += 1;
      if (dept.children && dept.children.length > 0) {
        count += countActiveDepartments(dept.children);
      }
    });
    return count;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          onClick={() => {
            const getAllIds = (deptList) => {
              let ids = [];
              deptList.forEach(dept => {
                ids.push(dept.id);
                if (dept.children && dept.children.length > 0) {
                  ids = ids.concat(getAllIds(dept.children));
                }
              });
              return ids;
            };
            setExpandedDepartments(new Set(getAllIds(departments)));
          }}
          variant="outline"
        >
          全部展开
        </Button>
        <Button onClick={() => setExpandedDepartments(new Set())} variant="outline">
          全部收起
        </Button>
        <Button onClick={() => handleAdd()}>
          <Plus className="h-4 w-4 mr-2" />
          新增部门
        </Button>
      </div>

      {/* 统计信息 */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">部门总数</p>
              <p className="text-xl font-bold">{countDepartments(departments)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">一级部门</p>
              <p className="text-xl font-bold">{departments.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">启用部门</p>
              <p className="text-xl font-bold">{countActiveDepartments(departments)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">禁用部门</p>
              <p className="text-xl font-bold">{countDepartments(departments) - countActiveDepartments(departments)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 部门树 */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : departments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <p>暂无部门</p>
            <Button onClick={() => handleAdd()} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              创建第一个部门
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>{renderDepartmentTree(departments)}</div>
      )}

      {/* 部门表单弹窗 */}
      <DepartmentFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        department={editingDepartment}
        onSuccess={fetchDepartments}
      />

      {/* 确认删除对话框 */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        title="确认删除部门"
        description={
          departmentToDelete
            ? `确定要删除部门 "${departmentToDelete.name}" 吗？如果有子部门也会一起删除。此操作无法撤销。`
            : ''
        }
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
      />
    </div>
  );
}
