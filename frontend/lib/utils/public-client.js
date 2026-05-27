import axios from 'axios';
import { toast } from 'sonner';

const publicAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL?.replace('/system', '') + '/public' || 'http://localhost:3001/api/public',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
publicAxios.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
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

export default publicAxios;
