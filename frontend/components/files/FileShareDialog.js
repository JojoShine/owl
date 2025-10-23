'use client';

import { useState, useEffect } from 'react';
import { XIcon, ShareIcon, CopyIcon, CheckIcon, ClockIcon } from 'lucide-react';
import { fileShareApi } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * 文件分享对话框
 */
export default function FileShareDialog({ open, onClose, file }) {
  const [shareLink, setShareLink] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * 重置状态
   */
  useEffect(() => {
    if (open) {
      setShareLink('');
      setShareCode('');
      setExpiresInHours(24);
      setCopied(false);
    }
  }, [open]);

  /**
   * 创建分享链接
   */
  const handleCreateShare = async () => {
    if (!file) return;

    setCreating(true);

    try {
      const response = await fileShareApi.createShare({
        file_id: file.id,
        expires_in_hours: expiresInHours || null
      });

      const data = response.data;
      const code = data.share_code;
      const link = `${window.location.origin}/share/${code}`;

      setShareCode(code);
      setShareLink(link);

      toast.success('分享链接创建成功');
    } catch (error) {
      console.error('Failed to create share:', error);
      toast.error(error.response?.data?.message || '创建分享链接失败');
    } finally {
      setCreating(false);
    }
  };

  /**
   * 复制链接
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('链接已复制到剪贴板');

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('复制失败');
    }
  };

  /**
   * 处理关闭
   */
  const handleClose = () => {
    if (creating) return;
    onClose();
  };

  if (!open || !file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-popover rounded-lg shadow-xl w-full max-w-md">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShareIcon className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">分享文件</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={creating}
            className="p-1 hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
          >
            <XIcon className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* 内容 */}
        <div className="px-6 py-4">
          {/* 文件信息 */}
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium text-foreground truncate">
              {file.original_name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {file.mime_type}
            </p>
          </div>

          {!shareLink ? (
            /* 创建分享 */
            <>
              <label className="block text-sm font-medium text-foreground mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                有效期
              </label>
              <Select
                value={String(expiresInHours)}
                onValueChange={(value) => setExpiresInHours(Number(value))}
                disabled={creating}
              >
                <SelectTrigger className="w-full mb-4">
                  <SelectValue placeholder="选择有效期" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 小时</SelectItem>
                  <SelectItem value="6">6 小时</SelectItem>
                  <SelectItem value="24">1 天</SelectItem>
                  <SelectItem value="72">3 天</SelectItem>
                  <SelectItem value="168">7 天</SelectItem>
                  <SelectItem value="720">30 天</SelectItem>
                  <SelectItem value="0">永久</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleCreateShare}
                disabled={creating}
                className="w-full"
              >
                {creating ? '创建中...' : '创建分享链接'}
              </Button>
            </>
          ) : (
            /* 显示分享链接 */
            <>
              <label className="block text-sm font-medium text-foreground mb-2">
                分享链接
              </label>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-muted text-foreground text-sm"
                />
                <Button
                  onClick={handleCopyLink}
                  variant={copied ? "default" : "default"}
                  className={copied ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4" />
                      复制
                    </>
                  )}
                </Button>
              </div>

              <label className="block text-sm font-medium text-foreground mb-2">
                分享码
              </label>
              <div className="px-4 py-3 bg-muted rounded-lg text-center mb-4">
                <p className="text-2xl font-bold text-foreground tracking-wider">
                  {shareCode}
                </p>
              </div>

              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  此链接将在 {expiresInHours > 0 ? `${expiresInHours} 小时后过期` : '永不过期'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
}