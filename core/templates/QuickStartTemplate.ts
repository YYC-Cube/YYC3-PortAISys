import { ValidationError } from '../error-handler/ErrorTypes';

export class QuickStartTemplate {
  static async createIndustryAI(industry: string, config: QuickStartConfig): Promise<AIWidgetInstance> {
    const industryAdapter = new IndustryAdapter();
    
    // 基础配置
    const baseConfig = {
      apiType: config.apiType || 'internal',
      modelName: config.modelName || 'yyc3-default',
      enableLearning: true,
      enableMemory: true,
      position: config.position || 'bottom-right'
    };
    
    // 行业特定配置
    const industryConfig = await industryAdapter.getIndustryConfig(industry);
    
    // 用户角色配置
    const personaConfig = await this.getPersonaConfig(config.userRole);
    
    return createAutonomousAIWidget({
      ...baseConfig,
      ...industryConfig,
      ...personaConfig,
      businessContext: {
        ...industryConfig.businessContext,
        ...personaConfig.businessContext,
        deploymentEnvironment: config.environment,
        integrationPoints: config.integrations
      }
    });
  }
  
  static async integrateWithExistingSystem(systemType: string, connectionConfig: any): Promise<IntegrationResult> {
    switch (systemType) {
      case 'project_management':
        const pmIntegration = new ProjectManagementIntegration();
        return await pmIntegration.integrateWithProjectSystem(
          connectionConfig.url, 
          connectionConfig.apiKey
        );
        
      case 'notification_system':
        const notificationIntegration = new NotificationIntegration();
        return await notificationIntegration.integrateWithNotificationSystem(
          connectionConfig.url
        );
        
      case 'monitoring_system':
        const devopsAI = new DevOpsAIAssistant();
        return await devopsAI.initialize(connectionConfig);
        
      default:
        throw new ValidationError(`不支持的集成类型: ${systemType}`, 'systemType', {
          additionalData: { systemType, supportedTypes: ['project_management', 'notification_system', 'monitoring_system'] }
        });
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