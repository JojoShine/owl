# 数据脱敏实现流程

## 概述

数据脱敏是一种数据安全防护措施，通过自动隐藏敏感字段的部分内容，防止敏感数据泄露。

在 Owl Platform 中，数据脱敏采用**响应拦截 + 中间件**的方案，在接口返回数据时自动脱敏，无需修改业务代码。

---

## 核心架构

### 工作流程

```
API 请求
   ↓
业务逻辑执行
   ↓
生成响应数据
   ↓
脱敏中间件拦截
   ↓
查询敏感字段配置 (从缓存或数据库)
   ↓
检测响应中是否包含敏感字段
   ↓
应用脱敏规则
   ↓
记录敏感数据访问日志
   ↓
返回脱敏后的数据
```

---

## 核心组件

### 1. 敏感字段配置表 (owl_sensitive_fields)

```sql
CREATE TABLE owl_sensitive_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,        -- 表名
  field_name VARCHAR(100) NOT NULL,        -- 字段名
  mask_type VARCHAR(50) NOT NULL,          -- 脱敏类型
  mask_rule JSONB,                         -- 自定义脱敏规则
  description TEXT,                        -- 字段描述
  is_active BOOLEAN DEFAULT true,          -- 是否启用脱敏
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(table_name, field_name)
);
```

### 2. 敏感数据访问日志表 (owl_sensitive_access_logs)

```sql
CREATE TABLE owl_sensitive_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES owl_users(id),
  table_name VARCHAR(100) NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  access_type VARCHAR(50),                 -- masked / unmasked / denied
  action VARCHAR(100),                     -- 操作类型
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(user_id, created_at),
  INDEX(table_name, field_name)
);
```

---

## 实现流程

### 1. 定义脱敏规则

```javascript
// src/utils/mask.util.js

const MASK_TYPES = {
  phone: (value) => {
    // 手机号：138****5678
    if (!value) return value;
    return value.slice(0, 3) + '****' + value.slice(-4);
  },

  email: (value) => {
    // 邮箱：a***@example.com
    if (!value) return value;
    const [local, domain] = value.split('@');
    return local.charAt(0) + '***@' + domain;
  },

  id_card: (value) => {
    // 身份证：110***********1234
    if (!value || value.length < 8) return value;
    return value.slice(0, 3) + '*'.repeat(11) + value.slice(-4);
  },

  bank_card: (value) => {
    // 银行卡：**** **** **** 1234
    if (!value) return value;
    return '*'.repeat(value.length - 4) + value.slice(-4);
  },

  name: (value) => {
    // 姓名：张*（保留首字）
    if (!value || value.length < 2) return value;
    return value.charAt(0) + '*'.repeat(value.length - 1);
  },

  address: (value) => {
    // 地址：北京市******
    if (!value || value.length < 5) return value;
    return value.slice(0, 4) + '*'.repeat(value.length - 4);
  },

  custom: (value, rule) => {
    // 自定义规则：根据配置脱敏
    const { prefix_length = 0, suffix_length = 0, mask_char = '*' } = rule;
    if (!value) return value;
    const prefix = value.slice(0, prefix_length);
    const suffix = value.slice(-suffix_length);
    const masked = mask_char.repeat(Math.max(0, value.length - prefix_length - suffix_length));
    return prefix + masked + suffix;
  }
};

export function maskValue(value, maskType, customRule) {
  const maskFn = MASK_TYPES[maskType] || MASK_TYPES.custom;
  return maskFn(value, customRule);
}
```

### 2. 加载敏感字段配置

```javascript
// src/services/sensitive-field.service.js

class SensitiveFieldService {
  constructor() {
    this.cache = new Map(); // 内存缓存（也可使用 Redis）
    this.cacheTTL = 3600 * 1000; // 1小时过期
  }

  // 获取表的所有敏感字段配置
  async getSensitiveFields(tableName) {
    // 1. 先查缓存
    const cacheKey = `sensitive_fields:${tableName}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    // 2. 查询数据库
    const fields = await SensitiveField.findAll({
      where: {
        table_name: tableName,
        is_active: true
      }
    });

    // 3. 存入缓存
    this.cache.set(cacheKey, {
      data: fields,
      expiry: Date.now() + this.cacheTTL
    });

    return fields;
  }

  // 清除缓存
  clearCache(tableName) {
    this.cache.delete(`sensitive_fields:${tableName}`);
  }
}

export const sensitiveFieldService = new SensitiveFieldService();
```

### 3. 实现脱敏中间件

```javascript
// src/middlewares/dataMasking.middleware.js

import { maskValue } from '../utils/mask.util.js';
import { sensitiveFieldService } from '../services/sensitive-field.service.js';
import { logger } from '../config/logger.js';

export function dataMaskingMiddleware() {
  return async (req, res, next) => {
    // 保存原始的 res.json 方法
    const originalJson = res.json.bind(res);

    // 重写 res.json 方法
    res.json = function(data) {
      // 异步处理脱敏（不阻塞响应）
      setImmediate(() => {
        maskResponseData(data, req.user?.id, req.ip)
          .catch(err => logger.error('脱敏处理异常:', err));
      });

      // 立即返回脱敏后的数据
      return originalJson.call(this, data);
    };

    next();
  };
}

