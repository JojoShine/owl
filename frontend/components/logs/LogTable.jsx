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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { EyeIcon, FileText } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/date';

export default function LogTable({ type, logs, loading, pagination, onPageChange, onPageSizeChange }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const currentPage = pagination?.page ?? 1;
  const pageSize = pagination?.limit ?? 10;
  const totalItems = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 0;

  /**
   * 查看详情
   */
  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  /**
   * 获取表头（根据日志类型）
   */
  const getColumns = () => {
    const common = [
      { key: 'timestamp', label: '时间', className: 'whitespace-nowrap' },
    ];

    const typeColumns = {
      operation: [
        { key: 'user', label: '用户ID', className: 'whitespace-nowrap' },
        { key: 'method', label: '方法', className: 'whitespace-nowrap' },
        { key: 'url', label: 'URL' },
        { key: 'ip', label: 'IP地址', className: 'whitespace-nowrap' },
      ],
      login: [
        { key: 'username', label: '用户名', className: 'whitespace-nowrap' },
        { key: 'action', label: '操作', className: 'whitespace-nowrap' },
        { key: 'status', label: '状态', className: 'whitespace-nowrap' },
        { key: 'ip', label: 'IP地址', className: 'whitespace-nowrap' },
        { key: 'message', label: '消息' },
      ],
      system: [
        { key: 'level', label: '级别', className: 'whitespace-nowrap' },
        { key: 'message', label: '消息' },
      ],
      access: [
        { key: 'method', label: '方法', className: 'whitespace-nowrap' },
        { key: 'url', label: 'URL' },
        { key: 'ip', label: 'IP地址', className: 'whitespace-nowrap' },
      ],
      error: [
        { key: 'level', label: '级别', className: 'whitespace-nowrap' },
        { key: 'message', label: '错误消息' },
      ],
      database: [
        { key: 'type', label: '数据库类型', className: 'whitespace-nowrap' },
        { key: 'action', label: '操作', className: 'whitespace-nowrap' },
        { key: 'details', label: '详情' },
      ],
    };

    return [...common, ...(typeColumns[type] || [])];
  };

  /**
   * 渲染单元格内容
   */
  const renderCellValue = (log, column) => {
    const value = log[column.key];

    if (!value) return '-';

    // 特殊处理
    if (column.key === 'timestamp') {
      return formatDateTime(value);
    }

    if (column.key === 'status') {
      return (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            value === 'success'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}
        >
          {value === 'success' ? '成功' : '失败'}
        </span>
      );
    }

    if (column.key === 'method') {
      const colors = {
        GET: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        POST: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        PUT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
        DELETE: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      };

      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${colors[value] || ''}`}>
          {value}
        </span>
      );
    }

    if (column.key === 'type') {
      const colors = {
        redis: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
        postgresql: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        sensitive_data_access: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      };

      const label = value === 'redis' ? 'Redis' : value === 'postgresql' ? 'PostgreSQL' : value === 'sensitive_data_access' ? '敏感数据访问' : value;

      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${colors[value] || ''}`}>
          {label}
        </span>
      );
    }

    if (column.key === 'action') {
      // 登录日志的action
      if (log.type === 'login' || value === 'login' || value === 'logout') {
        return value === 'login' ? '登录' : value === 'logout' ? '登出' : value;
      }
      
      // 数据库日志的action
      if (log.type === 'redis' || log.type === 'postgresql') {
        const labels = {
          set: 'SET',
          get: 'GET',
          del: 'DEL',
          query: 'QUERY',
        };
        return labels[value] || value;
      }
      
      // 敏感数据访问的action
      const sensitiveLabels = {
        plain_access_granted: '权限授予',
        password_verify_failed: '密码验证失败',
        batch_masking: '批量脱敏',
      };
      
      return sensitiveLabels[value] || value;
    }

    // 数据库日志的详情字段
    if (column.key === 'details') {
      // 根据类型显示不同的详情
      if (log.type === 'redis') {
        const parts = [];
        if (log.key) parts.push(`Key: ${log.key}`);
        if (log.ttl) parts.push(`TTL: ${log.ttl}s`);
        if (log.user_id) parts.push(`User: ${log.user_id}`);
        return parts.length > 0 ? parts.join(' | ') : '-';
      }
      
      if (log.type === 'postgresql') {
        const parts = [];
        if (log.timing) parts.push(`耗时: ${log.timing}`);
        return parts.length > 0 ? parts.join(' | ') : '-';
      }
      
      return '-';
    }

    // 截断过长的文本
    if (typeof value === 'string' && value.length > 80) {
      return (
        <span title={value}>
          {value.substring(0, 80)}...
        </span>
      );
    }

    return value;
  };

  const columns = getColumns();

  const hasData = Array.isArray(logs) && logs.length > 0;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border bg-card">
        {loading ? (
          <div className="overflow-x-auto">
            <Table>
              <TableBody>
                <TableLoading colSpan={columns.length + 1} />
              </TableBody>
            </Table>
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">暂无日志数据</h3>
            <p className="text-sm text-muted-foreground">
              当有新的日志记录时，会在这里显示
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key} className={column.className}>
                      {column.label}
                    </TableHead>
                  ))}
                  <TableHead className="w-[100px] whitespace-nowrap">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {renderCellValue(log, column)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(log)}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {hasData && totalPages > 1 && (
        <Pagination
          page={currentPage}
          total={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>日志详情</DialogTitle>
          </DialogHeader>
          <div className="max-h-[600px] overflow-y-auto space-y-4">
            {/* 基本信息 */}
            {selectedLog && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">类型:</span>
                    <span className="ml-2 font-medium">{selectedLog.type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">操作:</span>
                    <span className="ml-2 font-medium">{selectedLog.action}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">时间:</span>
                    <span className="ml-2 font-medium">{formatDateTime(selectedLog.timestamp)}</span>
                  </div>
                  {selectedLog.timing && (
                    <div>
                      <span className="text-muted-foreground">耗时:</span>
                      <span className="ml-2 font-medium">{selectedLog.timing}</span>
                    </div>
                  )}
                </div>
                
                {/* SQL 代码框 */}
                {selectedLog.sql && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">SQL 查询:</div>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto border whitespace-pre-wrap break-all">
                      <code>{selectedLog.sql}</code>
                    </pre>
                  </div>
                )}
                
                {/* Redis Key */}
                {selectedLog.key && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Redis Key:</div>
                    <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto border">
                      <code>{selectedLog.key}</code>
                    </pre>
                  </div>
                )}
                
                {/* 其他字段 */}
                {Object.keys(selectedLog).length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">完整数据:</div>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
