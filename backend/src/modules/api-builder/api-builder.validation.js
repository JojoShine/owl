const { body, query, validationResult } = require('express-validator');

const createInterfaceRules = () => [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('接口名称不能为空')
    .isLength({ max: 255 })
    .withMessage('接口名称最多255个字符'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('接口描述最多5000个字符'),
  body('sql_query')
    .trim()
    .notEmpty()
    .withMessage('SQL查询语句不能为空')
    .custom((value) => {
      // 只允许SELECT查询
      const upperValue = value.trim().toUpperCase();
      if (!upperValue.startsWith('SELECT')) {
        throw new Error('只支持SELECT查询');
      }
      return true;
    }),
  body('method')
    .optional()
    .isIn(['GET', 'POST', 'PUT', 'DELETE'])
    .withMessage('请求方式只能是 GET、POST、PUT 或 DELETE'),
  body('endpoint')
    .trim()
    .notEmpty()
    .withMessage('接口端点不能为空')
    .isLength({ max: 255 })
    .withMessage('接口端点最多255个字符')
    .matches(/^\/[a-zA-Z0-9_\/-]*$/)
    .withMessage('接口端点格式不正确，必须以/开头'),
  body('version')
    .optional()
    .isInt({ min: 1 })
    .withMessage('版本号必须是正整数'),
  body('parameters')
    .optional()
    .isArray()
    .withMessage('参数定义必须是数组'),
  body('require_auth')
    .optional()
    .isBoolean()
    .withMessage('认证标记必须是布尔值'),
  body('rate_limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('限流值必须是正整数'),
];

const updateInterfaceRules = () => [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('接口名称不能为空')
    .isLength({ max: 255 })
    .withMessage('接口名称最多255个字符'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('接口描述最多5000个字符'),
  body('sql_query')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('SQL查询语句不能为空')
    .custom((value) => {
      const upperValue = value.trim().toUpperCase();
      if (!upperValue.startsWith('SELECT')) {
        throw new Error('只支持SELECT查询');
      }
      return true;
    }),
  body('method')
    .optional()
    .isIn(['GET', 'POST', 'PUT', 'DELETE'])
    .withMessage('请求方式只能是 GET、POST、PUT 或 DELETE'),
  body('endpoint')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('接口端点不能为空')
    .isLength({ max: 255 })
    .withMessage('接口端点最多255个字符')
    .matches(/^\/[a-zA-Z0-9_\/-]*$/)
    .withMessage('接口端点格式不正确'),
  body('version')
    .optional()
    .isInt({ min: 1 })
    .withMessage('版本号必须是正整数'),
  body('parameters')
    .optional()
    .isArray()
    .withMessage('参数定义必须是数组'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('状态只能是 active 或 inactive'),
  body('require_auth')
    .optional()
    .isBoolean()
    .withMessage('认证标记必须是布尔值'),
  body('rate_limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('限流值必须是正整数'),
];

const createApiKeyRules = () => [
  body('app_name')
    .trim()
    .notEmpty()
    .withMessage('应用名称不能为空')
    .isLength({ max: 255 })
    .withMessage('应用名称最多255个字符'),
];

const listInterfaceRules = () => [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是正整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('搜索关键词最多100个字符'),
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('状态只能是 active 或 inactive'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '参数验证失败',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  createInterfaceRules,
  updateInterfaceRules,
  createApiKeyRules,
  listInterfaceRules,
  handleValidationErrors,
};