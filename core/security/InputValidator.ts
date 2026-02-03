import { z } from 'zod';

export interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface InputValidationConfig {
  enableStrictMode?: boolean;
  enableSanitization?: boolean;
  enableLogging?: boolean;
  customValidators?: Map<string, (value: any) => boolean | string>;
}

export class InputValidator {
  private config: Required<InputValidationConfig>;
  private validationHistory: Array<{ timestamp: number; input: any; result: ValidationResult }> = [];

  constructor(config: InputValidationConfig = {}) {
    this.config = {
      enableStrictMode: config.enableStrictMode !== false,
      enableSanitization: config.enableSanitization !== false,
      enableLogging: config.enableLogging !== false,
      customValidators: config.customValidators || new Map(),
    };
  }

  validateUserInput(input: any): ValidationResult {
    const schema = z.object({
      email: z.string().email('Invalid email format'),
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain uppercase letter')
        .regex(/[a-z]/, 'Password must contain lowercase letter')
        .regex(/[0-9]/, 'Password must contain number')
        .regex(/[^a-zA-Z0-9]/, 'Password must contain special character'),
      name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters')
        .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces'),
      phone: z.string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
        .optional(),
      age: z.number()
        .min(0, 'Age must be positive')
        .max(150, 'Age must be realistic')
        .optional(),
    });

    return this.validate(input, schema, 'userInput');
  }

  validateAPIInput(input: any, endpoint: string): ValidationResult {
    const baseSchema = z.object({
      userId: z.string().uuid('Invalid user ID format').optional(),
      sessionId: z.string().min(1, 'Session ID is required').optional(),
      timestamp: z.number().int().positive('Invalid timestamp').optional(),
      limit: z.number().int().positive('Limit must be positive').max(1000, 'Limit too large').optional(),
      offset: z.number().int().nonnegative('Offset must be non-negative').optional(),
    });

    let schema = baseSchema;

    switch (endpoint) {
      case '/api/users':
        schema = schema.extend({
          email: z.string().email('Invalid email format'),
          password: z.string().min(8, 'Password too short'),
        });
        break;
      case '/api/messages':
        schema = schema.extend({
          message: z.string().min(1, 'Message is required').max(10000, 'Message too long'),
          recipientId: z.string().uuid('Invalid recipient ID'),
        });
        break;
      case '/api/files':
        schema = schema.extend({
          filename: z.string().min(1, 'Filename is required').max(255, 'Filename too long'),
          size: z.number().int().positive('Size must be positive').max(100 * 1024 * 1024, 'File too large'),
        });
        break;
    }

    return this.validate(input, schema, 'apiInput');
  }

  validateDatabaseInput(input: any, table: string): ValidationResult {
    const baseSchema = z.object({
      id: z.string().uuid('Invalid ID format').optional(),
      createdAt: z.date().optional(),
      updatedAt: z.date().optional(),
    });

    let schema = baseSchema;

    switch (table) {
      case 'users':
        schema = schema.extend({
          email: z.string().email('Invalid email format'),
          password: z.string().min(8, 'Password too short'),
          name: z.string().min(2, 'Name too short').max(100, 'Name too long'),
        });
        break;
      case 'messages':
        schema = schema.extend({
          content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
          senderId: z.string().uuid('Invalid sender ID'),
          receiverId: z.string().uuid('Invalid receiver ID'),
        });
        break;
      case 'files':
        schema = schema.extend({
          filename: z.string().min(1, 'Filename is required').max(255, 'Filename too long'),
          size: z.number().int().positive('Size must be positive'),
          mimeType: z.string().regex(/^[a-z]+\/[a-z0-9+\-]+$/, 'Invalid MIME type'),
        });
        break;
    }

    return this.validate(input, schema, 'databaseInput');
  }

  validateSearchInput(input: any): ValidationResult {
    const schema = z.object({
      query: z.string().min(1, 'Query is required').max(500, 'Query too long'),
      filters: z.record(z.string(), z.any()).optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      page: z.number().int().positive().optional(),
      limit: z.number().int().positive().max(100, 'Limit too large').optional(),
    });

    return this.validate(input, schema, 'searchInput');
  }

