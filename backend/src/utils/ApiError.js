/**
 * 自定义API错误类
 * 用于抛出带有HTTP状态码的错误
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }

  // 静态方法：创建400错误
  static badRequest(message = 'Bad Request', errors = null) {
    return new ApiError(400, message, errors);
  }

  // 静态方法：创建401错误
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  // 静态方法：创建403错误
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  // 静态方法：创建404错误
  static notFound(message = 'Not Found') {
    return new ApiError(404, message);
  }

  // 静态方法：创建409错误
  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  // 静态方法：创建422错误
  static validationError(message = 'Validation Error', errors = null) {
    return new ApiError(422, message, errors);
  }

  // 静态方法：创建429错误
  static tooManyRequests(message = 'Too Many Requests') {
    return new ApiError(429, message);
  }

  // 静态方法：创建500错误
  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
