'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * DateTimePicker 组件
 * 支持日期和时间选择
 */
export function DateTimePicker({
  value,
  onChange,
  placeholder = '选择日期和时间',
  className,
  showTime = true, // 是否显示时间选择
  defaultToToday = true, // 是否默认选择当天
  ...props
}) {
  const [open, setOpen] = React.useState(false);

  // 将 ISO 日期时间字符串转换为 Date 对象
  const dateValue = value ? new Date(value) : undefined;

  // 提取时间部分，如果没有值则使用当前时间
  const now = new Date();
  const [hours, setHours] = React.useState(
    dateValue ? String(dateValue.getHours()).padStart(2, '0') : String(now.getHours()).padStart(2, '0')
  );
  const [minutes, setMinutes] = React.useState(
    dateValue ? String(dateValue.getMinutes()).padStart(2, '0') : String(now.getMinutes()).padStart(2, '0')
  );

  // 当弹窗打开且没有值时，默认选择当天
  React.useEffect(() => {
    if (open && !value && defaultToToday) {
      const today = new Date();
      today.setHours(parseInt(hours) || 0);
      today.setMinutes(parseInt(minutes) || 0);
      today.setSeconds(0);
      today.setMilliseconds(0);

      onChange?.({
        target: {
          value: today.toISOString(),
        },
      });
    }
  }, [open]);

  // 当 value 变化时更新时间
  React.useEffect(() => {
    if (dateValue) {
      setHours(String(dateValue.getHours()).padStart(2, '0'));
      setMinutes(String(dateValue.getMinutes()).padStart(2, '0'));
    } else {
      // 没有值时使用当前时间
      const now = new Date();
      setHours(String(now.getHours()).padStart(2, '0'));
      setMinutes(String(now.getMinutes()).padStart(2, '0'));
    }
  }, [value]);

  // 处理日期选择
  const handleDateSelect = (date) => {
    if (date) {
      // 应用当前选择的时间
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours) || 0);
      newDate.setMinutes(parseInt(minutes) || 0);
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);

      // 转换为 ISO 字符串
      const isoString = newDate.toISOString();

      onChange?.({
        target: {
          value: isoString,
        },
      });
    } else {
      onChange?.({
        target: {
          value: '',
        },
      });
    }

    if (!showTime) {
      setOpen(false);
    }
  };

  // 处理时间变化
  const handleTimeChange = (newHours, newMinutes) => {
    const h = newHours;
    const m = newMinutes;

    if (dateValue) {
      const newDate = new Date(dateValue);
      newDate.setHours(parseInt(h) || 0);
      newDate.setMinutes(parseInt(m) || 0);
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);

      const isoString = newDate.toISOString();

      onChange?.({
        target: {
          value: isoString,
        },
      });
    }
  };

  // 验证和规范化小时输入
  const validateHours = (value) => {
    // 只允许数字
    let cleaned = value.replace(/\D/g, '');

    // 限制最多2位
    if (cleaned.length > 2) {
      cleaned = cleaned.slice(0, 2);
    }

    // 验证范围 0-23
    let num = parseInt(cleaned);
    if (isNaN(num)) {
      return '';
    }
    if (num > 23) {
      num = 23;
    }
    if (num < 0) {
      num = 0;
    }

    return String(num);
  };

  // 验证和规范化分钟输入
  const validateMinutes = (value) => {
    // 只允许数字
    let cleaned = value.replace(/\D/g, '');

    // 限制最多2位
    if (cleaned.length > 2) {
      cleaned = cleaned.slice(0, 2);
    }

    // 验证范围 0-59
    let num = parseInt(cleaned);
    if (isNaN(num)) {
      return '';
    }
    if (num > 59) {
      num = 59;
    }
    if (num < 0) {
      num = 0;
    }

    return String(num);
  };

  const handleHoursChange = (e) => {
    const validated = validateHours(e.target.value);
    setHours(validated);
    if (validated !== '') {
      handleTimeChange(validated.padStart(2, '0'), minutes);
    }
  };

  const handleMinutesChange = (e) => {
    const validated = validateMinutes(e.target.value);
    setMinutes(validated);
    if (validated !== '') {
      handleTimeChange(hours, validated.padStart(2, '0'));
    }
  };

  // 失焦时补齐0
  const handleHoursBlur = () => {
    if (hours === '') {
      setHours('00');
      handleTimeChange('00', minutes);
    } else {
      const padded = hours.padStart(2, '0');
      setHours(padded);
      handleTimeChange(padded, minutes);
    }
  };

  const handleMinutesBlur = () => {
    if (minutes === '') {
      setMinutes('00');
      handleTimeChange(hours, '00');
    } else {
      const padded = minutes.padStart(2, '0');
      setMinutes(padded);
      handleTimeChange(hours, padded);
    }
  };

  // 格式化显示
  const displayValue = dateValue
    ? showTime
      ? format(dateValue, 'yyyy-MM-dd HH:mm', { locale: zhCN })
      : format(dateValue, 'PPP', { locale: zhCN })
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full h-10 justify-start text-left font-normal',
            !dateValue && 'text-muted-foreground',
            className
          )}
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{displayValue}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleDateSelect}
            initialFocus
            locale={zhCN}
          />
        </div>
        {showTime && (
          <div className="border-t px-3 pb-3 pt-2 space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              选择时间
            </Label>
            <div className="flex items-center gap-2 justify-center">
              <div className="w-16">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={hours}
                  onChange={handleHoursChange}
                  onBlur={handleHoursBlur}
                  onFocus={(e) => e.target.select()}
                  placeholder="时"
                  className="text-center"
                  maxLength={2}
                />
              </div>
              <span className="text-muted-foreground font-semibold">:</span>
              <div className="w-16">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={minutes}
                  onChange={handleMinutesChange}
                  onBlur={handleMinutesBlur}
                  onFocus={(e) => e.target.select()}
                  placeholder="分"
                  className="text-center"
                  maxLength={2}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => setOpen(false)}
              >
                确定
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
