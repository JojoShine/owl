'use client';

import { useState, useEffect } from 'react';
import { XIcon, FolderIcon, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { folderApi } from '@/lib/api';
import { toast } from 'sonner';

/**
 * 移动文件/文件夹对话框组件
 */
export default function MoveDialog({ open, onClose, item, isFolder, onSuccess }) {
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);

  useEffect(() => {
    if (open) {
      loadFolders();
      setSelectedFolderId(item?.folder_id || item?.parent_id || null);
    }
  }, [open, item]);

  const loadFolders = async () => {
    try {
      setLoadingFolders(true);
      const response = await folderApi.getFolders({ page: 1, limit: 100 });
      let allFolders = response.data?.items || [];

      // 如果正在移动文件夹，需要过滤掉自己和自己的子文件夹
      if (isFolder && item) {
        allFolders = allFolders.filter(folder => {
          // 不能移动到自己
          if (folder.id === item.id) return false;
          // 不能移动到自己的子文件夹（简化版本，只检查直接子级）
          if (folder.parent_id === item.id) return false;
          return true;
        });
      }

      setFolders(allFolders);
    } catch (error) {
      console.error('Failed to load folders:', error);
      toast.error('加载文件夹列表失败');
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 检查是否选择了新的文件夹
    const currentLocation = item?.folder_id || item?.parent_id || null;
    if (selectedFolderId === currentLocation) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await onSuccess(selectedFolderId);
      onClose();
    } catch (error) {
      console.error('Failed to move:', error);
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
            移动{isFolder ? '文件夹' : '文件'}
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
              选择目标位置
            </label>

            {loadingFolders ? (
              <Loading size="md" variant="pulse" />
            ) : (
              <div className="border border-border rounded-lg max-h-64 overflow-y-auto">
                {/* 根目录选项 */}
                <button
                  type="button"
                  onClick={() => setSelectedFolderId(null)}
                  className={`
                    w-full flex items-center gap-2 px-4 py-3 text-sm text-left transition-colors
                    ${selectedFolderId === null
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                    }
                  `}
                >
                  <HomeIcon className="w-4 h-4 flex-shrink-0" />
                  <span>我的文件（根目录）</span>
                </button>

                {/* 文件夹列表 */}
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`
                      w-full flex items-center gap-2 px-4 py-3 text-sm text-left transition-colors
                      ${selectedFolderId === folder.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                      }
                    `}
                  >
                    <FolderIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{folder.name}</span>
                  </button>
                ))}

                {folders.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    暂无文件夹
                  </div>
                )}
              </div>
            )}
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
              disabled={loading || loadingFolders}
            >
              {loading ? '移动中...' : '确定'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
