'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DatabaseIcon,
  Settings2Icon,
  CodeIcon,
  HistoryIcon,
  PlayIcon,
  TrashIcon,
  Trash2Icon,
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
import TablesSection from '@/components/generator/TablesSection';
import ConfigsSection from '@/components/generator/ConfigsSection';
import HistorySection from '@/components/generator/HistorySection';
import ConfigDialog from '@/components/generator/ConfigDialog';

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
  const [isLoadingConfig, setIsLoadingConfig] = useState(false); // 仅用于编辑配置的加载状态

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
      const response = await generatorApi.initializeModuleConfig(tableName);
      toast.success(`模块配置初始化成功: ${response.data.module_name}`);
      setActiveTab('configs');
      loadModuleConfigs();
    } catch (error) {
      console.error('Failed to initialize config:', error);
      toast.error(error.response?.data?.message || '初始化模块配置失败');
    }
  };

  /**
   * 查看/编辑配置
   */
  const handleEditConfig = async (config) => {
    try {
      setIsLoadingConfig(true);
      const response = await generatorApi.getModuleConfig(config.id);
      setSelectedConfig(response.data);
      setConfigFields(response.data.fields || []);
      setConfigDialogOpen(true);
    } catch (error) {
      console.error('Failed to load config:', error);
      toast.error('加载配置失败');
    } finally {
      setIsLoadingConfig(false);
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
   * 更新模块配置
   */
  const handleModuleConfigChange = (field, value) => {
    setSelectedConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * 保存配置
   */
  const handleSaveConfig = async () => {
    try {
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
      const response = await generatorApi.generateCode(selectedConfig.id, generateOptions);
      toast.success('代码生成成功！');
      setGenerateDialogOpen(false);
      loadModuleConfigs(); // 刷新模块配置列表，更新状态
      loadHistory();
    } catch (error) {
      console.error('Failed to generate code:', error);
      toast.error(error.response?.data?.message || '代码生成失败');
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
      await generatorApi.deleteModuleConfig(deleteConfigDialog.configId);
      toast.success('模块配置删除成功');
      setDeleteConfigDialog({ open: false, configId: null });
      loadModuleConfigs();
      loadTables(); // 刷新表列表，更新表的生成状态
    } catch (error) {
      console.error('Failed to delete config:', error);
      toast.error('删除模块配置失败');
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
      await generatorApi.deleteGeneratedCode(deleteCodeDialog.configId);
      toast.success('生成的代码已删除');
      setDeleteCodeDialog({ open: false, configId: null });
      loadModuleConfigs();
      loadTables(); // 刷新表列表，更新表的生成状态
    } catch (error) {
      console.error('Failed to delete generated code:', error);
      toast.error('删除生成的代码失败');
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

  /**
   * 处理生成历史每页数量变化
   */
  const handleHistoryPageSizeChange = (newPageSize) => {
    setHistoryPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
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
          <TablesSection
            tables={tables}
            loading={loading && activeTab === 'tables'}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={loadTables}
            onInitialize={handleInitializeConfig}
            pagination={tablePagination}
            onPageChange={handleTablePageChange}
          />
        </TabsContent>

        {/* 模块配置列表 */}
        <TabsContent value="configs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle>模块配置</CardTitle>
                <CardDescription>已创建的模块配置</CardDescription>
              </div>
              <Button onClick={loadModuleConfigs} variant="outline">
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                刷新
              </Button>
            </CardHeader>
            <CardContent>
              <ConfigsSection
                configs={moduleConfigs}
                loading={loading && activeTab === 'configs'}
                onEdit={handleEditConfig}
                onGenerate={handleGenerate}
                onDeleteCode={handleDeleteGeneratedCode}
                onDeleteConfig={handleDeleteConfig}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 生成历史 */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>生成历史</CardTitle>
              <CardDescription>最近的代码生成记录</CardDescription>
              <div className="pt-2">
                <Button onClick={loadHistory} variant="outline" size="lg">
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  刷新
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <HistorySection
                history={history}
                loading={loading && activeTab === 'history'}
                pagination={historyPagination}
                onPageChange={handleHistoryPageChange}
                onPageSizeChange={handleHistoryPageSizeChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        config={selectedConfig}
        fields={configFields}
        jsonInputs={jsonInputs}
        onFieldChange={handleFieldChange}
        onFormatOptionChange={handleFormatOptionChange}
        onModuleConfigChange={handleModuleConfigChange}
        onJsonInputChange={(index, type, value) => {
          setJsonInputs(prev => ({
            ...prev,
            [`${index}-${type}`]: value
          }));
        }}
        onSave={handleSaveConfig}
        loading={isLoadingConfig}
        // 生成 dialog
        generateOpen={generateDialogOpen}
        onGenerateOpenChange={setGenerateDialogOpen}
        generateOptions={generateOptions}
        onGenerateOptionsChange={setGenerateOptions}
        onConfirmGenerate={handleConfirmGenerate}
        // 确认 dialog
        deleteConfigDialogOpen={deleteConfigDialog.open}
        onDeleteConfigDialogOpenChange={(open) => setDeleteConfigDialog({ open, configId: null })}
        onConfirmDeleteConfig={handleConfirmDeleteConfig}
        deleteCodeDialogOpen={deleteCodeDialog.open}
        onDeleteCodeDialogOpenChange={(open) => setDeleteCodeDialog({ open, configId: null })}
        onConfirmDeleteCode={handleConfirmDeleteCode}
      />
    </div>
  );
}