  validateFileUpload(input: any): ValidationResult {
    const schema = z.object({
      filename: z.string().min(1, 'Filename is required').max(255, 'Filename too long'),
      size: z.number().int().positive('Size must be positive').max(100 * 1024 * 1024, 'File too large'),
      mimeType: z.string().regex(/^[a-z]+\/[a-z0-9+\-]+$/, 'Invalid MIME type'),
      content: z.any().optional(),
    });

    const result = this.validate(input, schema, 'fileUpload');

    if (result.success && this.config.enableSanitization) {
      result.data = this.sanitizeFilename(input.filename);
    }

    return result;
  }

  validateSQLInput(input: any): ValidationResult {
    const dangerousPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b)/i,
      /(\b(UNION|OR|AND|WHERE|HAVING|GROUP BY|ORDER BY)\b)/i,
      /(\/\*|\*\/|--|#)/i,
      /(\b(exec|eval|system|shell)\b)/i,
      /(;\s*DROP\s+TABLE|--)/i,
    ];

    const checkSQLInjection = (value: any): boolean => {
      if (typeof value !== 'string') return false;
      return dangerousPatterns.some(pattern => pattern.test(value));
    };

    const checkObject = (obj: any): boolean => {
      if (typeof obj !== 'object' || obj === null) return false;
      return Object.values(obj).some(checkSQLInjection);
    };

    const hasInjection = checkObject(input);

    if (hasInjection) {
      return {
        success: false,
        errors: [{
          field: 'input',
          message: 'Potential SQL injection detected',
          code: 'SQL_INJECTION_DETECTED',
        }],
      };
    }

    return {
      success: true,
      data: input,
    };
  }

  validateXSSInput(input: any): ValidationResult {
    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<\?php/gi,
      /<\?%/gi,
    ];

    const checkXSS = (value: any): boolean => {
      if (typeof value !== 'string') return false;
      return dangerousPatterns.some(pattern => pattern.test(value));
    };

    const checkObject = (obj: any): boolean => {
      if (typeof obj !== 'object' || obj === null) return false;
      return Object.values(obj).some(checkXSS);
    };

    const hasXSS = checkObject(input);

    if (hasXSS) {
      return {
        success: false,
        errors: [{
          field: 'input',
          message: 'Potential XSS attack detected',
          code: 'XSS_DETECTED',
        }],
      };
    }

    return {
      success: true,
      data: input,
    };
  }

  validateCSRFToken(token: string, expectedToken: string): ValidationResult {
    if (!token || token.trim() === '') {
      return {
        success: false,
        errors: [{
          field: 'token',
          message: 'CSRF token is required',
          code: 'TOKEN_REQUIRED',
        }],
      };
    }

    if (token !== expectedToken) {
      return {
        success: false,
        errors: [{
          field: 'token',
          message: 'Invalid CSRF token',
          code: 'INVALID_TOKEN',
        }],
      };
    }

    return {
      success: true,
      data: token,
    };
  }

  private validate(input: any, schema: z.ZodSchema<any>, _context: string): ValidationResult {
    try {
      const validated = schema.parse(input);

      if (this.config.customValidators.size > 0) {
        for (const [field, validator] of this.config.customValidators) {
          const result = validator(validated[field]);
          if (result !== true) {
            return {
              success: false,
              errors: [{
                field,
                message: typeof result === 'string' ? result : 'Custom validation failed',
                code: 'CUSTOM_VALIDATION_FAILED',
              }],
            };
          }
        }
      }

      if (this.config.enableLogging) {
        this.validationHistory.push({
          timestamp: Date.now(),
          input,
          result: { success: true, data: validated },
        });
      }

      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: 'VALIDATION_ERROR',
        }));

        if (this.config.enableLogging) {
          this.validationHistory.push({
            timestamp: Date.now(),
            input,
            result: { success: false, errors },
          });
        }

        return { success: false, errors };
      }

      throw error;
    }
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"|?*]/g, '')
      .replace(/\.\./g, '.')
      .replace(/^\.+/, '')
      .replace(/\.+$/, '')
      .substring(0, 255);
  }

  getValidationHistory(limit: number = 100): Array<{ timestamp: number; input: any; result: ValidationResult }> {
    return this.validationHistory.slice(-limit);
  }

  getStatistics(): {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  } {
    const total = this.validationHistory.length;
    const successful = this.validationHistory.filter(h => h.result.success).length;
    const failed = total - successful;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? successful / total : 0,
    };
  }

  resetHistory(): void {
    this.validationHistory = [];
  }
}
