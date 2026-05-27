'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import ImageUploader from './ImageUploader';
import { systemConfigApi } from '@/lib/api/system-config.api';
import { toast } from 'sonner';

export default function SystemInfoTab({ config, onUpdate }) {
  const [formData, setFormData] = useState({
    company_name: config?.company_name || '',
    system_name: config?.system_name || '',
    logo_url: config?.logo_url || '',
    login_bg_url: config?.login_bg_url || '',
    show_tech_stack: config?.show_tech_stack ?? true,
    registration_enabled: config?.registration_enabled ?? true,
    login_layout: config?.login_layout || 'center',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await systemConfigApi.updateConfig(formData);
      if (response.success) {
        toast.success('配置保存成功');
        onUpdate?.();
      }
    } catch (error) {
      toast.error('配置保存失败：' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file) => {
    try {
      if (file === null) {
        setFormData({ ...formData, logo_url: '' });
        toast.success('Logo 已删除');
        return;
      }

      const response = await systemConfigApi.uploadLogo(file);
      if (response.success) {
        // Backend 返回预览URL
        const previewUrl = response.data.url;
        setFormData({ ...formData, logo_url: previewUrl });
        toast.success('Logo 上传成功');
      }
    } catch (error) {
      toast.error('Logo 上传失败：' + error.message);
    }
  };

  const handleBgUpload = async (file) => {
    try {
      if (file === null) {
        setFormData({ ...formData, login_bg_url: '' });
        toast.success('登录背景已删除');
        return;
      }

      const response = await systemConfigApi.uploadLoginBg(file);
      if (response.success) {
        // Backend 返回预览URL
        const previewUrl = response.data.url;
        setFormData({ ...formData, login_bg_url: previewUrl });
        toast.success('登录背景上传成功');
      }
    } catch (error) {
      toast.error('登录背景上传失败：' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>配置系统名称和公司信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">公司名称</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                placeholder="Owl Platform"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="system_name">系统名称</Label>
              <Input
                id="system_name"
                value={formData.system_name}
                onChange={(e) =>
                  setFormData({ ...formData, system_name: e.target.value })
                }
                placeholder="Owl Platform"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>技术栈信息展示</Label>
              <p className="text-sm text-muted-foreground">
                是否在页面底部显示技术栈信息
              </p>
            </div>
            <Switch
              checked={formData.show_tech_stack}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_tech_stack: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>开放用户注册</Label>
              <p className="text-sm text-muted-foreground">
                是否在登录页显示注册入口
              </p>
            </div>
            <Switch
              checked={formData.registration_enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, registration_enabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Logo 和背景 */}
      <Card>
        <CardHeader>
          <CardTitle>Logo 和背景</CardTitle>
          <CardDescription>上传系统 Logo 和登录背景图片</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <ImageUploader
              label="系统 Logo"
              value={formData.logo_url}
              onUpload={handleLogoUpload}
              aspectRatio="square"
              maxSize={2}
              height="h-32"
            />

            <ImageUploader
              label="登录背景"
              value={formData.login_bg_url}
              onUpload={handleBgUpload}
              aspectRatio="video"
              maxSize={5}
              height="h-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* 登录页布局 */}
      <Card>
        <CardHeader>
          <CardTitle>登录页布局</CardTitle>
          <CardDescription>选择登录页的展示布局，左右布局时登录区域占 2/3，图片占 1/3</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                value: 'center',
                label: '居中布局',
                preview: (
                  <div className="w-full h-16 bg-muted rounded flex items-center justify-center">
                    <div className="w-10 h-10 bg-background border rounded" />
                  </div>
                ),
              },
              {
                value: 'left-image',
                label: '左图右登录',
                preview: (
                  <div className="w-full h-16 bg-muted rounded flex overflow-hidden">
                    <div className="w-1/3 bg-slate-300 dark:bg-slate-600" />
                    <div className="w-2/3 flex items-center justify-center">
                      <div className="w-10 h-8 bg-background border rounded" />
                    </div>
                  </div>
                ),
              },
              {
                value: 'right-image',
                label: '左登录右图',
                preview: (
                  <div className="w-full h-16 bg-muted rounded flex overflow-hidden">
                    <div className="w-2/3 flex items-center justify-center">
                      <div className="w-10 h-8 bg-background border rounded" />
                    </div>
                    <div className="w-1/3 bg-slate-300 dark:bg-slate-600" />
                  </div>
                ),
              },
            ].map((layout) => (
              <button
                key={layout.value}
                type="button"
                onClick={() => setFormData({ ...formData, login_layout: layout.value })}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  formData.login_layout === layout.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                {layout.preview}
                <p className="text-sm font-medium mt-2 text-center">{layout.label}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? '保存中...' : '保存配置'}
        </Button>
      </div>
    </form>
  );
}
