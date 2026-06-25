'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayIcon } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ConfigDialog({
  open,
  onOpenChange,
  config,
  fields,
  jsonInputs,
  onFieldChange,
  onFormatOptionChange,
  onJsonInputChange,
  onSave,
  loading,
  // 生成 dialog
  generateOpen,
  onGenerateOpenChange,
  generateOptions,
  onGenerateOptionsChange,
  onConfirmGenerate,
  // 确认 dialog
  deleteConfigDialogOpen,
  onDeleteConfigDialogOpenChange,
  onConfirmDeleteConfig,
  deleteCodeDialogOpen,
  onDeleteCodeDialogOpenChange,
  onConfirmDeleteCode,
}) {
  return (
    <>
      {/* 配置编辑 dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">编辑模块配置</DialogTitle>
            <DialogDescription>
              配置 <span className="font-semibold text-foreground">{config?.module_name}</span> 模块的字段显示和行为属性
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[calc(85vh-180px)] pr-4">
            <div className="space-y-6">
              {fields.map((field, index) => {
                const formatOptions = field.format_options || {};
                const displayName = formatOptions.displayName || {};
                const codeMapping = formatOptions.codeMapping || {};

                return (
                  <Card key={field.field_name} className="border-2">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base font-semibold">
                            {field.field_comment || field.field_name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 text-xs">
                            <code className="bg-muted px-2 py-0.5 rounded font-mono">
                              {field.field_name}
                            </code>
                            <Badge variant="outline" className="text-xs font-normal">
                              {field.field_type}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* 基础开关 - 优化布局 */}
                      <div>
                        <Label className="text-sm font-semibold mb-3 block">显示配置</Label>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="flex items-center space-x-3">
                            <Switch
                              id={`search-${field.field_name}`}
                              checked={field.is_searchable}
                              onCheckedChange={(checked) => onFieldChange(index, 'is_searchable', checked)}
                            />
                            <Label htmlFor={`search-${field.field_name}`} className="cursor-pointer">
                              可搜索
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Switch
                              id={`list-${field.field_name}`}
                              checked={field.show_in_list}
                              onCheckedChange={(checked) => onFieldChange(index, 'show_in_list', checked)}
                            />
                            <Label htmlFor={`list-${field.field_name}`} className="cursor-pointer">
                              列表显示
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Switch
                              id={`form-${field.field_name}`}
                              checked={field.show_in_form}
                              onCheckedChange={(checked) => onFieldChange(index, 'show_in_form', checked)}
                            />
                            <Label htmlFor={`form-${field.field_name}`} className="cursor-pointer">
                              表单显示
                            </Label>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* 自定义显示名称 */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">
                          自定义显示名称
                          <span className="text-xs text-muted-foreground font-normal ml-2">
                            (选填，留空则使用字段注释)
                          </span>
                        </Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">列表列标题</Label>
                            <Input
                              placeholder={field.field_comment || "如: 状态"}
                              value={displayName.list || ''}
                              onChange={(e) => onFormatOptionChange(index, 'displayName.list', e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">搜索条件标签</Label>
                            <Input
                              placeholder={field.field_comment || "如: 按状态筛选"}
                              value={displayName.search || ''}
                              onChange={(e) => onFormatOptionChange(index, 'displayName.search', e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">表单字段标签</Label>
                            <Input
                              placeholder={field.field_comment || "如: 选择状态"}
                              value={displayName.form || ''}
                              onChange={(e) => onFormatOptionChange(index, 'displayName.form', e.target.value)}
                              className="h-9"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* 代码值映射 */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">
                          代码值映射
                          <span className="text-xs text-muted-foreground font-normal ml-2">
                            (用于状态/类型等枚举字段)
                          </span>
                        </Label>
                        <Select
                          value={codeMapping.type || 'none'}
                          onValueChange={(val) => {
                            if (val === 'none') {
                              const updatedFields = [...fields];
                              const updatedField = { ...updatedFields[index] };
                              const opts = { ...updatedField.format_options };
                              delete opts.codeMapping;
                              updatedField.format_options = opts;
                              updatedFields[index] = updatedField;
                              onFieldChange(index, 'format_options', opts);
                            } else {
                              onFormatOptionChange(index, 'codeMapping.type', val);
                            }
                          }}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="选择映射类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">不使用映射</SelectItem>
                            <SelectItem value="enum">枚举映射</SelectItem>
                          </SelectContent>
                        </Select>

                        {codeMapping.type === 'enum' && (
                          <div className="space-y-2 pt-2">
                            <Label className="text-xs text-muted-foreground">
                              映射配置 (JSON格式)
                            </Label>
                            <Textarea
                              placeholder='{"1": {"label": "启用", "variant": "default", "color": "#52c41a"}, "0": {"label": "禁用", "variant": "secondary", "color": "#d9d9d9"}}'
                              value={
                                jsonInputs[`${index}-codeMapping`] !== undefined
                                  ? jsonInputs[`${index}-codeMapping`]
                                  : codeMapping.mappings ? JSON.stringify(codeMapping.mappings, null, 2) : ''
                              }
                              onChange={(e) => onJsonInputChange(index, 'codeMapping', e.target.value)}
                              onBlur={(e) => {
                                const inputValue = e.target.value.trim();
                                if (!inputValue) {
                                  onFormatOptionChange(index, 'codeMapping.mappings', {});
                                  return;
                                }
                                try {
                                  const mappings = JSON.parse(inputValue);
                                  onFormatOptionChange(index, 'codeMapping.mappings', mappings);
                                } catch (err) {
                                  toast.error(`字段 ${field.field_name} 的映射配置 JSON 格式错误`);
                                }
                              }}
                              rows={5}
                              className="font-mono text-xs resize-none"
                            />
                            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                              每个代码对应一个对象，包含：<br />
                              • <code className="bg-background px-1">label</code>: 显示文本<br />
                              • <code className="bg-background px-1">variant</code>: 样式 (default/secondary/destructive/outline)<br />
                              • <code className="bg-background px-1">color</code>: 颜色值
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={onSave} disabled={loading}>
              {loading ? '保存中...' : '保存配置'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 生成代码对话框 */}
      <Dialog open={generateOpen} onOpenChange={onGenerateOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>生成代码</DialogTitle>
            <DialogDescription>
              为 <span className="font-semibold text-foreground">{config?.module_name}</span> 生成 CRUD 代码
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="font-medium">生成后端代码</Label>
                <p className="text-sm text-muted-foreground">生成 Controller、Service、Routes 等后端文件</p>
              </div>
              <Switch
                checked={generateOptions.generateBackend}
                onCheckedChange={(checked) =>
                  onGenerateOptionsChange({ ...generateOptions, generateBackend: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="font-medium">生成前端代码</Label>
                <p className="text-sm text-muted-foreground">生成前端页面配置和路由</p>
              </div>
              <Switch
                checked={generateOptions.generateFrontend}
                onCheckedChange={(checked) =>
                  onGenerateOptionsChange({ ...generateOptions, generateFrontend: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onGenerateOpenChange(false)}>
              取消
            </Button>
            <Button onClick={onConfirmGenerate} disabled={loading}>
              <PlayIcon className="w-4 h-4 mr-2" />
              开始生成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除配置确认对话框 */}
      <ConfirmDialog
        open={deleteConfigDialogOpen}
        onOpenChange={onDeleteConfigDialogOpenChange}
        onConfirm={onConfirmDeleteConfig}
        title="删除模块配置"
        description="确定要删除这个模块配置吗？删除后无法恢复。"
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
      />

      {/* 删除生成代码确认对话框 */}
      <ConfirmDialog
        open={deleteCodeDialogOpen}
        onDeleteCodeDialogOpenChange={onDeleteCodeDialogOpenChange}
        onConfirm={onConfirmDeleteCode}
        title="删除生成的代码"
        description="确定要删除生成的代码吗？此操作无法撤销！"
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
      />
    </>
  );
}
