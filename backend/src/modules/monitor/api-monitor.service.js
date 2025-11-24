const axios = require('axios');
const { ApiMonitor, ApiMonitorLog } = require('../../models');
const { Op } = require('sequelize');

/**
 * 接口监控服务
 * 负责管理接口监控配置、执行定时检测、记录监控日志
 */
class ApiMonitorService {
  constructor() {
    // 存储定时任务的 Map: monitorId -> cronJob
    this.scheduledJobs = new Map();
    // 存储最后告警时间的 Map: monitorId -> timestamp
    this.lastAlertTime = new Map();
    // 存储监控最后状态的 Map: monitorId -> status ('success' | 'failed' | 'timeout')
    this.lastMonitorStatus = new Map();
    // 存储监控执行队列，确保单次串行执行
    this.executionQueues = new Map();
    // 记录最后执行时间（包含手动触发）
    this.lastExecutionAt = new Map();
    // 动态退避信息（监控ID -> 当前退避时长）
    this.backoffDelays = new Map();
    // 退避截止时间戳
    this.backoffUntil = new Map();
    // 最小执行间隔（毫秒，用于兜底）
    this.minIntervalMs = 10 * 1000;
  }

  /**
   * 获取所有监控配置列表
   */
  async getAllMonitors(filters = {}) {
    const { page = 1, limit = 20, enabled } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    if (enabled !== undefined) {
      where.enabled = enabled;
    }

    const { count, rows } = await ApiMonitor.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    // 获取每个监控的最新日志
    const monitorsWithLastLog = await Promise.all(
      rows.map(async (monitor) => {
        const lastLog = await ApiMonitorLog.findOne({
          where: { monitor_id: monitor.id },
          order: [['created_at', 'DESC']],
        });

        return {
          ...monitor.toJSON(),
          lastLog: lastLog ? lastLog.toJSON() : null,
        };
      })
    );

    return {
      total: count,
      items: monitorsWithLastLog,
      page: parseInt(page),
      pageSize: parseInt(limit),
    };
  }

  /**
   * 根据 ID 获取监控配置
   */
  async getMonitorById(id) {
    const monitor = await ApiMonitor.findByPk(id);
    if (!monitor) {
      throw new Error('监控配置不存在');
    }
    return monitor;
  }

  /**
   * 创建监控配置
   */
  async createMonitor(data) {
    const monitor = await ApiMonitor.create(data);

    // 如果启用，则启动定时任务
    if (monitor.enabled) {
      this.startScheduledJob(monitor);
    }

    return monitor;
  }

  /**
   * 更新监控配置
   */
  async updateMonitor(id, data) {
    const monitor = await this.getMonitorById(id);

    // 过滤掉不应该被更新的字段（保护字段）
    const { id: _, created_by, created_at, updated_at, ...updateData } = data;

    // 处理 UUID 字段：将空字符串转换为 null
    // PostgreSQL 的 UUID 类型不接受空字符串，必须是有效的 UUID 或 null
    if (updateData.alert_template_id === '') {
      updateData.alert_template_id = null;
    }

    try {
      // 更新配置
      await monitor.update(updateData);

      // 重新加载以获取最新数据
      await monitor.reload();

      // 停止旧的定时任务
      this.stopScheduledJob(id);

      // 如果启用，则启动新的定时任务
      if (monitor.enabled) {
        this.startScheduledJob(monitor);
      }

      return monitor;
    } catch (error) {
      console.error(`[API Monitor] Error updating monitor ${id}:`, error);
      throw error;
    }
  }

  /**
   * 删除监控配置
   */
  async deleteMonitor(id) {
    const monitor = await this.getMonitorById(id);

    // 停止定时任务
    this.stopScheduledJob(id);
    this.executionQueues.delete(id);
    this.lastExecutionAt.delete(id);
    this.backoffDelays.delete(id);
    this.backoffUntil.delete(id);
    this.lastAlertTime.delete(id);
    this.lastMonitorStatus.delete(id);

    // 删除监控配置（级联删除日志）
    await monitor.destroy();

    return { message: '监控配置已删除' };
  }

