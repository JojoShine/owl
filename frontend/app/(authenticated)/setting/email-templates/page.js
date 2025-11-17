'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Mail, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import EmailTemplateTable from '@/components/notification/EmailTemplateTable';
import EmailTemplateFormDialog from '@/components/notification/EmailTemplateFormDialog';
import { emailTemplateApi } from '@/lib/api';
import { toast } from 'sonner';

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewVariables, setPreviewVariables] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取模板列表
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await emailTemplateApi.getTemplates();

      // 注意：axios 拦截器已经将 response.data 返回，所以 response 就是后端的数据
      // 后端返回格式：{ success: true, data: { items: [...], pagination: {...} } }
      if (response.success) {
        const items = response.data.items || [];
        setTemplates(items);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast.error('获取模板列表失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 创建模板
  const handleCreate = () => {
    setSelectedTemplate(null);
    setFormDialogOpen(true);
  };

  // 编辑模板
  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setFormDialogOpen(true);
  };

  // 保存模板
  const handleSave = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedTemplate) {
        // 更新模板
        await emailTemplateApi.updateTemplate(selectedTemplate.id, formData);
        toast.success('模板更新成功');
      } else {
        // 创建模板
        await emailTemplateApi.createTemplate(formData);
        toast.success('模板创建成功');
      }

      setFormDialogOpen(false);
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error(error.response?.data?.message || '保存失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除模板
  const handleDelete = async (id) => {
    try {
      await emailTemplateApi.deleteTemplate(id);
      toast.success('模板删除成功');
      fetchTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('删除失败');
    }
  };

  // 预览模板
  const handlePreview = async (template) => {
    setSelectedTemplate(template);

    // 初始化预览变量
    const initialVariables = {
      title: template.subject || '示例告警标题',
      content: '<p>这里展示示例告警内容。</p>',
    };
    setPreviewVariables(initialVariables);

    // 获取预览内容
    try {
      const response = await emailTemplateApi.previewTemplate(template.id, initialVariables);
      if (response.success) {
        setPreviewHtml(response.data.html);
        setPreviewDialogOpen(true);
      }
    } catch (error) {
      console.error('Failed to preview template:', error);
      toast.error('预览失败');
    }
  };

  // 更新预览变量
  const handlePreviewVariableChange = (variable, value) => {
    setPreviewVariables((prev) => ({
      ...prev,
      [variable]: value,
    }));
  };

  // 刷新预览
  const refreshPreview = async () => {
    if (!selectedTemplate) return;

    try {
      const response = await emailTemplateApi.previewTemplate(
        selectedTemplate.id,
        previewVariables
      );
      if (response.success) {
        setPreviewHtml(response.data.html);
      }
    } catch (error) {
      console.error('Failed to refresh preview:', error);
      toast.error('刷新预览失败');
    }
  };

  // 初始加载
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          创建模板
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总模板数</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              已创建的邮件模板总数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 模板列表 */}
      <Card>
        <CardHeader>
          <CardTitle>模板列表</CardTitle>
          <CardDescription>
            使用 Handlebars 语法创建动态邮件模板
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailTemplateTable
            templates={templates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* 创建/编辑对话框 */}
      <EmailTemplateFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        template={selectedTemplate}
        onSave={handleSave}
        isSubmitting={isSubmitting}
      />

      {/* 预览对话框 */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>预览邮件模板</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name} - {selectedTemplate?.subject}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">预览参数</h4>
                <Button size="sm" variant="outline" onClick={refreshPreview}>
                  刷新预览
                </Button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="preview-title" className="text-xs">
                    {'{{'}title{'}}'}
                  </Label>
                  <Input
                    id="preview-title"
                    value={previewVariables.title || ''}
                    onChange={(e) => handlePreviewVariableChange('title', e.target.value)}
                    placeholder="输入邮件标题"
                    size="sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="preview-content" className="text-xs">
                    {'{{'}content{'}}'}
                  </Label>
                  <Textarea
                    id="preview-content"
                    value={previewVariables.content || ''}
                    onChange={(e) => handlePreviewVariableChange('content', e.target.value)}
                    placeholder="输入邮件正文支持HTML"
                    className="min-h-[180px] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 预览内容 */}
            <div className="md:col-span-2">
              <h4 className="font-medium text-sm mb-3">预览效果</h4>
              <ScrollArea className="h-[500px] border rounded-md">
                <div
                  className="p-4"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
