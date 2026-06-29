'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Download, Upload } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from '@/lib/utils/module-client';
import { usePermission } from '@/lib/hooks/usePermission';
import { DynamicFilters } from './DynamicFilters';
import { DynamicTable } from './DynamicTable';
import { DynamicForm } from './DynamicForm';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

/**
 * 动态CRUD页面组件
 * 根据配置自动渲染完整的CRUD功能页面
 */
export function DynamicCrudPage({ config }) {
  const { canCreate: checkCreate, canUpdate: checkUpdate, canDelete: checkDelete } = usePermission();

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
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef(null);

  // 获取资源名称（从config中提取）
  const resource = config.resource || config.moduleName?.toLowerCase();

  // 检查权限
  const canCreate = resource && checkCreate(resource);
  const canUpdate = resource && checkUpdate(resource);
  const canDelete = resource && checkDelete(resource);

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
  }, [pagination.page, pagination.pageSize]);

  // 搜索
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setTimeout(() => fetchData(), 0);
  };

  // 重置筛选
  const handleResetFilters = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
    // 延迟执行查询，确保状态已更新
    setTimeout(() => fetchData(), 50);
  };

  // 分页变化
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // 每页条数变化
  const handlePageSizeChange = (newPageSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }));
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

  // 打开查看对话框
  const handleView = (row) => {
    setFormDialog({
      open: true,
      mode: 'view',
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
      // 错误已通过 toast 显示，不再抛出以避免重复提示
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

  // 下载导入模板
  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(config.api.downloadTemplate);
      const template = response.data;

      // 使用 ExcelJS 创建 Excel 文件
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('数据');

      // 添加第一行：字段名
      const headerRow = worksheet.addRow(template.fields.map(f => f.name));
      headerRow.font = { bold: true };

      // 添加第二行：中文注释
      const commentRow = worksheet.addRow(template.fields.map(f => f.comment));

      // 设置列宽
      template.fields.forEach((field, index) => {
        const column = worksheet.getColumn(index + 1);
        column.width = Math.max(field.name.length, field.comment.length, 12);
      });

      // 生成 Excel 文件
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.moduleName}_导入模板.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success('模板下载成功');
    } catch (error) {
      console.error('下载模板失败:', error);
      toast.error('下载模板失败');
    }
  };

  // 处理文件选择
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportLoading(true);
      setImportResult(null);
      setImportProgress(0);

      // 读取 Excel 文件
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          setImportProgress(20); // 文件读取完成

          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets['数据'] || workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(worksheet);

          if (rows.length === 0) {
            toast.error('Excel 文件中没有数据');
            setImportLoading(false);
            setImportProgress(0);
            return;
          }

          setImportProgress(40); // 数据解析完成

          // 跳过前两行（注释行和示例数据行），只保留实际数据
          // sheet_to_json 会自动使用第一行作为列名，所以返回的数据从第二行开始
          // 我们需要跳过第一条记录（注释行）和第二条记录（示例数据行）
          const actualData = rows.slice(2);

          if (actualData.length === 0) {
            toast.error('Excel 文件中没有实际数据，请从第四行开始填入数据');
            setImportLoading(false);
            setImportProgress(0);
            return;
          }

          setImportProgress(60); // 数据准备完成

          // 调用导入接口
          const result = await axios.post(config.api.import, { rows: actualData });

          setImportProgress(90); // 导入完成
          setImportResult(result.data);

          setTimeout(() => {
            setImportProgress(100); // 处理完成
          }, 300);

          if (result.data.success) {
            toast.success(result.data.message);
            // 延迟1秒后刷新数据和关闭进度，让用户看到导入完成的提示
            setTimeout(() => {
              fetchData();
              setImportLoading(false);
              setImportProgress(0);
            }, 1200);
          } else {
            setImportDialogOpen(true);
            setImportLoading(false);
          }
        } catch (error) {
          console.error('导入失败:', error);
          toast.error(error.response?.data?.message || '导入失败');
          setImportLoading(false);
          setImportProgress(0);
        } finally {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('处理文件失败:', error);
      toast.error('处理文件失败');
      setImportLoading(false);
      setImportProgress(0);
    }
  };

  // 触发文件选择
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* 页面卡片 */}
      <Card>
        {/* 页面标题 */}
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{config.description || config.moduleName}</CardTitle>
            <CardDescription>
              {config.description ? `管理${config.description}` : ''}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {config.features?.batchDelete && selectedRows.length > 0 && canDelete && (
              <Button variant="destructive" onClick={handleBatchDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                批量删除 ({selectedRows.length})
              </Button>
            )}
            {config.features?.import && canCreate && (
              <>
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  下载模板
                </Button>
                <Button variant="outline" onClick={handleImportClick} disabled={importLoading}>
                  <Upload className="h-4 w-4 mr-2" />
                  导入数据
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </>
            )}
            {config.features?.create && canCreate && (
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                新增
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 导入进度遮罩层 */}
          {importLoading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <Card className="w-[400px] p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">数据导入中</h3>
                    <p className="text-sm text-muted-foreground mt-2">正在处理您的文件，请稍候...</p>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {importProgress === 0 ? '准备中...' : importProgress === 100 ? '处理完成' : `${importProgress}%`}
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* 导入结果 Dialog */}
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
              <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
                <DialogTitle className="text-xl">导入结果</DialogTitle>
                <DialogDescription className="text-base">
                  {importResult?.message}
                </DialogDescription>
              </DialogHeader>

              {importResult?.errors && importResult.errors.length > 0 && (
                <>
                  <div className="px-6 pb-2 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-destructive">
                        共发现 {importResult.errors.length} 个错误
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
                    <div className="space-y-2">
                      {importResult.errors.map((error, idx) => {
                        // 查找字段配置以获取中文注释
                        const fieldConfig = config.fields?.find(f => f.name === error.field);
                        const fieldLabel = fieldConfig?.label || fieldConfig?.formLabel || error.field;

                        return (
                          <div
                            key={idx}
                            className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 hover:bg-destructive/15 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center text-destructive text-xs font-semibold mt-0.5">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                                  <span className="font-semibold text-sm">
                                    第 {error.row} 行
                                  </span>
                                  {error.columnNum && (
                                    <span className="text-xs text-muted-foreground">
                                      第 {error.columnNum} 列
                                    </span>
                                  )}
                                  {error.field && (
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                      {fieldLabel}
                                      {error.field !== fieldLabel && (
                                        <span className="text-muted-foreground ml-1">({error.field})</span>
                                      )}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-destructive break-words">
                                  {error.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="px-6 py-4 border-t flex-shrink-0">
                <Button onClick={() => setImportDialogOpen(false)} className="w-full">
                  确定
                </Button>
              </div>
            </DialogContent>
          </Dialog>

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
            onView={handleView}
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
            <Pagination
              page={pagination.page}
              total={pagination.total}
              pageSize={pagination.pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>

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
            : formDialog.mode === 'view'
            ? `查看${config.description || ''}`
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
