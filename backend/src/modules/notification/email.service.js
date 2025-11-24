const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const { EmailLog, EmailTemplate } = require('../../models');
const { logger } = require('../../config/logger');

/**
 * 邮件服务
 * 负责邮件发送、模板渲染和日志记录
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  /**
   * 初始化SMTP传输器
   */
  initTransporter() {
    try {
      // 从环境变量读取SMTP配置
      const smtpConfig = {
        host: process.env.SMTP_HOST || 'smtp.163.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE === 'true' || true, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD, // 163邮箱授权码
        },
      };

      // 验证配置是否完整
      if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
        logger.warn('SMTP配置不完整，邮件发送功能将不可用');
        logger.warn('请在.env文件中配置 SMTP_USER 和 SMTP_PASSWORD');
        return;
      }

      this.transporter = nodemailer.createTransport(smtpConfig);

      // 验证SMTP连接（静默失败，不影响应用启动）
      this.transporter.verify((error, success) => {
        if (error) {
          logger.warn('SMTP连接验证失败，邮件功能将不可用');
          logger.debug('SMTP错误详情:', error.message);
          // 连接失败时清空 transporter，避免后续调用出错
          this.transporter = null;
        } else {
          logger.info('SMTP连接验证成功，邮件服务已就绪');
        }
      });
    } catch (error) {
      logger.error('初始化SMTP传输器失败:', error);
    }
  }

  /**
   * 检查邮件服务是否可用
   * @returns {boolean}
   */
  isEmailAvailable() {
    return this.transporter !== null;
  }

  /**
   * 发送普通邮件
   * @param {Object} emailData - 邮件数据
   * @param {String} emailData.to - 收件人邮箱
   * @param {String} emailData.subject - 邮件主题
   * @param {String} emailData.html - 邮件HTML内容
   * @param {String} emailData.text - 邮件纯文本内容 (可选)
   * @returns {Promise<Object>} 发送结果
   */
  async sendEmail(emailData) {
    const logData = {
      to_email: emailData.to,
      subject: emailData.subject,
      content: emailData.html || emailData.text,
      status: 'pending',
      retry_count: 0,
      template_name: emailData.templateName || null,
    };

    try {
      // 检查传输器是否可用
      if (!this.transporter) {
        const errorMsg = 'SMTP 服务未配置，无法发送邮件。请配置 SMTP_USER 和 SMTP_PASSWORD';
        logger.warn(errorMsg);

        // 记录失败日志
        logData.status = 'failed';
        logData.error_message = errorMsg;
        await EmailLog.create(logData);

        return {
          success: false,
          error: errorMsg,
          message: '邮件服务未配置',
        };
      }

      // 构建邮件选项
      const mailOptions = {
        from: {
          name: process.env.SMTP_FROM_NAME || 'Common Management Platform',
          address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
        },
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
    };

      // 发送邮件
      const info = await this.transporter.sendMail(mailOptions);

      // 记录成功日志
      logData.status = 'sent';
      logData.sent_at = new Date();
      await EmailLog.create(logData);

      logger.info(`邮件发送成功: ${emailData.to} - ${emailData.subject}`);

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      // 记录失败日志
      logData.status = 'failed';
      logData.error_message = error.message;
      await EmailLog.create(logData);

      logger.error(`邮件发送失败: ${emailData.to} - ${emailData.subject}`, error);

      throw new Error(`邮件发送失败: ${error.message}`);
    }
  }

  /**
   * 使用模板发送邮件
   * @param {Object} emailData - 邮件数据
   * @param {String} emailData.to - 收件人邮箱
   * @param {String} emailData.templateName - 模板名称
   * @param {Object} emailData.variables - 模板变量
   * @returns {Promise<Object>} 发送结果
   */
  async sendEmailWithTemplate(emailData) {
    try {
      // 查找邮件模板
      const template = await EmailTemplate.findOne({
        where: { name: emailData.templateName },
      });

      if (!template) {
        throw new Error(`邮件模板不存在: ${emailData.templateName}`);
      }

      // 渲染模板
      const subjectTemplate = handlebars.compile(template.subject);
      const contentTemplate = handlebars.compile(template.content);

      const subject = subjectTemplate(emailData.variables || {});
      const html = contentTemplate(emailData.variables || {});

      // 发送邮件
      const result = await this.sendEmail({
        to: emailData.to,
        subject,
        html,
        templateName: template.name,
      });

      return result;
    } catch (error) {
      throw new Error(`使用模板发送邮件失败: ${error.message}`);
    }
  }

  /**
   * 使用固定变量的告警邮件发送
   * @param {Object} payload - 邮件数据
   * @param {String} payload.templateId - 模板ID（可选）
   * @param {Array<String>} payload.recipients - 收件人列表
   * @param {String} payload.title - 告警标题
   * @param {String} payload.content - 告警内容（HTML）
   */
  async sendAlertEmail(payload) {
    const { templateId, recipients, title, content } = payload;

    // 检查邮件服务是否可用
    if (!this.isEmailAvailable()) {
      const errorMsg = '邮件服务未配置，无法发送告警邮件';
      logger.warn(errorMsg);
      return {
        success: false,
        error: errorMsg,
        total: recipients?.length || 0,
        successCount: 0,
        failedCount: recipients?.length || 0,
      };
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      throw new Error('告警邮件发送失败：缺少接收人');
    }

    const sanitizedTitle = title || '系统告警通知';
    const sanitizedContent = content || '';

    let subject = sanitizedTitle;
    let html = this.wrapAlertContent(sanitizedTitle, sanitizedContent);
    let templateName = null;

    if (templateId) {
      const template = await EmailTemplate.findByPk(templateId);

      if (!template) {
        throw new Error(`告警邮件模板不存在，ID: ${templateId}`);
      }

      templateName = template.name;

      const variables = {
        title: sanitizedTitle,
        content: sanitizedContent,
      };

      const subjectTemplate = handlebars.compile(template.subject);
      const contentTemplate = handlebars.compile(template.content);

      subject = subjectTemplate(variables);
      html = contentTemplate(variables);
    }

    const results = await Promise.allSettled(
      recipients.map((recipient) =>
        this.sendEmail({
          to: recipient,
          subject,
          html,
          templateName,
        })
      )
    );

    const successCount = results.filter((item) => item.status === 'fulfilled').length;
    const failedCount = results.length - successCount;

    if (failedCount > 0) {
      logger.warn(`部分告警邮件发送失败：成功 ${successCount}，失败 ${failedCount}`);
    } else {
      logger.info(`告警邮件发送成功：共 ${successCount} 封`);
    }

    return {
      success: failedCount === 0,
      total: results.length,
      successCount,
      failedCount,
      results,
    };
  }

  /**
   * 告警内容默认包装
   */
  wrapAlertContent(title, content) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 16px; background-color: #f6f8fa;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
          <h2 style="margin-top: 0; font-size: 20px; color: #d4380d;">${title}</h2>
          <div style="font-size: 14px; color: #333333; line-height: 1.6;">
            ${content}
          </div>
        </div>
        <p style="margin-top: 16px; font-size: 12px; color: #999999; text-align: center;">此邮件由监控系统自动发送，请勿回复。</p>
      </div>
    `;
  }

  /**
   * 发送邮件（带重试机制）
   * @param {Object} emailData - 邮件数据
   * @param {Number} maxRetries - 最大重试次数 (默认3次)
   * @returns {Promise<Object>} 发送结果
   */
  async sendEmailWithRetry(emailData, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.sendEmail(emailData);

        // 发送成功，返回结果
        return result;
      } catch (error) {
        lastError = error;

        logger.warn(`邮件发送失败（第${attempt}次尝试）: ${error.message}`);

        // 如果不是最后一次尝试，等待一段时间后重试
        if (attempt < maxRetries) {
          const delay = attempt * 2000; // 递增延迟：2秒、4秒、6秒
          await new Promise(resolve => setTimeout(resolve, delay));

          // 更新重试次数
          await EmailLog.update(
            { retry_count: attempt },
            {
              where: {
                to_email: emailData.to,
                subject: emailData.subject,
                status: 'failed',
              },
              order: [['created_at', 'DESC']],
              limit: 1,
            }
          );
        }
      }
    }

    // 所有重试都失败了
    throw new Error(`邮件发送失败（已重试${maxRetries}次）: ${lastError.message}`);
  }

  /**
   * 使用模板ID发送邮件给多个接收人
   * @param {String} templateId - 模板ID
   * @param {Array<String>} recipients - 接收人邮箱列表
   * @param {Object} variables - 模板变量
   * @returns {Promise<Object>} 发送结果
   */
  async sendEmailByTemplate(templateId, recipients, variables = {}) {
    try {
      // 查找邮件模板
      const template = await EmailTemplate.findByPk(templateId);

      if (!template) {
        throw new Error(`邮件模板不存在，ID: ${templateId}`);
      }

      // 渲染模板
      const subjectTemplate = handlebars.compile(template.subject);
      const contentTemplate = handlebars.compile(template.content);

      const subject = subjectTemplate(variables);
      const html = contentTemplate(variables);

      // 发送给所有接收人
      const results = await Promise.allSettled(
        recipients.map(recipient =>
          this.sendEmail({
            to: recipient,
            subject,
            html,
          })
        )
      );

      // 统计发送结果
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failedCount = results.filter(r => r.status === 'rejected').length;

      logger.info(`批量邮件发送完成: 成功 ${successCount}, 失败 ${failedCount}`);

      return {
        success: failedCount === 0,
        total: recipients.length,
        successCount,
        failedCount,
        results,
      };
    } catch (error) {
      throw new Error(`使用模板发送邮件失败: ${error.message}`);
    }
  }

  /**
   * 测试邮件发送功能
   * @param {String} toEmail - 测试收件人邮箱
   * @returns {Promise<Object>} 发送结果
   */
  async sendTestEmail(toEmail) {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>邮件服务测试</h2>
          <p>这是一封测试邮件，用于验证邮件服务配置是否正确。</p>
          <p>如果您收到这封邮件，说明邮件服务配置成功！</p>
          <hr />
          <p style="color: #666; font-size: 12px;">
            发送时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
          </p>
        </div>
      `;

      return await this.sendEmail({
        to: toEmail,
        subject: '邮件服务测试 - Common Management Platform',
        html,
        text: '这是一封测试邮件，用于验证邮件服务配置是否正确。',
      });
    } catch (error) {
      throw new Error(`发送测试邮件失败: ${error.message}`);
    }
  }

  /**
   * 获取邮件发送日志
   * @param {Object} options - 查询选项
   * @param {Number} options.page - 页码
   * @param {Number} options.limit - 每页数量
   * @param {String} options.status - 状态筛选 (可选)
   * @param {String} options.toEmail - 收件人筛选 (可选)
   * @returns {Promise<Object>} { logs, total, page, limit }
   */
  async getEmailLogs(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        toEmail,
      } = options;

      const offset = (page - 1) * limit;

      // 构建查询条件
      const where = {};

      if (status) {
        where.status = status;
      }

      if (toEmail) {
        where.to_email = toEmail;
      }

      // 查询日志列表
      const { rows: logs, count: total } = await EmailLog.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        logs,
        total,
        page: parseInt(page),
        pageSize: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(`获取邮件日志失败: ${error.message}`);
    }
  }
}

module.exports = new EmailService();
