const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const { combine, timestamp, printf, colorize, errors } = winston.format;

// 自定义日志格式
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// 操作日志传输器
const operationTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/operation/operation-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'info',
});

// 系统日志传输器
const systemTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/system/system-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'info',
});

// 错误日志传输器
const errorTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/error/error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
});

// 访问日志传输器
const accessTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/access/access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'http',
});

// 登录日志传输器
const loginTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/login/login-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'info',
});

// 创建logger实例
const logger = winston.createLogger({
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    systemTransport,
    errorTransport,
  ],
});

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    })
  );
}

// 操作日志logger
const operationLogger = winston.createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [operationTransport],
});

// 访问日志logger
const accessLogger = winston.createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [accessTransport],
});

// 登录日志logger
const loginLogger = winston.createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [loginTransport],
});

module.exports = {
  logger,
  operationLogger,
  accessLogger,
  loginLogger,
};