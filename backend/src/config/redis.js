const redis = require('redis');
const { logger } = require('./logger');

// Redis 可用性状态标志
let isAvailable = false;
let connectionAttempted = false;

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    reconnectStrategy: () => {
      // 禁用自动重连，避免不断打印错误日志
      return false;
    },
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  // 首次连接失败时记录 warn，后续错误静默处理
  if (!connectionAttempted) {
    logger.warn('Redis 连接失败，将使用内存存储');
    logger.debug('Redis 错误详情:', err.message);
    connectionAttempted = true;
  }
  isAvailable = false;
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
  isAvailable = true;
  connectionAttempted = true;
});

redisClient.on('end', () => {
  if (isAvailable) {
    logger.warn('Redis Client Disconnected');
  }
  isAvailable = false;
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    isAvailable = true;
    logger.info('Redis 连接成功');
  } catch (error) {
    isAvailable = false;
    logger.warn('Redis 连接失败，系统将使用内存存储作为备选方案:', error.message);
    logger.warn('如需使用 Redis，请检查配置：REDIS_HOST, REDIS_PORT, REDIS_PASSWORD');
  }
};

/**
 * 检查 Redis 是否可用
 * @returns {boolean}
 */
const isRedisAvailable = () => {
  return isAvailable && redisClient.isOpen;
};

module.exports = {
  redisClient,
  connectRedis,
  isRedisAvailable,
};