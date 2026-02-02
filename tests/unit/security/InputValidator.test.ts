import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InputValidator } from '@/core/security/InputValidator';

describe('InputValidator', () => {
  let inputValidator: InputValidator;

  beforeEach(() => {
    inputValidator = new InputValidator();
  });

  afterEach(() => {
    inputValidator.resetHistory();
  });

  describe('validateUserInput', () => {
    it('should validate valid user input', () => {
      const input = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'John Doe',
        phone: '+1234567890',
        age: 30,
      };

      const result = inputValidator.validateUserInput(input);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject invalid email', () => {
      const input = {
        email: 'invalid-email',
        password: 'Password123!',
        name: 'John Doe',
      };

      const result = inputValidator.validateUserInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some(e => e.message.includes('email'))).toBe(true);
    });

    it('should reject weak password', () => {
      const input = {
        email: 'test@example.com',
        password: 'weak',
        name: 'John Doe',
      };

      const result = inputValidator.validateUserInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid name', () => {
      const input = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'J',
      };

      const result = inputValidator.validateUserInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid phone number', () => {
      const input = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'John Doe',
        phone: 'invalid-phone',
      };

      const result = inputValidator.validateUserInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid age', () => {
      const input = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'John Doe',
        age: 200,
      };

      const result = inputValidator.validateUserInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateAPIInput', () => {
    it('should validate valid API input', () => {
      const input = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        limit: 10,
        offset: 0,
      };

      const result = inputValidator.validateAPIInput(input, '/api/users');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject invalid UUID', () => {
      const input = {
        userId: 'invalid-uuid',
      };

      const result = inputValidator.validateAPIInput(input, '/api/users');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject negative limit', () => {
      const input = {
        limit: -1,
      };

      const result = inputValidator.validateAPIInput(input, '/api/users');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject limit too large', () => {
      const input = {
        limit: 2000,
      };

      const result = inputValidator.validateAPIInput(input, '/api/users');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateDatabaseInput', () => {
    it('should validate valid database input', () => {
      const input = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'John Doe',
      };

      const result = inputValidator.validateDatabaseInput(input, 'users');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject invalid email for database', () => {
      const input = {
        email: 'invalid-email',
        password: 'Password123!',
        name: 'John Doe',
      };

      const result = inputValidator.validateDatabaseInput(input, 'users');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid MIME type', () => {
      const input = {
        filename: 'test.txt',
        size: 1024,
        mimeType: 'invalid-mime-type',
      };

      const result = inputValidator.validateDatabaseInput(input, 'files');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateSearchInput', () => {
    it('should validate valid search input', () => {
      const input = {
        query: 'test search',
        sortBy: 'name',
        sortOrder: 'asc',
        page: 1,
        limit: 10,
      };

      const result = inputValidator.validateSearchInput(input);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject empty query', () => {
      const input = {
        query: '',
      };

      const result = inputValidator.validateSearchInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject query too long', () => {
      const input = {
        query: 'a'.repeat(501),
      };

      const result = inputValidator.validateSearchInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid sort order', () => {
      const input = {
        query: 'test',
        sortOrder: 'invalid',
      };

      const result = inputValidator.validateSearchInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateFileUpload', () => {
    it('should validate valid file upload', () => {
      const input = {
        filename: 'test.txt',
        size: 1024,
        mimeType: 'text/plain',
      };

      const result = inputValidator.validateFileUpload(input);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject file too large', () => {
      const input = {
        filename: 'test.txt',
        size: 200 * 1024 * 1024,
        mimeType: 'text/plain',
      };

      const result = inputValidator.validateFileUpload(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid MIME type', () => {
      const input = {
        filename: 'test.txt',
        size: 1024,
        mimeType: 'invalid',
      };

      const result = inputValidator.validateFileUpload(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should sanitize filename', () => {
      const input = {
        filename: 'test<>file.txt',
        size: 1024,
        mimeType: 'text/plain',
      };

      const result = inputValidator.validateFileUpload(input);
      expect(result.success).toBe(true);
      expect(result.data?.filename).not.toContain('<');
      expect(result.data?.filename).not.toContain('>');
    });
  });

  describe('validateSQLInput', () => {
    it('should validate clean input', () => {
      const input = {
        name: 'John Doe',
        age: 30,
      };

      const result = inputValidator.validateSQLInput(input);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should detect SQL injection', () => {
      const input = {
        name: "John'; DROP TABLE users; --",
      };

      const result = inputValidator.validateSQLInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some(e => e.code === 'SQL_INJECTION_DETECTED')).toBe(true);
    });

    it('should detect UNION-based injection', () => {
      const input = {
        name: "John' UNION SELECT * FROM passwords--",
      };

      const result = inputValidator.validateSQLInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should detect OR-based injection', () => {
      const input = {
        name: "' OR '1'='1",
      };

      const result = inputValidator.validateSQLInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateXSSInput', () => {
    it('should validate clean input', () => {
      const input = {
        comment: 'This is a normal comment',
      };

      const result = inputValidator.validateXSSInput(input);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should detect script tag injection', () => {
      const input = {
        comment: '<script>alert("XSS")</script>',
      };

      const result = inputValidator.validateXSSInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some(e => e.code === 'XSS_DETECTED')).toBe(true);
    });

    it('should detect iframe injection', () => {
      const input = {
        comment: '<iframe src="evil.com"></iframe>',
      };

      const result = inputValidator.validateXSSInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should detect javascript: protocol', () => {
      const input = {
        url: 'javascript:alert("XSS")',
      };

      const result = inputValidator.validateXSSInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should detect on* event handlers', () => {
      const input = {
        html: '<div onclick="alert("XSS")">Click me</div>',
      };

      const result = inputValidator.validateXSSInput(input);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateCSRFToken', () => {
    it('should validate matching CSRF token', () => {
      const token = 'valid-csrf-token';
      const result = inputValidator.validateCSRFToken(token, token);
      expect(result.success).toBe(true);
      expect(result.data).toBe(token);
    });

    it('should reject empty CSRF token', () => {
      const result = inputValidator.validateCSRFToken('', 'expected-token');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some(e => e.code === 'TOKEN_REQUIRED')).toBe(true);
    });

    it('should reject mismatched CSRF token', () => {
      const result = inputValidator.validateCSRFToken('actual-token', 'expected-token');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some(e => e.code === 'INVALID_TOKEN')).toBe(true);
    });
  });

  describe('getValidationHistory', () => {
    it('should return empty history initially', () => {
      const history = inputValidator.getValidationHistory();
      expect(history).toEqual([]);
    });

    it('should track validation history', () => {
      inputValidator.validateUserInput({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'John Doe',
      });

      const history = inputValidator.getValidationHistory();
      expect(history.length).toBe(1);
    });

    it('should limit history size', () => {
      for (let i = 0; i < 150; i++) {
        inputValidator.validateUserInput({
          email: `test${i}@example.com`,
          password: 'Password123!',
          name: 'John Doe',
        });
      }

      const history = inputValidator.getValidationHistory(100);
      expect(history.length).toBeLessThanOrEqual(100);
    });
  });

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const stats = inputValidator.getStatistics();
      expect(stats.total).toBe(0);
      expect(stats.successful).toBe(0);
      expect(stats.failed).toBe(0);
      expect(stats.successRate).toBe(0);
    });

    it('should calculate statistics correctly', () => {
      inputValidator.validateUserInput({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'John Doe',
      });

      inputValidator.validateUserInput({
        email: 'invalid-email',
        password: 'weak',
        name: 'J',
      });

      const stats = inputValidator.getStatistics();
      expect(stats.total).toBe(2);
      expect(stats.successful).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.successRate).toBe(0.5);
    });
  });

  describe('resetHistory', () => {
    it('should clear validation history', () => {
      inputValidator.validateUserInput({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'John Doe',
      });

      inputValidator.resetHistory();

      const history = inputValidator.getValidationHistory();
      expect(history).toEqual([]);
    });
  });
});
