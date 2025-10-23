'use client';

import { useState } from 'react';
import { XIcon, FolderPlusIcon } from 'lucide-react';
import { folderApi } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

/**
 * 新建文件夹对话框
 */
export default function NewFolderDialog({ open, onClose, parentFolderId, onSuccess }) {
  const [folderName, setFolderName] = useState('');
  const [creating, setCreating] = useState(false);

  /**
   * 处理创建
   */
  const handleCreate = async () => {
    if (!folderName.trim()) {
      toast.warning('请输入文件夹名称');
      return;
    }

    setCreating(true);

    try {
      await folderApi.createFolder({
        name: folderName.trim(),
        parent_id: parentFolderId || null
      });

      toast.success('文件夹创建成功');
      setFolderName('');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast.error(error.response?.data?.message || '创建文件夹失败');
    } finally {
      setCreating(false);
    }
  };

  /**
   * 处理关闭
   */
  const handleClose = () => {
    if (creating) return;
    setFolderName('');
    onClose();
  };

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-popover rounded-lg shadow-xl w-full max-w-md">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FolderPlusIcon className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">新建文件夹</h2>
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
          <label className="block text-sm font-medium text-foreground mb-2">
            文件夹名称
          </label>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入文件夹名称"
            autoFocus
            disabled={creating}
            className="w-full px-4 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={creating}
          >
            取消
          </Button>
          <Button
            onClick={handleCreate}
            disabled={creating || !folderName.trim()}
          >
            {creating ? '创建中...' : '创建'}
          </Button>
        </div>
      </div>
    </div>
  );
}
