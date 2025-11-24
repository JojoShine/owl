# OWL管理平台 - 低代码（Lowcode）模块完整探索报告

**生成时间**: 2025-11-24  
**探索范围**: 完整代码库  
**详细级别**: 极其详细

---

## 目录
1. [前端相关文件](#前端相关文件)
2. [后端相关文件](#后端相关文件)
3. [数据库相关文件](#数据库相关文件)
4. [与代码生成器的关联](#与代码生成器的关联)
5. [配置和文档文件](#配置和文档文件)
6. [权限和菜单配置](#权限和菜单配置)
7. [数据表结构详解](#数据表结构详解)
8. [API接口集合](#api接口集合)
9. [统计信息](#统计信息)
10. [关键集成点](#关键集成点)

---

## 前端相关文件

### 1.1 低代码平台主要页面
**位置**: `/frontend/app/(authenticated)/lowcode/`

| 文件 | 功能说明 |
|------|--------|
| `datasources/page.js` | 数据源管理页面 - 列表、创建、编辑、删除数据源 |
| `apis/page.js` | API接口管理页面 - 列表、创建、编辑、删除API |
| `apis/edit/page.js` | API编辑页面 - SQL编写、参数配置、测试 |
| `page-configs/page.js` | 页面配置管理页面 - 列表、创建、编辑页面配置 |
| `page-configs/edit/page.js` | 页面配置编辑页面 - 高级配置和设计器 |
| `page-designer/page.js` | 页面设计器页面 - 可视化设计接口 |

**代码示例**:
- 前端使用React hooks和Next.js App Router
- 通过`@/lib/api`中的API接口进行数据交互
- 使用分页和搜索功能
- 带有确认对话框的删除操作

### 1.2 页面设计器组件库
**位置**: `/frontend/components/page-designer/`

**组件清单**:

| 组件 | 类型 | 功能 |
|------|------|------|
| `PageContext.js` | 上下文提供者 | 管理页面全局状态 |
| `components/index.js` | 导出入口 | 导出所有设计器组件 |
| `components/ApiSelector.js` | 功能组件 | API选择和配置 |
| `components/ApiFieldMapper.js` | 功能组件 | API字段映射 |
| `components/Text.js` | UI组件 | 文本展示 |
| `components/Card.js` | 容器组件 | 卡片容器 |
| `components/Container.js` | 容器组件 | 通用容器 |
| `components/Divider.js` | UI组件 | 分割线 |
| `components/Form.js` | 表单组件 | 表单容器和字段 |
| `components/Image.js` | UI组件 | 图片展示 |
| `components/Tree.js` | 数据组件 | 树形数据结构 |
| `components/Button.js` | 交互组件 | 按钮和操作 |
| `components/Table.js` | 数据组件 | 数据表格 |
| `components/Chart.js` | 数据可视化 | 图表展示 |
| `components/SearchableTable.js` | 数据组件 | 带搜索的表格 |

### 1.3 低代码组件库
**位置**: `/frontend/components/lowcode/`

| 文件 | 功能 |
|------|------|
| `datasource-form-dialog.jsx` | 数据源表单对话框 - 创建/编辑数据源的表单 |

### 1.4 动态模块组件
**位置**: `/frontend/components/dynamic-module/`

| 文件 | 功能 |
|------|------|
| `index.js` | 导出入口 |
| `DynamicCrudPage.jsx` | 动态CRUD页面模板 |
| `DynamicFilters.jsx` | 动态筛选器组件 |
| `DynamicForm.jsx` | 动态表单生成 |
| `DynamicTable.jsx` | 动态表格生成 |
| `SortableTable.jsx` | 可拖拽排序表格 |

### 1.5 动态路由页面
**位置**: `/frontend/app/(authenticated)/dynamic/`

| 文件 | 功能 |
|------|------|
| `[modulePath]/[id]/page.js` | 动态模块详情页面 - 支持参数化路由 |

### 1.6 前端API库
**位置**: `/frontend/lib/api.js`

```javascript
// 数据源管理API (lines 534-555)
export const datasourceApi = {
  getDatasources(params)           // 获取列表
  getDatasource(id)                // 获取详情
  createDatasource(data)           // 创建
  updateDatasource(id, data)       // 更新
  deleteDatasource(id)             // 删除
  testDatasource(id)               // 测试连接
  testDatasourceConfig(data)       // 测试配置不保存
}

// API接口管理API (lines 557-588)
export const apiInterfaceApi = {
  getApiInterfaces(params)         // 获取列表
  getApiInterface(id)              // 获取详情
  createApiInterface(data)         // 创建
  updateApiInterface(id, data)     // 更新
  deleteApiInterface(id)           // 删除
  testApiInterface(id, data)       // 测试API
  parseSql(data)                   // 解析SQL
  testSql(data)                    // 测试SQL执行
  getApiCallLogs(id, params)       // 获取调用日志
  getApiStatistics(id)             // 获取统计信息
}

// 页面配置管理API (lines 590-609)
export const pageConfigApi = {
  getPageConfigs(params)           // 获取列表
  getPageConfig(id)                // 获取详情
  createPageConfig(data)           // 创建
  updatePageConfig(id, data)       // 更新
  deletePageConfig(id)             // 删除
  getAvailableApis()               // 获取可用API列表
}
```

---

## 后端相关文件

### 2.1 API接口模块
**位置**: `/backend/src/modules/api-interface/`

| 文件 | 职责 | 关键类/函数 |
|------|------|----------|
| `api-interface.controller.js` | 请求处理 | ApiInterfaceController |
| `api-interface.routes.js` | 路由定义 | 路由配置 |
| `api-interface.service.js` | 业务逻辑 | 核心业务处理 |
| `api-interface.validation.js` | 输入验证 | 参数校验规则 |

**主要功能**:
- API配置的CRUD操作
- SQL模板管理
- API测试和执行
- 调用日志记录
- 响应格式定义

### 2.2 数据源模块
**位置**: `/backend/src/modules/datasource/`

| 文件 | 职责 |
|------|------|
| `datasource.controller.js` | 数据源请求处理 |
| `datasource.routes.js` | 数据源路由定义 |
| `datasource.service.js` | 数据源业务逻辑 |
| `datasource.validation.js` | 数据源参数验证 |

**主要功能**:
- 支持多种数据库类型 (MySQL, PostgreSQL, MongoDB)
- 连接配置管理（密码加密存储）
- 连接测试
- 默认数据源设置

### 2.3 页面配置模块
**位置**: `/backend/src/modules/page-config/`

| 文件 | 职责 |
|------|------|
| `page-config.controller.js` | 页面配置请求处理 |
| `page-config.routes.js` | 页面配置路由定义 |
| `page-config.service.js` | 页面配置业务逻辑 |

**主要功能**:
- 页面配置的CRUD操作
- 字段映射配置
- 功能开关管理
- 分页和搜索配置
- 生命周期函数定义

### 2.4 动态API路由
**位置**: `/backend/src/routes/custom-api.routes.js`

```javascript
/**
 * 动态API路由处理器
 * 拦截所有 /api/custom/* 路径的请求
 * 根据数据库中配置的API接口动态执行
 * 支持所有HTTP方法：GET, POST, PUT, DELETE
 * 路由格式: /api/custom/*
 */
const handleDynamicApi = async (req, res, next) => {
  // 提取路径、方法、参数
  // 执行API
  // 返回结果或错误
}

router.all('/*', optionalAuth, handleDynamicApi);
```

### 2.5 后端模型定义
**位置**: `/backend/src/models/`

#### ApiInterface.js
```javascript
模型定义:
- id (UUID): 主键
- name: API名称
- path: API路径（唯一）
- method: HTTP方法 (GET|POST|PUT|DELETE)
- datasource_id: 关联数据源
- sql_template: SQL模板（旧）
- query_type: 查询类型 (raw|builder)
- query_config: 查询配置
- params_schema: 参数schema
- output_format: 出参格式
- auth_required: 是否需要认证
- cache_enabled: 是否启用缓存
- rate_limit_enabled: 是否启用限流
- call_count: 调用次数
- last_called_at: 最后调用时间
- avg_response_time: 平均响应时间

关联关系:
- belongsTo Datasource
- belongsTo User (creator)
- hasMany ApiCallLog
```

#### Datasource.js
```javascript
模型定义:
- id (UUID): 主键
- name: 数据源名称（唯一）
- type: 数据库类型 (mysql|postgresql|mongodb)
- config (JSONB): 连接配置
- is_active: 是否激活
- is_default: 是否默认
- last_test_at: 最后测试时间
- last_test_status: 测试状态
- last_test_error: 测试错误

关联关系:
- belongsTo User (creator)
- hasMany ApiInterface
```

#### PageConfig.js
```javascript
模型定义:
- id (UUID): 主键
- name: 页面名称
- page_type: 页面类型 (config|designer)
- display_mode: 显示模式 (table|sortable)
- api_interface_id: 关联API
- search_fields (JSONB): 搜索字段配置
- list_fields (JSONB): 列表字段配置
- code_mappings (JSONB): 代码值映射
- lifecycle_hooks (JSONB): 生命周期函数
- features (JSONB): 功能开关
- pagination (JSONB): 分页配置
- components (JSONB): 组件树（设计器模式）

关联关系:
- belongsTo User (creator)
- belongsTo ApiInterface
```

#### ApiCallLog.js
```javascript
模型定义:
- id (UUID): 主键
- api_id: API接口ID
- request_method: 请求方法
- request_path: 请求路径
- request_params (JSONB): 请求参数
- request_headers (JSONB): 请求头
- request_ip: 请求IP
- user_id: 调用用户ID
- response_status: 响应状态码
- response_time: 响应时间（毫秒）
- response_size: 响应大小（字节）
- executed_sql: 执行的SQL
- sql_duration: SQL执行时间
- error_message: 错误信息

关联关系:
- belongsTo ApiInterface
- belongsTo User
```

### 2.6 主路由配置
**位置**: `/backend/src/routes/index.js`

```javascript
// 低代码平台路由配置 (lines 70-74)
router.use('/datasources', datasourceRoutes);
router.use('/api-interfaces', apiInterfaceRoutes);
router.use('/page-configs', pageConfigRoutes);
router.use('/custom', customApiRoutes);
```

---

## 数据库相关文件

### 3.1 SQL Schema定义
**位置**: `/backend/sql/lowcode-platform-schema.sql`

**包含表**:
1. `datasources` - 数据源配置
2. `api_interfaces` - API接口配置
3. `api_call_logs` - API调用日志
4. `lowcode_pages` - 低代码页面（定义但未实现）
5. `lowcode_page_versions` - 页面版本历史（定义但未实现）
6. `lowcode_components` - 组件库（定义但未实现）

**关键特性**:
- UUID主键
- JSONB字段用于灵活配置
- 外键关联用户
- 自动更新时间戳触发器
- 性能索引

### 3.2 初始化数据
**位置**: `/backend/sql/init-data.sql`

**权限初始化** (lines 413-435):
```sql
-- 数据源权限 (datasource:*)
datasource:read, create, update, delete

-- API接口权限 (api_interface:*)
api_interface:read, create, update, delete

-- 页面权限 (lowcode_page:*)
lowcode_page:read, create, update, delete
```

**菜单初始化** (lines 438-456):
```sql
-- 一级菜单
低代码管理 (icon: Code2, order: 15)

-- 二级菜单
  数据源管理 (/lowcode/datasources)
  API接口管理 (/lowcode/apis)
  页面管理 (/lowcode/page-configs)
```

**角色权限分配**:
- 超级管理员 - 所有权限
- 管理员 - 所有权限
- 其他角色 - 需手动配置

### 3.3 迁移文件
**位置**: `/backend/migrations/`

| 文件 | 功能 |
|------|------|
| `20251020143651-add-page-config-to-generated-modules.js` | 为生成模块添加page_config字段 |
| `20251118000000-add-api-interface-new-fields.js` | 为API接口添加新字段 |
| `lowcode-menu-structure.sql` | 低代码菜单结构SQL |

---

## 与代码生成器的关联

### 4.1 代码生成器中的低代码支持
**位置**: `/backend/src/modules/generator/`

**相关路由**:
```javascript
GET  /api/generator/page-config/:modulePath
GET  /api/generator/configs/:id/page-config
PUT  /api/generator/configs/:id/page-config
```

**相关文件**:
- `generator.controller.js` - 页面配置控制器
- `code-generator.service.js` - 生成page_config
- `module-config.service.js` - 页面配置管理

**功能集成**:
- 生成模块时同时生成page_config
- 支持动态页面配置
- 与generated_modules表关联
- page_config字段存储JSON配置

### 4.2 page_config字段用途
- 存储前端页面动态配置
- 支持列表字段配置
- 支持搜索字段配置
- 支持分页配置
- 支持自定义功能开关

---

## 配置和文档文件

### 5.1 文档文件
| 文件 | 内容 |
|------|------|
| `CODEBASE_STRUCTURE.md` | 代码库结构文档 |
| `CODEBASE_EXPLORATION.md` | 代码库探索文档 |
| `projectplan.md` | 项目计划和进度 |
| `/backend/migrations/README-dynamic-sql.md` | 动态SQL功能说明 |

### 5.2 测试和工具脚本
| 脚本 | 功能 |
|------|------|
| `check_api.js` | API检查工具 |
| `get_valid_token.js` | 获取有效token |
| `list_all_apis.js` | 列出所有API |
| `test_api_auth.js` | API认证测试 |
| `test-dynamic-sql.sh` | 动态SQL测试 |

---

## 权限和菜单配置

### 6.1 完整权限体系

**权限资源分类** (12个权限):

```
1. 数据源管理 (datasource)
   - datasource:read       查看数据源
   - datasource:create     创建数据源
   - datasource:update     更新数据源
   - datasource:delete     删除数据源

2. API接口管理 (api_interface)
   - api_interface:read    查看API接口
   - api_interface:create  创建API接口
   - api_interface:update  更新API接口
   - api_interface:delete  删除API接口

3. 页面管理 (lowcode_page)
   - lowcode_page:read     查看页面
   - lowcode_page:create   创建页面
   - lowcode_page:update   更新页面
   - lowcode_page:delete   删除页面
```

### 6.2 完整菜单结构

```
一级菜单: 低代码管理
  图标: Code2
  顺序: 15
  权限: 无（仅作为父菜单）

  二级菜单1: 数据源管理
    路径: /lowcode/datasources
    权限: datasource:read
    顺序: 1
    图标: Database

  二级菜单2: API接口管理
    路径: /lowcode/apis
    权限: api_interface:read
    顺序: 2
    图标: Workflow

  二级菜单3: 页面管理
    路径: /lowcode/page-configs
    权限: lowcode_page:read
    顺序: 3
    图标: Layout
```

### 6.3 权限授予规则

**默认赋予的角色**:
- 超级管理员 (ROLE_SUPER_ADMIN): 所有12个权限 + 菜单访问权限
- 管理员 (ROLE_ADMIN): 所有12个权限 + 菜单访问权限
- 普通用户: 需要手动赋予相应权限

---

## 数据表结构详解

### 7.1 datasources 表

```sql
CREATE TABLE datasources (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,           -- 数据源名称
  description TEXT,
  type VARCHAR(20) NOT NULL,                   -- mysql|postgresql|mongodb
  config JSONB NOT NULL,                       -- 连接配置JSON
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  last_test_at TIMESTAMP,
  last_test_status VARCHAR(20),                -- success|failed
  last_test_error TEXT,
  created_by UUID,                             -- FK users.id
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_datasources_type ON datasources(type);
CREATE INDEX idx_datasources_active ON datasources(is_active);

-- 触发器
CREATE TRIGGER update_datasources_updated_at
  BEFORE UPDATE ON datasources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**config JSON结构示例**:
```json
{
  "host": "localhost",
  "port": 5432,
  "database": "mydb",
  "username": "user",
  "password": "encrypted_password",
  "ssl": false,
  "connectionLimit": 10,
  "timeout": 5000
}
```

### 7.2 api_interfaces 表

```sql
CREATE TABLE api_interfaces (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  path VARCHAR(200) NOT NULL UNIQUE,           -- /api/custom/users/list
  method VARCHAR(10) NOT NULL,                 -- GET|POST|PUT|DELETE
  datasource_id UUID NOT NULL,                 -- FK datasources.id
  sql_template TEXT,                           -- 旧字段
  query_type VARCHAR(20),                      -- raw|builder
  query_config JSONB,                          -- 查询配置
  params_schema JSONB,                         -- 参数定义
  output_format JSONB,                         -- 出参格式
  response_transform TEXT,                     -- 响应转换代码
  auth_required BOOLEAN DEFAULT true,
  auth_config JSONB,                           -- 认证配置
  cache_enabled BOOLEAN DEFAULT false,
  cache_ttl INTEGER,
  rate_limit_enabled BOOLEAN DEFAULT false,
  rate_limit_config JSONB,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  call_count INTEGER DEFAULT 0,
  last_called_at TIMESTAMP,
  avg_response_time FLOAT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_api_path ON api_interfaces(path);
CREATE INDEX idx_api_datasource ON api_interfaces(datasource_id);
CREATE INDEX idx_api_active ON api_interfaces(is_active);
CREATE INDEX idx_api_method ON api_interfaces(method);
```

**params_schema JSON结构示例**:
```json
[
  {
    "name": "status",
    "type": "string",
    "required": true,
    "default": "active",
    "validation": { "enum": ["active", "inactive"] }
  },
  {
    "name": "limit",
    "type": "number",
    "default": 10,
    "validation": { "min": 1, "max": 100 }
  }
]
```

### 7.3 api_call_logs 表

```sql
CREATE TABLE api_call_logs (
  id UUID PRIMARY KEY,
  api_id UUID NOT NULL,                        -- FK api_interfaces.id
  request_method VARCHAR(10),
  request_path VARCHAR(200),
  request_params JSONB,
  request_headers JSONB,
  request_ip VARCHAR(50),
  user_id UUID,                                -- FK users.id
  response_status INTEGER,
  response_time INTEGER,                       -- 毫秒
  response_size INTEGER,                       -- 字节
  executed_sql TEXT,
  sql_duration INTEGER,                        -- 毫秒
  error_message TEXT,
  stack_trace TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_api_logs_api_id ON api_call_logs(api_id);
CREATE INDEX idx_api_logs_created_at ON api_call_logs(created_at);
CREATE INDEX idx_api_logs_user_id ON api_call_logs(user_id);
```

### 7.4 page_configs 表

```sql
CREATE TABLE page_configs (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  page_type VARCHAR(20),                       -- config|designer
  display_mode VARCHAR(20),                    -- table|sortable
  api_interface_id UUID,                       -- FK api_interfaces.id
  search_fields JSONB DEFAULT '[]',
  list_fields JSONB DEFAULT '[]',
  code_mappings JSONB DEFAULT '{}',
  lifecycle_hooks JSONB DEFAULT '{}',
  features JSONB,
  pagination JSONB,
  components JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**features JSON结构示例**:
```json
{
  "create": true,
  "update": true,
  "delete": true,
  "batchDelete": false,
  "export": false
}
```

### 7.5 lowcode_pages 表 (定义但未实现)

```sql
CREATE TABLE lowcode_pages (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  path VARCHAR(200) NOT NULL UNIQUE,           -- 路由路径
  page_type VARCHAR(20) DEFAULT 'custom',      -- custom|template|hybrid
  template_id UUID,                            -- FK generated_modules.id
  layout_config JSONB,
  component_tree JSONB,
  global_state JSONB,
  lifecycle_hooks JSONB,
  event_handlers JSONB,
  api_bindings JSONB,
  permission_config JSONB,
  is_published BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_pages_path ON lowcode_pages(path);
CREATE INDEX idx_pages_type ON lowcode_pages(page_type);
CREATE INDEX idx_pages_published ON lowcode_pages(is_published);
```

### 7.6 lowcode_page_versions 表 (定义但未实现)

```sql
CREATE TABLE lowcode_page_versions (
  id UUID PRIMARY KEY,
  page_id UUID NOT NULL,                       -- FK lowcode_pages.id
  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL,                     -- 完整页面配置快照
  change_summary TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (page_id, version)
);
```

### 7.7 lowcode_components 表 (定义但未实现)

```sql
CREATE TABLE lowcode_components (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100),
  category VARCHAR(50),                        -- layout|form|data|feedback|custom
  description TEXT,
  icon VARCHAR(50),
  component_schema JSONB,
  default_props JSONB,
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API接口集合

### 8.1 数据源管理接口

```
GET     /api/datasources
        查询参数: page, limit, search
        返回: { data: [], pagination: { ... } }

GET     /api/datasources/:id
        返回: { success: true, data: { ... } }

POST    /api/datasources
        请求体: { name, description, type, config }
        返回: { success: true, data: { id, ... } }

PUT     /api/datasources/:id
        请求体: { name, description, type, config }
        返回: { success: true, data: { ... } }

DELETE  /api/datasources/:id
        返回: { success: true }

POST    /api/datasources/:id/test
        测试已保存的数据源连接
        返回: { success: true, message: "连接成功" }

POST    /api/datasources/test
        请求体: { type, config }
        测试不保存的连接配置
        返回: { success: true, message: "连接成功" }
```

### 8.2 API接口管理接口

```
GET     /api/api-interfaces
        查询参数: page, limit, search, datasource_id, method, status
        返回: { data: [], pagination: { ... } }

GET     /api/api-interfaces/:id
        返回: { success: true, data: { ...apiInterface } }

POST    /api/api-interfaces
        请求体: {
          name, description, path, method, datasource_id,
          sql_template/query_config, params_schema, output_format,
          auth_required, cache_enabled, ...
        }
        返回: { success: true, data: { id, ... } }

PUT     /api/api-interfaces/:id
        请求体: { name, description, path, method, ... }
        返回: { success: true, data: { ... } }

DELETE  /api/api-interfaces/:id
        返回: { success: true }

POST    /api/api-interfaces/:id/test
        请求体: { params: { ... } }
        测试API执行
        返回: { success: true, data: { ... }, duration: 123 }

POST    /api/api-interfaces/parse-sql
        请求体: { sql, datasource_id }
        解析SQL语句提取参数
        返回: { success: true, data: { parameters: [...], fields: [...] } }

POST    /api/api-interfaces/test-sql
        请求体: { sql, datasource_id, params: { ... } }
        测试SQL执行
        返回: { success: true, data: { rows: [...] } }

GET     /api/api-interfaces/:id/logs
        查询参数: page, limit, user_id, from_date, to_date
        获取API调用日志
        返回: { data: [], pagination: { ... } }

GET     /api/api-interfaces/:id/statistics
        获取API统计信息
        返回: {
          totalCalls: 100,
          avgResponseTime: 45.2,
          errorCount: 5,
          ...
        }
```

### 8.3 页面配置管理接口

```
GET     /api/page-configs
        查询参数: page, limit, name, page_type, status
        返回: { data: [], pagination: { ... } }

GET     /api/page-configs/:id
        返回: { success: true, data: { ...pageConfig } }

POST    /api/page-configs
        请求体: {
          name, description, page_type, display_mode,
          api_interface_id, search_fields, list_fields,
          code_mappings, features, pagination, components
        }
        返回: { success: true, data: { id, ... } }

PUT     /api/page-configs/:id
        请求体: { name, description, ... }
        返回: { success: true, data: { ... } }

DELETE  /api/page-configs/:id
        返回: { success: true }

GET     /api/page-configs/available-apis
        获取所有可用API接口列表
        返回: { data: [{id, name, path, method}, ...] }
```

### 8.4 动态API执行接口

```
ALL     /api/custom/*
        支持所有HTTP方法: GET, POST, PUT, DELETE
        支持任意路径和参数
        示例: GET /api/custom/users/list?status=active
        返回: 动态执行结果或错误
```

### 8.5 代码生成器中的低代码接口

```
GET     /api/generator/page-config/:modulePath
        获取模块的页面配置
        返回: { data: { ...pageConfig } }

GET     /api/generator/configs/:id/page-config
        获取生成配置的页面配置
        返回: { data: { ...pageConfig } }

PUT     /api/generator/configs/:id/page-config
        请求体: { ...pageConfigUpdate }
        更新生成配置的页面配置
        返回: { success: true, data: { ...pageConfig } }
```

---

## 统计信息

### 9.1 代码文件统计

```
前端页面文件:          6个
  - datasources/page.js
  - apis/page.js
  - apis/edit/page.js
  - page-configs/page.js
  - page-configs/edit/page.js
  - page-designer/page.js

前端组件文件:          22个
  - page-designer/: 16个
  - lowcode/: 1个
  - dynamic-module/: 5个

后端模块文件:          12个
  - api-interface/: 4个
  - datasource/: 4个
  - page-config/: 3个
  - custom-api.routes.js: 1个

后端模型文件:          4个
  - ApiInterface.js
  - Datasource.js
  - PageConfig.js
  - ApiCallLog.js

数据库表定义:          7个
  - datasources (激活)
  - api_interfaces (激活)
  - api_call_logs (激活)
  - page_configs (激活)
  - lowcode_pages (定义未使用)
  - lowcode_page_versions (定义未使用)
  - lowcode_components (定义未使用)

数据库迁移文件:        2个
  - add-page-config-to-generated-modules
  - add-api-interface-new-fields

API路由端点:           20+个
  - datasource: 7个
  - api-interface: 10个
  - page-config: 6个
  - custom: 动态

权限项:                12个
  - datasource:* (4个)
  - api_interface:* (4个)
  - lowcode_page:* (4个)

菜单项:                4个
  - 低代码管理 (1个父菜单)
  - 数据源管理 (1个子菜单)
  - API接口管理 (1个子菜单)
  - 页面管理 (1个子菜单)
```

### 9.2 代码行数估计

```
后端代码总行数:        约 3000+ 行
  - 服务层: 约 1500+ 行
  - 控制层: 约 500+ 行
  - 模型和路由: 约 1000+ 行

前端代码总行数:        约 2000+ 行
  - 页面组件: 约 1000+ 行
  - UI组件: 约 1000+ 行

数据库定义:            约 700+ 行

总计:                  约 5700+ 行低代码相关代码
```

---

## 关键集成点

### 10.1 与代码生成器的集成

**集成方式**:
- `generated_modules` 表添加 `page_config` 字段
- 生成代码时同时生成页面配置
- 支持动态页面渲染

**相关代码**:
- Migration: `20251020143651-add-page-config-to-generated-modules.js`
- Generator routes: `/api/generator/page-config/*`
- Generator service: `code-generator.service.js`

**优势**:
- 代码生成和UI配置解耦
- 支持灵活的页面自定义
- 无需修改生成代码即可改变显示

### 10.2 与权限系统的集成

**集成方式**:
- 低代码模块有独立的权限资源分类
- 3个主要分类: datasource, api_interface, lowcode_page
- 每个分类有4个操作权限: read, create, update, delete

**权限检查**:
- 路由级别: 使用中间件检查菜单权限
- API级别: 使用 `@CheckPermission` 装饰器
- 数据级别: 服务层进行权限验证

**权限分配**:
- 默认分配给超级管理员和管理员
- 其他用户需要手动授予
- 可细粒度控制到具体操作

### 10.3 与菜单系统的集成

**菜单结构**:
- 一级菜单: 低代码管理
- 二级菜单: 
  - 数据源管理
  - API接口管理
  - 页面管理

**菜单权限**:
- 菜单和权限双向绑定
- 用户只能看到有权限的菜单
- 菜单路由和权限代码对应

### 10.4 与日志系统的集成

**日志类型**:
- API调用日志: 每次调用都记录
- SQL执行日志: 记录SQL和执行时间
- 错误日志: 记录错误信息和堆栈

**日志查询**:
- 按API分类查询
- 支持时间范围筛选
- 支持用户和状态筛选

**日志分析**:
- 调用统计: 总调用数、错误数
- 性能分析: 平均响应时间、SQL耗时
- 趋势分析: 调用趋势、性能趋势

---

## 补充信息

### 未来可能的扩展点

1. **lowcode_pages 表**
   - 支持完全自定义页面设计
   - 支持版本控制和草稿管理
   - 支持页面发布和下线

2. **lowcode_components 表**
   - 自定义组件库
   - 组件版本管理
   - 组件权限控制

3. **高级功能**
   - 页面模板库
   - 组件拖拽设计器
   - 数据绑定和联动
   - 第三方API集成
   - 数据转换和处理

### 关键技术点

- **JSONB存储**: 灵活的数据结构，支持复杂配置
- **动态路由**: 支持用户自定义API路由
- **权限控制**: 细粒度的权限管理体系
- **日志记录**: 完整的审计日志
- **版本控制**: 支持配置版本管理

---

**报告生成时间**: 2025-11-24  
**详细程度**: 极其详细  
**文件覆盖范围**: 所有关联文件和功能
