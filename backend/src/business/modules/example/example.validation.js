const Joi = require('joi');

/**
 * 列表查询验证
 */
exports.getList = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10),
    keyword: Joi.string().allow('').optional(),
  }),
};

/**
 * 创建验证
 */
exports.create = {
  body: Joi.object({
    title: Joi.string().required().max(100).messages({
      'string.empty': '标题不能为空',
      'any.required': '标题必填',
    }),
    content: Joi.string().allow('').optional(),
    status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
  }).required(),
};

/**
 * 更新验证
 */
exports.update = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }).required(),
  body: Joi.object({
    title: Joi.string().max(100).optional(),
    content: Joi.string().allow('').optional(),
    status: Joi.string().valid('draft', 'published', 'archived').optional(),
  }).required(),
};

/**
 * ID 参数验证
 */
exports.idParam = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'ID格式不正确',
      'any.required': 'ID必填',
    }),
  }).required(),
};