  /**
   * 立即测试接口
   */
  async testApi(id) {
    const monitor = await this.getMonitorById(id);
    const result = await this.queueMonitorExecution(monitor, {
      reason: 'manual-test',
      allowDisabled: true,
    });
    return result?.log || null;
  }

  /**
   * 执行单次监控检测
   */
  async executeMonitor(monitor) {
    const startTime = Date.now();
    let logData = {
      monitor_id: monitor.id,
      status: 'success',
      status_code: null,
      response_time: null,
      response_body: null,
      error_message: null,
    };

    try {
      // 解析 headers
      const headers = monitor.headers || {};

      // 构建请求配置
      const config = {
        method: monitor.method.toLowerCase(),
        url: monitor.url,
        headers,
        timeout: (monitor.timeout || 30) * 1000, // 转换为毫秒
      };

      // 添加请求体（如果是 POST/PUT/PATCH）
      if (['POST', 'PUT', 'PATCH'].includes(monitor.method.toUpperCase()) && monitor.body) {
        try {
          config.data = JSON.parse(monitor.body);
        } catch (e) {
          config.data = monitor.body; // 如果不是 JSON，直接使用原始字符串
        }
      }

      // 执行请求
      const response = await axios(config);
      const responseTime = Date.now() - startTime;

      // 记录成功结果
      logData.status_code = response.status;
      logData.response_time = responseTime;
      logData.response_body = JSON.stringify(response.data).substring(0, 5000); // 限制响应体大小

      // 验证期望的状态码
      if (monitor.expect_status && response.status !== monitor.expect_status) {
        logData.status = 'failed';
        logData.error_message = `期望状态码 ${monitor.expect_status}，实际 ${response.status}`;
      }

      // 验证期望的响应内容
      if (monitor.expect_response && !JSON.stringify(response.data).includes(monitor.expect_response)) {
        logData.status = 'failed';
        logData.error_message = '响应内容不匹配期望值';
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logData.response_time = responseTime;

      // 判断是超时还是其他错误
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        logData.status = 'timeout';
        logData.error_message = '请求超时';
      } else {
        logData.status = 'failed';
        logData.status_code = error.response?.status || null;
        logData.error_message = error.message;
        if (error.response) {
          logData.response_body = JSON.stringify(error.response.data).substring(0, 5000);
        }
      }
    }

    // 保存日志
    const log = await ApiMonitorLog.create(logData);

    // 获取之前的监控状态
    const previousStatus = this.lastMonitorStatus.get(monitor.id);
    const currentStatus = logData.status;

    // 更新当前状态
    this.lastMonitorStatus.set(monitor.id, currentStatus);

    // 如果监控失败且启用了告警，发送告警邮件
    if (currentStatus !== 'success' && monitor.alert_enabled && monitor.alert_template_id) {
      await this.sendAlert(monitor, logData);
    }

    // 如果从失败状态恢复到成功，清除告警时间记录
    if (previousStatus && previousStatus !== 'success' && currentStatus === 'success') {
      this.lastAlertTime.delete(monitor.id);
      console.log(`[API Monitor] Monitor ${monitor.name} recovered, cleared alert cooldown`);
    }

    return log;
  }

