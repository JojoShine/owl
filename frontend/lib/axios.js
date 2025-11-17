import axios from 'axios';
import Router from 'next/router';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 如果是 Blob 类型响应，返回完整的 response 对象
    // 否则只返回 response.data
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response.data;
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // 未授权，只在非登录页面时跳转
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const basePath = process.env.NODE_ENV === 'production' ? '/owl' : '';
            const loginPath = `${basePath}/login`;
            const registerPath = `${basePath}/register`;

            // 如果当前不在登录页或注册页，才清除token并跳转
            if (currentPath !== loginPath && currentPath !== registerPath) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              // 使用 Router.push 实现客户端导航，自动处理 basePath
              Router.push('/login');
            }
          }
          break;
        case 403:
          console.error('没有权限访问');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器错误');
          break;
        default:
          console.error(data?.message || '请求失败');
      }
    } else if (error.request) {
      console.error('网络错误，请检查网络连接');
    } else {
      console.error('请求配置错误');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
