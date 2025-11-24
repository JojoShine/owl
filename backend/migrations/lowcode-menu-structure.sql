-- ========================================
-- 低代码平台菜单结构调整
-- ========================================
-- 功能：
-- 1. 创建顶级菜单"低代码管理"
-- 2. 创建4个子菜单（数据源管理、接口管理、页面管理）
-- 3. 将"代码生成器"从系统管理移至低代码管理
-- ========================================

-- ========================================
-- 1. 创建"低代码管理"顶级菜单
-- ========================================

INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  NULL,
  '低代码管理',
  NULL,
  NULL,
  'Blocks',  -- 使用 Blocks 图标表示低代码平台
  'menu',
  true,
  15,  -- 排在文件管理(2)和日志管理(10)之后，监控系统(20)之前
  'active',
  'lowcode:read',  -- 低代码平台访问权限
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING
RETURNING id;

-- 获取刚创建的低代码管理菜单ID（用于后续子菜单关联）
-- 注意：在实际执行时需要手动记录这个ID

-- ========================================
-- 2. 创建子菜单：数据源管理
-- ========================================

INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at)
SELECT
  gen_random_uuid(),
  m.id,  -- parent_id为低代码管理菜单ID
  '数据源管理',
  '/lowcode/datasources',
  NULL,
  'Database',
  'menu',
  true,
  1,
  'active',
  'datasource:read',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM menus m
WHERE m.name = '低代码管理' AND m.parent_id IS NULL
ON CONFLICT DO NOTHING;

-- ========================================
-- 3. 创建子菜单：接口管理
-- ========================================

INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at)
SELECT
  gen_random_uuid(),
  m.id,
  '接口管理',
  '/lowcode/apis',
  NULL,
  'Webhook',
  'menu',
  true,
  2,
  'active',
  'api_interface:read',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM menus m
WHERE m.name = '低代码管理' AND m.parent_id IS NULL
ON CONFLICT DO NOTHING;

-- ========================================
-- 4. 创建子菜单：页面管理
-- ========================================

INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at)
SELECT
  gen_random_uuid(),
  m.id,
  '页面管理',
  '/lowcode/pages',
  NULL,
  'Layout',
  'menu',
  true,
  3,
  'active',
  'lowcode_page:read',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM menus m
WHERE m.name = '低代码管理' AND m.parent_id IS NULL
ON CONFLICT DO NOTHING;

-- ========================================
-- 5. 移动"代码生成器"到低代码管理下
-- ========================================

-- 更新代码生成器的parent_id、路径和排序
UPDATE menus
SET
  parent_id = (
    SELECT id FROM menus
    WHERE name = '低代码管理' AND parent_id IS NULL
    LIMIT 1
  ),
  path = '/lowcode/generator',
  sort = 4,
  updated_at = CURRENT_TIMESTAMP
WHERE name = '代码生成器'
  AND parent_id = (
    SELECT id FROM menus WHERE name = '系统管理' AND parent_id IS NULL LIMIT 1
  );

-- ========================================
-- 6. 为超级管理员角色添加新菜单权限
-- ========================================

-- 添加低代码管理菜单到超级管理员角色
INSERT INTO role_menus (id, role_id, menu_id, created_at)
SELECT
  gen_random_uuid(),
  r.id,
  m.id,
  CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN menus m
WHERE r.code = 'super_admin'
  AND m.name = '低代码管理'
  AND m.parent_id IS NULL
ON CONFLICT DO NOTHING;

-- 添加数据源管理到超级管理员角色
INSERT INTO role_menus (id, role_id, menu_id, created_at)
SELECT
  gen_random_uuid(),
  r.id,
  m.id,
  CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN menus m
WHERE r.code = 'super_admin'
  AND m.name = '数据源管理'
  AND m.parent_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 添加接口管理到超级管理员角色
INSERT INTO role_menus (id, role_id, menu_id, created_at)
SELECT
  gen_random_uuid(),
  r.id,
  m.id,
  CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN menus m
WHERE r.code = 'super_admin'
  AND m.name = '接口管理'
  AND m.parent_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 添加页面管理到超级管理员角色
INSERT INTO role_menus (id, role_id, menu_id, created_at)
SELECT
  gen_random_uuid(),
  r.id,
  m.id,
  CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN menus m
WHERE r.code = 'super_admin'
  AND m.name = '页面管理'
  AND m.parent_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ========================================
-- 7. 为管理员角色添加新菜单权限
-- ========================================

-- 添加低代码管理菜单到管理员角色
INSERT INTO role_menus (id, role_id, menu_id, created_at)
SELECT
  gen_random_uuid(),
  r.id,
  m.id,
  CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN menus m
WHERE r.code = 'admin'
  AND m.name = '低代码管理'
  AND m.parent_id IS NULL
ON CONFLICT DO NOTHING;

-- 添加数据源管理到管理员角色
INSERT INTO role_menus (id, role_id, menu_id, created_at)
SELECT
  gen_random_uuid(),
  r.id,
  m.id,
  CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN menus m
WHERE r.code = 'admin'
  AND m.name = '数据源管理'
  AND m.parent_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 添加接口管理到管理员角色
INSERT INTO role_menus (id, role_id, menu_id, created_at)
SELECT
  gen_random_uuid(),
  r.id,
  m.id,
  CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN menus m
WHERE r.code = 'admin'
  AND m.name = '接口管理'
  AND m.parent_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 添加页面管理到管理员角色
INSERT INTO role_menus (id, role_id, menu_id, created_at)
SELECT
  gen_random_uuid(),
  r.id,
  m.id,
  CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN menus m
WHERE r.code = 'admin'
  AND m.name = '页面管理'
  AND m.parent_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ========================================
-- 8. 验证查询
-- ========================================

-- 查看低代码管理菜单结构
SELECT
  m.id,
  m.parent_id,
  m.name,
  m.path,
  m.icon,
  m.sort,
  m.status,
  parent_menu.name as parent_name
FROM menus m
LEFT JOIN menus parent_menu ON m.parent_id = parent_menu.id
WHERE m.name = '低代码管理'
   OR m.parent_id = (SELECT id FROM menus WHERE name = '低代码管理' AND parent_id IS NULL)
ORDER BY m.parent_id NULLS FIRST, m.sort;

-- ========================================
-- 完成
-- ========================================

SELECT '✅ 低代码平台菜单结构调整完成' AS status;
