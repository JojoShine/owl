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
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>配置模块: {config?.module_name}</DialogTitle>
            <DialogDescription>
              配置字段的搜索、显示和表单属性
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {fields.map((field, index) => {
                const formatOptions = field.format_options || {};
                const displayName = formatOptions.displayName || {};
                const codeMapping = formatOptions.codeMapping || {};

                return (
                  <Card key={field.field_name}>
                    <CardHeader>
                      <CardTitle className="text-sm">{field.field_comment || field.field_name}</CardTitle>
                      <CardDescription className="text-xs font-mono">
                        {field.field_name} ({field.field_type})
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 基础开关 */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.is_searchable}
                            onCheckedChange={(checked) => onFieldChange(index, 'is_searchable', checked)}
                          />
                          <Label>可搜索</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.show_in_list}
                            onCheckedChange={(checked) => onFieldChange(index, 'show_in_list', checked)}
                          />
                          <Label>列表显示</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.show_in_form}
                            onCheckedChange={(checked) => onFieldChange(index, 'show_in_form', checked)}
                          />
                          <Label>表单显示</Label>
                        </div>
                      </div>

                      {/* 自定义显示名称 */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          自定义显示名称 (可选)
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">列表列标题</Label>
                            <Input
                              placeholder="如: 状态"
                              value={displayName.list || ''}
                              onChange={(e) => onFormatOptionChange(index, 'displayName.list', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">搜索条件标签</Label>
                            <Input
                              placeholder="如: 按状态筛选"
                              value={displayName.search || ''}
                              onChange={(e) => onFormatOptionChange(index, 'displayName.search', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">表单字段标签</Label>
                            <Input
                              placeholder="如: 选择状态"
                              value={displayName.form || ''}
                              onChange={(e) => onFormatOptionChange(index, 'displayName.form', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 代码值映射 */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          代码值映射 (用于状态/类型等枚举字段)
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
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="选择映射类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">不使用</SelectItem>
                            <SelectItem value="enum">枚举映射</SelectItem>
                          </SelectContent>
                        </Select>

                        {codeMapping.type === 'enum' && (
                          <div className="space-y-1">
                            <Label className="text-xs">映射配置 (JSON格式)</Label>
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
                              rows={4}
                              className="font-mono text-xs"
                            />
                            <p className="text-xs text-muted-foreground">
                              示例: 每个代码对应一个对象,包含 label(显示文本)、variant(样式)、color(颜色)
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

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={onSave} disabled={loading}>
              保存配置
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
              为 {config?.module_name} 生成 CRUD 代码
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={generateOptions.generateBackend}
                onCheckedChange={(checked) =>
                  onGenerateOptionsChange({ ...generateOptions, generateBackend: checked })
                }
              />
              <Label>生成后端代码</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={generateOptions.generateFrontend}
                onCheckedChange={(checked) =>
                  onGenerateOptionsChange({ ...generateOptions, generateFrontend: checked })
                }
              />
              <Label>生成前端代码</Label>
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
        onOpenChange={onDeleteCodeDialogOpenChange}
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
