'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toDateTimeLocalString, fromDateTimeLocalString, formatDateTime } from '@/lib/utils/date';
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
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
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
  const isView = mode === 'view';

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
      if ((isEdit || isView) && data && data[field.name] !== undefined) {
        // 对于日期字段，转换为 datetime-local 格式
        if (field.type === 'date' && data[field.name]) {
          defaults[field.name] = toDateTimeLocalString(data[field.name]);
        } else if (
          // 自动检测 ISO 日期字符串，即使字段类型不是 'date'
          data[field.name] &&
          typeof data[field.name] === 'string' &&
          (data[field.name].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) ||
            data[field.name].match(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/))
        ) {
          // 这看起来像一个日期字符串，转换为 datetime-local 格式
          defaults[field.name] = toDateTimeLocalString(data[field.name]);
        } else {
          defaults[field.name] = data[field.name];
        }
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
    trigger,
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

  // 检测字段值是否看起来像日期字符串
  const isDateTimeString = (value) => {
    if (!value || typeof value !== 'string') return false;
    return (
      value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) ||  // ISO 格式
      value.match(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/)     // PostgreSQL 时间戳格式
    );
  };

  // 判断字段是否应该使用 datetime-local 输入
  const shouldUseDateTimeInput = (field, value) => {
    return field.type === 'date' || (isEdit && isDateTimeString(value));
  };

  // 格式化显示值（用于查看模式）
  const formatDisplayValue = (field, value) => {
    // 空值处理
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    // 布尔值
    if (field.type === 'boolean') {
      return value === true || value === 'TRUE' || value === 'true' ? '是' : '否';
    }

    // 枚举值（使用 codeMapping）
    if (field.codeMapping?.mappings) {
      const mapping = field.codeMapping.mappings[value];
      return mapping?.label || value;
    }

    // Select 选项
    if (field.selectOptions) {
      const option = field.selectOptions.find(opt => String(opt.value) === String(value));
      return option?.label || value;
    }

    // 日期时间字段
    if (field.type === 'date' || isDateTimeString(value)) {
      return formatDateTime(value);
    }

    // 默认返回值
    return value;
  };

  // 渲染不同类型的表单控件
  const renderFormField = (field) => {
    const error = errors[field.name];
    const fieldValue = watch(field.name);

    // 查看模式：直接显示文本
    if (isView) {
      return (
        <div key={field.name} className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            {field.formLabel || field.label}
          </Label>
          <div className="text-sm text-foreground py-2">
            {formatDisplayValue(field, fieldValue)}
          </div>
        </div>
      );
    }

    switch (field.formComponent) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2.5">
            <Label htmlFor={field.name} className="text-sm font-medium">
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
          <div key={field.name} className="flex items-center justify-between py-1">
            <Label htmlFor={field.name} className="text-sm font-medium">{field.formLabel || field.label}</Label>
            <Switch
              id={field.name}
              checked={fieldValue}
              onCheckedChange={(checked) => setValue(field.name, checked)}
              disabled={field.readonly}
            />
          </div>
        );

      case 'select':
        // 获取选项：优先使用 selectOptions，其次使用 codeMapping
        const selectOptions = field.selectOptions || (field.codeMapping?.mappings ? Object.entries(field.codeMapping.mappings).map(([key, value]) => ({
          value: key,
          label: value.label,
        })) : []);

        return (
          <div key={field.name} className="space-y-2.5">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.formLabel || field.label}
              {field.rules?.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={String(fieldValue)}
              onValueChange={(value) => {
                // 对于布尔值字段，转换为布尔值
                if (field.type === 'boolean') {
                  setValue(field.name, value === 'true');
                } else {
                  setValue(field.name, value);
                }
              }}
              disabled={field.readonly}
            >
              <SelectTrigger>
                <SelectValue placeholder={`请选择${field.formLabel || field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {selectOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
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
          <div key={field.name} className="space-y-2.5">
            <Label htmlFor={field.name} className="text-sm font-medium">
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

      case 'date':
        return (
          <div key={field.name} className="space-y-2.5">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.formLabel || field.label}
              {field.rules?.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <DatePicker
              value={fieldValue}
              onChange={(e) => {
                const event = {
                  target: {
                    name: field.name,
                    value: e.target.value,
                  },
                };
                // 手动触发 react-hook-form 的更新
                setValue(field.name, e.target.value);
                trigger(field.name);
              }}
              placeholder={field.placeholder || `请选择${field.formLabel || field.label}`}
              disabled={field.readonly}
            />
            {error && <p className="text-sm text-destructive">{error.message}</p>}
          </div>
        );

      case 'input':
      default:
        // 检查是否应该使用 datetime-local 输入
        const useDateTime = shouldUseDateTimeInput(field, fieldValue);

        return (
          <div key={field.name} className="space-y-2.5">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.formLabel || field.label}
              {field.rules?.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type={useDateTime ? 'datetime-local' : 'text'}
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
      // 处理字段值的转换
      const processedData = { ...formData };
      formFields.forEach((field) => {
        const value = processedData[field.name];

        // 处理布尔值：转换为 TRUE/FALSE（大写）
        if (field.type === 'boolean' && value !== null && value !== undefined) {
          processedData[field.name] = value === true || value === 'true' ? 'TRUE' : 'FALSE';
        }

        // 处理日期字段：将 datetime-local 格式转换为 Date 对象或 ISO 字符串
        if (value && (field.type === 'date' || isDateTimeString(value))) {
          // 从 datetime-local 格式转换为 Date 对象，然后转换为 ISO 字符串
          const dateObj = fromDateTimeLocalString(value);
          if (dateObj) {
            processedData[field.name] = dateObj.toISOString();
          }
        }
      });

      await onSubmit?.(processedData);
      onOpenChange?.(false);
    } catch (error) {
      console.error('提交表单失败:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formFields.length > 10 ? "max-w-4xl max-h-[90vh] flex flex-col p-0" : "max-w-3xl max-h-[90vh] flex flex-col p-0"}>
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>{title || (isView ? '查看' : isEdit ? '编辑' : '新增')}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <Separator />

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 min-h-0">
          {/* 动态渲染表单字段 - 可滚动区域 */}
          <div className={`flex-1 overflow-y-auto px-6 py-4 scrollbar-hide ${formFields.length > 10 ? "grid grid-cols-2 gap-4 content-start" : "space-y-4"}`}>
            {formFields.map((field) => renderFormField(field))}
          </div>

          <Separator />

          <DialogFooter className="flex-shrink-0 px-6 py-4">
            {!isView ? (
              <>
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
              </>
            ) : (
              <Button
                type="button"
                onClick={() => onOpenChange?.(false)}
              >
                关闭
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
