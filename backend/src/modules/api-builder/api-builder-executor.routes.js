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
 * 获取测试接口路由
 * POST /api-builder/test/:id
 * 需要登录用户
 */
const getTestRoutes = () => {
  const testRouter = express.Router();

  testRouter.post(
    '/test/:id',
    authenticate,
    (req, res) => executorController.testInterface(req, res)
  );

  return testRouter;
};

/**
 * 可选的认证中间件
 * 尝试进行认证，但不强制要求
 * 让执行器根据接口的require_auth字段来决定是否真正需要认证
 */
const optionalAuthenticate = (req, res, next) => {
  // 如果提供了token，就进行认证
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    // 调用authenticate中间件进行认证
    authenticate(req, res, (err) => {
      if (err) {
        // 认证失败，但不阻止请求继续
        // 让执行器在后面检查是否真正需要认证
        logger.warn('Optional authentication failed:', err.message);
      }
      next();
    });
  } else {
    // 没有token就继续，让执行器在后面处理
    next();
  }
};

/**
 * 获取动态API路由
 * GET/POST/PUT/DELETE /custom/*?version=1
 * JWT token认证可选（如果接口设置了require_auth=true才强制要求）
 * 支持多级路径，例如 /custom/users/active, /custom/orders/list 等
 */
const getCustomRoutes = () => {
  const customRouter = express.Router();

  // 应用可选的认证中间件（尝试认证，但不强制）
  customRouter.use(optionalAuthenticate);

  customRouter.get(
    '/custom/*',
    (req, res) => executorController.executeCustomApi(req, res)
  );

  customRouter.post(
    '/custom/*',
    (req, res) => executorController.executeCustomApi(req, res)
  );

  customRouter.put(
    '/custom/*',
    (req, res) => executorController.executeCustomApi(req, res)
  );

  customRouter.delete(
    '/custom/*',
    (req, res) => executorController.executeCustomApi(req, res)
  );

  return customRouter;
};

module.exports = {
  getTestRoutes,
  getCustomRoutes,
  // 保持向后兼容性
  default: router,
};