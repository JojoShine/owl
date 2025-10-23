const captchaService = require('./captcha.service');
const { success } = require('../../utils/response');

class CaptchaController {
  /**
   * 生成验证码
   * GET /api/captcha
   */
  async getCaptcha(req, res, next) {
    try {
      const captcha = await captchaService.generateCaptcha();
      success(res, captcha, '获取验证码成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 验证验证码（用于测试）
   * POST /api/captcha/verify
   */
  async verifyCaptcha(req, res, next) {
    try {
      const { captchaId, captchaCode } = req.body;
      const isValid = await captchaService.verifyCaptcha(captchaId, captchaCode);

      success(res, { isValid }, isValid ? '验证码正确' : '验证码错误');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CaptchaController();
