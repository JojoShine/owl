const filePermissionService = require('./file-permission.service');
const { logger } = require('../../config/logger');
const ApiError = require('../../utils/ApiError');

class FilePermissionController {
  /**
   * 获取文件权限列表
   * GET /files/:id/permissions
   */
  async getFilePermissions(req, res, next) {
    try {
      const { id } = req.params;
      const permissions = await filePermissionService.getPermissions('file', id);

      return res.json({
        code: 200,
        message: '获取成功',
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取文件夹权限列表
   * GET /folders/:id/permissions
   */
  async getFolderPermissions(req, res, next) {
    try {
      const { id } = req.params;
      const permissions = await filePermissionService.getPermissions('folder', id);

      return res.json({
        code: 200,
        message: '获取成功',
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加文件权限
   * POST /files/:id/permissions
   * Body: { userId?: string, roleId?: string, permission: 'read'|'write'|'delete'|'admin' }
   */
  async addFilePermission(req, res, next) {
    try {
      const { id } = req.params;
      const { userId, roleId, permission } = req.body;
      const currentUserId = req.user.id;

      // 验证权限
      const hasAdminPermission = await filePermissionService.checkPermission(
        currentUserId,
        'file',
        id,
        'admin'
      );

      if (!hasAdminPermission) {
        throw ApiError.forbidden('您没有权限管理此文件的权限');
      }

      const result = await filePermissionService.addPermission(
        'file',
        id,
        { userId, roleId, permission },
        currentUserId
      );

      return res.json({
        code: 201,
        message: '权限添加成功',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加文件夹权限
   * POST /folders/:id/permissions
   * Body: { userId?: string, roleId?: string, permission: 'read'|'write'|'delete'|'admin' }
   */
  async addFolderPermission(req, res, next) {
    try {
      const { id } = req.params;
      const { userId, roleId, permission } = req.body;
      const currentUserId = req.user.id;

      // 验证权限
      const hasAdminPermission = await filePermissionService.checkPermission(
        currentUserId,
        'folder',
        id,
        'admin'
      );

      if (!hasAdminPermission) {
        throw ApiError.forbidden('您没有权限管理此文件夹的权限');
      }

      const result = await filePermissionService.addPermission(
        'folder',
        id,
        { userId, roleId, permission },
        currentUserId
      );

      return res.json({
        code: 201,
        message: '权限添加成功',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除权限
   * DELETE /file-permissions/:id
   */
  async deletePermission(req, res, next) {
    try {
      const { id } = req.params;
      const currentUserId = req.user.id;

      // 获取权限信息
      const permission = await require('../../models').FilePermission.findOne({
        where: { id },
      });

      if (!permission) {
        throw ApiError.notFound('权限不存在');
      }

      // 验证删除权限：只有拥有该资源admin权限的用户才能删除
      const hasAdminPermission = await filePermissionService.checkPermission(
        currentUserId,
        permission.resource_type,
        permission.resource_id,
        'admin'
      );

      if (!hasAdminPermission) {
        throw ApiError.forbidden('您没有权限删除此权限');
      }

      await filePermissionService.deletePermission(id);

      return res.json({
        code: 200,
        message: '权限删除成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 设置文件权限继承
   * PUT /files/:id/inherit
   * Body: { inherit: boolean }
   */
  async setFileInherit(req, res, next) {
    try {
      const { id } = req.params;
      const { inherit } = req.body;
      const currentUserId = req.user.id;

      // 验证权限
      const hasAdminPermission = await filePermissionService.checkPermission(
        currentUserId,
        'file',
        id,
        'admin'
      );

      if (!hasAdminPermission) {
        throw ApiError.forbidden('您没有权限修改此文件的权限设置');
      }

      const result = await filePermissionService.setInheritPermissions('file', id, inherit);

      return res.json({
        code: 200,
        message: '权限继承设置成功',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 设置文件夹权限继承
   * PUT /folders/:id/inherit
   * Body: { inherit: boolean }
   */
  async setFolderInherit(req, res, next) {
    try {
      const { id } = req.params;
      const { inherit } = req.body;
      const currentUserId = req.user.id;

      // 验证权限
      const hasAdminPermission = await filePermissionService.checkPermission(
        currentUserId,
        'folder',
        id,
        'admin'
      );

      if (!hasAdminPermission) {
        throw ApiError.forbidden('您没有权限修改此文件夹的权限设置');
      }

      const result = await filePermissionService.setInheritPermissions('folder', id, inherit);

      return res.json({
        code: 200,
        message: '权限继承设置成功',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FilePermissionController();
