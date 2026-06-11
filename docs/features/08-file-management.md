# 文件管理服务 (File Management)

## 功能概述

文件管理服务提供完整的文件上传、下载、存储和权限管理能力，基于 MinIO 对象存储，支持文件分类、权限继承和文件分享。

## 核心特性

### 1. 对象存储集成

文件存储在 MinIO 对象存储系统中，后端仅存储文件元数据（名称、大小、类型、路径等）。

#### 配置

```bash
MINIO_ENDPOINT=minio.example.com
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=true
MINIO_BUCKET=owl-files
```

### 2. 文件分类

系统自动根据 MIME 类型将文件分为 6 类：

| 分类 | 包含类型 | 说明 |
|------|---------|------|
| `image` | jpg/png/gif/webp 等 | 图片文件 |
| `video` | mp4/mkv/avi 等 | 视频文件 |
| `document` | pdf/doc/xlsx 等 | 文档文件 |
| `audio` | mp3/wav/flac 等 | 音频文件 |
| `archive` | zip/rar/7z 等 | 压缩包 |
| `text` | txt/csv/json 等 | 纯文本文件 |

### 3. 权限管理

#### 权限等级

采用分级权限模型：

| 级别 | 值 | 权限 |
|------|-----|------|
| 读 | 1 | 可下载、预览文件 |
| 写 | 2 | 可上传、修改文件 |
| 删除 | 3 | 可删除文件 |
| 管理 | 4 | 可管理权限、删除他人文件 |

权限满足传递性：等级 4 自动拥有级别 1~3 的权限。

#### 权限继承

文件权限支持多层继承链：

```
文件 ← 所在文件夹 ← 父文件夹 ← ... ← 根文件夹
```

- 用户对文件的有效权限 = max(文件直接权限, 文件夹直接权限, 父文件夹权限, ...)
- 在某一层获得权限后，自动继承下级所有资源的该权限

#### 权限授予

支持两种方式授予权限：

```javascript
// 方式一：直接授予用户权限
await filePermissionService.addPermission({
  fileId: 123,
  userId: 456,
  permissionLevel: 2  // 写权限
});

// 方式二：通过角色授予权限（所有该角色成员自动获得）
await filePermissionService.addPermission({
  fileId: 123,
  roleId: 'admin',
  permissionLevel: 4  // 管理权限
});
```

#### 默认权限

创建资源时自动设置：
- 创建者获得 `admin`(4) 权限
- `admin` / `super_admin` 角色的所有成员获得 `admin` 权限

### 4. 文件操作

#### 上传

**单文件上传**

```bash
curl -X POST http://localhost:3001/api/files/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@path/to/file.pdf" \
  -F "folderId=123"
```

**批量上传**

```bash
curl -X POST http://localhost:3001/api/files/upload-multiple \
  -H "Authorization: Bearer <token>" \
  -F "files=@file1.pdf" \
  -F "files=@file2.xlsx" \
  -F "folderId=123"
```

返回成功数量和失败数量统计。

#### 查询

| 接口 | 说明 |
|------|------|
| `GET /api/files` | 文件列表，支持分页、搜索、分类、文件夹筛选 |
| `GET /api/files/:id` | 文件详情 |

查询参数：

```
GET /api/files?page=1&limit=10&search=报告&category=document&folderId=123
```

#### 下载

```bash
curl -X GET http://localhost:3001/api/files/:id/download \
  -H "Authorization: Bearer <token>" \
  -o filename.pdf
```

#### 复制

```bash
curl -X POST http://localhost:3001/api/files/:id/copy \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"targetFolderId": 456}'
```

复制后的文件名称会自动加上"副本"后缀。

#### 移动

```bash
curl -X PUT http://localhost:3001/api/files/:id/move \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"folderId": 456}'
```

#### 删除

删除文件时同时删除 MinIO 对象、数据库记录和相关的分享记录。

```bash
curl -X DELETE http://localhost:3001/api/files/:id \
  -H "Authorization: Bearer <token>"
```

### 5. 文件分享

生成分享链接，支持有效期控制。

#### 接口

| 接口 | 说明 |
|------|------|
| `POST /api/file-shares` | 创建分享链接 |
| `GET /api/file-shares` | 分享列表 |
| `DELETE /api/file-shares/:id` | 取消分享 |

#### 分享链接示例

```bash
# 创建分享
curl -X POST http://localhost:3001/api/file-shares \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": 123,
    "expiresIn": 86400,
    "password": "optional"
  }'

# 响应
{
  "code": 0,
  "data": {
    "shareToken": "abc123xyz",
    "shareUrl": "https://example.com/share?token=abc123xyz"
  }
}
```

### 6. 存储统计

```bash
GET /api/files/storage-stats
```

返回用户的存储使用情况：

```json
{
  "totalFiles": 150,
  "totalSize": "2.5 GB",
  "folders": 12,
  "byCategory": {
    "document": { "count": 80, "size": "1.8 GB" },
    "image": { "count": 50, "size": "0.6 GB" },
    "video": { "count": 15, "size": "0.1 GB" }
  }
}
```

## 使用建议

- **合理使用文件夹**：为不同类型文件创建文件夹，便于权限统一管理
- **设置权限继承**：在文件夹级别设置权限，下级文件自动继承
- **定期清理**：删除不需要的文件和过期分享链接
- **分享安全**：生成分享链接时设置密码和有效期
