'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DatabaseIcon,
  Settings2Icon,
  CodeIcon,
  HistoryIcon,
  PlayIcon,
  TrashIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  XCircleIcon,
} from 'lucide-react';
import { generatorApi } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function GeneratorPage() {
  const [activeTab, setActiveTab] = useState('tables');
  const [tables, setTables] = useState([]);
  const [moduleConfigs, setModuleConfigs] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 数据库表分页状态
  const [tablePagination, setTablePagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // 配置对话框状态
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [configFields, setConfigFields] = useState([]);
  const [jsonInputs, setJsonInputs] = useState({}); // 存储每个字段的JSON输入文本

  // 生成对话框状态
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateOptions, setGenerateOptions] = useState({
    generateBackend: true,
    generateFrontend: true,
  });

  // 删除确认对话框状态
  const [deleteConfigDialog, setDeleteConfigDialog] = useState({
    open: false,
    configId: null,
  });

  const [deleteCodeDialog, setDeleteCodeDialog] = useState({
    open: false,
    configId: null,
  });

  /**
   * 加载数据库表列表
   */
  const loadTables = useCallback(async () => {
    if (activeTab !== 'tables') return;

    try {
      setLoading(true);
      const response = await generatorApi.getTables({
        search: searchTerm,
        page: tablePagination.page,
        limit: tablePagination.pageSize
      });

      // 处理分页响应
      if (response.data?.items) {
        setTables(response.data.items || []);
        // 更新总数
        if (response.data.pagination) {
          setTablePagination(prev => ({
            ...prev,
            total: response.data.pagination.total || 0,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load tables:', error);
      toast.error('加载表列表失败');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, tablePagination.page, tablePagination.pageSize]);

  // 模块配置分页状态
  const [configPagination, setConfigPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // 生成历史分页状态
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  /**
   * 加载模块配置列表
   */
  const loadModuleConfigs = useCallback(async () => {
    if (activeTab !== 'configs') return;

    try {
      setLoading(true);
      const response = await generatorApi.getModuleConfigs({
        page: configPagination.page,
        limit: configPagination.pageSize
      });
      setModuleConfigs(response.data.items || []);

      // 更新总数
      if (response.data.pagination) {
        setConfigPagination(prev => ({
          ...prev,
          total: response.data.pagination.total || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to load module configs:', error);
      toast.error('加载模块配置失败');
    } finally {
      setLoading(false);
    }
  }, [activeTab, configPagination.page, configPagination.pageSize]);

  /**
   * 加载生成历史
   */
  const loadHistory = useCallback(async () => {
    if (activeTab !== 'history') return;

    try {
      setLoading(true);
      const response = await generatorApi.getHistoryList({
        page: historyPagination.page,
        limit: historyPagination.pageSize
      });
      setHistory(response.data.items || []);

      // 更新总数
      if (response.data.pagination) {
        setHistoryPagination(prev => ({
          ...prev,
          total: response.data.pagination.total || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      toast.error('加载生成历史失败');
    } finally {
      setLoading(false);
    }
  }, [activeTab, historyPagination.page, historyPagination.pageSize]);

  // 数据库表列表加载
  useEffect(() => {
    if (activeTab !== 'tables') return;

    const fetchTables = async () => {
      try {
        setLoading(true);
        const response = await generatorApi.getTables({
          search: searchTerm,
          page: tablePagination.page,
          limit: tablePagination.pageSize
        });

        if (response.data?.items) {
          setTables(response.data.items || []);
          if (response.data.pagination) {
            setTablePagination(prev => ({
              ...prev,
              total: response.data.pagination.total || 0,
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load tables:', error);
        toast.error('加载表列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [activeTab, tablePagination.page, tablePagination.pageSize, searchTerm]);

  // 模块配置列表加载
  useEffect(() => {
    if (activeTab !== 'configs') return;

    const fetchConfigs = async () => {
      try {
        setLoading(true);
        const response = await generatorApi.getModuleConfigs({
          page: configPagination.page,
          limit: configPagination.pageSize
        });
        setModuleConfigs(response.data.items || []);

        if (response.data.pagination) {
          setConfigPagination(prev => ({
            ...prev,
            total: response.data.pagination.total || 0,
          }));
        }
      } catch (error) {
        console.error('Failed to load module configs:', error);
        toast.error('加载模块配置失败');
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, [activeTab, configPagination.page, configPagination.pageSize]);

  // 生成历史加载
  useEffect(() => {
    if (activeTab !== 'history') return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await generatorApi.getHistoryList({
          page: historyPagination.page,
          limit: historyPagination.pageSize
        });
        const historyData = response.data?.items || response.data || [];
        setHistory(historyData);

        // 更新总数
        if (response.data?.pagination) {
          setHistoryPagination(prev => ({
            ...prev,
            total: response.data.pagination.total || 0,
          }));
        }
      } catch (error) {
        console.error('Failed to load history:', error);
        toast.error('加载生成历史失败');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [activeTab, historyPagination.page, historyPagination.pageSize]);

  /**
   * 初始化模块配置
   */
  const handleInitializeConfig = async (tableName) => {
    try {
      setLoading(true);
      const response = await generatorApi.initializeModuleConfig(tableName);
      toast.success(`模块配置初始化成功: ${response.data.module_name}`);
      setActiveTab('configs');
      loadModuleConfigs();
    } catch (error) {
      console.error('Failed to initialize config:', error);
      toast.error(error.response?.data?.message || '初始化模块配置失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 查看/编辑配置
   */
  const handleEditConfig = async (config) => {
    try {
      setLoading(true);
      const response = await generatorApi.getModuleConfig(config.id);
      setSelectedConfig(response.data);
      setConfigFields(response.data.fields || []);
      setConfigDialogOpen(true);
    } catch (error) {
      console.error('Failed to load config:', error);
      toast.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新字段配置
   */
  const handleFieldChange = (index, field, value) => {
    const updatedFields = [...configFields];
    updatedFields[index] = {
      ...updatedFields[index],
      [field]: value,
    };
    setConfigFields(updatedFields);
  };

  /**
   * 更新字段的 format_options (支持嵌套路径)
   */
  const handleFormatOptionChange = (index, path, value) => {
    const updatedFields = [...configFields];
    const field = { ...updatedFields[index] };
    const formatOptions = field.format_options || {};

    // 处理嵌套路径，如 "displayName.list"
    const keys = path.split('.');
    let target = formatOptions;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) {
        target[keys[i]] = {};
      }
      target = target[keys[i]];
    }

    target[keys[keys.length - 1]] = value;

    field.format_options = formatOptions;
    updatedFields[index] = field;
    setConfigFields(updatedFields);
  };

  /**
   * 保存配置
   */
  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      await generatorApi.updateModuleConfig(selectedConfig.id, {
        ...selectedConfig,
        fields: configFields,
      });
      toast.success('配置保存成功');
      setConfigDialogOpen(false);
      loadModuleConfigs();
    } catch (error) {
      console.error('Failed to save config:', error);
      toast.error('保存配置失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 生成代码
   */
  const handleGenerate = async (config) => {
    setSelectedConfig(config);
    setGenerateDialogOpen(true);
  };

  const handleConfirmGenerate = async () => {
    try {
      setLoading(true);
      const response = await generatorApi.generateCode(selectedConfig.id, generateOptions);
      toast.success(`代码生成成功！共生成 ${response.data.filesGenerated} 个文件`);
      setGenerateDialogOpen(false);
      loadHistory();
    } catch (error) {
      console.error('Failed to generate code:', error);
      toast.error(error.response?.data?.message || '代码生成失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除配置
   */
  const handleDeleteConfig = (configId) => {
    setDeleteConfigDialog({
      open: true,
      configId,
    });
  };

  /**
   * 确认删除配置
   */
  const handleConfirmDeleteConfig = async () => {
    try {
      setLoading(true);
      await generatorApi.deleteModuleConfig(deleteConfigDialog.configId);
      toast.success('模块配置删除成功');
      setDeleteConfigDialog({ open: false, configId: null });
      loadModuleConfigs();
    } catch (error) {
      console.error('Failed to delete config:', error);
      toast.error('删除模块配置失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除生成的代码
   */
  const handleDeleteGeneratedCode = (configId) => {
    setDeleteCodeDialog({
      open: true,
      configId,
    });
  };

  /**
   * 确认删除生成的代码
   */
  const handleConfirmDeleteCode = async () => {
    try {
      setLoading(true);
      await generatorApi.deleteGeneratedCode(deleteCodeDialog.configId);
      toast.success('生成的代码已删除');
      setDeleteCodeDialog({ open: false, configId: null });
      loadModuleConfigs();
    } catch (error) {
      console.error('Failed to delete generated code:', error);
      toast.error('删除生成的代码失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理数据库表分页变化
   */
  const handleTablePageChange = (newPage) => {
    setTablePagination(prev => ({ ...prev, page: newPage }));
  };

  /**
   * 处理模块配置分页变化
   */
  const handleConfigPageChange = (newPage) => {
    setConfigPagination(prev => ({ ...prev, page: newPage }));
  };

  /**
   * 处理生成历史分页变化
   */
  const handleHistoryPageChange = (newPage) => {
    setHistoryPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tables">
            <DatabaseIcon className="w-4 h-4 mr-2" />
            数据库表
          </TabsTrigger>
          <TabsTrigger value="configs">
            <Settings2Icon className="w-4 h-4 mr-2" />
            模块配置
          </TabsTrigger>
          <TabsTrigger value="history">
            <HistoryIcon className="w-4 h-4 mr-2" />
            生成历史
          </TabsTrigger>
        </TabsList>

        {/* 数据库表列表 */}
        <TabsContent value="tables" className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="搜索表名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={loadTables} variant="outline">
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              刷新
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>数据库表列表</CardTitle>
              <CardDescription>
                选择表来初始化模块配置
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>表名</TableHead>
                    <TableHead>注释</TableHead>
                    <TableHead>字段数</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && activeTab === 'tables' ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        加载中...
                      </TableCell>
                    </TableRow>
                  ) : tables.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    tables.map((table) => (
                      <TableRow key={table.tableName} className="h-12">
                        <TableCell className="font-mono">{table.tableName}</TableCell>
                        <TableCell>{table.comment || '-'}</TableCell>
                        <TableCell>{table.columnCount}</TableCell>
                        <TableCell>
                          {table.isGenerated ? (
                            <Badge variant="secondary">已生成</Badge>
                          ) : (
                            <Badge variant="outline">未生成</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleInitializeConfig(table.tableName)}
                            disabled={table.isGenerated || loading}
                          >
                            初始化配置
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {tablePagination.total > 0 && (
                <Pagination
                  page={tablePagination.page}
                  total={tablePagination.total}
                  pageSize={tablePagination.pageSize}
                  onPageChange={handleTablePageChange}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 模块配置列表 */}
        <TabsContent value="configs" className="space-y-4">
          <div className="flex items-center gap-2">
            <Button onClick={loadModuleConfigs} variant="outline">
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              刷新
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {moduleConfigs.map((config) => (
              <Card key={config.id}>
                <CardHeader>
                  <CardTitle>{config.module_name}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <div>表名: <span className="font-mono">{config.table_name}</span></div>
                    <div>路径: <span className="font-mono">{config.module_path}</span></div>
                    <div>字段数: {config.fields?.length || 0}</div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {config.enable_create && <Badge variant="secondary">新增</Badge>}
                    {config.enable_update && <Badge variant="secondary">编辑</Badge>}
                    {config.enable_delete && <Badge variant="secondary">删除</Badge>}
                    {config.enable_batch_delete && <Badge variant="secondary">批量删除</Badge>}
                    {config.enable_export && <Badge variant="secondary">导出</Badge>}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEditConfig(config)}
                    >
                      <Settings2Icon className="w-4 h-4 mr-1" />
                      配置
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleGenerate(config)}
                    >
                      <CodeIcon className="w-4 h-4 mr-1" />
                      生成
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    {config.generated_files?.length > 0 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDeleteGeneratedCode(config.id)}
                      >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        删除代码
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1"
                      onClick={() => handleDeleteConfig(config.id)}
                    >
                      删除配置
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分页组件 */}
          {moduleConfigs.length > 0 && (
            <Pagination
              page={configPagination.page}
              total={configPagination.total}
              pageSize={configPagination.pageSize}
              onPageChange={handleConfigPageChange}
            />
          )}
        </TabsContent>

        {/* 生成历史 */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center gap-2">
            <Button onClick={loadHistory} variant="outline">
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              刷新
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>生成历史</CardTitle>
              <CardDescription>最近的代码生成记录</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="max-h-[420px]">
                <div className="min-w-[720px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>模块名称</TableHead>
                        <TableHead>操作类型</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>生成文件数</TableHead>
                        <TableHead>生成时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading && activeTab === 'history' ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                            加载中...
                          </TableCell>
                        </TableRow>
                      ) : history.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                            暂无数据
                          </TableCell>
                        </TableRow>
                      ) : (
                        history.map((item) => (
                          <TableRow key={item.id} className="h-12">
                            <TableCell>{item.module?.module_name || item.module_name || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.operation_type}</Badge>
                            </TableCell>
                            <TableCell>
                              {item.success ? (
                                <Badge className="flex items-center gap-1 bg-emerald-500/15 text-emerald-600">
                                  <CheckCircleIcon className="h-4 w-4" />
                                  成功
                                </Badge>
                              ) : (
                                <Badge className="flex items-center gap-1 bg-red-500/10 text-red-600">
                                  <XCircleIcon className="h-4 w-4" />
                                  失败
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{item.files_generated?.length || 0}</TableCell>
                            <TableCell>
                              {item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                              }) : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>

              {historyPagination.total > historyPagination.pageSize && (
                <Pagination
                  page={historyPagination.page}
                  total={historyPagination.total}
                  pageSize={historyPagination.pageSize}
                  onPageChange={handleHistoryPageChange}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 配置对话框 */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>配置模块: {selectedConfig?.module_name}</DialogTitle>
            <DialogDescription>
              配置字段的搜索、显示和表单属性
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {configFields.map((field, index) => {
                const formatOptions = field.format_options || {};
                const displayName = formatOptions.displayName || {};
                const codeMapping = formatOptions.codeMapping || {};

                return (
                  <Card key={field.field_name}>
                    <CardHeader>
                      <CardTitle className="text-sm">{field.field_comment || field.field_name}</CardTitle>
                      <CardDescription className="text-xs font-mono">
                        {field.field_name} ({field.field_type})
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 基础开关 */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.is_searchable}
                            onCheckedChange={(checked) => handleFieldChange(index, 'is_searchable', checked)}
                          />
                          <Label>可搜索</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.show_in_list}
                            onCheckedChange={(checked) => handleFieldChange(index, 'show_in_list', checked)}
                          />
                          <Label>列表显示</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.show_in_form}
                            onCheckedChange={(checked) => handleFieldChange(index, 'show_in_form', checked)}
                          />
                          <Label>表单显示</Label>
                        </div>
                      </div>

                      {/* 自定义显示名称 */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          自定义显示名称 (可选)
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">列表列标题</Label>
                            <Input
                              placeholder="如: 状态"
                              value={displayName.list || ''}
                              onChange={(e) => handleFormatOptionChange(index, 'displayName.list', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">搜索条件标签</Label>
                            <Input
                              placeholder="如: 按状态筛选"
                              value={displayName.search || ''}
                              onChange={(e) => handleFormatOptionChange(index, 'displayName.search', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">表单字段标签</Label>
                            <Input
                              placeholder="如: 选择状态"
                              value={displayName.form || ''}
                              onChange={(e) => handleFormatOptionChange(index, 'displayName.form', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 代码值映射 */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          代码值映射 (用于状态/类型等枚举字段)
                        </Label>
                        <Select
                          value={codeMapping.type || 'none'}
                          onValueChange={(val) => {
                            if (val === 'none') {
                              // 清除 codeMapping
                              const updatedFields = [...configFields];
                              const updatedField = { ...updatedFields[index] };
                              const opts = { ...updatedField.format_options };
                              delete opts.codeMapping;
                              updatedField.format_options = opts;
                              updatedFields[index] = updatedField;
                              setConfigFields(updatedFields);
                            } else {
                              handleFormatOptionChange(index, 'codeMapping.type', val);
                            }
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="选择映射类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">不使用</SelectItem>
                            <SelectItem value="enum">枚举映射</SelectItem>
                          </SelectContent>
                        </Select>

                        {codeMapping.type === 'enum' && (
                          <div className="space-y-1">
                            <Label className="text-xs">映射配置 (JSON格式)</Label>
                            <Textarea
                              placeholder='{"1": {"label": "启用", "variant": "default", "color": "#52c41a"}, "0": {"label": "禁用", "variant": "secondary", "color": "#d9d9d9"}}'
                              value={
                                jsonInputs[`${index}-codeMapping`] !== undefined
                                  ? jsonInputs[`${index}-codeMapping`]
                                  : codeMapping.mappings ? JSON.stringify(codeMapping.mappings, null, 2) : ''
                              }
                              onChange={(e) => {
                                // 保存用户输入的原始文本
                                setJsonInputs(prev => ({
                                  ...prev,
                                  [`${index}-codeMapping`]: e.target.value
                                }));
                              }}
                              onBlur={(e) => {
                                const inputValue = e.target.value.trim();

                                // 如果为空，清除映射
                                if (!inputValue) {
                                  handleFormatOptionChange(index, 'codeMapping.mappings', {});
                                  setJsonInputs(prev => {
                                    const newInputs = { ...prev };
                                    delete newInputs[`${index}-codeMapping`];
                                    return newInputs;
                                  });
                                  return;
                                }

                                // 失去焦点时验证并保存
                                try {
                                  const mappings = JSON.parse(inputValue);
                                  handleFormatOptionChange(index, 'codeMapping.mappings', mappings);
                                  // 验证成功，清除本地输入缓存
                                  setJsonInputs(prev => {
                                    const newInputs = { ...prev };
                                    delete newInputs[`${index}-codeMapping`];
                                    return newInputs;
                                  });
                                } catch (err) {
                                  toast.error(`字段 ${field.field_name} 的映射配置 JSON 格式错误`);
                                }
                              }}
                              rows={4}
                              className="font-mono text-xs"
                            />
                            <p className="text-xs text-muted-foreground">
                              示例: 每个代码对应一个对象,包含 label(显示文本)、variant(样式)、color(颜色)
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveConfig} disabled={loading}>
              保存配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 生成代码对话框 */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>生成代码</DialogTitle>
            <DialogDescription>
              为 {selectedConfig?.module_name} 生成 CRUD 代码
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={generateOptions.generateBackend}
                onCheckedChange={(checked) =>
                  setGenerateOptions({ ...generateOptions, generateBackend: checked })
                }
              />
              <Label>生成后端代码</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={generateOptions.generateFrontend}
                onCheckedChange={(checked) =>
                  setGenerateOptions({ ...generateOptions, generateFrontend: checked })
                }
              />
              <Label>生成前端代码</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmGenerate} disabled={loading}>
              <PlayIcon className="w-4 h-4 mr-2" />
              开始生成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除配置确认对话框 */}
      <ConfirmDialog
        open={deleteConfigDialog.open}
        onOpenChange={(open) => setDeleteConfigDialog({ open, configId: null })}
        onConfirm={handleConfirmDeleteConfig}
        title="删除模块配置"
        description="确定要删除这个模块配置吗？删除后无法恢复。"
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
      />

      {/* 删除生成代码确认对话框 */}
      <ConfirmDialog
        open={deleteCodeDialog.open}
        onOpenChange={(open) => setDeleteCodeDialog({ open, configId: null })}
        onConfirm={handleConfirmDeleteCode}
        title="删除生成的代码"
        description="确定要删除生成的代码吗？此操作无法撤销！"
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
      />
    </div>
  );
}