  /**
   * 发送告警邮件
   */
  async sendAlert(monitor, logData) {
    try {
      // 检查是否在冷却期内（避免重复告警）
      if (!this.shouldSendAlert(monitor)) {
        const alertIntervalSeconds = monitor.alert_interval || 1800;
        console.log(`[API Monitor] Alert for ${monitor.name} is in cooldown period (interval: ${alertIntervalSeconds}s), skipping...`);
        return;
      }

      // 检查是否有接收人
      if (!monitor.alert_recipients || monitor.alert_recipients.length === 0) {
        console.warn(`[API Monitor] No alert recipients configured for monitor: ${monitor.name}`);
        return;
      }

      // 准备完整数据对象
      const dataObject = {
        ...monitor.toJSON(),
        lastLog: logData,
      };

      const alertTitle = `【接口告警】${monitor.name}`;
      const alertContent = this.buildAlertContent(monitor, logData);

      // 使用邮件服务发送告警
      const emailService = require('../notification/email.service');
      await emailService.sendAlertEmail({
        templateId: monitor.alert_template_id,
        recipients: monitor.alert_recipients,
        title: alertTitle,
        content: alertContent,
      });

      // 记录告警发送时间
      this.lastAlertTime.set(monitor.id, Date.now());
      console.log(`[API Monitor] Alert sent for monitor: ${monitor.name}`);
    } catch (error) {
      console.error(`[API Monitor] Failed to send alert for monitor ${monitor.name}:`, error);
    }
  }

  /**
   * 检查是否应该发送告警（使用配置的告警间隔）
   * @param {Object} monitor - 监控配置对象
   * @returns {boolean} - 是否应该发送告警
   */
  shouldSendAlert(monitor) {
    const lastTime = this.lastAlertTime.get(monitor.id);
    if (!lastTime) {
      return true; // 从未发送过告警，应该发送
    }

    const now = Date.now();
    const elapsed = now - lastTime;

    // 使用监控配置中的告警间隔（秒），转换为毫秒
    const alertIntervalMs = (monitor.alert_interval || 1800) * 1000;

    return elapsed >= alertIntervalMs; // 超过配置的告警间隔才发送
  }

  /**
   * 启动定时任务
   */
  startScheduledJob(monitor) {
    // 如果已经存在定时任务，先停止
    if (this.scheduledJobs.has(monitor.id)) {
      this.stopScheduledJob(monitor.id);
    }

    const job = {
      cancelled: false,
      timer: null,
    };

    const run = async () => {
      if (job.cancelled) {
        return;
      }

      let freshMonitor;
      try {
        freshMonitor = await this.getMonitorById(monitor.id);
      } catch (error) {
        console.error(`[API Monitor] Failed to reload monitor ${monitor.id}:`, error);
        const fallbackMs = this.getIntervalMs(monitor);
        job.timer = setTimeout(run, fallbackMs);
        return;
      }

      if (!freshMonitor.enabled) {
        console.log(`[API Monitor] Monitor ${monitor.id} disabled, stopping scheduled job`);
        this.stopScheduledJob(monitor.id);
        return;
      }

      let executionResult;
      try {
        executionResult = await this.queueMonitorExecution(freshMonitor, { reason: 'scheduled' });
      } catch (error) {
        console.error(`[API Monitor] Error executing monitor ${monitor.id}:`, error);
      }

      if (job.cancelled) {
        return;
      }

      const nextMonitor = executionResult?.monitor || freshMonitor;
      if (executionResult?.skipped && executionResult?.monitor && !executionResult.monitor.enabled) {
        console.log(`[API Monitor] Monitor ${monitor.id} disabled during execution, stopping job`);
        this.stopScheduledJob(monitor.id);
        return;
      }

      const nextInterval = this.getIntervalMs(nextMonitor);
      job.timer = setTimeout(run, nextInterval);
    };

    this.scheduledJobs.set(monitor.id, job);
    run();
    console.log(`[API Monitor] Started scheduled job for monitor: ${monitor.name} (${monitor.id}), interval: ${monitor.interval || 60}s`);
  }

  /**
   * 停止定时任务
   */
  stopScheduledJob(monitorId) {
    const job = this.scheduledJobs.get(monitorId);
    if (job) {
      job.cancelled = true;
      if (job.timer) {
        clearTimeout(job.timer);
      }
      this.scheduledJobs.delete(monitorId);
      this.executionQueues.delete(monitorId);
      this.lastExecutionAt.delete(monitorId);
      this.backoffDelays.delete(monitorId);
      this.backoffUntil.delete(monitorId);
      console.log(`[API Monitor] Stopped scheduled job for monitor: ${monitorId}`);
    }
  }

