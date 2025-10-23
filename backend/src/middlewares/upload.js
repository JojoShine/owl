const multer = require('multer');
const path = require('path');
const { AppError } = require('./error');

// 允许的文件类型（MIME类型）
const ALLOWED_MIME_TYPES = [
  // 图片
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  // 文档
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // 文本
  'text/plain',
  'text/csv',
  'text/html',
  'text/css',
  'text/javascript',
  'application/json',
  'application/xml',
  // 压缩文件
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
  // 视频
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-flv',
  'video/webm',
  'video/x-matroska',
  // 音频
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/webm',
];

// 文件大小限制（默认 100MB）
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024;

// 配置 multer 使用内存存储
const storage = multer.memoryStorage();

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 修复文件名编码问题：Multer 默认使用 latin1 解析，需要转换为 UTF-8
  if (file.originalname) {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
  }

  // 检查文件类型
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new AppError(
        `不支持的文件类型: ${file.mimetype}。请上传支持的文件格式。`,
        400
      ),
      false
    );
  }

  // 检查文件名
  if (!file.originalname || file.originalname.length === 0) {
    return cb(new AppError('无效的文件名', 400), false);
  }

  cb(null, true);
};

// 创建 multer 实例
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // 单次最多上传10个文件
  },
  fileFilter: fileFilter,
});

// 单文件上传中间件
const uploadSingle = (fieldName = 'file') => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);

    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer 错误处理
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new AppError(
              `文件大小超过限制。最大允许: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
              400
            )
          );
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new AppError('上传文件数量超过限制', 400));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError(`意外的字段名: ${err.field}`, 400));
        }
        return next(new AppError(err.message, 400));
      } else if (err) {
        // 其他错误
        return next(err);
      }

      // 检查是否有文件上传
      if (!req.file) {
        return next(new AppError('请选择要上传的文件', 400));
      }

      next();
    });
  };
};

// 多文件上传中间件
const uploadMultiple = (fieldName = 'files', maxCount = 10) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);

    multipleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer 错误处理
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new AppError(
              `文件大小超过限制。最大允许: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
              400
            )
          );
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(
            new AppError(`上传文件数量超过限制。最多允许: ${maxCount}个文件`, 400)
          );
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError(`意外的字段名: ${err.field}`, 400));
        }
        return next(new AppError(err.message, 400));
      } else if (err) {
        // 其他错误
        return next(err);
      }

      // 检查是否有文件上传
      if (!req.files || req.files.length === 0) {
        return next(new AppError('请选择要上传的文件', 400));
      }

      next();
    });
  };
};

// 验证文件扩展名
const validateFileExtension = (filename, allowedExtensions) => {
  const ext = path.extname(filename).toLowerCase().slice(1);
  return allowedExtensions.includes(ext);
};

// 获取安全的文件名（移除特殊字符）
const getSafeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // 替换特殊字符为下划线
    .replace(/_+/g, '_') // 合并多个下划线
    .replace(/^_|_$/g, ''); // 移除首尾下划线
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  validateFileExtension,
  getSafeFilename,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
};
