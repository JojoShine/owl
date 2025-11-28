'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getFullApiUrl } from '@/lib/api-url';

export default function ApiKeysDialog({ open, onOpenChange, interface_ }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  // 生成示例参数
  const generateSampleParams = () => {
    if (!interface_.parameters || interface_.parameters.length === 0) {
      return {};
    }

    const params = {};
    interface_.parameters.forEach(param => {
      params[param.name] = `example_${param.name}`;
    });
    return params;
  };

  const sampleParams = generateSampleParams();
  const hasParams = Object.keys(sampleParams).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>接口调用说明</DialogTitle>
          <DialogDescription>
            接口 "{interface_.name}" 的调用方式
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-x-hidden">
          {/* 接口信息 */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-semibold text-base mb-3">接口信息</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">名称：</span>
                <span className="font-medium">{interface_.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">地址：</span>
                <code className="font-mono font-medium">{getFullApiUrl(interface_.endpoint)}</code>
              </div>
              <div>
                <span className="text-muted-foreground">方法：</span>
                <span className="font-medium">{interface_.method}</span>
              </div>
              <div>
                <span className="text-muted-foreground">需要认证：</span>
                <span className="font-medium">{interface_.require_auth ? '是' : '否'}</span>
              </div>
            </div>
          </div>

          {/* 调用流程 */}
          <div className="border rounded-lg p-4" style={{ backgroundColor: '#0a0a0a' }}>
            <h3 className="font-semibold text-base mb-4 text-white">调用流程</h3>

            {interface_.require_auth ? (
              <Tabs defaultValue="step1" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="step1">步骤 1：获取令牌</TabsTrigger>
                  <TabsTrigger value="step2">步骤 2：调用接口</TabsTrigger>
                </TabsList>

                {/* 步骤1：获取Token */}
                <TabsContent value="step1" className="space-y-3">
                  <p className="text-sm text-gray-300 mb-3">该接口需要认证。请先获取令牌，然后调用接口时在请求头中传递。</p>
                  <div className="text-xs text-gray-400 mb-2">使用 cURL 获取令牌：</div>
                  <div className="flex items-center gap-2 overflow-hidden" style={{ backgroundColor: '#171717', padding: '12px', borderRadius: '6px' }}>
                    <code className="text-xs text-gray-300 flex-1 font-mono break-words overflow-hidden">
                      {`curl -X POST http://localhost:3001/api/auth/api-token \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "app_id": "your-app-id",\n    "app_key": "your-app-key"\n  }'`}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`curl -X POST http://localhost:3001/api/auth/api-token \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "app_id": "your-app-id",\n    "app_key": "your-app-key"\n  }'`)}
                      title="复制"
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-xs text-gray-300 mt-4 p-3 rounded" style={{ backgroundColor: '#0f0f0f' }}>
                    <p className="mb-2">💡 说明：</p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
                      <li>从密钥管理页面获取您的 <code className="text-gray-300 bg-gray-800 px-1 rounded">app_id</code> 和 <code className="text-gray-300 bg-gray-800 px-1 rounded">app_key</code></li>
                      <li>执行上述 cURL 命令（替换实际的ID和密钥）</li>
                      <li>响应包含 <code className="text-gray-300 bg-gray-800 px-1 rounded">token</code> 字段</li>
                    </ul>
                  </div>
                </TabsContent>

                {/* 步骤2：使用Token调用接口 */}
                <TabsContent value="step2" className="space-y-3">
                  <p className="text-sm text-gray-300 mb-3">使用获取的令牌调用接口，在请求头中传递 <code className="text-gray-300 bg-gray-800 px-1 rounded">Authorization: Bearer {'{token}'}</code></p>

                  {hasParams && (
                    <>
                      <div className="text-xs text-gray-400 mb-2">请求参数示例：</div>
                      <div className="flex items-center gap-2 overflow-hidden" style={{ backgroundColor: '#171717', padding: '12px', borderRadius: '6px' }}>
                        <code className="text-xs text-gray-300 flex-1 font-mono break-words overflow-hidden">
                          {JSON.stringify(sampleParams, null, 2)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(sampleParams, null, 2))}
                          title="复制"
                          className="flex-shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}

                  <div className="text-xs text-gray-400 mt-3 mb-2">cURL 示例：</div>
                  <div className="flex items-center gap-2 overflow-hidden" style={{ backgroundColor: '#171717', padding: '12px', borderRadius: '6px' }}>
                    <code className="text-xs text-gray-300 flex-1 font-mono break-words overflow-hidden">
                      {`curl -X ${interface_.method} ${getFullApiUrl(interface_.endpoint)}${interface_.method === 'GET' && hasParams ? '?' + Object.entries(sampleParams).map(([k, v]) => `${k}=${v}`).join('&') : ''} \\\n  -H "Authorization: Bearer YOUR_TOKEN"${interface_.method !== 'GET' && hasParams ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(sampleParams)}'` : ''}`}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`curl -X ${interface_.method} ${getFullApiUrl(interface_.endpoint)}${interface_.method === 'GET' && hasParams ? '?' + Object.entries(sampleParams).map(([k, v]) => `${k}=${v}`).join('&') : ''} \\\n  -H "Authorization: Bearer YOUR_TOKEN"${interface_.method !== 'GET' && hasParams ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(sampleParams)}'` : ''}`)}
                      title="复制"
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-300">该接口不需要认证，直接调用即可。</p>

                {hasParams && (
                  <>
                    <div className="text-xs text-gray-400 mb-2">请求参数示例：</div>
                    <div className="flex items-center gap-2 overflow-hidden" style={{ backgroundColor: '#171717', padding: '12px', borderRadius: '6px' }}>
                      <code className="text-xs text-gray-300 flex-1 font-mono break-words overflow-hidden">
                        {JSON.stringify(sampleParams, null, 2)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(sampleParams, null, 2))}
                        title="复制"
                        className="flex-shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}

                <div className="text-xs text-gray-400 mb-2">cURL 示例：</div>
                <div className="flex items-center gap-2 overflow-hidden" style={{ backgroundColor: '#171717', padding: '12px', borderRadius: '6px' }}>
                  <code className="text-xs text-gray-300 flex-1 font-mono break-words overflow-hidden">
                    {`curl -X ${interface_.method} ${getFullApiUrl(interface_.endpoint)}${interface_.method === 'GET' && hasParams ? '?' + Object.entries(sampleParams).map(([k, v]) => `${k}=${v}`).join('&') : ''}${interface_.method !== 'GET' && hasParams ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(sampleParams)}'` : ''}`}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`curl -X ${interface_.method} ${getFullApiUrl(interface_.endpoint)}${interface_.method === 'GET' && hasParams ? '?' + Object.entries(sampleParams).map(([k, v]) => `${k}=${v}`).join('&') : ''}${interface_.method !== 'GET' && hasParams ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(sampleParams)}'` : ''}`)}
                    title="复制"
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}