'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/**
 * 获取默认邮件模板内容（优化的卡片样式）
 */
function getDefaultTemplateContent() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- 邮件卡片容器 -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- 红色顶部标题栏 -->
          <tr>
            <td style="background: linear-gradient(135deg, #d32f2f 0%, #f44336 100%); padding: 24px 32px; color: #ffffff;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">
                {{title}}
              </h1>
            </td>
          </tr>

          <!-- 内容区域 -->
          <tr>
            <td style="padding: 32px; color: #333333; font-size: 14px; line-height: 1.6;">
              {{{content}}}
            </td>
          </tr>

          <!-- 底部信息栏 -->
          <tr>
            <td style="background-color: #fafafa; padding: 20px 32px; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; font-size: 12px; color: #999999; text-align: center;">
                此邮件由系统自动发送，请勿回复
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #999999; text-align: center;">
                Common Management Platform &copy; 2025
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 邮件模版表单对话框
 * 新设计：使用预定义变量，不需要用户手动添加变量
 */
export default function EmailTemplateFormDialog({ open, onOpenChange, template, onSave, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    description: '',
  });

  // 当模版数据变化时更新表单
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        subject: template.subject || '',
        content: template.content || '',
        description: template.description || '',
      });
    } else {
      // 重置表单，使用优化的默认模板
      setFormData({
        name: '',
        subject: '',
        content: getDefaultTemplateContent(),
        description: '',
      });
    }
  }, [template]);

  /**
   * 提交表单
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {template ? '编辑邮件模版' : '创建邮件模版'}
          </DialogTitle>
          <DialogDescription>
            模版仅支持 {'{{'}title{'}}'} 与 {'{{'}content{'}}'} 两个占位符
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 pr-2">
              {/* 表单字段 */}
              <div className="space-y-4">
                {/* 模版名称 */}
                <div className="space-y-2">
                  <Label htmlFor="template-name">
                    模版名称 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="template-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：接口监控告警模版"
                    required
                    disabled={!!template} // 编辑时不允许修改名称
                  />
                  {template && (
                    <p className="text-xs text-muted-foreground">
                      模版名称创建后不可修改
                    </p>
                  )}
                </div>

                {/* 邮件主题 */}
                <div className="space-y-2">
                  <Label htmlFor="template-subject">
                    邮件主题 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="template-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="例如：【告警】{{title}}"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    主题中可引用 {'{{'}title{'}}'}
                  </p>
                </div>

                {/* 邮件内容 */}
                <div className="space-y-2">
                  <Label htmlFor="template-content">
                    邮件内容 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="template-content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="示例模板（注意 content 使用三重大括号）：&#10;&#10;<div style=&quot;padding: 20px;&quot;>&#10;  <h2>{{title}}</h2>&#10;  <div>{{{content}}}</div>&#10;</div>"
                    rows={12}
                    className="font-mono text-sm"
                    required
                  />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      支持 HTML 内容；可使用的占位符：
                    </p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5 ml-2">
                      <li>
                        <code className="bg-muted px-1 rounded">{'{{'}title{'}}'}</code> - 告警标题（自动转义HTML）
                      </li>
                      <li>
                        <code className="bg-muted px-1 rounded">{'{{{'}content{'}}}'}</code> - 告警内容（<strong className="text-orange-600">必须使用三重大括号</strong>，保留HTML格式）
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 描述 */}
                <div className="space-y-2">
                  <Label htmlFor="template-description">描述</Label>
                  <Textarea
                    id="template-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="模版的用途说明（可选）"
                    rows={2}
                  />
                </div>
              </div>

            </div>
          </div>

          <DialogFooter className="mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : template ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
