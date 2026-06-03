const express = require("express");
const router = express.Router();
const dataSecurityController = require("./data-security.controller");
const { authenticate } = require("../../../middlewares/auth");
const { checkPermission } = require("../../../middlewares/permission");
const validate = require("../../../middlewares/validate");
const validation = require("./data-security.validation");

/**
 * @route GET /api/system/data-security/fields
 * @desc 获取敏感字段列表
 * @access Private - 需要 sensitive_field:read 权限
 */
router.get(
  "/fields",
  authenticate,
  checkPermission("sensitive-field", "read"),
  validate(validation.getSensitiveFields),
  dataSecurityController.getSensitiveFields,
);

/**
 * @route GET /api/system/data-security/fields/:id
 * @desc 获取敏感字段详情
 * @access Private - 需要 sensitive_field:read 权限
 */
router.get(
  "/fields/:id",
  authenticate,
  checkPermission("sensitive-field", "read"),
  validate(validation.getSensitiveFieldById),
  dataSecurityController.getSensitiveFieldById,
);

/**
 * @route POST /api/system/data-security/fields
 * @desc 创建敏感字段配置
 * @access Private - 需要 sensitive_field:create 权限
 */
router.post(
  "/fields",
  authenticate,
  checkPermission("sensitive_field", "create"),
  validate(validation.createSensitiveField),
  dataSecurityController.createSensitiveField,
);

/**
 * @route PUT /api/system/data-security/fields/:id
 * @desc 更新敏感字段配置
 * @access Private - 需要 sensitive_field:update 权限
 */
router.put(
  "/fields/:id",
  authenticate,
  checkPermission("sensitive_field", "update"),
  validate(validation.updateSensitiveField),
  dataSecurityController.updateSensitiveField,
);

/**
 * @route DELETE /api/system/data-security/fields/:id
 * @desc 删除敏感字段配置
 * @access Private - 需要 sensitive_field:delete 权限
 */
router.delete(
  "/fields/:id",
  authenticate,
  checkPermission("sensitive-field", "delete"),
  validate(validation.deleteSensitiveField),
  dataSecurityController.deleteSensitiveField,
);

/**
 * @route POST /api/system/data-security/fields/import
 * @desc 批量导入敏感字段配置
 * @access Private - 需要 sensitive_field:create 权限
 */
router.post(
  "/fields/import",
  authenticate,
  checkPermission("sensitive-field", "create"),
  validate(validation.batchImportSensitiveFields),
  dataSecurityController.batchImportSensitiveFields,
);

/**
 * @route POST /api/system/data-security/validate-password
 * @desc 验证密码（用于前端测试）
 * @access Private
 */
router.post(
  "/validate-password",
  authenticate,
  validate(validation.validatePassword),
  dataSecurityController.validatePassword,
);

/**
 * @route POST /api/system/data-security/request-plain-access
 * @desc 申请明文访问权限
 * @access Private
 */
router.post(
  "/request-plain-access",
  authenticate,
  validate(validation.requestPlainAccess),
  dataSecurityController.requestPlainAccess,
);

/**
 * @route GET /api/system/data-security/check-permission
 * @desc 检查明文访问权限
 * @access Private
 */
router.get(
  "/check-permission",
  authenticate,
  validate(validation.checkPlainAccessPermission),
  dataSecurityController.checkPlainAccessPermission,
);

/**
 * @route GET /api/system/data-security/statistics
 * @desc 获取统计信息
 * @access Private - 需要 sensitive_field:read 权限
 */
router.get(
  "/statistics",
  authenticate,
  checkPermission("sensitive-field", "read"),
  dataSecurityController.getStatistics,
);

module.exports = router;
