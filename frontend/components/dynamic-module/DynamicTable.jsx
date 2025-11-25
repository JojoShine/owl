'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableLoading } from '@/components/ui/table-loading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * 动态表格组件
 * 根据字段配置动态渲染表格列
 */
export function DynamicTable({
  data = [],
  fields = [],
  loading = false,
  onEdit,
  onDelete,
  onBatchDelete,
  selectedRows = [],
  onSelectRows,
  features = {},
}) {
  // 只显示在列表中的字段，并按顺序排序
  const listFields = fields
    .filter((f) => f.showInList)
    .sort((a, b) => (a.listSort || 0) - (b.listSort || 0));

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectRows?.(data.map((item) => item.id));
    } else {
      onSelectRows?.([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      onSelectRows?.([...selectedRows, id]);
    } else {
      onSelectRows?.(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const isRowSelected = (id) => selectedRows.includes(id);
  const isAllSelected = data.length > 0 && selectedRows.length === data.length;

  // 格式化字段值
  const formatFieldValue = (value, field) => {
    if (value === null || value === undefined) {
      return '-';
    }

    // ✨ 优先使用 codeMapping 配置
    if (field.codeMapping && field.codeMapping.type === 'enum') {
      const mapping = field.codeMapping.mappings?.[String(value)];
      if (mapping) {
        return (
          <Badge
            variant={mapping.variant || 'default'}
            style={mapping.color ? { backgroundColor: mapping.color } : undefined}
          >
            {mapping.label}
          </Badge>
        );
      }
    }

    switch (field.formatType) {
      case 'date':
        // 日期格式化
        try {
          const date = new Date(value);
          return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          });
        } catch {
          return value;
        }

      case 'money':
        // 金额格式化
        try {
          return `¥${parseFloat(value).toFixed(2)}`;
        } catch {
          return value;
        }

      case 'enum':
        // 枚举值映射(兼容旧配置)
        if (field.formatOptions?.enumMap) {
          const mapped = field.formatOptions.enumMap[value];
          if (mapped) {
            return (
              <Badge variant={mapped.variant || 'default'}>
                {mapped.label || value}
              </Badge>
            );
          }
        }
        return value;

      case 'boolean':
        // 布尔值显示
        return (
          <Badge variant={value ? 'default' : 'secondary'}>
            {value ? '是' : '否'}
          </Badge>
        );

      case 'mask':
        // 脱敏处理
        if (field.formatOptions?.maskType === 'phone') {
          return value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
        }
        if (field.formatOptions?.maskType === 'email') {
          return value.replace(/(.{2}).*(@.*)/, '$1***$2');
        }
        return value;

      default:
        // 字符串截断
        if (typeof value === 'string' && value.length > 100) {
          return value.substring(0, 100) + '...';
        }
        return value;
    }
  };

  if (loading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableBody>
            <TableLoading colSpan={listFields.length + (features.batchDelete ? 1 : 0) + ((features.update || features.delete) ? 1 : 0)} />
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border rounded-lg p-8">
        <div className="text-center text-muted-foreground">暂无数据</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {/* 批量选择列 */}
            {features.batchDelete && (
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="全选"
                />
              </TableHead>
            )}

            {/* 动态字段列 */}
            {listFields.map((field) => (
              <TableHead
                key={field.name}
                style={{ width: field.listWidth }}
                className={
                  field.listAlign === 'center'
                    ? 'text-center'
                    : field.listAlign === 'right'
                    ? 'text-right'
                    : ''
                }
              >
                {field.label}
              </TableHead>
            ))}

            {/* 操作列 */}
            {(features.update || features.delete) && (
              <TableHead className="text-right">操作</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {/* 批量选择 */}
              {features.batchDelete && (
                <TableCell>
                  <Checkbox
                    checked={isRowSelected(row.id)}
                    onCheckedChange={(checked) => handleSelectRow(row.id, checked)}
                    aria-label={`选择行 ${row.id}`}
                  />
                </TableCell>
              )}

              {/* 动态字段值 */}
              {listFields.map((field) => (
                <TableCell
                  key={field.name}
                  className={
                    field.listAlign === 'center'
                      ? 'text-center'
                      : field.listAlign === 'right'
                      ? 'text-right'
                      : ''
                  }
                >
                  {formatFieldValue(row[field.name], field)}
                </TableCell>
              ))}

              {/* 操作按钮 */}
              {(features.update || features.delete) && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {features.update && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit?.(row)}
                        title="编辑"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {features.delete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete?.(row)}
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
