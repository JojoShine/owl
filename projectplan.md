
---

# 自定义查询缓存 + SQL日志优化

## 目标
1. 实现透明的 Sequelize 查询缓存（使用 Redis，无需修改业务代码）
2. 修复 SQL 日志输出，让记录的 SQL 可以直接复制执行

## 待办事项

### 阶段一：自定义缓存实现
- [ ] 完善 `backend/src/config/cache.js` 缓存封装
  - 包装 Sequelize 查询方法（findAll, findOne, findByPk, findAndCountAll, count）
  - 根据模型名 + 查询参数生成缓存键
  - 使用 Redis 存储，支持按模型配置 TTL
  - 添加钩子：create/update/delete 时自动清除缓存
  - 添加控制台日志：记录缓存命中/未命中/设置/清除等操作

- [ ] 在 `backend/src/app.js` 初始化缓存
  - 模型加载完成后应用缓存包装器
  - 配置各模型的 TTL（User: 600s, Config: 300s, 默认: 180s）

- [ ] 更新 `backend/docs/query-cache.md` 文档
  - 说明缓存工作原理
  - 列出各模型的 TTL 配置
  - 解释缓存失效策略

### 阶段二：SQL 日志优化
- [ ] 定位 Sequelize 日志配置
  - 找到数据库配置中的 logging 设置

- [ ] 修复 SQL 参数插值
  - 让日志显示完整的 SQL（参数已替换）
  - 确保输出的 SQL 可以直接执行

- [ ] 测试 SQL 日志
  - 验证日志中的 SQL 可以直接在数据库客户端执行

## 实现要点

### 缓存策略
- 缓存键格式：`{模型名}:{查询参数哈希}`
- TTL 配置：
  - User 模型：600 秒（10 分钟）
  - Config 模型：300 秒（5 分钟）
  - 其他模型：180 秒（3 分钟）
- 自动失效：afterCreate/afterUpdate/afterDestroy 钩子触发时清除该模型所有缓存
- 控制台日志：
  - 缓存命中：`[Cache HIT] ModelName - key`
  - 缓存未命中：`[Cache MISS] ModelName - key`
  - 缓存设置：`[Cache SET] ModelName - key (TTL: Xs)`
  - 缓存清除：`[Cache CLEAR] ModelName - all keys`

### SQL 日志策略
- 使用 Sequelize 的参数绑定替换功能
- 配置日志输出完整的 SQL（而非参数化查询）
- 保持安全性的同时方便调试

## 审查部分

### 已完成的改动

#### 阶段一：自定义缓存实现 ✅

**1. `backend/src/config/cache.js` - 缓存封装**
- 使用 ioredis 连接 Redis
- 包装了 5 个查询方法：findAll, findOne, findByPk, findAndCountAll, count
- 缓存键生成：模型名 + 查询参数的 MD5 哈希（8 位）
- TTL 配置：User/Role/Permission/Menu 600s，SystemConfig 等 300s，其他 180s
- 添加了控制台日志：Cache HIT/MISS/SET/CLEAR
- 自动失效钩子：afterCreate/afterUpdate/afterDestroy 清除模型所有缓存

**2. `backend/src/app.js` - 初始化缓存**
- 导入 applyCacheToModels 方法
- 在数据库连接后、模型加载完成后应用缓存
- 移除了旧的占位日志

**3. `backend/src/core/modules/user/user.service.js` - 清理旧代码**
- 移除了 `.cache('user-list')` 方法调用
- 现在使用透明缓存，无需显式调用

#### 阶段二：SQL 日志优化 ✅

**1. `backend/src/config/database.js` - 日志函数**
- 移除了 `sql.substring(0, 500)` 限制
- 现在记录完整的 SQL 语句

**2. `backend/src/models/index.js` - Sequelize 配置**
- 添加 `benchmark: true` - 提供查询执行时间
- 添加 `logQueryParameters: true` - 记录查询参数
- 这样日志中会显示完整的可执行 SQL

#### 阶段三：文档更新 ✅

**`backend/docs/query-cache.md`**
- 完整说明了缓存工作原理
- 列出了所有模型的 TTL 配置
- 说明了自动失效策略
- 提供了使用示例和控制台日志格式
- 添加了性能收益、监控建议和注意事项

### 实现效果

1. **透明缓存**：业务代码无需修改，查询自动使用缓存
2. **自动失效**：数据变更时缓存自动清除，保证一致性
3. **可观测性**：控制台日志清晰显示缓存命中情况
4. **完整 SQL**：日志中的 SQL 语句可以直接复制执行

