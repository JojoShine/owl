require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { logger } = require('./config/logger');
const { connectRedis } = require('./config/redis');
const { ensureBucketExists } = require('./config/minio');
const { errorHandler, notFound } = require('./middlewares/error');
const {
  accessLogMiddleware,
  operationLogMiddleware,
} = require('./middlewares/requestLogger');

const app = express();

// 基础中间件
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志中间件
app.use(accessLogMiddleware);
app.use(operationLogMiddleware);

// 限流（排除特定接口）
const isProduction = process.env.NODE_ENV === 'production';
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || (isProduction ? 15 * 60 * 1000 : 60 * 60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_MAX) || (isProduction ? 100 : 1000),
  message: '请求过于频繁，请稍后再试',
  skip: (req) => {
    // 排除以下接口不受限流影响：
    // - 监控接口（需要高频轮询）
    // - 健康检查接口
    // - 验证码接口（登录页面需要频繁刷新）
    // - 认证接口（登录、注册等）
    // - 仪表板接口（需要频繁刷新）
    // - 文件接口（文件操作可能较多）
    const excludedPaths = [
      '/api/monitor',
      '/api/health',
      '/api/captcha',
      '/api/auth/login',
      '/api/auth/register',
      '/api/dashboard',
      '/api/files',
      '/api/folders',
    ];

    return excludedPaths.some(path => req.path.startsWith(path));
  },
});
app.use('/api/', limiter);

// 导入路由
const apiRoutes = require('./routes');

// 健康检查（全局，不在/api下）
const { success } = require('./utils/response');
app.get('/health', (req, res) => {
  success(res, { status: 'ok' }, 'Server is running');
});

// API路由（所有业务路由都在 /api 下）
app.use('/api', apiRoutes);

// 错误处理
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

// 启动服务器
const startServer = async () => {
  try {
    // 尝试连接Redis（可选，连接失败不影响应用启动）
    await connectRedis();

    // 连接数据库
    const db = require('./models');
    await db.sequelize.authenticate();
    logger.info('Database connected successfully');

    // 初始化 Minio bucket
    await ensureBucketExists();

    // 初始化接口监控定时任务
    const apiMonitorService = require('./modules/monitor/api-monitor.service');
    await apiMonitorService.initializeScheduledJobs();

    // 启动告警检查定时任务
    const alertService = require('./modules/monitor/alert.service');
    alertService.startAlertCheckJob();

    // 创建HTTP服务器（用于Socket.io）
    const http = require('http');
    const server = http.createServer(app);

    // 初始化Socket.io服务
    const socketService = require('./modules/notification/socket.service');
    socketService.initialize(server);

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API URL: http://localhost:${PORT}/api`);
      logger.info(`WebSocket URL: ws://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;