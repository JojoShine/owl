const svgCaptcha = require('svg-captcha');
const { v4: uuidv4 } = require('uuid');
const { redisClient } = require('../../config/redis');

class CaptchaService {
  constructor() {
    // 算术验证码配置
    this.mathCaptchaConfig = {
      mathMin: 1,            // 最小数字
      mathMax: 10,           // 最大数字
      mathOperator: '+|-',   // 运算符：加减法
      width: 150,            // 宽度
      height: 40,            // 高度（与input高度一致）
      fontSize: 50,          // 字体大小（增大以更清晰）
      color: true,           // 彩色验证码
      background: '#f7f8fa', // 背景色
      noise: 0,              // 干扰线数量（去除干扰线，让运算符更清晰）
      charPreset: '0123456789+-', // 只使用数字和运算符
    };

    this.captchaPrefix = 'captcha:';
    this.captchaExpire = 300; // 5分钟过期（秒）
  }

  /**
   * 生成算术验证码
   * @returns {Promise<{captchaId: string, captchaSvg: string}>}
   */
  async generateCaptcha() {
    try {
      // 生成数学表达式验证码
      const captcha = svgCaptcha.createMathExpr(this.mathCaptchaConfig);

      // 生成唯一ID
      const captchaId = uuidv4();

      // 存储验证码答案到Redis
      // captcha.text 是计算结果（答案）
      const key = `${this.captchaPrefix}${captchaId}`;
      await redisClient.setEx(key, this.captchaExpire, captcha.text);

      return {
        captchaId,
        captchaSvg: captcha.data,
      };
    } catch (error) {
      throw new Error(`生成验证码失败: ${error.message}`);
    }
  }

  /**
   * 验证算术验证码
   * @param {string} captchaId - 验证码ID
   * @param {string} captchaCode - 用户输入的答案
   * @returns {Promise<boolean>}
   */
  async verifyCaptcha(captchaId, captchaCode) {
    try {
      if (!captchaId || !captchaCode) {
        return false;
      }

      // 从Redis获取验证码答案
      const key = `${this.captchaPrefix}${captchaId}`;
      const storedAnswer = await redisClient.get(key);

      if (!storedAnswer) {
        // 验证码不存在或已过期
        return false;
      }

      // 删除已使用的验证码（一次性使用）
      await redisClient.del(key);

      // 验证答案（转换为数字比较，避免字符串问题）
      const userAnswer = parseInt(captchaCode, 10);
      const correctAnswer = parseInt(storedAnswer, 10);

      return !isNaN(userAnswer) && userAnswer === correctAnswer;
    } catch (error) {
      throw new Error(`验证验证码失败: ${error.message}`);
    }
  }

  /**
   * 清除过期验证码
   * Redis会自动清除，这个方法主要用于手动清理或测试
   */
  async clearExpiredCaptchas() {
    try {
      const pattern = `${this.captchaPrefix}*`;
      const keys = await redisClient.keys(pattern);

      if (keys.length > 0) {
        await redisClient.del(keys);
      }

      return { cleared: keys.length };
    } catch (error) {
      throw new Error(`清除验证码失败: ${error.message}`);
    }
  }
}

module.exports = new CaptchaService();
