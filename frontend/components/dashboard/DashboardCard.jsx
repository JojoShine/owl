'use client'

import { useEffect, useRef, useMemo } from 'react'
import * as echarts from 'echarts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from 'next-themes'

const CHART_COLORS = ['#00d4ff', '#00b8ff', '#0099ff', '#0080ff', '#0066ff', '#0055ff', '#0044cc', '#0033aa']

// Pie Chart 专用彩色调色板，提供丰富的颜色组合
const PIE_COLORS = [
  'hsl(var(--primary) / 1)',    // 主题色
  '#ec4899',                     // 粉色
  '#f59e0b',                     // 琥珀色
  '#8b5cf6',                     // 紫色
  '#10b981',                     // 翠绿
  '#06b6d4',                     // 青色
  '#f43f5e',                     // 玫瑰红
  '#a855f7',                     // 紫罗兰
  '#14b8a6',                     // 绿松
  '#84cc16',                     // 青柠
]

// 从 Tailwind CSS 变量中获取颜色值
const getTailwindColor = (variable) => {
  if (typeof document === 'undefined') return '#000'
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
}

/**
 * Dashboard Card Component
 * 使用 ECharts 图表库，支持多种图表类型
 * Modes: 'line', 'bar', 'area', 'pie'
 */
function DashboardCard({
  title,
  data,
  mode = 'line',
  dataKey = 'value',
  xKey = 'name',
  hideTitle = false,
  unit = '',
}) {
  const { theme } = useTheme()
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  // 序列化数据为字符串，用于依赖比较
  const dataString = useMemo(() => {
    if (!data || data.length === 0) return ''
    return JSON.stringify(data)
  }, [data])

  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return

    // 主题切换时销毁旧实例
    if (chartInstance.current) {
      chartInstance.current.dispose()
      chartInstance.current = null
    }

    // 创建新的图表实例
    chartInstance.current = echarts.init(chartRef.current, theme === 'dark' ? 'dark' : 'light')

    // 获取当前主题的文字颜色
    const isDark = theme === 'dark'
    const textColor = isDark ? '#ffffff' : '#000000'
    const gridColor = isDark ? '#333333' : '#e5e7eb'
    // Line、Area、Bar 图表使用主题自适应颜色（暗黑白色，浅色黑色）
    const lineColor = isDark ? '#ffffff' : '#000000'

    let option = {}

    if (mode === 'line') {
      option = {
        color: [lineColor],
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          textStyle: { color: textColor },
          borderColor: isDark ? '#444444' : '#cccccc',
          borderWidth: 1,
        },
        grid: {
          left: 60,
          right: 30,
          top: 10,
          bottom: 30,
          containLabel: false,
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item[xKey]),
          axisLine: { lineStyle: { color: isDark ? '#444444' : '#cccccc' } },
          axisLabel: { color: textColor },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: isDark ? '#444444' : '#cccccc' } },
          axisLabel: { color: textColor },
          splitLine: { lineStyle: { color: gridColor } },
        },
        series: [
          {
            data: data.map(item => item[dataKey]),
            type: 'line',
            smooth: true,
            lineStyle: { width: 3, color: lineColor },
            itemStyle: { borderWidth: 2, borderColor: lineColor },
            symbolSize: 6,
          },
        ],
      }
    } else if (mode === 'area') {
      option = {
        color: [lineColor],
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          textStyle: { color: textColor },
          borderColor: isDark ? '#444444' : '#cccccc',
          borderWidth: 1,
        },
        grid: {
          left: 60,
          right: 30,
          top: 10,
          bottom: 30,
          containLabel: false,
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item[xKey]),
          axisLine: { lineStyle: { color: isDark ? '#444444' : '#cccccc' } },
          axisLabel: { color: textColor },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: isDark ? '#444444' : '#cccccc' } },
          axisLabel: { color: textColor },
          splitLine: { lineStyle: { color: gridColor } },
        },
        series: [
          {
            data: data.map(item => item[dataKey]),
            type: 'line',
            smooth: true,
            areaStyle: { color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)' },
            lineStyle: { width: 3, color: lineColor },
            itemStyle: { borderWidth: 2, borderColor: lineColor },
            symbolSize: 6,
          },
        ],
      }
    } else if (mode === 'bar') {
      option = {
        color: [lineColor],
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          textStyle: { color: textColor },
          borderColor: isDark ? '#444444' : '#cccccc',
          borderWidth: 1,
        },
        grid: {
          left: 60,
          right: 30,
          top: 10,
          bottom: 30,
          containLabel: false,
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item[xKey]),
          axisLine: { lineStyle: { color: isDark ? '#444444' : '#cccccc' } },
          axisLabel: { color: textColor },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: isDark ? '#444444' : '#cccccc' } },
          axisLabel: { color: textColor },
          splitLine: { lineStyle: { color: gridColor } },
        },
        series: [
          {
            data: data.map(item => item[dataKey]),
            type: 'bar',
            itemStyle: {
              borderRadius: [8, 8, 0, 0],
              color: lineColor,
            },
            emphasis: {
              disabled: true,
            },
          },
        ],
      }
    } else if (mode === 'pie') {
      option = {
        color: PIE_COLORS,
        tooltip: {
          trigger: 'item',
          backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          textStyle: { color: textColor },
          borderColor: isDark ? '#444444' : '#cccccc',
          borderWidth: 1,
        },
        legend: {
          bottom: 0,
          left: 'center',
          textStyle: { color: textColor },
        },
        series: [
          {
            data: data.map((item, index) => ({
              name: item[xKey],
              value: item[dataKey],
              itemStyle: {
                color: PIE_COLORS[index % PIE_COLORS.length],
              },
            })),
            type: 'pie',
            radius: ['40%', '70%'],
            label: {
              color: textColor,
            },
            itemStyle: {
              borderColor: isDark ? '#1a1a1a' : '#ffffff',
              borderWidth: 2,
            },
          },
        ],
      }
    }

    chartInstance.current.setOption(option)

    // 清理函数：当组件卸载或主题改变时销毁图表
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose()
        chartInstance.current = null
      }
    }
  }, [dataString, mode, dataKey, xKey, theme])

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 检查数据是否为空
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <Card>
        {!hideTitle && (
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className={hideTitle ? 'pt-6' : ''}>
          <div
            style={{ height: 360 }}
            className="flex items-center justify-center text-muted-foreground"
          >
            暂无数据
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {!hideTitle && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={hideTitle ? 'pt-6' : ''}>
        <div ref={chartRef} style={{ height: 360 }} />
      </CardContent>
    </Card>
  )
}

export default DashboardCard
