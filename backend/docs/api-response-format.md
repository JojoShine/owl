# API响应格式规范

## 统一响应格式

所有API响应都遵循统一的格式，确保前后端交互的一致性。

### 成功响应格式

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // 响应数据
  },
  "timestamp": "2025-10-14T08:00:00.000Z"
}
```

### 失败响应格式

```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    // 可选的详细错误信息
  },
  "timestamp": "2025-10-14T08:00:00.000Z"
}
```

### 分页响应格式

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      // 数据列表
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 10,
      "totalPages": 10
    }
  },
  "timestamp": "2025-10-14T08:00:00.000Z"
}
```

## 使用方法

### 在控制器中使用

```javascript
const { success, error, paginated, created } = require('../utils/response');
const ApiError = require('../utils/ApiError');

// 成功响应
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      throw ApiError.notFound('用户不存在');
    }
    return success(res, user, '获取用户成功');
  } catch (err) {
    next(err);
  }
};

// 创建响应
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    return created(res, user, '用户创建成功');
  } catch (err) {
    next(err);
  }
};

// 分页响应
exports.getUsers = async (req, res, next) => {
  try {
    // Service层返回格式
    const result = await userService.getUsers(req.query);
    // result = {
    //   data: [...],
    //   pagination: { total, page, pageSize, totalPages }
    // }
    return paginated(res, result.data, result.pagination, '获取用户列表成功');
  } catch (err) {
    next(err);
  }
};
```

### 抛出错误

```javascript
const ApiError = require('../utils/ApiError');

// 抛出404错误
throw ApiError.notFound('资源不存在');

// 抛出401错误
throw ApiError.unauthorized('未授权');

// 抛出403错误
throw ApiError.forbidden('禁止访问');

// 抛出422验证错误
throw ApiError.validationError('验证失败', {
  email: '邮箱格式不正确',
  password: '密码长度不能少于6位'
});

// 抛出自定义错误
throw new ApiError(400, '自定义错误消息');
```

## HTTP状态码对照

| 状态码 | 说明 | 方法 |
|--------|------|------|
| 200 | 成功 | `success()` |
| 201 | 创建成功 | `created()` |
| 204 | 无内容 | `noContent()` |
| 400 | 请求错误 | `error()` / `ApiError.badRequest()` |
| 401 | 未授权 | `unauthorized()` / `ApiError.unauthorized()` |
| 403 | 禁止访问 | `forbidden()` / `ApiError.forbidden()` |
| 404 | 未找到 | `notFound()` / `ApiError.notFound()` |
| 409 | 冲突 | `conflict()` / `ApiError.conflict()` |
| 422 | 验证错误 | `validationError()` / `ApiError.validationError()` |
| 429 | 请求过多 | `tooManyRequests()` / `ApiError.tooManyRequests()` |
| 500 | 服务器错误 | `serverError()` / `ApiError.internal()` |

## 响应工具方法

### success(res, data, message, statusCode)
标准成功响应

### error(res, message, statusCode, errors)
标准错误响应

### paginated(res, items, pagination, message)
分页响应

参数：
- `res`: Express响应对象
- `items`: 数据列表数组
- `pagination`: 分页信息对象 `{ total, page, pageSize, totalPages }`
- `message`: 响应消息（可选）

### created(res, data, message)
创建成功响应（201）

### noContent(res)
无内容响应（204）

### notFound(res, message)
未找到响应（404）

### unauthorized(res, message)
未授权响应（401）

### forbidden(res, message)
禁止访问响应（403）

### validationError(res, errors, message)
验证错误响应（422）

### serverError(res, message)
服务器错误响应（500）

### conflict(res, message)
冲突响应（409）

### tooManyRequests(res, message)
请求过多响应（429）

## 最佳实践

1. **始终使用响应工具**：不要直接使用 `res.json()`，使用提供的响应工具方法
2. **统一错误处理**：使用 `ApiError` 类抛出错误，让中间件统一处理
3. **提供清晰的消息**：message字段应该清晰地描述操作结果
4. **分页参数标准化**：
   - 请求参数使用 `page` 和 `limit`（或 `pageSize`）
   - 响应中pagination对象统一使用 `pageSize` 字段
   - Service层返回的pagination对象必须包含：`{ total, page, pageSize, totalPages }`
5. **时间戳格式**：使用ISO 8601格式（自动生成）
6. **Service层分页格式**：
   ```javascript
   // Service层统一返回格式
   return {
     data: rows,
     pagination: {
       total: count,
       page: parseInt(page),
       pageSize: parseInt(limit),  // 注意：使用pageSize而不是limit
       totalPages: Math.ceil(count / limit),
     },
   };
   ```