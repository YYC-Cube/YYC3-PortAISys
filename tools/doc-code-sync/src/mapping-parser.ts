import * as fs from 'fs';
import * as path from 'path';
import { MappingConfig, Mapping, GlobalSettings, ValidationResult } from './types';

export class MappingRuleParser {
  private config!: MappingConfig;
  private configPath: string;

  constructor(configPath: string = '.doc-code-mapping.json') {
    this.configPath = configPath;
    this.loadConfig();
  }

  private loadConfig(): void {
    if (fs.existsSync(this.configPath)) {
      const configContent = fs.readFileSync(this.configPath, 'utf-8');
      this.config = JSON.parse(configContent);
    } else {
      this.config = {
        version: '1.0',
        mappings: [],
        globalSettings: {
          autoSync: true,
          syncInterval: 300,
          conflictResolution: 'manual',
          notificationEnabled: true
        }
      };
      this.saveConfig();
    }
  }

  getMappingById(id: string): Mapping | undefined {
    return this.config.mappings.find(m => m.id === id);
  }

  getMappingsByDocument(document: string): Mapping[] {
    return this.config.mappings.filter(m => m.document === document);
  }

  getMappingsByCodeFile(codeFile: string): Mapping[] {
    return this.config.mappings.filter(m => 
      m.codeFiles.includes(codeFile)
    );
  }

  getAllMappings(): Mapping[] {
    return this.config.mappings;
  }

  getGlobalSettings(): GlobalSettings {
    return this.config.globalSettings;
  }

  addMapping(mapping: Mapping): void {
    this.config.mappings.push(mapping);
    this.saveConfig();
  }

  updateMapping(id: string, updates: Partial<Mapping>): void {
    const index = this.config.mappings.findIndex(m => m.id === id);
    if (index !== -1) {
      this.config.mappings[index] = {
        ...this.config.mappings[index],
        ...updates
      };
      this.saveConfig();
    }
  }

  deleteMapping(id: string): void {
    this.config.mappings = this.config.mappings.filter(m => m.id !== id);
    this.saveConfig();
  }

  updateGlobalSettings(settings: Partial<GlobalSettings>): void {
    this.config.globalSettings = {
      ...this.config.globalSettings,
      ...settings
    };
    this.saveConfig();
  }

  private saveConfig(): void {
    fs.writeFileSync(
      this.configPath,
      JSON.stringify(this.config, null, 2)
    );
  }

  getConfigPath(): string {
    return this.configPath;
  }

  reloadConfig(): void {
    this.loadConfig();
  }
}

export class MappingRuleValidator {
  validateMapping(mapping: Mapping): ValidationResult {
    const errors: string[] = [];

    if (!mapping.id) {
      errors.push('映射 ID 不能为空');
    }

    if (!mapping.document) {
      errors.push('文档路径不能为空');
    } else if (!fs.existsSync(mapping.document)) {
      errors.push(`文档文件不存在: ${mapping.document}`);
    }

    if (!mapping.codeFiles || mapping.codeFiles.length === 0) {
      errors.push('代码文件列表不能为空');
    } else {
      mapping.codeFiles.forEach(codeFile => {
        if (!fs.existsSync(codeFile)) {
          errors.push(`代码文件不存在: ${codeFile}`);
        }
      });
    }

    if (!['one-to-one', 'one-to-many', 'many-to-one'].includes(mapping.type)) {
      errors.push('映射类型必须是 one-to-one、one-to-many 或 many-to-one');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateConfig(config: MappingConfig): ValidationResult {
    const errors: string[] = [];

    if (!config.version) {
      errors.push('配置版本不能为空');
    }

    if (!config.mappings || config.mappings.length === 0) {
      errors.push('映射列表不能为空');
    } else {
      config.mappings.forEach(mapping => {
        const result = this.validateMapping(mapping);
        if (!result.isValid) {
          errors.push(...result.errors);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
