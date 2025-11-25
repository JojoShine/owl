'use client';

import { useState, useEffect } from 'react';
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

// Tailwind color palette (matching monitor center chart colors)
const CHART_COLORS = {
  primary: 'hsl(var(--primary))',  // primary color (for line/bar/area charts, matches monitor CPU trend)
  emerald: '#10b981',     // emerald-500 (pie chart)
  amber: '#f59e0b',       // amber-500 (pie chart)
  red: '#ef4444',         // red-500 (pie chart)
  purple: '#a855f7',      // purple-500 (pie chart)
  pink: '#ec4899',        // pink-500 (pie chart)
};

const COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.emerald,
  CHART_COLORS.amber,
  CHART_COLORS.red,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
];

/**
 * Dashboard Card Component
 * Flexible card that renders different chart types
 * Modes: 'line', 'bar', 'area', 'pie'
 */
export default function DashboardCard({ title, data, mode = 'line', dataKey = 'value', xKey = 'name', hideTitle = false, unit = '' }) {
  // Use the primary color from CSS variable
  const primaryColor = 'hsl(var(--primary))';

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
            <span className="font-semibold">{entry.value}{unit && ` ${unit}`}</span>
          </p>
        ))}
      </div>
    );
  };

  const renderLineChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={xKey} stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} width={40} />
          <Tooltip
            content={<CustomTooltip />}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Legend wrapperStyle={{ color: '#ffffff' }} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={primaryColor}
            strokeWidth={2}
            dot={{ fill: primaryColor, r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={xKey} stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} width={40} />
          <Tooltip
            content={<CustomTooltip />}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Legend wrapperStyle={{ color: '#ffffff' }} />
          <Bar dataKey={dataKey} fill={primaryColor} isAnimationActive={true} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderAreaChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={xKey} stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} width={40} />
          <Tooltip
            content={<CustomTooltip />}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Legend wrapperStyle={{ color: '#ffffff' }} />
          <Area
            type="monotone"
            dataKey={dataKey}
            fill={primaryColor}
            stroke={primaryColor}
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
          <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
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
            <Tooltip
              content={<CustomPieTooltip />}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend wrapperStyle={{ color: '#ffffff' }} />
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
