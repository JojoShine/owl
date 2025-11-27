'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function ApiKeysDialog({ open, onOpenChange, interface_ }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>接口调用说明</DialogTitle>
          <DialogDescription>
            接口 "{interface_.name}" 的调用方式
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
                <code className="font-mono font-medium">/api/custom{interface_.endpoint}</code>
              </div>
              <div>
                <span className="text-muted-foreground">方法：</span>
                <span className="font-medium">{interface_.method}</span>
              </div>
            </div>
          </div>

          {/* 调用示例 */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-base mb-3">调用示例</h3>

            {/* cURL 示例 */}
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">cURL 示例：</div>
              <div className="flex items-start gap-2" style={{ backgroundColor: '#171717', padding: '12px', borderRadius: '6px' }}>
                <code className="text-xs text-gray-300 flex-1 font-mono break-words">
                  curl -X {interface_.method} /api/custom{interface_.endpoint}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(`curl -X ${interface_.method} /api/custom${interface_.endpoint}`)}
                  title="复制"
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* JavaScript 示例 */}
            <div>
              <div className="text-sm font-medium mb-2">JavaScript 示例：</div>
              <div className="flex items-start gap-2" style={{ backgroundColor: '#171717', padding: '12px', borderRadius: '6px' }}>
                <code className="text-xs text-gray-300 flex-1 font-mono break-words">
                  fetch('/api/custom{interface_.endpoint}', {'{'}method: '{interface_.method}'{'}})
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(`fetch('/api/custom${interface_.endpoint}', {method: '${interface_.method}'})`)}
                  title="复制"
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}