const { getAccessControl } = require('../config/rbac');
const ApiError = require('../utils/ApiError');

/**
 * 权限检查中间件
 * @param {string} resourceOrPermission - 资源名称或完整权限字符串 (例如: 'user' 或 'user:read')
 * @param {string} [action] - 操作类型 (create, read, update, delete)。如果第一个参数包含冒号，则此参数被忽略
 * @param {boolean} [checkOwnership=false] - 是否检查资源所有权
 * @returns {Function} Express中间件函数
 */
const checkPermission = (resourceOrPermission, action, checkOwnership = false) => {
  return async (req, res, next) => {
    try {
      // 确保用户已认证
      if (!req.user) {
        throw ApiError.unauthorized('用户未认证');
      }

      // 确保用户有角色
      if (!req.user.roles || req.user.roles.length === 0) {
        throw ApiError.forbidden('用户没有分配角色');
      }

      // 解析资源和操作
      let resource, actualAction;
      if (resourceOrPermission.includes(':')) {
        // 新格式: 'resource:action'
        [resource, actualAction] = resourceOrPermission.split(':');
      } else {
        // 传统格式: resource, action
        resource = resourceOrPermission;
        actualAction = action;
      }

      // 如果 resource 为空（例如 ':read'），跳过权限检查
      if (!resource) {
        next();
        return;
      }

      // 获取动态 AccessControl 实例
      const ac = await getAccessControl();

      // 获取用户的所有角色
      const userRoles = req.user.roles.map(role => role.code);

      // 检查每个角色是否有权限
      let hasPermission = false;
      let permission = null;

      for (const roleCode of userRoles) {
        // 检查是否需要检查所有权
        if (checkOwnership) {
          permission = ac.can(roleCode)[`${actualAction}Own`](resource);
        } else {
          permission = ac.can(roleCode)[`${actualAction}Any`](resource);
        }

        if (permission.granted) {
          hasPermission = true;
          break;
        }

        // 如果没有Any权限，尝试检查Own权限
        if (!hasPermission && !checkOwnership) {
          permission = ac.can(roleCode)[`${actualAction}Own`](resource);
          if (permission.granted) {
            hasPermission = true;
            // 标记需要检查所有权
            req.checkOwnership = true;
            break;
          }
        }
      }

      if (!hasPermission) {
        throw ApiError.forbidden(`没有权限执行此操作: ${actualAction} ${resource}`);
      }

      // 将权限信息附加到请求对象
      req.permission = permission;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 检查资源所有权
 * @param {Object} resource - 资源对象
 * @param {Object} user - 用户对象
 * @returns {boolean} 是否拥有资源
 */
const isOwner = (resource, user) => {
  if (!resource || !user) {
    return false;
  }

  // 检查资源的user_id是否等于当前用户id
  return resource.user_id === user.id || resource.id === user.id;
};

/**
 * 检查用户是否有特定角色
 * @param {...string} roleCodes - 角色代码列表
 * @returns {Function} Express中间件函数
 */
const hasRole = (...roleCodes) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('用户未认证');
      }

      if (!req.user.roles || req.user.roles.length === 0) {
        throw ApiError.forbidden('用户没有分配角色');
      }

      const userRoles = req.user.roles.map(role => role.code);
      const hasRequiredRole = roleCodes.some(code => userRoles.includes(code));

      if (!hasRequiredRole) {
        throw ApiError.forbidden(`需要以下角色之一: ${roleCodes.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 检查用户是否是超级管理员
 */
const isSuperAdmin = hasRole('super_admin');

/**
 * 检查用户是否是管理员（包括超级管理员）
 */
const isAdmin = hasRole('super_admin', 'admin');

module.exports = {
  checkPermission,
  isOwner,
  hasRole,
  isSuperAdmin,
  isAdmin,
};
