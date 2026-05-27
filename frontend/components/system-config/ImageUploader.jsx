'use client';

import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/utils/http-client';

export default function ImageUploader({
  label,
  value,
  onUpload,
  aspectRatio = 'square',
  maxSize = 2,
  height = 'h-48',
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      alert(`文件大小不能超过 ${maxSize}MB`);
      return;
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('只能上传图片文件');
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    onUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理图片 URL - 将相对路径转换为完整 URL
  const getFullImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${getApiBaseUrl()}${url}`;
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div
        className={`
        relative border-2 border-dashed rounded-lg overflow-hidden ${height}
        ${aspectRatio === 'square' ? 'aspect-square' : ''}
        ${!value ? 'bg-muted' : ''}
      `}
      >
        {value ? (
          <>
            <img
              src={getFullImageUrl(value)}
              alt={label}
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleDelete}
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-muted/50 transition">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              {uploading ? '上传中...' : '点击上传'}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              最大 {maxSize}MB
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        )}
      </div>
    </div>
  );
}
