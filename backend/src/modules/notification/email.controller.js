const emailService = require('./email.service');
const { success, paginated } = require('../../utils/response');

class EmailController {
  /**
   * 获取邮件发送记录
   * GET /api/emails/logs
   */
  async getEmailLogs(req, res, next) {
    try {
      const result = await emailService.getEmailLogs(req.query);

      paginated(res, result.logs, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      }, '获取邮件记录成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 发送邮件
   * POST /api/emails/send
   */
  async sendEmail(req, res, next) {
    try {
      const { to, subject, html, text } = req.body;

      const result = await emailService.sendEmailWithRetry({ to, subject, html, text });

      success(res, result, '邮件发送成功', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 使用模板发送邮件
   * POST /api/emails/send-with-template
   */
  async sendEmailWithTemplate(req, res, next) {
    try {
      const { to, templateName, variables } = req.body;

      const result = await emailService.sendEmailWithTemplate({
        to,
        templateName,
        variables,
      });

      success(res, result, '邮件发送成功', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 发送测试邮件
   * POST /api/emails/test
   */
  async sendTestEmail(req, res, next) {
    try {
      const { toEmail } = req.body;

      const result = await emailService.sendTestEmail(toEmail);

      success(res, result, '测试邮件发送成功', 201);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmailController();
