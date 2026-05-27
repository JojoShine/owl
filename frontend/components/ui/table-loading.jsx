'use client';

import { TableRow, TableCell } from '@/components/ui/table';
import { Loading } from '@/components/ui/loading';

/**
 * 表格加载行组件
 * 用于在表格数据加载时显示统一的加载指示器
 *
 * @param {number} colSpan - 合并的列数（默认7）
 */
export function TableLoading({ colSpan = 7 }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-8">
        <Loading size="md" variant="pulse" />
      </TableCell>
    </TableRow>
  );
}

export default TableLoading;