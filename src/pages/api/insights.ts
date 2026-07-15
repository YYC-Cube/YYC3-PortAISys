/**
 * @file pages/api/insights.ts
 * @description Insights 模块 — 数据洞察（含认证 + Zod 输入校验）
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.1.0
 * @created 2026-03-07
 * @updated 2026-07-16
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript,api
 */

import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { ChartData, Insight, MetricData } from '../../../core/ui/types';
import { withAuth } from '../../lib/auth';
import { InsightsQuerySchema, MetricDataSchema, validate } from './schemas';

// 内存存储指标数据（实际应用中应该使用数据库）
let metrics: Map<string, MetricData> = new Map();
// 内存存储图表数据
let charts: Map<string, ChartData> = new Map();
// 内存存储洞察数据
let insights: Map<string, Insight> = new Map();

/**
 * 生成唯一ID（使用 crypto 防止碰撞）
 * @returns {string} 唯一ID
 */
function generateId(): string {
  return crypto.randomUUID();
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
 * 处理 GET /api/insights 请求（按 type 分发）
 */
async function handleGetMetrics(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const type = req.query.type as string | undefined;

  if (type === 'metrics') {
    const metricsList = Array.from(metrics.values());
    const updatedMetrics = metricsList.map(metric => {
      const oldValue = metric.value;
      const newValue = oldValue + Math.floor(Math.random() * 10) - 2;
      const change = newValue - oldValue;
      const trend: MetricData['trend'] = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
      return { ...metric, value: Math.max(0, newValue), change, trend, timestamp: Date.now() };
    });
    updatedMetrics.forEach(m => metrics.set(m.id, m));
    res.status(200).json({ success: true, data: updatedMetrics });
    return;
  }

  if (type === 'charts') {
    const chartList = Array.from(charts.values());
    if (chartList.length === 0) {
      const defaultCharts: ChartData[] = [
        { id: 'messages-trend', title: '消息趋势', type: 'line', data: generateChartData(10) },
        { id: 'response-time-trend', title: '响应时间趋势', type: 'line', data: generateChartData(10) },
        { id: 'session-distribution', title: '会话分布', type: 'pie', data: [
          { x: '活跃会话', y: Math.floor(Math.random() * 50) + 10 },
          { x: '非活跃会话', y: Math.floor(Math.random() * 30) + 5 },
        ] },
      ];
      defaultCharts.forEach(c => charts.set(c.id, c));
      res.status(200).json({ success: true, data: defaultCharts });
      return;
    }
    const updatedCharts = chartList.map(c => ({ ...c, data: generateChartData(10) }));
    updatedCharts.forEach(c => charts.set(c.id, c));
    res.status(200).json({ success: true, data: updatedCharts });
    return;
  }

  if (type === 'generate') {
    const generatedInsights: Insight[] = [];
    for (const metric of metrics.values()) {
      if (metric.trend === 'up' && metric.change > 5) {
        generatedInsights.push({ id: generateId(), type: 'success', title: `${metric.name}显著增长`, description: `${metric.name}增长了 ${metric.change} ${metric.unit}，表现良好`, timestamp: Date.now(), priority: 'medium' });
      } else if (metric.trend === 'down' && metric.change < -5) {
        generatedInsights.push({ id: generateId(), type: 'warning', title: `${metric.name}显著下降`, description: `${metric.name}下降了 ${Math.abs(metric.change)} ${metric.unit}，需要关注`, timestamp: Date.now(), priority: 'high', actions: [{ label: '查看详情', action: () => {}, style: 'primary' }] });
      }
    }
    insights.clear();
    generatedInsights.forEach(i => insights.set(i.id, i));
    res.status(200).json({ success: true, data: generatedInsights });
    return;
  }

  // 默认：返回所有洞察
  const insightsList = Array.from(insights.values()).sort((a, b) => {
    const pw: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return pw[b.priority] - pw[a.priority];
  });
  res.status(200).json({ success: true, data: insightsList });
}

/**
 * 处理 POST /api/insights 请求
 */
async function handlePostMetric(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const validation = validate(MetricDataSchema, req.body);
  if (!validation.success) {
    return res.status(validation.status).json(validation.body);
  }
  const metric = validation.data;
  if (metric && metric.id) {
    metrics.set(metric.id, { ...metric, timestamp: Date.now() } as MetricData);
    res.status(201).json({ success: true, data: metric });
  } else {
    res.status(400).json({ success: false, error: 'Metric ID is required' });
  }
}

/**
 * 处理 DELETE /api/insights 请求
 */
async function handleDeleteMetric(req: NextApiRequest, res: NextApiResponse): Promise<void> {
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
}

/**
 * 数据洞察API接口
 * @route GET /api/insights
 * @route POST /api/insights
 * @route DELETE /api/insights
 * @access 需认证（Bearer Token）
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    initializeDefaultMetrics();

    const queryValidation = validate(InsightsQuerySchema, req.query, 'query');
    if (!queryValidation.success) {
      return res.status(queryValidation.status).json(queryValidation.body);
    }

    switch (req.method) {
      case 'GET':
        return handleGetMetrics(req, res);
      case 'POST':
        return handlePostMetric(req, res);
      case 'DELETE':
        return handleDeleteMetric(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

export default withAuth(handler);
