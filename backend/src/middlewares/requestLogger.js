const morgan = require('morgan');
const { accessLogger, operationLogger } = require('../config/logger');

// 访问日志中间件
const accessLogMiddleware = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
  {
    stream: {
      write: (message) => accessLogger.http(message.trim()),
    },
  }
);

// 操作日志中间件
const operationLogMiddleware = (req, res, next) => {
  // 记录操作日志（POST, PUT, DELETE请求）
  const oldSend = res.send;

  res.send = function (data) {
    res.send = oldSend;

    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      operationLogger.info(
        JSON.stringify({
          user: req.user?.id || 'anonymous',
          method: req.method,
          url: req.originalUrl,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          body: req.body,
          timestamp: new Date().toISOString(),
        })
      );
    }

    return res.send(data);
  };

  next();
};

module.exports = {
  accessLogMiddleware,
  operationLogMiddleware,
};