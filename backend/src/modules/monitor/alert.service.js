const cron = require('node-cron');
const { AlertRule, AlertHistory, EmailTemplate } = require('../../models');
const { Op } = require('sequelize');
const systemService = require('./system.service');
const applicationService = require('./application.service');
const databaseService = require('./database.service');
const cacheService = require('./cache.service');
const emailService = require('../notification/email.service');

/**
 * 告警服务
 * 负责管理告警规则、检查监控指标、触发告警
 */
class AlertService {
  constructor() {
    // 告警检查任务
    this.alertCheckJob = null;
    // 活跃告警（避免重复告警）
    this.activeAlerts = new Map(); // ruleId -> { triggeredAt, resolved }
  }

  /**
   * 获取所有告警规则
   */
  async getAllRules(filters = {}) {
    const { page = 1, limit = 20, enabled, metric_type } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    if (enabled !== undefined) {
      where.enabled = enabled;
    }
    if (metric_type) {
      where.metric_type = metric_type;
    }

    const { count, rows } = await AlertRule.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      total: count,
      items: rows,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  }

  /**
   * 根据 ID 获取告警规则
   */
  async getRuleById(id) {
    const rule = await AlertRule.findByPk(id);
    if (!rule) {
      throw new Error('告警规则不存在');
    }
    return rule;
  }

  /**
   * 创建告警规则
   */
  async createRule(data) {
    const rule = await AlertRule.create(data);
    return rule;
  }

  /**
   * 更新告警规则
   */
  async updateRule(id, data) {
    const rule = await this.getRuleById(id);
    await rule.update(data);

    // 如果规则被禁用，清除活跃告警
    if (!rule.enabled && this.activeAlerts.has(id)) {
      this.activeAlerts.delete(id);
    }

    return rule;
  }

  /**
   * 删除告警规则
   */
  async deleteRule(id) {
    const rule = await this.getRuleById(id);

    // 清除活跃告警
    if (this.activeAlerts.has(id)) {
      this.activeAlerts.delete(id);
    }

    // 删除规则（级联删除历史记录）
    await rule.destroy();

    return { message: '告警规则已删除' };
  }

