# 权限操作映射规范

## AccessControl 限制

AccessControl 库只支持 4 种标准操作：
- `create` - 创建
- `read` - 读取/查看
- `update` - 更新/修改
- `delete` - 删除

## 非标准操作到 CRUD 的映射规则

### 1. 文件操作

| 功能 | 原 Action | 映射到 | 说明 |
|------|----------|--------|------|
| 上传文件 | `upload` | `create` | 上传即创建新文件 |
| 下载文件 | `download` | `read` | 下载是读取文件内容 |
| 预览文件 | `preview` | `read` | 预览是读取文件内容 |
| 移动文件 | `move` | `update` | 移动是更新文件位置 |
| 复制文件 | `copy` | `create` | 复制生成新文件 |

### 2. 日志操作

| 功能 | 原 Action | 映射到 | 说明 |
|------|----------|--------|------|
| 导出日志 | `export` | `read` | 导出是读取日志数据 |
| 备份日志 | `backup` | `create` | 备份创建备份文件 |
| 清理日志 | `clean` | `delete` | 清理是删除旧日志 |
| 配置日志 | `configure` | `update` | 配置是更新日志设置 |

### 3. 监控操作

| 功能 | 原 Action | 映射到 | 说明 |
|------|----------|--------|------|
| 查看监控 | `monitor` | `read` | 监控是读取系统状态 |
| 管理监控 | `manage` | `update` | 管理是更新监控配置 |

### 4. 通知操作

| 功能 | 原 Action | 映射到 | 说明 |
|------|----------|--------|------|
| 发送通知 | `send` | `create` | 发送是创建新通知 |
| 管理通知 | `manage` | `update` | 管理是更新通知设置 |
| 查看通知 | `view` | `read` | 查看是读取通知 |

### 5. 邮件操作

| 功能 | 原 Action | 映射到 | 说明 |
|------|----------|--------|------|
| 发送邮件 | `send` | `create` | 发送是创建新邮件 |
| 查看邮件记录 | `view` | `read` | 查看是读取邮件记录 |
| 配置邮件 | `configure` | `update` | 配置是更新邮件设置 |

### 6. 分享操作

| 功能 | 原 Action | 映射到 | 说明 |
|------|----------|--------|------|
| 创建分享 | `share` | `create` | 分享是创建分享链接 |
| 取消分享 | `unshare` | `delete` | 取消是删除分享链接 |

### 7. 审批操作

| 功能 | 原 Action | 映射到 | 说明 |
|------|----------|--------|------|
| 提交审批 | `submit` | `create` | 提交是创建审批单 |
| 审批 | `approve` | `update` | 审批是更新审批状态 |
| 拒绝 | `reject` | `update` | 拒绝是更新审批状态 |

### 8. 导入导出

| 功能 | 原 Action | 映射到 | 说明 |
|------|----------|--------|------|
| 导入数据 | `import` | `create` | 导入是批量创建数据 |
| 导出数据 | `export` | `read` | 导出是读取数据 |

## 实施建议

### 1. 权限命名
使用 `resource:action` 格式，其中 action 必须是 CRUD 之一：

```javascript
// ✅ 正确
{ code: 'log:read', description: '查看和导出日志' }
{ code: 'file:create', description: '上传和创建文件' }
{ code: 'notification:create', description: '发送通知' }

// ❌ 错误
{ code: 'log:export', action: 'export' }
{ code: 'file:upload', action: 'upload' }
{ code: 'notification:send', action: 'send' }
```

### 2. 权限描述
在 description 中说明该权限包含的具体功能：

```javascript
{
  code: 'log:read',
  action: 'read',
  description: '查看日志列表、详情、导出日志数据'
}

{
  code: 'file:update',
  action: 'update',
  description: '更新文件信息（重命名、移动、复制）'
}
```

### 3. 后端实现
在具体的路由和控制器中，可以进一步细分权限检查：

```javascript
// 虽然权限是 file:read，但可以在代码中区分具体操作
router.get('/files/:id/download',
  checkPermission('file:read'),  // 权限检查
  fileController.download         // 具体下载逻辑
);

router.get('/files/:id/preview',
  checkPermission('file:read'),  // 同样的权限
  fileController.preview          // 具体预览逻辑
);
```

## 注意事项

1. **保持简单**：不要过度细分权限，CRUD 四种操作足够覆盖大部分场景
2. **语义化描述**：通过 description 字段详细说明权限包含的功能
3. **代码层控制**：复杂的业务逻辑可以在代码层面做更细粒度的控制
4. **文档同步**：更新权限时同步更新此映射文档
