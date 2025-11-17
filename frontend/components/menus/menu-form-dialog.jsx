'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import { IconPicker } from '@/components/ui/icon-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { menuApi } from '@/lib/api';
import { toast } from 'sonner';

// 表单验证规则
const menuSchema = z.object({
  name: z.string().min(2, '菜单名称至少2个字符').max(50, '菜单名称最多50个字符'),
  path: z.string().optional(),
  component: z.string().optional(),
  icon: z.string().optional(),
  type: z.enum(['menu', 'button', 'link']),
  visible: z.boolean(),
  sort: z.number().int().min(0).max(9999),
  status: z.enum(['active', 'inactive']),
  permission_code: z.string().optional(),
});

export default function MenuFormDialog({ open, onOpenChange, menu, onSuccess }) {
  const isEdit = !!menu?.id;
  const [parentMenus, setParentMenus] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      name: '',
      path: '',
      component: '',
      icon: '',
      type: 'menu',
      visible: true,
      sort: 0,
      status: 'active',
      permission_code: '',
    },
  });

  // 获取父级菜单列表
  useEffect(() => {
    const fetchParentMenus = async () => {
      try {
        const response = await menuApi.getMenuTree();
        setParentMenus(response.data || []);
      } catch (error) {
        console.error('获取父级菜单失败:', error);
      }
    };
    if (open) {
      fetchParentMenus();
    }
  }, [open]);

  // 当menu变化时，更新表单
  useEffect(() => {
    if (menu) {
      reset({
        name: menu.name || '',
        path: menu.path || '',
        component: menu.component || '',
        icon: menu.icon || '',
        type: menu.type || 'menu',
        visible: menu.visible !== undefined ? menu.visible : true,
        sort: menu.sort || 0,
        status: menu.status || 'active',
        permission_code: menu.permission_code || '',
      });
    } else {
      reset({
        name: '',
        path: '',
        component: '',
        icon: '',
        type: 'menu',
        visible: true,
        sort: 0,
        status: 'active',
        permission_code: '',
      });
    }
  }, [menu, reset]);

  const onSubmit = async (data) => {
    try {
      const submitData = {
        ...data,
        parent_id: menu?.parent_id || null,
      };

      if (isEdit) {
        await menuApi.updateMenu(menu.id, submitData);
      } else {
        await menuApi.createMenu(submitData);
      }

      toast.success(menu && menu.id ? '更新菜单成功' : '创建菜单成功');
      onSuccess?.();
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('保存菜单失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '保存失败';
      toast.error(errorMessage);
    }
  };

  const typeValue = watch('type');
  const statusValue = watch('status');
  const visibleValue = watch('visible');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑菜单' : '新增菜单'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改菜单信息' : '填写新菜单信息'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 菜单名称 */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">
                菜单名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="请输入菜单名称"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* 路由路径 */}
            <div className="space-y-2">
              <Label htmlFor="path">路由路径</Label>
              <Input
                id="path"
                {...register('path')}
                placeholder="/dashboard/example"
              />
            </div>

            {/* 组件路径 */}
            <div className="space-y-2">
              <Label htmlFor="component">组件路径</Label>
              <Input
                id="component"
                {...register('component')}
                placeholder="ExamplePage"
              />
            </div>

            {/* 图标 */}
            <div className="space-y-2">
              <Label htmlFor="icon">图标</Label>
              <IconPicker
                value={watch('icon')}
                onChange={(value) => setValue('icon', value)}
                placeholder="选择图标"
              />
            </div>

            {/* 权限代码 */}
            <div className="space-y-2">
              <Label htmlFor="permission_code">权限代码</Label>
              <Input
                id="permission_code"
                {...register('permission_code')}
                placeholder="user:read"
              />
            </div>

            {/* 菜单类型 */}
            <div className="space-y-2">
              <Label>菜单类型</Label>
              <Select
                value={typeValue}
                onValueChange={(value) => setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="menu">菜单</SelectItem>
                  <SelectItem value="button">按钮</SelectItem>
                  <SelectItem value="link">链接</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 状态 */}
            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={statusValue}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">启用</SelectItem>
                  <SelectItem value="inactive">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 排序 */}
            <div className="space-y-2">
              <Label htmlFor="sort">排序</Label>
              <Input
                id="sort"
                type="number"
                {...register('sort', { valueAsNumber: true })}
                placeholder="数字越小越靠前"
              />
            </div>

            {/* 是否显示 */}
            <div className="space-y-2">
              <Label htmlFor="visible">是否显示</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="visible"
                  checked={visibleValue}
                  onCheckedChange={(checked) => setValue('visible', checked)}
                />
                <Label htmlFor="visible" className="!mt-0 cursor-pointer">
                  {visibleValue ? '显示' : '隐藏'}
                </Label>
              </div>
            </div>
          </div>

          {/* 重要提示 */}
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
              <strong>重要提示：</strong>创建菜单后，需要在<strong>角色管理</strong>中为相应角色分配此菜单，用户才能在侧边栏看到该菜单。
            </AlertDescription>
          </Alert>

          {/* 说明文字 */}
          <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t">
            <p>• 路由路径：菜单对应的前端路由地址</p>
            <p>• 组件路径：对应的页面组件名称</p>
            <p>• 图标：点击选择图标或输入 lucide-react 图标名称</p>
            <p>• 权限代码：访问此菜单需要的权限代码</p>
            <p>• 排序：数字越小，菜单位置越靠前</p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
