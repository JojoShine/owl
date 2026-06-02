const { logger, sensitiveDataLogger } = require('../config/logger');
const db = require('../models');
const { maskValue } = require('../utils/mask.util');

/**
 * 数据脱敏中间件
 * 自动拦截响应数据，对敏感字段进行脱敏处理
 */
const dataMaskingMiddleware = () => {
  return async (req, res, next) => {
    // 保存原始的 json 方法
    const originalJson = res.json;

    // 重写 json 方法
    res.json = function(data) {
      // 如果是成功响应且包含数据
      if (data && data.success && data.data) {
        handleDataMasking(req, res, data, originalJson);
      } else {
        // 其他情况直接返回
        originalJson.call(this, data);
      }
    };

    next();
  };
};

/**
 * 处理数据脱敏
 */
async function handleDataMasking(req, res, responseData, originalJson) {
  try {
    const { data } = responseData;
    const userId = req.user?.id;
    
    // 如果没有用户信息，直接返回（公开接口）
    if (!userId) {
      originalJson.call(res, responseData);
      return;
    }

    // 检测表名（从请求路径中提取）
    const tableName = detectTableName(req);
    
    if (!tableName) {
      // 无法检测表名，直接返回
      originalJson.call(res, responseData);
      return;
    }

    // 获取该表的敏感字段配置
    const sensitiveFields = await getSensitiveFields(tableName);
    
    if (sensitiveFields.length === 0) {
      // 没有敏感字段，直接返回
      originalJson.call(res, responseData);
      return;
    }

    // 执行脱敏
    const maskedData = maskData(data, sensitiveFields);
    
    // 记录访问日志
    logAccess(req, userId, tableName, sensitiveFields);

    // 返回脱敏后的数据
    responseData.data = maskedData;
    originalJson.call(res, responseData);

  } catch (error) {
    // 如果脱敏过程出错，记录错误但返回原始数据（避免影响业务）
    logger.error('数据脱敏失败:', error);
    originalJson.call(res, responseData);
  }
}

/**
 * 检测表名
 * 从请求路径中提取表名，例如：
 * /api/system/users -> owl_users
 * /api/system/roles -> owl_roles
 */
function detectTableName(req) {
  const path = req.path;
  
  // 匹配 /api/system/{resource} 格式
  const match = path.match(/\/api\/system\/([a-z]+)/i);
  if (match && match[1]) {
    const resource = match[1];
    // 转换为表名格式
    return `owl_${resource}`;
  }
  
  return null;
}

/**
 * 获取敏感字段配置
 */
async function getSensitiveFields(tableName) {
  // 从数据库查询
  const fields = await db.SensitiveField.findAll({
    where: {
      table_name: tableName,
      is_active: true
    },
    attributes: ['field_name', 'mask_type', 'mask_rule']
  });

  return fields.map(f => ({
    field_name: f.field_name,
    mask_type: f.mask_type,
    mask_rule: f.mask_rule
  }));
}

/**
 * 对数据进行脱敏处理
 */
function maskData(data, sensitiveFields) {
  if (!data) return data;

  // 处理数组
  if (Array.isArray(data)) {
    return data.map(item => maskObject(item, sensitiveFields));
  }

  // 处理对象
  return maskObject(data, sensitiveFields);
}

/**
 * 对单个对象进行脱敏
 */
function maskObject(obj, sensitiveFields) {
  if (!obj || typeof obj !== 'object') return obj;

  const maskedObj = { ...obj };

  sensitiveFields.forEach(field => {
    const fieldName = field.field_name;
    
    // 如果字段存在且不为空，执行脱敏
    if (maskedObj.hasOwnProperty(fieldName) && maskedObj[fieldName] != null) {
      maskedObj[fieldName] = maskValue(
        maskedObj[fieldName],
        field.mask_type,
        field.mask_rule
      );
    }
  });

  return maskedObj;
}

/**
 * 记录访问日志
 */
function logAccess(req, userId, tableName, sensitiveFields) {
  sensitiveFields.forEach(field => {
    sensitiveDataLogger.info('敏感数据访问', {
      user_id: userId,
      username: req.user?.username,
      table_name: tableName,
      field_name: field.field_name,
      access_type: 'masked',
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      action: 'view_masked_data'
    });
  });
}

module.exports = dataMaskingMiddleware;
