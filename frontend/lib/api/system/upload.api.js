import axios from '../../utils/http-client';

export const uploadApi = {
  /**
   * 上传文件到 Minio
   * @param {File} file - 文件对象
   * @param {string} category - 分类：logo, background, normal
   * @returns {Promise} - { path: 'bucket/path/to/file' }
   */
  uploadFile: (file, category = 'normal') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    return axios.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 获取文件流
   * @param {string} path - Minio 路径（包含桶名）
   * @returns {string} - 文件流 URL
   */
  getFileStreamUrl: (path) => {
    return `/api/system/upload/stream?path=${encodeURIComponent(path)}`;
  },
};
