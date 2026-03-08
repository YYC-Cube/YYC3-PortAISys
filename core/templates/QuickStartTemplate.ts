/**
 * @file templates/QuickStartTemplate.ts
 * @description Quick Start Template 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { ValidationError } from '../error-handler/ErrorTypes';
import type { AIWidgetInstance } from '../autonomous-ai-widget/types';
import { createAIWidget } from '../index';
import { IndustryAdapter } from '../industries/IndustryAdapter';
import { ProjectManagementIntegration } from '../industries/project-management/ProjectManagementIntegration';
import { NotificationIntegration } from '../industries/notification-system/NotificationIntegration';
import { DevOpsAIAssistant } from '../industries/operations-analysis/DevOpsAIAssistant';

export interface QuickStartConfig {
  apiType?: 'internal' | 'openai' | 'azure' | 'custom';
  modelName?: string;
  userRole?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  environment?: string;
  integrations?: string[];
}

export interface IntegrationResult {
  success: boolean;
  message: string;
  data?: any;
}

export class QuickStartTemplate {
  static async createIndustryAI(industry: string, config: QuickStartConfig): Promise<AIWidgetInstance> {
    const industryAdapter = new IndustryAdapter();
    
    // 基础配置
    const baseConfig = {
      apiType: config.apiType || 'internal',
      modelName: config.modelName || 'yyc3-default',
      maxTokens: 2000,
      temperature: 0.7,
      enableLearning: true,
      enableMemory: true,
      enableToolUse: true,
      enableContextAwareness: true,
      position: config.position || 'bottom-right',
      theme: 'auto',
      language: 'zh-CN'
    };
    
    // 行业特定配置
    await industryAdapter.createIndustryAI(industry, config.userRole || 'developer');
    
    // 用户角色配置
    const personaConfig = await this.getPersonaConfig(config.userRole || 'developer');
    
    return createAIWidget({
      ...baseConfig,
      ...personaConfig,
      businessContext: {
        ...personaConfig.businessContext,
        deploymentEnvironment: config.environment,
        integrationPoints: config.integrations
      }
    });
  }
  
  static async integrateWithExistingSystem(systemType: string, connectionConfig: any): Promise<IntegrationResult> {
    try {
      switch (systemType) {
        case 'project_management':
          const pmIntegration = new ProjectManagementIntegration();
          await pmIntegration.integrateWithProjectSystem(
            connectionConfig.url, 
            connectionConfig.apiKey
          );
          return {
            success: true,
            message: '项目管理系统集成成功'
          };
          
        case 'notification_system':
          const notificationIntegration = new NotificationIntegration();
          await notificationIntegration.integrateWithNotificationSystem(
            connectionConfig.url
          );
          return {
            success: true,
            message: '通知系统集成成功'
          };
          
        case 'monitoring_system':
          const devopsAI = new DevOpsAIAssistant();
          await devopsAI.initialize(connectionConfig);
          return {
            success: true,
            message: '监控系统集成成功'
          };
          
        default:
          throw new ValidationError(`不支持的集成类型: ${systemType}`, 'systemType', {
            additionalData: { systemType, supportedTypes: ['project_management', 'notification_system', 'monitoring_system'] }
          });
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  static async getPersonaConfig(userRole: string): Promise<any> {
    const personaConfigs: Record<string, any> = {
      developer: {
        businessContext: {
          primaryGoals: ['代码质量提升', '开发效率优化', '技术债务管理'],
          keyMetrics: ['代码覆盖率', '构建时间', 'Bug率'],
          communicationStyle: '技术导向'
        }
      },
      manager: {
        businessContext: {
          primaryGoals: ['项目进度跟踪', '资源优化', '团队协作'],
          keyMetrics: ['任务完成率', '团队效率', '项目健康度'],
          communicationStyle: '管理导向'
        }
      },
      analyst: {
        businessContext: {
          primaryGoals: ['数据分析', '洞察发现', '趋势预测'],
          keyMetrics: ['数据准确性', '分析速度', '洞察质量'],
          communicationStyle: '分析导向'
        }
      }
    };

    return personaConfigs[userRole] || personaConfigs.developer;
  }
}