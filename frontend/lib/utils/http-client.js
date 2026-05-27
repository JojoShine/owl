import axios from 'axios';
import { toast } from 'sonner';

// GET 请求缓存（30秒）
const requestCache = new Map();
const CACHE_DURATION = 30 * 1000; // 30秒

const getCacheKey = (config) => {
  return `${config.method.toUpperCase()}:${config.url}:${JSON.stringify(config.params || {})}`;
};

const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/system',
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
          // Token过期，直接跳转到登录页
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // 显示提示信息
            toast.error(data?.message || '登录已过期，请重新登录');
            // 直接跳转到登录页
            setTimeout(() => {
              window.location.href = '/login';
            }, 500);
          }
          break;
        case 403:
          toast.error('您没有权限访问此资源');
          break;
        case 404:
          toast.error('请求的资源不存在');
          break;
        case 500:
          toast.error('服务器出错，请稍后重试');
          break;
        default:
          toast.error(data?.message || '请求失败，请重试');
      }
    } else if (error.request) {
      // 网络错误
      toast.error('网络连接失败，请检查网络');
    } else {
      // 请求配置错误
      toast.error('请求出错，请稍后重试');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// 获取 API 服务器的基础 URL（用于访问静态资源）
export const getApiBaseUrl = () => {
  // 优先使用独立的 BASE_URL 配置
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 降级方案：从 API_URL 推导，移除 /api 或 /api/system 后缀
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/system';
  return apiUrl.replace(/\/api(\/system)?$/, '');
};

// 获取静态资源的前缀路径
export const getStaticResourcePrefix = () => {
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
};