# 数据访问权限（DAC）

## 功能说明

基于 `created_by` 字段的用户级数据访问控制，控制每个用户能看到哪些业务数据。权限级别绑定在用户身上，与角色权限（RBAC）相互独立。

---

## 四种访问级别

| 级别 | 说明 | 适用角色 |
|------|------|----------|
| `ALL` | 可查看所有数据 | 超级管理员 |
| `DEPARTMENT_CHILDREN` | 可查看本部门及所有下级部门的数据 | 部门管理员 |
| `DEPARTMENT` | 只能查看本部门的数据 | 部门成员 |
| `SELF` | 只能查看自己创建的数据 | 普通用户 |

---

## 配置方式

在「用户管理」中为每个用户设置 `access_level` 字段，默认值为 `SELF`。

初始用户配置：
- `admin` → `ALL`
- `manager` → `DEPARTMENT_CHILDREN`
- `user` → `SELF`

---

## 业务接入

在业务模块的 list 接口中，从 `req.userContext` 获取过滤条件：

```js
const DataAccessControl = require('../../../utils/data-access-control');

async getList(query, userContext) {
  const dac = new DataAccessControl(
    userContext.userId,
    userContext.userDepartmentUsers
  );
  const dacWhere = dac.getFilterWhere(userContext.accessLevel);
  const where = { ...dacWhere, /* 其他业务条件 */ };
}
```

`userContext` 由 `extract-user-data` 中间件自动注入到 `req`，无需手动查询用户信息。
