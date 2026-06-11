# 业务接口目录 (lib/api/biz)

此目录用于存放所有业务模块的接口封装文件。

## 目录结构

```
lib/api/biz/
├── README.md              # 本文件
├── example.api.js         # 示例接口文件（参考此文件创建业务接口）
└── your-module.api.js     # 你的业务模块接口
```

## 使用规范

- 每个业务模块对应一个 `xxx.api.js` 文件
- 文件命名与后端模块名保持一致
- 所有请求路径以 `/biz/` 开头，对应后端 `/api/biz/*`

## 示例

```js
import { exampleApi } from '@/lib/api/biz/example.api';

// 获取列表
const { data } = await exampleApi.getList({ page: 1, limit: 10 });

// 创建
await exampleApi.create({ name: 'test' });
```
