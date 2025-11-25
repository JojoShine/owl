module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '存储的文件名（UUID+扩展名）',
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      comment: '原始文件名',
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '文件MIME类型',
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: '文件大小（字节）',
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Minio中的文件路径',
    },
    bucket: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Minio bucket名称',
    },
    folder_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '所属文件夹ID',
    },
    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '上传者ID',
    },
  }, {
    tableName: 'files',
    timestamps: true,
    underscored: true,
  });

  File.associate = (models) => {
    // 与文件夹的关系
    File.belongsTo(models.Folder, {
      foreignKey: 'folder_id',
      as: 'folder',
    });

    // 与用户的关系
    File.belongsTo(models.User, {
      foreignKey: 'uploaded_by',
      as: 'uploader',
    });

    // 与文件分享的关系
    File.hasMany(models.FileShare, {
      foreignKey: 'file_id',
      as: 'shares',
    });
  };

  // 实例方法：获取文件扩展名
  File.prototype.getExtension = function() {
    const parts = this.original_name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  // 实例方法：判断是否是图片
  File.prototype.isImage = function() {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    return imageExtensions.includes(this.getExtension());
  };

  // 实例方法：判断是否是视频
  File.prototype.isVideo = function() {
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    return videoExtensions.includes(this.getExtension());
  };

  // 实例方法：判断是否是PDF
  File.prototype.isPDF = function() {
    return this.getExtension() === 'pdf';
  };

  // 实例方法：格式化文件大小
  File.prototype.getFormattedSize = function() {
    if (!this.size) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = this.size;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  // 实例方法：转换为安全的JSON
  File.prototype.toSafeJSON = function() {
    const values = { ...this.get() };
    // 添加格式化后的文件大小
    values.formatted_size = this.getFormattedSize();
    // 添加文件扩展名
    values.extension = this.getExtension();
    // 添加文件类型标识
    values.is_image = this.isImage();
    values.is_video = this.isVideo();
    values.is_pdf = this.isPDF();
    return values;
  };

  return File;
};
