# 第三方对接安全 (Third-party Integration)

## 功能概述

第三方密钥管理模块为外部系统接入提供标准化的凭证体系，基于 `api_key` + `api_secret` 签名机制保障对接安全性。

### 与 API Builder 密钥的区别

| 维度 | 第三方密钥 | API Builder 密钥 |
|------|----------|-----------------|
| 作用域 | 系统级凭证，代表一个外部系统/合作方 | 接口级凭证，绑定特定 API 接口 |
| 用途 | 外部系统对接认证 | 调用平台提供的 API 接口 |
| 权限 | 根据业务接口定义 | 受限于绑定的接口权限 |

## 密钥结构

| 字段 | 格式 | 说明 |
|------|------|------|
| `api_key` | `key_{timestamp}_{8位hex}` | 公开标识符，用于标识调用方 |
| `api_secret` | 32位随机十六进制 | 私密签名密钥，创建和重新生成时返回完整值 |
| `client_name` | 字符串 | 第三方系统名称（如"微信回调"、"ERP系统"） |
| `status` | `active` / `inactive` | 密钥状态，支持随时启禁 |

**安全提示**：`api_secret` 在管理界面平时脱敏显示（前4位`****`后4位），完整值仅在以下时刻返回：
- 密钥创建时
- 手动重新生成时

请妥善保存这两次返回的完整值。

## 密钥生命周期

```
创建密钥 → 系统生成 key + secret（完整值返回一次）
    ↓
正常使用（脱敏展示 secret）
    ↓
    ├─ 禁用密钥 → status: inactive（可随时重新启用）
    ├─ 重新生成 secret → 旧 secret 立即失效，新 secret 返回一次
    └─ 删除密钥 → 不可恢复
```

## 签名机制（推荐）

第三方系统调用时，推荐使用 HMAC-SHA256 签名方案，确保请求不被篡改：

```
签名内容 = method + "\n" + path + "\n" + timestamp + "\n" + body_hash
签名 = HMAC-SHA256(api_secret, 签名内容)
```

其中：
- `method` — HTTP 方法，大写（GET / POST / PUT / DELETE）
- `path` — 请求路径（不含 query 参数）
- `timestamp` — Unix 时间戳（建议精确到秒）
- `body_hash` — 请求体的 SHA256 哈希值（GET 请求可为空）

### 请求头约定

```
X-Api-Key: <api_key>
X-Timestamp: <unix_timestamp>
X-Signature: <hmac_sha256_signature>
```

### 签名示例（Python）

```python
import hashlib
import hmac
import time
from urllib.parse import urlencode

def sign_request(method, path, body, api_secret):
    timestamp = str(int(time.time()))
    body_hash = hashlib.sha256(body.encode() if body else b'').hexdigest()
    
    sign_content = f"{method}\n{path}\n{timestamp}\n{body_hash}"
    signature = hmac.new(
        api_secret.encode(),
        sign_content.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return {
        'X-Api-Key': api_key,
        'X-Timestamp': timestamp,
        'X-Signature': signature
    }
```

## 管理接口

| 接口 | 说明 |
|------|------|
| `GET /api/system/third-party-keys` | 分页查询密钥列表（secret 脱敏） |
| `POST /api/system/third-party-keys` | 创建密钥（返回完整 secret） |
| `PUT /api/system/third-party-keys/:id` | 更新客户端名称/描述 |
| `PATCH /api/system/third-party-keys/:id/status` | 启用或禁用密钥 |
| `POST /api/system/third-party-keys/:id/regenerate` | 重新生成 secret（返回完整新值） |
| `DELETE /api/system/third-party-keys/:id` | 删除密钥 |

## 对接流程

1. 在管理后台「第三方密钥」页面创建凭证，系统生成 `api_key` 和 `api_secret`
2. 记录 `api_key` 和 `api_secret`，将凭证提供给对接方
3. 告知对接方签名规范和请求头格式
4. 对接方在每次请求中附带签名头
5. 后端中间件验证签名有效性后放行请求
6. 如凭证泄漏，立即在管理后台重新生成 `api_secret`

## 安全建议

- **定期轮换**：定期重新生成 `api_secret`，尤其是与高权限接口关联的密钥
- **及时清理**：对不再对接的系统及时删除密钥，避免积压
- **时间戳验证**：后端中间件应验证请求的时间戳，设置 5~10 分钟的有效期窗口，防止重放攻击
- **HTTPS 强制**：所有包含密钥的请求必须走 HTTPS，禁止 HTTP
- **日志记录**：记录所有密钥的创建、使用、重新生成、删除操作，便于审计
