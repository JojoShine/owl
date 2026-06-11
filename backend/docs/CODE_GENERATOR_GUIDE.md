# 代码生成器实现流程

## 概述

Owl Platform 的代码生成器采用**配置驱动架构**，实现零文件生成、零重启部署的动态模块系统。

与传统的代码生成不同（生成文件后需要重启应用），我们的方案是：
1. **配置入库** - 将模块配置保存到数据库
2. **动态路由** - 通过通用路由动态加载模块
3. **通用处理** - 使用通用的 Controller 和 Service 处理所有模块
4. **即时生效** - 配置保存后立即生效，无需重启

---

## 核心架构

### 系统流程图

```
用户定义模块
    ↓
表结构分析 (读取数据库)
    ↓
模块配置入库 (module_config 表)
    ↓
前端页面配置入库 (page_config 表)
    ↓
菜单权限配置入库 (menus、permissions 表)
    ↓
应用启动
    ↓
通用路由拦截请求 (/api/modules/:modulePath/:action)
    ↓
通用 Controller 处理
    ↓
通用 Service 查询 module_config
    ↓
动态构建 SQL、验证参数、执行业务逻辑
    ↓
返回结果
```

---

## 核心组件

### 1. 模块配置表 (owl_module_configs)

```sql
CREATE TABLE owl_module_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name VARCHAR(100) NOT NULL,        -- 模块名称
  module_path VARCHAR(100) NOT NULL UNIQUE, -- 模块路径 (用于 URL)
  table_name VARCHAR(100) NOT NULL,         -- 数据库表名
  description TEXT,                          -- 模块描述
  fields JSONB NOT NULL,                    -- 字段配置（列表、表单等）
  filters JSONB,                            -- 高级过滤配置
  actions JSONB,                            -- 自定义操作配置
  permissions JSONB,                        -- 权限配置
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 前端页面配置表 (owl_page_configs)

```sql
CREATE TABLE owl_page_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES owl_module_configs(id) ON DELETE CASCADE,
  page_type VARCHAR(50) NOT NULL,           -- list / form / detail
  config JSONB NOT NULL,                    -- 页面配置（布局、字段、操作等）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 代码生成流程

### 1. 分析表结构

```javascript
// src/core/modules/generator/code-generator.service.js

async function _readTableSchema(tableName) {
  // 查询表的所有列信息
  const columns = await sequelize.query(`
    SELECT 
      column_name as name,
      data_type as type,
      is_nullable,
      column_default,
      character_maximum_length,
      numeric_precision,
      numeric_scale
    FROM information_schema.columns
    WHERE table_name = $1 AND table_schema = 'public'
    ORDER BY ordinal_position
  `, { bind: [tableName] });

  // 查询主键
  const primaryKey = await sequelize.query(`
    SELECT a.attname
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid
    WHERE i.indrelname = $1
  `, { bind: [`${tableName}_pkey`] });

  // 查询索引
  const indexes = await sequelize.query(`
    SELECT indexname, indexdef FROM pg_indexes
    WHERE tablename = $1
  `, { bind: [tableName] });

  return {
    name: tableName,
    columns: columns[0] || [],
    primaryKey: primaryKey[0]?.[0]?.attname,
    indexes: indexes[0] || []
  };
}
```

### 2. 准备模板数据

```javascript
function _prepareTemplateData(moduleConfig, tableSchema) {
  // 处理列信息
  const fields = tableSchema.columns.map(col => ({
    name: col.name,
    dbType: col.type,
    jsType: this._mapDbTypeToJs(col.type),
    required: !col.is_nullable,
    label: this._generateLabel(col.name),
    fieldType: this._inferFieldType(col.type),
    maxLength: col.character_maximum_length,
    precision: col.numeric_precision,
    scale: col.numeric_scale
  }));

  // 排除系统字段
  const businessFields = fields.filter(f => 
    !['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at'].includes(f.name)
  );

  return {
    moduleName: moduleConfig.module_name,
    modulePath: moduleConfig.module_path,
    tableName: moduleConfig.table_name,
    camelCase: this._toCamelCase(moduleConfig.module_path),
    pascalCase: this._toPascalCase(moduleConfig.module_path),
    pluralLower: this._pluralize(moduleConfig.module_path),
    fields: businessFields,
    allFields: fields,
    primaryKey: tableSchema.primaryKey
  };
}
```

