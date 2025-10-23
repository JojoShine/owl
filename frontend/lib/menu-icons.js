import {
  LayoutDashboard,
  Users,
  Shield,
  Key,
  Menu,
  Settings,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FileText,
  Building2,
  Activity,
  BarChart3,
  Network,
  Bell,
  Mail,
  Code,
} from 'lucide-react';

/**
 * 图标名称到组件的映射
 * 将后端返回的图标名称字符串转换为 React 组件
 */
export const iconMap = {
  LayoutDashboard,
  Users,
  Shield,
  Key,
  Menu,
  MenuIcon: Menu, // 'MenuIcon' 映射到 Menu 组件
  Settings,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FileText,
  Building2,
  Activity,
  BarChart3,
  Network,
  Bell,
  Mail,
  Code,
};

/**
 * 根据名称获取图标组件
 * @param {string} iconName - 图标名称
 * @returns {React.Component} 图标组件，如果未找到则返回默认的 Menu 图标
 */
export function getMenuIcon(iconName) {
  return iconMap[iconName] || Menu; // 默认返回Menu图标
}
