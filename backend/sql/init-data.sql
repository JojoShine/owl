-- ==========================================
-- Owl 管理系统 - 初始化数据脚本
-- ==========================================
-- 生成时间: 2025-10-28T00:43:06.737Z
-- 数据来源: 开发环境导出
-- 说明: 包含所有权限、菜单、角色、部门、邮件模板和测试账号
-- ==========================================

-- 1. 清空现有数据 (按外键依赖反序删除)
DELETE FROM user_roles;
DELETE FROM role_menus;
DELETE FROM role_permissions;
DELETE FROM users;
DELETE FROM email_templates;
DELETE FROM departments;
DELETE FROM menus;
DELETE FROM roles;
DELETE FROM permissions;

-- ==========================================
-- 2. 插入权限 (52 条)
-- ==========================================

INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('c6b79ee2-625b-470b-ba4c-eb709adad277', 'monitor:update', '管理监控', 'monitor', 'update', 'monitor', '管理监控配置和告警规则', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('2996c5af-dffe-46e2-983a-d98f3bafd90c', 'monitor:read', '查看监控', 'monitor', 'read', 'monitor', '查看系统监控数据', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('6c73274a-f38f-4a3f-b245-d1b88d57c15a', 'generator:create', '创建代码', 'generator', 'create', '代码生成', '初始化配置和生成代码', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('2a9d8ab4-1ccf-43b0-b4b2-58d39d4862ee', 'generator:delete', '删除配置', 'generator', 'delete', '代码生成', '删除模块配置和生成的代码', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('f813f305-5fa7-4117-8da6-15ebd813c002', 'generator:read', '查看代码生成器', 'generator', 'read', '代码生成', '查看代码生成器配置和历史', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('8bec9047-5937-4db1-96fc-c2ee8be5f1d6', 'generator:update', '更新配置', 'generator', 'update', '代码生成', '更新模块配置', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('ca158f71-71cb-4e45-9c32-6f58220f832e', 'file-share:delete', '删除分享', 'file-share', 'delete', '文件管理', '删除文件分享', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('72db0d90-6cc4-406e-8765-a6c48f885c4b', 'file-share:read', '查看分享', 'file-share', 'read', '文件管理', '查看文件分享列表', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('e61bcc30-937f-4ece-87d0-385204700a61', 'file:delete', '删除文件', 'file', 'delete', '文件管理', '删除文件', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('a0ae3b0d-ea91-4c57-9fe4-e53a5501d302', 'file:read', '查看文件', 'file', 'read', '文件管理', '查看文件列表和详情', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('8ea9f023-9813-4636-8161-8037d5d771e3', 'file:update', '更新文件', 'file', 'update', '文件管理', '更新文件信息（重命名、移动）', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('af43230e-ceb1-43ef-ba7a-551f029cd4dc', 'file:share', '分享文件', 'file-share', 'create', '文件管理', '创建文件分享链接', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('e5d3fad0-c917-4300-a8aa-cdfefb4f6398', 'file:create', '上传文件', 'file', 'create', '文件管理', '上传文件', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('064a4b1a-eb86-4212-a533-1b514fbfa2d8', 'folder:create', '创建文件夹', 'folder', 'create', '文件管理', '创建新文件夹', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('895fdc25-c9cf-4d4e-af22-aa5ed425b49f', 'folder:delete', '删除文件夹', 'folder', 'delete', '文件管理', '删除文件夹', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('b3268fc7-3730-4e43-aa54-4a1d072ecf31', 'folder:read', '查看文件夹', 'folder', 'read', '文件管理', '查看文件夹列表和详情', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('efbe9734-6549-4337-9e86-bc19efa237b4', 'folder:update', '更新文件夹', 'folder', 'update', '文件管理', '更新文件夹信息', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('4e527c72-862e-46d6-bd15-05547109dcb9', 'log:create', '备份日志', 'log', 'create', '日志管理', '备份日志到对象存储', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('8cd36f75-89e8-4929-b7f0-016263031d32', 'log:update', '配置日志', 'log', 'update', '日志管理', '配置日志系统', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('0295f5fa-3cae-4005-8652-0d954670e588', 'log:read', '查看日志', 'log', 'read', '日志管理', '查看和导出系统日志', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('269049e4-a8a7-4e93-b5c6-aa5aa5029f59', 'permission:create', '创建权限', 'permission', 'create', '权限管理', '创建新权限', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('4d3127f7-5755-4ed4-af1f-e2d6357dfeab', 'permission:delete', '删除权限', 'permission', 'delete', '权限管理', '删除权限', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('62456aca-9cd1-4e14-a33e-7adbf126acfc', 'permission:read', '查看权限', 'permission', 'read', '权限管理', '查看权限列表和详情', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('e132cadc-511b-44f9-b702-65a01bb72956', 'permission:update', '更新权限', 'permission', 'update', '权限管理', '更新权限信息', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('3e52b630-0fe0-49fd-8155-ad768c53b2d8', 'user:create', '创建用户', 'user', 'create', '用户管理', '创建新用户', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('bd9db7d3-687b-4e3a-a5ef-c2aef2b0c0ef', 'user:delete', '删除用户', 'user', 'delete', '用户管理', '删除用户', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('024169e2-0532-40f1-a5a0-c7feedd44494', 'user:read', '查看用户', 'user', 'read', '用户管理', '查看用户列表和详情', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('2086184f-1dbd-4c31-890d-f8749e5c0429', 'user:update', '更新用户', 'user', 'update', '用户管理', '更新用户信息', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('2cbe8702-e4ca-4a9f-8281-844e88f3510b', 'menu:create', '创建菜单', 'menu', 'create', '菜单管理', '创建新菜单', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('31beda1e-cc51-4787-9f68-8e2c115b2921', 'menu:delete', '删除菜单', 'menu', 'delete', '菜单管理', '删除菜单', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('c00023dd-d328-44df-89b5-88e7528b868b', 'menu:read', '查看菜单', 'menu', 'read', '菜单管理', '查看菜单列表和详情', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('8e8e39d5-9c94-42d8-b9b4-5db3ef47ca51', 'menu:update', '更新菜单', 'menu', 'update', '菜单管理', '更新菜单信息', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('92e74673-1631-4651-b427-53cb50807720', 'role:create', '创建角色', 'role', 'create', '角色管理', '创建新角色', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('a79b87b1-b3cd-4217-8a82-fea08118512d', 'role:delete', '删除角色', 'role', 'delete', '角色管理', '删除角色', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('c21cdb67-eb7d-43eb-9384-4975bf474400', 'role:read', '查看角色', 'role', 'read', '角色管理', '查看角色列表和详情', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('ac22363b-9e01-47a6-8214-98f045d49ee4', 'role:update', '更新角色', 'role', 'update', '角色管理', '更新角色信息', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('b2cc5246-07d6-4e9d-9e2a-15983fefaca3', 'notification:update', '管理通知', 'notification', 'update', '通知管理', '发送和管理通知', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('40ae0cde-41d3-449f-95fc-dd4c7d476ee2', 'notification:read', '查看通知', 'notification', 'read', '通知管理', '查看站内通知', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('facc15c9-55a8-4d37-a188-1c7a80227456', 'email:create', '发送邮件', 'email', 'create', '邮件管理', '发送邮件和查看邮件日志', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('b456c384-fa7f-41b9-92d3-a1c266744e16', 'email_template:create', '创建邮件模板', 'email_template', 'create', '邮件管理', '创建新邮件模板', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('139331b6-cd33-4331-8719-6eaae116aabb', 'email_template:delete', '删除邮件模板', 'email_template', 'delete', '邮件管理', '删除邮件模板', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('df4b8233-172e-46cc-b7ab-52f15051db50', 'email_template:read', '查看邮件模板', 'email_template', 'read', '邮件管理', '查看邮件模板列表和详情', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('d8e1d305-ff33-4f11-9322-6bf212daec2b', 'email_template:update', '更新邮件模板', 'email_template', 'update', '邮件管理', '更新邮件模板信息', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('76db4052-4e5d-41ea-9205-a2871a3493a0', 'department:create', '创建部门', 'department', 'create', '部门管理', '创建新部门', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('b837ef47-1821-4de1-a929-8f1df974b1f6', 'department:delete', '删除部门', 'department', 'delete', '部门管理', '删除部门', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('992d1983-5220-47cc-a930-c16ae8c87d2e', 'department:read', '查看部门', 'department', 'read', '部门管理', '查看部门列表和详情', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  ('5ac2feb3-6791-483d-9ef8-328eda16ff99', 'department:update', '更新部门', 'department', 'update', '部门管理', '更新部门信息', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');

-- ==========================================
-- 3. 插入角色 (3 条)
-- ==========================================

INSERT INTO roles (id, code, name, description, status, sort, created_at, updated_at) VALUES
  ('5bbddbca-0ace-4641-8a5b-8882a648ca49', 'super_admin', '超级管理员', '拥有系统所有权限', 'active', 1, '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO roles (id, code, name, description, status, sort, created_at, updated_at) VALUES
  ('6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'admin', '管理员', '拥有大部分管理权限', 'active', 2, '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO roles (id, code, name, description, status, sort, created_at, updated_at) VALUES
  ('b4f563f7-b8a8-4322-b9ac-4b6daae6271f', 'user', '普通用户', '普通用户角色，只有查看权限', 'active', 3, '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');

-- ==========================================
-- 4. 插入菜单 (17 条)
-- ==========================================

INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('7dbae11a-93a0-4825-bb80-e1a8120de300', NULL, '概览', '/dashboard', NULL, 'LayoutDashboard', 'menu', true, 0, 'active', NULL, '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('1cc8a153-2470-4714-8da1-9545db5b8794', NULL, '文件管理', '/files', NULL, 'FolderOpen', 'menu', true, 2, 'active', 'file:read', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('fcca17f1-a067-40bb-8315-948a4371b5ed', NULL, '日志管理', '/logs', NULL, 'FileText', 'menu', true, 10, 'active', 'log:read', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('51785958-3437-4938-b77d-ce7cf2d9782b', NULL, '监控系统', NULL, NULL, 'Activity', 'menu', true, 20, 'active', NULL, '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('20d1ace9-f45a-4888-9a69-733606f583f6', NULL, '消息中心', '/notifications', NULL, 'Bell', 'menu', true, 25, 'active', 'notification:read', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('0e734687-5eb8-472f-a138-ed35ce17556a', NULL, '系统管理', NULL, NULL, 'Settings', 'menu', true, 99, 'active', NULL, '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('a12f7314-1f9e-44e1-bc7a-8b81aa41d870', '0e734687-5eb8-472f-a138-ed35ce17556a', '用户管理', '/setting/users', 'UsersPage', 'Users', 'menu', true, 1, 'active', 'user:read', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('31aa61d5-711f-43ec-ba19-01035c393a58', '0e734687-5eb8-472f-a138-ed35ce17556a', '角色管理', '/setting/roles', 'RolesPage', 'Shield', 'menu', true, 2, 'active', 'role:read', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('9289f417-0496-4d7f-839a-7b1198eaa0fd', '0e734687-5eb8-472f-a138-ed35ce17556a', '权限管理', '/setting/permissions', 'PermissionsPage', 'Key', 'menu', true, 3, 'active', 'permission:read', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('d9126103-db5f-43b2-8964-503b65b76983', '0e734687-5eb8-472f-a138-ed35ce17556a', '菜单管理', '/setting/menus', 'MenusPage', 'MenuIcon', 'menu', true, 4, 'active', 'menu:read', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('7896701f-ca95-4293-bda5-2a7281090ef8', '0e734687-5eb8-472f-a138-ed35ce17556a', '部门管理', '/setting/departments', 'DepartmentsPage', 'Building2', 'menu', true, 5, 'active', 'department:read', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('feed1e74-6c95-47f6-9576-c2fc7f71ed65', '0e734687-5eb8-472f-a138-ed35ce17556a', '邮件模板', '/setting/email-templates', NULL, 'Mail', 'menu', true, 80, 'active', 'email_template:read', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('6ae5d75e-3020-4f69-aaa9-df75474c0921', '0e734687-5eb8-472f-a138-ed35ce17556a', '通知设置', '/setting/notification-settings', NULL, 'Settings', 'menu', true, 85, 'active', NULL, '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('ebe9b552-680a-40c1-8c1e-f891934629e4', '0e734687-5eb8-472f-a138-ed35ce17556a', '代码生成器', '/generator', NULL, 'Code', 'menu', true, 90, 'active', 'generator:read', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('05a7bb9b-bf96-4ce9-b510-bf0d068acd5d', '51785958-3437-4938-b77d-ce7cf2d9782b', '监控概览', '/monitor', NULL, 'BarChart3', 'menu', true, 1, 'active', 'monitor:read', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('cfa8dc2d-0554-4999-8f2b-98077bcebbc3', '51785958-3437-4938-b77d-ce7cf2d9782b', '接口监控', '/monitor/apis', NULL, 'Network', 'menu', true, 2, 'active', 'monitor:update', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  ('8075b442-90e6-4c91-9b2c-8fc8051ac337', '51785958-3437-4938-b77d-ce7cf2d9782b', '告警管理', '/monitor/alerts', NULL, 'Bell', 'menu', true, 3, 'active', 'monitor:update', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');

-- ==========================================
-- 5. 插入角色-权限关联
-- ==========================================

INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('c89a04b4-d911-4f1e-a02f-42b34ba0edfc', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'c6b79ee2-625b-470b-ba4c-eb709adad277', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('47bb6df9-98c5-4e1b-9463-df4c1bdb914e', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '2996c5af-dffe-46e2-983a-d98f3bafd90c', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('ea02836b-0958-461d-b37e-737f390a5cc2', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '6c73274a-f38f-4a3f-b245-d1b88d57c15a', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('d9d2f709-bca6-4fe1-895f-34a7d6022ea0', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '2a9d8ab4-1ccf-43b0-b4b2-58d39d4862ee', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('79a59c1d-a1c2-427e-8434-cba72ab5c6fb', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'f813f305-5fa7-4117-8da6-15ebd813c002', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('72e5d493-74df-4f92-af9f-810949746418', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '8bec9047-5937-4db1-96fc-c2ee8be5f1d6', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('3da63c96-e28d-48b5-91c1-a69c5706bf9a', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'ca158f71-71cb-4e45-9c32-6f58220f832e', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('d512e809-d15b-4124-b510-377f88a18bd1', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '72db0d90-6cc4-406e-8765-a6c48f885c4b', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('d7cffa2b-b18d-44e3-8da5-08832853601d', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'e61bcc30-937f-4ece-87d0-385204700a61', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('b488e05b-7735-44c3-92c9-388e3883105c', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'a0ae3b0d-ea91-4c57-9fe4-e53a5501d302', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('9ccefdc0-364b-49d4-b191-8010fd67d90d', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'af43230e-ceb1-43ef-ba7a-551f029cd4dc', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('bcaba999-dfd2-4c3c-b306-8182d17739fa', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '8ea9f023-9813-4636-8161-8037d5d771e3', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('5c3899ea-24c9-4bd0-9814-beeaf66eddc6', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'e5d3fad0-c917-4300-a8aa-cdfefb4f6398', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('c840960c-e886-4575-9601-9e73a5047e6c', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '064a4b1a-eb86-4212-a533-1b514fbfa2d8', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('fa3ab817-1043-4167-b3f3-d887f91cba32', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '895fdc25-c9cf-4d4e-af22-aa5ed425b49f', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('b27c79af-abc6-4759-98ac-83a4c028eabb', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'b3268fc7-3730-4e43-aa54-4a1d072ecf31', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('84779132-8f5f-462c-8557-37d01df1006f', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'efbe9734-6549-4337-9e86-bc19efa237b4', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('3e09f7d8-6c3d-4dce-94fa-7dcb894315c2', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '4e527c72-862e-46d6-bd15-05547109dcb9', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('799b064b-52b2-46b9-b733-433144a0159d', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '8cd36f75-89e8-4929-b7f0-016263031d32', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('3fe94a84-5f83-4812-aa19-c75d1fe6e60a', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '0295f5fa-3cae-4005-8652-0d954670e588', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('c0ab9100-9d6a-4e9d-ac28-399bd12d9421', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '269049e4-a8a7-4e93-b5c6-aa5aa5029f59', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('0d823610-65d4-4aac-903d-33969483d08f', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '4d3127f7-5755-4ed4-af1f-e2d6357dfeab', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('7d5eca55-87d5-4ad0-88cb-fd35bf07399e', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '62456aca-9cd1-4e14-a33e-7adbf126acfc', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('069c2243-f437-4278-9340-4a0c774d9db9', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'e132cadc-511b-44f9-b702-65a01bb72956', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('72f95ec7-7925-44b1-bb37-eb42641ac879', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '3e52b630-0fe0-49fd-8155-ad768c53b2d8', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('8280f7c3-1599-4bfe-84d4-668035e16624', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'bd9db7d3-687b-4e3a-a5ef-c2aef2b0c0ef', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('b65a37c9-0a8d-4f26-b65d-16a10b34075d', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '024169e2-0532-40f1-a5a0-c7feedd44494', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('54b57efd-3984-4dcb-8bc9-410cbc39d6a4', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '2086184f-1dbd-4c31-890d-f8749e5c0429', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('35d9af3b-c76e-4d31-ac23-7431912090e3', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '2cbe8702-e4ca-4a9f-8281-844e88f3510b', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('d23b7b80-a0a7-4648-be4e-614f75d432db', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '31beda1e-cc51-4787-9f68-8e2c115b2921', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('47af50d3-0dfd-4b56-9011-89b5e5b8ccb4', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'c00023dd-d328-44df-89b5-88e7528b868b', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('1564abef-7aa1-441a-b81e-6525028045e0', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '8e8e39d5-9c94-42d8-b9b4-5db3ef47ca51', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('2c81a165-0bb4-439c-abf8-7e51b32d2207', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '92e74673-1631-4651-b427-53cb50807720', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('05f1aafc-11e8-4c2a-8f1f-06a13fc83d7d', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'a79b87b1-b3cd-4217-8a82-fea08118512d', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('8f5a86d7-adfa-42b0-934c-6446bb61bd94', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'c21cdb67-eb7d-43eb-9384-4975bf474400', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('259a2ec5-1304-4e60-b0e3-6dd109bc88ce', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'ac22363b-9e01-47a6-8214-98f045d49ee4', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('7c52d6c4-d632-490b-92dd-188bdda72ef9', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'b2cc5246-07d6-4e9d-9e2a-15983fefaca3', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('8b71d671-f822-4af0-a0b9-9869cee6b614', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '40ae0cde-41d3-449f-95fc-dd4c7d476ee2', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('e5759c46-e9a4-4289-ad99-ec8f9bd867f7', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'facc15c9-55a8-4d37-a188-1c7a80227456', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('1160e63a-4283-4484-8750-1223fc7ae017', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'b456c384-fa7f-41b9-92d3-a1c266744e16', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('0c858e7a-8391-4f90-81ea-1bea0e611a12', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '139331b6-cd33-4331-8719-6eaae116aabb', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('aa207bae-500e-491b-a591-ef80773b3a1e', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'df4b8233-172e-46cc-b7ab-52f15051db50', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('55da4915-5827-485a-8d52-7c81d76d0964', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'd8e1d305-ff33-4f11-9322-6bf212daec2b', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('2f3ba156-c24e-42d2-b02f-44a37a7b9f29', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '76db4052-4e5d-41ea-9205-a2871a3493a0', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('23a3eeea-c66e-48f0-8da6-fcb30843cb8e', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'b837ef47-1821-4de1-a929-8f1df974b1f6', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('0bfe21cf-eb97-4328-882b-3e52d3567501', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '992d1983-5220-47cc-a930-c16ae8c87d2e', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('aeae9570-1145-4d69-9a4b-ffb79c25e8e7', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '5ac2feb3-6791-483d-9ef8-328eda16ff99', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('477d11d8-0e14-4015-a403-2d06b2a3c093', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'c6b79ee2-625b-470b-ba4c-eb709adad277', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('4dc5405c-30b7-4208-b1ba-0d0e3e5a252c', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '2996c5af-dffe-46e2-983a-d98f3bafd90c', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('58876bd3-e587-49a5-b45e-803fa81d0a1c', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '6c73274a-f38f-4a3f-b245-d1b88d57c15a', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('c0154c7f-b41d-4535-908b-51d84ba8dc0c', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '2a9d8ab4-1ccf-43b0-b4b2-58d39d4862ee', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('acc7a3bd-e1e6-412b-9a96-8917fbe9d29e', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'f813f305-5fa7-4117-8da6-15ebd813c002', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('ef4f6c32-c3c1-4d77-9433-e024461c996a', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '8bec9047-5937-4db1-96fc-c2ee8be5f1d6', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('f3360ee7-306d-46c8-b97e-17a0a7307e38', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'ca158f71-71cb-4e45-9c32-6f58220f832e', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('a483a8a0-1d38-4b40-9f09-8900f21140fc', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '72db0d90-6cc4-406e-8765-a6c48f885c4b', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('b25106d7-4f06-43e4-9363-3d0a6f98b8ab', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'e61bcc30-937f-4ece-87d0-385204700a61', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('67a3925a-b3e9-41dd-adeb-62d545959e1a', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'a0ae3b0d-ea91-4c57-9fe4-e53a5501d302', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('3969f126-9d3e-4c14-8086-6dcb71dc138a', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'af43230e-ceb1-43ef-ba7a-551f029cd4dc', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('fe8e95d9-1f2c-4562-9169-b09e9e0ffb62', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '8ea9f023-9813-4636-8161-8037d5d771e3', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('75fb1d11-c529-459b-ae15-8b88bb1cc022', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'e5d3fad0-c917-4300-a8aa-cdfefb4f6398', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('80b5dec7-61ac-4300-b5d9-3a91f4eb5654', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '064a4b1a-eb86-4212-a533-1b514fbfa2d8', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('490b149c-0573-48eb-b433-b76187b22941', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '895fdc25-c9cf-4d4e-af22-aa5ed425b49f', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('d1fd2d7b-52f3-4de8-b7bc-d394316dbcb9', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'b3268fc7-3730-4e43-aa54-4a1d072ecf31', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('fd0552ec-8111-4950-91ce-47895e7a7977', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'efbe9734-6549-4337-9e86-bc19efa237b4', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('5ab423c2-0bdb-4d7e-8a7b-bf4fe5ab165d', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '4e527c72-862e-46d6-bd15-05547109dcb9', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('5fdb30bf-db81-41b6-b95b-09e1c47d45cd', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '8cd36f75-89e8-4929-b7f0-016263031d32', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('e8259363-0bf0-4360-89cf-7a9e7650f0ad', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '0295f5fa-3cae-4005-8652-0d954670e588', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('170201b5-02ef-4834-9bee-04a63c09a2d1', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '3e52b630-0fe0-49fd-8155-ad768c53b2d8', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('3112bbcc-4a38-45d2-b2d2-39afa71452da', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'bd9db7d3-687b-4e3a-a5ef-c2aef2b0c0ef', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('34d75699-1c48-417b-9bb2-2b3e93966b4c', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '024169e2-0532-40f1-a5a0-c7feedd44494', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('09c8cbac-6347-44d4-88cc-0c2979dd5dad', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '2086184f-1dbd-4c31-890d-f8749e5c0429', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('889820eb-d014-4ba8-8a86-3bb53232e9cf', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '2cbe8702-e4ca-4a9f-8281-844e88f3510b', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('ec2dabdf-74b0-47a0-a4bb-129906bad4c5', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '31beda1e-cc51-4787-9f68-8e2c115b2921', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('17e61f29-db71-4847-bb83-08b2e1e27b97', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'c00023dd-d328-44df-89b5-88e7528b868b', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('7435295b-1eb8-442c-b937-dbe7016ea20e', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '8e8e39d5-9c94-42d8-b9b4-5db3ef47ca51', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('0957e332-5988-49b7-93ca-1816a8750228', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '92e74673-1631-4651-b427-53cb50807720', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('660961cc-e21d-44bb-a00e-1a6cbd32b8b6', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'a79b87b1-b3cd-4217-8a82-fea08118512d', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('25bff64b-393f-473a-ae55-bee2671f627f', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'c21cdb67-eb7d-43eb-9384-4975bf474400', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('c0384e0b-8021-430d-9d6a-2dc182fd0377', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'ac22363b-9e01-47a6-8214-98f045d49ee4', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('fb219ddf-f810-4637-a5da-c2b66c6c1c97', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'b2cc5246-07d6-4e9d-9e2a-15983fefaca3', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('24d54b88-39f0-4647-8b7f-a2ca2385bc63', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '40ae0cde-41d3-449f-95fc-dd4c7d476ee2', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('56dc6b26-80a1-40a5-8fb4-b2c4a502f531', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'facc15c9-55a8-4d37-a188-1c7a80227456', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('54127d74-0f6a-48c2-955f-8ba5f54973c5', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'b456c384-fa7f-41b9-92d3-a1c266744e16', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('82eb37b6-698f-437e-b63d-f96d9fedfb5e', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '139331b6-cd33-4331-8719-6eaae116aabb', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('11f41d88-82c0-41fc-8add-228f6a824c61', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'df4b8233-172e-46cc-b7ab-52f15051db50', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('d1b752dd-4b6e-49fc-b202-edb4db339296', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'd8e1d305-ff33-4f11-9322-6bf212daec2b', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('544c9f3b-91f5-4508-ba43-739612e3fd9f', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '76db4052-4e5d-41ea-9205-a2871a3493a0', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('bf0d6f45-4a6a-4400-9eb5-6774ebe7009a', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'b837ef47-1821-4de1-a929-8f1df974b1f6', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('4a35bd60-cd1d-44a0-a10e-29bd2c1f3390', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '992d1983-5220-47cc-a930-c16ae8c87d2e', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('1364ca58-0c15-4337-ad0f-cbf5c14e4133', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '5ac2feb3-6791-483d-9ef8-328eda16ff99', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('3038364e-4cfd-47dd-adaa-9d8064190ac7', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '024169e2-0532-40f1-a5a0-c7feedd44494', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('cc5c3ef9-9df9-496e-9ce7-08d23d6d5da6', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', 'c21cdb67-eb7d-43eb-9384-4975bf474400', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('cca20b7c-2334-4ad9-af96-6664f3a6ab8a', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '62456aca-9cd1-4e14-a33e-7adbf126acfc', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('1410f2bd-21f3-4bf4-a475-607f7445e20f', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', 'c00023dd-d328-44df-89b5-88e7528b868b', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('775d9a2b-48a7-4dd5-aea3-0532d1ca639d', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '992d1983-5220-47cc-a930-c16ae8c87d2e', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('76b67223-55b5-4027-a523-bf8116b8666a', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '2996c5af-dffe-46e2-983a-d98f3bafd90c', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('2b56d2ef-4d35-4bcd-86d5-9ce1d2f82c9d', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', 'c6b79ee2-625b-470b-ba4c-eb709adad277', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('3a45e775-14a9-47bf-81e3-490e003b3ac8', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '40ae0cde-41d3-449f-95fc-dd4c7d476ee2', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('5d90cd31-5ab4-40b1-83fd-b709cc4c02f2', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', 'b2cc5246-07d6-4e9d-9e2a-15983fefaca3', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('9f6576f7-9602-4faa-9a40-84ec82e20fe7', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', 'df4b8233-172e-46cc-b7ab-52f15051db50', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('89b9bb94-375d-4fae-9633-e26f7ebd6ceb', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', 'b456c384-fa7f-41b9-92d3-a1c266744e16', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('4efbb453-4e70-4b15-b2b6-061048a41606', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', 'd8e1d305-ff33-4f11-9322-6bf212daec2b', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('87dd94a7-9aea-42e6-835d-63beeaa80bca', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '139331b6-cd33-4331-8719-6eaae116aabb', '2025-10-28T00:43:06.737Z');
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('686536c3-d89c-4868-b444-942b96f0b058', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', 'facc15c9-55a8-4d37-a188-1c7a80227456', '2025-10-28T00:43:06.737Z');

-- ==========================================
-- 6. 插入角色-菜单关联
-- ==========================================

INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('ea3bebfd-cde8-44cb-b5ec-55072b767a57', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '7dbae11a-93a0-4825-bb80-e1a8120de300', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('6491e56a-0b8e-4f6f-843c-48f829a58452', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '1cc8a153-2470-4714-8da1-9545db5b8794', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('b4349de8-b0cb-4619-9180-9cc819299dce', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'fcca17f1-a067-40bb-8315-948a4371b5ed', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('31f43db4-8faf-4ba5-8c1a-f596c006fc24', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '51785958-3437-4938-b77d-ce7cf2d9782b', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('c40763f1-08e2-4f59-b349-e88b337a6123', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '20d1ace9-f45a-4888-9a69-733606f583f6', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('417c4997-d744-4396-8ab9-48084a281709', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '0e734687-5eb8-472f-a138-ed35ce17556a', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('90dfad57-ddd3-48e2-b753-1b6f13fc6810', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'a12f7314-1f9e-44e1-bc7a-8b81aa41d870', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('c8a56ae1-f7fc-4b86-8fb8-026f0fd726f7', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '31aa61d5-711f-43ec-ba19-01035c393a58', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('39180fea-d57c-42d4-a230-38e7521a8ed7', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '9289f417-0496-4d7f-839a-7b1198eaa0fd', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('481d7ca9-80b4-4566-995e-13faa6eaf62d', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'd9126103-db5f-43b2-8964-503b65b76983', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('c50a439c-49b5-4993-afd9-b373a6c9cc37', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '7896701f-ca95-4293-bda5-2a7281090ef8', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('9f10f993-cf3e-4193-aa94-9397fd53468e', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'feed1e74-6c95-47f6-9576-c2fc7f71ed65', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('c5d69853-14b1-4a13-a71c-9ed5134c54a0', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '6ae5d75e-3020-4f69-aaa9-df75474c0921', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('1c21e680-9511-44cc-82db-37d41c32393d', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'ebe9b552-680a-40c1-8c1e-f891934629e4', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('420cf9ed-c513-49b3-af0c-c56c1b9d8c25', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '05a7bb9b-bf96-4ce9-b510-bf0d068acd5d', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('b1ee11c1-9490-4705-9297-ed4770e59b1c', '5bbddbca-0ace-4641-8a5b-8882a648ca49', 'cfa8dc2d-0554-4999-8f2b-98077bcebbc3', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('df6bcc06-481b-48ba-9a69-d36b8b79e59f', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '8075b442-90e6-4c91-9b2c-8fc8051ac337', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('2ab7d0ff-c934-49ee-88e6-470f0e9bc60f', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '7dbae11a-93a0-4825-bb80-e1a8120de300', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('93b29b53-8056-49a0-aa5e-d288089d56bf', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '1cc8a153-2470-4714-8da1-9545db5b8794', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('3f30e1ef-d676-4ac7-a086-59c64781d4fc', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'fcca17f1-a067-40bb-8315-948a4371b5ed', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('2176696f-1865-49ae-826c-8d97ffbcbcd9', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '51785958-3437-4938-b77d-ce7cf2d9782b', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('20baa67c-c0bb-487d-9cad-57824410d1a6', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '20d1ace9-f45a-4888-9a69-733606f583f6', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('57ca944e-f65c-4b90-8e3b-da49261c2122', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '0e734687-5eb8-472f-a138-ed35ce17556a', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('a62ae49c-88e8-4fd0-b44c-4c1e371a27aa', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'a12f7314-1f9e-44e1-bc7a-8b81aa41d870', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('2f6d70c6-aa0b-4032-b0f0-3d80b578e144', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '31aa61d5-711f-43ec-ba19-01035c393a58', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('4777e92a-cef3-45b8-83a6-7be9b7efa18c', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '9289f417-0496-4d7f-839a-7b1198eaa0fd', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('2b4fb17f-ffb6-4369-8465-132ce25c0d24', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'd9126103-db5f-43b2-8964-503b65b76983', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('d28b0136-3220-448d-9b29-c31aa3eb9096', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '7896701f-ca95-4293-bda5-2a7281090ef8', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('d6b1abe9-f50b-42de-8b86-0dc40cd74dba', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'feed1e74-6c95-47f6-9576-c2fc7f71ed65', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('d11cee09-4399-42c0-8838-fd072ae9bcb1', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '6ae5d75e-3020-4f69-aaa9-df75474c0921', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('5e5ff0a8-d23e-4ed7-ad56-04a2c1d017c5', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'ebe9b552-680a-40c1-8c1e-f891934629e4', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('27512c88-2568-4884-b1bb-7271bfa2297f', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '05a7bb9b-bf96-4ce9-b510-bf0d068acd5d', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('b8428897-0c94-4c25-a816-b2fb4e240100', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', 'cfa8dc2d-0554-4999-8f2b-98077bcebbc3', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('993f7202-9f41-4319-a664-ec9d534f30d2', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '8075b442-90e6-4c91-9b2c-8fc8051ac337', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('e64d3f97-1513-434a-b390-db2f8c1c5b75', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '7dbae11a-93a0-4825-bb80-e1a8120de300', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('fb487e16-4292-410e-a2c0-cb76ae46e062', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '1cc8a153-2470-4714-8da1-9545db5b8794', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('32d606ba-ad21-4112-a643-0989128813dd', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', 'fcca17f1-a067-40bb-8315-948a4371b5ed', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('cfd3d8c1-b4c9-4afc-bc59-28bd044d46bd', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '51785958-3437-4938-b77d-ce7cf2d9782b', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('b23aaf5f-7cf9-4333-b69f-ffbe69f98fe6', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '20d1ace9-f45a-4888-9a69-733606f583f6', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('c3ab7153-584c-4380-91bc-f7d54946338c', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '0e734687-5eb8-472f-a138-ed35ce17556a', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('f5f4fc2b-d741-4078-9999-86c1fdb2d2f0', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', 'a12f7314-1f9e-44e1-bc7a-8b81aa41d870', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('33d17062-2a4b-40f0-b641-25305b4f994f', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '31aa61d5-711f-43ec-ba19-01035c393a58', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('3507e759-3f89-462c-bd17-b9bdcb51c152', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '9289f417-0496-4d7f-839a-7b1198eaa0fd', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('8a4e69f7-a182-4633-9481-01f6cdeec2e3', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', 'd9126103-db5f-43b2-8964-503b65b76983', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('fdf7eb8f-355c-49ac-a726-94e3de5b43c6', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '7896701f-ca95-4293-bda5-2a7281090ef8', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('78eea8d4-b283-43bc-b83b-9b9186d06951', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', 'feed1e74-6c95-47f6-9576-c2fc7f71ed65', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('472869da-91d6-4e31-815c-f9af0747f07e', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '6ae5d75e-3020-4f69-aaa9-df75474c0921', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('bd906bb1-adc2-4bde-ac8c-cee64ae07530', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', 'ebe9b552-680a-40c1-8c1e-f891934629e4', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('8deab41e-b2f7-4ec2-8705-a6e61e6f8975', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '05a7bb9b-bf96-4ce9-b510-bf0d068acd5d', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('87aa8f74-cd64-48d7-aa1f-f97c4a2a2e81', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', 'cfa8dc2d-0554-4999-8f2b-98077bcebbc3', '2025-10-28T00:43:06.737Z');
INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('3948b8a3-e3c5-4c0a-8479-47eb74142bc8', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '8075b442-90e6-4c91-9b2c-8fc8051ac337', '2025-10-28T00:43:06.737Z');

-- ==========================================
-- 7. 插入部门 (4 条)
-- ==========================================

INSERT INTO departments (id, parent_id, name, code, leader_id, description, sort, status, created_at, updated_at) VALUES
  ('d3c7b289-50d6-4f95-8e60-3802c61876b1', NULL, '技术部', 'TECH', NULL, '负责公司技术研发工作', 1, 'active', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO departments (id, parent_id, name, code, leader_id, description, sort, status, created_at, updated_at) VALUES
  ('4f272cdf-1e5f-4d7d-8c67-8d9bd39b6110', NULL, '市场部', 'MARKET', NULL, '负责市场推广和销售', 2, 'active', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO departments (id, parent_id, name, code, leader_id, description, sort, status, created_at, updated_at) VALUES
  ('afac37c4-d35e-471e-a8bc-b4d72efb2e5b', 'd3c7b289-50d6-4f95-8e60-3802c61876b1', '研发部', 'DEV', NULL, '负责产品开发和维护', 1, 'active', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO departments (id, parent_id, name, code, leader_id, description, sort, status, created_at, updated_at) VALUES
  ('30a6f3b2-699c-4efd-b077-611696fba4c2', 'd3c7b289-50d6-4f95-8e60-3802c61876b1', '测试部', 'QA', NULL, '负责产品质量保证', 2, 'active', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');

-- ==========================================
-- 8. 插入测试用户 (3 个)
-- ==========================================

INSERT INTO users (id, username, email, password, real_name, phone, department_id, status, created_at, updated_at) VALUES
  ('99e2337b-8676-4414-b71e-d5aff2008616', 'admin', 'admin@example.com', '$2a$10$FK3Ax72S.pUQo.ydI5QrNesjmkb7/tN/KViwcf9uZoYZAnOEk4KbS', '超级管理员', '13800138000', 'd3c7b289-50d6-4f95-8e60-3802c61876b1', 'active', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z'),
  ('88feb135-7e32-4950-ad65-d6194347d08c', 'manager', 'manager@example.com', '$2a$10$bYTuYvL1fbgQFMmB98BeUuMkEFChq9kt6InCibX9rggKYL48YD6rq', '管理员', '13800138001', 'd3c7b289-50d6-4f95-8e60-3802c61876b1', 'active', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z'),
  ('ff5f9894-e7aa-4dec-9213-3da07f07a083', 'user', 'user@example.com', '$2a$10$TPrR.np/ekIVEINT20HtueV6ekCKS/pipGZIaHpoRkqak3.We8FsO', '普通用户', '13800138002', '4f272cdf-1e5f-4d7d-8c67-8d9bd39b6110', 'active', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');

-- 更新部门负责人
UPDATE departments SET leader_id = '99e2337b-8676-4414-b71e-d5aff2008616' WHERE id = 'd3c7b289-50d6-4f95-8e60-3802c61876b1';

-- ==========================================
-- 9. 插入用户-角色关联
-- ==========================================

INSERT INTO user_roles (id, user_id, role_id, created_at) VALUES
  ('327f6232-1faa-4edc-b90f-194c425f7697', '99e2337b-8676-4414-b71e-d5aff2008616', '5bbddbca-0ace-4641-8a5b-8882a648ca49', '2025-10-28T00:43:06.737Z'),
  ('4e8cb7f9-d8d7-456a-bcae-d3039329f137', '88feb135-7e32-4950-ad65-d6194347d08c', '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', '2025-10-28T00:43:06.737Z'),
  ('9829b7f9-2fe6-47e7-80a6-8e38fb0fcbc4', 'ff5f9894-e7aa-4dec-9213-3da07f07a083', 'b4f563f7-b8a8-4322-b9ac-4b6daae6271f', '2025-10-28T00:43:06.737Z');

-- ==========================================
-- 10. 插入邮件模板 (3 条)
-- ==========================================

INSERT INTO email_templates (id, name, subject, content, template_type, variables, variable_schema, tags, description, created_at, updated_at) VALUES
  ('d30b6b29-90af-4e2b-b039-93d3d968a5e7', '接口异常告警模版', '{{title}}', '<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
    <h2 style="color: #dc3545; margin-top: 0;">🚨 {{title}}</h2>

    {{{content}}}

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      此邮件由系统自动发送，请勿回复
    </p>
  </div>
</div>', 'API_MONITOR_ALERT', NULL, '[{"name":"apiName","label":"接口名称","description":"监控接口的名称","type":"string","required":true,"example":"用户登录接口"},{"name":"apiUrl","label":"接口地址","description":"接口URL","type":"string","required":true,"example":"https://api.example.com/login"},{"name":"method","label":"请求方法","description":"HTTP请求方法","type":"string","required":true,"example":"POST"},{"name":"errorType","label":"异常类型","description":"异常类型（超时/状态码异常/响应内容异常）","type":"string","required":true,"example":"超时"},{"name":"errorMessage","label":"错误信息","description":"详细错误信息","type":"string","required":false,"example":"请求超时"},{"name":"statusCode","label":"状态码","description":"HTTP响应状态码","type":"number","required":false,"example":"500"},{"name":"responseTime","label":"响应时间","description":"接口响应时间（毫秒）","type":"number","required":false,"example":"3500"},{"name":"timestamp","label":"发生时间","description":"异常发生时间","type":"string","required":true,"example":"2025-10-22 14:30:00"}]', '["api","alert","monitor"]', '接口监控异常时的告警邮件模版', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO email_templates (id, name, subject, content, template_type, variables, variable_schema, tags, description, created_at, updated_at) VALUES
  ('fbc66f6f-8a0e-45a8-881c-ea1deb6b0de7', 'CPU使用率告警模版', '{{title}}', '<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
    <h2 style="color: #ff6b6b; margin-top: 0;">⚠️ {{title}}</h2>

    {{{content}}}

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      此邮件由系统自动发送，请勿回复
    </p>
  </div>
</div>', 'SYSTEM_ALERT', NULL, '[{"name":"ruleName","label":"规则名称","description":"触发告警的规则名称","type":"string","required":true,"example":"CPU使用率过高告警"},{"name":"currentValue","label":"当前值","description":"当前CPU使用率","type":"number","required":true,"example":"85"},{"name":"threshold","label":"阈值","description":"告警阈值","type":"number","required":true,"example":"80"},{"name":"level","label":"告警级别","description":"告警级别（info/warning/error/critical）","type":"string","required":true,"example":"warning"},{"name":"timestamp","label":"告警时间","description":"告警发生时间","type":"string","required":true,"example":"2025-10-22 14:30:00"}]', '["system","alert","cpu"]', '系统CPU使用率超出阈值时的告警邮件模版', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');
INSERT INTO email_templates (id, name, subject, content, template_type, variables, variable_schema, tags, description, created_at, updated_at) VALUES
  ('107c287a-5525-4248-a093-31a6cd15bd4c', '内存使用率告警模版', '{{title}}', '<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
    <h2 style="color: #ff6b6b; margin-top: 0;">⚠️ {{title}}</h2>

    {{{content}}}

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      此邮件由系统自动发送，请勿回复
    </p>
  </div>
</div>', 'SYSTEM_ALERT', NULL, '[{"name":"ruleName","label":"规则名称","description":"触发告警的规则名称","type":"string","required":true,"example":"内存使用率过高告警"},{"name":"currentValue","label":"当前值","description":"当前内存使用率","type":"number","required":true,"example":"90"},{"name":"threshold","label":"阈值","description":"告警阈值","type":"number","required":true,"example":"85"},{"name":"level","label":"告警级别","description":"告警级别（info/warning/error/critical）","type":"string","required":true,"example":"error"},{"name":"timestamp","label":"告警时间","description":"告警发生时间","type":"string","required":true,"example":"2025-10-22 14:30:00"}]', '["system","alert","memory"]', '系统内存使用率超出阈值时的告警邮件模版', '2025-10-28T00:43:06.737Z', '2025-10-28T00:43:06.737Z');

-- ==========================================
-- 11. 插入低代码平台权限
-- ==========================================

-- 数据源管理权限
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  (gen_random_uuid(), 'datasource:read', '查看数据源', 'datasource', 'read', '低代码平台', '查看数据源列表和详情', NOW(), NOW()),
  (gen_random_uuid(), 'datasource:create', '创建数据源', 'datasource', 'create', '低代码平台', '创建新的数据源', NOW(), NOW()),
  (gen_random_uuid(), 'datasource:update', '更新数据源', 'datasource', 'update', '低代码平台', '更新数据源配置', NOW(), NOW()),
  (gen_random_uuid(), 'datasource:delete', '删除数据源', 'datasource', 'delete', '低代码平台', '删除数据源', NOW(), NOW());

-- API接口管理权限
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  (gen_random_uuid(), 'api_interface:read', '查看API接口', 'api_interface', 'read', '低代码平台', '查看API接口列表和详情', NOW(), NOW()),
  (gen_random_uuid(), 'api_interface:create', '创建API接口', 'api_interface', 'create', '低代码平台', '创建新的API接口', NOW(), NOW()),
  (gen_random_uuid(), 'api_interface:update', '更新API接口', 'api_interface', 'update', '低代码平台', '更新API接口配置', NOW(), NOW()),
  (gen_random_uuid(), 'api_interface:delete', '删除API接口', 'api_interface', 'delete', '低代码平台', '删除API接口', NOW(), NOW());

-- 页面管理权限
INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES
  (gen_random_uuid(), 'lowcode_page:read', '查看页面', 'lowcode_page', 'read', '低代码平台', '查看低代码页面列表和详情', NOW(), NOW()),
  (gen_random_uuid(), 'lowcode_page:create', '创建页面', 'lowcode_page', 'create', '低代码平台', '创建新的低代码页面', NOW(), NOW()),
  (gen_random_uuid(), 'lowcode_page:update', '更新页面', 'lowcode_page', 'update', '低代码平台', '更新页面配置、发布和取消发布', NOW(), NOW()),
  (gen_random_uuid(), 'lowcode_page:delete', '删除页面', 'lowcode_page', 'delete', '低代码平台', '删除低代码页面', NOW(), NOW());

-- ==========================================
-- 12. 插入低代码平台菜单
-- ==========================================

-- 创建低代码管理顶级菜单
INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
  (gen_random_uuid(), NULL, '低代码管理', NULL, NULL, 'Code2', 'menu', true, 15, 'active', NULL, NOW(), NOW());

-- 获取低代码管理菜单ID用于后续子菜单关联
DO $$
DECLARE
  lowcode_parent_id UUID;
BEGIN
  SELECT id INTO lowcode_parent_id FROM menus WHERE name = '低代码管理' AND parent_id IS NULL;

  -- 插入子菜单
  INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES
    (gen_random_uuid(), lowcode_parent_id, '数据源管理', '/lowcode/datasources', NULL, 'Database', 'menu', true, 1, 'active', 'datasource:read', NOW(), NOW()),
    (gen_random_uuid(), lowcode_parent_id, 'API接口管理', '/lowcode/apis', NULL, 'Workflow', 'menu', true, 2, 'active', 'api_interface:read', NOW(), NOW()),
    (gen_random_uuid(), lowcode_parent_id, '页面管理', '/lowcode/page-configs', NULL, 'Layout', 'menu', true, 3, 'active', 'lowcode_page:read', NOW(), NOW());
END $$;

-- ==========================================
-- 13. 将低代码平台权限授予超级管理员和管理员角色
-- ==========================================

-- 先删除已存在的低代码相关权限关联（避免重复）
DELETE FROM role_permissions
WHERE permission_id IN (
  SELECT id FROM permissions
  WHERE code LIKE 'datasource:%'
     OR code LIKE 'api_interface:%'
     OR code LIKE 'lowcode_page:%'
);

-- 为超级管理员角色添加所有低代码权限
INSERT INTO role_permissions (id, role_id, permission_id, created_at)
SELECT
  gen_random_uuid(),
  '5bbddbca-0ace-4641-8a5b-8882a648ca49', -- 超级管理员
  p.id,
  NOW()
FROM permissions p
WHERE p.code LIKE 'datasource:%'
   OR p.code LIKE 'api_interface:%'
   OR p.code LIKE 'lowcode_page:%';

-- 为管理员角色添加所有低代码权限
INSERT INTO role_permissions (id, role_id, permission_id, created_at)
SELECT
  gen_random_uuid(),
  '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', -- 管理员
  p.id,
  NOW()
FROM permissions p
WHERE p.code LIKE 'datasource:%'
   OR p.code LIKE 'api_interface:%'
   OR p.code LIKE 'lowcode_page:%';

-- ==========================================
-- 14. 将低代码平台菜单授予超级管理员和管理员角色
-- ==========================================

-- 为超级管理员角色添加低代码菜单
INSERT INTO role_menus (id, role_id, menu_id, created_at)
SELECT
  gen_random_uuid(),
  '5bbddbca-0ace-4641-8a5b-8882a648ca49', -- 超级管理员
  m.id,
  NOW()
FROM menus m
WHERE m.name IN ('低代码管理', '数据源管理', 'API接口管理', '页面管理')
ON CONFLICT DO NOTHING;

-- 为管理员角色添加低代码菜单
INSERT INTO role_menus (id, role_id, menu_id, created_at)
SELECT
  gen_random_uuid(),
  '6b81e3c2-ec0c-40f3-8e00-ec54f1b41345', -- 管理员
  m.id,
  NOW()
FROM menus m
WHERE m.name IN ('低代码管理', '数据源管理', 'API接口管理', '页面管理')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 完成
-- ==========================================

