'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiBuilderApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Play } from 'lucide-react';

// 从SQL中提取参数（:paramName格式）
const extractSqlParameters = (sql) => {
  const matches = sql.match(/:(\w+)/g);
  if (!matches) return [];
  // 去重
  const unique = [...new Set(matches.map(m => m.substring(1)))];
  return unique;
};

export default function ApiBuilderEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const isNewMode = id === 'new';

  const [isLoading, setIsLoading] = useState(!isNewMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endpoint: '',
    method: 'GET',
    version: 1,
    sql_query: '',
    parameters: [],
    parameterValues: {}, // 参数值
    returnColumns: [], // 返回列信息
    require_auth: true,
    rate_limit: 1000,
    pageSize: 10,
  });

  useEffect(() => {
    if (!isNewMode) {
      fetchInterface();
    }
  }, []);

  const fetchInterface = async () => {
    try {
      const response = await apiBuilderApi.getInterfaceById(id);
      const interfaceData = response.data || {};
      // 移除 /custom 前缀以便编辑
      if (interfaceData.endpoint?.startsWith('/custom')) {
        interfaceData.endpoint = interfaceData.endpoint.substring(7); // 移除 '/custom'
      }
      setFormData(interfaceData);
    } catch (error) {
      console.error('获取接口详情失败:', error);
      toast.error('获取接口详情失败');
      router.push('/setting/api-builder');
    } finally {
      setIsLoading(false);
    }
  };

  // 自动识别SQL中的参数
  const extractedParams = useMemo(() => {
    const paramNames = extractSqlParameters(formData.sql_query);
    return paramNames.map(name => ({
      name,
      type: 'string',
      required: true,
      description: '',
    }));
  }, [formData.sql_query]);

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleTestSql = async () => {
    if (!formData.sql_query.trim()) {
      toast.error('请输入SQL查询语句');
      return;
    }

    // 验证所有必要参数都已填写
    const missingParams = extractedParams.filter(p => !formData.parameterValues[p.name]?.trim());
    if (missingParams.length > 0) {
      toast.error(`请填写以下参数: ${missingParams.map(p => p.name).join(', ')}`);
      return;
    }

    try {
      setIsTesting(true);
      setTestError(null);
      const response = await apiBuilderApi.testSql(formData.sql_query, formData.parameterValues);
      setTestResult(response.data);
      // 自动更新returnColumns
      if (response.data?.columns) {
        setFormData({
          ...formData,
          returnColumns: response.data.columns,
        });
      }
      toast.success('SQL测试成功');
    } catch (error) {
      console.error('SQL测试失败:', error);
      const errorMsg = error.response?.data?.message || 'SQL测试失败';
      setTestError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsTesting(false);
    }
  };

  const handleParameterValueChange = (paramName, value) => {
    setFormData({
      ...formData,
      parameterValues: {
        ...formData.parameterValues,
        [paramName]: value,
      },
    });
  };

  const handleReturnColumnChange = (index, field, value) => {
    const columns = [...(formData.returnColumns || [])];
    columns[index] = { ...columns[index], [field]: value };
    setFormData({ ...formData, returnColumns: columns });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入接口名称');
      return;
    }
    if (!formData.endpoint.trim()) {
      toast.error('请输入接口端点');
      return;
    }
    if (!formData.sql_query.trim()) {
      toast.error('请输入SQL查询');
      return;
    }

    try {
      setIsSaving(true);
      // 自动添加 /custom 前缀
      const endpoint = formData.endpoint.startsWith('/custom')
        ? formData.endpoint
        : `/custom${formData.endpoint.startsWith('/') ? formData.endpoint : '/' + formData.endpoint}`;

      const dataToSave = {
        ...formData,
        endpoint,
        parameters: extractedParams, // 使用自动识别的参数
      };

      if (isNewMode) {
        await apiBuilderApi.createInterface(dataToSave);
        toast.success('接口创建成功');
      } else {
        await apiBuilderApi.updateInterface(id, dataToSave);
        toast.success('接口更新成功');
      }

      router.push('/setting/api-builder');
    } catch (error) {
      console.error('保存接口失败:', error);
      toast.error(error.response?.data?.message || '保存接口失败');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">加载中...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头 */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{isNewMode ? '新增接口' : '编辑接口'}</h2>
          <p className="text-sm text-muted-foreground">{isNewMode ? '创建一个新的API接口' : '修改API接口配置'}</p>
        </div>
      </div>

      {/* 分步骤表单 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>接口配置</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => router.back()} disabled={isSaving}>
              取消
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">1. 基本信息</TabsTrigger>
              <TabsTrigger value="sql">2. SQL查询</TabsTrigger>
              <TabsTrigger value="review">3. 确认保存</TabsTrigger>
            </TabsList>

            {/* 步骤1: 基本信息 */}
            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>接口名称 *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="例：用户查询"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>接口端点 *</Label>
                  <Input
                    value={formData.endpoint}
                    onChange={(e) => handleFieldChange('endpoint', e.target.value)}
                    placeholder="例：/users/query"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>请求方式</Label>
                  <Select value={formData.method} onValueChange={(value) => handleFieldChange('method', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>版本号</Label>
                  <Input
                    type="number"
                    value={formData.version}
                    onChange={(e) => handleFieldChange('version', parseInt(e.target.value))}
                    min="1"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>限流值（/小时）</Label>
                  <Input
                    type="number"
                    value={formData.rate_limit}
                    onChange={(e) => handleFieldChange('rate_limit', parseInt(e.target.value))}
                    min="1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>分页大小（行数）</Label>
                  <Input
                    type="number"
                    value={formData.pageSize || 10}
                    onChange={(e) => handleFieldChange('pageSize', parseInt(e.target.value))}
                    min="1"
                    max="1000"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>接口描述</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="输入接口描述"
                  className="w-full px-3 py-2 border rounded-md mt-1 text-sm h-20"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="require_auth"
                  checked={formData.require_auth}
                  onCheckedChange={(checked) => handleFieldChange('require_auth', checked)}
                />
                <Label htmlFor="require_auth" className="cursor-pointer text-sm font-normal">
                  需要API密钥认证
                </Label>
              </div>
            </TabsContent>

            {/* 步骤2: SQL查询 */}
            <TabsContent value="sql" className="space-y-4 mt-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Label>SQL查询语句 *</Label>
                    <p className="text-sm text-muted-foreground">输入SELECT查询语句，参数使用 :paramName 格式</p>
                  </div>
                  <Button size="sm" onClick={handleTestSql} disabled={isTesting || !formData.sql_query.trim()}>
                    <Play className="h-3.5 w-3.5 mr-1" />
                    {isTesting ? '测试中...' : '测试SQL'}
                  </Button>
                </div>
                <textarea
                  value={formData.sql_query}
                  onChange={(e) => handleFieldChange('sql_query', e.target.value)}
                  placeholder="SELECT * FROM users WHERE id = :id"
                  className="w-full px-3 py-2 border rounded-md font-mono text-sm h-40 bg-background text-foreground"
                />

                {testError && (
                  <>
                    <div className="mt-4 border-t"></div>
                    <div className="mt-2 p-3 border rounded-md" style={{ backgroundColor: '#171717' }}>
                      <p className="text-sm font-semibold text-red-400">测试失败：</p>
                      <p className="text-sm text-gray-300 mt-1">{testError}</p>
                    </div>
                  </>
                )}

                {extractedParams.length > 0 && (
                  <>
                    <div className="mt-4 border-t"></div>
                    <div className="mt-2 p-3 border rounded-md" style={{ backgroundColor: '#171717' }}>
                      <p className="text-sm font-semibold text-white mb-3">请求参数值：</p>
                      <div className="space-y-2">
                        {extractedParams.map((param) => (
                          <div key={param.name} className="grid grid-cols-2 gap-2">
                            <label className="text-sm text-gray-300 flex items-center">
                              {param.name}
                              <span className="text-red-400 ml-1">*</span>
                            </label>
                            <Input
                              type="text"
                              value={formData.parameterValues[param.name] || ''}
                              onChange={(e) => handleParameterValueChange(param.name, e.target.value)}
                              placeholder={`输入 ${param.name} 值`}
                              className="h-8 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {testResult && (
                  <>
                    <div className="mt-4 border-t"></div>
                    <div className="mt-2 p-3 border rounded-md" style={{ backgroundColor: '#171717' }}>
                      <p className="text-sm font-semibold text-white mb-3">测试结果</p>
                      <div className="text-sm text-gray-300 space-y-2">
                        <p>总数据行数：<strong>{testResult.rowCount}</strong> | 显示：<strong>{Math.min(testResult.rowCount, 5)}</strong> 条</p>
                        <p>返回列数：<strong>{testResult.columns?.length || 0}</strong></p>
                      </div>

                      {/* 显示查询结果数据表格 */}
                      {Array.isArray(testResult.sample) && testResult.sample.length > 0 ? (
                        <div className="mt-3 overflow-x-auto" style={{ minHeight: '280px' }}>
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr style={{ backgroundColor: '#0f0f0f' }}>
                                {testResult.columns?.map((col) => (
                                  <th key={col.name} className="border px-3 py-3 text-left font-semibold text-white">
                                    {col.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {testResult.sample.map((row, idx) => (
                                <tr key={idx} style={{ backgroundColor: '#0a0a0a' }} className="hover:bg-gray-900">
                                  {testResult.columns?.map((col) => (
                                    <td key={col.name} className="border px-3 py-3 text-gray-300 max-w-xs truncate">
                                      {String(row[col.name] ?? '-')}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="mt-3 p-3" style={{ backgroundColor: '#0f0f0f', minHeight: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <p className="text-sm text-gray-300">暂无数据记录</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* 步骤3: 确认保存 */}
            <TabsContent value="review" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h3 className="font-semibold text-base mb-3">接口摘要</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground text-sm">名称:</span>
                      <p className="font-medium">{formData.name || '未设置'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">端点:</span>
                      <p className="font-mono font-medium text-sm">
                        {(() => {
                          const endpoint = formData.endpoint || '未设置';
                          if (endpoint === '未设置') return endpoint;
                          return formData.endpoint.startsWith('/custom')
                            ? formData.endpoint
                            : `/custom${formData.endpoint.startsWith('/') ? formData.endpoint : '/' + formData.endpoint}`;
                        })()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">请求方式:</span>
                      <p className="font-medium text-sm">{formData.method}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">版本:</span>
                      <p className="font-medium">v{formData.version}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground text-sm">描述:</span>
                      <p className="font-medium text-sm">{formData.description || '无'}</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-muted/50">
                  <h3 className="font-semibold text-base mb-2">SQL查询</h3>
                  <pre className="bg-background p-2 rounded border text-sm overflow-x-auto max-h-32">
                    {formData.sql_query || '未设置'}
                  </pre>
                </div>

                {extractedParams.length > 0 && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h3 className="font-semibold text-base mb-3">请求参数</h3>
                    <div className="space-y-2">
                      {extractedParams.map((param) => (
                        <div key={param.name} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{param.name}</span>
                          <span className="text-muted-foreground text-sm">必需 • {param.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-base text-green-900">检查完成</p>
                      <p className="text-sm text-green-800 mt-1">
                        所有必填项已完成，点击右上角"保存"按钮来更新该接口。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
