# 业务页面目录 (biz)

此目录用于存放所有业务模块的前端页面。基于 Next.js App Router 文件路由，每个子目录对应一个路由。

## 目录结构

```
biz/
├── README.md              # 本文件
├── example/               # 示例业务模块（参考此目录创建业务页面）
│   ├── page.js            # 页面入口
│   └── components/        # 模块私有组件（可选）
└── your-module/           # 你的业务模块
    ├── page.js
    └── components/
```

## 组件放置原则

| 场景 | 位置 |
|------|------|
| 只在当前模块使用的组件 | `your-module/components/` |
| 多个业务模块共用的组件 | `frontend/components/common/` |

## 访问路径

页面路由：`/biz/your-module`
对应接口：`/api/biz/your-module`
