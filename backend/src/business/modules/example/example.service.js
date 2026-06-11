const { Op } = require('sequelize');
const db = require('../../../models');
const ApiError = require('../../../utils/ApiError');

/**
 * 获取列表
 */
async function getList({ page = 1, pageSize = 10, keyword = '' }) {
  const where = {};

  if (keyword.trim()) {
    where.title = { [Op.iLike]: `%${keyword}%` };
  }

  const offset = (page - 1) * pageSize;

  const { count, rows } = await db.sequelize.models.example
    ? await db.sequelize.models.example.findAndCountAll({ where, limit: pageSize, offset, order: [['created_at', 'DESC']] })
    : { count: 0, rows: [] };

  return { rows, total: count, page, pageSize };
}

/**
 * 获取详情
 */
async function getById(id) {
  const item = await db.sequelize.models.example?.findByPk(id);
  if (!item) throw new ApiError(404, '记录不存在');
  return item;
}

/**
 * 创建
 */
async function create(data) {
  return await db.sequelize.models.example?.create(data);
}

/**
 * 更新
 */
async function update(id, data) {
  const item = await getById(id);
  await item.update(data);
  return item;
}

/**
 * 删除
 */
async function deleteById(id) {
  const item = await getById(id);
  await item.destroy();
}

module.exports = { getList, getById, create, update, delete: deleteById };
