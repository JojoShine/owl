'use client';

import { useState } from 'react';
import {
  FolderIcon,
  MoreVerticalIcon,
  DownloadIcon,
  EditIcon,
  TrashIcon,
  MoveIcon,
  CopyIcon,
  ShareIcon,
  EyeIcon,
  ChevronRightIcon,
  HomeIcon
} from 'lucide-react';
import { formatFileSize, formatDate, getFileIcon, getFileCategoryColor } from '@/lib/file-utils';

/**
 * 面包屑导航组件
 */
function Breadcrumb({ currentFolder, onNavigate }) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <HomeIcon className="w-4 h-4" />
        <span>我的文件</span>
      </button>

      {currentFolder && (
        <>
          <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">
            {currentFolder.name}
          </span>
        </>
      )}
    </nav>
  );
}

/**
 * 文件/文件夹项组件（网格视图）
 */
function GridItem({ item, isFolder, onItemClick, onAction }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const FileIconComponent = isFolder ? FolderIcon : getFileIcon(item.original_name || item.name, item.mime_type);

  const handleAction = (action) => {
    setMenuOpen(false);
    onAction(item, action, isFolder);
  };

  return (
    <div className="relative group">
      <div
        onClick={() => onItemClick(item, isFolder)}
        className="
          flex flex-col items-center p-4 rounded-lg border border-border bg-card
          hover:border-primary/50 hover:bg-accent cursor-pointer
          transition-all
        "
      >
        {/* 图标 */}
        <FileIconComponent className="w-12 h-12 text-muted-foreground mb-2" />

        {/* 名称 */}
        <p className="text-sm font-medium text-foreground text-center truncate w-full px-2">
          {isFolder ? item.name : item.original_name}
        </p>

        {/* 元信息 */}
        <div className="flex flex-col items-center gap-1 mt-1 min-h-[36px]">
          {!isFolder && (
            <>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(item.size)}
              </span>
              {item.mime_type && (
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getFileCategoryColor(item.original_name, item.mime_type)}`}>
                  {item.mime_type.split('/')[1]?.toUpperCase() || 'FILE'}
                </span>
              )}
            </>
          )}
          {isFolder && (
            <span className="text-xs text-muted-foreground">
              {item.fileCount !== undefined ? `${item.fileCount} 项` : '文件夹'}
            </span>
          )}
        </div>
      </div>

      {/* 操作菜单按钮 */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-1.5 bg-card border border-border rounded-lg hover:bg-accent shadow-sm"
        >
          <MoreVerticalIcon className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* 下拉菜单 */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-20">
              {!isFolder && (
                <>
                  <button
                    onClick={() => handleAction('preview')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <EyeIcon className="w-4 h-4" />
                    预览
                  </button>
                  <button
                    onClick={() => handleAction('download')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    下载
                  </button>
                  <button
                    onClick={() => handleAction('share')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <ShareIcon className="w-4 h-4" />
                    分享
                  </button>
                  <div className="border-t border-border my-1" />
                </>
              )}
              <button
                onClick={() => handleAction('rename')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
              >
                <EditIcon className="w-4 h-4" />
                重命名
              </button>
              <button
                onClick={() => handleAction('move')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
              >
                <MoveIcon className="w-4 h-4" />
                移动
              </button>
              {!isFolder && (
                <button
                  onClick={() => handleAction('copy')}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                >
                  <CopyIcon className="w-4 h-4" />
                  复制
                </button>
              )}
              <div className="border-t border-border my-1" />
              <button
                onClick={() => handleAction('delete')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <TrashIcon className="w-4 h-4" />
                删除
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * 文件/文件夹项组件（列表视图）
 */
function ListItem({ item, isFolder, onItemClick, onAction }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const FileIconComponent = isFolder ? FolderIcon : getFileIcon(item.original_name || item.name, item.mime_type);

  const handleAction = (action) => {
    setMenuOpen(false);
    onAction(item, action, isFolder);
  };

  return (
    <div
      className="
        flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-card
        hover:border-primary/50 hover:bg-accent cursor-pointer
        transition-all group
      "
    >
      {/* 图标和名称 */}
      <div
        onClick={() => onItemClick(item, isFolder)}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <FileIconComponent className="w-8 h-8 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {isFolder ? item.name : item.original_name}
          </p>
          {!isFolder && item.mime_type && (
            <p className="text-xs text-muted-foreground truncate">
              {item.mime_type}
            </p>
          )}
        </div>
      </div>

      {/* 大小 */}
      <div className="w-24 text-sm text-muted-foreground text-right flex-shrink-0">
        {isFolder ? (
          item.fileCount !== undefined ? `${item.fileCount} 项` : '-'
        ) : (
          formatFileSize(item.size)
        )}
      </div>

      {/* 修改时间 */}
      <div className="w-32 text-sm text-muted-foreground text-right flex-shrink-0">
        {formatDate(item.updated_at || item.created_at)}
      </div>

      {/* 操作菜单 */}
      <div className="relative flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-accent rounded-lg transition-opacity"
        >
          <MoreVerticalIcon className="w-4 h-4 text-muted-foreground" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-20">
              {!isFolder && (
                <>
                  <button
                    onClick={() => handleAction('preview')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <EyeIcon className="w-4 h-4" />
                    预览
                  </button>
                  <button
                    onClick={() => handleAction('download')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    下载
                  </button>
                  <button
                    onClick={() => handleAction('share')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <ShareIcon className="w-4 h-4" />
                    分享
                  </button>
                  <div className="border-t border-border my-1" />
                </>
              )}
              <button
                onClick={() => handleAction('rename')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
              >
                <EditIcon className="w-4 h-4" />
                重命名
              </button>
              <button
                onClick={() => handleAction('move')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
              >
                <MoveIcon className="w-4 h-4" />
                移动
              </button>
              {!isFolder && (
                <button
                  onClick={() => handleAction('copy')}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
                >
                  <CopyIcon className="w-4 h-4" />
                  复制
                </button>
              )}
              <div className="border-t border-border my-1" />
              <button
                onClick={() => handleAction('delete')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <TrashIcon className="w-4 h-4" />
                删除
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * 文件列表主组件
 */
export default function FileList({
  folders = [],
  files = [],
  currentFolder = null,
  viewMode = 'grid',
  loading = false,
  onFolderClick,
  onFileClick,
  onAction
}) {
  const handleItemClick = (item, isFolder) => {
    if (isFolder) {
      // 传递文件夹ID和名称
      onFolderClick?.(item.id, item.name);
    } else {
      onFileClick?.(item);
    }
  };

  const handleAction = (item, action, isFolder) => {
    onAction?.(item, action, isFolder);
  };

  const isEmpty = folders.length === 0 && files.length === 0;

  return (
    <div>
      {/* 面包屑导航 */}
      <Breadcrumb
        currentFolder={currentFolder}
        onNavigate={onFolderClick}
      />

      {/* 加载状态 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      ) : isEmpty ? (
        /* 空状态 */
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <FolderIcon className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium text-foreground">此文件夹为空</p>
          <p className="text-sm mt-1">上传文件或创建新文件夹</p>
        </div>
      ) : (
        /* 文件列表 */
        <div>
          {viewMode === 'grid' ? (
            /* 网格视图 */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {/* 文件夹 */}
              {folders.map(folder => (
                <GridItem
                  key={`folder-${folder.id}`}
                  item={folder}
                  isFolder={true}
                  onItemClick={handleItemClick}
                  onAction={handleAction}
                />
              ))}

              {/* 文件 */}
              {files.map(file => (
                <GridItem
                  key={`file-${file.id}`}
                  item={file}
                  isFolder={false}
                  onItemClick={handleItemClick}
                  onAction={handleAction}
                />
              ))}
            </div>
          ) : (
            /* 列表视图 */
            <div className="space-y-2">
              {/* 表头 */}
              <div className="flex items-center gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border">
                <div className="flex-1">名称</div>
                <div className="w-24 text-right">大小</div>
                <div className="w-32 text-right">修改时间</div>
                <div className="w-10" />
              </div>

              {/* 文件夹 */}
              {folders.map(folder => (
                <ListItem
                  key={`folder-${folder.id}`}
                  item={folder}
                  isFolder={true}
                  onItemClick={handleItemClick}
                  onAction={handleAction}
                />
              ))}

              {/* 文件 */}
              {files.map(file => (
                <ListItem
                  key={`file-${file.id}`}
                  item={file}
                  isFolder={false}
                  onItemClick={handleItemClick}
                  onAction={handleAction}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
