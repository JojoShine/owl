'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { statsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Shield, Key, Menu, TrendingUp, Activity, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
    totalMenus: 0,
  });

  // 获取真实统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsApi.getDashboardStats();
        // axios 拦截器已经返回了 response.data，所以这里的 response 就是后端返回的完整对象
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // 如果获取失败，保持初始值 0
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: '用户管理',
      description: '管理系统用户',
      icon: Users,
      href: '/setting/users',
      count: stats.totalUsers,
      trend: '+12%',
    },
    {
      title: '角色管理',
      description: '管理用户角色',
      icon: Shield,
      href: '/setting/roles',
      count: stats.totalRoles,
      trend: '+5%',
    },
    {
      title: '权限管理',
      description: '管理系统权限',
      icon: Key,
      href: '/setting/permissions',
      count: stats.totalPermissions,
      trend: '+8%',
    },
    {
      title: '菜单管理',
      description: '管理系统菜单',
      icon: Menu,
      href: '/setting/menus',
      count: stats.totalMenus,
      trend: '+3%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 欢迎信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">数据看板</h1>
          <p className="text-muted-foreground mt-2">
            欢迎回来，{user?.real_name || user?.username}。以下是您的系统概览。
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>最后登录: {new Date().toLocaleString('zh-CN')}</span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {action.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{action.count}</div>
                <div className="flex items-center gap-2 mt-1">
                  <CardDescription className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">{action.trend}</span>
                  </CardDescription>
                </div>
                <Link href={action.href}>
                  <Button variant="ghost" size="sm" className="w-full mt-3">
                    查看详情
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 功能介绍 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>系统功能</CardTitle>
            <CardDescription>
              owl管理系统提供的核心功能模块
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {[
                { label: '用户管理', desc: '创建、编辑、删除用户，管理用户状态' },
                { label: '角色管理', desc: '配置角色和权限，实现RBAC权限控制' },
                { label: '权限管理', desc: '精细化权限控制，资源和操作管理' },
                { label: '菜单管理', desc: '动态菜单配置，支持树形结构' },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快速开始</CardTitle>
            <CardDescription>
              开始使用系统的常见操作
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {[
                { label: '创建新用户', href: '/setting/users', icon: Users },
                { label: '配置角色权限', href: '/setting/roles', icon: Shield },
                { label: '管理权限资源', href: '/setting/permissions', icon: Key },
                { label: '设置系统菜单', href: '/setting/menus', icon: Menu },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link key={index} href={item.href}>
                    <Button variant="outline" className="w-full justify-start h-11" size="default">
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                      <ArrowRight className="h-3 w-3 ml-auto" />
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 系统信息 */}
      <Card>
        <CardHeader>
          <CardTitle>系统信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">系统版本</p>
              <p className="font-medium">v1.0.0</p>
            </div>
            <div>
              <p className="text-muted-foreground">前端框架</p>
              <p className="font-medium">Next.js 15</p>
            </div>
            <div>
              <p className="text-muted-foreground">后端框架</p>
              <p className="font-medium">Express + PostgreSQL</p>
            </div>
            <div>
              <p className="text-muted-foreground">UI组件</p>
              <p className="font-medium">shadcn/ui + Tailwind CSS</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