  /**
   * 获取告警历史
   */
  async getAlertHistory(filters = {}) {
    const { page = 1, limit = 50, rule_id, level, status, startDate, endDate } = filters;
    const offset = (page - 1) * limit;

    const where = {};

    if (rule_id) {
      where.rule_id = rule_id;
    }
    if (level) {
      where.level = level;
    }
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

    const { count, rows } = await AlertHistory.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{
        model: AlertRule,
        as: 'rule',
        attributes: ['id', 'name', 'metric_type', 'metric_name'],
      }],
    });

    return {
      total: count,
      items: rows,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  }

  /**
   * 标记告警为已解决
   */
  async resolveAlert(alertId) {
    const alert = await AlertHistory.findByPk(alertId);
    if (!alert) {
      throw new Error('告警记录不存在');
    }

    await alert.update({
      status: 'resolved',
      resolved_at: new Date(),
    });

    // 清除活跃告警
    if (this.activeAlerts.has(alert.rule_id)) {
      this.activeAlerts.delete(alert.rule_id);
    }

    return alert;
  }

  /**
   * 检查所有告警规则
   */
  async checkAllRules() {
    try {
      const rules = await AlertRule.findAll({
        where: { enabled: true },
        attributes: [
          'id', 'name', 'metric_type', 'metric_name', 'condition',
          'threshold', 'level', 'enabled',
          'alert_enabled', 'alert_template_id', 'alert_recipients', 'alert_interval'
        ],
      });

      console.log(`[Alert] Checking ${rules.length} enabled alert rules...`);

      for (const rule of rules) {
        // Debug: Log email notification configuration
        console.log(`[Alert] Rule "${rule.name}" email config:`, {
          alert_enabled: rule.alert_enabled,
          alert_template_id: rule.alert_template_id,
          alert_recipients: rule.alert_recipients,
          alert_interval: rule.alert_interval,
        });
        await this.checkRule(rule);
      }
    } catch (error) {
      console.error('[Alert] Error checking alert rules:', error);
    }
  }

  /**
   * 检查单个告警规则
   */
  async checkRule(rule) {
    try {
      // 获取当前指标值
      const currentValue = await this.getMetricValue(rule.metric_type, rule.metric_name);

      if (currentValue === null || currentValue === undefined) {
        console.warn(`[Alert] Cannot get metric value for ${rule.metric_type}.${rule.metric_name}`);
        return;
      }

      // 判断是否触发告警
      const shouldAlert = this.evaluateCondition(currentValue, rule.condition, rule.threshold);

      if (shouldAlert) {
        await this.triggerAlert(rule, currentValue);
      } else {
        // 如果之前有活跃告警，现在不满足条件了，自动解决
        if (this.activeAlerts.has(rule.id)) {
          await this.autoResolveAlert(rule);
        }
      }
    } catch (error) {
      console.error(`[Alert] Error checking rule ${rule.id}:`, error);
    }
  }

  /**
   * 获取指标值
   */
  async getMetricValue(metricType, metricName) {
    try {
      switch (metricType) {
        case 'system':
          return await this.getSystemMetricValue(metricName);

        case 'application':
          return await this.getApplicationMetricValue(metricName);

        case 'database':
          return await this.getDatabaseMetricValue(metricName);

        case 'cache':
          return await this.getCacheMetricValue(metricName);

        case 'api_monitor':
          return await this.getApiMonitorMetricValue(metricName);

        default:
          return null;
      }
    } catch (error) {
      console.error(`[Alert] Error getting metric value for ${metricType}.${metricName}:`, error);
      return null;
    }
  }

  /**
   * 获取系统指标值
   */
  async getSystemMetricValue(metricName) {
    const metrics = await systemService.getSystemMetrics();

    switch (metricName) {
      case 'cpu_usage':
        return metrics.cpu.usage;
      case 'memory_usage':
        return metrics.memory.percent;
      case 'disk_usage':
        return metrics.disk.percent;
      default:
        return null;
    }
  }

  /**
   * 获取应用指标值
   */
  async getApplicationMetricValue(metricName) {
    const metrics = await applicationService.getApplicationMetrics();

    switch (metricName) {
      case 'response_time':
        return metrics.avgResponseTime;
      case 'error_rate':
        return metrics.errorRate;
      case 'online_users':
        return metrics.onlineUsers;
      default:
        return null;
    }
  }

  /**
   * 获取数据库指标值
   */
  async getDatabaseMetricValue(metricName) {
    const metrics = await databaseService.getDatabaseMetrics();

    switch (metricName) {
      case 'connection_usage':
        const total = metrics.connections.active + metrics.connections.idle;
        return metrics.connections.max > 0
          ? (total / metrics.connections.max) * 100
          : 0;
      default:
        return null;
    }
  }

  /**
   * 获取缓存指标值
   */
  async getCacheMetricValue(metricName) {
    const metrics = await cacheService.getCacheMetrics();

    switch (metricName) {
      case 'hit_rate':
        return metrics.hitRate;
      case 'memory_usage':
        return metrics.memoryUsed && metrics.memoryMax
          ? (metrics.memoryUsed / metrics.memoryMax) * 100
          : 0;
      default:
        return null;
    }
  }

  /**
   * 获取接口监控指标值
   */
  async getApiMonitorMetricValue(metricName) {
    const { ApiMonitor, ApiMonitorLog } = require('../../models');
    const { Op } = require('sequelize');

    try {
      // 获取所有启用的监控
      const monitors = await ApiMonitor.findAll({
        where: { enabled: true },
      });

      if (monitors.length === 0) {
        return 0;
      }

      // 获取最近1小时的监控日志
      const since = new Date(Date.now() - 60 * 60 * 1000);
      const logs = await ApiMonitorLog.findAll({
        where: {
          monitor_id: {
            [Op.in]: monitors.map(m => m.id),
          },
          created_at: {
            [Op.gte]: since,
          },
        },
      });

      if (logs.length === 0) {
        return 100; // 无日志时假设一切正常
      }

      switch (metricName) {
        case 'availability': {
          // 可用率：成功请求数 / 总请求数 * 100
          const successCount = logs.filter(l => l.status === 'success').length;
          return (successCount / logs.length) * 100;
        }

        case 'avg_response_time': {
          // 平均响应时间
          const responseTimes = logs
            .filter(l => l.response_time)
            .map(l => l.response_time);

          if (responseTimes.length === 0) {
            return 0;
          }

          const sum = responseTimes.reduce((a, b) => a + b, 0);
          return sum / responseTimes.length;
        }

        case 'error_rate': {
          // 错误率：(失败+超时) / 总请求数 * 100
          const errorCount = logs.filter(
            l => l.status === 'failed' || l.status === 'timeout'
          ).length;
          return (errorCount / logs.length) * 100;
        }

        default:
          return null;
      }
    } catch (error) {
      console.error('[Alert] Error getting API monitor metric:', error);
      return null;
    }
  }

  /**
   * 评估告警条件
   */
  evaluateCondition(value, condition, threshold) {
    switch (condition) {
      case '>':
        return value > threshold;
      case '<':
        return value < threshold;
      case '>=':
        return value >= threshold;
      case '<=':
        return value <= threshold;
      case '==':
        return value == threshold;
      default:
        return false;
    }
  }

  /**
   * 触发告警
   */
  async triggerAlert(rule, currentValue) {
    // 检查是否已经有活跃告警
    const activeAlert = this.activeAlerts.get(rule.id);

    if (activeAlert && !activeAlert.resolved) {
      // 已经触发过告警，检查是否需要发送邮件（告警间隔控制）
      console.log(`[Alert] Rule ${rule.name} already has active alert, checking email interval...`);
      if (rule.alert_enabled && rule.alert_template_id && rule.alert_recipients && rule.alert_recipients.length > 0) {
        const shouldSendEmail = await this.checkAlertInterval(rule.id, rule.alert_interval);
        console.log(`[Alert] Should send email: ${shouldSendEmail}`);
        if (shouldSendEmail) {
          await this.sendAlertEmail(rule, currentValue, activeAlert.alertId);
        }
      } else {
        console.log(`[Alert] Email notification not configured for rule ${rule.name}`, {
          alert_enabled: rule.alert_enabled,
          has_template: !!rule.alert_template_id,
          has_recipients: rule.alert_recipients?.length > 0,
        });
      }
      console.log(`[Alert] Rule ${rule.name} already has active alert`);
      return;
    }

    // 创建告警记录
    const message = `${rule.name}: ${rule.metric_name} 当前值 ${currentValue.toFixed(2)} ${rule.condition} ${rule.threshold}`;

    const alert = await AlertHistory.create({
      rule_id: rule.id,
      message,
      level: rule.level || 'warning',
      status: 'pending',
      created_at: new Date(),
    });

    // 同步创建消息中心通知
    await this.createNotificationForAlert(rule, currentValue, alert);

    // 记录为活跃告警
    this.activeAlerts.set(rule.id, {
      triggeredAt: new Date(),
      alertId: alert.id,
      resolved: false,
      lastEmailSentAt: null, // 记录上次发送邮件时间
    });

    console.log(`[Alert] Triggered alert: ${rule.name}, value: ${currentValue}`);

    // 发送告警邮件
    console.log(`[Alert] Checking if email should be sent...`, {
      alert_enabled: rule.alert_enabled,
      has_template: !!rule.alert_template_id,
      has_recipients: rule.alert_recipients?.length > 0,
      recipients: rule.alert_recipients,
    });

    if (rule.alert_enabled && rule.alert_template_id && rule.alert_recipients && rule.alert_recipients.length > 0) {
      console.log(`[Alert] Sending alert email for rule: ${rule.name}`);
      await this.sendAlertEmail(rule, currentValue, alert.id);
      // 更新上次发送邮件时间
      const updatedAlert = this.activeAlerts.get(rule.id);
      if (updatedAlert) {
        updatedAlert.lastEmailSentAt = new Date();
      }
    } else {
      console.log(`[Alert] Email notification not enabled or not fully configured for rule: ${rule.name}`);
    }

    return alert;
  }

  /**
   * 自动解决告警
   */
  async autoResolveAlert(rule) {
    const activeAlert = this.activeAlerts.get(rule.id);

    if (activeAlert && activeAlert.alertId) {
      await AlertHistory.update(
        {
          status: 'resolved',
          resolved_at: new Date(),
        },
        {
          where: { id: activeAlert.alertId },
        }
      );

      this.activeAlerts.delete(rule.id);
      console.log(`[Alert] Auto-resolved alert for rule: ${rule.name}`);
    }
  }

  /**
   * 获取告警统计
   */
  async getAlertStats(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const alerts = await AlertHistory.findAll({
      where: {
        created_at: {
          [Op.gte]: since,
        },
      },
    });

    const total = alerts.length;
    const pending = alerts.filter(a => a.status === 'pending').length;
    const resolved = alerts.filter(a => a.status === 'resolved').length;

    const byLevel = {
      info: alerts.filter(a => a.level === 'info').length,
      warning: alerts.filter(a => a.level === 'warning').length,
      error: alerts.filter(a => a.level === 'error').length,
      critical: alerts.filter(a => a.level === 'critical').length,
    };

    return {
      total,
      pending,
      resolved,
      byLevel,
      period: `${hours}h`,
    };
  }

  /**
   * 启动告警检查定时任务
   */
  startAlertCheckJob() {
    if (this.alertCheckJob) {
      console.log('[Alert] Alert check job already running');
      return;
    }

    // 每分钟检查一次告警规则
    this.alertCheckJob = cron.schedule('*/1 * * * *', async () => {
      console.log('[Alert] Running scheduled alert check...');
      await this.checkAllRules();
    }, {
      scheduled: true,
      timezone: 'Asia/Shanghai',
    });

    console.log('[Alert] Started alert check job (every 1 minute)');
  }

  /**
   * 停止告警检查定时任务
   */
  stopAlertCheckJob() {
    if (this.alertCheckJob) {
      this.alertCheckJob.stop();
      this.alertCheckJob = null;
      console.log('[Alert] Stopped alert check job');
    }
  }

  /**
   * 发送告警邮件
   */
  async sendAlertEmail(rule, currentValue, alertId) {
    try {
      const template = await EmailTemplate.findByPk(rule.alert_template_id);
      if (!template) {
        console.error(`[Alert] Email template ${rule.alert_template_id} not found`);
        return;
      }

      // 构建邮件标题
      const title = `【${this.getLevelLabel(rule.level)}】${rule.name}`;

      // 构建富HTML内容（包含所有告警详情）
      const content = `
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #856404;">告警详情</h3>
          <p><strong>规则名称：</strong>${rule.name}</p>
          <p><strong>监控指标：</strong>${this.getMetricLabel(rule.metric_name)}</p>
          <p><strong>当前值：</strong>${currentValue.toFixed(2)}${this.getMetricUnit(rule.metric_name)}</p>
          <p><strong>阈值：</strong>${rule.threshold}${this.getMetricUnit(rule.metric_name)}</p>
          <p><strong>告警级别：</strong>${this.getLevelLabel(rule.level)}</p>
          <p><strong>告警时间：</strong>${new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          ${this.getRecommendation(rule.metric_name)}
        </p>
      `;

      // 使用简化的变量对象（只包含 title 和 content）
      const variables = {
        title,
        content,
      };

      // 使用 sendEmailByTemplate 方法批量发送邮件
      const result = await emailService.sendEmailByTemplate(
        rule.alert_template_id,
        rule.alert_recipients,
        variables
      );

      if (result.success) {
        console.log(`[Alert] Successfully sent alert emails to ${result.successCount} recipients for rule: ${rule.name}`);
      } else {
        console.warn(`[Alert] Partially sent alert emails: ${result.successCount} succeeded, ${result.failedCount} failed for rule: ${rule.name}`);
      }
    } catch (error) {
      console.error('[Alert] Failed to send alert email:', error);
    }
  }

  /**
   * 检查告警间隔（防止告警轰炸）
   */
  async checkAlertInterval(ruleId, interval) {
    const activeAlert = this.activeAlerts.get(ruleId);
    if (!activeAlert || !activeAlert.lastEmailSentAt) {
      return true; // 第一次发送
    }

    const now = new Date();
    const lastTime = activeAlert.lastEmailSentAt;
    const diffSeconds = (now - lastTime) / 1000;

    const shouldSend = diffSeconds >= interval;

    if (shouldSend) {
      // 更新上次发送时间
      activeAlert.lastEmailSentAt = now;
    }

    return shouldSend;
  }

  /**
   * 获取告警级别中文标签
   */
  getLevelLabel(level) {
    const labels = {
      info: '信息',
      warning: '警告',
      error: '错误',
      critical: '严重',
    };
    return labels[level] || level;
  }

  /**
   * 获取指标单位
   */
  getMetricUnit(metricName) {
    const units = {
      'cpu_usage': '%',
      'memory_usage': '%',
      'disk_usage': '%',
      'response_time': 'ms',
      'error_rate': '%',
      'hit_rate': '%',
      'connection_usage': '%',
      'availability': '%',
      'avg_response_time': 'ms',
    };
    return units[metricName] || '';
  }

  /**
   * 获取指标中文标签
   */
  getMetricLabel(metricName) {
    const labels = {
      'cpu_usage': 'CPU使用率',
      'memory_usage': '内存使用率',
      'disk_usage': '磁盘使用率',
      'response_time': '响应时间',
      'error_rate': '错误率',
      'online_users': '在线用户数',
      'hit_rate': '缓存命中率',
      'connection_usage': '数据库连接使用率',
      'availability': '接口可用率',
      'avg_response_time': '平均响应时间',
    };
    return labels[metricName] || metricName;
  }

  /**
   * 获取告警处理建议
   */
  getRecommendation(metricName) {
    const recommendations = {
      'cpu_usage': '建议检查系统进程，排查是否有异常进程占用大量CPU资源。',
      'memory_usage': '建议检查系统内存占用情况，清理不必要的进程或增加系统内存。',
      'disk_usage': '建议清理磁盘空间，删除不必要的文件或扩展存储容量。',
      'response_time': '建议检查应用性能，优化慢查询或增加服务器资源。',
      'error_rate': '建议检查应用日志，定位并修复导致错误的问题。',
      'connection_usage': '建议检查数据库连接池配置，优化查询或增加连接数。',
      'hit_rate': '建议检查缓存策略，优化缓存命中率。',
      'availability': '建议检查接口服务状态、网络连接和相关依赖服务。',
      'avg_response_time': '建议检查接口性能，优化慢接口或增加服务器资源。',
    };
    return recommendations[metricName] || '请及时检查并处理该告警。';
  }

  /**
   * 为告警创建消息中心通知
   */
  async createNotificationForAlert(rule, currentValue, alert) {
    try {
      const notificationService = require('../notification/notification.service');
      const { User } = require('../../models');

      // 获取所有管理员用户
      const adminUsers = await User.findAll({
        where: {
          role: 'admin',
          status: 'active',
        },
        attributes: ['id'],
      });

      if (adminUsers.length === 0) {
        console.warn('[Alert] No admin users found to send notifications');
        return;
      }

      // 构建通知内容
      const title = `【${this.getLevelLabel(rule.level)}】${rule.name}`;
      const content = `${rule.metric_name} 当前值 ${currentValue.toFixed(2)} ${rule.condition} ${rule.threshold}`;

      // 确定通知类型
      const notificationType = this.getNotificationType(rule.level);

      // 为每个管理员创建通知
      for (const user of adminUsers) {
        await notificationService.createNotification({
          user_id: user.id,
          title,
          content,
          type: notificationType,
          link: `/monitor/alerts?tab=history&alert=${alert.id}`,
        });
      }

      console.log(`[Alert] Created notifications for ${adminUsers.length} admin users`);
    } catch (error) {
      console.error('[Alert] Failed to create notification:', error);
      // 不影响告警主流程，只记录错误
    }
  }

  /**
   * 将告警级别映射到通知类型
   */
  getNotificationType(level) {
    const typeMapping = {
      info: 'info',
      warning: 'warning',
      error: 'error',
      critical: 'error',
    };
    return typeMapping[level] || 'warning';
  }
}

module.exports = new AlertService();
