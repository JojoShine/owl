'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { CountMetricsContainer } from '@/components/dashboard/CountMetric';
import DashboardCard from '@/components/dashboard/DashboardCard';
import axios from '@/lib/axios';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/dashboard');
        if (response.success) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-full">
        {/* Count Metrics Section */}
        {!loading && dashboardData && (
          <>
            <CountMetricsContainer metrics={dashboardData.metrics} />

            {/* Dashboard Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardCard
                title="最近登录趋势"
                data={dashboardData.recentLogins}
                mode="line"
                dataKey="登录数"
                xKey="date"
              />

              <DashboardCard
                title="系统概览"
                data={dashboardData.systemOverview}
                mode="pie"
                dataKey="value"
                xKey="name"
                hideTitle={true}
              />

              <DashboardCard
                title="存储概览"
                data={dashboardData.storageOverview}
                mode="bar"
                dataKey="value"
                xKey="name"
              />

              <DashboardCard
                title="操作统计"
                data={dashboardData.recentOperations}
                mode="bar"
                dataKey="value"
                xKey="name"
              />

              <DashboardCard
                title="在线用户趋势"
                data={dashboardData.onlineUsers}
                mode="area"
                dataKey="在线用户"
                xKey="time"
              />

              <DashboardCard
                title="访问趋势"
                data={dashboardData.accessTrend}
                mode="line"
                dataKey="visits"
                xKey="date"
              />
            </div>
          </>
        )}

        {loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded mb-4 w-1/3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