// 脱敏响应数据
async function maskResponseData(data, userId, ipAddress) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // 处理数组
  if (Array.isArray(data.data)) {
    const tableName = extractTableName(data);
    if (!tableName) return;

    // 获取该表的敏感字段配置
    const sensitiveFields = await sensitiveFieldService.getSensitiveFields(tableName);
    if (sensitiveFields.length === 0) return;

    // 为每条记录脱敏
    for (const record of data.data) {
      if (typeof record === 'object') {
        maskRecord(record, sensitiveFields);
        // 记录访问日志
        logSensitiveAccess(userId, tableName, sensitiveFields, ipAddress);
      }
    }
  }

  return data;
}

// 脱敏单条记录
function maskRecord(record, sensitiveFields) {
  for (const field of sensitiveFields) {
    if (field.field_name in record) {
      const value = record[field.field_name];
      if (value !== null && value !== undefined) {
        record[field.field_name] = maskValue(value, field.mask_type, field.mask_rule);
      }
    }
  }
}

// 提取表名（从路径推断）
function extractTableName(data) {
  // 假设表名为 owl_{resource}
  // 可根据实际需求优化
  return null; // 实际应根据上下文获取
}

// 记录敏感数据访问
async function logSensitiveAccess(userId, tableName, sensitiveFields, ipAddress) {
  for (const field of sensitiveFields) {
    await SensitiveAccessLog.create({
      user_id: userId,
      table_name: tableName,
      field_name: field.field_name,
      access_type: 'masked',
      action: 'view_masked_data',
      ip_address: ipAddress
    });
  }
}
```

### 4. 在路由中应用

```javascript
// src/core/modules/system/user.routes.js

import express from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { dataMaskingMiddleware } from '../../middlewares/dataMasking.js';
import * as userController from './user.controller.js';

const router = express.Router();

// 应用脱敏中间件
router.use(dataMaskingMiddleware());

// 获取用户列表（会自动脱敏）
router.get('/', authMiddleware, userController.getList);

// 获取用户详情（会自动脱敏）
router.get('/:id', authMiddleware, userController.getById);

// 创建用户（不需要脱敏）
router.post('/', authMiddleware, userController.create);

export default router;
```

---

## 脱敏类型说明

| 类型 | 输入示例 | 输出示例 | 应用场景 |
|------|---------|---------|--------|
| phone | 13812345678 | 138****5678 | 手机号 |
| email | test@example.com | t***@example.com | 邮箱地址 |
| id_card | 110101199001011234 | 110***********1234 | 身份证号 |
| bank_card | 6222021234567890123 | **** **** **** 0123 | 银行卡号 |
| name | 张三 | 张* | 姓名 |
| address | 北京市朝阳区xxx路1号 | 北京市朝****** | 地址 |
| custom | （根据规则） | （根据规则） | 自定义脱敏 |

---

## 初始化配置

### 添加敏感字段配置

```sql
-- 用户表的敏感字段
INSERT INTO owl_sensitive_fields (table_name, field_name, mask_type, description, is_active) VALUES
('owl_users', 'phone', 'phone', '用户手机号', true),
('owl_users', 'email', 'email', '用户邮箱', true),
('owl_users', 'id_card', 'id_card', '用户身份证', true);

-- 员工表的敏感字段
INSERT INTO owl_sensitive_fields (table_name, field_name, mask_type, description, is_active) VALUES
('owl_employees', 'phone', 'phone', '员工手机号', true),
('owl_employees', 'bank_card', 'bank_card', '员工银行卡', true),
('owl_employees', 'salary', 'custom', '员工薪资',
  '{"prefix_length": 1, "suffix_length": 0, "mask_char": "*"}', true);
```

---

## 性能优化

### 缓存策略

```javascript
// 使用 Redis 缓存
import redis from 'redis';

class SensitiveFieldService {
  constructor() {
    this.redisClient = redis.createClient();
  }

  async getSensitiveFields(tableName) {
    const cacheKey = `sensitive_fields:${tableName}`;

    // 1. 尝试从 Redis 获取
    const cached = await this.redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. 查询数据库
    const fields = await SensitiveField.findAll({
      where: { table_name: tableName, is_active: true }
    });

    // 3. 存入 Redis（TTL: 1小时）
    await this.redisClient.setEx(cacheKey, 3600, JSON.stringify(fields));

    return fields;
  }

  // 配置变更时清除缓存
  async clearCache(tableName) {
    const cacheKey = `sensitive_fields:${tableName}`;
    await this.redisClient.del(cacheKey);
  }
}
```

---

## 常见问题

### Q1: 脱敏是否会影响性能？

脱敏在响应拦截时异步进行，不阻塞 API 返回。配合缓存使用，性能影响基本可忽略。

### Q2: 如何为新表添加敏感字段？

在 `owl_sensitive_fields` 表中插入新记录即可，无需修改代码。缓存会自动过期。

### Q3: 某个用户需要看未脱敏数据怎么办？

在脱敏中间件中加入权限检查：

```javascript
// 管理员可以看到原始数据
if (req.user.role === 'admin') {
  return data; // 跳过脱敏
}
```

### Q4: 脱敏规则可以自定义吗？

支持。在 `owl_sensitive_fields` 中使用 `mask_type = 'custom'` 和 `mask_rule` JSON 配置自定义规则。

---

## 最佳实践

1. **权限分离** - 只有高权限用户才能看到完整数据
2. **审计日志** - 记录所有敏感数据访问
3. **定期审查** - 定期检查脱敏配置是否符合业务需求
4. **性能监控** - 监控脱敏处理的性能开销
5. **测试覆盖** - 为各种脱敏规则编写单元测试
