const folderService = require('./folder.service');
const { success, paginated, list } = require('../../utils/response');

class FolderController {
  /**
   * 获取文件夹列表
   * GET /api/folders
   */
  async getFolders(req, res, next) {
    try {
      const result = await folderService.getFolders(req.query, req.user.id);
      paginated(res, result.data, result.pagination, '获取文件夹列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取文件夹树
   * GET /api/folders/tree
   */
  async getFolderTree(req, res, next) {
    try {
      const tree = await folderService.getFolderTree(req.user.id);
      list(res, tree, '获取文件夹树成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取文件夹详情
   * GET /api/folders/:id
   */
  async getFolderById(req, res, next) {
    try {
      const folder = await folderService.getFolderById(req.params.id, req.user.id);
      success(res, folder, '获取文件夹详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取文件夹内容（子文件夹 + 文件）
   * GET /api/folders/:id/contents
   */
  async getFolderContents(req, res, next) {
    try {
      const contents = await folderService.getFolderContents(
        req.params.id,
        req.user.id,
        req.query
      );
      success(res, contents, '获取文件夹内容成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建文件夹
   * POST /api/folders
   */
  async createFolder(req, res, next) {
    try {
      const folder = await folderService.createFolder(req.body, req.user.id);
      success(res, folder, '创建文件夹成功', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新文件夹
   * PUT /api/folders/:id
   */
  async updateFolder(req, res, next) {
    try {
      const folder = await folderService.updateFolder(
        req.params.id,
        req.body,
        req.user.id
      );
      success(res, folder, '更新文件夹成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除文件夹
   * DELETE /api/folders/:id
   */
  async deleteFolder(req, res, next) {
    try {
      const result = await folderService.deleteFolder(req.params.id, req.user.id);
      success(res, result, '删除文件夹成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FolderController();
