'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderIcon,
  UploadIcon,
  PlusIcon,
  SearchIcon,
  GridIcon,
  ListIcon,
  HardDriveIcon,
  RefreshCwIcon
} from 'lucide-react';
import { folderApi, fileApi } from '@/lib/api';
import { formatFileSize } from '@/lib/file-utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import FileUploadDialog from '@/components/files/FileUploadDialog';
import FileList from '@/components/files/FileList';
import NewFolderDialog from '@/components/files/NewFolderDialog';
import FilePreviewDialog from '@/components/files/FilePreviewDialog';
import FileShareDialog from '@/components/files/FileShareDialog';

export default function FilesPage() {
  const router = useRouter();

  // 状态管理
  const [currentFolderInfo, setCurrentFolderInfo] = useState(null); // 当前文件夹信息 {id, name}
  const [folders, setFolders] = useState([]); // 当前文件夹下的子文件夹
  const [files, setFiles] = useState([]); // 当前文件夹下的文件
  const [stats, setStats] = useState(null); // 存储统计
  const [viewMode, setViewMode] = useState('grid'); // 视图模式: grid | list
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]); // 选中的文件/文件夹

  // 对话框状态
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null); // 当前操作的文件
  const [itemToDelete, setItemToDelete] = useState(null); // 待删除的项 {item, isFolder}

  // 初始化：加载存储统计和根目录内容
  useEffect(() => {
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当前文件夹变化时，加载文件夹内容
  useEffect(() => {
    if (currentFolderInfo !== null) {
      loadFolderContents(currentFolderInfo.id);
    } else {
      // 根目录
      loadRootContents();
    }
  }, [currentFolderInfo]);

  /**
   * 加载初始数据
   */
  const loadInitialData = async () => {
    try {
      setLoading(true);

      // 加载存储统计
      const statsResponse = await fileApi.getStats();
      setStats(statsResponse.data || {});

      // 加载根目录内容
      await loadRootContents();
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 加载根目录内容
   */
  const loadRootContents = async () => {
    try {
      setLoading(true);

      // 获取根目录的文件夹和文件
      const [foldersResponse, filesResponse] = await Promise.all([
        folderApi.getFolders({ parent_id: 'null' }),
        fileApi.getFiles({ folder_id: 'null' })
      ]);

      setFolders(foldersResponse.data?.items || []);
      setFiles(filesResponse.data?.items || []);
    } catch (error) {
      console.error('Failed to load root contents:', error);
      toast.error('加载根目录失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 加载文件夹内容
   */
  const loadFolderContents = async (folderId) => {
    try {
      setLoading(true);

      const response = await folderApi.getFolderContents(folderId);
      const data = response.data || {};

      setFolders(data.folders || []);
      setFiles(data.files || []);
    } catch (error) {
      console.error('Failed to load folder contents:', error);
      toast.error('加载文件夹内容失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 刷新当前视图
   */
  const handleRefresh = () => {
    if (currentFolderInfo) {
      loadFolderContents(currentFolderInfo.id);
    } else {
      loadRootContents();
    }

    // 同时刷新统计数据
    fileApi.getStats()
      .then(response => setStats(response.data))
      .catch(error => console.error('Failed to refresh stats:', error));
  };

  /**
   * 进入文件夹
   */
  const handleFolderClick = async (folderId, folderName = null) => {
    if (folderId === null) {
      // 点击根目录
      setCurrentFolderInfo(null);
      setSelectedItems([]);
      return;
    }

    // 如果已经有名称（从文件夹列表点击），直接使用
    if (folderName) {
      setCurrentFolderInfo({ id: folderId, name: folderName });
      setSelectedItems([]);
      return;
    }

    // 否则从API获取文件夹详情（左侧树点击的情况）
    try {
      const response = await folderApi.getFolderById(folderId);
      setCurrentFolderInfo({
        id: response.data.id,
        name: response.data.name,
        parentId: response.data.parentId
      });
      setSelectedItems([]);
    } catch (error) {
      console.error('Failed to get folder info:', error);
      toast.error('获取文件夹信息失败');
    }
  };

  /**
   * 返回上级文件夹
   */
  const handleGoBack = () => {
    setCurrentFolderInfo(null);
  };

  /**
   * 文件点击（预览或下载）
   */
  const handleFileClick = (file) => {
    setCurrentFile(file);
    setPreviewDialogOpen(true);
  };

  /**
   * 处理文件/文件夹操作
   */
  const handleItemAction = async (item, action, isFolder) => {
    setCurrentFile(item);

    switch (action) {
      case 'preview':
        // 打开预览对话框
        setPreviewDialogOpen(true);
        break;

      case 'download':
        // 下载文件
        try {
          const response = await fileApi.downloadFile(item.id);
          // response.data 已经是 Blob 对象
          const url = window.URL.createObjectURL(response.data);
          const link = document.createElement('a');
          link.href = url;
          link.download = item.original_name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          toast.success('文件下载成功');
        } catch (error) {
          console.error('Failed to download file:', error);
          toast.error('文件下载失败');
        }
        break;

      case 'share':
        // 打开分享对话框
        setShareDialogOpen(true);
        break;

      case 'rename':
        // TODO: 打开重命名对话框
        toast.info('重命名功能将在下一步实现');
        break;

      case 'move':
        // TODO: 打开移动对话框
        toast.info('移动功能将在下一步实现');
        break;

      case 'copy':
        // TODO: 打开复制对话框
        toast.info('复制功能将在下一步实现');
        break;

      case 'delete':
        // 打开确认对话框
        setItemToDelete({ item, isFolder });
        setConfirmDialogOpen(true);
        break;

      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  /**
   * 确认删除操作
   */
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    const { item, isFolder } = itemToDelete;

    try {
      if (isFolder) {
        await folderApi.deleteFolder(item.id);
      } else {
        await fileApi.deleteFile(item.id);
      }
      toast.success('删除成功');
      handleRefresh();
    } catch (error) {
      console.error('Failed to delete:', error);
      // 显示后端返回的具体错误信息
      const errorMessage = error.response?.data?.message || error.message || '删除失败';
      toast.error(errorMessage);
    } finally {
      setItemToDelete(null);
    }
  };

  /**
   * 搜索过滤
   */
  const getFilteredItems = () => {
    if (!searchQuery.trim()) {
      return { folders, files };
    }

    const query = searchQuery.toLowerCase();

    return {
      folders: folders.filter(folder =>
        folder.name.toLowerCase().includes(query)
      ),
      files: files.filter(file =>
        file.original_name.toLowerCase().includes(query) ||
        file.filename.toLowerCase().includes(query)
      )
    };
  };

  const { folders: filteredFolders, files: filteredFiles } = getFilteredItems();

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">文件管理</h1>
          <p className="text-muted-foreground mt-2">
            管理您的文件和文件夹
          </p>
        </div>

        {/* 存储统计 */}
        {stats && (
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <HardDriveIcon className="w-5 h-5 text-muted-foreground" />
            <div className="text-sm">
              <span className="font-medium text-foreground">
                {formatFileSize(stats.totalSize)}
              </span>
              <span className="text-muted-foreground ml-1">
                / {stats.totalFiles} 个文件
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 操作按钮和搜索 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={() => setUploadDialogOpen(true)}>
            <UploadIcon />
            上传文件
          </Button>

          <Button
            variant="outline"
            onClick={() => setNewFolderDialogOpen(true)}
          >
            <PlusIcon />
            新建文件夹
          </Button>

          <Button
            variant="outline"
            onClick={handleRefresh}
          >
            <RefreshCwIcon />
            刷新
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* 搜索框 */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索文件或文件夹..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* 视图切换 */}
          <div className="flex items-center gap-0.5 border border-border rounded-md p-0.5">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('grid')}
            >
              <GridIcon />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('list')}
            >
              <ListIcon />
            </Button>
          </div>
        </div>
      </div>

      {/* 文件列表 */}
      <FileList
        folders={filteredFolders}
        files={filteredFiles}
        currentFolder={currentFolderInfo}
        viewMode={viewMode}
        loading={loading}
        onFolderClick={handleFolderClick}
        onFileClick={handleFileClick}
        onAction={handleItemAction}
      />

      {/* 对话框组件 */}
      <FileUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        folderId={currentFolderInfo?.id}
        onUploadComplete={handleRefresh}
      />

      <NewFolderDialog
        open={newFolderDialogOpen}
        onClose={() => setNewFolderDialogOpen(false)}
        parentFolderId={currentFolderInfo?.id}
        onSuccess={handleRefresh}
      />

      <FilePreviewDialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        file={currentFile}
        onShare={(file) => {
          setCurrentFile(file);
          setPreviewDialogOpen(false);
          setShareDialogOpen(true);
        }}
      />

      <FileShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        file={currentFile}
      />

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        title="确认删除"
        description={
          itemToDelete
            ? `确定要删除 "${itemToDelete.isFolder ? itemToDelete.item.name : itemToDelete.item.original_name}" 吗？此操作无法撤销。`
            : ''
        }
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
      />
    </div>
  );
}
