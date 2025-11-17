const { MonitorMetric } = require('../../models');

/**
 * 应用监控服务
 * 用于统计 API 响应时间、成功率、错误率等
 */
class ApplicationMonitorService {
  constructor() {
    // 内存中存储最近的请求统计（保留最近1000条）
    this.recentRequests = [];
    this.maxRequests = 1000;

    // 在线用户追踪（简单实现：基于最近15分钟有活动的用户）
    this.activeUsers = new Map(); // userId -> lastActivityTime
  }

  /**
   * 记录请求
   */
  recordRequest(requestData) {
    const record = {
      method: requestData.method,
      path: requestData.path,
      statusCode: requestData.statusCode,
      responseTime: requestData.responseTime,
      userId: requestData.userId,
      timestamp: new Date(),
    };

    this.recentRequests.push(record);

    // 限制数组大小
    if (this.recentRequests.length > this.maxRequests) {
      this.recentRequests.shift();
    }

    // 更新用户活动时间
    if (requestData.userId) {
      this.activeUsers.set(requestData.userId, new Date());
    }
  }

  /**
   * 获取平均响应时间
   */
  getAvgResponseTime() {
    if (this.recentRequests.length === 0) {
      return 0;
    }

    const total = this.recentRequests.reduce(
      (sum, req) => sum + req.responseTime,
      0
    );
    return parseFloat((total / this.recentRequests.length).toFixed(2));
  }

  /**
   * 获取请求成功率
   */
  getSuccessRate() {
    if (this.recentRequests.length === 0) {
      return 100;
    }

    const successCount = this.recentRequests.filter(
      (req) => req.statusCode >= 200 && req.statusCode < 400
    ).length;

    return parseFloat(
      ((successCount / this.recentRequests.length) * 100).toFixed(2)
    );
  }

  /**
   * 获取错误率
   */
  getErrorRate() {
    if (this.recentRequests.length === 0) {
      return 0;
    }

    const errorCount = this.recentRequests.filter(
      (req) => req.statusCode >= 400
    ).length;

    return parseFloat(
      ((errorCount / this.recentRequests.length) * 100).toFixed(2)
    );
  }

  /**
   * 获取并发用户数
   */
  getConcurrentUsers() {
    // 清理15分钟前的用户
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    for (const [userId, lastActivity] of this.activeUsers.entries()) {
      if (lastActivity < fifteenMinutesAgo) {
        this.activeUsers.delete(userId);
      }
    }

    return this.activeUsers.size;
  }

  /**
   * 获取应用综合指标
   */
  getApplicationMetrics() {
    return {
      avgResponseTime: this.getAvgResponseTime(),
      successRate: this.getSuccessRate(),
      errorRate: this.getErrorRate(),
      concurrentUsers: this.getConcurrentUsers(),
      totalRequests: this.recentRequests.length,
      timestamp: new Date(),
    };
  }

  /**
   * 保存应用指标到数据库
   */
  async saveMetrics() {
    try {
      const metrics = this.getApplicationMetrics();
      const records = [];

      records.push({
        metric_type: 'application',
        metric_name: 'avg_response_time',
        value: metrics.avgResponseTime,
        unit: 'ms',
      });

      records.push({
        metric_type: 'application',
        metric_name: 'success_rate',
        value: metrics.successRate,
        unit: '%',
      });

      records.push({
        metric_type: 'application',
        metric_name: 'error_rate',
        value: metrics.errorRate,
        unit: '%',
      });

      records.push({
        metric_type: 'application',
        metric_name: 'concurrent_users',
        value: metrics.concurrentUsers,
        unit: '',
      });

      await MonitorMetric.bulkCreate(records);
    } catch (error) {
      console.error('保存应用指标失败:', error);
    }
  }
}

module.exports = new ApplicationMonitorService();
