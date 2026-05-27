const AccessControl = require('accesscontrol');

/**
 * RBAC权限配置 - 动态加载版本
 *
 * 权限格式：resource:action
 * - resource: 资源名称 (user, role, permission, menu, file, etc.)
 * - action: 操作类型 (create, read, update, delete)
 *
 * AccessControl方法：
 * - createOwn/createAny: 创建
 * - readOwn/readAny: 读取
 * - updateOwn/updateAny: 更新
 * - deleteOwn/deleteAny: 删除
 *
 * Own: 只能操作自己的资源
 * Any: 可以操作任何资源
 */

// 缓存配置
let cachedAC = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 静态 AccessControl（兜底方案）
 * 在动态加载失败时使用
 */
function buildStaticAccessControl() {
  const ac = new AccessControl();

  // 超级管理员：拥有所有权限
  ac.grant('super_admin')
    // 用户管理
    .createAny('user')
    .readAny('user')
    .updateAny('user')
    .deleteAny('user')
    // 角色管理
    .createAny('role')
    .readAny('role')
    .updateAny('role')
    .deleteAny('role')
    // 权限管理
    .createAny('permission')
    .readAny('permission')
    .updateAny('permission')
    .deleteAny('permission')
    // 菜单管理
    .createAny('menu')
    .readAny('menu')
    .updateAny('menu')
    .deleteAny('menu')
    // 文件管理
    .createAny('file')
    .readAny('file')
    .updateAny('file')
    .deleteAny('file')
    // 测试商品
    .createAny('test-products')
    .readAny('test-products')
    .updateAny('test-products')
    .deleteAny('test-products');

  return ac;
}

/**
 * 从数据库动态构建 AccessControl
 */
async function buildAccessControl() {
  const db = require('../models');
  const ac = new AccessControl();

  try {
    // 查询所有角色及其权限
    const roles = await db.Role.findAll({
      include: [{
        model: db.Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    });

    // 为每个角色构建权限
    for (const role of roles) {
      if (!role.permissions || role.permissions.length === 0) {
        continue;
      }

      for (const perm of role.permissions) {
        const { resource, action } = perm;

        // 构建权限方法名（例如：read -> readAny, create -> createAny）
        const methodName = `${action}Any`;

        // 检查方法是否存在
        if (typeof ac.grant(role.code)[methodName] === 'function') {
          ac.grant(role.code)[methodName](resource);
        }
      }
    }

    return ac;
  } catch (error) {
    console.error('Failed to build AccessControl from database:', error);
    console.error('Falling back to static AccessControl configuration');
    // 返回静态配置的 AccessControl 作为降级方案
    return buildStaticAccessControl();
  }
}

/**
 * 获取 AccessControl 实例（带缓存）
 */
async function getAccessControl() {
  const now = Date.now();

  // 检查缓存是否有效
  if (cachedAC && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedAC;
  }

  // 重新构建并缓存
  cachedAC = await buildAccessControl();
  cacheTimestamp = now;

  return cachedAC;
}

/**
 * 清除缓存（在权限更新后调用）
 */
function clearCache() {
  cachedAC = null;
  cacheTimestamp = null;
}

// 导出动态 AccessControl 函数
module.exports = {
  // 动态加载方法（推荐）
  getAccessControl,
  buildAccessControl,
  clearCache,

  // 静态降级方法
  buildStaticAccessControl,
};