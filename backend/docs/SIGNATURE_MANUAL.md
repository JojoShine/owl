# 签名生成指南

## 📋 概述

本文档说明如何生成HMAC-SHA256签名，用于调用一卡通平台API。

---

## 🔑 密钥信息

平台为每个接入方分配两个参数：

| 参数 | 说明 |
|-----|------|
| `api_key` | 唯一标识接入方（公开） |
| `api_secret` | 签名密钥（保密） |

---

## ✍️ 签名生成步骤

### 1️⃣ 参数准备
排除 `sign` 字段，按字段名**ASCII升序**排序

### 2️⃣ 参数递归平铺
将所有参数（包括嵌套对象和数组）递归展平为 `key=value` 格式

**平铺规则：**
- **简单值** - 直接拼接：`key=value`
- **对象** - 使用点号连接：`card.no=123&card.type=1`
- **数组** - 使用索引格式：`facilities[0]=WiFi&facilities[1]=空调`
- **数组中的对象** - 组合使用：`items[0].name=商品A&items[0].price=100`
- **多层嵌套** - 递归应用上述规则
- **空值** - 不包含在签名中（null 或 undefined）

### 3️⃣ 字符串拼接
将平铺后的所有键值对按**ASCII升序**排序，用 `&` 连接
格式：`key1=value1&key2=value2&...`

### 4️⃣ 生成签名
使用 `api_secret` 作为密钥，对拼接字符串进行 HMAC-SHA256 哈希

### 5️⃣ 转换格式
将哈希结果转换为十六进制字符串

---

## 💻 代码示例

### Node.js / JavaScript

```javascript
const crypto = require('crypto');

function generateSignature(params, apiSecret) {
  // 递归函数：将嵌套对象展平为签名字符串
  function flattenToSignString(obj, prefix = '') {
    const parts = [];

    if (Array.isArray(obj)) {
      // 数组处理：使用 [index] 格式
      obj.forEach((item, index) => {
        const itemPrefix = prefix ? `${prefix}[${index}]` : `[${index}]`;
        parts.push(...flattenToSignString(item, itemPrefix));
      });
    } else if (typeof obj === 'object' && obj !== null) {
      // 对象处理：使用点号连接
      Object.keys(obj)
        .filter(k => obj[k] !== null && obj[k] !== undefined)
        .sort()
        .forEach(key => {
          const newPrefix = prefix ? `${prefix}.${key}` : key;
          if (Array.isArray(obj[key])) {
            parts.push(...flattenToSignString(obj[key], newPrefix));
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            parts.push(...flattenToSignString(obj[key], newPrefix));
          } else {
            parts.push(`${newPrefix}=${obj[key]}`);
          }
        });
    } else {
      // 原始值
      if (prefix) {
        parts.push(`${prefix}=${obj}`);
      }
    }

    return parts;
  }

  // 1. 参数排序（除sign外）
  const sortedKeys = Object.keys(params)
    .filter(key => key !== 'sign' && params[key] !== null && params[key] !== undefined)
    .sort();

  // 2. 递归平铺所有参数
  const allParts = [];
  sortedKeys.forEach(key => {
    const value = params[key];
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      allParts.push(...flattenToSignString(value, key));
    } else {
      allParts.push(`${key}=${value}`);
    }
  });

  // 3. 拼接字符串
  const signStr = allParts.join('&');

  // 4. 计算 HMAC-SHA256
  const sign = crypto
    .createHmac('sha256', apiSecret)
    .update(signStr)
    .digest('hex');

  return sign;
}

// 使用示例
const params = {
  api_key: 'your_api_key_here',
  timestamp: Date.now(),
  canteenCode: 'CANTEEN_001',
  facilities: ['WiFi', '空调'],
  card: {
    no: '123456',
    type: '1'
  }
};

const apiSecret = 'your_api_secret_here';
const sign = generateSignature(params, apiSecret);
params.sign = sign;

console.log('签名:', sign);
// 签名字符串示例：
// api_key=your_api_key_here&canteenCode=CANTEEN_001&card.no=123456&card.type=1&facilities[0]=WiFi&facilities[1]=空调&timestamp=1706000000000
```

### Python

