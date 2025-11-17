const jwt = require('jsonwebtoken');
const db = require('../../models');
const ApiError = require('../../utils/ApiError');
const { logger } = require('../../config/logger');
const captchaService = require('../captcha/captcha.service');

class AuthService {
  /**
   * 用户注册
   */
  async register(userData) {
    const { username, email, password, real_name, phone } = userData;

    // 检查用户名是否已存在
    const existingUser = await db.User.findOne({
      where: { username },
    });

    if (existingUser) {
      throw ApiError.badRequest('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await db.User.findOne({
      where: { email },
    });

    if (existingEmail) {
      throw ApiError.badRequest('邮箱已被注册');
    }

    // 如果提供了手机号，检查是否已存在
    if (phone) {
      const existingPhone = await db.User.findOne({
        where: { phone },
      });

      if (existingPhone) {
        throw ApiError.badRequest('手机号已被注册');
      }
    }

    // 创建用户
    const user = await db.User.create({
      username,
      email,
      password, // 会被model的hook自动加密
      real_name,
      phone,
    });

    // 分配默认角色（普通用户）
    const defaultRole = await db.Role.findOne({
      where: { code: 'user' },
    });

    if (defaultRole) {
      await db.UserRole.create({
        user_id: user.id,
        role_id: defaultRole.id,
      });
    }

    logger.info(`User registered: ${username}`);

    return user.toSafeJSON();
  }

  /**
   * 用户登录
   */
  async login(credentials) {
    const { username, password, captchaId, captchaCode } = credentials;

    // 验证验证码
    const isCaptchaValid = await captchaService.verifyCaptcha(captchaId, captchaCode);
    if (!isCaptchaValid) {
      throw ApiError.badRequest('验证码错误或已过期');
    }

    // 查找用户并加载角色
    const user = await db.User.findOne({
      where: { username },
      include: [
        {
          model: db.Role,
          as: 'roles',
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      throw ApiError.unauthorized('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status === 'inactive') {
      throw ApiError.forbidden('账户已被禁用');
    }

    if (user.status === 'banned') {
      throw ApiError.forbidden('账户已被封禁');
    }

    // 更新最后登录时间和IP
    await user.update({
      last_login_at: new Date(),
      // last_login_ip 需要在controller中从req获取
    });

    // 生成token
    const token = this.generateToken(user);

    logger.info(`User logged in: ${username}`);

    return {
      token,
      user: user.toSafeJSON(),
    };
  }

  /**
   * 生成JWT Token
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(userId) {
    const user = await db.User.findByPk(userId, {
      include: [
        {
          model: db.Role,
          as: 'roles',
          through: { attributes: [] },
          include: [
            {
              model: db.Permission,
              as: 'permissions',
              through: { attributes: [] },
            },
            {
              model: db.Menu,
              as: 'menus',
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) {
      throw ApiError.notFound('用户不存在');
    }

    return user.toSafeJSON();
  }

  /**
   * 修改密码
   */
  async changePassword(userId, passwords) {
    const { oldPassword, newPassword } = passwords;

    const user = await db.User.findByPk(userId);

    if (!user) {
      throw ApiError.notFound('用户不存在');
    }

    // 验证旧密码
    const isPasswordValid = await user.validatePassword(oldPassword);
    if (!isPasswordValid) {
      throw ApiError.badRequest('原密码错误');
    }

    // 更新密码
    await user.update({ password: newPassword });

    logger.info(`User changed password: ${user.username}`);

    return { message: '密码修改成功' };
  }

  /**
   * 刷新Token
   */
  async refreshToken(userId) {
    const user = await db.User.findByPk(userId);

    if (!user) {
      throw ApiError.notFound('用户不存在');
    }

    if (user.status !== 'active') {
      throw ApiError.forbidden('账户状态异常');
    }

    const token = this.generateToken(user);

    return { token };
  }
}

module.exports = new AuthService();
