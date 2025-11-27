const express = require('express');
const router = express.Router();
const executorController = require('./api-builder-executor.controller');
const authService = require('./api-builder-auth.service');
const apiBuilderService = require('./api-builder.service');
const ApiError = require('../../utils/ApiError');
const { authenticate } = require('../../middlewares/auth');
const { logger } = require('../../config/logger');

/**
 * 动态API鉴权中间件
 * 验证API密钥（如果接口需要的话）
 */
const apiKeyMiddleware = async (req, res, next) => {
  try {
    // 提取API密钥
    const apiKey = authService.extractApiKey(req);

    if (apiKey) {
      try {
        // 验证API密钥
        const apiKeyRecord = await apiBuilderService.verifyApiKey(apiKey);
        req.apiKey = apiKey;
        req.apiKeyRecord = apiKeyRecord;
      } catch (error) {
        // 如果密钥无效，但接口可能不需要认证，继续执行
        // 后续会在executeCustomApi中再次检查是否需要认证
        logger.warn('Invalid API key provided:', error.message);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// 应用API密钥中间件
router.use(apiKeyMiddleware);

/**
 * 测试接口
 * POST /api/api-builder/:id/test
 * 需要登录用户
 */
router.post(
  '/test/:id',
  authenticate,
  (req, res) => executorController.testInterface(req, res)
);

/**
 * 动态API端点
 * GET/POST/PUT/DELETE /api/custom/:endpoint?version=1
 * 不需要登录，但可能需要API密钥
 */
router.get(
  '/custom/:endpoint',
  (req, res) => executorController.executeCustomApi(req, res)
);

router.post(
  '/custom/:endpoint',
  (req, res) => executorController.executeCustomApi(req, res)
);

router.put(
  '/custom/:endpoint',
  (req, res) => executorController.executeCustomApi(req, res)
);

router.delete(
  '/custom/:endpoint',
  (req, res) => executorController.executeCustomApi(req, res)
);

module.exports = router;