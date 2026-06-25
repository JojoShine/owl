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
import { Settings2Icon, CodeIcon, TrashIcon, Trash2Icon, EyeIcon } from 'lucide-react';

export default function ConfigsSection({
  configs,
  loading,
  pagination,
  onView,
  onEdit,
  onGenerate,
  onDeleteCode,
  onDeleteConfig,
  onPageChange,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>模块配置</CardTitle>
        <CardDescription>
          管理已生成的模块配置
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">加载中...</div>
        ) : configs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">暂无配置</div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>模块名称</TableHead>
                    <TableHead>表名</TableHead>
                    <TableHead>字段数</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>功能</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{config.module_name}</span>
                          {config.description && (
                            <span className="text-xs text-muted-foreground">{config.description}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {config.table_name}
                        </code>
                      </TableCell>
                      <TableCell>{config.fields?.length || 0}</TableCell>
                      <TableCell>
                        {config.generated_files?.length > 0 ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600">已生成</Badge>
                        ) : (
                          <Badge variant="outline">未生成</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {config.enable_create && <Badge variant="secondary" className="text-xs">新增</Badge>}
                          {config.enable_update && <Badge variant="secondary" className="text-xs">编辑</Badge>}
                          {config.enable_delete && <Badge variant="secondary" className="text-xs">删除</Badge>}
                          {config.enable_batch_delete && <Badge variant="secondary" className="text-xs">批量删除</Badge>}
                          {config.enable_export && <Badge variant="secondary" className="text-xs">导出</Badge>}
                          {config.enable_import && <Badge variant="secondary" className="text-xs">导入</Badge>}
                          {!config.enable_create && !config.enable_update && !config.enable_delete &&
                           !config.enable_batch_delete && !config.enable_export && !config.enable_import && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onView(config)}
                            title="查看详情"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(config)}
                            title="编辑配置"
                          >
                            <Settings2Icon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onGenerate(config)}
                            title="生成代码"
                          >
                            <CodeIcon className="w-4 h-4" />
                          </Button>
                          {config.generated_files?.length > 0 && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onDeleteCode(config.id)}
                              title="删除生成的代码"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteConfig(config.id)}
                            title="删除配置"
                          >
                            <Trash2Icon className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
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
