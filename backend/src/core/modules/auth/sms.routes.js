const express = require('express');
const router = express.Router();
const smsController = require('./sms.controller');
const { authenticate } = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const smsValidation = require('./sms.validation');

/**
 * @route POST /api/auth/sms/send-code
 * @desc 发送短信验证码
 * @access Public
 */
router.post(
  '/send-code',
  validate(smsValidation.sendCode),
  smsController.sendCode
);

/**
 * @route POST /api/auth/sms/register
 * @desc 短信验证码注册
 * @access Public
 */
router.post(
  '/register',
  validate(smsValidation.register),
  smsController.register
);

/**
 * @route POST /api/auth/sms/login
 * @desc 短信验证码登录
 * @access Public
 */
router.post(
  '/login',
  validate(smsValidation.login),
  smsController.login
);

module.exports = router;
