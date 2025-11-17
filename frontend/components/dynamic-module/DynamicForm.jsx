'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * 动态表单组件
 * 根据字段配置动态渲染表单
 */
export function DynamicForm({
  open,
  onOpenChange,
  fields = [],
  data = null,
  mode = 'create',
  onSubmit,
  title,
  description,
}) {
  const isEdit = mode === 'edit' && data !== null;

  // 只显示在表单中的字段
  const formFields = fields.filter((f) => f.showInForm);

  // 生成验证规则
  const generateValidationSchema = () => {
    const schema = {};

    formFields.forEach((field) => {
      const rules = field.rules || {};
      let fieldSchema;

      // 根据字段类型创建基础schema
      const fieldLabel = field.formLabel || field.label;

      switch (field.type) {
        case 'number':
          if (rules.required) {
            fieldSchema = z.number({
              invalid_type_error: `${fieldLabel}必须是数字`,
              required_error: `${fieldLabel}不能为空`,
            });
            if (rules.min !== undefined) {
              fieldSchema = fieldSchema.min(rules.min, `${fieldLabel}不能小于${rules.min}`);
            }
            if (rules.max !== undefined) {
              fieldSchema = fieldSchema.max(rules.max, `${fieldLabel}不能大于${rules.max}`);
            }
          } else {
            // 可选数字字段：接受 number | undefined | null
            fieldSchema = z.preprocess(
              (val) => (val === '' || val === null || val === undefined || isNaN(val) ? undefined : Number(val)),
              z.number({
                invalid_type_error: `${fieldLabel}必须是数字`,
              }).optional()
            );
            if (rules.min !== undefined) {
              fieldSchema = z.preprocess(
                (val) => (val === '' || val === null || val === undefined || isNaN(val) ? undefined : Number(val)),
                z.number().min(rules.min, `${fieldLabel}不能小于${rules.min}`).optional()
              );
            }
            if (rules.max !== undefined) {
              fieldSchema = z.preprocess(
                (val) => (val === '' || val === null || val === undefined || isNaN(val) ? undefined : Number(val)),
                z.number().max(rules.max, `${fieldLabel}不能大于${rules.max}`).optional()
              );
            }
          }
          break;

        case 'boolean':
          fieldSchema = z.boolean();
          break;

        case 'date':
          fieldSchema = z.string();
          break;

        default:
          fieldSchema = z.string();
          if (rules.min) {
            fieldSchema = fieldSchema.min(rules.min, `${fieldLabel}至少${rules.min}个字符`);
          }
          if (rules.max) {
            fieldSchema = fieldSchema.max(rules.max, `${fieldLabel}最多${rules.max}个字符`);
          }
          if (rules.pattern) {
            fieldSchema = fieldSchema.regex(
              new RegExp(rules.pattern),
              `${fieldLabel}格式不正确`
            );
          }
          if (rules.email) {
            fieldSchema = z.string().email(`${fieldLabel}格式不正确`);
          }

          // 处理字符串的可选
          if (!rules.required) {
            fieldSchema = fieldSchema.optional().or(z.literal(''));
          }
      }

      // 注意：数字类型的 required 已在上面处理，这里不再处理

      schema[field.name] = fieldSchema;
    });

    return z.object(schema);
  };

  const validationSchema = generateValidationSchema();

  // 生成默认值
  const generateDefaultValues = () => {
    const defaults = {};
    formFields.forEach((field) => {
      if (isEdit && data && data[field.name] !== undefined) {
        defaults[field.name] = data[field.name];
      } else {
        switch (field.type) {
          case 'boolean':
            defaults[field.name] = false;
            break;
          case 'number':
            defaults[field.name] = 0;
            break;
          default:
            defaults[field.name] = '';
        }
      }
    });
    return defaults;
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: generateDefaultValues(),
  });

  // 当对话框打开或数据变化时重置表单
  useEffect(() => {
    if (open) {
      reset(generateDefaultValues());
    }
  }, [open, data]);

  // 渲染不同类型的表单控件
  const renderFormField = (field) => {
    const error = errors[field.name];
    const fieldValue = watch(field.name);

    switch (field.formComponent) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.formLabel || field.label}
              {field.rules?.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              {...register(field.name)}
              placeholder={field.placeholder || `请输入${field.formLabel || field.label}`}
              disabled={field.readonly}
              rows={4}
            />
            {error && <p className="text-sm text-destructive">{error.message}</p>}
          </div>
        );

      case 'switch':
        return (
          <div key={field.name} className="flex items-center justify-between">
            <Label htmlFor={field.name}>{field.formLabel || field.label}</Label>
            <Switch
              id={field.name}
              checked={fieldValue}
              onCheckedChange={(checked) => setValue(field.name, checked)}
              disabled={field.readonly}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.formLabel || field.label}
              {field.rules?.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={fieldValue}
              onValueChange={(value) => setValue(field.name, value)}
              disabled={field.readonly}
            >
              <SelectTrigger>
                <SelectValue placeholder={`请选择${field.formLabel || field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.selectOptions?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-destructive">{error.message}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.formLabel || field.label}
              {field.rules?.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              {...register(field.name, { valueAsNumber: true })}
              placeholder={field.placeholder || `请输入${field.formLabel || field.label}`}
              disabled={field.readonly}
            />
            {error && <p className="text-sm text-destructive">{error.message}</p>}
          </div>
        );

      case 'input':
      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.formLabel || field.label}
              {field.rules?.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="text"
              {...register(field.name)}
              placeholder={field.placeholder || `请输入${field.formLabel || field.label}`}
              disabled={field.readonly}
            />
            {error && <p className="text-sm text-destructive">{error.message}</p>}
          </div>
        );
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      await onSubmit?.(formData);
      onOpenChange?.(false);
    } catch (error) {
      console.error('提交表单失败:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || (isEdit ? '编辑' : '新增')}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* 动态渲染表单字段 */}
          <div className="space-y-4">
            {formFields.map((field) => renderFormField(field))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : isEdit ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
