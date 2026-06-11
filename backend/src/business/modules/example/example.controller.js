const exampleService = require('./example.service');
const { logger } = require('../../../config/logger');
const { success, paginated, created } = require('../../../utils/response');

/**
 * 获取列表
 */
exports.getList = async (req, res, next) => {
  try {
    const { page, pageSize, keyword } = req.query;

    const result = await exampleService.getList({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 10,
      keyword: keyword || '',
    });

    paginated(res, result.rows, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (error) {
    logger.error('获取列表失败:', error);
    next(error);
  }
};

/**
 * 获取详情
 */
exports.getDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await exampleService.getById(id);
    success(res, item);
  } catch (error) {
    logger.error('获取详情失败:', error);
    next(error);
  }
};

/**
 * 创建
 */
exports.create = async (req, res, next) => {
  try {
    const item = await exampleService.create(req.body);
    created(res, item, '创建成功');
  } catch (error) {
    logger.error('创建失败:', error);
    next(error);
  }
};

/**
 * 更新
 */
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await exampleService.update(id, req.body);
    success(res, item, '更新成功');
  } catch (error) {
    logger.error('更新失败:', error);
    next(error);
  }
};

/**
 * 删除
 */
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    await exampleService.delete(id);
    success(res, null, '删除成功');
  } catch (error) {
    logger.error('删除失败:', error);
    next(error);
  }
};
