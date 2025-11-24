#!/bin/bash

# 动态SQL功能测试脚本
# 使用方法: ./test-dynamic-sql.sh YOUR_AUTH_TOKEN

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
API_BASE="http://localhost:5000/api"
TOKEN="${1:-YOUR_TOKEN_HERE}"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}动态SQL功能测试${NC}"
echo -e "${YELLOW}========================================${NC}\n"

# 测试1: 验证SQL语法（正确的SQL）
echo -e "${YELLOW}测试1: 验证SQL语法（正确的SQL）${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}/generator/validate-sql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "sql": "SELECT id, username, email FROM users WHERE is_active = true"
  }')

echo "$RESPONSE" | jq '.'

if echo "$RESPONSE" | jq -e '.data.valid == true' > /dev/null; then
  echo -e "${GREEN}✓ 测试通过${NC}\n"
else
  echo -e "${RED}✗ 测试失败${NC}\n"
fi

# 测试2: 验证SQL语法（包含危险关键词）
echo -e "${YELLOW}测试2: 验证SQL语法（包含危险关键词）${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}/generator/validate-sql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "sql": "SELECT * FROM users; DROP TABLE users;"
  }')

echo "$RESPONSE" | jq '.'

if echo "$RESPONSE" | jq -e '.data.valid == false' > /dev/null; then
  echo -e "${GREEN}✓ 测试通过（成功拒绝危险SQL）${NC}\n"
else
  echo -e "${RED}✗ 测试失败${NC}\n"
fi

# 测试3: 预览SQL查询结果
echo -e "${YELLOW}测试3: 预览SQL查询结果${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}/generator/preview-sql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "sql": "SELECT id, username, email FROM users LIMIT 5",
    "limit": 5
  }')

echo "$RESPONSE" | jq '.'

if echo "$RESPONSE" | jq -e '.code == 200' > /dev/null; then
  ROW_COUNT=$(echo "$RESPONSE" | jq '.data | length')
  echo -e "${GREEN}✓ 测试通过（返回 ${ROW_COUNT} 条记录）${NC}\n"
else
  echo -e "${RED}✗ 测试失败${NC}\n"
fi

# 测试4: 从SQL生成字段配置（单表）
echo -e "${YELLOW}测试4: 从SQL生成字段配置（单表）${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}/generator/generate-fields-from-sql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "sql": "SELECT id, username, email, phone, created_at FROM users"
  }')

echo "$RESPONSE" | jq '.'

if echo "$RESPONSE" | jq -e '.code == 200' > /dev/null; then
  FIELD_COUNT=$(echo "$RESPONSE" | jq '.data.fields | length')
  GROUP_COUNT=$(echo "$RESPONSE" | jq '.data.availableGroups | length')
  echo -e "${GREEN}✓ 测试通过（生成 ${FIELD_COUNT} 个字段，${GROUP_COUNT} 个分组）${NC}\n"
else
  echo -e "${RED}✗ 测试失败${NC}\n"
fi

# 测试5: 从SQL生成字段配置（多表JOIN）
echo -e "${YELLOW}测试5: 从SQL生成字段配置（多表JOIN）${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}/generator/generate-fields-from-sql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "sql": "SELECT u.id, u.username, u.email, d.name as department_name, r.name as role_name FROM users u LEFT JOIN departments d ON u.department_id = d.id LEFT JOIN roles r ON u.role_id = r.id"
  }')

echo "$RESPONSE" | jq '.'

if echo "$RESPONSE" | jq -e '.code == 200' > /dev/null; then
  FIELD_COUNT=$(echo "$RESPONSE" | jq '.data.fields | length')
  GROUP_COUNT=$(echo "$RESPONSE" | jq '.data.availableGroups | length')

  echo -e "${GREEN}✓ 测试通过${NC}"
  echo -e "  字段数量: ${FIELD_COUNT}"
  echo -e "  分组数量: ${GROUP_COUNT}"
  echo -e "  分组列表:"
  echo "$RESPONSE" | jq -r '.data.availableGroups[] | "    - \(.label) (\(.tableName))"'
  echo ""
else
  echo -e "${RED}✗ 测试失败${NC}\n"
fi

# 测试6: 测试安全过滤（注释符号）
echo -e "${YELLOW}测试6: 测试安全过滤（注释符号）${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}/generator/validate-sql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "sql": "SELECT * FROM users -- WHERE id = 1"
  }')

echo "$RESPONSE" | jq '.'

if echo "$RESPONSE" | jq -e '.data.valid == false' > /dev/null; then
  echo -e "${GREEN}✓ 测试通过（成功拒绝包含注释的SQL）${NC}\n"
else
  echo -e "${RED}✗ 测试失败${NC}\n"
fi

# 测试7: 测试安全过滤（多语句）
echo -e "${YELLOW}测试7: 测试安全过滤（多语句）${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}/generator/validate-sql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "sql": "SELECT * FROM users; SELECT * FROM roles;"
  }')

echo "$RESPONSE" | jq '.'

if echo "$RESPONSE" | jq -e '.data.valid == false' > /dev/null; then
  echo -e "${GREEN}✓ 测试通过（成功拒绝多语句SQL）${NC}\n"
else
  echo -e "${RED}✗ 测试失败${NC}\n"
fi

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}测试完成！${NC}"
echo -e "${YELLOW}========================================${NC}"
