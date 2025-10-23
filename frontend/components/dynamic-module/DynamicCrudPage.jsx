'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import { DynamicFilters } from './DynamicFilters';
import { DynamicTable } from './DynamicTable';
import { DynamicForm } from './DynamicForm';

/**
 * 动态CRUD页面组件
 * 根据配置自动渲染完整的CRUD功能页面
 */
export function DynamicCrudPage({ config }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [formDialog, setFormDialog] = useState({
    open: false,
    mode: 'create',
    data: null,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
  });
  const [batchDeleteDialog, setBatchDeleteDialog] = useState({
    open: false,
  });

  // 检查权限（简化版本，实际应该从权限系统获取）
  const hasPermission = (action) => {
    // TODO: 集成真实的权限系统
    return true;
  };

  const canCreate = hasPermission(config.permissions?.create);
  const canUpdate = hasPermission(config.permissions?.update);
  const canDelete = hasPermission(config.permissions?.delete);

  // 加载数据
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(config.api.list, {
        params: {
          ...filters,
          page: pagination.page,
          limit: pagination.pageSize,
        },
      });

      // 处理不同的响应格式
      const responseData = response.data || response;
      const items = responseData.items || responseData.data || [];
      const total = responseData.pagination?.total || responseData.total || 0;

      setData(Array.isArray(items) ? items : []);
      setPagination((prev) => ({ ...prev, total }));
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和分页/筛选变化时加载数据
  useEffect(() => {
    fetchData();
  }, [pagination.page]);

  // 搜索
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setTimeout(() => fetchData(), 0);
  };

  // 重置筛选
  const handleResetFilters = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
    setTimeout(() => fetchData(), 0);
  };

  // 分页变化
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // 打开新增对话框
  const handleAdd = () => {
    if (!canCreate) {
      toast.error('您没有新增权限');
      return;
    }
    setFormDialog({
      open: true,
      mode: 'create',
      data: null,
    });
  };

  // 打开编辑对话框
  const handleEdit = (row) => {
    if (!canUpdate) {
      toast.error('您没有编辑权限');
      return;
    }
    setFormDialog({
      open: true,
      mode: 'edit',
      data: row,
    });
  };

  // 提交表单
  const handleFormSubmit = async (formData) => {
    try {
      if (formDialog.mode === 'create') {
        await axios.post(config.api.create, formData);
        toast.success('创建成功');
      } else {
        const url = config.api.update.replace(':id', formDialog.data.id);
        await axios.put(url, formData);
        toast.success('更新成功');
      }
      setFormDialog({ open: false, mode: 'create', data: null });
      fetchData();
    } catch (error) {
      console.error('提交失败:', error);
      toast.error(error.response?.data?.message || '操作失败');
      throw error;
    }
  };

  // 打开删除确认对话框
  const handleDelete = (row) => {
    if (!canDelete) {
      toast.error('您没有删除权限');
      return;
    }
    setDeleteDialog({
      open: true,
      id: row.id,
    });
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    try {
      const url = config.api.delete.replace(':id', deleteDialog.id);
      await axios.delete(url);
      toast.success('删除成功');
      setDeleteDialog({ open: false, id: null });
      fetchData();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error(error.response?.data?.message || '删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (!canDelete) {
      toast.error('您没有删除权限');
      return;
    }
    if (selectedRows.length === 0) {
      toast.warning('请选择要删除的项');
      return;
    }
    setBatchDeleteDialog({ open: true });
  };

  // 确认批量删除
  const handleConfirmBatchDelete = async () => {
    try {
      // 批量删除逻辑（可能需要后端支持）
      await Promise.all(
        selectedRows.map((id) => {
          const url = config.api.delete.replace(':id', id);
          return axios.delete(url);
        })
      );
      toast.success(`成功删除 ${selectedRows.length} 项`);
      setBatchDeleteDialog({ open: false });
      setSelectedRows([]);
      fetchData();
    } catch (error) {
      console.error('批量删除失败:', error);
      toast.error(error.response?.data?.message || '批量删除失败');
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{config.description || config.moduleName}</h1>
          <p className="text-muted-foreground mt-2">
            {config.description ? `管理${config.description}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {config.features?.batchDelete && selectedRows.length > 0 && canDelete && (
            <Button variant="destructive" onClick={handleBatchDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              批量删除 ({selectedRows.length})
            </Button>
          )}
          {config.features?.create && canCreate && (
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              新增
            </Button>
          )}
        </div>
      </div>

      {/* 筛选器 */}
      <DynamicFilters
        fields={config.fields}
        filters={filters}
        onChange={setFilters}
        onSearch={handleSearch}
        onReset={handleResetFilters}
      />

      {/* 数据表格 */}
      <DynamicTable
        data={data}
        fields={config.fields}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        selectedRows={selectedRows}
        onSelectRows={setSelectedRows}
        features={{
          update: config.features?.update && canUpdate,
          delete: config.features?.delete && canDelete,
          batchDelete: config.features?.batchDelete && canDelete,
        }}
      />

      {/* 分页 */}
      {pagination.total > 0 && (
        <div className="flex justify-end">
          <Pagination
            page={pagination.page}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* 表单对话框 */}
      <DynamicForm
        open={formDialog.open}
        onOpenChange={(open) =>
          setFormDialog((prev) => ({ ...prev, open }))
        }
        fields={config.fields}
        data={formDialog.data}
        mode={formDialog.mode}
        onSubmit={handleFormSubmit}
        title={
          formDialog.mode === 'create'
            ? `新增${config.description || ''}`
            : `编辑${config.description || ''}`
        }
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        onConfirm={handleConfirmDelete}
        title="确认删除"
        description="确定要删除这条记录吗？此操作无法撤销。"
        variant="destructive"
      />

      {/* 批量删除确认对话框 */}
      <ConfirmDialog
        open={batchDeleteDialog.open}
        onOpenChange={(open) => setBatchDeleteDialog({ open })}
        onConfirm={handleConfirmBatchDelete}
        title="确认批量删除"
        description={`确定要删除选中的 ${selectedRows.length} 条记录吗？此操作无法撤销。`}
        variant="destructive"
      />
    </div>
  );
}
