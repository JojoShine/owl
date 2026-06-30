import axios from 'axios';
import { toast } from 'sonner';
import { getStorageKey } from './storage-key';
import { getPath } from './api-url';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?
    process.env.NEXT_PUBLIC_API_URL.replace('/system', '') :
    'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从localStorage获取token（使用命名空间化的key）
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(getStorageKey('token'));
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
            localStorage.removeItem(getStorageKey('token'));
            localStorage.removeItem(getStorageKey('user'));
            toast.error(data?.message || '登录已过期，请重新登录');
            setTimeout(() => {
              window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/login`;
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
      toast.error('网络连接失败，请检查网络');
    } else {
      toast.error('请求出错，请稍后重试');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;