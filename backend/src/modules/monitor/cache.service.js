const { redisClient } = require('../../config/redis');
const { MonitorMetric } = require('../../models');

/**
 * 缓存监控服务（Redis）
 */
class CacheMonitorService {
  /**
   * 获取 Redis 连接状态
   */
  async getConnectionStatus() {
    try {
      const isConnected = redisClient && redisClient.isOpen;
      const socketOptions = redisClient?.options?.socket || {};
      const host = socketOptions.host || process.env.REDIS_HOST || 'localhost';
      const port = socketOptions.port || Number(process.env.REDIS_PORT) || 6379;
      return {
        connected: isConnected,
        status: isConnected ? 'connected' : 'disconnected',
        host,
        port,
      };
    } catch (error) {
      console.error('获取Redis连接状态失败:', error);
      return {
        connected: false,
        status: 'error',
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      };
    }
  }

  /**
   * 获取 Redis 信息
   */
  async getRedisInfo() {
    try {
      if (!redisClient.isOpen) {
        return null;
      }

      const info = await redisClient.info('memory');
      const stats = await redisClient.info('stats');

      // 解析信息
      const memoryInfo = this.parseRedisInfo(info);
      const statsInfo = this.parseRedisInfo(stats);

      return {
        memory: memoryInfo,
        stats: statsInfo,
      };
    } catch (error) {
      console.error('获取Redis信息失败:', error);
      return null;
    }
  }

  /**
   * 解析 Redis INFO 命令返回的字符串
   */
  parseRedisInfo(infoString) {
    const lines = infoString.split('\r\n');
    const info = {};

    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          info[key] = value;
        }
      }
    });

    return info;
  }

  /**
   * 获取内存使用情况
   */
  async getMemoryUsage() {
    try {
      const info = await this.getRedisInfo();
      if (!info || !info.memory) {
        return { used: 0, max: 0, percent: 0 };
      }

      const usedMemory = parseInt(info.memory.used_memory || 0);
      const maxMemory = parseInt(info.memory.maxmemory || 0);

      const usedMB = parseFloat((usedMemory / (1024 * 1024)).toFixed(2));
      const maxMB = maxMemory > 0
        ? parseFloat((maxMemory / (1024 * 1024)).toFixed(2))
        : null;

      const percent = maxMemory > 0
        ? parseFloat(((usedMemory / maxMemory) * 100).toFixed(2))
        : 0;

      return {
        used: usedMB,
        max: maxMB,
        percent,
      };
    } catch (error) {
      console.error('获取Redis内存使用失败:', error);
      return { used: 0, max: 0, percent: 0 };
    }
  }

  /**
   * 获取缓存命中率
   * 注意：这是一个近似值，基于 keyspace_hits 和 keyspace_misses
   */
  async getHitRate() {
    try {
      const info = await this.getRedisInfo();
      if (!info || !info.stats) {
        return 0;
      }

      const hits = parseInt(info.stats.keyspace_hits || 0);
      const misses = parseInt(info.stats.keyspace_misses || 0);

      if (hits + misses === 0) {
        return 100; // 没有请求时认为命中率为100%
      }

      return parseFloat(((hits / (hits + misses)) * 100).toFixed(2));
    } catch (error) {
      console.error('获取Redis命中率失败:', error);
      return 0;
    }
  }

  /**
   * 获取缓存综合指标
   */
  async getCacheMetrics() {
    try {
      const [connectionStatus, memoryUsage, hitRate] = await Promise.all([
        this.getConnectionStatus(),
        this.getMemoryUsage(),
        this.getHitRate(),
      ]);

      return {
        connected: connectionStatus.connected,
        status: connectionStatus.status,
        host: connectionStatus.host,
        port: connectionStatus.port,
        memory: memoryUsage,
        hitRate,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('获取缓存指标失败:', error);
      throw error;
    }
  }

  /**
   * 保存缓存指标到数据库
   */
  async saveMetrics(metrics) {
    try {
      const records = [];

      if (metrics.connected) {
        records.push({
          metric_type: 'cache',
          metric_name: 'memory_used',
          value: metrics.memory.used,
          unit: 'MB',
        });

        if (metrics.memory.percent > 0) {
          records.push({
            metric_type: 'cache',
            metric_name: 'memory_percent',
            value: metrics.memory.percent,
            unit: '%',
          });
        }

        records.push({
          metric_type: 'cache',
          metric_name: 'hit_rate',
          value: metrics.hitRate,
          unit: '%',
        });
      }

      if (records.length > 0) {
        await MonitorMetric.bulkCreate(records);
      }
    } catch (error) {
      console.error('保存缓存指标失败:', error);
    }
  }
}

module.exports = new CacheMonitorService();
