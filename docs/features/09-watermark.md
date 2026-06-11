# 水印自定义服务 (Watermark Service)

## 功能概述

水印服务为系统内容（网页、报表、截图等）自动添加用户标识水印，支持全局配置和变量替换，防止敏感信息泄露。

## 核心特性

### 1. 全局单例配置

水印配置在全系统范围内唯一，所有用户看到的水印由统一配置动态渲染（用户标识部分）。

#### 配置字段

| 字段 | 类型 | 范围 | 说明 |
|------|------|------|------|
| `enabled` | boolean | - | 是否启用水印 |
| `font_family` | string | - | 字体（如 Arial, 微软雅黑） |
| `font_size` | number | 12~48 | 字体大小（px） |
| `font_weight` | enum | 300/400/700 | 字体粗细（Light/Normal/Bold） |
| `color` | string | #RRGGBB | 文字颜色（十六进制） |
| `opacity` | number | 0.05~0.5 | 透明度（0~1） |
| `rotation` | number | 0~360 | 旋转角度（度） |
| `spacing` | number | 50~300 | 水印间距（px） |
| `lines` | array | - | 水印文本行数组（支持变量） |

#### 获取和更新

| 接口 | 说明 |
|------|------|
| `GET /api/system/watermark` | 获取当前水印配置 |
| `PUT /api/system/watermark` | 更新配置 |

### 2. 变量替换

水印支持动态变量，在运行时根据当前登录用户替换。

#### 变量语法

```
{{user:fieldName}}
{{user:fieldName|mask:maskType:param}}
```

#### 支持的字段

| 字段 | 说明 | 示例 |
|------|------|------|
| `username` | 用户名 | john_doe |
| `realName` | 真实姓名 | 张三 |
| `email` | 邮箱地址 | john@example.com |
| `phone` | 手机号 | 13800138000 |
| `department` | 所属部门 | 技术部 |
| `role` | 角色名称 | 管理员 |

#### 脱敏模式

支持 6 种脱敏方式，在变量替换时应用：

| 模式 | 说明 | 示例 |
|------|------|------|
| `hide:N` | 保留前 N 位，其余 `*` | `hide:3` → john_doe 变为 joh****** |
| `mask_middle:N` | 保留前后 N 位，中间 `*` | `mask_middle:2` → john_doe 变为 jo****oe |
| `hide_last:N` | 隐藏末尾 N 位 | `hide_last:3` → john_doe 变为 john_d** |
| `hide_all` | 全部隐藏 | `hide_all` → john_doe 变为 *** |
| `keep_first` | 仅保留首字符 | `keep_first` → john_doe 变为 j****** |
| `hash` | SHA256 哈希后取前 6 位 | `hash` → john_doe 变为 a8f3c7 |

#### 配置示例

```json
{
  "enabled": true,
  "lines": [
    "账号: {{user:username|mask:hide:3}}",
    "部门: {{user:department}}",
    "姓名: {{user:realName|mask:mask_middle:2}}"
  ],
  "font_size": 14,
  "opacity": 0.15,
  "rotation": 45,
  "spacing": 150
}
```

**运行时渲染结果**（当前用户：张三，部门技术部，用户名 zhangsan）：

```
账号: zha***
部门: 技术部
姓名: 张***
```

### 3. 前端渲染

#### 技术方案

前端通过 SVG + CSS `background-repeat: repeat` 平铺水印到全屏：

```jsx
import Watermark from '@/components/common/watermark/watermark';

export default function App() {
  return (
    <Watermark>
      <div>页面内容</div>
    </Watermark>
  );
}
```

#### 样式特性

- **全屏覆盖**：固定定位（`position: fixed`），`z-index: 99999`
- **穿透不可交互**：`pointer-events: none`，不阻挡页面交互
- **暗黑模式适配**：自动根据系统主题调整水印颜色
- **内容安全**：水印文字无法被删除或修改

### 4. 接口文档

#### 获取已渲染水印

```bash
GET /api/system/watermark
```

返回当前用户个性化的水印配置（含变量替换后的 lines）：

```json
{
  "code": 0,
  "data": {
    "enabled": true,
    "lines": [
      "账号: zha***",
      "部门: 技术部",
      "姓名: 张***"
    ],
    "font_size": 14,
    "opacity": 0.15,
    "rotation": 45,
    "spacing": 150
  }
}
```

#### 管理员更新配置

```bash
PUT /api/system/watermark
Content-Type: application/json

{
  "enabled": true,
  "lines": ["账号: {{user:username|mask:hide:3}}"],
  "font_size": 16,
  "opacity": 0.2,
  "rotation": 45,
  "spacing": 150
}
```

## 使用场景

- **敏感数据保护**：在数据展示界面添加用户标识，防止私自分享截图
- **审计追溯**：水印包含用户信息，便于审计谁查看过数据
- **文档保护**：导出的 PDF、Excel 等文档自动添加水印
- **终端安全**：在高清屏上清晰展示用户标识，防止暗拍

## 安全建议

- **不依赖水印进行访问控制**：水印仅是视觉标记，真正的访问控制要靠后端权限
- **定期审查配置**：根据安全政策定期更新水印内容和显示规则
- **敏感场景启用**：仅在涉及敏感数据的场景启用水印
