'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '../api';

// 创建认证Context
const AuthContext = createContext({});

// 自定义Hook：使用认证状态
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};

// 认证Provider组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 初始化：从localStorage加载用户信息
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
        }
      } catch (error) {
        console.error('初始化认证失败:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 监听WebSocket事件（被踢出通知）
  useEffect(() => {
    if (!user) return;

    const handleSessionKicked = (data) => {
      console.warn('Session kicked:', data);

      // 显示通知
      toast.error(
        `账户被登出 - 设备: ${data.newLogin.device}, 位置: ${data.newLogin.location}, 时间: ${data.newLogin.time}`,
        {
          duration: 10000,
        }
      );

      // 3秒后自动登出
      setTimeout(() => {
        logout();
      }, 3000);
    };

    // 监听WebSocket连接建立事件
    const handleSocketConnect = () => {
      // console.log('WebSocket connected, registering user session listener');
      // WebSocket连接时，服务端应该注册用户的socket连接
    };

    // 尝试从window获取socket实例（假设有全局WebSocket连接）
    if (typeof window !== 'undefined' && window.socket) {
      window.socket.on('session:kicked', handleSessionKicked);
      window.socket.on('connect', handleSocketConnect);

      return () => {
        window.socket.off('session:kicked', handleSessionKicked);
        window.socket.off('connect', handleSocketConnect);
      };
    }
  }, [user, router]);

  // 登录
  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      const { token, user: userData } = response.data;

      // 保存到localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // 更新状态
      setUser(userData);

      return { success: true, data: response.data };
    } catch (error) {
      console.error('登录失败:', error);
      return {
        success: false,
        error: error.response?.data?.message || '登录失败',
      };
    }
  };

  // 登出
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('登出API调用失败:', error);
    } finally {
      // 清除localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // 清除状态
      setUser(null);

      // 跳转到登录页
      router.push('/login');
    }
  };

  // 刷新用户信息
  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      const userData = response.data;

      // 更新localStorage和状态
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true, data: userData };
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      return { success: false, error: error.message };
    }
  };

  // 检查是否已登录
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  // 检查权限
  const hasPermission = (resource, action) => {
    if (!user || !user.roles) return false;

    // 超级管理员拥有所有权限
    if (user.roles.some((role) => role.code === 'super_admin')) {
      return true;
    }

    // 从用户的所有角色中收集权限并检查
    return user.roles.some((role) =>
      role.permissions?.some(
        (permission) =>
          permission.resource === resource && permission.action === action
      )
    );
  };

  // 检查角色
  const hasRole = (roleCode) => {
    if (!user || !user.roles) return false;
    return user.roles.some((role) => role.code === roleCode);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    refreshUser,
    isAuthenticated,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 工具函数：获取token
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// 工具函数：获取用户信息
export const getUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('解析用户信息失败:', error);
        return null;
      }
    }
  }
  return null;
};
