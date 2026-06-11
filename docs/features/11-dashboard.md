# 看板服务 (Dashboard)

## 功能概述

看板服务提供统计、聚合、展示系统关键指标的能力，支持多种图表类型和数据源。通过看板 Widget 机制，用户可自定义看板内容。

## 核心指标

### 1. 指标卡（Metrics）

系统高层概览数据，显示为卡片形式：

| 指标 | 说明 | 数据源 |
|------|------|--------|
| 活跃用户数 | 当前在线用户数 | 会话表 |
| 总用户数 | 系统注册用户总数 | 用户表 |
| 近 7 天登录数 | 过去 7 天的登录人次 | 登录日志 |
| 系统运行天数 | 从系统初始化到现在的天数 | 系统配置 |
| 磁盘使用率 | 当前文件存储占用比例 | MinIO + 配置 |

### 2. 折线图（Line Chart）

#### 近 7 天登录趋势

```
用户登录数
    ↑
  100│     ●───●
    │    /     \
   50│   ●       ●─●
    │  /           
    │ ●             ●
    └──────────────────→ 日期
```

展示过去 7 天每天的登录人数。

### 3. 区域图（Area Chart）

#### 近 12 小时在线用户数

```
在线用户数
      ╱╲    ╱╲
    ╱    ╲╱    ╲╱╲
  ────────────────── → 时间
```

展示过去 12 小时内在线用户数的变化趋势。

### 4. 饼图（Pie Chart）

#### 系统概览

- 活跃用户分布
- 角色分布
- 权限分布
- 离线用户占比

### 5. 柱状图（Bar Chart）

#### 存储概览

按文件类别展示存储占用情况：

```
GB
  │
2.0│ ████
  │ ████ ████ ████
1.0│ ████ ████ ████ ████
  │ ████ ████ ████ ████
0.0├─────────────────────
   文档 图片 视频 其他 可用
```

- 文档（Document）
- 图片（Image）
- 视频（Video）
- 其他（Others）
- 可用空间（Available）

存储总量硬编码为 500 GB。

### 6. 最近操作统计（Recent Operations）

按操作类型展示统计：

| 操作类型 | 说明 |
|---------|------|
| login | 登录 |
| upload | 上传 |
| download | 下载 |
| export | 导出 |
| import | 导入 |
| delete | 删除 |

**注**：当前实现使用随机数据作为占位，待后期对接实际操作日志。

### 7. 访问趋势（Access Trend）

展示过去 7 天系统访问量趋势。

## 看板 Widget 机制

用户可自定义看板内容，选择要显示的 Widget。

#### Widget 配置

| 字段 | 说明 |
|------|------|
| `id` | Widget 唯一标识 |
| `name` | Widget 名称 |
| `type` | 图表类型：`metrics`/`line`/`area`/`pie`/`bar` |
| `dataSource` | 数据来源 |
| `enabled` | 是否显示 |
| `position` | 看板上的位置（行列） |

#### 接口

| 接口 | 说明 |
|------|------|
| `GET /api/dashboard` | 获取完整看板数据 |
| `GET /api/dashboard-widgets` | Widget 列表 |
| `PUT /api/dashboard-widgets/:id` | 更新 Widget 配置 |

## SQL 自定义

看板支持 SQL 自定义，允许用户通过配置 SQL 来定制图表数据源。

### 自定义 Widget

在 Widget 管理界面可创建自定义 Widget，指定：

- Widget 名称
- 查询 SQL（SELECT 语句）
- 图表类型
- 数据映射（X 轴、Y 轴字段）

### 示例

```sql
-- 自定义：每个部门的员工数
SELECT department_name, COUNT(*) as count 
FROM owl_users 
GROUP BY department_name
```

对应的图表配置：

```json
{
  "name": "部门员工统计",
  "type": "bar",
  "sql": "SELECT department_name, COUNT(*) as count FROM owl_users GROUP BY department_name",
  "dataMapping": {
    "xAxis": "department_name",
    "yAxis": "count"
  }
}
```

## 接口总览

| 接口 | 说明 |
|------|------|
| `GET /api/dashboard` | 获取看板首页所有数据 |
| `GET /api/dashboard/metrics` | 获取指标卡数据 |
| `GET /api/dashboard/login-trend` | 获取 7 天登录趋势 |
| `GET /api/dashboard/online-trend` | 获取 12 小时在线用户趋势 |
| `GET /api/dashboard/system-overview` | 获取系统概览（角色/权限/用户分布） |
| `GET /api/dashboard/storage` | 获取存储统计 |
| `GET /api/dashboard/operations` | 获取操作统计 |
| `GET /api/dashboard/access-trend` | 获取访问趋势 |
| `GET /api/dashboard-widgets` | Widget 列表 |
| `PUT /api/dashboard-widgets/:id` | 更新 Widget 配置 |

## 使用建议

- **权限控制**：只有特定角色可查看某些敏感数据（如用户数、存储使用）
- **缓存优化**：看板数据计算较重，建议引入缓存，定期更新
- **自定义合理**：SQL 自定义时需谨慎，避免执行复杂的 JOIN 或全表扫描影响性能
- **数据准确性**：定期对账看板数据是否准确反映实际系统状态
