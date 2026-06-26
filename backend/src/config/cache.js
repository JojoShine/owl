const Redis = require('ioredis');
const crypto = require('crypto');
const { logger } = require('./logger');

// Redis 客户端初始化
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  keyPrefix: 'owl:cache:',
  connectTimeout: 3000, // 连接超时 3 秒
  commandTimeout: 1000, // 命令超时 1 秒
  retryStrategy: (times) => {
    if (times > 3) return null; // 重试3次后放弃
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  logger.error('Redis 连接错误:', err);
});

redis.on('connect', () => {
  logger.info('Redis 缓存已连接');
});

// 模型 TTL 配置（秒）
const MODEL_TTL_CONFIG = {
  User: 600,           // 10 分钟
  Role: 600,
  Permission: 600,
  Menu: 600,
  SystemConfig: 300,   // 5 分钟
  WatermarkConfig: 300,
  Dictionary: 300,
  Department: 300,
  DEFAULT: 180,        // 3 分钟（默认）
};

// 生成缓存键
function generateCacheKey(modelName, options) {
  const optionsStr = JSON.stringify(options || {});
  const hash = crypto.createHash('md5').update(optionsStr).digest('hex').substring(0, 8);
  return `${modelName}:${hash}`;
}

// 获取模型的 TTL
function getModelTTL(modelName) {
  return MODEL_TTL_CONFIG[modelName] || MODEL_TTL_CONFIG.DEFAULT;
}

// 递归重建 Sequelize 实例（包括关联数据）
function rebuildInstance(Model, data, sequelize, depth = 0) {
  if (!data) return null;
  if (depth > 3) return Model.build(data, { isNewRecord: false, raw: false }); // 防止过深递归

  try {
    const instance = Model.build(data, { isNewRecord: false, raw: false });

    // 处理关联数据
    if (Model.associations) {
      Object.keys(Model.associations).forEach(associationName => {
        const association = Model.associations[associationName];
        const associatedData = data[associationName];

        if (associatedData !== undefined && associatedData !== null) {
          const AssociatedModel = association.target;

          if (Array.isArray(associatedData)) {
            // 一对多或多对多关联 - 递归处理
            instance.dataValues[associationName] = associatedData.map(item =>
              rebuildInstance(AssociatedModel, item, sequelize, depth + 1)
            );
            instance[associationName] = instance.dataValues[associationName];
          } else {
            // 一对一关联 - 递归处理
            const rebuiltAssociation = rebuildInstance(AssociatedModel, associatedData, sequelize, depth + 1);
            instance.dataValues[associationName] = rebuiltAssociation;
            instance[associationName] = rebuiltAssociation;
          }
        }
      });
    }

    return instance;
  } catch (err) {
    logger.warn(`重建实例失败 (depth=${depth}): ${err.message}`);
    // 降级：返回简单构建的实例
    return Model.build(data, { isNewRecord: false, raw: false });
  }
}

