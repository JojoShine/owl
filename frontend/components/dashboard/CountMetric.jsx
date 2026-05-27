import { Users, UserCheck, LogIn, Clock, HardDrive } from 'lucide-react';

/**
 * Count Metric Component
 * Displays a single count metric with icon, label, and value
 */
export default function CountMetric({ icon: Icon, label, value, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  return (
    <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <h3 className="text-3xl font-bold">{value ?? '-'}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

/**
 * Count Metrics Container Component
 * Displays all 5 count metrics in a grid
 */
export function CountMetricsContainer({ metrics }) {
  const metricConfig = [
    { key: 'activeUsers', label: '活跃用户', icon: UserCheck, color: 'green' },
    { key: 'totalUsers', label: '总用户数', icon: Users, color: 'blue' },
    { key: 'recentLogins', label: '最近登录', icon: LogIn, color: 'purple' },
    { key: 'runningDays', label: '运行天数', icon: Clock, color: 'orange' },
    { key: 'diskUsagePercent', label: '磁盘使用', icon: HardDrive, color: 'red' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {metricConfig.map((config) => (
        <CountMetric
          key={config.key}
          icon={config.icon}
          label={config.label}
          value={metrics?.[config.key]}
          color={config.color}
        />
      ))}
    </div>
  );
}
