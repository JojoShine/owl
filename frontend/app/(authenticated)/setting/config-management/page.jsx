'use client';

import { useState, useEffect } from 'react';
import SystemInfoTab from '@/components/system-config/SystemInfoTab';
import { systemConfigApi } from '@/lib/api/system-config.api';
import { Loading } from '@/components/ui/loading';

export default function ConfigManagementPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await systemConfigApi.getConfig();
      if (response.success) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="sm" variant="pulse" />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">配置管理</h1>
        <p className="text-muted-foreground mt-1">
          管理系统的外观和主题配置
        </p>
      </div>

      <SystemInfoTab config={config} onUpdate={fetchConfig} />
    </div>
  );
}
