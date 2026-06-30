'use client';

import { useState, useEffect, useMemo } from 'react';
import { departmentApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Plus } from 'lucide-react';
import { SearchFilter } from '@/components/common/SearchFilter';
import { TreeView } from '@/components/common/TreeView';
import { DepartmentTreeNode } from '@/components/common/TreeNodeRenderers';
import DepartmentFormDialog from '@/components/departments/department-form-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { usePermission } from '@/lib/hooks/usePermission';

export default function DepartmentsPage() {
  const { canCreate, canUpdate, canDelete } = usePermission();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [expandedDepartments, setExpandedDepartments] = useState(new Set());
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [searchValues, setSearchValues] = useState({
    keyword: '',
    status: 'all'
  });

  // 获取部门树
  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await departmentApi.getDepartmentTree();
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

  // 搜索过滤逻辑
  const filteredDepartments = useMemo(() => {
    const filterNode = (node) => {
      const matchKeyword = !searchValues.keyword ||
        node.name.toLowerCase().includes(searchValues.keyword.toLowerCase()) ||
        (node.code && node.code.toLowerCase().includes(searchValues.keyword.toLowerCase())) ||
        (node.description && node.description.toLowerCase().includes(searchValues.keyword.toLowerCase()));

      const matchStatus = searchValues.status === 'all' || node.status === searchValues.status;

      const nodeMatches = matchKeyword && matchStatus;

      // 如果有子节点，递归过滤
      let filteredChildren = [];
      if (node.children && node.children.length > 0) {
        filteredChildren = node.children
          .map(child => filterNode(child))
          .filter(child => child !== null);
      }

      // 如果节点匹配或有匹配的子节点，则保留该节点
      if (nodeMatches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren
        };
      }

      return null;
    };

    return departments
      .map(dept => filterNode(dept))
      .filter(dept => dept !== null);
  }, [departments, searchValues]);

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

  // 搜索字段配置
  const searchFields = [
    {
      type: 'text',
      name: 'keyword',
      placeholder: '搜索部门名称、代码、描述...'
    },
    {
      type: 'select',
      name: 'status',
      placeholder: '选择状态',
      options: [
        { label: '全部状态', value: 'all' },
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' }
      ]
    }
  ];

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

      {/* 搜索过滤区域 */}
      <div className="bg-card rounded-lg p-6 border">
        <SearchFilter
          fields={searchFields}
          values={searchValues}
          onChange={setSearchValues}
          onSearch={() => {}}
          onReset={() => setSearchValues({ keyword: '', status: 'all' })}
          extra={
            canCreate('department') && (
              <Button onClick={() => handleAdd()} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                新增部门
              </Button>
            )
          }
        />
      </div>

      {/* 操作按钮 */}
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
      </div>

      {/* 部门树 */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <Loading size="md" variant="pulse" />
          </CardContent>
        </Card>
      ) : filteredDepartments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <p>{searchValues.keyword || searchValues.status !== 'all' ? '未找到匹配的部门' : '暂无部门'}</p>
            {canCreate('department') && (
              <Button onClick={() => handleAdd()} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                创建第一个部门
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <TreeView
          data={filteredDepartments}
          renderNode={(node) => (
            <DepartmentTreeNode
              node={node}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddChild={handleAdd}
              canCreate={canCreate('department')}
              canUpdate={canUpdate('department')}
              canDelete={canDelete('department')}
            />
          )}
          onToggleExpand={toggleExpanded}
          expandedIds={expandedDepartments}
        />
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
