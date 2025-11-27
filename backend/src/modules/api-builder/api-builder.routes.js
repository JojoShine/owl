const express = require('express');
const router = express.Router();
const controller = require('./api-builder.controller');
const {
  createInterfaceRules,
  updateInterfaceRules,
  createApiKeyRules,
  listInterfaceRules,
  handleValidationErrors,
} = require('./api-builder.validation');
const { authenticate } = require('../../middlewares/auth');
const { hasRole } = require('../../middlewares/permission');

// 所有路由都需要认证
router.use(authenticate);
// 只有管理员可以访问API Builder
router.use(hasRole('admin', 'super_admin'));

// 接口管理API
router.post(
  '/',
  createInterfaceRules(),
  handleValidationErrors,
  (req, res) => controller.createInterface(req, res)
);

router.get(
  '/',
  listInterfaceRules(),
  handleValidationErrors,
  (req, res) => controller.getInterfaces(req, res)
);

router.get(
  '/:id',
  (req, res) => controller.getInterface(req, res)
);

router.put(
  '/:id',
  updateInterfaceRules(),
  handleValidationErrors,
  (req, res) => controller.updateInterface(req, res)
);

router.delete(
  '/:id',
  (req, res) => controller.deleteInterface(req, res)
);

// API密钥管理API
router.post(
  '/:id/keys',
  createApiKeyRules(),
  handleValidationErrors,
  (req, res) => controller.createApiKey(req, res)
);

router.get(
  '/:id/keys',
  (req, res) => controller.getInterfaceKeys(req, res)
);

router.delete(
  '/keys/:keyId',
  (req, res) => controller.deleteApiKey(req, res)
);

router.post(
  '/keys/:keyId/regenerate',
  (req, res) => controller.regenerateApiKey(req, res)
);

// 测试SQL查询
router.post(
  '/test-sql',
  (req, res) => controller.testSql(req, res)
);

module.exports = router;