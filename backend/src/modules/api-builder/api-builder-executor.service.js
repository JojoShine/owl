const db = require('../../models');
const ApiError = require('../../utils/ApiError');
const { logger } = require('../../config/logger');

class ApiBuilderExecutorService {
  /**
   * 执行接口SQL查询
   * @param {Object} interface_ - 接口配置对象
   * @param {Object} params - 请求参数
   * @param {string} ipAddress - 请求来源IP
   * @returns {Promise<Object>} 查询结果
   */
  async executeInterface(interface_, params, ipAddress = null) {
    const startTime = Date.now();
    let responseCode = 200;
    let errorMessage = null;
    let result = null;

    try {
      // 验证接口状态
      if (interface_.status === 'inactive') {
        throw ApiError.forbidden('接口已禁用');
      }

      // 验证参数
      if (interface_.parameters && Array.isArray(interface_.parameters)) {
        this.validateParameters(params, interface_.parameters);
      }

      // 替换SQL中的参数
      const sqlQuery = this.bindParameters(interface_.sql_query, params, interface_.parameters);

      // 执行SQL查询（只允许SELECT）
      const [rows] = await db.sequelize.query(sqlQuery, {
        type: 'SELECT',
      });

      result = rows;
      responseCode = 200;

      logger.info(`API executed successfully: ${interface_.endpoint} v${interface_.version}`);
    } catch (error) {
      responseCode = error.statusCode || 500;
      errorMessage = error.message || 'SQL execution failed';
      logger.error(`Error executing API: ${interface_.endpoint}`, error);
      throw error;
    } finally {
      // 异步记录日志（不阻塞响应）
      const responseTime = Date.now() - startTime;
      this.logApiCall(interface_.id, null, 'SELECT', params, responseCode, responseTime, errorMessage, ipAddress);
    }

    return result;
  }

  /**
   * 测试接口（带日志记录）
   */
  async testInterface(interface_, params, ipAddress = null, apiKeyId = null) {
    const startTime = Date.now();
    let responseCode = 200;
    let errorMessage = null;
    let result = null;

    try {
      // 验证接口状态
      if (interface_.status === 'inactive') {
        throw ApiError.forbidden('接口已禁用');
      }

      // 验证参数
      if (interface_.parameters && Array.isArray(interface_.parameters)) {
        this.validateParameters(params, interface_.parameters);
      }

      // 替换SQL中的参数
      const sqlQuery = this.bindParameters(interface_.sql_query, params, interface_.parameters);

      // 执行SQL查询
      const [rows] = await db.sequelize.query(sqlQuery, {
        type: 'SELECT',
      });

      result = rows;
      responseCode = 200;

      logger.info(`API test successful: ${interface_.endpoint} v${interface_.version}`);
    } catch (error) {
      responseCode = error.statusCode || 500;
      errorMessage = error.message || 'SQL execution failed';
      logger.error(`Error testing API: ${interface_.endpoint}`, error);
      throw error;
    } finally {
      // 异步记录日志
      const responseTime = Date.now() - startTime;
      this.logApiCall(interface_.id, apiKeyId, 'SELECT', params, responseCode, responseTime, errorMessage, ipAddress);
    }

    return result;
  }

  /**
   * 验证请求参数是否满足定义要求
   */
  validateParameters(requestParams = {}, paramDefinitions = []) {
    for (const paramDef of paramDefinitions) {
      const { name, required, type } = paramDef;

      // 检查必需参数
      if (required && (requestParams[name] === undefined || requestParams[name] === null || requestParams[name] === '')) {
        throw ApiError.badRequest(`参数 ${name} 是必需的`);
      }

      // 检查参数类型
      if (requestParams[name] !== undefined && requestParams[name] !== null && type) {
        this.validateParameterType(requestParams[name], type, name);
      }
    }
  }

  /**
   * 验证单个参数的类型
   */
  validateParameterType(value, expectedType, paramName) {
    const normalizedType = expectedType.toLowerCase();
    let valid = false;

    switch (normalizedType) {
      case 'string':
        valid = typeof value === 'string';
        break;
      case 'number':
      case 'int':
      case 'integer':
        valid = !isNaN(value) && (typeof value === 'number' || !isNaN(parseFloat(value)));
        break;
      case 'boolean':
        valid = typeof value === 'boolean' || value === 'true' || value === 'false';
        break;
      case 'date':
        valid = !isNaN(Date.parse(value));
        break;
      default:
        valid = true;
    }

    if (!valid) {
      throw ApiError.badRequest(`参数 ${paramName} 类型不正确，期望 ${expectedType}`);
    }
  }

  /**
   * 将参数绑定到SQL查询中
   * 使用 :paramName 的格式进行参数替换
   */
  bindParameters(sqlQuery, requestParams = {}, paramDefinitions = []) {
    let boundSql = sqlQuery;

    // 如果有参数定义，遍历它们进行替换
    if (paramDefinitions && Array.isArray(paramDefinitions)) {
      for (const paramDef of paramDefinitions) {
        const { name } = paramDef;
        const value = requestParams[name];

        if (value !== undefined && value !== null) {
          // 转义参数值以防止SQL注入
          const escapedValue = this.escapeSqlValue(value);
          const placeholder = new RegExp(`:${name}\\b`, 'g');
          boundSql = boundSql.replace(placeholder, escapedValue);
        }
      }
    }

    // 替换所有剩余的参数占位符（如果有的话）
    boundSql = boundSql.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, paramName) => {
      const value = requestParams[paramName];
      if (value !== undefined && value !== null) {
        return this.escapeSqlValue(value);
      }
      return match; // 保留未找到的占位符
    });

    return boundSql;
  }

  /**
   * 转义SQL值，防止SQL注入
   */
  escapeSqlValue(value) {
    if (value === null || value === undefined) {
      return 'NULL';
    }

    if (typeof value === 'number') {
      return String(value);
    }

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    // 对字符串进行转义
    const stringValue = String(value);
    // 双引号转义（PostgreSQL）
    const escaped = stringValue.replace(/'/g, "''");
    return `'${escaped}'`;
  }

  /**
   * 异步记录API调用日志
   * 不阻塞主流程
   */
  logApiCall(interfaceId, apiKeyId, method, params, responseCode, responseTime, errorMessage, ipAddress) {
    // 异步执行，不等待完成
    setImmediate(async () => {
      try {
        // 这里可以保存到文件或其他存储
        // 目前仅记录到日志
        logger.info('API Call Log', {
          interfaceId,
          apiKeyId,
          method,
          responseCode,
          responseTime,
          errorMessage,
          ipAddress,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Error logging API call:', error);
      }
    });
  }
}

module.exports = new ApiBuilderExecutorService();