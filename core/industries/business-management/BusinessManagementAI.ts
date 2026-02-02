import type { AIWidgetInstance } from '../../autonomous-ai-widget/types';
import { createAIWidget } from '../../index';

export class BusinessManagementAI {
  private static instance: BusinessManagementAI;

  static getInstance(): BusinessManagementAI {
    if (!BusinessManagementAI.instance) {
      BusinessManagementAI.instance = new BusinessManagementAI();
    }
    return BusinessManagementAI.instance;
  }

  async createManagerAI(managerType: string): Promise<AIWidgetInstance> {
    await this.getBaseManagerConfig();
    await this.getSpecializedManagerConfig(managerType);

    return createAIWidget({
      apiType: 'internal',
      modelName: 'yyc3-business-management',
      maxTokens: 2000,
      temperature: 0.7,
      enableLearning: true,
      enableMemory: true,
      enableToolUse: true,
      enableContextAwareness: true,
      position: 'bottom-right',
      theme: 'auto',
      language: 'zh-CN'
    });
  }

  private async getBaseManagerConfig(): Promise<any> {
    return {};
  }

  private async getSpecializedManagerConfig(_managerType: string): Promise<any> {
    return {};
  }
}