// 包装 Sequelize 模型的查询方法
function wrapModelWithCache(Model) {
  const modelName = Model.name;

  // 保存原始方法
  const originalFindAll = Model.findAll;
  const originalFindOne = Model.findOne;
  const originalFindByPk = Model.findByPk;
  const originalFindAndCountAll = Model.findAndCountAll;
  const originalCount = Model.count;

  // 包装 findAll
  Model.findAll = async function(options = {}) {
    const cacheKey = generateCacheKey(modelName, options);

    try {
      // 尝试从缓存获取
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[Cache HIT] ${modelName} - ${cacheKey}`);
        const data = JSON.parse(cached);
        // 将普通对象转换回 Sequelize 实例（包括关联）
        return data.map(item => rebuildInstance(Model, item, this.sequelize));
      }

      console.log(`[Cache MISS] ${modelName} - ${cacheKey}`);
    } catch (err) {
      logger.warn(`缓存读取失败: ${err.message}`);
    }

    // 执行原始查询
    const result = await originalFindAll.call(this, options);

    // 保存到缓存（转为普通对象）
    try {
      const ttl = getModelTTL(modelName);
      const plainData = Array.isArray(result)
        ? result.map(item => item.get({ plain: true }))
        : [];
      await redis.setex(cacheKey, ttl, JSON.stringify(plainData));
      console.log(`[Cache SET] ${modelName} - ${cacheKey} (TTL: ${ttl}s)`);
    } catch (err) {
      logger.warn(`缓存写入失败: ${err.message}`);
    }

    return result;
  };

  // 包装 findOne
  Model.findOne = async function(options = {}) {
    const cacheKey = generateCacheKey(modelName, options);

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[Cache HIT] ${modelName} - ${cacheKey}`);
        const data = JSON.parse(cached);
        // null 直接返回，否则转换为实例（包括关联）
        return data ? rebuildInstance(Model, data, this.sequelize) : null;
      }
      console.log(`[Cache MISS] ${modelName} - ${cacheKey}`);
    } catch (err) {
      logger.warn(`缓存读取失败: ${err.message}`);
    }

    const result = await originalFindOne.call(this, options);

    try {
      const ttl = getModelTTL(modelName);
      const plainData = result ? result.get({ plain: true }) : null;
      await redis.setex(cacheKey, ttl, JSON.stringify(plainData));
      console.log(`[Cache SET] ${modelName} - ${cacheKey} (TTL: ${ttl}s)`);
    } catch (err) {
      logger.warn(`缓存写入失败: ${err.message}`);
    }

    return result;
  };

  // 包装 findByPk
  Model.findByPk = async function(pk, options = {}) {
    const cacheKey = generateCacheKey(modelName, { pk, ...options });

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[Cache HIT] ${modelName} - ${cacheKey}`);
        const data = JSON.parse(cached);
        return data ? rebuildInstance(Model, data, this.sequelize) : null;
      }
      console.log(`[Cache MISS] ${modelName} - ${cacheKey}`);
    } catch (err) {
      logger.warn(`缓存读取失败: ${err.message}`);
    }

    const result = await originalFindByPk.call(this, pk, options);

    try {
      const ttl = getModelTTL(modelName);
      const plainData = result ? result.get({ plain: true }) : null;
      await redis.setex(cacheKey, ttl, JSON.stringify(plainData));
      console.log(`[Cache SET] ${modelName} - ${cacheKey} (TTL: ${ttl}s)`);
    } catch (err) {
      logger.warn(`缓存写入失败: ${err.message}`);
    }

    return result;
  };

  // 包装 findAndCountAll
  Model.findAndCountAll = async function(options = {}) {
    const cacheKey = generateCacheKey(modelName, options);

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[Cache HIT] ${modelName} - ${cacheKey}`);
        const data = JSON.parse(cached);
        // 将 rows 数组转换回 Sequelize 实例（包括关联）
        return {
          count: data.count,
          rows: data.rows.map(item => rebuildInstance(Model, item, this.sequelize))
        };
      }
      console.log(`[Cache MISS] ${modelName} - ${cacheKey}`);
    } catch (err) {
      logger.warn(`缓存读取失败: ${err.message}`);
    }

    const result = await originalFindAndCountAll.call(this, options);

    try {
      const ttl = getModelTTL(modelName);
      const plainData = {
        count: result.count || 0,
        rows: Array.isArray(result.rows)
          ? result.rows.map(item => item.get({ plain: true }))
          : []
      };
      await redis.setex(cacheKey, ttl, JSON.stringify(plainData));
      console.log(`[Cache SET] ${modelName} - ${cacheKey} (TTL: ${ttl}s)`);
    } catch (err) {
      logger.warn(`缓存写入失败: ${err.message}`);
    }

    return result;
  };

  // 包装 count
  Model.count = async function(options = {}) {
    const cacheKey = generateCacheKey(modelName, options);

    try {
      // 添加超时保护，避免 Redis 慢查询阻塞
      const cached = await Promise.race([
        redis.get(cacheKey),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Cache timeout')), 500))
      ]);

      if (cached) {
        console.log(`[Cache HIT] ${modelName} - ${cacheKey}`);
        return JSON.parse(cached);
      }
      console.log(`[Cache MISS] ${modelName} - ${cacheKey}`);
    } catch (err) {
      if (err.message !== 'Cache timeout') {
        logger.warn(`缓存读取失败: ${err.message}`);
      }
      // 超时或失败时直接查询数据库
    }

    const result = await originalCount.call(this, options);

    try {
      const ttl = getModelTTL(modelName);
      // 异步写入缓存，不阻塞响应
      redis.setex(cacheKey, ttl, JSON.stringify(result)).catch(err => {
        logger.warn(`缓存写入失败: ${err.message}`);
      });
      console.log(`[Cache SET] ${modelName} - ${cacheKey} (TTL: ${ttl}s)`);
    } catch (err) {
      logger.warn(`缓存写入失败: ${err.message}`);
    }

    return result;
  };

  // 添加缓存清除钩子
  Model.addHook('afterCreate', async () => {
    await clearModelCache(modelName);
  });

  Model.addHook('afterUpdate', async () => {
    await clearModelCache(modelName);
  });

  Model.addHook('afterDestroy', async () => {
    await clearModelCache(modelName);
  });
}

// 清除模型的所有缓存
async function clearModelCache(modelName) {
  try {
    const pattern = `owl:cache:${modelName}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[Cache CLEAR] ${modelName} - ${keys.length} keys`);
    }
  } catch (err) {
    logger.warn(`缓存清除失败: ${err.message}`);
  }
}

// 应用缓存到所有模型
function applyCacheToModels(db) {
  Object.keys(db).forEach((key) => {
    if (db[key] && db[key].name && typeof db[key].findAll === 'function') {
      wrapModelWithCache(db[key]);
    }
  });
  logger.info('查询缓存已应用到所有模型');
}

module.exports = {
  redis,
  applyCacheToModels,
  clearModelCache,
};
