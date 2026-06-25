'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

export default function HistorySection({
  history,
  loading,
  pagination,
  onPageChange,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>生成历史</CardTitle>
        <CardDescription>
          查看代码生成的历史记录
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">加载中...</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">暂无历史记录</div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>模块名称</TableHead>
                    <TableHead>生成时间</TableHead>
                    <TableHead>操作者</TableHead>
                    <TableHead>生成文件</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.module_config?.module_name}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(record.generated_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {record.created_by_user?.real_name || record.created_by_user?.username || '未知'}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-wrap gap-1">
                          {record.files?.map((file) => (
                            <Badge key={file} variant="secondary" className="text-xs">
                              {file.split('/').pop()}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.status === 'success' ? (
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            <span className="text-sm">成功</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircleIcon className="w-4 h-4 text-red-600" />
                            <span className="text-sm">失败</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination.total > pagination.pageSize && (
              <Pagination
                page={pagination.page}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onPageChange={onPageChange}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
