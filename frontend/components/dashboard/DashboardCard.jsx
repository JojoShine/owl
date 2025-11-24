'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

/**
 * Dashboard Card Component
 * Flexible card that renders different chart types
 * Modes: 'line', 'bar', 'area', 'pie'
 */
export default function DashboardCard({ title, data, mode = 'line', dataKey = 'value', xKey = 'name' }) {
  const renderContent = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <p className="text-muted-foreground text-center py-12">暂无数据</p>;
    }

    switch (mode) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'area':
        return renderAreaChart();
      case 'pie':
        return renderPieChart();
      default:
        return <p className="text-muted-foreground">Unknown mode</p>;
    }
  };

  const renderLineChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={xKey} stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={xKey} stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey={dataKey} fill="hsl(var(--primary))" isAnimationActive={true} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderAreaChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={xKey} stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--primary))"
            isAnimationActive={true}
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = () => {
    return (
      <div className="flex justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
              isAnimationActive={true}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
