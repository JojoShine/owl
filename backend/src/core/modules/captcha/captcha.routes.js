const express = require('express');
const router = express.Router();
const captchaController = require('./captcha.controller');

/**
 * @route   GET /api/captcha
 * @desc    获取验证码
 * @access  Public
 */
router.get('/', captchaController.getCaptcha);

/**
 * @route   POST /api/captcha/verify
 * @desc    验证验证码（测试用）
 * @access  Public
 */
router.post('/verify', captchaController.verifyCaptcha);

module.exports = router;
