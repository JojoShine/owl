'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableLoading } from '@/components/ui/table-loading';
import { Pagination } from '@/components/ui/pagination';

/**
 * 数据表格组件 - 通用的数据展示表格
 *
 * @param {Object} props
 * @param {Array} props.columns - 列配置数组
 * @param {Array} props.data - 数据数组
 * @param {boolean} props.loading - 加载状态
 * @param {Function} props.actions - 操作列渲染函数 (row) => ReactNode
 * @param {string} props.emptyText - 空数据提示文本
 * @param {Object} props.pagination - 分页配置 { page, total, pageSize }
 * @param {Function} props.onPageChange - 页码变化回调
 * @param {Function} props.onPageSizeChange - 每页数量变化回调
 * @param {string} props.rowKey - 行唯一标识字段名，默认 'id'
 *
 * @example
 * // 基础用法
 * const columns = [
 *   { key: 'username', label: '用户名' },
 *   { key: 'email', label: '邮箱' },
 *   { key: 'status', label: '状态', render: (value) => <Badge>{value}</Badge> }
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={users}
 *   loading={isLoading}
 *   actions={(row) => (
 *     <>
 *       <Button onClick={() => handleEdit(row)}><Edit className="h-4 w-4" /></Button>
 *       <Button onClick={() => handleDelete(row)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
 *     </>
 *   )}
 *   pagination={{ page: 1, total: 100, pageSize: 10 }}
 *   onPageChange={handlePageChange}
 *   onPageSizeChange={handlePageSizeChange}
 * />
 */
export function DataTable({
  columns = [],
  data = [],
  loading = false,
  actions,
  emptyText = '暂无数据',
  pagination,
  onPageChange,
  onPageSizeChange,
  rowKey = 'id'
}) {
  // 计算总列数（包括操作列）
  const totalColumns = columns.length + (actions ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* 表格 */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.headerClassName}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.label}
                </TableHead>
              ))}
              {actions && (
                <TableHead className="text-right">操作</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableLoading colSpan={totalColumns} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row[rowKey]}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={column.cellClassName}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] ?? '-'}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {actions(row)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {pagination && (
        <Pagination
          page={pagination.page}
          total={pagination.total}
          pageSize={pagination.pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
