const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const db = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { Op } = require('sequelize');

/**
 * 生成唯一的API Key
 * 格式：key_时间戳_随机字符串
 */
function generateApiKey() {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = crypto.randomBytes(4).toString('hex');
  return `key_${timestamp}_${random}`;
}

/**
 * 生成32位随机的API Secret
 */
function generateApiSecret() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * 脱敏API Secret（显示前4位+****+后4位）
 */
function maskApiSecret(secret) {
  if (!secret || secret.length < 8) {
    return '****';
  }
  return `${secret.substring(0, 4)}****${secret.substring(secret.length - 4)}`;
}

/**
 * 列表查询
 */
async function listKeys({ page = 1, pageSize = 10, client_name = '', status = '' }) {
  const where = {};

  // 客户端名称模糊搜索
  if (client_name && client_name.trim()) {
    where.client_name = { [Op.iLike]: `%${client_name}%` };
  }

  // 状态筛选
  if (status && status.trim()) {
    where.status = status;
  }

  const offset = (page - 1) * pageSize;

  const { count, rows } = await db.ThirdPartyApiKey.findAndCountAll({
    where,
    offset,
    limit: pageSize,
    order: [['created_at', 'DESC']],
  });

  // 脱敏 api_secret
  const maskedRows = rows.map((row) => ({
    ...row.toJSON(),
    api_secret: maskApiSecret(row.api_secret),
  }));

  return {
    rows: maskedRows,
    total: count,
    page,
    pageSize,
  };
}

/**
 * 创建新密钥
 */
async function createKey({ client_name, description, expires_at, remark }, userId) {
  const api_key = generateApiKey();
  const api_secret = generateApiSecret();

  const key = await db.ThirdPartyApiKey.create({
    id: uuidv4(),
    api_key,
    api_secret,
    client_name,
    description: description || '',
    expires_at,
    remark: remark || '',
    status: 'active',
    created_by: userId,
  });

  // 返回完整的 api_secret（仅此一次）
  return {
    id: key.id,
    api_key: key.api_key,
    api_secret: key.api_secret, // 完整值
    client_name: key.client_name,
    status: key.status,
    created_at: key.created_at,
  };
}

/**
 * 更新密钥信息
 */
async function updateKey(id, { client_name, description, remark }) {
  const key = await db.ThirdPartyApiKey.findByPk(id);

  if (!key) {
    throw ApiError.notFound('密钥不存在');
  }

  // 不能修改 api_key 和 api_secret
  await key.update({
    client_name: client_name || key.client_name,
    description: description !== undefined ? description : key.description,
    remark: remark !== undefined ? remark : key.remark,
  });

  return key;
}

/**
 * 修改密钥状态
 */
async function changeStatus(id, status) {
  const key = await db.ThirdPartyApiKey.findByPk(id);

  if (!key) {
    throw ApiError.notFound('密钥不存在');
  }

  await key.update({ status });

  return key;
}

/**
 * 重新生成 API Secret
 */
async function regenerateSecret(id) {
  const key = await db.ThirdPartyApiKey.findByPk(id);

  if (!key) {
    throw ApiError.notFound('密钥不存在');
  }

  const newSecret = generateApiSecret();
  await key.update({ api_secret: newSecret });

  // 返回完整的新 secret（仅此一次）
  return {
    api_secret: newSecret,
  };
}

/**
 * 删除密钥
 */
async function deleteKey(id) {
  const key = await db.ThirdPartyApiKey.findByPk(id);

  if (!key) {
    throw ApiError.notFound('密钥不存在');
  }

  await key.destroy();

  return true;
}

module.exports = {
  listKeys,
  createKey,
  updateKey,
  changeStatus,
  regenerateSecret,
  deleteKey,
  generateApiKey,
  generateApiSecret,
  maskApiSecret,
};