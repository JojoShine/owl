# 接口开发平台 (API Builder)

## 功能概述

API Builder 是一个无需编写代码即可快速构建 HTTP 接口的平台。通过在界面上配置 SQL 查询语句，系统自动将其包装为标准 REST 接口，并支持参数绑定、访问鉴权和流量控制。

适用场景：
- 快速向前端或第三方暴露数据查询能力
- 临时数据接口，无需走完整开发流程
- 对接外部系统时提供标准化数据出口

## 核心能力

### SQL 驱动的接口定义

每个接口的核心是一条 SQL 语句，支持 SELECT / INSERT / UPDATE / DELETE。参数使用 `:paramName` 占位符语法：

```sql
SELECT * FROM owl_users WHERE department_id = :deptId AND status = :status
```

系统执行时自动绑定参数并转义，防止 SQL 注入。

### 参数定义

每个 SQL 参数需在接口配置中声明：

| 字段 | 说明 |
|------|------|
| `name` | 参数名，对应 SQL 中的 `:paramName` |
| `type` | 类型：`string` / `number` / `boolean` / `date` |
| `required` | 是否必填 |
| `description` | 参数描述（文档用途） |

### SQL 安全校验

保存接口时系统会对 SQL 进行安全检查，以下操作被禁止：

- `DROP TABLE` / `DROP DATABASE`
- `TRUNCATE TABLE`
- `ALTER TABLE`
- `CREATE TABLE` / `CREATE DATABASE` / `CREATE VIEW`
- `GRANT` / `REVOKE`
- 多语句注入（如 `; DROP TABLE`）

允许的操作：SELECT、INSERT、UPDATE、DELETE（含条件）。

## API 密钥管理

接口创建后，通过 API 密钥控制访问权限。每个密钥有效期 **180 天**，过期后状态自动变为 `inactive`。

密钥由两个字段组成：

| 字段 | 说明 |
|------|------|
| `app_id` | 密钥记录的数据库 ID，用于标识调用方 |
| `app_key` | 密钥的 `api_key` 字段值，调用时传入 |

## 两种鉴权方式

系统支持两种调用方式，可根据场景灵活选择。

### 方式一：换取 JWT Token（推荐用于多次调用）

适合需要调用多个接口、或接口要求用户身份的场景。

**第一步：用 app_id + app_key 换取 JWT Token**

```bash
curl -X POST http://localhost:3001/api/system/auth/api-token \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "your-app-id",
    "app_key": "your-app-key"
  }'
```

响应：

```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": 1, "username": "app_user" }
  }
}
```

**第二步：用 Token 调用接口**

```bash
curl -X GET 'http://localhost:3001/api/custom/user-list?deptId=1' \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Token 有效期为用户配置，过期后需重新申请。

### 方式二：直接携带 API Key（轻量单次调用）

适合调用单个 custom 接口的轻量场景，无需换 token。支持三种传递方式：

```bash
# 1. Authorization Header（推荐）
curl -X GET 'http://localhost:3001/api/custom/user-list?deptId=1' \
  -H "Authorization: Bearer <api_key>"

# 2. X-API-Key Header
curl -X GET 'http://localhost:3001/api/custom/user-list?deptId=1' \
  -H "X-API-Key: <api_key>"

# 3. Query 参数
curl -X GET 'http://localhost:3001/api/custom/user-list?deptId=1&api_key=<api_key>'
```

## 接口配置说明

| 字段 | 说明 |
|------|------|
| `name` | 接口名称（展示用） |
| `endpoint` | 接口路径后缀（唯一标识符） |
| `method` | HTTP 方法：GET / POST / PUT / DELETE |
| `sql_query` | SQL 语句 |
| `parameters` | 参数定义数组 |
| `require_auth` | 是否需要鉴权（默认开启） |
| `rate_limit` | 每分钟最大请求次数（默认 1000） |

## 管理接口

| 接口 | 说明 |
|------|------|
| `GET /api/system/api-interfaces` | 接口列表 |
| `POST /api/system/api-interfaces` | 创建接口 |
| `PUT /api/system/api-interfaces/:id` | 更新接口 |
| `DELETE /api/system/api-interfaces/:id` | 删除接口 |
| `GET /api/system/api-interfaces/:id/keys` | 获取接口密钥列表 |
| `POST /api/system/api-interfaces/:id/keys` | 创建密钥 |
| `DELETE /api/system/api-interfaces/keys/:id` | 删除密钥 |
| `POST /api/system/api-interfaces/test/:id` | 测试 SQL 执行 |

## 接口文档生成

在管理界面可点击「下载接口文档」按钮，系统会动态生成包含所有接口定义的 markdown 文件，下载至本地供参考。文档不需要静态留存。

## 注意事项

- 接口 SQL 在后端执行，直接操作数据库，**请谨慎授权**
- `require_auth: false` 的接口对外完全公开，仅在确认无敏感数据时使用
- UPDATE / DELETE 类接口建议必须带 WHERE 条件
- 使用 Token 换取方式时，接口会以密钥创建者的身份执行，具备该用户的完整权限