### 3. 生成前端页面配置（入库）

```javascript
async function _generatePageConfig(moduleConfig) {
  const tableSchema = await this._readTableSchema(moduleConfig.table_name);
  const templateData = this._prepareTemplateData(moduleConfig, tableSchema);

  // 列表页配置
  const listPageConfig = {
    type: 'list',
    title: moduleConfig.module_name,
    columns: templateData.businessFields.map(f => ({
      key: f.name,
      label: f.label,
      type: f.fieldType,
      width: 150
    })),
    actions: [
      { type: 'view', label: '查看' },
      { type: 'edit', label: '编辑' },
      { type: 'delete', label: '删除' }
    ],
    bulkActions: [
      { type: 'batchDelete', label: '批量删除' }
    ]
  };

  // 表单页配置
  const formPageConfig = {
    type: 'form',
    title: `编辑${moduleConfig.module_name}`,
    fields: templateData.businessFields.map(f => ({
      name: f.name,
      label: f.label,
      type: f.fieldType,
      required: f.required,
      placeholder: `请输入${f.label}`,
      validation: this._generateValidation(f)
    }))
  };

  // 保存到数据库
  await PageConfig.create({
    module_id: moduleConfig.id,
    page_type: 'list',
    config: listPageConfig
  });

  await PageConfig.create({
    module_id: moduleConfig.id,
    page_type: 'form',
    config: formPageConfig
  });
}
```

### 4. 自动创建菜单和权限

```javascript
async function _createMenu(moduleConfig) {
  // 创建菜单项
  const menu = await Menu.create({
    name: moduleConfig.module_name,
    path: `/modules/${moduleConfig.module_path}`,
    icon: 'list',
    order: 999,
    parent_id: null // 或指定父菜单 ID
  });

  // 创建权限项
  const permissions = [
    { name: `${moduleConfig.module_path}:read`, description: `查看${moduleConfig.module_name}` },
    { name: `${moduleConfig.module_path}:create`, description: `新增${moduleConfig.module_name}` },
    { name: `${moduleConfig.module_path}:update`, description: `修改${moduleConfig.module_name}` },
    { name: `${moduleConfig.module_path}:delete`, description: `删除${moduleConfig.module_name}` }
  ];

  for (const perm of permissions) {
    await Permission.create(perm);
  }

  // 将菜单与权限关联
  await menu.setPermissions(
    await Permission.findAll({
      where: { name: { [Op.startsWith]: `${moduleConfig.module_path}:` } }
    })
  );
}
```

---

## 动态路由处理

### 1. 通用路由拦截

```javascript
// src/core/modules/business/dynamic-routes.js

router.get('/:modulePath/:action', authMiddleware, async (req, res) => {
  const { modulePath, action } = req.params;

  // 查询模块配置
  const moduleConfig = await ModuleConfig.findOne({
    where: { module_path: modulePath }
  });

  if (!moduleConfig) {
    return res.status(404).json({ success: false, message: '模块不存在' });
  }

  // 权限检查
  const permission = `${modulePath}:${action}`;
  if (!req.user.permissions.includes(permission)) {
    return res.status(403).json({ success: false, message: '无权限' });
  }

  // 调用通用 Service
  const result = await genericService.handleRequest(moduleConfig, action, req);

  return res.json(result);
});
```

### 2. 通用 Service 处理

```javascript
// src/core/modules/business/generic.service.js

async function handleRequest(moduleConfig, action, req) {
  const { page = 1, limit = 10, ...filters } = req.query;
  const tableName = moduleConfig.table_name;
  const Model = await this._getModel(tableName);

  switch (action) {
    case 'list':
      return await this._handleList(Model, { page, limit, filters });

    case 'detail':
      return await this._handleDetail(Model, req.params.id);

    case 'create':
      return await this._handleCreate(Model, req.body, req.user);

    case 'update':
      return await this._handleUpdate(Model, req.params.id, req.body);

    case 'delete':
      return await this._handleDelete(Model, req.params.id);

    default:
      throw new Error(`不支持的操作: ${action}`);
  }
}

// 动态获取模型
async function _getModel(tableName) {
  const sequelize = require('../../../config/database');
  return sequelize.models[tableName] || null;
}

async function _handleList(Model, { page, limit, filters }) {
  const { count, rows } = await Model.findAndCountAll({
    where: filters,
    limit,
    offset: (page - 1) * limit,
    order: [['created_at', 'DESC']]
  });

  return {
    success: true,
    data: rows,
    meta: { total: count, page, limit }
  };
}
```