  /**
   * 获取监控日志
   */
  async getMonitorLogs(monitorId, filters = {}) {
    const { page = 1, limit = 50, status, startDate, endDate } = filters;
    // 限制最大每页100条
    const actualLimit = Math.min(parseInt(limit), 100);
    const offset = (page - 1) * actualLimit;

    const where = { monitor_id: monitorId };

    // 状态过滤
    if (status) {
      where.status = status;
    }

    // 时间范围过滤
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.created_at[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows } = await ApiMonitorLog.findAndCountAll({
      where,
      limit: actualLimit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      total: count,
      items: rows,
      page: parseInt(page),
      limit: actualLimit,
    };
  }

  /**
   * 获取监控统计信息
   */
  async getMonitorStats(monitorId, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const logs = await ApiMonitorLog.findAll({
      where: {
        monitor_id: monitorId,
        created_at: {
          [Op.gte]: since,
        },
      },
      order: [['created_at', 'ASC']],
    });

    const total = logs.length;
    const success = logs.filter(l => l.status === 'success').length;
    const failed = logs.filter(l => l.status === 'failed').length;
    const timeout = logs.filter(l => l.status === 'timeout').length;

    // 计算平均响应时间
    const responseTimes = logs.filter(l => l.response_time).map(l => l.response_time);
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    // 可用率
    const availability = total > 0 ? (success / total) * 100 : 100;

    return {
      total,
      success,
      failed,
      timeout,
      availability: parseFloat(availability.toFixed(2)),
      avgResponseTime: parseFloat(avgResponseTime.toFixed(2)),
      period: `${hours}h`,
    };
  }

  /**
   * 初始化所有启用的监控任务
   */
  async initializeScheduledJobs() {
    try {
      const monitors = await ApiMonitor.findAll({
        where: { enabled: true },
      });

      console.log(`[API Monitor] Initializing ${monitors.length} enabled monitors...`);

      monitors.forEach(monitor => {
        this.startScheduledJob(monitor);
      });

      console.log(`[API Monitor] All scheduled jobs initialized`);
    } catch (error) {
      console.error('[API Monitor] Error initializing scheduled jobs:', error);
    }
  }

  /**
   * 停止所有定时任务
   */
  stopAllScheduledJobs() {
    console.log(`[API Monitor] Stopping all ${this.scheduledJobs.size} scheduled jobs...`);
    this.scheduledJobs.forEach((job, monitorId) => {
      job.cancelled = true;
      if (job.timer) {
        clearTimeout(job.timer);
      }
    });
    this.scheduledJobs.clear();
    console.log('[API Monitor] All scheduled jobs stopped');
  }

  /**
   * 将监控加入串行执行队列
   */
  queueMonitorExecution(monitor, options = {}) {
    const monitorId = monitor.id;
    const previous = this.executionQueues.get(monitorId) || Promise.resolve();

    const run = previous.then(() => this.runMonitorWithGuards(monitor, options));

    this.executionQueues.set(
      monitorId,
      run.catch((error) => {
        console.error(`[API Monitor] Queue execution error for ${monitorId}:`, error);
      })
    );

    return run;
  }

  /**
   * 在执行前应用节流与退避策略
   */
  async runMonitorWithGuards(monitor, options = {}) {
    const { skipThrottle = false, allowDisabled = false } = options;
    const monitorId = monitor.id;
    const intervalMs = this.getIntervalMs(monitor);

    if (!skipThrottle) {
      await this.waitForThrottleWindow(monitorId, intervalMs);
    }

    // 执行前再次加载最新配置，避免使用过期数据
    let freshMonitor;
    try {
      freshMonitor = await this.getMonitorById(monitorId);
    } catch (error) {
      console.error(`[API Monitor] Monitor ${monitorId} not found before execution:`, error.message);
      return { monitor, log: null, skipped: true };
    }
    if (!freshMonitor.enabled && !allowDisabled) {
      console.log(`[API Monitor] Monitor ${monitorId} disabled before execution, skipping`);
      return { monitor: freshMonitor, log: null, skipped: true };
    }

    const log = await this.executeMonitor(freshMonitor);
    this.lastExecutionAt.set(monitorId, Date.now());
    this.applyBackoffStrategy(freshMonitor, log);

    return { monitor: freshMonitor, log, skipped: false };
  }

  /**
   * 等待下一个执行窗口
   */
  async waitForThrottleWindow(monitorId, intervalMs) {
    const now = Date.now();
    let waitUntil = now;

    const lastRan = this.lastExecutionAt.get(monitorId);
    if (lastRan) {
      waitUntil = Math.max(waitUntil, lastRan + intervalMs);
    }

    const backoffDeadline = this.backoffUntil.get(monitorId);
    if (backoffDeadline) {
      waitUntil = Math.max(waitUntil, backoffDeadline);
    }

    if (waitUntil > now) {
      await this.delay(waitUntil - now);
    }
  }

  /**
   * 动态退避策略
   */
  applyBackoffStrategy(monitor, log) {
    if (!log) {
      return;
    }

    const monitorId = monitor.id;
    const statusCode = log.status_code;
    const is429 = statusCode === 429;
    const isServerError = statusCode >= 500 && statusCode < 600;

    if (is429 || isServerError) {
      const baseDelay = this.getIntervalMs(monitor);
      const previousDelay = this.backoffDelays.get(monitorId) || baseDelay;
      const nextDelay = Math.min(previousDelay * 2, 30 * 60 * 1000); // 最长退避30分钟

      this.backoffDelays.set(monitorId, nextDelay);
      this.backoffUntil.set(monitorId, Date.now() + nextDelay);

      console.warn(
        `[API Monitor] Monitor ${monitor.name} encountered ${statusCode}, applying backoff ${Math.round(nextDelay / 1000)}s`
      );
      return;
    }

    // 正常恢复后清除退避信息
    this.backoffDelays.delete(monitorId);
    this.backoffUntil.delete(monitorId);
  }

  /**
   * 构建告警内容 HTML
   */
  buildAlertContent(monitor, logData) {
    const statusCode = logData.status_code || 'N/A';
    const responseTime = logData.response_time ? `${logData.response_time}ms` : 'N/A';
    const timestamp = new Date().toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const errorMessage = logData.error_message || '无';

    return [
      `<p>接口监控 <strong>${monitor.name}</strong> 发生异常，请及时关注。</p>`,
      '<ul>',
      `<li><strong>请求地址：</strong>${monitor.url}</li>`,
      `<li><strong>请求方法：</strong>${monitor.method}</li>`,
      `<li><strong>当前状态：</strong>${logData.status}</li>`,
      `<li><strong>状态码：</strong>${statusCode}</li>`,
      `<li><strong>响应时间：</strong>${responseTime}</li>`,
      `<li><strong>错误详情：</strong>${errorMessage}</li>`,
      `<li><strong>检测时间：</strong>${timestamp}</li>`,
      '</ul>',
    ].join('');
  }

  /**
   * 工具方法：根据监控配置获取毫秒间隔
   */
  getIntervalMs(monitor) {
    const raw = parseInt(monitor.interval, 10);
    const fallbackSeconds = Number.isFinite(raw) && raw > 0 ? raw : 60;
    const intervalSeconds = Math.max(fallbackSeconds, this.minIntervalMs / 1000);
    return intervalSeconds * 1000;
  }

  /**
   * Promise 形式的延迟
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new ApiMonitorService();
