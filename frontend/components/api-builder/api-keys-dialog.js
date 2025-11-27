'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, RotateCw, Trash2, Plus } from 'lucide-react';
import { apiBuilderApi } from '@/lib/api';
import { toast } from 'sonner';

export default function ApiKeysDialog({ open, onOpenChange, interface_ }) {
  const [keys, setKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [appName, setAppName] = useState('');

  useEffect(() => {
    if (open) {
      fetchKeys();
    }
  }, [open]);

  const fetchKeys = async () => {
    try {
      setIsLoading(true);
      const response = await apiBuilderApi.getInterfaceKeys(interface_.id);
      setKeys(response.data?.data || []);
    } catch (error) {
      console.error('获取密钥列表失败:', error);
      toast.error('获取密钥列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!appName.trim()) {
      toast.error('请输入应用名称');
      return;
    }

    try {
      const response = await apiBuilderApi.createApiKey(interface_.id, appName.trim());
      toast.success('API密钥创建成功（3天有效期）');
      setAppName('');
      setCreateDialogOpen(false);
      fetchKeys();
    } catch (error) {
      console.error('创建密钥失败:', error);
      toast.error('创建密钥失败');
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (!confirm('确定要删除此密钥吗？')) return;

    try {
      await apiBuilderApi.deleteApiKey(keyId);
      toast.success('密钥已删除');
      fetchKeys();
    } catch (error) {
      console.error('删除密钥失败:', error);
      toast.error('删除密钥失败');
    }
  };

  const handleRegenerateKey = async (keyId) => {
    if (!confirm('重新生成密钥将使旧密钥失效，是否继续？')) return;

    try {
      const response = await apiBuilderApi.regenerateApiKey(keyId);
      toast.success('密钥已重新生成');
      fetchKeys();
    } catch (error) {
      console.error('重新生成密钥失败:', error);
      toast.error('重新生成密钥失败');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  const formatExpiryDate = (date) => {
    const now = new Date();
    const expiry = new Date(date);
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      return <span className="text-red-600">已过期</span>;
    }
    if (daysLeft <= 1) {
      return <span className="text-red-600">即将过期</span>;
    }
    return `${daysLeft}天后`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>API密钥管理</DialogTitle>
          <DialogDescription>
            为接口 "{interface_.name}" 创建和管理API密钥（3天有效期）
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 创建密钥表单 */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-semibold mb-3">新增密钥</h3>
            <div className="flex gap-2">
              <Input
                placeholder="请输入应用名称"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
              />
              <Button onClick={handleCreateKey} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                创建
              </Button>
            </div>
          </div>

          {/* 密钥列表 */}
          <div>
            <h3 className="font-semibold mb-3">现有密钥</h3>
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">加载中...</div>
            ) : keys.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">暂无密钥</div>
            ) : (
              <div className="space-y-2">
                {keys.map((key) => (
                  <div key={key.id} className="border rounded-lg p-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1">{key.app_name}</div>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-xs truncate">
                          {key.api_key.substring(0, 8)}...{key.api_key.substring(-8)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.api_key)}
                          title="复制完整密钥"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                          {key.status === 'active' ? '启用' : '禁用'}
                        </Badge>
                        <span>过期: {formatExpiryDate(key.expires_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRegenerateKey(key.id)}
                        title="重新生成"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey(key.id)}
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 使用说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <div className="font-semibold mb-2">调用说明：</div>
            <div className="font-mono text-xs space-y-1">
              <div>curl -X GET /api/api-builder/custom/{interface_.endpoint}</div>
              <div className="text-muted-foreground">
                -H "X-API-Key: YOUR_API_KEY"
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}