```python
import hmac
import hashlib

def generate_signature(params, api_secret):
    # 递归函数：将嵌套对象展平为签名字符串
    def flatten_to_sign_string(obj, prefix=''):
        parts = []

        if isinstance(obj, list):
            # 数组处理：使用 [index] 格式
            for index, item in enumerate(obj):
                item_prefix = f"{prefix}[{index}]" if prefix else f"[{index}]"
                parts.extend(flatten_to_sign_string(item, item_prefix))
        elif isinstance(obj, dict):
            # 对象处理：使用点号连接
            for key in sorted(obj.keys()):
                if obj[key] is not None:
                    new_prefix = f"{prefix}.{key}" if prefix else key
                    if isinstance(obj[key], (list, dict)):
                        parts.extend(flatten_to_sign_string(obj[key], new_prefix))
                    else:
                        parts.append(f"{new_prefix}={obj[key]}")
        else:
            # 原始值
            if prefix:
                parts.append(f"{prefix}={obj}")

        return parts

    # 1. 参数排序（除sign外）
    sorted_keys = sorted([k for k in params.keys() if k != 'sign' and params[k] is not None])

    # 2. 递归平铺所有参数
    all_parts = []
    for key in sorted_keys:
        value = params[key]
        if isinstance(value, (list, dict)):
            all_parts.extend(flatten_to_sign_string(value, key))
        else:
            all_parts.append(f"{key}={value}")

    # 3. 拼接字符串
    sign_str = '&'.join(all_parts)

    # 4. 计算 HMAC-SHA256
    signature = hmac.new(
        api_secret.encode(),
        sign_str.encode(),
        hashlib.sha256
    ).hexdigest()

    return signature

# 使用示例
params = {
    'api_key': 'your_api_key_here',
    'timestamp': 1706000000000,
    'canteenCode': 'CANTEEN_001',
    'facilities': ['WiFi', '空调'],
    'card': {
        'no': '123456',
        'type': '1'
    }
}

api_secret = 'your_api_secret_here'
sign = generate_signature(params, api_secret)
params['sign'] = sign

print('签名:', sign)
# 签名字符串示例：
# api_key=your_api_key_here&canteenCode=CANTEEN_001&card.no=123456&card.type=1&facilities[0]=WiFi&facilities[1]=空调&timestamp=1706000000000
```

### Java

```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.*;

public class SignatureUtil {
    public static String generateSignature(Map<String, Object> params, String apiSecret)
            throws Exception {
        // 递归函数：将嵌套对象展平为签名字符串
        List<String> flattenToSignString(Object obj, String prefix) {
            List<String> parts = new ArrayList<>();

            if (obj instanceof List) {
                // 数组处理：使用 [index] 格式
                List<?> list = (List<?>) obj;
                for (int i = 0; i < list.size(); i++) {
                    String itemPrefix = prefix.isEmpty() ? "[" + i + "]" : prefix + "[" + i + "]";
                    parts.addAll(flattenToSignString(list.get(i), itemPrefix));
                }
            } else if (obj instanceof Map) {
                // 对象处理：使用点号连接
                Map<?, ?> map = (Map<?, ?>) obj;
                List<String> keys = new ArrayList<>(map.keySet().stream()
                    .map(Object::toString)
                    .toList());
                Collections.sort(keys);

                for (String key : keys) {
                    Object value = map.get(key);
                    if (value != null) {
                        String newPrefix = prefix.isEmpty() ? key : prefix + "." + key;
                        if (value instanceof List || value instanceof Map) {
                            parts.addAll(flattenToSignString(value, newPrefix));
                        } else {
                            parts.add(newPrefix + "=" + value);
                        }
                    }
                }
            } else {
                // 原始值
                if (!prefix.isEmpty()) {
                    parts.add(prefix + "=" + obj);
                }
            }

            return parts;
        }

        // 1. 参数排序（除sign外）
        List<String> keys = new ArrayList<>(params.keySet());
        keys.remove("sign");
        keys.removeIf(k -> params.get(k) == null);
        Collections.sort(keys);

        // 2. 递归平铺所有参数
        List<String> allParts = new ArrayList<>();
        for (String key : keys) {
            Object value = params.get(key);
            if (value instanceof List || value instanceof Map) {
                allParts.addAll(flattenToSignString(value, key));
            } else {
                allParts.add(key + "=" + value);
            }
        }

        // 3. 拼接字符串
        String signStr = String.join("&", allParts);

        // 4. 计算 HMAC-SHA256
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(
            apiSecret.getBytes("UTF-8"), "HmacSHA256"
        );
        mac.init(secretKey);
        byte[] hash = mac.doFinal(signStr.getBytes("UTF-8"));

        // 5. 转换为十六进制
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
```
---

## 🐛 常见错误

| 错误 | 原因 | 解决方案 |
|-----|-----|--------|
| 签名验证失败 | 参数排序错误或api_secret错误 | 检查排序顺序，确认api_secret正确 |
| 签名长度不对 | 未转换为十六进制 | 确保转换为十六进制格式 |
| 时间戳过期 | 时间戳超过5分钟 | 使用当前毫秒级时间戳 |