---

## 前端页面配置驱动渲染

### 前端通用页面

```javascript
// frontend/app/(authenticated)/modules/[modulePath]/page.js

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DynamicListPage from '@/components/modules/DynamicListPage';
import { api } from '@/lib/api';

export default function ModulePage() {
  const { modulePath } = useParams();
  const [pageConfig, setPageConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从后端获取页面配置
    api.get(`/modules/${modulePath}/page-config`)
      .then(res => setPageConfig(res.data.config))
      .finally(() => setLoading(false));
  }, [modulePath]);

  if (loading) return <div>加载中...</div>;
  if (!pageConfig) return <div>配置不存在</div>;

  return <DynamicListPage modulePath={modulePath} config={pageConfig} />;
}
```

### 通用列表组件

```javascript
// frontend/components/modules/DynamicListPage.js

export default function DynamicListPage({ modulePath, config }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // 根据配置加载数据
    api.get(`/modules/${modulePath}/list`)
      .then(res => setData(res.data.data));
  }, [modulePath]);

  // 根据 config 动态渲染列表
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {config.columns.map(col => (
            <TableHead key={col.key}>{col.label}</TableHead>
          ))}
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(item => (
          <TableRow key={item.id}>
            {config.columns.map(col => (
              <TableCell key={col.key}>{item[col.key]}</TableCell>
            ))}
            <TableCell>
              {config.actions.map(action => (
                <Button key={action.type} onClick={() => handleAction(action, item)}>
                  {action.label}
                </Button>
              ))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## 工作流总结

| 步骤 | 操作 | 存储位置 | 重启需要 |
|------|------|---------|--------|
| 1 | 分析表结构 | 内存 | 否 |
| 2 | 生成配置 | 数据库 | 否 |
| 3 | 创建菜单权限 | 数据库 | 否 |
| 4 | 请求到达 | - | 否 |
| 5 | 通用路由拦截 | 代码 | 已内置 |
| 6 | 查询配置 | 数据库 | 否 |
| 7 | 动态处理 | 代码 | 已内置 |
| 8 | 返回结果 | - | 否 |

**关键特点：零文件生成，零重启部署！**

---

## 优势

### 相比传统代码生成

| 方面 | 传统方案 | 配置驱动 |
|------|---------|--------|
| 生成方式 | 生成文件 | 入库配置 |
| 部署方式 | 需要重启 | 立即生效 |
| 修改方式 | 修改代码 | 修改配置 |
| 维护成本 | 高（多个文件版本） | 低（单一数据库） |
| 灵活性 | 中等 | 高（动态修改） |
| 性能 | 良好 | 良好（配置缓存） |

---

## 最佳实践

1. **配置缓存** - 在 Redis 中缓存模块配置和页面配置，提高性能
2. **权限检查** - 确保所有操作都经过权限检查
3. **数据验证** - 根据字段配置自动验证输入数据
4. **审计日志** - 记录所有模块操作的审计日志
5. **版本管理** - 记录配置变更历史，支持回滚
6. **扩展性** - 支持自定义操作、钩子、中间件等

---

## 扩展与定制

### 支持自定义业务逻辑

```javascript
// 在模块配置中添加钩子
{
  module_name: '员工管理',
  hooks: {
    beforeCreate: 'validateEmployee',
    afterCreate: 'notifyHR',
    beforeDelete: 'checkPermission'
  }
}

// 在 generic.service 中调用
await this._executeHook(moduleConfig, 'beforeCreate', data);
```

### 支持自定义字段处理

```javascript
// 字段配置中指定处理器
{
  name: 'salary',
  type: 'number',
  handler: 'encryptSalary' // 自定义处理函数
}
```

