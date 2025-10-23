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

  const handleReset = () => {
    const emptyFilters = {};
    searchableFields.forEach((field) => {
      emptyFilters[field.name] = '';
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
    <div className="space-y-4">
      {/* 筛选条件网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          重置
        </Button>
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          搜索
        </Button>
      </div>
    </div>
  );
}
