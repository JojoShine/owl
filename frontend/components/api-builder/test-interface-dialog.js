'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Copy } from 'lucide-react';
import { apiBuilderApi } from '@/lib/api';
import { toast } from 'sonner';

export default function TestInterfaceDialog({ open, onOpenChange, interface_ }) {
  const [params, setParams] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAddParam = () => {
    setParams({ ...params, newParam: '' });
  };

  const handleParamChange = (key, value) => {
    setParams({ ...params, [key]: value });
  };

  const handleTest = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiBuilderApi.testInterface(interface_.id, params);
      setResult(response.data || null);
      toast.success('接口测试成功');
    } catch (error) {
      console.error('接口测试失败:', error);
      setError(error.response?.data?.message || '接口测试失败');
      toast.error('接口测试失败');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>测试接口</DialogTitle>
          <DialogDescription>
            测试接口 "{interface_.name}" - {interface_.method} {interface_.endpoint}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 参数输入 */}
          {interface_.parameters && interface_.parameters.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">接口参数</h3>
              <div className="space-y-2">
                {interface_.parameters.map((paramDef) => (
                  <div key={paramDef.name}>
                    <Label className="text-sm">
                      {paramDef.name}
                      {paramDef.required && <span className="text-red-500">*</span>}
                      <span className="text-xs text-muted-foreground ml-2">({paramDef.type})</span>
                    </Label>
                    <Input
                      placeholder={paramDef.description || `输入 ${paramDef.name}`}
                      value={params[paramDef.name] || ''}
                      onChange={(e) => handleParamChange(paramDef.name, e.target.value)}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 测试按钮 */}
          <div className="flex gap-2">
            <Button onClick={handleTest} disabled={isLoading} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? '测试中...' : '执行测试'}
            </Button>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="border rounded-lg p-3 text-sm text-red-400" style={{ backgroundColor: '#171717' }}>
              {error}
            </div>
          )}

          {/* 结果展示 */}
          {result && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">测试结果</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <pre className="p-3 rounded border overflow-x-auto text-xs text-gray-300" style={{ backgroundColor: '#0f0f0f' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {/* SQL预览 */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-semibold mb-2">SQL查询</h3>
            <pre className="p-3 rounded border overflow-x-auto text-xs text-gray-300" style={{ backgroundColor: '#0f0f0f' }}>
              {interface_.sql_query}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
