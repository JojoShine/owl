const { Op } = require('sequelize');
const db = require('../../models');
const ApiError = require('../../utils/ApiError');
const { logger } = require('../../config/logger');

class FilePermissionService {
  /**
   * 检查用户是否有权限
   * @param {string} userId - 用户ID
   * @param {string} resourceType - 资源类型 (file|folder)
   * @param {string} resourceId - 资源ID
   * @param {string} requiredPermission - 需要的权限类型 (read|write|delete|admin)
   * @returns {Promise<boolean>}
   */
  async checkPermission(userId, resourceType, resourceId, requiredPermission = 'read') {
    try {
      // 权限等级：admin > delete > write > read
      const permissionHierarchy = { read: 1, write: 2, delete: 3, admin: 4 };
      const requiredLevel = permissionHierarchy[requiredPermission] || 1;

      // 获取用户的有效权限（包括继承）
      const effectivePermissions = await this.getEffectivePermissions(userId, resourceType, resourceId);

      if (effectivePermissions.length === 0) {
        return false;
      }

      // 检查是否有足够的权限等级
      const hasPermission = effectivePermissions.some(perm => {
        const level = permissionHierarchy[perm] || 0;
        return level >= requiredLevel;
      });

      return hasPermission;
    } catch (error) {
      logger.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * 获取用户对资源的有效权限（包括继承）
   * @param {string} userId - 用户ID
   * @param {string} resourceType - 资源类型 (file|folder)
   * @param {string} resourceId - 资源ID
   * @returns {Promise<string[]>} 权限类型数组 (read|write|delete|admin)
   */
  async getEffectivePermissions(userId, resourceType, resourceId) {
    try {
      const permissions = new Set();

      // 获取用户的直接权限
      const userPermissions = await db.FilePermission.findAll({
        where: {
          resource_type: resourceType,
          resource_id: resourceId,
          user_id: userId,
        },
      });

      userPermissions.forEach(p => permissions.add(p.permission));

      // 获取用户角色
      const userRoles = await db.User.findOne({
        where: { id: userId },
        include: [{
          model: db.Role,
          as: 'roles',
          attributes: ['id'],
          through: { attributes: [] },
        }],
      });

      if (userRoles && userRoles.roles) {
        // 获取角色权限
        const rolePermissions = await db.FilePermission.findAll({
          where: {
            resource_type: resourceType,
            resource_id: resourceId,
            role_id: { [Op.in]: userRoles.roles.map(r => r.id) },
          },
        });

        rolePermissions.forEach(p => permissions.add(p.permission));
      }

      // 处理权限继承
      if (resourceType === 'file') {
        // 如果是文件，检查文件夹权限
        const file = await db.File.findOne({
          where: { id: resourceId },
          attributes: ['folder_id', 'inherit_permissions'],
        });

        if (file && file.inherit_permissions && file.folder_id) {
          const folderPermissions = await this.getEffectivePermissions(userId, 'folder', file.folder_id);
          folderPermissions.forEach(p => permissions.add(p));
        }
      } else if (resourceType === 'folder') {
        // 如果是文件夹，检查父文件夹权限
        const folder = await db.Folder.findOne({
          where: { id: resourceId },
          attributes: ['parent_id', 'inherit_permissions'],
        });

        if (folder && folder.inherit_permissions && folder.parent_id) {
          const parentPermissions = await this.getEffectivePermissions(userId, 'folder', folder.parent_id);
          parentPermissions.forEach(p => permissions.add(p));
        }
      }

      return Array.from(permissions);
    } catch (error) {
      logger.error('Error getting effective permissions:', error);
      return [];
    }
  }

  /**
   * 获取资源的所有权限列表
   * @param {string} resourceType - 资源类型 (file|folder)
   * @param {string} resourceId - 资源ID
   * @returns {Promise<Object[]>}
   */
  async getPermissions(resourceType, resourceId) {
    try {
      const permissions = await db.FilePermission.findAll({
        where: {
          resource_type: resourceType,
          resource_id: resourceId,
        },
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'username', 'real_name'],
          },
          {
            model: db.Role,
            as: 'role',
            attributes: ['id', 'code', 'name'],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      return permissions;
    } catch (error) {
      logger.error('Error getting permissions:', error);
      throw error;
    }
  }

  /**
   * 添加权限
   * @param {string} resourceType - 资源类型 (file|folder)
   * @param {string} resourceId - 资源ID
   * @param {string} userId - 用户ID (可选)
   * @param {string} roleId - 角色ID (可选)
   * @param {string} permission - 权限类型 (read|write|delete|admin)
   * @param {string} grantedBy - 授权人ID
   * @returns {Promise<Object>}
   */
  async addPermission(resourceType, resourceId, { userId, roleId, permission }, grantedBy) {
    try {
      // 验证 user_id 和 role_id 不能同时为空或同时存在
      if ((!userId && !roleId) || (userId && roleId)) {
        throw ApiError.badRequest('必须指定用户或角色，但不能同时指定');
      }

      // 检查权限是否已存在
      const existingPermission = await db.FilePermission.findOne({
        where: {
          resource_type: resourceType,
          resource_id: resourceId,
          ...(userId ? { user_id: userId } : { role_id: roleId }),
        },
      });

      if (existingPermission) {
        // 更新现有权限
        await existingPermission.update({ permission, granted_by: grantedBy });
        return existingPermission;
      }

      // 创建新权限
      const newPermission = await db.FilePermission.create({
        resource_type: resourceType,
        resource_id: resourceId,
        user_id: userId,
        role_id: roleId,
        permission,
        granted_by: grantedBy,
      });

      logger.info(`Permission added: ${resourceType} ${resourceId} - ${userId || roleId} - ${permission}`);

      return newPermission;
    } catch (error) {
      logger.error('Error adding permission:', error);
      throw error;
    }
  }

  /**
   * 删除权限
   * @param {string} permissionId - 权限ID
   * @returns {Promise<boolean>}
   */
  async deletePermission(permissionId) {
    try {
      const permission = await db.FilePermission.findOne({
        where: { id: permissionId },
      });

      if (!permission) {
        throw ApiError.notFound('权限不存在');
      }

      await permission.destroy();

      logger.info(`Permission deleted: ${permissionId}`);

      return true;
    } catch (error) {
      logger.error('Error deleting permission:', error);
      throw error;
    }
  }

  /**
   * 设置权限继承
   * @param {string} resourceType - 资源类型 (file|folder)
   * @param {string} resourceId - 资源ID
   * @param {boolean} inherit - 是否继承
   * @returns {Promise<Object>}
   */
  async setInheritPermissions(resourceType, resourceId, inherit) {
    try {
      let resource;

      if (resourceType === 'file') {
        resource = await db.File.findOne({ where: { id: resourceId } });
      } else if (resourceType === 'folder') {
        resource = await db.Folder.findOne({ where: { id: resourceId } });
      } else {
        throw ApiError.badRequest('无效的资源类型');
      }

      if (!resource) {
        throw ApiError.notFound('资源不存在');
      }

      await resource.update({ inherit_permissions: inherit });

      logger.info(`Permission inheritance set: ${resourceType} ${resourceId} - ${inherit}`);

      return resource;
    } catch (error) {
      logger.error('Error setting inherit permissions:', error);
      throw error;
    }
  }

  /**
   * 删除资源时清理权限
   * @param {string} resourceType - 资源类型 (file|folder)
   * @param {string} resourceId - 资源ID
   * @returns {Promise<number>}
   */
  async deleteResourcePermissions(resourceType, resourceId) {
    try {
      const count = await db.FilePermission.destroy({
        where: {
          resource_type: resourceType,
          resource_id: resourceId,
        },
      });

      logger.info(`Permissions deleted: ${resourceType} ${resourceId} - ${count} permissions`);

      return count;
    } catch (error) {
      logger.error('Error deleting resource permissions:', error);
      throw error;
    }
  }

  /**
   * 为新创建的资源添加默认权限
   * @param {string} resourceType - 资源类型 (file|folder)
   * @param {string} resourceId - 资源ID
   * @param {string} creatorId - 创建者ID
   * @returns {Promise<void>}
   */
  async setDefaultPermissions(resourceType, resourceId, creatorId) {
    try {
      // 添加创建者的admin权限
      await this.addPermission(
        resourceType,
        resourceId,
        { userId: creatorId, permission: 'admin' },
        creatorId
      );

      // 获取super_admin和admin角色
      const adminRoles = await db.Role.findAll({
        where: { code: { [Op.in]: ['super_admin', 'admin'] } },
      });

      // 为admin角色添加权限
      for (const role of adminRoles) {
        await this.addPermission(
          resourceType,
          resourceId,
          { roleId: role.id, permission: 'admin' },
          creatorId
        );
      }

      logger.info(`Default permissions set: ${resourceType} ${resourceId}`);
    } catch (error) {
      logger.error('Error setting default permissions:', error);
      // 不抛出错误，避免影响资源创建
    }
  }
}

module.exports = new FilePermissionService();
