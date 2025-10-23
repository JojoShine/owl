'use client';

import { useState, useEffect, forwardRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { Label } from './label';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * 验证码输入组件
 *
 * @param {Object} props
 * @param {Function} props.onCaptchaChange - 验证码变化回调 (captchaId, captchaCode) => void
 * @param {string} props.error - 错误信息
 * @param {boolean} props.disabled - 是否禁用
 */
export const CaptchaInput = forwardRef(({ onCaptchaChange, error, disabled, ...props }, ref) => {
  const [captchaId, setCaptchaId] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 获取验证码
  const fetchCaptcha = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/captcha`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setCaptchaId(result.data.captchaId);
        setCaptchaSvg(result.data.captchaSvg);
        setCaptchaCode(''); // 清空输入框
      } else {
        console.error('获取验证码失败:', result.message);
      }
    } catch (error) {
      console.error('获取验证码出错:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时获取验证码
  useEffect(() => {
    fetchCaptcha();
  }, []);

  // 验证码输入变化时通知父组件
  useEffect(() => {
    if (onCaptchaChange && captchaId) {
      onCaptchaChange(captchaId, captchaCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captchaId, captchaCode]);

  // 刷新验证码
  const handleRefresh = () => {
    fetchCaptcha();
  };

  // 输入框变化（算术验证码只接受数字）
  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9-]/g, ''); // 只允许数字和负号
    if (value.length <= 3) { // 答案最多3位数（-10 到 20）
      setCaptchaCode(value);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="captcha">验证码</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            id="captcha"
            name="captcha"
            ref={ref}
            type="text"
            placeholder="请输入计算结果"
            value={captchaCode}
            onChange={handleInputChange}
            disabled={disabled || isLoading}
            maxLength={3}
            className={error ? 'border-red-500' : ''}
            autoComplete="off"
            {...props}
          />
        </div>

        {/* 验证码图片 */}
        <div
          className="relative flex items-center justify-center bg-muted rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity"
          style={{ width: '150px', height: '40px' }}
          onClick={handleRefresh}
          title="点击刷新验证码"
        >
          {isLoading ? (
            <div className="text-xs text-muted-foreground">加载中...</div>
          ) : captchaSvg ? (
            <div
              dangerouslySetInnerHTML={{ __html: captchaSvg }}
              className="w-full h-full flex items-center justify-center"
            />
          ) : (
            <div className="text-xs text-muted-foreground">无验证码</div>
          )}
        </div>

        {/* 刷新按钮 */}
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={handleRefresh}
          disabled={disabled || isLoading}
          title="刷新验证码"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

CaptchaInput.displayName = 'CaptchaInput';
