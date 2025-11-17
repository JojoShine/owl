'use client';

import { useState, Suspense, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { CaptchaInput } from '@/components/ui/captcha-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/theme-toggle';
import { authApi, monitorApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

// 表单验证规则
const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名或邮箱'),
  password: z.string().min(6, '密码至少6个字符'),
  captchaCode: z.string().min(1, '请输入计算结果').max(3, '计算结果不能超过3位').regex(/^-?\d+$/, '请输入有效的数字'),
});

const basePath = process.env.NODE_ENV === 'production' ? '/owl' : '';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: authLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [systemStatus, setSystemStatus] = useState(null);
  const captchaInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // 获取系统状态
  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await monitorApi.getSystemStatus();
        if (response?.data) {
          setSystemStatus(response.data);
        }
      } catch (error) {
        console.error('获取系统状态失败:', error);
        // 失败时不影响登录流程，只是不显示提示
      }
    };

    fetchSystemStatus();
  }, []);

  // 验证码变化回调
  const handleCaptchaChange = (id, code) => {
    setCaptchaId(id);
    setCaptchaCode(code);
    setValue('captchaCode', code);
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');

      // 检查验证码是否已加载
      if (!captchaId) {
        setError('验证码未加载完成，请稍候重试');
        setIsLoading(false);
        return;
      }

      // 添加验证码信息
      const loginData = {
        ...data,
        captchaId,
        captchaCode,
      };

      // 使用AuthProvider的login方法（会自动保存token和更新状态）
      const result = await authLogin(loginData);

      if (result.success) {
        // 登录成功，跳转到redirect参数指定的页面，或默认跳转到dashboard
        const redirectPath = searchParams.get('redirect') || '/dashboard';
        router.push(redirectPath);
      } else {
        setError(result.error || '登录失败，请重试');
        setIsLoading(false);
        // 登录失败后刷新验证码
        captchaInputRef.current?.refresh();
      }
    } catch (err) {
      console.error('登录错误:', err);
      setError(err.response?.data?.message || '登录失败，请检查用户名和密码');
      setIsLoading(false);
      // 登录失败后刷新验证码
      captchaInputRef.current?.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Image
              src={`${basePath}/logo.png`}
              alt="Logo"
              width={64}
              height={64}
              className="rounded-lg dark:invert"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            owl管理平台
          </CardTitle>
          <CardDescription className="text-center">
            请输入您的账号信息登录系统
          </CardDescription>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Badge variant="secondary">Next.js</Badge>
            <Badge variant="secondary">React</Badge>
            <Badge variant="secondary">Tailwind CSS</Badge>
            <Badge variant="secondary">Node.js</Badge>
            <Badge variant="secondary">PostgreSQL</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* 系统状态提示 */}
          {systemStatus && !systemStatus.redis?.available && (
            <Alert className="mb-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
              <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
                ℹ️ {systemStatus.redis.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2.5">
              <Label htmlFor="username">用户名或邮箱</Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名或邮箱"
                {...register('username')}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="password">密码</Label>
              <PasswordInput
                id="password"
                placeholder="请输入密码"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <CaptchaInput
              ref={captchaInputRef}
              onCaptchaChange={handleCaptchaChange}
              error={errors.captchaCode?.message}
              disabled={isLoading}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !captchaId}
            >
              {isLoading ? '登录中...' : !captchaId ? '加载中...' : '登录'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">还没有账号？</span>
            <Link href="/register" className="text-primary hover:underline ml-1">
              立即注册
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
