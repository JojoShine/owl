const { sequelize } = require('../../models');
const { MonitorMetric } = require('../../models');

/**
 * 数据库监控服务
 */
class DatabaseMonitorService {
  /**
   * 获取连接池状态
   */
  async getConnectionPoolStatus() {
    try {
      const pool = sequelize.connectionManager.pool;

      // 如果连接池不存在，返回默认值
      if (!pool) {
        return { max: 0, min: 0, active: 0, idle: 0, waiting: 0 };
      }

      return {
        max: pool._maxConnections || (pool.options && pool.options.max) || 0,
        min: pool._minConnections || (pool.options && pool.options.min) || 0,
        active: pool._inUseObjects ? pool._inUseObjects.length : 0,
        idle: pool._availableObjects ? pool._availableObjects.length : 0,
        waiting: pool._waitingClientsQueue ? pool._waitingClientsQueue.length : 0,
      };
    } catch (error) {
      console.error('获取连接池状态失败:', error);
      return { max: 0, min: 0, active: 0, idle: 0, waiting: 0 };
    }
  }

  /**
   * 获取数据库大小
   */
  async getDatabaseSize() {
    try {
      const [results] = await sequelize.query(`
        SELECT
          pg_size_pretty(pg_database_size(current_database())) as size,
          pg_database_size(current_database()) as size_bytes
      `);

      const sizeInMB = parseFloat((results[0].size_bytes / (1024 * 1024)).toFixed(2));

      return {
        size: results[0].size,
        sizeInMB,
      };
    } catch (error) {
      console.error('获取数据库大小失败:', error);
      return { size: '0 MB', sizeInMB: 0 };
    }
  }

  /**
   * 获取慢查询（示例：查询执行时间超过 1 秒的）
   * 注意：PostgreSQL 需要启用 pg_stat_statements 扩展
   */
  async getSlowQueries() {
    try {
      // 检查是否启用了 pg_stat_statements
      const [extensionCheck] = await sequelize.query(`
        SELECT * FROM pg_extension WHERE extname = 'pg_stat_statements'
      `);

      if (extensionCheck.length === 0) {
        return [];
      }

      const [results] = await sequelize.query(`
        SELECT
          query,
          calls,
          total_exec_time,
          mean_exec_time,
          max_exec_time
        FROM pg_stat_statements
        WHERE mean_exec_time > 1000
        ORDER BY mean_exec_time DESC
        LIMIT 10
      `);

      return results.map(row => ({
        query: row.query.substring(0, 200), // 截取前200个字符
        calls: row.calls,
        totalTime: parseFloat(row.total_exec_time.toFixed(2)),
        meanTime: parseFloat(row.mean_exec_time.toFixed(2)),
        maxTime: parseFloat(row.max_exec_time.toFixed(2)),
      }));
    } catch (error) {
      // pg_stat_statements 未启用时返回空数组
      return [];
    }
  }

  /**
   * 获取数据库综合指标
   */
  async getDatabaseMetrics() {
    try {
      const [connections, dbSize, slowQueries] = await Promise.all([
        this.getConnectionPoolStatus(),
        this.getDatabaseSize(),
        this.getSlowQueries(),
      ]);

      const connectionConfig = {
        host: sequelize?.config?.host || sequelize?.options?.host || process.env.DB_HOST || 'localhost',
        port: sequelize?.config?.port || sequelize?.options?.port || Number(process.env.DB_PORT) || 5432,
        database: sequelize?.config?.database || process.env.DB_NAME || '',
      };

      return {
        connections,
        dbSize,
        slowQueries,
        connection: connectionConfig,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('获取数据库指标失败:', error);
      throw error;
    }
  }

  /**
   * 保存数据库指标到数据库
   */
  async saveMetrics(metrics) {
    try {
      const records = [];

      records.push({
        metric_type: 'database',
        metric_name: 'connections_active',
        value: metrics.connections.active,
        unit: '',
      });

      records.push({
        metric_type: 'database',
        metric_name: 'connections_idle',
        value: metrics.connections.idle,
        unit: '',
      });

      records.push({
        metric_type: 'database',
        metric_name: 'db_size',
        value: metrics.dbSize.sizeInMB,
        unit: 'MB',
      });

      await MonitorMetric.bulkCreate(records);
    } catch (error) {
      console.error('保存数据库指标失败:', error);
    }
  }
}

module.exports = new DatabaseMonitorService();
