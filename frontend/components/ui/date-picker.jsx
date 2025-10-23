'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * DatePicker 组件
 * 基于 Radix UI Popover + react-day-picker 的现代化日期选择器
 * 提供美观的交互体验
 */
export function DatePicker({ value, onChange, placeholder = '选择日期', className, ...props }) {
  const [open, setOpen] = React.useState(false);

  // 将 ISO 日期字符串（YYYY-MM-DD）转换为 Date 对象
  const dateValue = value ? new Date(value) : undefined;

  // 处理日期选择
  const handleSelect = (date) => {
    if (date) {
      // 转换为 ISO 日期字符串（YYYY-MM-DD）
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const isoDateString = `${year}-${month}-${day}`;

      // 触发 onChange 事件，传递模拟的 event 对象
      onChange?.({
        target: {
          value: isoDateString,
        },
      });
    } else {
      onChange?.({
        target: {
          value: '',
        },
      });
    }
    setOpen(false);
  };

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
          {dateValue ? (
            format(dateValue, 'PPP', { locale: zhCN })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          initialFocus
          locale={zhCN}
        />
      </PopoverContent>
    </Popover>
  );
}
