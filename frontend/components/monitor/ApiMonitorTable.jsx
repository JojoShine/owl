import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { formatDateTime } from '@/lib/date-utils';

export default function ApiMonitorTable({
  monitors = [],
  loading = false,
  onTest,
  onEdit,
  onDelete,
  onViewDetails
}) {
  /**
   * 渲染状态徽章
   */
  const renderStatusBadge = (status, enabled) => {
    if (!enabled) {
      return <Badge variant="secondary">已禁用</Badge>;
    }

    if (!status) {
      return <Badge variant="secondary">未检测</Badge>;
    }

    const statusConfig = {
      success: {
        icon: CheckCircle2,
        variant: 'default',
        className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        label: '成功'
      },
      failed: {
        icon: XCircle,
        variant: 'destructive',
        className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        label: '失败'
      },
      timeout: {
        icon: Clock,
        variant: 'secondary',
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
        label: '超时'
      }
    };

    const config = statusConfig[status] || statusConfig.failed;
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  /**
   * 渲染HTTP方法徽章
   */
  const renderMethodBadge = (method) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      POST: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      PUT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      DELETE: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      PATCH: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    };

    return (
      <Badge className={colors[method] || 'bg-gray-100 text-gray-700'}>
        {method}
      </Badge>
    );
  };

  /**
   * 格式化响应时间
   */
  const formatResponseTime = (ms) => {
    if (!ms && ms !== 0) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  /**
   * 截断URL显示
   */
  const truncateUrl = (url, maxLength = 50) => {
    if (!url) return '-';
    if (url.length <= maxLength) return url;
    return (
      <span title={url}>
        {url.substring(0, maxLength)}...
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!monitors || monitors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">暂无监控配置</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead style={{ width: '200px' }}>名称</TableHead>
            <TableHead style={{ width: 'auto' }}>URL</TableHead>
            <TableHead style={{ width: '80px' }}>方法</TableHead>
            <TableHead style={{ width: '120px' }}>状态</TableHead>
            <TableHead style={{ width: '100px' }}>响应时间</TableHead>
            <TableHead style={{ width: '180px' }}>最近检测</TableHead>
            <TableHead style={{ width: '240px' }}>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monitors.map((monitor) => (
            <TableRow key={monitor.id}>
              <TableCell className="font-medium">{monitor.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {truncateUrl(monitor.url)}
              </TableCell>
              <TableCell>
                {renderMethodBadge(monitor.method)}
              </TableCell>
              <TableCell>
                {renderStatusBadge(monitor.lastLog?.status, monitor.enabled)}
              </TableCell>
              <TableCell>
                {formatResponseTime(monitor.lastLog?.response_time)}
              </TableCell>
              <TableCell className="text-sm">
                {monitor.lastLog?.created_at ? formatDateTime(monitor.lastLog.created_at) : '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTest?.(monitor)}
                    disabled={!monitor.enabled}
                    title="立即测试"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(monitor)}
                    title="编辑"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails?.(monitor)}
                    title="查看详情"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(monitor)}
                    className="text-destructive hover:text-destructive"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
