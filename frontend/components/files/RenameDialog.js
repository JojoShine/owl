'use client';

import { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * 重命名对话框组件
 */
export default function RenameDialog({ open, onClose, item, isFolder, onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && item) {
      setName(isFolder ? item.name : item.original_name);
    }
  }, [open, item, isFolder]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (name === (isFolder ? item.name : item.original_name)) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await onSuccess(name);
      onClose();
    } catch (error) {
      console.error('Failed to rename:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-popover rounded-lg shadow-xl w-full max-w-md">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            重命名{isFolder ? '文件夹' : '文件'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
          >
            <XIcon className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* 内容 */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              {isFolder ? '文件夹名称' : '文件名'}
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`请输入${isFolder ? '文件夹' : '文件'}名称`}
              disabled={loading}
              autoFocus
            />
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
            >
              {loading ? '重命名中...' : '确定'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
