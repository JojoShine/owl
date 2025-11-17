const Joi = require('joi');
const ApiError = require('../utils/ApiError');

/**
 * 请求验证中间件
 * @param {Object} schema - Joi验证schema对象 { body, query, params }
 * @returns {Function} Express中间件函数
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validSchema = {};
    ['params', 'query', 'body'].forEach((key) => {
      if (schema[key]) {
        validSchema[key] = req[key];
      }
    });

    const schemaObject = Joi.object(schema);
    const { value, error } = schemaObject.validate(validSchema, {
      abortEarly: false, // 返回所有错误，不只是第一个
      allowUnknown: false, // 不允许未知字段
      stripUnknown: true, // 移除未知字段
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      return next(ApiError.validationError(errorMessage, error.details));
    }

    // 将验证后的值覆盖原始值
    Object.assign(req, value);
    return next();
  };
};

module.exports = validate;