'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Search, RotateCcw } from 'lucide-react';

/**
 * 动态筛选组件
 * 根据字段配置动态渲染搜索条件
 */
export function DynamicFilters({ fields = [], filters = {}, onChange, onSearch, onReset }) {
  // 只显示可搜索的字段
  const searchableFields = fields.filter((f) => f.isSearchable);

  const handleFilterChange = (fieldName, value) => {
    onChange?.({
      ...filters,
      [fieldName]: value,
    });
  };

  // 处理日期范围筛选
  const handleDateRangeChange = (fieldName, type, value) => {
    const startKey = `${fieldName}_start`;
    const endKey = `${fieldName}_end`;

    onChange?.({
      ...filters,
      [type === 'start' ? startKey : endKey]: value,
    });
  };

  const handleReset = () => {
    const emptyFilters = {};
    searchableFields.forEach((field) => {
      // 对于日期时间字段，需要清空开始和结束时间
      if (field.searchComponent === 'date' || field.searchComponent === 'datetime') {
        emptyFilters[`${field.name}_start`] = '';
        emptyFilters[`${field.name}_end`] = '';
      } else {
        emptyFilters[field.name] = '';
      }
    });
    onChange?.(emptyFilters);
    onReset?.();
  };

  const handleSearch = () => {
    onSearch?.();
  };

  // 渲染不同类型的输入组件
  const renderFilterInput = (field) => {
    const value = filters[field.name] || '';

    switch (field.searchComponent) {
      case 'select':
        // 下拉选择（用于枚举类型）
        return (
          <Select value={value} onValueChange={(val) => handleFilterChange(field.name, val)}>
            <SelectTrigger>
              <SelectValue placeholder={`选择${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.searchOptions?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
      case 'datetime':
        // 日期时间范围选择（开始时间 - 结束时间）
        const startKey = `${field.name}_start`;
        const endKey = `${field.name}_end`;
        const startValue = filters[startKey] || '';
        const endValue = filters[endKey] || '';
        const showTime = field.searchComponent === 'datetime';

        return (
          <div className="flex gap-2 items-center">
            <DateTimePicker
              value={startValue}
              onChange={(e) => handleDateRangeChange(field.name, 'start', e.target.value)}
              placeholder="开始时间"
              showTime={showTime}
              className="flex-1"
            />
            <span className="text-muted-foreground">-</span>
            <DateTimePicker
              value={endValue}
              onChange={(e) => handleDateRangeChange(field.name, 'end', e.target.value)}
              placeholder="结束时间"
              showTime={showTime}
              className="flex-1"
            />
          </div>
        );

      case 'number':
        // 数字输入
        return (
          <Input
            type="number"
            placeholder={`输入${field.label}`}
            value={value}
            onChange={(e) => handleFilterChange(field.name, e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        );

      case 'input':
      default:
        // 默认文本输入
        return (
          <Input
            type="text"
            placeholder={`搜索${field.label}`}
            value={value}
            onChange={(e) => handleFilterChange(field.name, e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        );
    }
  };

  if (searchableFields.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg">
      {/* 筛选条件网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        {searchableFields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={`filter-${field.name}`}>
              {field.searchLabel || field.label}
            </Label>
            {renderFilterInput(field)}
          </div>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-2">
        <Button onClick={handleReset} variant="outline" size="lg">
          <RotateCcw className="h-4 w-4 mr-2" />
          重置
        </Button>
        <Button onClick={handleSearch} size="lg">
          <Search className="h-4 w-4 mr-2" />
          搜索
        </Button>
      </div>
    </div>
  );
}
