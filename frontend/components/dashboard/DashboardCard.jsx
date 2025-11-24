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
  Label,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

/**
 * Dashboard Card Component
 * Flexible card that renders different chart types
 * Modes: 'line', 'bar', 'area', 'pie'
 */
export default function DashboardCard({ title, data, mode = 'line', dataKey = 'value', xKey = 'name', hideTitle = false }) {
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

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-foreground">
            <span style={{ color: entry.color }}>{entry.name}: </span>
            <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  };

  const renderLineChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={xKey} stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
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
          <Tooltip content={<CustomTooltip />} />
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
          <Tooltip content={<CustomTooltip />} />
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

  const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
        <p className="text-sm text-foreground font-semibold">{payload[0].payload.name}</p>
        <p className="text-sm text-foreground">
          数量: <span className="font-semibold">{payload[0].value}</span>
        </p>
      </div>
    );
  };

  const renderPieChart = () => {
    return (
      <div className="flex justify-center items-center py-4">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey={dataKey}
              isAnimationActive={true}
              label={(entry) => `${entry.name}`}
              labelLine={false}
              labelPosition="outside"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card>
      {!hideTitle && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={hideTitle ? 'pt-6' : ''}>{renderContent()}</CardContent>
    </Card>
  );
}
