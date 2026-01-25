/**
 * @file 数据洞察API接口
 * @description 提供实时的指标数据、图表数据和洞察
 * @module api/insights
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { MetricData, ChartData, Insight } from '../../../core/ui/types';

// 内存存储指标数据（实际应用中应该使用数据库）
let metrics: Map<string, MetricData> = new Map();
// 内存存储图表数据
let charts: Map<string, ChartData> = new Map();
// 内存存储洞察数据
let insights: Map<string, Insight> = new Map();

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * 初始化默认指标
 */
function initializeDefaultMetrics() {
  if (metrics.size === 0) {
    metrics.set('messages-sent', {
      id: 'messages-sent',
      name: '发送消息数',
      value: 0,
      unit: '条',
      trend: 'up',
      change: 0,
      timestamp: Date.now(),
    });

    metrics.set('response-time', {
      id: 'response-time',
      name: '平均响应时间',
      value: 0,
      unit: 'ms',
      trend: 'stable',
      change: 0,
      timestamp: Date.now(),
    });

    metrics.set('active-sessions', {
      id: 'active-sessions',
      name: '活跃会话数',
      value: 0,
      unit: '个',
      trend: 'stable',
      change: 0,
      timestamp: Date.now(),
    });

    metrics.set('tools-used', {
      id: 'tools-used',
      name: '工具使用次数',
      value: 0,
      unit: '次',
      trend: 'up',
      change: 0,
      timestamp: Date.now(),
    });
  }
}

/**
 * 生成随机图表数据
 * @param points 数据点数量
 * @returns 图表数据
 */
function generateChartData(points: number) {
  return Array.from({ length: points }, (_, i) => ({
    x: i,
    y: Math.floor(Math.random() * 100),
  }));
}

/**
 * 数据洞察API接口
 * @route GET /api/insights
 * @route GET /api/insights/metrics
 * @route GET /api/insights/charts
 * @route GET /api/insights/generate
 * @access 公开
 * @param req 请求对象
 * @param res 响应对象
 * @returns {Promise<void>}
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    initializeDefaultMetrics();

    const { type } = req.query;

    switch (req.method) {
      case 'GET':
        if (type === 'metrics') {
          // 获取所有指标
          const metricsList = Array.from(metrics.values());
          
          // 更新指标值（模拟实时数据）
          const updatedMetrics = metricsList.map(metric => {
            const oldValue = metric.value;
            const newValue = oldValue + Math.floor(Math.random() * 10) - 2;
            const change = newValue - oldValue;
            const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
            
            return {
              ...metric,
              value: Math.max(0, newValue),
              change,
              trend,
              timestamp: Date.now(),
            };
          });
          
          // 更新内存中的指标
          updatedMetrics.forEach(metric => {
            metrics.set(metric.id, metric);
          });
          
          res.status(200).json({ success: true, data: updatedMetrics });
        } else if (type === 'charts') {
          // 获取所有图表数据
          const chartList = Array.from(charts.values());
          
          // 如果没有图表数据，生成默认图表
          if (chartList.length === 0) {
            const defaultCharts: ChartData[] = [
              {
                id: 'messages-trend',
                title: '消息趋势',
                type: 'line',
                data: generateChartData(10),
                timestamp: Date.now(),
              },
              {
                id: 'response-time-trend',
                title: '响应时间趋势',
                type: 'line',
                data: generateChartData(10),
                timestamp: Date.now(),
              },
              {
                id: 'session-distribution',
                title: '会话分布',
                type: 'pie',
                data: [
                  { x: '活跃会话', y: Math.floor(Math.random() * 50) + 10 },
                  { x: '非活跃会话', y: Math.floor(Math.random() * 30) + 5 },
                ],
                timestamp: Date.now(),
              },
            ];
            
            defaultCharts.forEach(chart => {
              charts.set(chart.id, chart);
            });
            
            res.status(200).json({ success: true, data: defaultCharts });
          } else {
            // 更新图表数据
            const updatedCharts = chartList.map(chart => ({
              ...chart,
              data: generateChartData(10),
              timestamp: Date.now(),
            }));
            
            updatedCharts.forEach(chart => {
              charts.set(chart.id, chart);
            });
            
            res.status(200).json({ success: true, data: updatedCharts });
          }
        } else if (type === 'generate') {
          // 生成洞察
          const generatedInsights: Insight[] = [];
          const metricsList = Array.from(metrics.values());
          
          for (const metric of metricsList) {
            if (metric.trend === 'up' && metric.change > 5) {
              generatedInsights.push({
                id: generateId(),
                type: 'success',
                title: `${metric.name}显著增长`,
                description: `${metric.name}增长了 ${metric.change} ${metric.unit}，表现良好`,
                timestamp: Date.now(),
                priority: 'medium',
              });
            } else if (metric.trend === 'down' && metric.change < -5) {
              generatedInsights.push({
                id: generateId(),
                type: 'warning',
                title: `${metric.name}显著下降`,
                description: `${metric.name}下降了 ${Math.abs(metric.change)} ${metric.unit}，需要关注`,
                timestamp: Date.now(),
                priority: 'high',
                actions: [
                  {
                    label: '查看详情',
                    action: `insights:view:${metric.id}`,
                    style: 'primary',
                  },
                ],
              });
            }
          }
          
          // 清除旧洞察，添加新洞察
          insights.clear();
          generatedInsights.forEach(insight => {
            insights.set(insight.id, insight);
          });
          
          res.status(200).json({ success: true, data: generatedInsights });
        } else {
          // 获取所有洞察数据
          const insightsList = Array.from(insights.values())
            .sort((a, b) => {
              const priorityWeights = { critical: 4, high: 3, medium: 2, low: 1 };
              return priorityWeights[b.priority] - priorityWeights[a.priority];
            });
          
          res.status(200).json({ success: true, data: insightsList });
        }
        break;

      case 'POST':
        // 添加或更新指标
        const { metric } = req.body;
        if (metric && metric.id) {
          metrics.set(metric.id, {
            ...metric,
            timestamp: Date.now(),
          });
          res.status(201).json({ success: true, data: metric });
        } else {
          res.status(400).json({ success: false, error: 'Metric ID is required' });
        }
        break;

      case 'DELETE':
        // 删除指标
        const { metricId } = req.query;
        if (metricId) {
          const deleted = metrics.delete(metricId as string);
          if (deleted) {
            res.status(200).json({ success: true, data: { message: 'Metric deleted successfully' } });
          } else {
            res.status(404).json({ success: false, error: 'Metric not found' });
          }
        } else {
          res.status(400).json({ success: false, error: 'Metric ID is required' });
        }
        break;

      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Insights API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
