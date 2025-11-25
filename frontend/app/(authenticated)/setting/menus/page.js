'use client';

import { useState, useEffect } from 'react';
import { menuApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import MenuFormDialog from '@/components/menus/menu-form-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

export default function MenusPage() {
  const [menus, setMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);

  // 获取菜单树
  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      const response = await menuApi.getMenuTree();
      // 实际API返回格式：{ success: true, data: { items: [...] } } 或直接数组
      const menusData = response.data?.items || response.data || [];
      setMenus(Array.isArray(menusData) ? menusData : []);
      // 默认展开所有一级菜单
      const topLevelIds = (Array.isArray(menusData) ? menusData : []).map(m => m.id);
      setExpandedMenus(new Set(topLevelIds));
    } catch (error) {
      console.error('获取菜单列表失败:', error);
      setMenus([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // 新增菜单
  const handleAdd = (parentMenu = null) => {
    setEditingMenu(parentMenu ? { parent_id: parentMenu.id } : null);
    setIsDialogOpen(true);
  };

  // 编辑菜单
  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setIsDialogOpen(true);
  };

  // 删除菜单
  const handleDelete = (menu) => {
    setMenuToDelete(menu);
    setConfirmDialogOpen(true);
  };

  // 确认删除菜单
  const handleConfirmDelete = async () => {
    if (!menuToDelete) return;

    try {
      await menuApi.deleteMenu(menuToDelete.id);
      toast.success('删除菜单成功');
      fetchMenus();
    } catch (error) {
      console.error('删除菜单失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '删除失败';
      toast.error(errorMessage);
    } finally {
      setMenuToDelete(null);
    }
  };

  // 切换展开/收起
  const toggleExpanded = (menuId) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  // 菜单类型徽章
  const getTypeBadge = (type) => {
    const typeMap = {
      menu: { label: '菜单', variant: 'default' },
      button: { label: '按钮', variant: 'secondary' },
      link: { label: '链接', variant: 'outline' },
    };
    const config = typeMap[type] || typeMap.menu;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 状态徽章
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: '启用', variant: 'default' },
      inactive: { label: '禁用', variant: 'secondary' },
    };
    const config = statusMap[status] || statusMap.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 渲染菜单树
  const renderMenuTree = (menuList, level = 0) => {
    return menuList.map((menu) => {
      const hasChildren = menu.children && menu.children.length > 0;
      const isExpanded = expandedMenus.has(menu.id);

      return (
        <div key={menu.id}>
          <Card
            className="mb-2 hover:shadow-sm transition-shadow"
            style={{ marginLeft: `${level * 24}px` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* 菜单信息 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{menu.name}</span>
                      {/* 展开/收起按钮 */}
                      {hasChildren && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 shrink-0"
                          onClick={() => toggleExpanded(menu.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {getTypeBadge(menu.type)}
                      {getStatusBadge(menu.status)}
                      {!menu.visible && <Badge variant="outline">隐藏</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {menu.path && (
                        <code className="bg-muted px-2 py-0.5 rounded text-xs">{menu.path}</code>
                      )}
                      {menu.icon && <span>图标: {menu.icon}</span>}
                      {menu.permission_code && (
                        <span>权限: {menu.permission_code}</span>
                      )}
                      <span>排序: {menu.sort}</span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAdd(menu)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      添加子菜单
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(menu)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(menu)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 递归渲染子菜单 */}
          {hasChildren && isExpanded && renderMenuTree(menu.children, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button onClick={() => setExpandedMenus(new Set(menus.map(m => m.id)))} variant="outline">
          全部展开
        </Button>
        <Button onClick={() => setExpandedMenus(new Set())} variant="outline">
          全部收起
        </Button>
        <Button onClick={() => handleAdd()}>
          <Plus className="h-4 w-4 mr-2" />
          新增菜单
        </Button>
      </div>

      {/* 统计信息 */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">菜单总数</p>
              <p className="text-xl font-bold">
                {menus.reduce((count, menu) => {
                  const childCount = menu.children ? menu.children.length : 0;
                  return count + 1 + childCount;
                }, 0)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">一级菜单</p>
              <p className="text-xl font-bold">{menus.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">启用菜单</p>
              <p className="text-xl font-bold">
                {menus.reduce((count, menu) => {
                  const childActiveCount = menu.children
                    ? menu.children.filter(c => c.status === 'active').length
                    : 0;
                  return count + (menu.status === 'active' ? 1 : 0) + childActiveCount;
                }, 0)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">隐藏菜单</p>
              <p className="text-xl font-bold">
                {menus.reduce((count, menu) => {
                  const childHiddenCount = menu.children
                    ? menu.children.filter(c => !c.visible).length
                    : 0;
                  return count + (!menu.visible ? 1 : 0) + childHiddenCount;
                }, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 菜单树 */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <Loading size="md" variant="pulse" />
          </CardContent>
        </Card>
      ) : menus.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <p>暂无菜单</p>
            <Button onClick={() => handleAdd()} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              创建第一个菜单
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>{renderMenuTree(menus)}</div>
      )}

      {/* 菜单表单弹窗 */}
      <MenuFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        menu={editingMenu}
        onSuccess={fetchMenus}
      />

      {/* 确认删除对话框 */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        title="确认删除菜单"
        description={
          menuToDelete
            ? `确定要删除菜单 "${menuToDelete.name}" 吗？如果有子菜单也会一起删除。此操作无法撤销。`
            : ''
        }
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
      />
    </div>
  );
}
